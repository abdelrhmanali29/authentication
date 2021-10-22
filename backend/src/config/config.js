// put your .env file in config folder
const dotenv = require('dotenv');
// dotenv.config({ path: __dirname + '/../../.env' });
dotenv.config({ path: __dirname + `/../../.env.${process.env.NODE_ENV}` });

const config = {
	SM_URL: process.env.SM_URL,
	SM_API_TOKEN: process.env.SM_API_TOKEN,

	WYSCOUT_URL: process.env.WYSCOUT_URL,
	WYSCOUT_API_TOKEN: process.env.WYSCOUT_API_TOKEN,

	env: process.env.NODE_ENV || 'development',
	port: process.env.NODE_PORT || 3000,
	token: process.env.TOKEN || 'token',
	user: process.env.LOGINUSER || 'user',
	password: process.env.LOGINPASSWORD || 'password',

	limit: process.env.LIMIT || 20,
	skip: process.env.SKIP || 0,
	jwtSecret: process.env.JWT_SECRET,
	jwtEpiresIn: process.env.JWT_EXPIRES_IN,
	jwtCookieEpiresIn: process.env.JWT_COOKIE_EXPIRES_IN,

	redisHost: process.env.REDIS_HOST || '127.0.0.1',
	redisPort: process.env.REDIS_PORT || '6379',
	redisPassword: process.env.REDIS_PASSWORD || '',

	emailUserName: process.env.EMAIL_USERNAME,
	emailPassword: process.env.EMAIL_PASSWOERD,
	emailHost: process.env.EMAIL_HOST,
	emailPort: process.env.EMAIL_PORT,

	dbURI: process.env.DB_URI,
	// 'mongodb://localhost:27017/ecommerce',
};

module.exports = config;
