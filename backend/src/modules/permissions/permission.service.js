const repository = require('./permission.repository');
const AppError = require('../../utils/appError');
const validator = require('./permission.validation');
const config = require('../../config/config');

module.exports = {
	async create(permission) {
		let err = false;
		let response = {};

		const { valid, errors } = await validator.sanitation(permission, 0);
		if (!valid) {
			err = new AppError('validation failed', 400, errors);
			return { err, response };
		}

		const newPermission = await repository.save(permission);
		if (!newPermission) {
			err = new appError('can not create new permission', 400);
			return { err, response };
		}

		response = {
			status: 'success',
			data: newPermission,
			statusCode: 200,
		};
		return { err, response };
	},

	async list(query) {
		let err = false;
		let response = {};

		const queryPages = {
			skip: parseInt(query.skip) || parseInt(config.skip),
			limit: parseInt(query.limit) || parseInt(config.limit),
		};

		if (!validator.pagination(queryPages)) {
			err = new AppError('pagination failed', 400);
			return { err, response };
		}

		query = {
			limit: queryPages.limit,
			skip: queryPages.skip,
			lean: true,
			filter: {},
		};

		Reflect.deleteProperty(query, 'limit');
		Reflect.deleteProperty(query, 'skip');
		const [permissions, total] = await Promise.all([
			repository.find(query),
			repository.count(query.filter),
		]);

		response = {
			data: permissions,
			total,
			statusCode: 200,
			status: 'success',
		};
		return { err, response };
	},

	async getById(id) {
		let err = false;
		let response = {};

		if (!validator.isMongoId(id)) {
			err = new AppError('Permission ID not valid', 400);
			return { err, response };
		}

		const permission = await repository.findOne({
			filter: { _id: id },
			lean: true,
		});

		if (!permission) {
			err = new AppError('Permission not found', 404);
			return { err, response };
		}

		response = {
			data: permission,
			status: 'success',
			statusCode: 200,
		};

		return { err, response };
	},

	async update(id, permission) {
		let err = false;
		let response = {};

		if (!validator.isMongoId(id)) {
			err = new AppError('Permission ID not valid', 400);
			return { err, response };
		}

		const { valid, errors } = await validator.sanitation(permission, 1);
		if (!valid) {
			err = new AppError('validation failed', 400, errors);
			return { err, response };
		}

		const newPermission = await repository.findOneAndUpdate(
			{ _id: id },
			permission
		);

		if (!newPermission) {
			err = new AppError('Permission not found', 404);
			return { err, response };
		}
		response = {
			status: 'success',
			statusCode: 200,
			data: newPermission,
		};
		return { err, response };
	},

	async delete(id) {
		let err = false;
		let response = {};

		if (!validator.isMongoId(id)) {
			err = new AppError('Permission ID not valid', 400);
			return { err, response };
		}

		const isPermissionDeleted = await repository.findOneAndDelete({ _id: id });

		if (!isPermissionDeleted) {
			err = new AppError('Permission not found', 404);
			return { err, response };
		}
		response = {
			status: 'success',
			statusCode: 200,
		};

		return { err, response };
	},
};
