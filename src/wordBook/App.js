import React from "react";
import Chapter from "./Chapter/Chapter";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Word from "./Word/Word";
import Quiz from "./Quiz/Quiz";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Chapter />} />
                <Route path="/Chapter" element={<Chapter />} />
                <Route path="/Word/:chapterName" element={<Word />} />
                
                <Route path="/Quiz" element={<Quiz />} />
            </Routes>
        </Router>
    );
}

export default App;