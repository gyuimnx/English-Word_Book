// server/config/db.js
const mysql = require('mysql2/promise');

// .env 파일의 환경 변수를 사용하여 DB 연결 풀을 설정합니다.
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;