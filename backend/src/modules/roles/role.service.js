const repository = require('./role.repository');
const AppError = require('../../utils/appError');
const validator = require('./role.validation');
const config = require('../../config/config');

module.exports = {
	async create(role, next) {
		const { valid, errors } = await validator.sanitation(role);
		if (!valid) {
			return next(new AppError('validation failed', 400, errors));
		}

		const newRole = await repository.create(role);
		return newRole;
	},

	async list(query, next) {
		const queryPages = {
			skip: parseInt(query.skip) || parseInt(config.skip),
			limit: parseInt(query.limit) || parseInt(config.limit),
		};

		if (!validator.pagination(queryPages)) {
			return next(new AppError('pagination failed', 400));
		}

		const pages = {
			limit: queryPages.limit,
			skip: queryPages.skip,
		};

		Reflect.deleteProperty(query, 'limit');
		Reflect.deleteProperty(query, 'skip');

		const { roles, totalRoles } = await repository.list(query, pages);

		return { roles, totalRoles };
	},

	async getById(id, next) {
		if (!validator.isMongoId(id)) {
			return next(new AppError('Invalid role id', 400));
		}

		const role = await repository.getById(id);

		if (!role) {
			return next(new AppError('Role not exist', 404));
		}

		return role;
	},

	async update(id, role, next) {
		if (!validator.isMongoId(id)) {
			return next(new AppError('Invalid role id', 400));
		}

		const { valid, errors } = await validator.sanitation(role);
		if (!valid) {
			return next(new AppError('validation failed', 400, errors));
		}

		const newRole = await repository.update(id, role);

		if (!newRole) return next(new AppError('Role not exist', 404));
		return newRole;
	},

	async delete(id, next) {
		if (!validator.isMongoId(id)) {
			return next(new AppError('Invalid role id', 400));
		}

		const isRoleDeleted = await repository.delete(id);

		if (!isRoleDeleted) return next(new AppError('Role not exist', 404));
	},
};
