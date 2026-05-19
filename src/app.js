const express = require('express');
const app = express();
const apiRouter = require('./routes/api');
const healthRouter = require('./routes/health');
const path = require('path');

app.use('/health', healthRouter);
app.use('/api', apiRouter);
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());

module.exports = app;

