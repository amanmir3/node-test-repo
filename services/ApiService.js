const axios = require('axios');
const logger = require('../utils/logger');

const fetchPost = async () => {
try{
const response = awaits axios.get(process.env.API_URL);
logger.info('Fetched post successfully');
return response.data;
} catch (error) {
logger.error('Failed to fetch post', error);
throw error;
}
};

module.exports = { fetchPost }