// server/server.js
require('dotenv').config(); // 1. .env 파일 로드

const express = require('express');
const cors = require('cors');
const db = require('./config/db'); // 2. DB 연결 모듈 불러오기

const authRoutes = require('./routes/auth');        // ✨ 인증 라우터 불러오기
const wordbookRoutes = require('./routes/wordbook'); // ✨ 단어장 라우터 불러오기

const app = express();
const PORT = process.env.PORT || 5000;

// ----------------------------------------------------
// 미들웨어 설정
// ----------------------------------------------------

// CORS 설정: React 개발 서버(http://localhost:3000)에서 요청 허용
const corsOptions = {
    origin: 'http://localhost:3000', 
    credentials: true,
};
app.use(cors(corsOptions));

// JSON 형식의 요청 본문 파싱 설정
app.use(express.json());
// URL-encoded 본문 파싱 설정
app.use(express.urlencoded({ extended: true }));

// ----------------------------------------------------
// 라우트 정의 (수정)
// ----------------------------------------------------

// 기본 라우트
app.get('/', (req, res) => {
    res.send('English Wordbook Server is running!');
});

// ✨ 인증 라우터 연결 (로그인/회원가입)
app.use('/api/auth', authRoutes); 

// ✨ 단어장 라우터 연결 (JWT 토큰 필요)
app.use('/api/wordbook', wordbookRoutes);

// ----------------------------------------------------
// 서버 시작 및 DB 연결 테스트
// ----------------------------------------------------

db.getConnection()
    .then(connection => {
        console.log('MySQL 연결 완료');
        connection.release(); // 연결 반납
        
        app.listen(PORT, () => {
            console.log(`수신 중인 서버: ${PORT}`);
        });
    })
    .catch(err => {
        console.error('MySQL 연결 오류. .env 파일의 DB 설정 확인 필요 : ', err.message);
        console.log('DB 연결 오류로 서버 시작 실패');
        process.exit(1); // 연결 실패 시 서버 종료
    });

// npm run dev : 서버를 개발 모드로 실행 (nodemon 사용)