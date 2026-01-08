import React, { useState, useEffect } from "react";
import './Chapter.css';
import ListChapter from "../ListChapter/ListChapter";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api";
import Papa from "papaparse";

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
        } catch (error) {
            console.error('챕터 목록 조회 실패:', error);
        }
    };

    useEffect(() => {
        fetchChapters();
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            // 현재 포커스가 입력창인지 확인
            const isInputFocused = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);

            // ESC : 모달이 열려있으면 닫기
            if (e.key === 'Escape' && createOpen) {
                setCreateOpen(false);
            }

            // C : 입력 중이 아니고 모달이 닫혀있을 때 열기
            if ((e.key === 'c' || e.key === 'C') && !isInputFocused && !createOpen) {
                setCreateOpen(true);
            }
        };

        // 이벤트 리스너 등록
        window.addEventListener('keydown', handleKeyDown);

        // 컴포넌트 언마운트 시 리스너 제거
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [createOpen]);


    // 새 챕터 생성
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

    // 챕터 삭제
    async function DeleteChapter(chapterId) {
        if (!window.confirm('해당 챕터의 모든 단어가 삭제됩니다. 정말 삭제하시겠습니까?'))
            return;
        try {
            await api.delete(`/chapters/${chapterId}`);
            setChapters(prev => prev.filter(ch => ch.chapter_id !== chapterId));
            alert("챕터 삭제 성공");
        } catch (error) {
            alert("챕터 삭제 실패");
        }
    }

    async function UpdateChapter(chapterId, currentName) {
        const newName = window.prompt("새로운 챕터 이름을 입력하세요:", currentName);

        if (newName === null) return; // 취소 버튼
        if (!newName.trim()) {
            alert("챕터 이름을 입력해야 합니다.");
            return;
        }
        if (newName === currentName) return; // 변경 사항 없음

        try {
            // PUT 요청
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

    const handleCsvUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // 파일명을 챕터 이름으로 설정(확장자 제거)
        const chapterName = file.name.replace(/\.[^/.]+$/, "");

        Papa.parse(file, {
            header: true, // 첫 줄을 english, korean 키로 사용
            skipEmptyLines: true,
            complete: async (results) => {
                const words = results.data;

                // 데이터 형식 검증
                if (words.length === 0 || !words[0].english || !words[0].korean) {
                    alert("CSV 형식이 올바르지 않습니다.(헤더명 english, korean 필수)");
                    return;
                }

                try {
                    // 백엔드에 챕터명과 단어 배열 전송
                    await api.post('/chapters/import', {
                        name: chapterName,
                        words: words
                    });
                    alert(`'${chapterName}' 챕터 등록 완료`);
                    fetchChapters();
                } catch (error) {
                    console.error('CSV 임포트 실패', error);
                    alert('서버 저장 중 오류가 발생했습니다.');
                }
            }
        });
    };

    return (
        <div className="Chapter">
            <h1 className="Header">
                <button
                    className="LogoutBtn"
                    onClick={handleLogout}
                >
                    로그아웃 ({username})
                </button>
                <div className="VOCA">VOCA</div>
                <div className="HeaderButtons">
                    <label htmlFor="csv-upload" className="CsvUploadBtn">
                        CSV Import
                    </label>
                    <input
                        id="csv-upload"
                        type="file"
                        accept=".csv"
                        onChange={handleCsvUpload}
                        style={{ display: 'none' }}
                    />
                    <button
                        className="CreateBtn"
                        onClick={() => setCreateOpen(true)}
                        title="단축키: C"
                    >
                        New Chapter
                    </button>
                </div>
            </h1>

            {createOpen && (
                <div className="ModalOverlay" onClick={() => setCreateOpen(false)}>
                    <div className="Modal" onClick={(e) => e.stopPropagation()}>
                        <h2 className="ModalTitle">New Chapter</h2>
                        <form onSubmit={handleCreateChapter} className="ChapterForm">
                            <input
                                type="text"
                                value={newChapter}
                                onChange={(e) => setNewChapter(e.target.value)}
                                placeholder="Chapter Name"
                                autoFocus // 모달 열리면 바로 입력 가능하게 포커스
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