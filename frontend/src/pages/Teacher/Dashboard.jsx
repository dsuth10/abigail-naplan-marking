import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { teacherApi, studentApi, submissionApi } from '../../services/api';
import { DashboardWebSocket } from '../../services/websocket';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  Download, 
  Unlock, 
  ArrowLeft,
  Search,
  Filter
} from 'lucide-react';

const TeacherDashboard = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [students, setStudents] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, studentsRes, subsRes] = await Promise.all([
          teacherApi.getProject(projectId),
          studentApi.listStudents(),
          submissionApi.getProjectSubmissions(projectId)
        ]);
        
        setProject(projRes.data);
        
        // Filter students assigned to this project
        const assignedStudents = studentsRes.data.filter(s => 
          projRes.data.assigned_class_groups.includes(s.class_group)
        );
        setStudents(assignedStudents);

        // Map submissions by student ID
        const subsMap = {};
        subsRes.data.forEach(sub => {
          subsMap[sub.student_id] = sub;
        });
        setSubmissions(subsMap);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Setup WebSocket
    const ws = new DashboardWebSocket((message) => {
      if (message.type === 'SUBMISSION_UPDATED') {
        const update = message.data;
        if (update.project_id === projectId) {
          setSubmissions(prev => ({
            ...prev,
            [update.student_id]: {
              ...prev[update.student_id],
              ...update
            }
          }));
        }
      }
    });
    ws.connect();

    return () => ws.disconnect();
  }, [projectId]);

  const handleUnlock = async (submissionId) => {
    if (!window.confirm('Return this submission to draft mode? The student will be able to edit it again.')) {
      return;
    }
    try {
      await submissionApi.unlockSubmission(submissionId);
    } catch (error) {
      console.error('Error unlocking submission:', error);
    }
  };

  const handleExport = async () => {
    try {
      const response = await submissionApi.exportSubmissions(projectId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${project.title}_Submissions.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting:', error);
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const sub = submissions[student.id];
      const status = sub ? sub.status : 'NOT_STARTED';
      
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           student.id_code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'ALL' || status === filterStatus;
      
      return matchesSearch && matchesFilter;
    });
  }, [students, submissions, searchTerm, filterStatus]);

  const stats = useMemo(() => {
    const total = students.length;
    const submitted = Object.values(submissions).filter(s => s.status === 'SUBMITTED').length;
    const writing = Object.values(submissions).filter(s => s.status === 'DRAFT').length;
    const notStarted = total - submitted - writing;

    return { total, submitted, writing, notStarted };
  }, [students, submissions]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <button
              onClick={() => navigate('/teacher/projects')}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-2 transition-colors"
            >
              <ArrowLeft size={18} />
              Back to Projects
            </button>
            <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
            <p className="text-gray-500">Monitoring live progress for classes: {project.assigned_class_groups.join(', ')}</p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition-all shadow-md"
          >
            <Download size={20} />
            Export Submissions (.zip)
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard icon={<Users size={24} />} label="Total Students" value={stats.total} color="blue" />
          <StatCard icon={<Clock size={24} />} label="Not Started" value={stats.notStarted} color="gray" />
          <StatCard icon={<Filter size={24} />} label="Writing" value={stats.writing} color="orange" />
          <StatCard icon={<CheckCircle size={24} />} label="Submitted" value={stats.submitted} color="green" />
        </div>

        {/* Controls */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name or ID code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="flex gap-2">
            <FilterButton active={filterStatus === 'ALL'} onClick={() => setFilterStatus('ALL')}>All</FilterButton>
            <FilterButton active={filterStatus === 'NOT_STARTED'} onClick={() => setFilterStatus('NOT_STARTED')}>Not Started</FilterButton>
            <FilterButton active={filterStatus === 'DRAFT'} onClick={() => setFilterStatus('DRAFT')}>Writing</FilterButton>
            <FilterButton active={filterStatus === 'SUBMITTED'} onClick={() => setFilterStatus('SUBMITTED')}>Submitted</FilterButton>
          </div>
        </div>

        {/* Student Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStudents.map(student => {
            const sub = submissions[student.id];
            const status = sub ? sub.status : 'NOT_STARTED';
            
            return (
              <div key={student.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 border-2 border-white shadow-sm">
                    <img src={`/src/assets/avatars/${student.avatar_id}.svg`} alt={student.name} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 truncate">{student.name}</h3>
                    <p className="text-xs text-gray-500">ID: {student.id_code} | {student.class_group}</p>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center">
                  <StatusBadge status={status} />
                  {status === 'SUBMITTED' && (
                    <button
                      onClick={() => handleUnlock(sub.id)}
                      className="p-2 text-gray-400 hover:text-orange-600 transition-colors"
                      title="Return to Draft"
                    >
                      <Unlock size={18} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    gray: 'bg-gray-50 text-gray-600',
    orange: 'bg-orange-50 text-orange-600',
    green: 'bg-green-50 text-green-600'
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`p-4 rounded-xl ${colors[color]}`}>{icon}</div>
      <div>
        <span className="block text-3xl font-bold text-gray-800">{value}</span>
        <span className="text-sm text-gray-500 font-medium uppercase tracking-wider">{label}</span>
      </div>
    </div>
  );
};

const FilterButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
      active ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
    }`}
  >
    {children}
  </button>
);

const StatusBadge = ({ status }) => {
  const configs = {
    NOT_STARTED: { label: 'Not Started', color: 'bg-gray-100 text-gray-600' },
    DRAFT: { label: 'Writing...', color: 'bg-orange-100 text-orange-700 animate-pulse' },
    SUBMITTED: { label: 'Submitted', color: 'bg-green-100 text-green-700' }
  };

  const config = configs[status] || configs.NOT_STARTED;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${config.color}`}>
      {config.label}
    </span>
  );
};

export default TeacherDashboard;
