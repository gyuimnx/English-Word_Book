const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    let token;
    // HTTP 헤더의 'Authorization'에서 토큰 추출(Bearer <token> 형식)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        // 토큰이 없으면 인증 실패(401 오류)
        return res.status(401).json({ message: '인증 실패: 로그인이 필요합니다.' });
    }

    try {
        // 토큰 검증 및 디코드
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 요청 객체에 사용자 ID 추가(이 ID로 개인화된 DB 쿼리를 수행)
        req.user_id = decoded.user_id;
        next(); 

    } catch (err) {
        // 토큰이 유효하지 않거나 만료된 경우
        return res.status(401).json({ message: '인증 실패: 유효하지 않거나 만료된 토큰입니다.' });
    }
};

module.exports = protect;