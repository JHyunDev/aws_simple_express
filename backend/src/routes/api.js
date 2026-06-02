const express = require('express');
const router = express.Router();
const pool = require('../services/db');
const { SELECT } = require('sequelize/lib/query-types');

router.get('/hello', (req, res) => {
  res.json({
    message: 'Hello from API',
    time: new Date().toISOString(),
  });
});

router.get('/items', async (req, res) => { //비동기처리, (클라이언트가 보낸 요청값, 서버가 돌려줄 결과 파일)
  try{ //const result로 쓰면 mysql2에서 rows와 fields정보가 같이 오므로 const [rows]로 rows정보만 뽑아 사용한다
    const [rows] = await pool.query(` 
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

//유저 추가(회원가입)
router.post('/users', async (req, res) => {
  try {
    const { name, email } = req.body; 

    if (!name || !email) { //name혹은 email이 없으면 오류메세지 출력
      return res.status(400).json({
        message: 'name and email are required',
      });
    }

    const [result] = await pool.query(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      [name, email]
    );

    res.status(201).json({
      message: 'User created',
      user: {
        id: result.insertId,
        name,
        email,
      },
    });
  } catch (error) {
    console.error('POST /api/users error:', error);
    res.status(500).json({
      message: 'Internal server error',
    });
  }
});

// 아이템 생성
router.post('/items', async (req, res) => {
  try {
    const { user_id, name, description } = req.body;

    if (!user_id || !name) {
      return res.status(400).json({
        message: 'user_id and name are required',
      });
    }

    const [result] = await pool.query(
      'INSERT INTO items (user_id, name, description) VALUES (?, ?, ?)',
      [user_id, name, description || null]
    );

    res.status(201).json({
      message: 'Item created',
      item: {
        id: result.insertId,
        user_id,
        name,
        description: description || null,
      },
    });
  } catch (error) {
    console.error('POST /api/items error:', error);
    res.status(500).json({
      message: 'Internal server error',
    });
  }
});

//아이템 삭제 
router.delete('/items/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      'DELETE FROM items WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Item not found',
      });
    }

    res.json({
      message: 'Item deleted successfully',
      deletedId: id,
    });
  } catch (err) {
    console.error('[DELETE /items/:id ERROR]', err);

    res.status(500).json({
      message: 'Failed to delete item',
      error: err.message,
    });
  }
});

//아이템 수정
router.put('/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const [result] = await pool.query(
      `
      UPDATE items
      SET name = ?, description = ?
      WHERE id = ?
      `,
      [name, description, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Item not found',
      });
    }

    res.json({
      message: 'Item updated successfully',
      itemId: id,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: 'Update failed',
      error: err.message,
    });
  }
});

module.exports = router;