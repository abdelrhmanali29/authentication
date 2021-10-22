const service = require('./role.service');
const catchAsync = require('../../utils/catchAsync');

module.exports = {
	create() {
		return catchAsync(async (req, res, next) => {
			const role = {
				name: req.body.name,
				permissions: req.body.permissions,
			};

			const { err, response } = await service.create(role);

			if (err) return next(err);
			res.status(response.statusCode).json(response);
		});
	},

	list() {
		return catchAsync(async (req, res, next) => {
			const { err, response } = await service.list(req.query);

			if (err) return next(err);
			res.status(response.statusCode).json(response);
		});
	},

	getById() {
		return catchAsync(async (req, res, next) => {
			const id = req.params.id;
			const { err, response } = await service.getById(id);

			if (err) return next(err);
			res.status(response.statusCode).json(response);
		});
	},

	update() {
		return catchAsync(async (req, res, next) => {
			const id = req.params.id;
			const role = {
				name: req.body.name,
				permissions: req.body.permissions,
			};

			const { err, response } = await service.update(id, role);

			if (err) return next(err);
			res.status(response.statusCode).json(response);
		});
	},

	delete() {
		return catchAsync(async (req, res, next) => {
			const id = req.params.id;
			const { err, response } = await service.delete(id);

			if (err) return next(err);
			res.status(response.statusCode).json(response);
		});
	},
};
