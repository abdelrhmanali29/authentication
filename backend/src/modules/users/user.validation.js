const repository = require('./user.repository');
const rolesRepository = require('../roles/role.repository');
const schema = require('./user.schema');
const validator = require('validator');
const Ajv = require('ajv').default;
const AjvFormats = require('ajv-formats');
const ajv = new Ajv({ allErrors: true });
AjvFormats(ajv, ['date', 'time', 'date-time', 'email', 'url']);

const validation = async (user) => {
	let validate = ajv.compile(schema);

	let valid = validate(user);
	let errors = validate.errors;
	if (!errors) errors = [];

	if (!validator.isEmail(user.email)) {
		valid = false;
		errors.push({
			keyword: 'type',
			dataPath: '/email',
			message: 'should be valid',
		});
	}

	if (!(await isUniqueEmail(user.email))) {
		valid = false;
		errors.push({
			dataPath: '/email',
			message: 'should be unique',
		});
	}

	if (user.password !== user.passwordConfirm) {
		valid = false;
		errors.push({
			keyword: 'type',
			dataPath: '/password',
			message: 'passwords are not the same',
		});
	}

	const roles = await rolesRepository.find({
		filter: {},
		lean: true,
	});

	const rolesNames = roles.map((role) => role.name);

	if (user.role && !user.role in rolesNames) {
		valid = false;
		errors.push({
			keyword: 'type',
			dataPath: '/role',
			message: 'This role not exists',
		});
	}

	errors.forEach((error) => {
		error.dataPath = error.dataPath.split('/')[1];
	});

	return { valid, errors };
};

const isBodyValid = (user) => {
	let valid = true,
		errors = [];

	if (user.name) {
		if (typeof user.name !== 'string' || user.name.length < 3) {
			valid = false;
			errors.push({
				dataPath: 'name',
				message: 'should be string and more than 3 characters',
			});
		}
	}

	return { valid, errors };
};

const isUniqueEmail = async (email) => {
	const emails = await repository.count({ email });

	if (emails > 0) return false;
	return true;
};

module.exports = { validation, isBodyValid };
