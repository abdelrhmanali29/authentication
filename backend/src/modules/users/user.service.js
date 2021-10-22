const repository = require('./user.repository');
const rolesRepository = require('../roles/role.repository');
const AppError = require('../../utils/appError');
const { validation, isBodyValid } = require('./user.validation');
const { promisify } = require('util');
const validator = require('../../utils/validation');
const jwt = require('jsonwebtoken');
const config = require('../../config/config');
const utils = require('./user.utils');
const User = require('./user.model');

module.exports = {
	async create(user) {
		let err = false;
		let response = {};

		const { valid, errors } = await validation(user);

		if (!valid) {
			err = new AppError('validation failed', 400, errors);
			return { err, response };
		}

		const usersCounter = await repository.count({ email: user.email });

		if (usersCounter > 0) {
			err = new AppError('Invalid input data. email:should be unique', 400);
			return { err, response };
		}

		if (!'role' in user) user.role = 'user';

		const role = await rolesRepository.findOne({
			filter: { name: user.role },
			lean: true,
		});
		if (role) user.role = role._id;

		const newUser = await repository.save(user);
		const token = utils.signToken(newUser.id);

		if (!token || !newUser) {
			err = new AppError('Error in sign up. Try again later.', 500);
			return { err, response };
		}

		response = {
			token,
			data: newUser,
			status: 'success',
			statusCode: 200,
		};
		return { err, response };
	},

	async login(candidateUser) {
		let err = false;
		let response = {};

		const { email, password } = candidateUser;

		//1- Check if email and password exist
		if (!email || !password) {
			return next(new AppError('Please provide email and password!', 400));
		}

		// 2- Check if user exists && password is correct
		const user = await repository.findOne({
			filter: { email },
			select: 'password',
		});

		if (!user || !(await user.correctPassword(password, user.password))) {
			return next(new AppError('Incorrect email or password', 401));
		}

		// 3- If everything is OK, send token to client
		const token = utils.signToken(user.id);
		if (!token) {
			err = new AppError('Error in login. Please log in again.', 500);
			return { err, response };
		}
		response = {
			token,
			status: 'success',
			statusCode: 200,
		};
		return { err, response };
	},

	async protect(headers) {
		let err = false;
		let response = {};

		let token;

		if (headers.authorization && headers.authorization.startsWith('Bearer')) {
			token = headers.authorization.split(' ')[1];
		}
		// 1- check if token is provided
		if (!token) {
			err = new AppError(
				'You are not logged in. Please log in to get access.',
				401
			);
			return { err, response };
		}

		// 2- Verfication token if not valid it will fire an error
		let decoded;
		try {
			decoded = await promisify(jwt.verify)(token, config.jwtSecret);
		} catch (err) {
			err = new AppError('Invalid token, Please log in again.', 401);
			return { err, response };
		}

		// 3- Check if user still exists
		const currentUser = await repository.findOne({
			filter: { _id: decoded.id },
			populate: {
				path: 'role',
				select: 'permissions',
				populate: {
					path: 'permissions',
				},
			},
		});

		if (!currentUser) {
			err = new AppError(
				'The user belonging to this token does no longer exist.',
				401
			);
			return { err, response };
		}

		// 4- Check if user changed password after the token was issued
		if (currentUser.isPasswordChangedAfter(decoded.iat)) {
			err = new AppError(
				'User recently changed password! Please log in again.',
				401
			);
			return { err, response };
		}

		// 3- If everything is OK, retrun current use
		response = {
			data: currentUser,
			status: 'success',
			statusCode: 200,
		};
		return { err, response };
	},

	async getById(id) {
		let err = false,
			response = {};

		const isMongoId = validator.isMongoId(id);

		if (!isMongoId) {
			err = new AppError('Id not valid', 400);
			return { err, response };
		}

		const user = await repository.findById({ id, lean: true });

		if (!user) {
			err = new AppError('User not found', 404);
			return { err, response };
		}

		response = {
			status: 'success',
			statusCode: 200,
			data: user || {},
		};

		return { err, response };
	},

	async updateMe(body, user) {
		let err = false,
			response = {};

		// 1- Create error if user POSTs password data
		if (body.password || body.passwordConfirm) {
			err = new AppError('This route is not for password updates.', 400);
			return { err, response };
		}

		// 2- Filtered out unwanted fields names that are not allowed to be updated
		let filteredBody = utils.filterObj(body, 'name', 'favourites');

		const { valid, errors } = isBodyValid(filteredBody);
		if (!valid) {
			err = new AppError('validation failed', 400, errors);
			return { err, response };
		}

		// 3- Update user document
		const updatedUser = await repository.findOneAndUpdate(
			{ _id: user.id },
			filteredBody
		);

		if (!updatedUser) {
			err = new AppError('validation failed', 400, errors);
			return { err, response };
		}

		response = {
			status: 'success',
			statusCode: 200,
			data: updatedUser,
		};

		return { err, response };
	},
};
