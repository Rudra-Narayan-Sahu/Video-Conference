import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './page/LandingPage';
import Authentication from './page/Authentication';
import Home from './page/Home';
import History from './page/History';
import VideoMeet from './page/VideoMeet';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<Authentication />} />
          <Route path="/home" element={<Home />} />
          <Route path="/history" element={<History />} />
          <Route path="/meet/:url" element={<VideoMeet />} />
          <Route path="/meeting/:url" element={<VideoMeet />} />
          <Route path="/:url" element={<VideoMeet />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
