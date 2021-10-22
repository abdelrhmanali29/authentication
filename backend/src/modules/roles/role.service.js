const repository = require('./role.repository');
const AppError = require('../../utils/appError');
const validator = require('./role.validation');
const config = require('../../config/config');

module.exports = {
	async create(role) {
		let err = false,
			response = {};

		const { valid, errors } = await validator.sanitation(role);
		if (!valid) {
			err = new AppError('validation failed', 400, errors);
			return { err, response };
		}

		const newRole = await repository.create(role);

		response = {
			data: newRole,
			status: 'success',
			statusCode: 201,
		};
		return { err, response };
	},

	async list(query) {
		let err = false,
			response = {};

		const queryPages = {
			skip: parseInt(query.skip) || parseInt(config.skip),
			limit: parseInt(query.limit) || parseInt(config.limit),
		};

		if (!validator.pagination(queryPages)) {
			err = new AppError('pagination failed', 400);

			return { err, response };
		}

		const pages = {
			limit: queryPages.limit,
			skip: queryPages.skip,
		};

		Reflect.deleteProperty(query, 'limit');
		Reflect.deleteProperty(query, 'skip');

		const { roles, totalRoles } = await repository.list(query, pages);
		response = {
			data: roles,
			total: totalRoles,
			status: 'success',
			statusCode: 200,
		};

		return { err, response };
	},

	async getById(id) {
		let err = false,
			response = {};

		if (!validator.isMongoId(id)) {
			err = new AppError('Invalid role id', 400);
			return { err, response };
		}

		const role = await repository.getById(id);

		if (!role) {
			err = new AppError('Role not exist', 404);
			return { err, response };
		}

		response = {
			data: role,
			status: 'success',
			statusCode: 200,
		};
		return { err, response };
	},

	async update(id, role) {
		let err = false,
			response = {};

		if (!validator.isMongoId(id)) {
			err = new AppError('Invalid role id', 400);

			return { err, response };
		}

		const { valid, errors } = await validator.sanitation(role);
		if (!valid) {
			err = new AppError('validation failed', 400, errors);
			return { err, response };
		}

		const newRole = await repository.update(id, role);

		if (!newRole) {
			err = new AppError('Role not exist', 404);
			return { err, response };
		}

		response = {
			data: newRole,
			status: 'success',
			statusCode: 200,
		};

		return { err, response };
	},

	async delete(id) {
		let err = false,
			response = {};

		if (!validator.isMongoId(id)) {
			err = new AppError('Invalid role id', 400);

			return { err, response };
		}

		const isRoleDeleted = await repository.delete(id);

		if (!isRoleDeleted) {
			err = new AppError('Role not exist', 404);

			return { err, response };
		}
	},
};
