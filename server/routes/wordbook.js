// server/routes/wordbook.js

const express = require('express');
const router = express.Router();
const db = require('../config/db');
const protect = require('../middleware/auth'); // ✨ JWT 인증 미들웨어

// 이 라우터의 모든 경로에 JWT 인증 미들웨어를 적용합니다.
router.use(protect); 

// ----------------------------------------------------
// [1] 챕터 목록 조회 (GET /api/wordbook/chapters)
// ----------------------------------------------------
router.get('/chapters', async (req, res) => {
    // req.user_id: 미들웨어에서 추출된 현재 로그인 사용자의 ID
    const user_id = req.user_id; 

    try {
        const sql = 'SELECT chapter_id, name FROM Chapters WHERE user_id = ? ORDER BY chapter_id ASC';
        const [chapters] = await db.query(sql, [user_id]);
        res.json({ chapters });
    } catch (error) {
        console.error('챕터 조회 에러:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// ----------------------------------------------------
// [2] 새 챕터 추가 (POST /api/wordbook/chapters)
// ----------------------------------------------------
router.post('/chapters', async (req, res) => {
    const user_id = req.user_id;
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ message: '챕터 이름을 입력해주세요.' });
    }

    try {
        const sql = 'INSERT INTO Chapters (user_id, name) VALUES (?, ?)';
        const [result] = await db.query(sql, [user_id, name]);

        // 클라이언트에게 새로 생성된 챕터 정보를 반환하여 프론트엔드 목록을 즉시 업데이트할 수 있도록 합니다.
        res.status(201).json({ 
            message: '챕터가 성공적으로 추가되었습니다.', 
            chapter_id: result.insertId,
            newChapter: { chapter_id: result.insertId, name } 
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: '이미 같은 이름의 챕터가 있습니다.' });
        }
        console.error('챕터 추가 에러:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// ----------------------------------------------------
// [3] 특정 챕터의 단어 목록 조회 (GET /api/wordbook/words/:chapterId)
// ----------------------------------------------------
router.get('/words/:chapterId', async (req, res) => {
    const user_id = req.user_id;
    const { chapterId } = req.params;

    try {
        // 1. 보안 검사: 요청된 챕터가 이 사용자의 소유인지 확인 (필수)
        const [chapterCheck] = await db.query('SELECT chapter_id FROM Chapters WHERE chapter_id = ? AND user_id = ?', [chapterId, user_id]);
        
        if (chapterCheck.length === 0) {
            return res.status(404).json({ message: '해당 챕터를 찾을 수 없거나 접근 권한이 없습니다.' });
        }

        // 2. 단어 목록 조회
        const [words] = await db.query(
            'SELECT word_id, english_word, korean_meaning, is_memorized FROM Words WHERE chapter_id = ? ORDER BY word_id ASC', 
            [chapterId]
        );
        res.json({ words });
    } catch (error) {
        console.error('단어 목록 조회 에러:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});


// ----------------------------------------------------
// [4] 단어 추가 (POST /api/wordbook/words)
// ----------------------------------------------------
router.post('/words', async (req, res) => {
    const user_id = req.user_id;
    const { chapter_id, english_word, korean_meaning } = req.body;

    if (!chapter_id || !english_word || !korean_meaning) {
        return res.status(400).json({ message: '필수 필드를 모두 입력해주세요.' });
    }

    try {
        // 보안 검사: 챕터 소유자 확인
        const [chapterCheck] = await db.query('SELECT chapter_id FROM Chapters WHERE chapter_id = ? AND user_id = ?', [chapter_id, user_id]);
        
        if (chapterCheck.length === 0) {
            return res.status(403).json({ message: '단어를 추가할 권한이 없습니다.' });
        }

        // 단어 DB에 추가
        const sql = 'INSERT INTO Words (chapter_id, english_word, korean_meaning) VALUES (?, ?, ?)';
        const [result] = await db.query(sql, [chapter_id, english_word, korean_meaning]);

        res.status(201).json({ 
            message: '단어가 성공적으로 추가되었습니다.', 
            word_id: result.insertId 
        });
    } catch (error) {
        console.error('단어 추가 에러:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});


// ----------------------------------------------------
// [5] 단어 암기 상태 토글 (PUT /api/wordbook/words/:wordId/toggle)
// ----------------------------------------------------
router.put('/words/:wordId/toggle', async (req, res) => {
    const user_id = req.user_id;
    const { wordId } = req.params;
    
    try {
        // 단어의 현재 상태와 소유 챕터의 사용자 ID를 확인하여 권한 체크
        const [words] = await db.query(
            'SELECT W.is_memorized, C.user_id FROM Words W JOIN Chapters C ON W.chapter_id = C.chapter_id WHERE W.word_id = ?',
            [wordId]
        );

        if (words.length === 0 || words[0].user_id !== user_id) {
            return res.status(404).json({ message: '해당 단어를 찾을 수 없거나 권한이 없습니다.' });
        }

        const newMemorizedState = !words[0].is_memorized;

        // 상태 업데이트
        const sql = 'UPDATE Words SET is_memorized = ? WHERE word_id = ?';
        await db.query(sql, [newMemorizedState, wordId]);

        res.json({ 
            message: `단어 암기 상태가 ${newMemorizedState ? '암기됨' : '미암기'}으로 변경되었습니다.`,
            is_memorized: newMemorizedState
        });

    } catch (error) {
        console.error('단어 상태 토글 에러:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});


// ----------------------------------------------------
// [6] 단어 삭제 (DELETE /api/wordbook/words/:wordId)
// ----------------------------------------------------
router.delete('/words/:wordId', async (req, res) => {
    const user_id = req.user_id;
    const { wordId } = req.params;

    try {
        // 보안 검사: 단어의 소유자 확인
        const [check] = await db.query(
            'SELECT W.word_id FROM Words W JOIN Chapters C ON W.chapter_id = C.chapter_id WHERE W.word_id = ? AND C.user_id = ?',
            [wordId, user_id]
        );

        if (check.length === 0) {
            return res.status(403).json({ message: '단어를 삭제할 권한이 없습니다.' });
        }

        // 단어 삭제 실행
        const sql = 'DELETE FROM Words WHERE word_id = ?';
        await db.query(sql, [wordId]);

        res.status(200).json({ message: '단어가 성공적으로 삭제되었습니다.' });
    } catch (error) {
        console.error('단어 삭제 에러:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});


module.exports = router;