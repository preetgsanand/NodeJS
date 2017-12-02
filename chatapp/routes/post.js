const express = require('express');
const path = require('path');
let router = express.Router();
const multer = require('multer')
const _ = require('lodash');
let {Post} = require(path.join('./../','models','Post'));
let upload = multer()


router.post('/', upload.array(), (req, res) => {
	console.log(req.body)
	const body = _.pick(req.body, ['body','user','likes','comments'])
	let post = Post()
	post.body = body.body
	post.user = body.user
	post.likes = JSON.parse(body.likes)
	post.comments = JSON.parse(body.comments)

	post.save()
	.then((result) => {
		res.status(200)
		.send({
			status : 200,
			meta : {
				message : result
			}
		});
	})
	.catch((e) => {
		console.log(e)
		res.status(400)
		.send({
			status : 400,
			meta : {
				message : e
			}
		});
	});
});



router.get('/list', (req, res) => {
	Post.find()
	.then((posts) => {
		res.status(200)
		.send({
			status : 200,
			meta : {
				message : posts
			}
		});
	})
	.catch((e) => {
		console.log(e)
		res.status(400)
		.send({
			status : 400,
			meta : {
				message : e
			}
		});
	})
});


module.exports = router;