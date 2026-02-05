const express = require('express');
const app = express();
const apiRouter = require('./routes/api');
const healthRouter = require('./routes/health');

app.use('/health', healthRouter);

app.use('/api', apiRouter);
console.log('API router loaded');


app.use(express.json());

module.exports = app;

