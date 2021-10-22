const mongoose = require('mongoose');
const Ajv = require('ajv').default;

const ajv = new Ajv({ allErrors: true });

const isMongoId = (id) => {
	return mongoose.Types.ObjectId.isValid(id);
};

const isValidSlug = (slug) => {
	const splitSlug = slug.split('-');

	return isNumber(splitSlug[splitSlug.length - 1]) && typeof slug == 'string';
};

const isNumber = (number) => {
	return !isNaN(number);
};

const getIncludesErrors = (includes, validIncludes) => {
	const formulatedIncludes = includes.split(',');

	let error = false;

	for (const include of formulatedIncludes) {
		if (!validIncludes.includes(include)) {
			error = `Can not add this include ${include}`;
			return error;
		}
	}

	return error;
};

// return error if there is error and false if no error
const pagination = (params) => {
	if (typeof params.limit === 'string') params.limit = parseInt(params.limit);

	if (typeof params.skip === 'string') params.skip = parseInt(params.skip);
	const schema = {
		type: 'object',
		required: ['limit', 'skip'],
		properties: {
			limit: {
				type: 'number',
			},
			skip: {
				type: 'number',
			},
		},
	};

	let validate = ajv.compile(schema);

	const valid = validate(params);
	const errors = validate.errors;

	return { valid, errors };
};

module.exports = {
	isMongoId,
	isNumber,
	pagination,
	isValidSlug,
	getIncludesErrors,
};
