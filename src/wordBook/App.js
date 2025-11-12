import React from "react";
import Chapter from "./Chapter/Chapter";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Word from "./Word/Word";
import Quiz from "./Quiz/Quiz";
import Login from "./Login/Login";
import Register from "./Register/Register";
import AuthRoute from "./AuthRoute";


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<AuthRoute element={Chapter} />} />
                <Route path="/Chapter" element={<AuthRoute element={Chapter} />} />
                <Route path="/Word/:chapterName" element={<AuthRoute element={Word} />} />
                <Route path="/Quiz" element={<AuthRoute element={Quiz} />} />

                <Route path="/Login" element={<Login />} />
                <Route path="/Register" element={<Register />} />
            </Routes>
        </Router>
    );
}

export default App;