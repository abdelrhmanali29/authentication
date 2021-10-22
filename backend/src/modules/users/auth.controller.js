const catchAsync = require('../../utils/catchAsync');
const service = require('./user.service');
const authService = require('./auth.service');
const AppError = require('../../utils/appError');
const User = require('./user.model');
const sendEmail = require('../../utils/email');
const config = require('../../config/config');

const getCookieOptions = () => {
	const cookieOptions = {
		expires: new Date(Date.now() + config.jwtCookieEpiresIn * 60 * 1000),
		httpOnly: true,
	};
	if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

	return cookieOptions;
};

module.exports = {
	signup() {
		return catchAsync(async (req, res, next) => {
			const { err, response } = await service.create(req.body);

			res.cookie('jwt', response.token, getCookieOptions());
			response.token = undefined;
			if (err) return next(err);
			res.status(response.statusCode).json(response);
		});
	},

	login() {
		return catchAsync(async (req, res, next) => {
			const { err, response } = await authService.login(req.body);

			if (err) return next(err);
			res.cookie('jwt', response.token, getCookieOptions());
			response.token = undefined;
			res.status(response.statusCode).json(response);
		});
	},

	protect() {
		return catchAsync(async (req, res, next) => {
			const { err, response } = await authService.protect(req.headers);

			if (err) return next(err);

			// GRANT ACCESS TO PROTECTED ROUTE
			req.user = response.data;
			next();
		});
	},

	restrictTo(...roles) {
		return (req, res, next) => {
			const userPermissions = req.user.role.permissions.map(
				(permission) => permission.name
			);

			console.log(userPermissions);
			console.log(req.method);

			if (
				!roles.includes(req.user.role.name.toString()) &&
				!userPermissions.includes(req.method.toString())
			) {
				return next(
					new AppError('You do not have permission to perform this action', 403)
				);
			}

			next();
		};
	},

	forgotPassword() {
		return catchAsync(async (req, res, next) => {
			// 1- Get user based on POSTed email
			const user = await User.findOne({ email: req.body.email });
			if (!user) {
				return next(new AppError('There is no user with email address.', 404));
			}

			// 2- Generate the random reset token
			const resetToken = user.createPasswordResetToken();
			await user.save({ validateBeforeSave: false });

			// 3- Send it to user's email
			const resetURL = `${req.protocol}://${req.get(
				'host'
			)}/api/v1/users/resetPassword/${resetToken}`;

			const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

			try {
				await sendEmail({
					email: user.email,
					subject: 'Your password reset token (valid for 10 min)',
					message,
				});

				res.status(200).json({
					status: 'success',
					message: 'Token sent to email!',
				});
			} catch (err) {
				console.log(err);
				user.passwordResetToken = undefined;
				user.passwordResetExpires = undefined;
				await user.save({ validateBeforeSave: false });

				return next(
					new AppError(
						'There was an error sending the email. Try again later!'
					),
					500
				);
			}
		});
	},

	resetPassword() {
		return catchAsync(async (req, res, next) => {
			const { err, response } = await authService.resetPassword(
				req.params.token,
				req.body
			);

			if (err) return next(err);
			res.status(response.statusCode).json(response);
		});
	},

	updatePassword() {
		return catchAsync(async (req, res, next) => {
			const { err, response } = await authService.updatePassword(
				req.user,
				req.body
			);

			if (err) return next(err);

			res.cookie('jwt', response.token, getCookieOptions());
			response.token = undefined;
			res.status(response.statusCode).json(response);
		});
	},

	logout() {
		return (req, res) => {
			res.cookie('jwt', 'loggedout', {
				expires: new Date(Date.now() + 10 * 1000),
				httpOnly: true,
			});

			res.status(200).json({ status: 'success' });
		};
	},
};
