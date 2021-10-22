const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');

const roleSchema = new Schema({
	name: { type: String, unique: true },
	permissions: [
		{
			type: mongoose.Types.ObjectId,
			ref: 'Permission',
		},
	],
});

roleSchema.plugin(uniqueValidator);

const Role = mongoose.model('Role', roleSchema);
module.exports = Role;
