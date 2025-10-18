-- 5. Words 테이블 생성
CREATE TABLE IF NOT EXISTS Words (
    word_id INT PRIMARY KEY AUTO_INCREMENT,
    chapter_id INT NOT NULL,
    english_word VARCHAR(255) NOT NULL,
    korean_meaning TEXT NOT NULL,
    is_memorized BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (chapter_id) REFERENCES Chapters(chapter_id) ON DELETE CASCADE
);