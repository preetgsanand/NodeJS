const express = require('express');
const path = require('path');
let router = express.Router();
const multer = require('multer')
const _ = require('lodash');
let {User} = require(path.join('./../','models','User'));
let {authenticate} = require('./middleware');
let bcrypt = require('bcryptjs');
let upload = multer()


router.post('/register', upload.array(), (req, res) => {
	let body = _.pick(req.body, ['email','password']);
	console.log(body)
	let user = new User(body);

	user.save()
	.then((result) => {
		return user.generateAuthToken()
		.then((token) => {
			res.header('x-auth', token).status(200).send({
				status : 200,
				meta : {
					message : result
				}
			});
		});
	})
	.catch((e) => {
		console.log(e);
		res.status(400).send({
				status : 400,
				meta : {
					message : e
				}
			});
	});
});

router.get('/me', authenticate,  (req, res) => {
	res.status(200).send({
		status : 200,
		meta : {
			message : req.user
		}
	});
});

router.put('/', upload.array(), authenticate, (req, res) => {
		let body = _.pick(req.body,['name',
			'desgination','gender']);
		req.user.name = body.name;
		req.user.desgination = body.desgination;
		req.user.gender = body.gender;
		req.user.save().then((result)=>{
			res.status(200).send({
				status : 200,
				meta : {
					message : result
				}
			});
		})
		.catch((e) => {
			res.status(400).send({
				status : 400,
				meta : {
					message : e
				}
			});
		});
});


router.post('/login', upload.array() , (req, res) => {
	let body = _.pick(req.body,['email','password']);
	console.log(body);

	User.findByCredentials(body.email, body.password).then((user) => {
		if(user) {
			return user.generateAuthToken().
			then((token) => {
				res.header('x-auth', token).status(200).send({
					status : 200,
					meta : {
						message : user
					}
				});
			}).catch((e) => {
				res.status(400).send({
					status : 400,
					meta : {
						message : e
					}
				});
			});
		}
		else {
			res.status(400).send({
					status : 400,
					meta : {
						message : 'Invalid email or password'
					}
				});
		}
	}).catch((e) => {
		console.log(e);
		res.status(400).send({
			status : 400,
			meta : {
				message : 'Invalid email or password'
			}
		});
	});
});

router.delete('/logout', authenticate, (req, res) => {
	let token = req.header('x-auth');
	req.user.removeToken(token).then(() => {
		res.status(200).send({
				status : 200,
				meta : {
					message : "Logout Successful"
				}
			});
	}, () => {
		res.status(400).send({
			status : 400,
			meta : {
				message : 'Logout request is invalid'
			}
		});
	});
});

router.get('/list', authenticate, (req, res) => {
	User.find({
		'_id' : {
			$ne : req.user._id
		}
	})
	.then((users) => {
		res.status(200).send({
			status : 200,
			meta : {
				message : users
			}
		});
	})
	.catch((e) => {
		console.log(e)
		res.status(400).send({
			status : 400,
			meta : {
				message : e
			}
		});
	})
});

module.exports = router;