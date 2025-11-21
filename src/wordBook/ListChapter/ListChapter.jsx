import React from 'react';
import './ListChapter.css';
import { Link } from 'react-router-dom';

function ListChapter({ chapters, DeleteChapter, UpdateChapter }) {

    const handleCorrChapter = async (e, chapterId, currentName) => {
        e.preventDefault(); 
        e.stopPropagation(); 

        UpdateChapter(chapterId, currentName);
    };

    return (
        <div className="ListChapter">
            <h2 className='ChapterSet'>My Chapter</h2>
            {chapters.length === 0 ? (
                <div className='empty'>Empty Chapter</div>
            ) : (
                <div className='ChapterContainer'>
                    {chapters.map((chapter, index) => (
                        <Link 
                            key={chapter.chapter_id} 
                            className='ChapterItem' 
                            to={`/Word/${encodeURIComponent(chapter.name)}`} 
                            state={{ chapterId: chapter.chapter_id }}
                        >
                            {chapter.name}
                            <div className='Btns'>
                                <button
                                    className='CorrBtn'
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleCorrChapter(e, chapter.chapter_id, chapter.name)
                                    }}
                                >
                                    수정
                                </button>
                                <button
                                    className='DeleteBtn'
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (window.confirm(`챕터 ${chapter.name}를 삭제하시겠습니까?`)) {
                                            DeleteChapter(chapter.chapter_id);
                                        }
                                    }}
                                >
                                    삭제
                                </button>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ListChapter;