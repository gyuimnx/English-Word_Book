import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import './Word.css';
import api from '../../api';

function Word() {
    const { chapterName } = useParams();
    const location = useLocation();

    const chapterId = location.state?.chapterId;

    const navigate = useNavigate();
    const [words, setWords] = useState([]);
    const [newWord, setNewWord] = useState({ english: '', korean: '' });
    const [isAddingWord, setIsAddingWord] = useState(false);

    const [loading, setLoading] = useState(true); // 로딩 상태

    const fetchWords = async () => {
        if (!chapterId) {
            setLoading(false);
            navigate('/Chapter'); // ID가 없으면 챕터 목록으로 돌려보내기
            return;
        }

        try {
            setLoading(true); // GET / api/wordbook/words/:chapterId 요청
            const response = await api.get(`/words/${chapterId}`);
            // 응답 구조가 { words: [...] } 이므로 .words에 접근
            setWords(response.data.words || []);
        } catch (error) {
            console.error("단어 목록 조회 실패:", error);
            alert("단어 목록을 불러오는 데 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { // chapterID가 변경될 때 실행
        fetchWords();
    }, [chapterId]);

    // 단어 추가
    const handleAddWord = async (e) => {
        e.preventDefault();
        if (!newWord.english.trim() || !newWord.korean.trim()) {
            alert("단어와 뜻을 모두 입력해주세요.");
            return;
        }

        const wordDate = {
            chapter_id: chapterId,
            english: newWord.english.trim(),
            korean: newWord.korean.trim(),
        };

        try {
            const response = await api.post('/words', wordDate); // POST /api/wordbook/words 요청
            fetchWords(); //성공 후 목록을 갱신하기 위해 다시 조회
            setNewWord({ english: '', korean: '' });
            setIsAddingWord(false);
            alert(response.date.message);
        } catch (error) {
            const message = error.response?.data?.message || '단어 추가 실패';
            alert(message);
        }
    };

    const handleDeleteWord = async (wordId) => {
        if (!window.confirm('단어를 삭제하시겠습니까?')) {
            return;
        }

        try {
            await api.delete(`/words/${wordId}`);
            setWords(prev => prev.filter(word => word.word_id !== wordId));
            alert('단어가 삭제되었습니다.');
        } catch (error) {
            console.error('단어 삭제 실패:', error);
            alert('단어 삭제에 실패했습니다.');
        }
    }

    const handleCorrWord = async (wordId, currentMean) => {
        alert("구현중")
    }

    const goToHome = () => navigate('/Chapter');

    if (loading) return <div className="Word_loading">Loading...</div>;

    return (
        <div className="Wodr_container">
            <div className="Word">
                <header className="WordHeader">
                    <button className="BackBtn" onClick={goToHome}>
                        <img className="BackImg" src="/img/arrow.png" alt="back" />
                    </button>
                    <h1>{decodeURIComponent(chapterName)}</h1>
                    <button className="AddWordBtn" onClick={() => setIsAddingWord(true)}>
                        New
                    </button>
                </header>

                {isAddingWord && (
                    <div className="WordModalOverlay">
                        <div className="WordModal">
                            <h2>New Word</h2>
                            <form onSubmit={handleAddWord}>
                                <input
                                    type="text"
                                    placeholder="단어"
                                    value={newWord.english}
                                    onChange={(e) => setNewWord({ ...newWord, english: e.target.value })}
                                    className="WordBar"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="의미"
                                    value={newWord.korean}
                                    onChange={(e) => setNewWord({ ...newWord, korean: e.target.value })}
                                    className="MeanBar"
                                    required
                                />
                                <div className="FormButtons">
                                    <button type="submit" className="SubmitBtn">추가</button>
                                    <button
                                        type="button"
                                        className="CancelBtn"
                                        onClick={() => setIsAddingWord(false)}
                                    >
                                        취소
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <div className="WordList">
                    {words.length === 0 ? (
                        <h2 className="EmptyMessage">등록된 단어가 없습니다.</h2>
                    ) : (
                        <div className="WordItems">
                            {words.map((word) => (
                                <div key={word.word_id} className="WordItem">
                                    <div className="WordContent">
                                        <span className="WordText">{word.english}</span>
                                        <span className="WordMeaning">{word.korean}</span>
                                    </div>
                                    <div className="WordBtns">
                                        <button
                                            className="CorrWordBtn"
                                            onClick={() => {
                                                handleCorrWord(word.word_id, word.korean);
                                            }}
                                        >
                                            수정
                                        </button>
                                        <button
                                            className="DeleteWordBtn"
                                            onClick={() => {
                                                if (window.confirm('단어를 삭제하시겠습니까?')) {
                                                    handleDeleteWord(word.word_id);
                                                }
                                            }}
                                        >
                                            삭제
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Word;
