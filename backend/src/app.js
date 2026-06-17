//일종의 요청 교차로(Express서버가 여기서 요청을 분류한다)
const express = require('express');
const cors = require('cors');
const path = require('path');

const apiRouter = require('./routes/api'); //api.js파일 불러오는 준비작업
const healthRouter = require('./routes/health'); //health.js파일 불러오는 준비작업
const authRouter = require('./routes/auth'); //auth.js파일 불러오는 준비 작업

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api', apiRouter); // /api요청을 api.js로 넘김
app.use('/health', healthRouter);// /health요청을 health.js로 넘김
app.use('/api/auth', authRouter);// /api/auth요청을 auth.js로 넘김

module.exports = app;

