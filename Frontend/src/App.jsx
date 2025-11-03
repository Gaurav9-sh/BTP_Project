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
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // Load documents from localStorage
    const savedDocuments = localStorage.getItem('documents');
    if (savedDocuments) {
      setDocuments(JSON.parse(savedDocuments));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
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
                <Navigate to={user.role === 'hod' ? '/hod' : '/academics'} replace />
              ) : (
                <Login onLogin={handleLogin} />
              )
            } 
          />
          <Route 
            path="/academics" 
            element={
              user && user.role === 'academics' ? (
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
              user && user.role === 'hod' ? (
                <HODPage 
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
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;