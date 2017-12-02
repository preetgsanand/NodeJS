const express  = require('express');
const socketIO = require('socket.io');
const http = require('http');
const path = require('path');
const _ = require('lodash');

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 8000;
const io = socketIO(server);

//Database
const {mongoose} = require(path.join(__dirname,'db')+'/mongoose');


//Routes
const userApi = require('./routes/user');
const postApi = require('./routes/post');


app.use('/user',userApi);
app.use('/post',postApi);


const {User} = require('./models/User');
const {Post} = require('./models/Post');

//Sockets
let users = {};
let sockets = {}

io.on('connection', (socket) => {
	let query = socket.request._query;
	let _id = query['_id'];	
	sockets[_id] = socket;
	users[_id] = {
		email : query['email'],
		_id : query['_id'],
		status : true,
		gender : query['gender'],
		designation : query['designation'],
		name : query['name']
	}	


	socket.on('onRefreshUserList' , () => {
		console.log('onRefreshUserList', _.values(users))
		socket.emit('onRefreshUserList', _.values(users));
	});


	socket.on('onNewMessage', (message) => {
		let msg = JSON.parse(message)
		console.log('New Message',msg)
		let to = msg.to
		let soc = sockets[to]
		if (soc) {
			soc.emit('onNewMessage',msg)
		}
	});
	
	socket.on('onUserOnline', () => {
		console.log('User Online',_id);
		users[_id].status = true
		socket.broadcast.emit('onUserOnline', users[_id]);
	});

	socket.on('onUserOffline', () => {
		console.log('User Offline',_id);
		users[_id].status = false
		socket.broadcast.emit('onUserOffline', users[_id]);
	});

	socket.on('disconnect', () => {
		console.log("disconnected : ",_id);
		users[_id].status = false
		socket.broadcast.emit('onUserOffline', users[_id]);
	});

	socket.on('onNewPost', (p) => {
		let postJSON = JSON.parse(p)
		let post = Post(postJSON)
		console.log('New post',post)

		post.save().then((result) => {
			io.emit('onNewPost',result)
		})
		.catch((e) => {
			console.log(e)
		});
	});

	socket.on('onPostLiked', (params) => {

//		params = {
//			postId : 
//			userId : 
//		}
	console.log('onPostLiked',params);
		let paramJSON = JSON.parse(params)
		Post.findOne({
			'_id' : paramJSON.postId
		}).then((post) => {
			post.likes.push(paramJSON.userId);
			post.save()
			.then((result) => {
				io.emit('onPostLiked',paramJSON);
			})
			.catch((e) => {
				console.log(e);
			})
		}).catch((e) => {
			console.log(e);
		});
	});

	socket.on('onPostDisliked', (params) => {
		console.log('onPostLiked',params);
		let paramJSON = JSON.parse(params)
		Post.findOne({
			'_id' : paramJSON.postId
		}).then((post) => {
			post.update({
				$pull : {
					likes : paramJSON['userId']
				}
			})
			.then((result) => {
				io.emit('onPostDisliked',paramJSON);
			})
			.catch((e) => {
				console.log(e);
			})
		}).catch((e) => {
			console.log(e);
		});
	});

	socket.on('onNewComment', (params) => {
		console.log('onNewComment', params)
		let paramJSON = JSON.parse(params)
		Post.findOne({
			'_id' : paramJSON.postId
		}).then((post) => {
			let comment = {
				'_id' : mongoose.Types.ObjectId(),
				'user' : paramJSON.userId,
				'comment' : paramJSON.commentText
			}
			post.comments.push(comment)
			post.save((result) => {
				paramJSON._id = comment._id
				io.emit('onNewComment',paramJSON)
			}).catch((e) => {
				console.log(e)
			})
		}).catch((e) => {
			console.log(e)
		})
	})

});

server.listen(port, () => {
	console.log('Server running');
});