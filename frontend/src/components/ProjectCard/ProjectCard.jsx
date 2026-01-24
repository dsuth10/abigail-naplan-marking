import React from 'react';
import { BookOpen, Lightbulb, Users, Calendar, Power, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProjectCard = ({ project, onToggleStatus, onEdit }) => {
  const navigate = useNavigate();
  const isNarrative = project.genre === 'NARRATIVE';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className={`h-2 w-full ${isNarrative ? 'bg-purple-500' : 'bg-orange-500'}`} />
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-xl ${isNarrative ? 'bg-purple-50 text-purple-600' : 'bg-orange-50 text-orange-600'}`}>
            {isNarrative ? <BookOpen size={24} /> : <Lightbulb size={24} />}
          </div>
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={() => onToggleStatus(project.id)}
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                project.is_active 
                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              <Power size={12} />
              {project.is_active ? 'ACTIVE' : 'INACTIVE'}
            </button>
            <button
              onClick={() => navigate(`/teacher/dashboard/${project.id}`)}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-bold"
            >
              <BarChart2 size={14} />
              LIVE DASHBOARD
            </button>
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-800 mb-2 truncate">{project.title}</h3>
        <p className="text-gray-500 text-sm mb-6 uppercase tracking-wider font-semibold">
          {project.genre}
        </p>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-gray-500 text-sm">
            <Users size={16} />
            <span>{project.assigned_class_groups.join(', ')}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-500 text-sm">
            <Calendar size={16} />
            <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(project.id)}
            className="flex-1 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors"
          >
            Edit
          </button>
          <button
            className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors"
            onClick={() => window.open(`/assessment/${project.id}`, '_blank')}
          >
            Preview
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
