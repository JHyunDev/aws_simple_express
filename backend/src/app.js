//일종의 요청 교차로(Express서버가 여기서 요청을 분류한다)
const express = require('express');
const cors = require('cors');
const path = require('path');

const apiRouter = require('./routes/api'); //const -> 변수 선언, apiRouter라는 변수를 만들겠다. api.js의 module.exports = router;로 반환받은 router객체를 require로 받아서 apiRouter변수에 대입
const healthRouter = require('./routes/health'); //health 모듈이 공개한(export)한 값을 받아와 healthRouter 변수에 넣는다.
const authRouter = require('./routes/auth'); //auth.js파일 불러오는 준비 작업

const app = express(); // express()를 호출하여 Express가 제공하는 어플리케이션 객체 생성.

app.use(cors({ //위에서 생성한 app(express)객체에 cors등록
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api', apiRouter); // Express야, 앞으로 URL이 /api로 시작하는 요청이 들어오면 이 apiRouter 객체를 검사해라 -> apirouter객체내에서 맞는 경로를 또 찾아감
app.use('/health', healthRouter);// /health요청을 health.js로 넘김
app.use('/api/auth', authRouter);// /api/auth요청을 auth.js로 넘김

module.exports = app; //위에서 만든 app객체를 다른 모듈도 사용가능하게 export

