const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const moment = require('moment-timezone');
moment().tz("Asia/Kolkata").format();

let PostSchema = mongoose.Schema({
	body : {
		type : String,
		required : true,
		minlength : 10,
		maxlength : 10000
	},
	user : {
		type : mongoose.Schema.Types.ObjectId,
		ref : 'User',
		required : true
	},
	date : {
		type : String,
	},
	likes : [{
		type : mongoose.Schema.Types.ObjectId
	}],
	comments : [{
		_id : {
			type : mongoose.Schema.Types.ObjectId 
		},
		user : {
			type : mongoose.Schema.Types.ObjectId,
			ref : 'User'
		},
		comment : {
			type : String
		}
	}]
});

PostSchema.pre('save' ,function(next) {
	let post = this;
	var today = moment.tz(new Date(), 'Asia/Kolkata');

	post.date = today.format('YYYY-MM-DD HH:mm:ss');
	for (var i  = 0 ; i < post.comments.length ; i++) {
		post.comments[i]._id = mongoose.Types.ObjectId()
	}
	next();

});

PostSchema.methods.toJSON = function() {
	var post = this;
	var postObj = post.toObject();

	return _.pick(postObj,['_id','body','user','date','likes','comments']);
};



let Post = mongoose.model('Post',PostSchema)


module.exports = {
	Post
}