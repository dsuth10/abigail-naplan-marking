import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentApi } from '../../services/api';
import SplitScreenLayout from '../../components/Editor/SplitScreenLayout';
import Editor from '../../components/Editor/Editor';
import ThemeToggle from '../../components/ThemeToggle';
import { debounce } from 'lodash';

const AssessmentPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [student, setStudent] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(40 * 60); // 40 minutes in seconds

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, studentRes, subRes] = await Promise.all([
          studentApi.getProject(projectId),
          studentApi.getMe(),
          studentApi.getSubmission(projectId),
        ]);
        setProject(projRes.data);
        setStudent(studentRes.data);
        if (subRes.data) {
          setSubmission(subRes.data);
          setContent(subRes.data.content_raw);
        }
      } catch (error) {
        console.error('Error fetching assessment data:', error);
        navigate('/projects');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [projectId, navigate]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining <= 0 || submission?.status === 'SUBMITTED') return;
    
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining, submission]);

  // Debounced autosave
  const debouncedSave = useCallback(
    debounce(async (newContent) => {
      setSaving(true);
      try {
        await studentApi.updateDraft(projectId, newContent);
      } catch (error) {
        console.error('Error autosaving:', error);
      } finally {
        setSaving(false);
      }
    }, 2000),
    [projectId]
  );

  const handleContentChange = (newContent) => {
    setContent(newContent);
    debouncedSave(newContent);
  };

  const handleSubmit = async () => {
    if (!window.confirm('Are you sure you want to finish your assessment? You won\'t be able to edit it anymore.')) {
      return;
    }

    try {
      await studentApi.submitProject(projectId);
      navigate('/projects');
    } catch (error) {
      console.error('Error submitting:', error);
      alert('Failed to submit. Please try again.');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background-light dark:bg-background-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isSubmitted = submission?.status === 'SUBMITTED';

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background-light dark:bg-background-dark text-[#111418] dark:text-white font-display">
      {/* Global Assessment Header */}
      <header className="shrink-0 flex items-center justify-between border-b border-solid border-[#e5e7eb] dark:border-gray-800 bg-white dark:bg-[#1a2634] px-6 py-3 h-18 shadow-sm z-10">
        {/* Left: Student Info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-full bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-2xl">person</span>
          </div>
          <div>
            <h2 className="text-sm font-medium text-slate-500 dark:text-slate-300 leading-tight font-body">Student</h2>
            <p className="text-base font-bold leading-tight font-display">{student?.name || 'Student'}</p>
          </div>
        </div>
        
        {/* Center: Timer */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700">
            <span className="material-symbols-outlined text-primary text-xl">timer</span>
            <span className="text-xl font-bold tracking-tight font-mono text-slate-800 dark:text-slate-100">
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>
        
        {/* Right: Actions & Stats */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-xs font-medium text-slate-400 dark:text-slate-300 uppercase tracking-wider font-body">Word Count</span>
            <span className="text-base font-bold font-display">{wordCount}</span>
          </div>
          <button
            onClick={handleSubmit}
            disabled={isSubmitted}
            className="flex items-center justify-center gap-2 h-10 px-6 cursor-pointer overflow-hidden rounded-lg bg-primary hover:bg-primary/90 transition-colors text-white text-sm font-bold leading-normal tracking-[0.015em] shadow-sm shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed font-display"
          >
            <span>Finish Assessment</span>
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
          </button>
        </div>
      </header>

      {/* Main Split Layout */}
      <main className="flex-1 overflow-hidden">
        <SplitScreenLayout stimulus={project}>
          <Editor
            value={content}
            onChange={handleContentChange}
            disabled={isSubmitted}
            saving={saving}
          />
        </SplitScreenLayout>
      </main>
    </div>
  );
};

export default AssessmentPage;
