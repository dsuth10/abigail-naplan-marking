import React, { useState } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import LoginPage from './components/Login/LoginPage';
import UserSelectionPage from './pages/UserSelectionPage';
import ProjectSelectionPage from './pages/Student/ProjectSelectionPage';
import AssessmentPage from './pages/Student/AssessmentPage';
import TeacherProjectList from './pages/Teacher/TeacherProjectList';
import ProjectBuilder from './pages/Teacher/ProjectBuilder';
import Rostering from './pages/Teacher/Rostering';
import TeacherDashboard from './pages/Teacher/Dashboard';
import AssessmentResultPage from './pages/Teacher/AssessmentResultPage';
import TeacherLayout from './components/Teacher/TeacherLayout';
import TeacherLoginPage from './components/Teacher/TeacherLoginPage';
import TeacherProtectedRoute from './components/Teacher/TeacherProtectedRoute';

const AppContent = ({
  isAuthenticated,
  handleLoginSuccess,
  handleLogout,
  isTeacherAuthenticated,
  handleTeacherLoginSuccess,
}) => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <UserSelectionPage />,
    },
    {
      path: "/login",
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
        <Navigate to="/login" replace />
      ),
    },
    {
      path: "/assessment/:projectId",
      element: isAuthenticated ? (
        <AssessmentPage />
      ) : (
        <Navigate to="/login" replace />
      ),
    },
    {
      path: "/teacher/login",
      element: isTeacherAuthenticated ? (
        <Navigate to="/teacher/projects" replace />
      ) : (
        <TeacherLoginPage onLoginSuccess={handleTeacherLoginSuccess} />
      ),
    },
    {
      path: "/teacher/projects",
      element: (
        <TeacherProtectedRoute>
          <TeacherLayout>
            <TeacherProjectList />
          </TeacherLayout>
        </TeacherProtectedRoute>
      ),
    },
    {
      path: "/teacher/projects/new",
      element: (
        <TeacherProtectedRoute>
          <TeacherLayout>
            <ProjectBuilder />
          </TeacherLayout>
        </TeacherProtectedRoute>
      ),
    },
    {
      path: "/teacher/projects/edit/:projectId",
      element: (
        <TeacherProtectedRoute>
          <TeacherLayout>
            <ProjectBuilder />
          </TeacherLayout>
        </TeacherProtectedRoute>
      ),
    },
    {
      path: "/teacher/dashboard/:projectId",
      element: (
        <TeacherProtectedRoute>
          <TeacherLayout>
            <TeacherDashboard />
          </TeacherLayout>
        </TeacherProtectedRoute>
      ),
    },
    {
      path: "/teacher/assessment/:assessmentId",
      element: (
        <TeacherProtectedRoute>
          <AssessmentResultPage />
        </TeacherProtectedRoute>
      ),
    },
    {
      path: "/teacher/roster",
      element: (
        <TeacherProtectedRoute>
          <TeacherLayout>
            <Rostering />
          </TeacherLayout>
        </TeacherProtectedRoute>
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
  const [isTeacherAuthenticated, setIsTeacherAuthenticated] = useState(() => {
    return !!localStorage.getItem('teacher_token');
  });

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const handleTeacherLoginSuccess = () => {
    setIsTeacherAuthenticated(true);
  };

  return (
    <ThemeProvider>
      <AppContent
        isAuthenticated={isAuthenticated}
        handleLoginSuccess={handleLoginSuccess}
        handleLogout={handleLogout}
        isTeacherAuthenticated={isTeacherAuthenticated}
        handleTeacherLoginSuccess={handleTeacherLoginSuccess}
      />
    </ThemeProvider>
  );
}

export default App;
