const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');


let UserSchema = mongoose.Schema({
	name : {
		type : String,
		trim : true,
		minlength  :10,
		maxlength : 100
	},
	email: {
		type : String,
		trim : true,
		unique : true,
		required : true,
		validate : {
			validator : (value) => {
				return validator.isEmail(value);
			},
			message : "{VALUE} is invalid email"
		},

	},
	password : {
		type : String,
		minlength : 8,
		trim : true,
		required : true
	},
	gender : {
		type : String,
		enum : ['Male','Female']
	},
	designation : {
		type : String,
		enum : ['Developer','QA','Dev-Ops']
	},
	tokens : [{
		token : {
			type : String
		},
		access : {
			type : String,
			default : 'x-auth'
		}
	}]
});

UserSchema.methods.generateAuthToken = function() {
	var user = this;
	var access = 'auth';
	var token = jwt.sign({
		_id : user._id.toHexString(),
		access
	},'jeet').toString();

	user.tokens.push({
		access,
		token
	});
	return user.save().then(() => {
		return token;
	});
};

UserSchema.methods.toJSON = function() {
	var user = this;
	var userObj = user.toObject();

	return _.pick(userObj,['_id','email','name','gender','designation']);
};

UserSchema.methods.removeToken = function (token) {
	var user = this;

	return user.update({
		$pull : {
			tokens : {
				token : token
			}
		}
	});
};

UserSchema.statics.findByToken = function(token) {
	var User = this;
	var decoded;

	try {
		decoded = jwt.verify(token,'jeet');
	} catch(e) {
		return Promise.reject();
	}

	return User.findOne({
		'_id' : decoded._id,
		'tokens.token' : token,
		'tokens.access' : 'auth'
	});
};

UserSchema.statics.findByCredentials = function(email, password) {
	var User = this;
	return User.findOne({
		email
	}).then((user) => {
		if(!user) {
			return Promise.reject();
		}
		else {
			return bcrypt.compare(password, user.password).then((result) => {
				if(result) {
					return Promise.resolve(user);
				}
				else {
					return Promise.reject();
				}
			})
		}
	}).catch((e) => {
		return Promise.reject();
	});

};

UserSchema.pre('save', function (next) {
	var user = this;
	if(user.isModified('password')) {
		var password = user.password;

		bcrypt.genSalt(10, (err, salt) => {
			bcrypt.hash(password, salt, (err, hash) => {
				if(!err) {
					user.password = hash;
					next();
				}
			});
		});
	} else {
		next();
	}

});

var User = mongoose.model("user",UserSchema);

module.exports = {
	User
}