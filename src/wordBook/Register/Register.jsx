import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Register.css';

// const BASE_URL = 'http://localhost:5000/api/auth'; 

// const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const API_URL = process.env.REACT_APP_API_URL || 'https://port-0-english-word-book-micui602660e6a2b.sel3.cloudtype.app/Login';
const BASE_URL = `${API_URL}/api/auth`;

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${BASE_URL}/register`, { username, password });
            
            alert(response.data.message + ' 로그인 페이지로 이동합니다.');
            navigate('/Login'); 

        } catch (error) {
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