import React from 'react';
import { Navigate } from 'react-router-dom';


//JWT 토큰 존재 여부를 확인하여, 토큰이 있으면 요청된 페이지를 렌더링하고, 없으면 로그인 페이지로 리다이렉트
function AuthRoute({ element: Element, ...rest }) {
    // 로컬 스토리지에서 백엔드가 발급한 JWT 토큰을 확인
    const isAuthenticated = localStorage.getItem('userToken');

    // 토큰이 있으면 <Chapter/>, <Word/> 같은 요청 컴포넌트를 렌더링
    if (isAuthenticated) {
        // 실제 렌더링될 컴포넌트
        return <Element {...rest} />;
    }

    // 토큰이 없으면 /Login 경로로 강제 리다이렉트
    return <Navigate to="/Login" replace />;
}

export default AuthRoute;