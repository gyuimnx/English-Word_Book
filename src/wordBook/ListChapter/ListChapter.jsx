import React from 'react';
import './ListChapter.css';
import { Link } from 'react-router-dom';

function ListChapter({ chapters, DeleteChapter, setChapters }) {
    const handleCorrChapter = (e, index, currentName) => {
        e.preventDefault(); //Link의 기본 동작을 막음
        e.stopPropagation(); //이벤트가 상위로 퍼지는거 방지
        const newName = prompt("챕터 수정", currentName);
        if (newName && newName.trim()) {
            const updatedChapters = JSON.parse(localStorage.getItem('chapters'));
            updatedChapters[index].name = newName.trim();
            localStorage.setItem('chapters', JSON.stringify(updatedChapters));
            setChapters(updatedChapters); //이게 재랜더링 시키는 역할임
        }
    };

    return (
        <div className="ListChapter">
            <h2 className='ChapterSet'>My Chapter</h2>
            {chapters.length === 0 ? (
                <div className='empty'>Empty Chapter</div>
            ) : (
                <div className='ChapterContainer'>
                    {chapters.map((chapter, index) => (
                        <Link key={index} className='ChapterItem' to={`/Word/${encodeURIComponent(chapter.name)}`}>
                            {chapter.name}
                            <div className='Btns' onClick={(e)=>{e.preventDefault(); e.stopPropagation();}}>
                                <button className='CorrBtn' onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleCorrChapter(e, index, chapter.name)
                                }}>수정</button>
                                <button className='DeleteBtn' onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if(window.confirm('챕터를 삭제하시겠습니까?')){
                                        DeleteChapter(index);
                                    }
                                }}>삭제</button>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
// 버튼에 e.stopPropagation() : 버튼 클릭 이벤트가 상위로 전파되지 않도록 함
// e.preventDefault(); //Link의 기본 동작을 막음
export default ListChapter;