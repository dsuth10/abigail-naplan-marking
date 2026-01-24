import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { teacherApi, studentApi, submissionApi } from '../../services/api';

const TeacherProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, studentsRes, submissionsRes] = await Promise.all([
          teacherApi.getProjects(),
          studentApi.listStudents(),
          submissionApi.getAllSubmissions(),
        ]);
        setProjects(projectsRes.data);
        setStudents(studentsRes.data);
        setSubmissions(submissionsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = useMemo(() => {
    const totalStudents = students.length;
    const activeProjects = projects.filter(p => p.is_active).length;
    const pendingReviews = submissions.filter(s => s.status === 'DRAFT').length;
    const completed = submissions.filter(s => s.status === 'SUBMITTED').length;
    const completionRate = totalStudents > 0 ? Math.round((completed / totalStudents) * 100) : 0;

    return {
      totalStudents,
      activeProjects,
      pendingReviews,
      completed: `${completionRate}%`,
    };
  }, [projects, students, submissions]);

  const getProjectStats = (project) => {
    const projectSubmissions = submissions.filter(s => s.project_id === project.id);
    const totalAssigned = students.filter(s => 
      project.assigned_class_groups?.includes(s.class_group)
    ).length;
    const submitted = projectSubmissions.filter(s => s.status === 'SUBMITTED').length;
    const progress = totalAssigned > 0 ? Math.round((submitted / totalAssigned) * 100) : 0;
    
    return { totalAssigned, submitted, progress };
  };

  const getProjectStatus = (project) => {
    if (!project.is_active) return { label: 'Scheduled', color: 'gray' };
    const projectSubmissions = submissions.filter(s => s.project_id === project.id);
    const hasDrafts = projectSubmissions.some(s => s.status === 'DRAFT');
    if (hasDrafts) return { label: 'Writing', color: 'blue' };
    return { label: 'Grading', color: 'amber' };
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-[#111418] dark:text-white text-3xl md:text-4xl font-bold tracking-tight font-display">
            Welcome back, Teacher
          </h2>
          <p className="text-[#617589] dark:text-gray-400 text-base font-body">
            Here is what's happening with your writing classes today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/teacher/projects/new')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#dbe0e6] dark:border-gray-700 bg-white dark:bg-[#1a2632] text-[#111418] dark:text-white text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-display"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add</span>
            <span>New Project</span>
          </button>
          <button
            onClick={() => navigate('/teacher/roster')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-blue-600 transition-colors shadow-sm shadow-blue-200 dark:shadow-none font-display"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>upload_file</span>
            <span>Upload Class CSV</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex flex-col gap-1 p-5 rounded-2xl bg-white dark:bg-[#1a2632] border border-[#dbe0e6] dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-primary">
              <span className="material-symbols-outlined">groups</span>
            </div>
            <p className="text-[#617589] dark:text-gray-400 text-sm font-medium font-body">Total Students</p>
          </div>
          <p className="text-3xl font-bold text-[#111418] dark:text-white pl-1 font-display">{stats.totalStudents}</p>
        </div>
        <div className="flex flex-col gap-1 p-5 rounded-2xl bg-white dark:bg-[#1a2632] border border-[#dbe0e6] dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600">
              <span className="material-symbols-outlined">edit_document</span>
            </div>
            <p className="text-[#617589] dark:text-gray-400 text-sm font-medium font-body">Active Projects</p>
          </div>
          <p className="text-3xl font-bold text-[#111418] dark:text-white pl-1 font-display">{stats.activeProjects}</p>
        </div>
        <div className="flex flex-col gap-1 p-5 rounded-2xl bg-white dark:bg-[#1a2632] border border-[#dbe0e6] dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-600">
              <span className="material-symbols-outlined">rate_review</span>
            </div>
            <p className="text-[#617589] dark:text-gray-400 text-sm font-medium font-body">Pending Reviews</p>
          </div>
          <p className="text-3xl font-bold text-[#111418] dark:text-white pl-1 font-display">{stats.pendingReviews}</p>
        </div>
        <div className="flex flex-col gap-1 p-5 rounded-2xl bg-white dark:bg-[#1a2632] border border-[#dbe0e6] dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600">
              <span className="material-symbols-outlined">check_circle</span>
            </div>
            <p className="text-[#617589] dark:text-gray-400 text-sm font-medium font-body">Completed</p>
          </div>
          <p className="text-3xl font-bold text-[#111418] dark:text-white pl-1 font-display">{stats.completed}</p>
        </div>
      </div>

      {/* Main Section: Active Projects */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-[#111418] dark:text-white font-display">Active Projects</h3>
          <button
            onClick={() => navigate('/teacher/projects')}
            className="text-primary dark:text-blue-400 text-sm font-semibold hover:underline font-display"
          >
            View all
          </button>
        </div>
        {projects.length === 0 ? (
          <div className="bg-white dark:bg-[#1a2632] p-12 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 text-center">
            <p className="text-xl text-gray-400 dark:text-gray-300 mb-6 font-body">You haven't created any assessments yet.</p>
            <button
              onClick={() => navigate('/teacher/projects/new')}
              className="text-primary dark:text-blue-400 font-bold hover:underline font-display"
            >
              Create your first assessment
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#1a2632] rounded-2xl border border-[#dbe0e6] dark:border-gray-800 shadow-sm overflow-hidden">
            {projects.slice(0, 3).map((project, index) => {
              const projectStats = getProjectStats(project);
              const status = getProjectStatus(project);
              const statusColors = {
                blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
                amber: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
                gray: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
              };

              return (
                <div
                  key={project.id}
                  className={`p-6 ${index < projects.length - 1 ? 'border-b border-[#f0f2f4] dark:border-gray-800' : ''} hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors`}
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    {/* Icon */}
                    <div className="hidden md:flex shrink-0 size-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 items-center justify-center text-primary">
                      <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>menu_book</span>
                    </div>
                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                        <h4 className="text-lg font-bold text-[#111418] dark:text-white truncate font-display">
                          {project.title}
                        </h4>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold w-fit ${statusColors[status.color]}`}>
                          {status.label === 'Writing' && (
                            <span className="size-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                          )}
                          {status.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-[#617589] dark:text-gray-400 font-body">
                        {project.due_date && <span>Due: {formatDate(project.due_date)}</span>}
                        {project.due_date && project.assigned_class_groups && (
                          <span className="text-gray-300 dark:text-gray-700">•</span>
                        )}
                        {project.assigned_class_groups && (
                          <span>{project.assigned_class_groups.join(', ')}</span>
                        )}
                      </div>
                    </div>
                    {/* Progress & Stats */}
                    <div className="flex flex-col gap-2 min-w-[200px]">
                      <div className="flex justify-between text-sm font-medium font-body">
                        <span className="text-[#111418] dark:text-white">Progress</span>
                        <span className="text-primary dark:text-blue-400">{projectStats.submitted}/{projectStats.totalAssigned} Submitted</span>
                      </div>
                      <div className="h-2 w-full bg-[#f0f2f4] dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${projectStats.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-2 self-start md:self-center ml-auto md:ml-0">
                      <button
                        onClick={() => navigate(`/teacher/dashboard/${project.id}`)}
                        className="p-2 text-[#617589] dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <span className="material-symbols-outlined">more_vert</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default TeacherProjectList;
