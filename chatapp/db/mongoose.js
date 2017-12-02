const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

mongoose.connect("mongodb://localhost/chatapp",{
	useMongoClient : true
}, () => {
		console.log('Mongodb connected');
});

module.exports = {
	mongoose
}