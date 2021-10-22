const redis = require('redis');
const config = require('../config/config');

const redisClient = redis.createClient({
	host: config.redisHost,
	port: config.redisPort,
	password: config.redisPassword,
});

redisClient.on('error', (err) => {
	console.log('Error ' + err);
});
global.redisClient = redisClient;
