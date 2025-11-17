import React, { useState, useEffect } from "react";
import './Chapter.css';
import ListChapter from "../ListChapter/ListChapter";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api";

function Chapter() {
    const [chapters, setChapters] = useState([]); // 챕터 목록
    const [newChapter, setNewChapter] = useState(''); // 새 챕터
    const [createOpen, setCreateOpen] = useState(false); // 새 챕터 만들기 눌렀는가?

    const navigate = useNavigate();
    const username = localStorage.getItem('username');

    // 챕터 목록 조회(DB에서 가져옴)
    const fetchChapters = async () => {
        try {
            const response = await api.get('/chapters');
            setChapters(response.data.chapters || []);
        } catch (error) { // 에러 처리
            console.error('챕터 목록 조회 실패:', error);
        }
    };

    useEffect(() => {
        fetchChapters();
    }, []);


    // 새 챕터 생성(DB에 저장)
    async function handleCreateChapter(e) {
        e.preventDefault();
        const chapterName = newChapter.trim();
        if (chapterName) {
            try {
                const response = await api.post('/chapters', { name: chapterName });
                setChapters(prev => [...prev, response.data.newChapter]);
                setNewChapter('');
                setCreateOpen(false);
                alert('챕터 생성 성공');
            } catch (error) {
                alert('챕터 생성 실패');
            }
        };
    };


    // 로컬스토리지 삭제----------------------------------------------------------
    // // 새 챕터 만들기 함수
    // function handleCreateChapter(e) {
    //     e.preventDefault();
    //     if (newChapter.trim()) {
    //         const newChapterObj = { name: newChapter, words: [] };
    //         const updatedChapters = [...chapters, newChapterObj];
    //         setChapters(updatedChapters);
    //         localStorage.setItem('chapters', JSON.stringify(updatedChapters));
    //         setNewChapter('');
    //         setCreateOpen(false);
    //     };
    // };

    // 로컬스토리지 삭제----------------------------------------------------------
    // // 챕터 목록 불러오기
    // useEffect(() => {
    //     const storedChapters = JSON.parse(localStorage.getItem('chapters')) || [];
    //     setChapters(storedChapters);
    // }, []);

    // // 챕터 삭제 함수
    // function DeleteChapter(index) {
    //     const updatedChapters = chapters.filter((_, i) => i !== index); //filter로 삭제할 챕터를 제외한 새 배열 생성
    //     setChapters(updatedChapters); // state 업데이트
    //     localStorage.setItem('chapters', JSON.stringify(updatedChapters)); // 로컬스토리지 업데이트
    // }

    // 챕터 삭제(DB에서 삭제)
    async function DeleteChapter(chapterId) {
        if (!window.confirm('해당 챕터의 모든 단어가 삭제됩니다. 정말 삭제하시겠습니까?'))
            return;


        try {
            await api.delete(`/chapters/${chapterId}`);

            // 삭제 성공하면 목록에서 챕터 삭제(DB ID 기반 필터링)
            setChapters(prev => prev.filter(ch => ch.chapter_id !== chapterId));
            alert("챕터 삭제 성공");
        } catch (error) {
            alert("챕터 삭제 실패");
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('userToken'); // 토큰 제거하고
        localStorage.removeItem('username');
        navigate('/Login'); // 로그인 페이지로 이동

    };

    return (
        <div className="Chapter">
            <h1 className="Header">
                <div className="VOCA">VOCA</div>
                <div>
                    <button
                        className="CreateBtn LogoutBtn"
                        onClick={handleLogout}
                    >
                        로그아웃 ({username}님)
                    </button>
                    <button
                        className="CreateBtn"
                        onClick={() => setCreateOpen(true)}
                    >
                        New Chapter
                    </button>
                </div>
            </h1>

            {createOpen && (
                <div className="ModalOverlay">
                    <div className="Modal">
                        <h2 className="ModalTitle">New Chapter</h2>
                        <form onSubmit={handleCreateChapter} className="ChapterForm">
                            <input
                                type="text"
                                value={newChapter}
                                onChange={(e) => setNewChapter(e.target.value)}
                                placeholder="Chapter Name"
                            />
                            <div className="ModalBtn">
                                <button type="submit" className="submitBtn">add</button>
                                <button type="button" className="cancelBtn" onClick={() => setCreateOpen(false)}>cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="ChapterList">
                <ListChapter chapters={chapters} DeleteChapter={DeleteChapter} />
            </div>
            <Link className="QuizLink" to={"/Quiz"}>
                <div className="QuizPage">
                    <div className="QuizArea">
                        <button className="QuizBtn">Quiz</button>
                    </div>
                </div>
            </Link>
        </div>
    );
}

export default Chapter;