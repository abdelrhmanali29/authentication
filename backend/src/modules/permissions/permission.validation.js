const validation = require('../../utils/validation');
const schema = require('./permission.schema');
const Ajv = require('ajv').default;
const ajv = new Ajv({ allErrors: true });
const repository = require('./permission.repository');

const sanitation = async (permission, number) => {
	let validate = ajv.compile(schema);

	let valid = validate(permission);
	let errors = validate.errors;
	if (!errors) errors = [];

	const permissionsCounter = await repository.count({ name: permission.name });

	if (permissionsCounter > number) {
		valid = false;
		errors.push({
			dataPath: '/name',
			message: 'should be unique.',
		});
	}

	errors.forEach((error) => {
		error.dataPath = error.dataPath.split('/')[1];
	});

	return { valid, errors };
};

const pagination = (queryPages) => {
	return validation.pagination(queryPages);
};

const isMongoId = (id) => {
	return validation.isMongoId(id);
};

module.exports = {
	sanitation,
	pagination,
	isMongoId,
};
