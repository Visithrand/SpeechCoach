import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Analytics from './pages/Analytics';
import Feedback from './pages/Feedback';
import Exercises from './pages/Exercises';
import SpeechExercises from './pages/SpeechExercises';
import Settings from './components/Settings';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication status on app load
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
    
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    setIsAuthenticated(false);
    setUser(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading Speech Therapy App...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        {isAuthenticated ? (
          <>
            <Navbar user={user} onLogout={handleLogout} />
            <main className="main-content">
              <Routes>
                <Route path="/dashboard" element={<Dashboard userId={user?.id} />} />
                <Route path="/profile" element={<Profile userId={user?.id} />} />
                <Route path="/analytics" element={<Analytics userId={user?.id} />} />
                <Route path="/feedback" element={<Feedback userId={user?.id} />} />
                <Route path="/exercises" element={<Exercises userId={user?.id} />} />
                <Route path="/speech-exercises" element={<SpeechExercises userId={user?.id} />} />
                <Route path="/settings" element={<Settings userId={user?.id} />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </main>
          </>
        ) : (
          <Routes>
            <Route path="/login" element={<Login onLogin={(userData) => {
              setIsAuthenticated(true);
              setUser(userData);
              localStorage.setItem('userId', userData.id);
            }} />} />
            <Route path="/signup" element={<Signup onSignup={(userData) => {
              setIsAuthenticated(true);
              setUser(userData);
              localStorage.setItem('userId', userData.id);
            }} />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;