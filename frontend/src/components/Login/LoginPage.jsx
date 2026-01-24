import React, { useState, useEffect } from 'react';
import { studentApi } from '../../services/api';
import AvatarGrid from './AvatarGrid';
import LoginForm from './LoginForm';

const LoginPage = ({ onLoginSuccess }) => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await studentApi.listStudents();
        setStudents(response.data);
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const handleLogin = async (studentId, password) => {
    const response = await studentApi.login(studentId, password);
    localStorage.setItem('student_token', response.data.access_token);
    onLoginSuccess(response.data);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-16 px-6 lg:px-12 font-body">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-display font-bold text-slate-900 mb-6 tracking-tight">
            Abigail Spelling
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
            Welcome back! Select your avatar to start your assessment.
          </p>
        </div>

        <div className="flex justify-center">
          {selectedStudent ? (
            <LoginForm
              student={selectedStudent}
              onLogin={handleLogin}
              onBack={() => setSelectedStudent(null)}
            />
          ) : (
            <AvatarGrid
              students={students}
              onSelect={(student) => setSelectedStudent(student)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
