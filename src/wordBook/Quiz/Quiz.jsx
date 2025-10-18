import React, { useState, useEffect } from "react";
import "./Quiz.css";
import { Link } from "react-router-dom";

function Quiz() {
    const [bringChapters, setBringChapters] = useState([]); //로컬스토리지에서 불러온 챕터들
    const [selectedChapter, setSelectedChapter] = useState(null); //선택한 챕터

    const [quizWord, setQuizWord] = useState([]); //퀴즈에 사용할 단어
    const [currentWordIndex, setCurrentWordIndex] = useState(0); //현재 문제 인덱스
    const [answer, setAnswer] = useState(""); //입력한 답
    const [quizStart, setQuizStart] = useState(false); //퀴즈 시작했는가?
    const [score, setScore] = useState(0); //총 정답
    const [wrong, setWrong] = useState(0); //총 오답

    const [quizEnd, setQuizEnd] = useState(false); //퀴즈 종료됐는가

    //게임 시작 함수. shuffleArray에 선택한 챕터의 단어를 랜덤으로 배치시켜서 저장
    const startQuiz = () => {
        //null이 아니고 단어 길이가 1이상이면 실행
        if (selectedChapter && selectedChapter.words.length > 0) {
            const shuffleArray = [...selectedChapter.words].sort(() => Math.random() - 0.5);
            setQuizWord(shuffleArray);
            setCurrentWordIndex(0);
            setQuizStart(true);
            setScore(0);
            setWrong(0);
        };
    };

    //답변 제출 함수
    const handleSubmitAnswer = (e) => {
        e.preventDefault();

        // 정답 확인 (대소문자 무시)
        if (answer.trim().toLowerCase() === quizWord[currentWordIndex].word.toLowerCase()) {
            setScore(prevScore => prevScore + 1);
        } else {
            setWrong(prevWrong => prevWrong + 1);
        }

        if (currentWordIndex < quizWord.length - 1) { //다음 문제로 이동
            setCurrentWordIndex(prevIndex => prevIndex + 1);
        } else {
            setQuizStart(false); //퀴즈 종료
            setQuizEnd(true); //퀴즈 종료 됐다로 바꾸기
        }
        setAnswer(''); //입력 초기화
    };

    //스토리지에서 챕터 불러오기
    useEffect(() => {
        const storedChapters = JSON.parse(localStorage.getItem('chapters')) || [];
        setBringChapters(storedChapters);
    }, []);

    //챕터 선택 함수
    const handleChapterSelect = (chapter) => {
        setSelectedChapter(chapter);
    };

    return (
        <div className="Quiz_container">
            <div className="Quiz">
                {!quizStart && !quizEnd ? (
                    <div>
                        <div className="con">
                            <h2>챕터 선택</h2>
                            <Link to={'/'}>
                                <button className="BackHome">
                                    <img className="homeImg" src="/img/home.png" alt="home" />
                                </button>
                            </Link>
                        </div>
                        {bringChapters.length === 0 ? (<p>생성된 챕터가 없습니다.</p>) : (
                            <div className="ChapterList_Q">
                                {bringChapters.map((bringChapter, index) => (
                                    <div key={index}
                                        className={`QuizChapterItem ${selectedChapter === bringChapter ? 'selected' : ''} ${bringChapter.words.length === 0 ? 'disabled' : ''
                                            }`}
                                        onClick={() => {
                                            if (bringChapter.words.length > 0) handleChapterSelect(bringChapter)
                                        }}>
                                        {bringChapter.name}
                                        <div>({bringChapter.words.length} 단어)</div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="startBtn_container">
                            <button
                                className="QuizStartBtn"
                                onClick={startQuiz}
                                disabled={!selectedChapter || selectedChapter.words.length === 0}
                            >{selectedChapter ? `${selectedChapter.name} : START` : "챕터를 선택하세요."}
                            </button>
                        </div>
                    </div>
                ) : quizEnd ? (
                    <div className="QuizResult">
                        <div className="quizEndCon">
                            <button
                                className="backBtn_Quiz"
                                onClick={() => {
                                    setQuizEnd(false);
                                    setSelectedChapter(null);
                                }}>
                                    <img className="imgQ" src="/img/arrow.png" alt="back" />
                                </button>
                            <h1>FINISH!</h1>
                            <h2>SCORE : {score} / {quizWord.length}</h2>
                        </div>
                    </div>
                ) : (
                    <div className="QuizSection">
                        <button className="backBtn_Q" onClick={() => setQuizStart(false)}>
                            <img className="backImg_Q" src="/img/arrow.png" alt="back" />
                        </button>
                        <h1>[{selectedChapter.name}] Word Quiz</h1>
                        <div className="OX">
                            <span className="O">O</span> {score}
                            <span className="X">X</span> {wrong}
                        </div>
                        <div className="QuizQuestion">
                            <h2>다음 단어의 영어 표현 작성</h2>
                            <h3 className="question">{quizWord[currentWordIndex].meaning}</h3>
                        </div>
                        <form className="formQuiz" onSubmit={handleSubmitAnswer}>
                            <input
                                className="inputWord"
                                type="text"
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                placeholder="영어 단어를 입력하세요."
                            />
                            <button className="submitBtn_Q" type="submit">제출</button>
                        </form>

                    </div>
                )}
            </div>
        </div>
    );
}

export default Quiz;