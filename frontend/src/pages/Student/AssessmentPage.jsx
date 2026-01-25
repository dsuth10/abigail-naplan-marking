import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentApi } from '../../services/api';
import SplitScreenLayout from '../../components/Editor/SplitScreenLayout';
import Editor from '../../components/Editor/Editor';
import { debounce } from 'lodash';


const AssessmentPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [student, setStudent] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [content, setContent] = useState('');
  const [plainText, setPlainText] = useState('');
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
          // Prioritize HTML content, fallback to raw
          const initialHtml = subRes.data.content_html || subRes.data.content_raw;
          setContent(initialHtml);
          setPlainText(subRes.data.content_raw || '');
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
  const debouncedSave = useMemo(
    () => debounce(async (contentData) => {
      setSaving(true);
      try {
        await studentApi.updateDraft(projectId, {
          content_raw: contentData.text,
          content_html: contentData.html,
          content_json: contentData.json
        });
      } catch (error) {
        console.error('Error autosaving:', error);
      } finally {
        setSaving(false);
      }
    }, 2000),
    [projectId]
  );

  const handleContentChange = (contentData) => {
    setContent(contentData.html);
    setPlainText(contentData.text);
    debouncedSave(contentData);
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

  const wordCount = plainText.trim().split(/\s+/).filter(word => word.length > 0).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background-light dark:bg-background-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isSubmitted = submission?.status === 'SUBMITTED';

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background text-slate-900 font-body">
      {/* Global Assessment Header */}
      <header className="shrink-0 flex items-center justify-between border-b border-border bg-white px-8 py-4 h-20 shadow-sm z-10">
        {/* Left: Student Info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-12 rounded-full bg-primary/10 text-primary border-2 border-primary/5">
            <span className="material-symbols-outlined text-2xl">person</span>
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Student</h2>
            <p className="text-lg font-display font-bold text-slate-900 leading-tight">{student?.name || 'Student'}</p>
          </div>
        </div>

        {/* Center: Timer */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="flex items-center gap-2.5 px-6 py-2 rounded-2xl bg-slate-50 border-2 border-slate-100 shadow-sm">
            <span className="material-symbols-outlined text-primary text-2xl">timer</span>
            <span className="text-2xl font-bold tracking-tight font-mono text-slate-900">
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>

        {/* Right: Actions & Stats */}
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end hidden lg:flex">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Word Count</span>
            <span className="text-lg font-display font-bold text-slate-900 leading-tight">{wordCount}</span>
          </div>
          <button
            onClick={handleSubmit}
            disabled={isSubmitted}
            className="btn-primary"
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
