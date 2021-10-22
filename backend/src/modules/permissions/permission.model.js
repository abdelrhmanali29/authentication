const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');

const permissionSchema = new Schema(
	{
		name: { type: String, unique: true },
	},
	{
		versionKey: false,
	}
);

permissionSchema.plugin(uniqueValidator);

const Permission = mongoose.model('Permission', permissionSchema);
module.exports = Permission;
