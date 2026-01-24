import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentApi } from '../../services/api';
import SplitScreenLayout from '../../components/Editor/SplitScreenLayout';
import Editor from '../../components/Editor/Editor';
import { debounce } from 'lodash';

const AssessmentPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, subRes] = await Promise.all([
          studentApi.getProject(projectId),
          studentApi.getSubmission(projectId),
        ]);
        setProject(projRes.data);
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
    if (!window.confirm('Are you sure you want to submit your writing? You won\'t be able to edit it anymore.')) {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isSubmitted = submission?.status === 'SUBMITTED';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/projects')}
            className="text-gray-500 hover:text-gray-700 font-medium flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Projects
          </button>
          <div className="h-6 w-px bg-gray-200"></div>
          <h1 className="text-xl font-bold text-gray-800">{project.title}</h1>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${project.genre === 'NARRATIVE' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
            }`}>
            {project.genre}
          </span>
        </div>

        <div className="flex items-center gap-6">
          {saving && <span className="text-sm text-blue-500 animate-pulse font-medium">Saving...</span>}
          {isSubmitted ? (
            <span className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              SUBMITTED
            </span>
          ) : (
            <button
              onClick={handleSubmit}
              className="bg-green-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-green-700 transition-all shadow-md transform hover:scale-105"
            >
              Submit My Writing
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <SplitScreenLayout stimulus={project}>
          <Editor
            value={content}
            onChange={handleContentChange}
            disabled={isSubmitted}
          />
        </SplitScreenLayout>
      </main>
    </div>
  );
};

export default AssessmentPage;
