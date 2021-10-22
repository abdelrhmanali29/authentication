const repository = require('./user.repository');
const rolesRepository = require('../roles/role.repository');
const AppError = require('../../utils/appError');
const { validation, isBodyValid } = require('./user.validation');
const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../../config/config');
const utils = require('./user.utils');
const User = require('./user.model');
const roleService = require('../roles/role.service');

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

		if (!user.hasOwnProperty('role')) user.role = 'user';

		let role = await rolesRepository.findOne({
			filter: { name: user.role },
			lean: true,
		});

		if (!role) {
			role = await roleService.create(user.role);
		}

		user.role = role._id;

		const newUser = await repository.save(user);
		const token = utils.signToken(newUser.id);

		if (!token || !newUser) {
			err = new AppError('Error in sign up. Try again later.', 500);
			return { err, response };
		}

		response = {
			token,
			data: {
				name: newUser.name,
				email: newUser.email,
				id: newUser.id,
			},
			status: 'success',
			statusCode: 201,
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
			select: 'password name email',
		});

		if (!user || !(await user.correctPassword(password, user.password))) {
			err = new AppError('Incorrect email or password', 401);
			return { err, response };
		}

		// 3- If everything is OK, send token to client
		const token = utils.signToken(user.id);
		if (!token) {
			err = new AppError('Error in login. Please log in again.', 500);
			return { err, response };
		}

		user.password = undefined;
		response = {
			token,
			data: user,
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

	async resetPassword(resetToken, body) {
		let err = false;
		let response = {};

		if (
			!body.hasOwnProperty('password') ||
			!body.hasOwnProperty('passwordConfirm')
		) {
			err = new AppError('Should support password and password confirm.', 400);
			return { err, response };
		}

		// 1- Get user based on the token
		const hashedToken = crypto
			.createHash('sha256')
			.update(resetToken)
			.digest('hex');

		const user = await repository.findOne({
			filter: {
				passwordResetToken: hashedToken,
				passwordResetExpires: { $gt: Date.now() },
			},
		});

		// 2- If token has not expired, and there is user, set the new password
		if (!user) {
			err = new AppError('Token is invalid or has expired', 400);
			return { err, response };
		}
		user.password = body.password;
		user.passwordConfirm = body.passwordConfirm;
		user.passwordResetToken = undefined;
		user.passwordResetExpires = undefined;
		await user.save();

		// 3- Update changedPasswordAt property for the user
		// 4) Log the user in, send JWT
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

	async updatePassword(currentUser, requestBody) {
		let err = false;
		let response = {};

		if (
			!requestBody.hasOwnProperty('passwordCurrent') ||
			!requestBody.hasOwnProperty('password') ||
			!requestBody.hasOwnProperty('passwordConfirm')
		) {
			err = new AppError(
				'Should support current password, password and password confirm.',
				400
			);
			return { err, response };
		}

		// 1- Get user from collection
		const user = await repository.findById({
			id: currentUser.id,
			select: 'password name email',
		});

		// 2- Check if POSTed current password is correct
		if (
			!(await user.correctPassword(requestBody.passwordCurrent, user.password))
		) {
			err = new AppError('Your current password is wrong.', 401);
			return { err, response };
		}

		// 3- Check if POSTed current password is NOT equal new password
		if (
			await user.correctPassword(requestBody.passwordConfirm, user.password)
		) {
			err = new AppError('New password should NOT be the old password.', 401);
			return { err, response };
		}

		// 4- If so, update password
		user.password = requestBody.password;
		user.passwordConfirm = requestBody.passwordConfirm;
		await user.save();
		// User.findByIdAndUpdate will NOT work as intended!

		// 4) Log user in, send JWT
		const token = utils.signToken(user.id);
		if (!token) {
			err = new AppError('Error in login. Please log in again.', 500);
			return { err, response };
		}
		response = {
			token,
			data: user,
			status: 'success',
			statusCode: 200,
		};
		return { err, response };
	},
};
