const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new Schema(
	{
		name: {
			type: String,
			trim: true,
			required: [true, 'Please provide your name'],
		},

		email: {
			type: String,
			trim: true,
			required: [true, 'Please provide your email'],
			unique: true,
			lowerCase: true,
			validate: [validator.isEmail, 'Please provide a valid email'],
		},

		password: {
			type: String,
			required: [true, 'Please provide a password'],
			minLength: 8,
			select: false,
		},

		passwordConfirm: {
			type: String,
			required: [true, 'Please confirm your password'],
			validate: {
				validator: function (el) {
					return el === this.password;
				},
				message: 'Passwords are not the same',
			},
		},

		passwordChangedAt: Date,
		passwordResetToken: String,
		passwordResetExpires: Date,
		active: {
			type: Boolean,
			default: true,
			select: false,
		},

		role: {
			type: Schema.Types.ObjectId,
			ref: 'Role',
		},
	},
	{
		versionKey: false,
	}
);

//plugins
userSchema.plugin(uniqueValidator);

// Model middlewares (query middlewares)
userSchema.pre('save', async function (next) {
	if (!this.isModified('password')) return next();

	this.password = await bcrypt.hash(this.password, 10);
	this.passwordConfirm = undefined;
	next();
});

userSchema.pre('save', function (next) {
	if (!this.isModified('password') || this.isNew) return next();

	this.passwordChangedAt = Date.now() - 1000;
	next();
});

userSchema.pre(/^find/, function (next) {
	this.find({ active: { $ne: false } });
	next();
});

// Instanc methods
userSchema.methods.correctPassword = async function (
	candidatePassword,
	userPassword
) {
	return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.isPasswordChangedAfter = function (JWTTimestamp) {
	if (this.passwordChangedAt) {
		const changedTimestamp = this.passwordChangedAt.getTime() / 1000;

		return JWTTimestamp < changedTimestamp;
	}

	// False means NOT changed
	return false;
};

userSchema.methods.createPasswordResetToken = function () {
	const resetToken = crypto.randomBytes(32).toString('hex');

	this.passwordResetToken = crypto
		.createHash('sha256')
		.update(resetToken)
		.digest('hex');

	this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

	return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
