const schema = {
	type: 'object',
	required: ['name', 'email', 'password', 'passwordConfirm'],
	properties: {
		name: {
			type: 'string',
			minLength: 3,
			maxLength: 30,
		},
		email: {
			type: 'string',
			format: 'email',
		},
		password: {
			type: 'string',
			minLength: 8,
			maxLength: 32,
		},
		passwordConfirm: {
			type: 'string',
		},
	},
};

module.exports = schema;
