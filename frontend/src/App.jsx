import React, { useState } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import LoginPage from './components/Login/LoginPage';
import ProjectSelectionPage from './pages/Student/ProjectSelectionPage';
import AssessmentPage from './pages/Student/AssessmentPage';
import TeacherProjectList from './pages/Teacher/TeacherProjectList';
import ProjectBuilder from './pages/Teacher/ProjectBuilder';
import Rostering from './pages/Teacher/Rostering';
import TeacherDashboard from './pages/Teacher/Dashboard';
import TeacherLayout from './components/Teacher/TeacherLayout';

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
      element: (
        <TeacherLayout>
          <TeacherProjectList />
        </TeacherLayout>
      ),
    },
    {
      path: "/teacher/projects/new",
      element: (
        <TeacherLayout>
          <ProjectBuilder />
        </TeacherLayout>
      ),
    },
    {
      path: "/teacher/projects/edit/:projectId",
      element: (
        <TeacherLayout>
          <ProjectBuilder />
        </TeacherLayout>
      ),
    },
    {
      path: "/teacher/dashboard/:projectId",
      element: (
        <TeacherLayout>
          <TeacherDashboard />
        </TeacherLayout>
      ),
    },
    {
      path: "/teacher/roster",
      element: (
        <TeacherLayout>
          <Rostering />
        </TeacherLayout>
      ),
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
    <ThemeProvider>
      <AppContent
        isAuthenticated={isAuthenticated}
        handleLoginSuccess={handleLoginSuccess}
        handleLogout={handleLogout}
      />
    </ThemeProvider>
  );
}

export default App;
