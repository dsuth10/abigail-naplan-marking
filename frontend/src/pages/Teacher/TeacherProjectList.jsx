import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { teacherApi } from '../../services/api';
import ProjectCard from '../../components/ProjectCard/ProjectCard';
import { Plus, Users } from 'lucide-react';

const TeacherProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      const response = await teacherApi.getProjects();
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleToggleStatus = async (id) => {
    try {
      await teacherApi.toggleProjectStatus(id);
      fetchProjects(); // Refresh list
    } catch (error) {
      console.error('Error toggling status:', error);
    }
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
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Assessment Projects</h1>
            <p className="text-gray-500">Manage your writing prompts and stimulus material.</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/teacher/roster')}
              className="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm"
            >
              <Users size={20} />
              Manage Roster
            </button>
            <button
              onClick={() => navigate('/teacher/projects/new')}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md"
            >
              <Plus size={20} />
              New Assessment
            </button>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl shadow-sm text-center border border-dashed border-gray-300">
            <p className="text-xl text-gray-400 mb-6">You haven't created any assessments yet.</p>
            <button
              onClick={() => navigate('/teacher/projects/new')}
              className="text-blue-600 font-bold hover:underline"
            >
              Create your first assessment
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onToggleStatus={handleToggleStatus}
                onEdit={(id) => navigate(`/teacher/projects/edit/${id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherProjectList;
