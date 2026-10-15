const express = require('express');
const router = express.Router();

const db = require('../services/db');

router.get('/', (req, res) => {
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