// Put event listener to catch exceptions before running any code
process.on('uncaughtException', (err) => {
	console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
	console.log(err.name, err.message, err.stack);
	console.log(err);
	process.exit(1);
});

const app = require('./src/app');
const config = require('./src/config/config');
const mongoose = require('mongoose');

const databaseURL = config.dbURI;
const port = config.port;

/**
 * Graceful start
 App starts (npm start)
 App opens DB connections
 App listens on port
 App tells the load balancer that it’s ready for requests
 */

let server;

mongoose
	.connect(databaseURL, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true,
		useFindAndModify: false, // Make Mongoose use `findOneAndUpdate()`. Note that this option is `true` by default, you need to set it to false.
	})
	.then(() => {
		console.log('Connected to DB');
		server = app.listen(port, () => {
			console.log('server running on:', port);
		});
	});

/**
 * Graceful shutdown
    Receives a notification to stop
    Asks the load balancer to stop receiving requests
    Finishes all ongoing requests
    Releases all resources (databases, queues…)
    Exits
 */
process.on('unhandledRejection', (err) => {
	console.log('UNHANDLED REJECTION! 💥 Shutting down...');
	console.log(err.name, err.message, err.stack);
	server.close(() => {
		process.exit(1);
	});
});
