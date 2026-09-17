const express = require('express');
const router = express.Router();
const db = require('../services/db');


router.get('/', (req, res) => { //Express가 살아있는지, Node 프로세스가 살아있는지, 3000번 포트가 응답하는지 확인
  console.log(`[HEALTH] ${req.ip} ${new Date().toISOString()}`);
  res.json({ status: 'OK' });
});

router.get('/db', async (req, res) => { //위의 내용 + RDS까지 TCP 연결 가능한가? + MySQL인증 가능한가? + SQL 실행 가능한가?
  try {
    await db.query('SELECT 1');
    res.json({ status: 'OK', db: 'CONNECTED' });
  } catch (err) {
    console.error('[DB ERROR]', err);
    res.status(500).json({
      status: 'FAIL',
      error: err.message,
    });
  }
});

module.exports = router;


