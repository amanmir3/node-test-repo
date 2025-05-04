const express = require('express');
const router = express.Router();
const { fetchPost } = require('../services/externalApiService');

router.get('/post', async (req, res) => {
try {
const data = await fetchPost();
res.json(data);
} catch (error) {
res.status(500).json({ message: "Error fetching post "});
}
});

module.exports = router;