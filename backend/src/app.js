const express = require('express');
const app = express();

const cors = require('cors');
const morgan = require('morgan');
const errorHandler = require('./middlewares/errorHandler');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../authentication-swagger-api.json');
const basicAuth = require('express-basic-auth');
const AppError = require('./utils/appError');
const config = require('../src/config/config');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const compression = require('compression');

// Resources Routes
const roleRouter = require('./modules/roles/role.routes');
const permissionRouter = require('./modules/permissions/permission.routes');
const userRouter = require('./modules/users/user.routes');
const authController = require('./modules/users/auth.controller');

// Docs auth
const user = config.user;
const password = config.password;
const users = {};
users[user] = password;

// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
	max: 100,
	windowMs: 60 * 60 * 1000,
	message: 'Too many requests from this IP, please try again in an hour!',
});

app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
	hpp({
		whitelist: ['filter'],
	})
);

// Middlewares
app.use(cors(), express.json());

app.use(compression());

app.get(
	'/api/v1/docs',
	basicAuth({
		users: users,
		challenge: true,
	}),
	swaggerUi.setup(swaggerDocument)
);
app.use('/api/v1/', swaggerUi.serve);

// overriding
String.prototype.toHHMMSS = function () {
	var sec_num = parseInt(this, 10); // don't forget the second param
	var hours = Math.floor(sec_num / 3600);
	var minutes = Math.floor((sec_num - hours * 3600) / 60);
	var seconds = sec_num - hours * 3600 - minutes * 60;

	if (hours < 10) {
		hours = '0' + hours;
	}
	if (minutes < 10) {
		minutes = '0' + minutes;
	}
	if (seconds < 10) {
		seconds = '0' + seconds;
	}
	var time = hours + ':' + minutes + ':' + seconds;
	return time;
};

// Routes
// Health route to check when server up
app.get('/api/v1/health', (req, res, next) => {
	let date = new Date();
	let time = process.uptime();
	let uptime = (time + '').toHHMMSS();

	const memory = process.memoryUsage();
	const memoryGB = (memory.heapUsed / 1024 / 1024 / 1024).toFixed(4) + ' GB';

	const healthcheck = {
		uptime: uptime,
		message: 'OK',
		time: date,
		memoryGB,
	};
	res.status(200).json(healthcheck);
});

// Routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/roles', authController.protect(), roleRouter);
app.use('/api/v1/permissions', authController.protect(), permissionRouter);

// Handle not defined routes
app.all('*', (req, res, next) => {
	next(new AppError(`Can't find ${req.originalUrl}`, 404));
});

app.use(errorHandler);

module.exports = app;
