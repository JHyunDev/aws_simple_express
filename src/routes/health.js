const express = require('express');
const router = express.Router();
const db = require('../services/db');


router.get('/', (req, res) => {
  console.log(`[HEALTH] ${req.ip} ${new Date().toISOString()}`);
  res.json({ status: 'OK' });
});

router.get('/db', async (req, res) => {
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


