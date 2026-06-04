const express = require('express');
const cors = require('cors');

const apiRouter = require('./routes/api');
const healthRouter = require('./routes/health');

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

app.use('/api', apiRouter);
app.use('/health', healthRouter);

module.exports = app;

