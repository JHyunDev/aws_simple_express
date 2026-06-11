const express = require('express');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const pool = require('../services/db');

const router = express.Router();

// 회원가입
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'name, email, password는 필수입니다.',
      });
    }

    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        message: '이미 사용 중인 이메일입니다.',
      });
    }

    const hashedPassword = await argon2.hash(password, {
      type: argon2.argon2id,
    });

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    res.status(201).json({
      message: '회원가입 성공',
      user: {
        id: result.insertId,
        name,
        email,
      },
    });
  } catch (error) {
    console.error('[REGISTER ERROR]', error);
    res.status(500).json({
      message: '회원가입 중 서버 오류가 발생했습니다.',
    });
  }
});

// 로그인
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'email, password는 필수입니다.',
      });
    }

    const [users] = await pool.query(
      'SELECT id, name, email, password FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        message: '이메일 또는 비밀번호가 올바르지 않습니다.',
      });
    }

    const user = users[0];

    const isValidPassword = await argon2.verify(user.password, password);

    if (!isValidPassword) {
      return res.status(401).json({
        message: '이메일 또는 비밀번호가 올바르지 않습니다.',
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
      }
    );

    res.json({
      message: '로그인 성공',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('[LOGIN ERROR]', error);
    res.status(500).json({
      message: '로그인 중 서버 오류가 발생했습니다.',
    });
  }
});

module.exports = router;