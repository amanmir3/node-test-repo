require('dotenv').config();
const express = require('express');
const logger = require(./utils/logger);
const apiRoutes = require('./routes/api');

const app = express();
const port = process.env.PORT ||3000;

app.use(express.json());
app.use('/api', apiRoutes);

app.listen(port, () => {
logger.info('Server is running on port ${port}');
});