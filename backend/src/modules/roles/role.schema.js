const schema = {
	type: 'object',
	required: ['name'],
	properties: {
		name: {
			type: 'string',
			maxLength: 30,
		},
	},
};

module.exports = schema;
