const service = require('./user.service');
const catchAsync = require('../../utils/catchAsync');
const User = require('./user.model');

module.exports = {
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

	getMe() {
		return catchAsync(async (req, res, next) => {
			req.params.id = req.user.id;
			next();
		});
	},

	updateMe() {
		return catchAsync(async (req, res, next) => {
			const { err, response } = await service.updateMe(req.body, req.user);

			if (err) return next(err);
			res.status(response.statusCode).json(response);
		});
	},

	deleteMe() {
		return catchAsync(async (req, res, next) => {
			await User.findByIdAndUpdate(req.user.id, { active: false });

			res.status(204).json({
				status: 'success',
				data: null,
			});
		});
	},
};
