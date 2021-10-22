const Permission = require('./permission.model');

module.exports = {
	async create(permission) {
		const newPermission = new Permission(permission);
		await newPermission.save();

		return newPermission;
	},

	async list(pages) {
		const [total, permissions] = await Promise.all([
			Permission.countDocuments(),
			Permission.find().limit(pages.limit).skip(pages.skip).lean(),
		]);

		return {
			total,
			data: permissions,
		};
	},

	async getById(id) {
		const permission = await Permission.findOne({ _id: id }).lean();

		return permission;
	},

	async update(id, permission) {
		const newPermission = await Permission.findByIdAndUpdate(
			{ _id: id },
			permission,
			{
				new: true,
			}
		).lean();

		return newPermission;
	},

	async delete(id) {
		const permission = await Permission.findByIdAndDelete({ _id: id });

		if (!permission) return false;
		return true;
	},

	// ===============

	async find(query) {
		return await Permission.find(query.filter)
			.sort(query.sort)
			.limit(query.limit)
			.skip(query.skip)
			.populate(query.populate)
			.select(query.select)
			.lean(query.lean);
	},

	async findOne(query) {
		return await Permission.findOne(query.filter)
			.sort(query.sort)
			.limit(query.limit)
			.skip(query.skip)
			.populate(query.populate)
			.select(query.select)
			.lean(query.lean);
	},

	async bulkWrite(updateOperations) {
		return await Permission.bulkWrite(updateOperations);
	},

	async count(filter) {
		return await Permission.countDocuments(filter);
	},

	async save(permission) {
		const permissionSaved = new Permission(permission);
		await permissionSaved.save();
		return permissionSaved;
	},

	async saveMany(permissions) {
		return await Permission.insertMany(permissions);
	},

	async findOneAndUpdate(filter, updatedPermission) {
		return await Permission.findOneAndUpdate(filter, updatedPermission, {
			new: true,
			upsert: true,
		});
	},

	async findOneAndDelete(filter) {
		return await Permission.findOneAndDelete(filter);
	},
};
