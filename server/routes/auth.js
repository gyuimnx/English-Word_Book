// server/routes/auth.js

const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 
const moment = require('moment'); 

const JWT_SECRET = process.env.JWT_SECRET;
const MAX_LOGIN_ATTEMPTS = 5;

// ✨ 수정: 잠금 시간을 60초로 설정합니다.
const LOCK_TIME_UNIT = 'seconds'; 
const LOCK_TIME_VALUE = 60; 

// 메시지에 표시할 단위
const LOCK_UNIT_DISPLAY = LOCK_TIME_UNIT === 'minutes' ? '분' : '초';


// ----------------------------------------------------
// [1] 회원가입 (POST /api/auth/register)
// ----------------------------------------------------
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: '아이디와 비밀번호를 모두 입력해주세요.' });
    }

    try {
        // 아이디 중복 확인
        let [rows] = await db.query('SELECT username FROM Users WHERE username = ?', [username]);
        if (rows.length > 0) {
            return res.status(409).json({ message: '이미 존재하는 아이디입니다.' }); 
        }

        // 비밀번호 해싱 (보안 필수)
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // DB에 사용자 정보 저장
        await db.query('INSERT INTO Users (username, password_hash) VALUES (?, ?)', [username, password_hash]);
        res.status(201).json({ message: '회원가입 성공!' });

    } catch (error) {
        console.error('회원가입 에러:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});


// ----------------------------------------------------
// [2] 로그인 (POST /api/auth/login)
// ----------------------------------------------------
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: '아이디와 비밀번호를 모두 입력해주세요.' });
    }

    try {
        // 1. 사용자 정보 조회
        let [users] = await db.query('SELECT * FROM Users WHERE username = ?', [username]);
        if (users.length === 0) {
            return res.status(401).json({ message: '아이디 또는 비밀번호가 올바르지 않습니다.' });
        }

        const user = users[0];
        const now = moment();

        // 2. 계정 잠금 상태 확인
        if (user.lock_until && moment(user.lock_until).isAfter(now)) {
            const lockTime = moment(user.lock_until);
            const remainingSeconds = lockTime.diff(now, 'seconds');
            // 잠금 상태 메시지
            return res.status(403).json({ message: `로그인 실패 ${MAX_LOGIN_ATTEMPTS}회로 인해 계정이 잠금되었습니다. ${remainingSeconds + 1}초 후 다시 시도해주세요.` });
        }
        
        // 3. 비밀번호 해싱 값 비교
        const isMatch = await bcrypt.compare(password, user.password_hash);
        
        if (isMatch) {
            // 4. 로그인 성공: 시도 횟수 초기화 및 JWT 토큰 발급
            await db.query('UPDATE Users SET login_attempts = 0, lock_until = NULL WHERE user_id = ?', [user.user_id]);
            
            const token = jwt.sign(
                { user_id: user.user_id, username: user.username }, 
                JWT_SECRET, 
                { expiresIn: '1d' } 
            );

            res.json({ 
                message: '로그인 성공! 환영합니다.', 
                token, 
                user: { id: user.user_id, username: user.username } 
            });

        } else {
            // 5. 로그인 실패: 시도 횟수 증가 및 잠금 로직 실행
            let newAttempts = user.login_attempts + 1;
            let lockUntil = null;
            let message = '아이디 또는 비밀번호가 올바르지 않습니다.';
            
            if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
                // ✨ 수정된 잠금 시간 변수를 사용하여 잠금 시간 설정
                lockUntil = moment().add(LOCK_TIME_VALUE, LOCK_TIME_UNIT).format('YYYY-MM-DD HH:mm:ss');
                newAttempts = MAX_LOGIN_ATTEMPTS; 
                
                // 잠금 메시지
                message = `비밀번호 ${MAX_LOGIN_ATTEMPTS}회 실패! 계정이 ${LOCK_TIME_VALUE}${LOCK_UNIT_DISPLAY} 동안 잠금됩니다.`;
            } else {
                const remaining = MAX_LOGIN_ATTEMPTS - newAttempts;
                message += ` (실패 ${newAttempts}/${MAX_LOGIN_ATTEMPTS}회. ${remaining}회 더 실패하면 잠금됩니다.)`;
            }

            await db.query('UPDATE Users SET login_attempts = ?, lock_until = ? WHERE user_id = ?', [newAttempts, lockUntil, user.user_id]);
            res.status(401).json({ message });
        }

    } catch (error) {
        console.error('로그인 에러:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

module.exports = router;