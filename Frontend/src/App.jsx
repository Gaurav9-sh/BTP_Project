import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './components/Login';
import AcademicsPage from './components/AcademicsPage';
import HODPage from './components/HODPage';
import './App.css';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"

function App() {
  const [user, setUser] = useState(null);
  const [documents, setDocuments] = useState([]); // This is your separate 'documents' system

  // This useEffect runs ONCE on app load
  useEffect(() => {
    // --- FIX 1: Read from 'user', not 'currentUser' ---
    const savedUser = localStorage.getItem('user'); 
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // Load documents from localStorage
    const savedDocuments = localStorage.getItem('documents');
    if (savedDocuments) {
      setDocuments(JSON.parse(savedDocuments));
    }
  }, []); // The empty array [] is correct and critical

  const handleLogin = (userData) => {
    setUser(userData);
    // --- FIX 1: Save to 'user', not 'currentUser' ---
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    // Clear ALL auth data on logout
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const updateDocuments = (newDocuments) => {
    setDocuments(newDocuments);
    localStorage.setItem('documents', JSON.stringify(newDocuments));
  };

  return (
    <Router>
       <ToastContainer position="top-right" autoClose={2000} />
      <div className="app">
        <Routes>
          <Route 
            path="/login" 
            element={
              user ? (
                // --- FIX 2 & 3: Check for 'HOD' or 'ADMIN' ---
                <Navigate to={user.role === 'HOD' ? '/hod' : '/academics'} replace />
              ) : (
                <Login onLogin={handleLogin} />
              )
            } 
          />
          <Route 
            path="/academics" 
            element={
              user && user.role === 'ADMIN' ? ( // --- FIX 2: Check for 'ADMIN' ---
                <AcademicsPage 
                  user={user} 
                  onLogout={handleLogout}
                  documents={documents}
                  updateDocuments={updateDocuments}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/hod" 
            element={
              user && user.role === 'HOD' ? ( // --- FIX 3: Check for 'HOD' (uppercase) ---
                <HODPage 
                  user={user} 
                  onLogout={handleLogout}
                  // We must pass the courses from the Context, not 'documents'
                  // For now, leaving 'documents' as you have it
                  documents={documents} 
                  updateDocuments={updateDocuments}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;