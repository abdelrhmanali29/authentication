const axios = require('axios');
const config = require('../config/config');

// sport monks instance
const sportMonksApi = axios.create({
	baseURL: config.SM_URL,
	params: {
		api_token: config.SM_API_TOKEN,
	},
});

// interceptor to the response
sportMonksApi.interceptors.response.use(
	(res) => {
		return {
			data: res.data.data,
			statusCode: res.status,
			totalPages:
				res.data.meta && res.data.meta.pagination
					? res.data.meta.pagination.total_pages
					: 1,
			status: true,
		};
	},
	(err) => {
		return {
			errors: [err.message],
			statusCode: err.code,
			status: false,
		};
	}
);

const wyScoutApi = axios.create({
	baseURL: config.WYSCOUT_URL,
	headers: {
		Authorization: config.WYSCOUT_API_TOKEN,
	},
});

wyScoutApi.interceptors.response.use(
	(res) => {
		return {
			data: res.data,
			statusCode: 200,
			totalPages:
				res.data.meta && res.data.meta.page_count
					? res.data.meta.page_count
					: 1,
			status: true,
		};
	},
	(err) => {
		return {
			errors: [err.message],
			status: false,
		};
	}
);

module.exports = {
	sportMonksApi,
	wyScoutApi,
};
