const express = require('express');
const router = express.Router();
const db = require('../services/db');
const { SELECT } = require('sequelize/lib/query-types');

router.get('/hello', (req, res) => {
  res.json({
    message: 'Hello from API',
    time: new Date().toISOString(),
  });
});

router.get('/items', async (req, res) => { //비동기처리, (클라이언트가 보낸 요청값, 서버가 돌려줄 결과 파일)
  try{ //const result로 쓰면 mysql2에서 rows와 fields정보가 같이 오므로 const [rows]로 rows정보만 뽑아 사용한다
    const [rows] = await db.query(` 
       SELECT
        items.id,
        items.name,
        items.description,
        items.created_at,
        users.id AS user_id,
        users.name AS user_name,
        users.email AS user_email
      FROM items
      JOIN users ON items.user_id = users.id
      ORDER BY items.id DESC        
    `);

    res.json(rows);
  } catch(err){
    console.error('GET /api/items error:', err);
    res.status(500).json({
      message: 'Failed to fetch items',
    });
  }
});

module.exports = router;