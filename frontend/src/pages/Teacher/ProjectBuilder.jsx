import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { teacherApi } from '../../services/api';

const ProjectBuilder = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    genre: 'NARRATIVE',
    instructions: '',
    stimulus_html: '',
    assigned_class_groups: '',
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!projectId);
  const [error, setError] = useState('');

  useEffect(() => {
    if (projectId) {
      const fetchProject = async () => {
        try {
          const response = await teacherApi.getProject(projectId);
          const project = response.data;
          setFormData({
            title: project.title,
            genre: project.genre,
            instructions: project.instructions,
            stimulus_html: project.stimulus_html,
            assigned_class_groups: project.assigned_class_groups.join(', '),
            is_active: project.is_active
          });
        } catch (err) {
          console.error('Error fetching project:', err);
          setError('Failed to load project details.');
        } finally {
          setFetching(false);
        }
      };
      fetchProject();
    }
  }, [projectId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAssetUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    try {
      const response = await teacherApi.uploadAsset(uploadFormData);
      const imgTag = `<img src="${response.data.path}" alt="Stimulus" class="max-w-full h-auto rounded-lg shadow-md my-4" />`;
      setFormData(prev => ({
        ...prev,
        stimulus_html: prev.stimulus_html + imgTag
      }));
    } catch (err) {
      console.error('Error uploading asset:', err);
      alert('Failed to upload image.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      ...formData,
      assigned_class_groups: formData.assigned_class_groups.split(',').map(s => s.trim()).filter(s => s !== '')
    };

    try {
      if (projectId) {
        await teacherApi.updateProject(projectId, payload);
      } else {
        await teacherApi.createProject(payload);
      }
      navigate('/teacher/projects');
    } catch (err) {
      console.error('Error saving project:', err);
      setError('Failed to save project. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            {projectId ? 'Edit Assessment' : 'Create New Assessment'}
          </h1>
          <button
            onClick={() => navigate('/teacher/projects')}
            className="text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Project Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. Narrative Writing Assessment"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Genre</label>
              <select
                name="genre"
                value={formData.genre}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="NARRATIVE">Narrative</option>
                <option value="PERSUASIVE">Persuasive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Class Groups (comma separated)</label>
            <input
              type="text"
              name="assigned_class_groups"
              value={formData.assigned_class_groups}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. 5A, 5B, 6C"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Instructions (Markdown or Text)</label>
            <textarea
              name="instructions"
              value={formData.instructions}
              onChange={handleInputChange}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Provide instructions for the students..."
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Stimulus Content (HTML)</label>
              <label className="cursor-pointer bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors">
                Upload Stimulus Image
                <input type="file" onChange={handleAssetUpload} className="hidden" accept="image/*" />
              </label>
            </div>
            <textarea
              name="stimulus_html"
              value={formData.stimulus_html}
              onChange={handleInputChange}
              rows="8"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="<p>Enter the stimulus text or upload images above...</p>"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

          <div className="flex justify-end pt-6">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-md disabled:opacity-50"
            >
              {loading ? 'Saving...' : (projectId ? 'Save Changes' : 'Create Project')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectBuilder;
