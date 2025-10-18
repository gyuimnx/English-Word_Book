// src/wordBook/Register/Register.js

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Register.css'; // ✨ CSS 임포트

const BASE_URL = 'http://localhost:5000/api/auth'; 

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            // 백엔드의 POST /api/auth/register API 호출
            const response = await axios.post(`${BASE_URL}/register`, { username, password });
            
            alert(response.data.message + ' 이제 로그인해 주세요.');
            navigate('/Login'); // 회원가입 성공 후 로그인 페이지로 이동

        } catch (error) {
            // 백엔드에서 보낸 에러 메시지 처리 (e.g., ID 중복 등)
            const message = error.response?.data?.message || '회원가입 중 오류가 발생했습니다.';
            alert(message);
        }
    };

    return (
        <div className="auth-container">
            <h2>회원가입</h2>
            <form onSubmit={handleRegister}>
                <input 
                    type="text" 
                    placeholder="아이디" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    required 
                />
                <input 
                    type="password" 
                    placeholder="비밀번호" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                />
                <button type="submit">회원가입</button>
            </form>
            <p>
                이미 계정이 있으신가요? <button onClick={() => navigate('/Login')}>로그인</button>
            </p>
        </div>
    );
}

export default Register;