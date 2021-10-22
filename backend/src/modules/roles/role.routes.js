const express = require('express');
const router = express.Router();
const controller = require('./role.controller');
const authController = require('../users/auth.controller');

router.use(authController.restrictTo(['admin']));

router.route('/').get(controller.list()).post(controller.create());

router
	.route('/:id')
	.get(controller.getById())
	.patch(controller.update())
	.delete(controller.delete());

module.exports = router;
