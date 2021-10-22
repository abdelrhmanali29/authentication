const util = require('util');
const set = util.promisify(redisClient.set).bind(redisClient);
const get = util.promisify(redisClient.get).bind(redisClient);
const setex = util.promisify(redisClient.setex).bind(redisClient);
const del = util.promisify(redisClient.del).bind(redisClient);

const setData = async (resourceName, object) => {
	try {
		let resourceData = {};
		const resourceFound = await get(resourceName);

		if (resourceFound) {
			resourceData = JSON.parse(resourceFound);
		}

		if (object.smId) {
			resourceData[object.smId.toString()] = object;

			const dataSaved = await set(resourceName, JSON.stringify(resourceData));
			return true;
		}

		return false;
	} catch (error) {
		console.log(error);
	}
};

const getData = async (resourceName, smId) => {
	try {
		let resourceData = {};

		const resourceFound = await get(resourceName);

		if (resourceFound) {
			resourceData = JSON.parse(resourceFound);

			if (resourceData[smId.toString()]) {
				return resourceData[smId.toString()];
			}
		}

		return false;
	} catch (error) {
		console.log(error);
	}
};

const getResource = async (resourceName) => {
	try {
		let resourceData = {};

		const resourceFound = await get(resourceName);

		if (resourceFound) {
			resourceData = JSON.parse(resourceFound);
			return resourceData;
		}

		return false;
	} catch (error) {
		console.log(error);
	}
};

const setResource = async (resourceName, object) => {
	try {
		const dataSaved = await set(resourceName, JSON.stringify(object));
		return dataSaved;
	} catch (error) {
		console.log(error);
	}
};

const deleteResoucre = async (resourceName) => {
	try {
		await del(resourceName);
	} catch (error) {
		console.log(error);
	}
};

const setResourceWithExpiration = async (
	resourceName,
	object,
	expirationTime
) => {
	try {
		const dataSaved = await setex(
			resourceName,
			expirationTime,
			JSON.stringify(object)
		);
		return dataSaved;
	} catch (error) {
		console.log(error);
	}
};

module.exports = {
	setData,
	getData,
	getResource,
	setResource,
	deleteResoucre,
	setResourceWithExpiration,
};
