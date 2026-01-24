import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/Login/LoginPage';
import ProjectSelectionPage from './pages/Student/ProjectSelectionPage';
import AssessmentPage from './pages/Student/AssessmentPage';
import TeacherProjectList from './pages/Teacher/TeacherProjectList';
import ProjectBuilder from './pages/Teacher/ProjectBuilder';
import Rostering from './pages/Teacher/Rostering';
import TeacherDashboard from './pages/Teacher/Dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('student_token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            isAuthenticated ? (
              <Navigate to="/projects" replace />
            ) : (
              <LoginPage onLoginSuccess={handleLoginSuccess} />
            )
          } 
        />
        
        <Route 
          path="/projects" 
          element={
            isAuthenticated ? (
              <ProjectSelectionPage onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />

        <Route 
          path="/assessment/:projectId" 
          element={
            isAuthenticated ? (
              <AssessmentPage />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />

        {/* Teacher Routes */}
        <Route path="/teacher/projects" element={<TeacherProjectList />} />
        <Route path="/teacher/projects/new" element={<ProjectBuilder />} />
        <Route path="/teacher/projects/edit/:projectId" element={<ProjectBuilder />} />
        <Route path="/teacher/dashboard/:projectId" element={<TeacherDashboard />} />
        <Route path="/teacher/roster" element={<Rostering />} />
      </Routes>
    </Router>
  );
}

export default App;
