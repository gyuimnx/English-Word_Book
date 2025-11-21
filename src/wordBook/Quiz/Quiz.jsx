import React, { useState, useEffect } from "react";
import "./Quiz.css";
import { Link } from "react-router-dom";
import api from "../../api";

function Quiz() {

    const [bringChapters, setBringChapters] = useState([]); 
    const [selectedChapter, setSelectedChapter] = useState(null); // 선택된 챕터

    // 퀴즈 진행 관련 상태
    const [wordsInChapter, setWordsInChapter] = useState([]); // 퀴즈 단어 목록
    const [quizMode, setQuizMode] = useState('random'); // 퀴즈 모드
    const [quizIndex, setQuizIndex] = useState(0); // 현재 문제 인덱스
    const [userAnswer, setUserAnswer] = useState(''); // 입력한 답
    const [isChecking, setIsChecking] = useState(false); // 정답 확인 중 여부
    const [quizResults, setQuizResults] = useState([]); // 퀴즈 결과 기록
    const [isQuizDone, setIsQuizDone] = useState(false); // 퀴즈 종료 여부
    const [openChapter, setOpenChapter] = useState(false); // 챕터 선택 모달

    const [quizEnd, setQuizEnd] = useState(false); // 퀴즈 종료됐는가

    const fetchChapters = async () => {
        try {
            const response = await api.get('/chapters');
            setBringChapters(response.data.chapters || []);
        } catch (error) {
            console.error('퀴즈 챕터 목록 조회 실패:', error);
        }
    };

    useEffect(() => {
        fetchChapters();
    }, []);

    const fetchWordsForChapter = async (chapterId) => {
        try {
            const response = await api.get(`/words/${chapterId}`);
            return response.data.words || []; 
        } catch (error) {
            console.error(`챕터 ${chapterId}의 단어 로드 실패:`, error);
            return [];
        }
    }

    // 퀴즈 시작
    const handleStartQuiz = async () => {
        if (!selectedChapter) {
            alert('챕터를 선택해주세요.');
            return;
        }

        // 선택된 챕터의 단어를 DB에서 불러옴
        const wordsToQuiz = await fetchWordsForChapter(selectedChapter.chapter_id);

        if (wordsToQuiz.length === 0) {
            alert('선택된 챕터에 단어가 없습니다.');
            return;
        }

        const unmemorizedWords = wordsToQuiz.filter(word => !word.is_memorized);

        if (unmemorizedWords.length === 0) {
            alert('선택된 챕터의 모든 단어를 이미 암기했습니다!');
            return;
        }

        let initialQuizWords = unmemorizedWords;

        // 단어 랜덤 섞기
        if (quizMode === 'random') {
            initialQuizWords = [...unmemorizedWords].sort(() => Math.random() - 0.5);
        }

        setWordsInChapter(initialQuizWords); 
        setQuizIndex(0);
        setQuizResults([]);
        setIsQuizDone(false);
        setOpenChapter(false);
    };

    // 정답 확인
    const handleCheckAnswer = () => {
        if (isChecking || userAnswer.trim() === '') return;

        const currentWord = wordsInChapter[quizIndex];
        // 대소문자, 공백 무시
        const isCorrect = userAnswer.trim().toLowerCase() === currentWord.korean.trim().toLowerCase();

        setQuizResults(prev => [...prev, {
            wordId: currentWord.word_id,
            userAnswer: userAnswer.trim(),
            correctAnswer: currentWord.korean,
            correct: isCorrect
        }]);
        setIsChecking(true);
    };

    // 다음 단어
    const handleNextWord = () => {
        if (!isChecking) return;

        if (quizIndex < wordsInChapter.length - 1) {
            setQuizIndex(prev => prev + 1);
            setUserAnswer('');
            setIsChecking(false);
        } else {
            setIsQuizDone(true);
        }
    };

    //챕터 선택
    const handleChapterSelect = (chapter) => {
        setSelectedChapter(chapter);
    };

    const handleGoHome = () => {
        setSelectedChapter(null);
        setWordsInChapter([]);
        setQuizResults([]);
        setQuizIndex(0);
        setIsQuizDone(false);
        setUserAnswer('');
        setIsChecking(false);
        setOpenChapter(false);
    };

    const handleInputKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // 폼 제출 등 기본 동작 방지
            if (isChecking) {
                // 정답 확인 상태 -> 다음 단어
                handleNextWord();
            } else {
                // 입력 중이 -> 정답 확인
                handleCheckAnswer();
            }
        }
    };

    return (
        <div className="Quiz_container">
            <header className="QuizHeader">
                <Link to={'/Chapter'} className="BackBtn">
                    <img className="BackImg" src="/img/arrow.png" alt="back" />
                </Link>
                <h1>Quiz</h1>
            </header>

            {openChapter && (
                <div className="QuizModalOverlay" onClick={() => setOpenChapter(false)}>
                    <div className="QuizModal" onClick={e => e.stopPropagation()}>
                        <h2>챕터 선택</h2>
                        {bringChapters.length === 0 ? (
                            <div className="ChapterEmpty">
                                등록된 챕터가 없습니다.
                                <br />
                                <Link to="/Chapter">챕터 만들러 가기</Link>
                            </div>
                        ) : (
                            <select
                                className="ChapterSelect"
                                value={selectedChapter?.chapter_id || ''}
                                onChange={(e) => {
                                    const selectedId = parseInt(e.target.value);
                                    const chapter = bringChapters.find(ch => ch.chapter_id === selectedId);
                                    setSelectedChapter(chapter);
                                }}
                            >
                                <option value="" disabled>챕터를 선택하세요</option>
                                {bringChapters.map((chapter) => (
                                    <option key={chapter.chapter_id} value={chapter.chapter_id}>
                                        {chapter.name}
                                    </option>
                                ))}
                            </select>
                        )}

                        <div className="QuizMode">
                            <label>
                                <input
                                    type="radio"
                                    name="quizMode"
                                    value="random"
                                    checked={quizMode === 'random'}
                                    onChange={() => setQuizMode('random')}
                                /> 랜덤 순서
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="quizMode"
                                    value="order"
                                    checked={quizMode === 'order'}
                                    onChange={() => setQuizMode('order')}
                                /> 순서대로
                            </label>
                        </div>
                        <button className="StartBtn" onClick={handleStartQuiz} disabled={!selectedChapter}>퀴즈 시작</button>
                    </div>
                </div>
            )}

            <div className="QuizBody">
                {wordsInChapter.length === 0 && !isQuizDone && (
                    <button
                        className="SelectChapterBtn"
                        onClick={() => setOpenChapter(true)}
                    >
                        퀴즈 시작 / 챕터 선택
                    </button>
                )}

                {wordsInChapter.length > 0 && !isQuizDone && (
                    <div className="QuizArea">
                        <p className="WordCount">{quizIndex + 1} / {wordsInChapter.length}</p>
                        <h2 className="QuizWord">{wordsInChapter[quizIndex].english}</h2>

                        <input
                            className="AnswerInput"
                            type="text"
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            placeholder="단어의 뜻을 입력하세요"
                            onKeyDown={handleInputKeyDown}
                            readOnly={isChecking}

                            autoFocus
                        />

                        <div className="CheckResult" style={{ color: isChecking ? (quizResults[quizIndex]?.correct ? 'green' : 'red') : 'transparent' }}>
                            {isChecking && (quizResults[quizIndex]?.correct ? '정답!' : `오답: ${wordsInChapter[quizIndex].korean}`)}
                        </div>

                        <div className="QuizBtnContainer">
                            <button className="CheckBtn" onClick={handleCheckAnswer} disabled={isChecking}>정답 확인</button>
                            <button className="NextBtn" onClick={handleNextWord} disabled={!isChecking}>다음 단어</button>
                        </div>
                    </div>
                )}

                {isQuizDone && (
                    <div className="QuizResult">
                        <h2>퀴즈 종료!</h2>
                        <p>정답률: {Math.round((quizResults.filter(r => r.correct).length / wordsInChapter.length) * 100)}%</p>
                        <ul>
                            {quizResults.map((result, index) => (
                                <li key={index} className={result.correct ? 'correct' : 'incorrect'}>
                                    {wordsInChapter[index].english}: {wordsInChapter[index].korean}
                                    <span>{result.correct ? ' (O)' : ` (X - 입력: ${result.userAnswer})`}</span>
                                </li>
                            ))}
                        </ul>
                        <button className="GoHomeBtn" onClick={handleGoHome}>Quiz Home</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Quiz;