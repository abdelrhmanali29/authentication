const service = require('./role.service');
const catchAsync = require('../../utils/catchAsync');

module.exports = {
	create() {
		return catchAsync(async (req, res, next) => {
			const role = {
				name: req.body.name,
				permissions: req.body.permissions,
			};

			const newRole = await service.create(role, next);

			if (newRole) {
				return res.status(200).json({
					status: 'success',
					data: {
						newRole,
					},
				});
			}
		});
	},

	list() {
		return catchAsync(async (req, res, next) => {
			const { roles, totalRoles } = await service.list(req.query, next);

			return res.status(200).json({
				status: 'success',
				data: {
					total: totalRoles,
					roles,
				},
			});
		});
	},

	getById() {
		return catchAsync(async (req, res, next) => {
			const id = req.params.id;
			const role = await service.getById(id, next);

			if (role) {
				return res.status(200).json({
					status: 'success',
					data: {
						role,
					},
				});
			}
		});
	},

	update() {
		return catchAsync(async (req, res, next) => {
			const id = req.params.id;
			const role = {
				name: req.body.name,
				permissions: req.body.permissions,
			};

			const newRole = await service.update(id, role, next);

			if (newRole) {
				return res.status(200).json({
					status: 'success',
					data: {
						role: newRole,
					},
				});
			}
		});
	},

	delete() {
		return catchAsync(async (req, res, next) => {
			const id = req.params.id;
			const isRoleDeleted = await service.delete(id, next);

			if (isRoleDeleted) return res.status(204).json();
		});
	},
};
