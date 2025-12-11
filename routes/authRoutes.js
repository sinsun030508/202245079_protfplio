// routes/authRoutes.js
const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../config/db');

const router = express.Router();

// 메인 페이지: 포트폴리오 목록으로 리다이렉트
router.get('/', async (req, res) => {
  res.redirect('/portfolio');
});

// 회원가입 화면
router.get('/register', (req, res) => {
  res.render('register');
});

// 회원가입 처리
router.post('/register', async (req, res) => {
  const { student_id, name, email, password } = req.body;

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ? OR student_id = ?', [
      email,
      student_id
    ]);

    if (rows.length > 0) {
      return res.render('register', { error: '이미 존재하는 학번 또는 이메일입니다.' });
    }

    const hash = await bcrypt.hash(password, 10);

    await db.query(
      'INSERT INTO users (student_id, name, email, password_hash) VALUES (?, ?, ?, ?)',
      [student_id, name, email, hash]
    );

    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.render('register', { error: '회원가입 중 오류가 발생했습니다.' });
  }
});

// 로그인 화면
router.get('/login', (req, res) => {
  res.render('login');
});

// 로그인 처리
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.render('login', { error: '이메일 또는 비밀번호가 잘못되었습니다.' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.render('login', { error: '이메일 또는 비밀번호가 잘못되었습니다.' });
    }

    // 세션에 사용자 정보 저장
    req.session.user = {
      user_id: user.user_id,
      student_id: user.student_id,
      name: user.name,
      email: user.email
    };

    res.redirect('/portfolio');
  } catch (err) {
    console.error(err);
    res.render('login', { error: '로그인 중 오류가 발생했습니다.' });
  }
});

// 로그아웃
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router;
