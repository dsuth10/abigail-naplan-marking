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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-10 px-6 lg:px-12">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <button
              onClick={() => navigate('/teacher/projects')}
              className="flex items-center gap-2 text-slate-400 hover:text-primary mb-4 transition-all font-bold uppercase tracking-wider text-xs"
            >
              <ArrowLeft size={16} />
              Back to Projects
            </button>
            <h1 className="text-5xl font-display font-bold text-slate-900 mb-2">{project.title}</h1>
            <p className="text-lg text-slate-500 font-medium tracking-tight">Monitoring live progress for classes: <span className="text-primary font-bold">{project.assigned_class_groups.join(', ')}</span></p>
          </div>
          <button
            onClick={handleExport}
            className="btn-primary bg-success hover:bg-success/90 shadow-success/20"
          >
            <Download size={20} className="mr-2" />
            Export Submissions (.zip)
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <StatCard icon={<Users size={28} />} label="Total Students" value={stats.total} color="blue" />
          <StatCard icon={<Clock size={28} />} label="Not Started" value={stats.notStarted} color="gray" />
          <StatCard icon={<Filter size={28} />} label="Writing" value={stats.writing} color="orange" />
          <StatCard icon={<CheckCircle size={28} />} label="Submitted" value={stats.submitted} color="green" />
        </div>

        {/* Controls */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-border mb-10 flex flex-col md:flex-row gap-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search by name or ID code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border-2 border-transparent focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 rounded-2xl outline-none transition-all font-medium"
            />
          </div>
          <div className="flex gap-3">
            <FilterButton active={filterStatus === 'ALL'} onClick={() => setFilterStatus('ALL')}>All</FilterButton>
            <FilterButton active={filterStatus === 'NOT_STARTED'} onClick={() => setFilterStatus('NOT_STARTED')}>Not Started</FilterButton>
            <FilterButton active={filterStatus === 'DRAFT'} onClick={() => setFilterStatus('DRAFT')}>Writing</FilterButton>
            <FilterButton active={filterStatus === 'SUBMITTED'} onClick={() => setFilterStatus('SUBMITTED')}>Submitted</FilterButton>
          </div>
        </div>

        {/* Student Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
          {filteredStudents.map(student => {
            const sub = submissions[student.id];
            const status = sub ? sub.status : 'NOT_STARTED';

            return (
              <div key={student.id} className="card-premium flex flex-col group p-6 hover:shadow-2xl">
                <div className="flex items-center gap-5 mb-6">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-primary/5 border-2 border-primary/10 shadow-sm group-hover:scale-110 transition-transform">
                    <img src={`/src/assets/avatars/${student.avatar_id}.svg`} alt={student.name} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-bold text-slate-900 group-hover:text-primary transition-colors truncate">{student.name}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{student.class_group}</p>
                  </div>
                </div>

                <div className="mt-auto flex justify-between items-center">
                  <StatusBadge status={status} />
                  {status === 'SUBMITTED' && (
                    <button
                      onClick={() => handleUnlock(sub.id)}
                      className="p-2 text-slate-300 hover:text-secondary hover:bg-secondary/10 rounded-lg transition-all"
                      title="Return to Draft"
                    >
                      <Unlock size={20} />
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
  const configs = {
    blue: 'bg-primary/10 text-primary border-primary/10',
    gray: 'bg-slate-100 text-slate-500 border-slate-200',
    orange: 'bg-secondary/10 text-secondary border-secondary/10',
    green: 'bg-success/10 text-success border-success/10'
  };

  return (
    <div className={`card-premium p-6 flex flex-col gap-6 group hover:translate-y-0 hover:shadow-lg`}>
      <div className={`size-14 rounded-2xl flex items-center justify-center ${configs[color].split(' ')[0]} ${configs[color].split(' ')[1]}`}>
        {icon}
      </div>
      <div>
        <span className="block text-4xl font-display font-bold text-slate-900 mb-1">{value}</span>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</span>
      </div>
    </div>
  );
};

const FilterButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all uppercase tracking-wider ${active
        ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-105'
        : 'bg-white text-slate-400 border-2 border-border hover:border-primary/20 hover:text-slate-600'
      }`}
  >
    {children}
  </button>
);

const StatusBadge = ({ status }) => {
  const configs = {
    NOT_STARTED: { label: 'Not Started', color: 'bg-slate-100 text-slate-500' },
    DRAFT: { label: 'Writing Now', color: 'bg-secondary/10 text-secondary animate-pulse' },
    SUBMITTED: { label: 'Submitted', color: 'bg-success/10 text-success' }
  };

  const config = configs[status] || configs.NOT_STARTED;

  return (
    <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-current/10 ${config.color}`}>
      {config.label}
    </span>
  );
};

export default TeacherDashboard;
