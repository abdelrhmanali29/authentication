const Role = require('./role.model');

module.exports = {
	async create(role) {
		const newRole = new Role(role);
		await newRole.save();

		return newRole;
	},

	async count(name) {
		const rolesCounter = await Role.countDocuments({
			name,
		});

		return rolesCounter;
	},

	async list(query, pages) {
		const [totalRoles, roles] = await Promise.all([
			Role.countDocuments(query),
			Role.find(query).limit(pages.limit).skip(pages.skip).lean(),
		]);

		return {
			totalRoles,
			roles,
		};
	},

	async getById(id) {
		const role = await Role.findOne({ _id: id }).lean();

		return role;
	},

	async update(id, role) {
		const newRole = await Role.findByIdAndUpdate({ _id: id }, role, {
			new: true,
		}).lean();

		return newRole;
	},

	async delete(id) {
		const role = await Role.findByIdAndDelete({ _id: id });

		if (!role) return false;
	},

	async find(query) {
		return await Role.find(query.filter)
			.sort(query.sort)
			.limit(query.limit)
			.skip(query.skip)
			.populate(query.populate)
			.select(query.select)
			.lean(query.lean);
	},

	async findOne(query) {
		return await Role.findOne(query.filter)
			.sort(query.sort)
			.limit(query.limit)
			.skip(query.skip)
			.populate(query.populate)
			.select(query.select)
			.lean(query.lean);
	},

	async bulkWrite(updateOperations) {
		return await Role.bulkWrite(updateOperations);
	},

	async count(filter) {
		return await Role.countDocuments(filter);
	},

	async save(role) {
		const roleSaved = new Role(role);
		await roleSaved.save();
		return roleSaved;
	},

	async saveMany(users) {
		return await Role.insertMany(users);
	},

	async findOneAndUpdate(filter, updatedUser) {
		return await Role.findOneAndUpdate(filter, updatedUser, {
			new: true,
		});
	},
};
