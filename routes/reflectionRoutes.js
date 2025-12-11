// routes/reflectionRoutes.js
const express = require('express');
const db = require('../config/db');
const { requireLogin } = require('../middleware/auth');

const router = express.Router();

// 소감 목록 + 간단한 입력 링크
router.get('/reflections', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.*, u.name AS user_name
       FROM reflections r
       JOIN users u ON r.user_id = u.user_id
       ORDER BY r.created_at DESC`
    );

    res.render('reflections', { reflections: rows });
  } catch (err) {
    console.error(err);
    res.status(500).send('소감 목록 조회 중 오류 발생');
  }
});

// 소감 작성 화면 (로그인 필요)
router.get('/reflections/new', requireLogin, (req, res) => {
  res.render('reflection_form');
});

// 소감 작성 처리
router.post('/reflections/new', requireLogin, async (req, res) => {
  const { title, content } = req.body;
  const userId = req.session.user.user_id;

  try {
    await db.query(
      'INSERT INTO reflections (user_id, title, content) VALUES (?, ?, ?)',
      [userId, title, content]
    );

    res.redirect('/reflections');
  } catch (err) {
    console.error(err);
    res.status(500).send('소감 등록 중 오류 발생');
  }
});

module.exports = router;
