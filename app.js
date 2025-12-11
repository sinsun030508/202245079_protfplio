// app.js
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const reflectionRoutes = require('./routes/reflectionRoutes');

const app = express();

// View 엔진 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 미들웨어
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'session_secret',
    resave: false,
    saveUninitialized: false
  })
);

// 로그인 정보 view 에서 사용 가능하게
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

// 라우트
app.use('/', authRoutes);
app.use('/', portfolioRoutes);
app.use('/', reflectionRoutes);

// 404 처리
app.use((req, res) => {
  res.status(404).send('페이지를 찾을 수 없습니다.');
});

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
