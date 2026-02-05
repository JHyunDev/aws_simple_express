const express = require('express');
const router = express.Router();

router.get('/hello', (req, res) => {
  res.json({
    message: 'Hello from API',
    time: new Date().toISOString(),
  });
});

module.exports = router;