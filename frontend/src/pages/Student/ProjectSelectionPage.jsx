import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentApi } from '../../services/api';

const ProjectSelectionPage = ({ onLogout }) => {
  const [projects, setProjects] = useState([]);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentRes, projectsRes] = await Promise.all([
          studentApi.getMe(),
          studentApi.getProjects(),
        ]);
        setStudent(studentRes.data);
        setProjects(projectsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('student_token');
    onLogout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
              <img
                src={`/src/assets/avatars/${student?.avatar_id}.svg`}
                alt={student?.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Hello, {student?.name}!</h1>
              <p className="text-gray-500">Class: {student?.class_group} | Year {student?.year_level}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-2 border border-gray-300 rounded-lg font-semibold text-gray-600 hover:bg-gray-50 transition-all"
          >
            Logout
          </button>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-8">Available Assessments</h2>
        
        {projects.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl shadow-sm text-center">
            <p className="text-xl text-gray-500">No assessments assigned to your class yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => navigate(`/assessment/${project.id}`)}
                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-xl hover:-translate-y-1 text-left group"
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors ${
                  project.genre === 'NARRATIVE' ? 'bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white' : 'bg-orange-100 text-orange-600 group-hover:bg-orange-600 group-hover:text-white'
                }`}>
                  {project.genre === 'NARRATIVE' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{project.title}</h3>
                <p className="text-gray-500 font-medium uppercase tracking-wider text-sm">{project.genre}</p>
                <div className="mt-8 flex items-center text-blue-600 font-bold group-hover:translate-x-2 transition-transform">
                  Start Assessment
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectSelectionPage;
