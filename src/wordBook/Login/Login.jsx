import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';

// const BASE_URL = 'http://localhost:5000/api/auth'; // 백엔드 인증 라우트 기본 경로

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const BASE_URL = `${API_URL}/api/auth`;

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${BASE_URL}/login`, { username, password });
            
            // 로그인 성공 시 JWT 토큰이랑 사용자 정보를 로컬 스토리지에 저장
            localStorage.setItem('userToken', response.data.token);
            localStorage.setItem('username', response.data.user.username);
            
            alert(response.data.message);
            navigate('/Chapter'); 

        } catch (error) {
            const message = error.response?.data?.message || '로그인 중 오류가 발생했습니다.';
            alert(message);
        }
    };

    return (
        <div className="auth-container">
            <h2>로그인</h2>
            <form onSubmit={handleLogin}>
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
                <button type="submit">로그인</button>
            </form>
            <p>
                계정이 없으신가요? <button onClick={() => navigate('/Register')}>회원가입</button>
            </p>
        </div>
    );
}

export default Login;