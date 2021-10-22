const mongoose = require('mongoose');

module.exports = async (url) => {
	mongoose
		.connect(url, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true,
			useFindAndModify: false, // Make Mongoose use `findOneAndUpdate()`. Note that this option is `true` by default, you need to set it to false.
		})
		.then(() => {
			console.log('Connected to DB');
		})
		.catch((err) => {
			console.error(err);
		});
};
