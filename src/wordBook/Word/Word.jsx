import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import './Word.css';

function Word() {
    const location = useLocation();
    const navigate = useNavigate();
    const [chapter, setChapter] = useState(null);
    const [newWord, setNewWord] = useState({ word: '', meaning: '' });
    const [isAddingWord, setIsAddingWord] = useState(false);

    useEffect(() => {
        const chapterName = decodeURIComponent(location.pathname.split('/').pop());
        const chapters = JSON.parse(localStorage.getItem('chapters')) || [];
        const currentChapter = chapters.find(ch => ch.name === chapterName);

        if (currentChapter) {
            setChapter(currentChapter);
        } else {
            navigate('/Chapter');
        }
    }, [location, navigate]);

    const handleAddWord = (e) => {
        e.preventDefault();
        if (newWord.word.trim() && newWord.meaning.trim()) {
            const updatedChapters = JSON.parse(localStorage.getItem('chapters') || '[]').map(ch =>
                ch.name === chapter.name
                    ? { ...ch, words: [...ch.words, newWord] }
                    : ch
            );

            localStorage.setItem('chapters', JSON.stringify(updatedChapters));
            setChapter(updatedChapters.find(ch => ch.name === chapter.name));
            setNewWord({ word: '', meaning: '' });
            setIsAddingWord(false);
        }
    };

    const handleDeleteWord = (index) => {
        const updatedChapters = JSON.parse(localStorage.getItem('chapters') || '[]').map(ch =>
            ch.name === chapter.name
                ? { ...ch, words: ch.words.filter((_, i) => i !== index) }
                : ch
        );

        localStorage.setItem('chapters', JSON.stringify(updatedChapters));
        setChapter(updatedChapters.find(ch => ch.name === chapter.name));
    };

    //단어 수정 함수
    const handleCorrWord = (word, newMean) => {
        const updatedChapters = JSON.parse(localStorage.getItem('chapters') || '[]').map(ch =>
            ch.name === chapter.name
                ? {
                    ...ch,
                    words: ch.words.map(w =>
                        w.word === word ? { ...w, meaning: newMean } : w
                    )
                }
                : ch
        );

        localStorage.setItem('chapters', JSON.stringify(updatedChapters));
        setChapter(updatedChapters.find(ch => ch.name === chapter.name));
    };

    const goToHome = () => navigate('/');

    if (!chapter) return <div>Loading...</div>;

    return (
        <div className="Wodr_container">
            <div className="Word">
                <header className="WordHeader">
                    <button className="BackBtn" onClick={goToHome}>
                        <img className="BackImg" src="/img/arrow.png" alt="back" />
                    </button>
                    <h1>{chapter.name}</h1>
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
                                    value={newWord.word}
                                    onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
                                    className="WordBar"
                                />
                                <input
                                    type="text"
                                    placeholder="의미"
                                    value={newWord.meaning}
                                    onChange={(e) => setNewWord({ ...newWord, meaning: e.target.value })}
                                    className="MeanBar"
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
                    {chapter.words.length === 0 ? (
                        <h2 className="EmptyMessage">등록된 단어가 없습니다.</h2>
                    ) : (
                        <div className="WordItems">
                            {chapter.words.map((word, index) => (
                                <div key={index} className="WordItem">
                                    <div className="WordContent">
                                        <span className="WordText">{word.word}</span>
                                        <span className="WordMeaning">{word.meaning}</span>
                                    </div>
                                    <div className="WordBtns">
                                        <button
                                            className="CorrWordBtn"
                                            onClick={() => {
                                                const newMean = prompt("뜻 수정", word.meaning);
                                                if (newMean) handleCorrWord(word.word, newMean);
                                            }}
                                        >
                                            수정
                                        </button>
                                        <button
                                            className="DeleteWordBtn"
                                            onClick={() => {
                                                if (window.confirm('단어를 삭제하시겠습니까?')) {
                                                    handleDeleteWord(index);
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
