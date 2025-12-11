const express = require('express');
const db = require('../config/db');
const { requireLogin } = require('../middleware/auth');

const router = express.Router();

// 1) 포트폴리오 목록 (공개된 것만)
router.get('/portfolio', async (req, res) => {
  try {
    const [items] = await db.query(
      `SELECT p.*, u.name AS user_name
       FROM portfolio_items p
       JOIN users u ON p.user_id = u.user_id
       WHERE p.is_public = 1
       ORDER BY p.created_at DESC`
    );

    res.render('index', { items });
  } catch (err) {
    console.error(err);
    res.status(500).send('포트폴리오 목록 조회 중 오류 발생');
  }
});

// 2) 포트폴리오 등록 화면 (★ /portfolio/:id 보다 위에!)
router.get('/portfolio/new', requireLogin, (req, res) => {
  res.render('portfolio_form', { item: null, action: 'create' });
});

// 3) 포트폴리오 등록 처리
router.post('/portfolio/new', requireLogin, async (req, res) => {
  const { title, summary, content, category, github_url, demo_url, is_public } = req.body;
  const userId = req.session.user.user_id;

  try {
    await db.query(
      `INSERT INTO portfolio_items
       (user_id, title, summary, content, category, github_url, demo_url, is_public)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        title,
        summary || null,
        content,
        category || 'PROJECT',
        github_url || null,
        demo_url || null,
        is_public ? 1 : 0
      ]
    );

    res.redirect('/portfolio');
  } catch (err) {
    console.error(err);
    res.status(500).send('포트폴리오 등록 중 오류 발생');
  }
});

// 4) 포트폴리오 수정 화면 (★ 이것도 /:id 위에!)
router.get('/portfolio/:id/edit', requireLogin, async (req, res) => {
  const { id } = req.params;
  const userId = req.session.user.user_id;

  try {
    const [rows] = await db.query(
      'SELECT * FROM portfolio_items WHERE item_id = ? AND user_id = ?',
      [id, userId]
    );

    if (rows.length === 0) {
      return res.status(403).send('수정 권한이 없습니다.');
    }

    res.render('portfolio_form', { item: rows[0], action: 'edit' });
  } catch (err) {
    console.error(err);
    res.status(500).send('포트폴리오 수정 화면 조회 중 오류 발생');
  }
});

// 5) 포트폴리오 수정 처리
router.post('/portfolio/:id/edit', requireLogin, async (req, res) => {
  const { id } = req.params;
  const { title, summary, content, category, github_url, demo_url, is_public } = req.body;
  const userId = req.session.user.user_id;

  try {
    const [rows] = await db.query(
      'SELECT * FROM portfolio_items WHERE item_id = ? AND user_id = ?',
      [id, userId]
    );

    if (rows.length === 0) {
      return res.status(403).send('수정 권한이 없습니다.');
    }

    await db.query(
      `UPDATE portfolio_items
       SET title = ?, summary = ?, content = ?, category = ?, github_url = ?, demo_url = ?, is_public = ?
       WHERE item_id = ?`,
      [
        title,
        summary || null,
        content,
        category || 'PROJECT',
        github_url || null,
        demo_url || null,
        is_public ? 1 : 0,
        id
      ]
    );

    res.redirect(`/portfolio/${id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('포트폴리오 수정 중 오류 발생');
  }
});

// 6) 포트폴리오 삭제
router.post('/portfolio/:id/delete', requireLogin, async (req, res) => {
  const { id } = req.params;
  const userId = req.session.user.user_id;

  try {
    const [rows] = await db.query(
      'SELECT * FROM portfolio_items WHERE item_id = ? AND user_id = ?',
      [id, userId]
    );

    if (rows.length === 0) {
      return res.status(403).send('삭제 권한이 없습니다.');
    }

    await db.query('DELETE FROM portfolio_items WHERE item_id = ?', [id]);

    res.redirect('/portfolio');
  } catch (err) {
    console.error(err);
    res.status(500).send('포트폴리오 삭제 중 오류 발생');
  }
});

// 7) 포트폴리오 상세 (★ 가장 마지막에 둠)
router.get('/portfolio/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT p.*, u.name AS user_name
       FROM portfolio_items p
       JOIN users u ON p.user_id = u.user_id
       WHERE p.item_id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).send('해당 포트폴리오를 찾을 수 없습니다.');
    }

    res.render('portfolio_detail', { item: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send('포트폴리오 상세 조회 중 오류 발생');
  }
});

module.exports = router;
