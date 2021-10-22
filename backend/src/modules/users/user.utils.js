const jwt = require('jsonwebtoken');
const config = require('../../config/config');

const signToken = (id) => {
	return jwt.sign({ id }, config.jwtSecret, {
		expiresIn: config.jwtEpiresIn,
	});
};

const filterObj = (obj, ...allowedFields) => {
	const newObj = {};
	Object.keys(obj).forEach((el) => {
		if (allowedFields.includes(el)) newObj[el] = obj[el];
	});

	return newObj;
};

module.exports = {
	signToken,
	filterObj,
};
