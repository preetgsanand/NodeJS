var {User} = require('../models/User');
const _ = require('lodash');

var authenticate = (req, res, next) => {
	var token = req.header('x-auth');
	console.log(token)
	User.findByToken(token).then((user) => {
		if(!user) {
			return Promise.reject();
		}
		console.log(user);
		req.user = user;
		next();

	}).catch((e) => {
		console.log(e)
		res.status(401).send({
			status : 401,
			meta : {
				message : 'Unauthorized Access'
			}
		});
	});
};

module.exports = {
	authenticate	
}