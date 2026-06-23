const express = require('express');
const router = express.Router();
const pool = require('../services/db');
const authMiddleware = require('../middlewares/auth');
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

//프론트에서 빈문자열('')이 오면 DB에는 NULL로 저장토록 하는 함수
function toNull(value) { 
  if (value === undefined || value === '') {
    return null;
  }

  return value;
}

router.get('/hello', (req, res) => {
  res.json({
    message: 'Hello from API',
    time: new Date().toISOString(),
  });
});

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-northeast-2',
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB 제한
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('이미지 파일만 업로드할 수 있습니다.'));
    }

    cb(null, true);
  },
});

function getFileExtension(filename) {
  return path.extname(filename).toLowerCase() || '.jpg';
}

//아이템 목록 출력
router.get('/items', authMiddleware, async (req, res) => { //아이템 목록 불러오기전 authmiddleware가 먼저 검증
  try {
    const userId = req.user.id; //검증이 완료되었으면 

    const [rows] = await pool.query( //sql문을 실행하여 해당 유저의 아이템정보들을 불러온다
  `
  SELECT
    id,
    user_id,
    name,
    description,
    category,
    sub_category,
    color,
    material,
    fit,
    season,
    style,
    image_url,
    created_at
  FROM items
  WHERE user_id = ?
  ORDER BY created_at DESC
  `,
  [userId]
);

    res.json(rows);
  } catch (error) {
    console.error('GET /items error:', error);
    res.status(500).json({ message: '아이템 목록 조회 중 서버 오류가 발생했습니다.' });
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
router.post('/items', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; //미들웨어가 검증 & 검증이 성공적이면 해당 유저기준으로 아이템 생성

    const {
      name,
      description,
      category,
      sub_category,
      color,
      material,
      fit,
      season,
      style,
      image_url,
    } = req.body;

    if (!name) {
      return res.status(400).json({ message: '아이템 이름은 필수입니다.' });
    }

    const [result] = await pool.query(
      `
      INSERT INTO items (
        user_id,
        name,
        description,
        category,
        sub_category,
        color,
        material,
        fit,
        season,
        style,
        image_url
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        userId,
        name,
        toNull(description),
        toNull(category),
        toNull(sub_category),
        toNull(color),
        toNull(material),
        toNull(fit),
        toNull(season),
        toNull(style),
        toNull(image_url),
      ]
    );

    res.status(201).json({
      id: result.insertId,
      user_id: userId,
      name,
      description: toNull(description),
      category: toNull(category),
      sub_category: toNull(sub_category),
      color: toNull(color),
      material: toNull(material),
      fit: toNull(fit),
      season: toNull(season),
      style: toNull(style),
      image_url: toNull(image_url),
    });
  } catch (error) {
    console.error('POST /items error:', error);
    res.status(500).json({ message: '아이템 생성 중 서버 오류가 발생했습니다.' });
  }
});

//아이템 삭제 
router.delete('/items/:id', authMiddleware, async (req, res) => { //미들웨어 인가를 통해 내가 등록한 아이템만 삭제 가능하도록 변경
  try {
    const userId = req.user.id;
    const itemId = req.params.id;

    const [result] = await pool.query( //SQL문을 통해 아이템아이디와 해당아이템의 유저id가 내가보낸 아이템 아이디와 내 토큰의 유저id와 맞지 않으면 삭제 불가능하다.
      `
      DELETE FROM items
      WHERE id = ? AND user_id = ?  
      `,
      [itemId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(403).json({ message: '삭제 권한이 없거나 아이템이 존재하지 않습니다.' });
    }

    res.json({ message: '아이템이 삭제되었습니다.' });
  } catch (error) {
    console.error('DELETE /items/:id error:', error);
    res.status(500).json({ message: '아이템 삭제 중 서버 오류가 발생했습니다.' });
  }
});

//아이템 수정 // 아이템 아이디와 그 아이템아이디의 유저 아이디가 req.user.id와 모두 동일해야만 수정 가능하도록 변경
router.put('/items/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const itemId = req.params.id;

    const {
      name,
      description,
      category,
      sub_category,
      color,
      material,
      fit,
      season,
      style,
      image_url,
    } = req.body;

    if (!name) {
      return res.status(400).json({ message: '아이템 이름은 필수입니다.' });
    }

    const [result] = await pool.query(
      `
      UPDATE items
      SET
        name = ?,
        description = ?,
        category = ?,
        sub_category = ?,
        color = ?,
        material = ?,
        fit = ?,
        season = ?,
        style = ?,
        image_url = ?
      WHERE id = ? AND user_id = ?
      `,
      [
        name,
        toNull(description),
        toNull(category),
        toNull(sub_category),
        toNull(color),
        toNull(material),
        toNull(fit),
        toNull(season),
        toNull(style),
        toNull(image_url),
        itemId,
        userId,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(403).json({ message: '수정 권한이 없거나 아이템이 존재하지 않습니다.' });
    }

    res.json({
      message: '아이템이 수정되었습니다.',
      id: Number(itemId),
      name,
      description: toNull(description),
      category: toNull(category),
      sub_category: toNull(sub_category),
      color: toNull(color),
      material: toNull(material),
      fit: toNull(fit),
      season: toNull(season),
      style: toNull(style),
      image_url: toNull(image_url),
    });
  } catch (error) {
    console.error('PUT /items/:id error:', error);
    res.status(500).json({ message: '아이템 수정 중 서버 오류가 발생했습니다.' });
  }
});

// 아이템 이미지 업로드
router.post('/items/:id/image', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const userId = req.user.id;
    const itemId = req.params.id;

    if (!req.file) {
      return res.status(400).json({
        message: '업로드할 이미지 파일이 필요합니다.',
      });
    }

    // 1. 이 아이템이 정말 로그인한 사용자의 아이템인지 확인
    const [items] = await pool.query(
      `
      SELECT id
      FROM items
      WHERE id = ? AND user_id = ?
      `,
      [itemId, userId]
    );

    if (items.length === 0) {
      return res.status(403).json({
        message: '이미지 업로드 권한이 없거나 아이템이 존재하지 않습니다.',
      });
    }

    // 2. S3 object key 생성
    const ext = getFileExtension(req.file.originalname);
    const randomName = crypto.randomUUID();

    const objectKey = `users/${userId}/items/${itemId}/${randomName}${ext}`;

    // 3. S3 업로드
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: objectKey,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      })
    );

    // 4. S3 URL 생성
    const imageUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'ap-northeast-2'}.amazonaws.com/${objectKey}`;

    // 5. DB image_url 업데이트
    await pool.query(
      `
      UPDATE items
      SET image_url = ?
      WHERE id = ? AND user_id = ?
      `,
      [imageUrl, itemId, userId]
    );

    res.status(201).json({
      message: '이미지 업로드 성공',
      item_id: Number(itemId),
      image_url: imageUrl,
    });
  } catch (error) {
    console.error('POST /items/:id/image error:', error);

    res.status(500).json({
      message: '이미지 업로드 중 서버 오류가 발생했습니다.',
    });
  }
});

router.get('/me', authMiddleware, (req, res) => {
  res.json({
    message: '인증 성공',
    user: req.user,
  });
});

module.exports = router;