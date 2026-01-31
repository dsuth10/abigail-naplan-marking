import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * Wraps teacher routes. If no teacher_token in localStorage, redirects to teacher login.
 * Preserves intended destination in location state for redirect after login.
 */
const TeacherProtectedRoute = ({ children }) => {
  const location = useLocation();
  const hasTeacherToken = !!localStorage.getItem('teacher_token');

  if (!hasTeacherToken) {
    return (
      <Navigate
        to="/teacher/login"
        state={{ from: location }}
        replace
      />
    );
  }

  return children;
};

export default TeacherProtectedRoute;
