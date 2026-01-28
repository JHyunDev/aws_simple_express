const express = require('express');
const app = express();

const healthRouter = require('./routes/health');
app.use('/health', healthRouter);


app.use(express.json());

module.exports = app;
