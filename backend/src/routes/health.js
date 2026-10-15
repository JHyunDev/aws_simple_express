const express = require('express');
const router = express.Router();

const db = require('../services/db');

router.get('/', (req, res) => {

  // Day 7: 롤백 검증을 위한 일시적인 장애 주입
  const port = String(process.env.PORT || '3000');

  if (process.env.CI !== 'true' && port === '3000') {
    return res.status(503).json({
      status: 'ERROR',
      message: 'Intentional deployment failure test',
    });
  }

  res.json({
    status: 'OK',
  });
});

router.get('/db', async (req, res) => {
  try {
    await db.query('SELECT 1');

    res.json({
      status: 'OK',
      db: 'CONNECTED',
    });
  } catch (error) {
    console.error('[DB ERROR]', error);

    res.status(500).json({
      status: 'ERROR',
      db: 'DISCONNECTED',
    });
  }
});

module.exports = router;