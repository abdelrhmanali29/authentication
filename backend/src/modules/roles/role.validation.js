const validation = require('../../utils/validation');
const schema = require('./role.schema');
const Ajv = require('ajv').default;
const ajv = new Ajv({ allErrors: true });
const repository = require('./role.repository');

const sanitation = async (role) => {
	let validate = ajv.compile(schema);

	let valid = validate(role);
	let errors = validate.errors;
	if (!errors) errors = [];

	// Validate uniquiness
	const rolesCounter = await repository.count(role.name);
	if (rolesCounter > 0) {
		valid = false;
		errors.push({
			dataPath: 'name',
			message: ' should be unique.',
		});
	}

	// Validate permissions exist
	if (!role.permissions) {
		errors.push({
			dataPath: 'role-permissions',
			message: ' should be exist',
		});
	}

	// Vaidate permissions IDs
	if (role.permissions) {
		role.permissions.forEach((permission) => {
			if (!validation.isMongoId(permission)) {
				errors.push({
					dataPath: 'permission',
					message: ' should be MongoDB id',
				});
			}
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
