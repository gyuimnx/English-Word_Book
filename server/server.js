require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./db'); 
const authRoutes = require('./routes_auth');
const wordbookRoutes = require('./wordbook');

const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어
const corsOptions = {
    origin: [
        'http://localhost:3000', // 로컬 개발용
        process.env.CLIENT_URL   // 배포된 프론트엔드 주소(나중에 클라우드타입에서 설정)
    ], 
    credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get('/', (req, res) => {
    res.send('English Wordbook Server is running!');
});

// 인증 라우터 연결 (로그인/회원가입)
app.use('/api/auth', authRoutes); 

// 단어장 라우터 연결 (JWT 토큰 필요)
app.use('/api/wordbook', wordbookRoutes);

db.getConnection()
    .then(connection => {
        console.log('MySQL 연결 완료'); // 성공하면 이 메시지 나옴
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