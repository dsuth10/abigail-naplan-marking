import React, { useState } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import LoginPage from './components/Login/LoginPage';
import ProjectSelectionPage from './pages/Student/ProjectSelectionPage';
import AssessmentPage from './pages/Student/AssessmentPage';
import TeacherProjectList from './pages/Teacher/TeacherProjectList';
import ProjectBuilder from './pages/Teacher/ProjectBuilder';
import Rostering from './pages/Teacher/Rostering';
import TeacherDashboard from './pages/Teacher/Dashboard';

const AppContent = ({ isAuthenticated, handleLoginSuccess, handleLogout }) => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: isAuthenticated ? (
        <Navigate to="/projects" replace />
      ) : (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      ),
    },
    {
      path: "/projects",
      element: isAuthenticated ? (
        <ProjectSelectionPage onLogout={handleLogout} />
      ) : (
        <Navigate to="/" replace />
      ),
    },
    {
      path: "/assessment/:projectId",
      element: isAuthenticated ? (
        <AssessmentPage />
      ) : (
        <Navigate to="/" replace />
      ),
    },
    {
      path: "/teacher/projects",
      element: <TeacherProjectList />,
    },
    {
      path: "/teacher/projects/new",
      element: <ProjectBuilder />,
    },
    {
      path: "/teacher/projects/edit/:projectId",
      element: <ProjectBuilder />,
    },
    {
      path: "/teacher/dashboard/:projectId",
      element: <TeacherDashboard />,
    },
    {
      path: "/teacher/roster",
      element: <Rostering />,
    },
    {
      path: "*",
      element: <Navigate to="/" replace />,
    },
  ]);

  return <RouterProvider router={router} />;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('student_token');
  });

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AppContent
      isAuthenticated={isAuthenticated}
      handleLoginSuccess={handleLoginSuccess}
      handleLogout={handleLogout}
    />
  );
}

export default App;
