CREATE TABLE IF NOT EXISTS Words (
    word_id INT PRIMARY KEY AUTO_INCREMENT,
    chapter_id INT NOT NULL,
    english VARCHAR(255) NOT NULL,
    korean TEXT NOT NULL,
    is_memorized BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (chapter_id) REFERENCES Chapters(chapter_id) ON DELETE CASCADE
);