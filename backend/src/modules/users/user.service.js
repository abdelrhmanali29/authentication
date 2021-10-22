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
