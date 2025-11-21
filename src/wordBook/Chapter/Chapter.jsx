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
                const message = error.response?.data?.message || '챕터 생성 실패';
                alert(message);
            }
        };
    };

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

    async function UpdateChapter(chapterId, currentName) {
        // 사용자에게 새로운 이름을 입력받음
        const newName = window.prompt("새로운 챕터 이름을 입력하세요:", currentName);
        
        if (newName === null) return; // 취소 버튼 누름
        if (!newName.trim()) {
            alert("챕터 이름을 입력해야 합니다.");
            return;
        }
        if (newName === currentName) return; // 변경 사항 없음

        try {
            // PUT 요청 보내기
            await api.put(`/chapters/${chapterId}`, { name: newName.trim() });
            
            // 화면 목록 업데이트
            setChapters(prev => prev.map(ch => 
                ch.chapter_id === chapterId ? { ...ch, name: newName.trim() } : ch
            ));
            alert("챕터 이름이 수정되었습니다.");
        } catch (error) {
            const message = error.response?.data?.message || '챕터 수정 실패';
            alert(message);
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
                <button
                    className="LogoutBtn"
                    onClick={handleLogout}
                >
                    로그아웃 ({username}님)
                </button>
                <div className="VOCA">VOCA</div>
                <button
                    className="CreateBtn"
                    onClick={() => setCreateOpen(true)}
                >
                    New Chapter
                </button>

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
                <ListChapter chapters={chapters} DeleteChapter={DeleteChapter} UpdateChapter={UpdateChapter} />
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