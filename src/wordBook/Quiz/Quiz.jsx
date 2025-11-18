import React, { useState, useEffect } from "react";
import "./Quiz.css";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api";

function Quiz() {
    // const [bringChapters, setBringChapters] = useState([]); //로컬스토리지에서 불러온 챕터들
    // const [selectedChapter, setSelectedChapter] = useState(null); //선택한 챕터

    // const [quizWord, setQuizWord] = useState([]); //퀴즈에 사용할 단어
    // const [currentWordIndex, setCurrentWordIndex] = useState(0); //현재 문제 인덱스
    // const [answer, setAnswer] = useState(""); //입력한 답
    // const [quizStart, setQuizStart] = useState(false); //퀴즈 시작했는가?
    // const [score, setScore] = useState(0); //총 정답
    // const [wrong, setWrong] = useState(0); //총 오답

    const [bringChapters, setBringChapters] = useState([]); // 챕터 목록
    const [selectedChapter, setSelectedChapter] = useState(null); // 선택된 챕터
    
    // 퀴즈 진행 관련 상태
    const [wordsInChapter, setWordsInChapter] = useState([]); // 퀴즈 단어 목록 (기존 quizWord)
    const [quizMode, setQuizMode] = useState('random'); // 퀴즈 모드
    const [quizIndex, setQuizIndex] = useState(0); // 현재 문제 인덱스 (기존 currentWordIndex)
    const [userAnswer, setUserAnswer] = useState(''); // 입력한 답 (기존 answer)
    const [isChecking, setIsChecking] = useState(false); // 정답 확인 중 여부
    const [quizResults, setQuizResults] = useState([]); // 퀴즈 결과 기록 (기존 score/wrong 포함)
    const [isQuizDone, setIsQuizDone] = useState(false); // 퀴즈 종료 여부 (기존 quizEnd)
    const [openChapter, setOpenChapter] = useState(false); // 챕터 선택 모달

    const [quizEnd, setQuizEnd] = useState(false); //퀴즈 종료됐는가

    const fetchChapters = async () => {
        try {
            // GET /api/wordbook/chapters
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
            // GET /api/wordbook/words/:chapterId
            const response = await api.get(`/words/${chapterId}`);
            return response.data.words || []; // 단어 목록 반환
        } catch (error) {
            console.error(`챕터 ${chapterId}의 단어 로드 실패:`, error);
            return [];
        }
    }


    //게임 시작 함수. shuffleArray에 선택한 챕터의 단어를 랜덤으로 배치시켜서 저장
    // const startQuiz = () => {
    //     //null이 아니고 단어 길이가 1이상이면 실행
    //     if (selectedChapter && selectedChapter.words.length > 0) {
    //         const shuffleArray = [...selectedChapter.words].sort(() => Math.random() - 0.5);
    //         setQuizWord(shuffleArray);
    //         setCurrentWordIndex(0);
    //         setQuizStart(true);
    //         setScore(0);
    //         setWrong(0);
    //     };
    // };

    // 퀴즈 시작 (기존 로직 유지 및 DB 호출 반영)
    const handleStartQuiz = async () => {
        if (!selectedChapter) {
            alert('챕터를 선택해주세요.');
            return;
        }

        // ✨ [수정] 선택된 챕터의 단어를 DB에서 불러옵니다.
        const wordsToQuiz = await fetchWordsForChapter(selectedChapter.chapter_id);
        
        if (wordsToQuiz.length === 0) {
            alert('선택된 챕터에 단어가 없습니다.');
            return;
        }

        let initialQuizWords = wordsToQuiz;
        
        // 단어를 무작위로 섞습니다 (random mode)
        if (quizMode === 'random') {
            initialQuizWords = [...wordsToQuiz].sort(() => Math.random() - 0.5); 
        }

        setWordsInChapter(initialQuizWords); // 퀴즈 단어 목록 설정
        setQuizIndex(0);
        setQuizResults([]);
        setIsQuizDone(false);
        setOpenChapter(false);
    };

    // //답변 제출 함수
    // const handleSubmitAnswer = (e) => {
    //     e.preventDefault();

    //     // 정답 확인 (대소문자 무시)
    //     if (answer.trim().toLowerCase() === quizWord[currentWordIndex].word.toLowerCase()) {
    //         setScore(prevScore => prevScore + 1);
    //     } else {
    //         setWrong(prevWrong => prevWrong + 1);
    //     }

    //     if (currentWordIndex < quizWord.length - 1) { //다음 문제로 이동
    //         setCurrentWordIndex(prevIndex => prevIndex + 1);
    //     } else {
    //         setQuizStart(false); //퀴즈 종료
    //         setQuizEnd(true); //퀴즈 종료 됐다로 바꾸기
    //     }
    //     setAnswer(''); //입력 초기화
    // };

    // 정답 확인 로직 (기존 로직 유지)
    // ----------------------------------------------------
    const handleCheckAnswer = () => {
        if (isChecking || userAnswer.trim() === '') return;

        const currentWord = wordsInChapter[quizIndex];
        // 대소문자, 공백 무시하고 비교
        const isCorrect = userAnswer.trim().toLowerCase() === currentWord.korean.trim().toLowerCase();

        setQuizResults(prev => [...prev, {
            wordId: currentWord.word_id,
            userAnswer: userAnswer.trim(),
            correctAnswer: currentWord.korean,
            correct: isCorrect
        }]);
        setIsChecking(true);
    };

    // ----------------------------------------------------
    // 다음 단어 로직 (기존 로직 유지)
    // ----------------------------------------------------
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

    // //스토리지에서 챕터 불러오기
    // useEffect(() => {
    //     const storedChapters = JSON.parse(localStorage.getItem('chapters')) || [];
    //     setBringChapters(storedChapters);
    // }, []);

    //챕터 선택 함수
    const handleChapterSelect = (chapter) => {
        setSelectedChapter(chapter);
    };

//     return (
//         <div className="Quiz_container">
//             <div className="Quiz">
//                 {!quizStart && !quizEnd ? (
//                     <div>
//                         <div className="con">
//                             <h2>챕터 선택</h2>
//                             <Link to={'/'}>
//                                 <button className="BackHome">
//                                     <img className="homeImg" src="/img/home.png" alt="home" />
//                                 </button>
//                             </Link>
//                         </div>
//                         {bringChapters.length === 0 ? (<p>생성된 챕터가 없습니다.</p>) : (
//                             <div className="ChapterList_Q">
//                                 {bringChapters.map((bringChapter, index) => (
//                                     <div key={index}
//                                         className={`QuizChapterItem ${selectedChapter === bringChapter ? 'selected' : ''} ${bringChapter.words.length === 0 ? 'disabled' : ''
//                                             }`}
//                                         onClick={() => {
//                                             if (bringChapter.words.length > 0) handleChapterSelect(bringChapter)
//                                         }}>
//                                         {bringChapter.name}
//                                         <div>({bringChapter.words.length} 단어)</div>
//                                     </div>
//                                 ))}
//                             </div>
//                         )}
//                         <div className="startBtn_container">
//                             <button
//                                 className="QuizStartBtn"
//                                 onClick={startQuiz}
//                                 disabled={!selectedChapter || selectedChapter.words.length === 0}
//                             >{selectedChapter ? `${selectedChapter.name} : START` : "챕터를 선택하세요."}
//                             </button>
//                         </div>
//                     </div>
//                 ) : quizEnd ? (
//                     <div className="QuizResult">
//                         <div className="quizEndCon">
//                             <button
//                                 className="backBtn_Quiz"
//                                 onClick={() => {
//                                     setQuizEnd(false);
//                                     setSelectedChapter(null);
//                                 }}>
//                                     <img className="imgQ" src="/img/arrow.png" alt="back" />
//                                 </button>
//                             <h1>FINISH!</h1>
//                             <h2>SCORE : {score} / {quizWord.length}</h2>
//                         </div>
//                     </div>
//                 ) : (
//                     <div className="QuizSection">
//                         <button className="backBtn_Q" onClick={() => setQuizStart(false)}>
//                             <img className="backImg_Q" src="/img/arrow.png" alt="back" />
//                         </button>
//                         <h1>[{selectedChapter.name}] Word Quiz</h1>
//                         <div className="OX">
//                             <span className="O">O</span> {score}
//                             <span className="X">X</span> {wrong}
//                         </div>
//                         <div className="QuizQuestion">
//                             <h2>다음 단어의 영어 표현 작성</h2>
//                             <h3 className="question">{quizWord[currentWordIndex].meaning}</h3>
//                         </div>
//                         <form className="formQuiz" onSubmit={handleSubmitAnswer}>
//                             <input
//                                 className="inputWord"
//                                 type="text"
//                                 value={answer}
//                                 onChange={(e) => setAnswer(e.target.value)}
//                                 placeholder="영어 단어를 입력하세요."
//                             />
//                             <button className="submitBtn_Q" type="submit">제출</button>
//                         </form>

//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }

// export default Quiz;

return (
        <div className="Quiz_container">
            <header className="QuizHeader">
                <Link to={'/Chapter'} className="BackBtn">
                    <img className="BackImg" src="/img/arrow.png" alt="back" />
                </Link>
                <h1>Quiz</h1>
            </header>
            
            {/* 챕터 선택 모달 */}
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
                                    // ✨ [수정] 선택된 챕터 객체 저장 (DB ID를 사용)
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
                <button 
                    className="SelectChapterBtn" 
                    onClick={() => setOpenChapter(true)} 
                    disabled={wordsInChapter.length > 0 && !isQuizDone}
                >
                    {selectedChapter ? `${selectedChapter.name} 퀴즈 다시 시작` : '퀴즈 시작 / 챕터 선택'}
                </button>

                {/* 퀴즈 진행 UI */}
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
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') handleCheckAnswer();
                            }}
                            disabled={isChecking}
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
                
                {/* 퀴즈 결과 UI */}
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
                    </div>
                )}

            </div>
        </div>
    );
}

export default Quiz;