import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { teacherApi, rosterApi } from '../../services/api';
import { Check, X, ChevronDown, Eye, Edit2 } from 'lucide-react';
import SplitScreenLayout from '../../components/Editor/SplitScreenLayout';
import Editor from '../../components/Editor/Editor';

const ProjectBuilder = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    genre: 'NARRATIVE',
    instructions: '',
    stimulus_html: '',
    assigned_class_groups: [],
    is_active: true
  });
  const [availableClassGroups, setAvailableClassGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const classGroupsRes = await rosterApi.getClassGroups();
        setAvailableClassGroups(classGroupsRes.data);

        if (projectId) {
          const projectRes = await teacherApi.getProject(projectId);
          const project = projectRes.data;
          setFormData({
            title: project.title,
            genre: project.genre,
            instructions: project.instructions,
            stimulus_html: project.stimulus_html,
            assigned_class_groups: project.assigned_class_groups,
            is_active: project.is_active
          });
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load necessary details.');
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, [projectId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleClassGroup = (group) => {
    setFormData(prev => {
      const groups = prev.assigned_class_groups.includes(group)
        ? prev.assigned_class_groups.filter(g => g !== group)
        : [...prev.assigned_class_groups, group];
      return { ...prev, assigned_class_groups: groups };
    });
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
    if (formData.assigned_class_groups.length === 0) {
      setError('Please select at least one class group.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (projectId) {
        await teacherApi.updateProject(projectId, formData);
      } else {
        await teacherApi.createProject(formData);
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
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {projectId ? 'Edit Assessment' : 'Create New Assessment'}
            </h1>
            <p className="text-gray-500 mt-1">Configure your NAPLAN-style writing prompt</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsPreview(!isPreview)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all shadow-sm border ${isPreview
                ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
            >
              {isPreview ? (
                <>
                  <Edit2 size={18} />
                  <span>Back to Editor</span>
                </>
              ) : (
                <>
                  <Eye size={18} />
                  <span>Preview Student View</span>
                </>
              )}
            </button>
            <button
              onClick={() => navigate('/teacher/projects')}
              className="text-gray-400 hover:text-gray-600 p-2"
              title="Cancel"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {isPreview ? (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            {/* Mock Student Header */}
            <header className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 -mx-8 -mt-8 mb-8 px-8 py-4 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <span className="material-symbols-outlined text-xl">person</span>
                </div>
                <div>
                  <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Preview Student</h2>
                  <p className="text-sm font-bold text-gray-700">Alex Sample</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-white border border-gray-200 shadow-sm">
                <span className="material-symbols-outlined text-blue-500 text-lg">timer</span>
                <span className="text-lg font-bold font-mono text-gray-700">40:00</span>
              </div>
            </header>

            <div className="border border-gray-200 rounded-2xl overflow-hidden h-[600px] shadow-inner bg-white">
              <SplitScreenLayout stimulus={formData}>
                <Editor
                  value=""
                  onChange={() => { }}
                  disabled={true}
                  saving={false}
                />
              </SplitScreenLayout>
            </div>
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => setIsPreview(false)}
                className="text-blue-600 font-semibold hover:underline flex items-center gap-2"
              >
                <Edit2 size={16} />
                Return to Editor to make changes
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-300">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Assign to Class Groups</label>
              {availableClassGroups.length > 0 ? (
                <div className="relative" ref={dropdownRef}>
                  {/* Custom Multi-select Dropdown */}
                  <div
                    className="min-h-[42px] w-full px-2 py-1.5 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 bg-white cursor-pointer flex flex-wrap gap-2 items-center transition-all"
                    onClick={() => !loading && setIsDropdownOpen(!isDropdownOpen)}
                  >
                    {formData.assigned_class_groups.length > 0 ? (
                      formData.assigned_class_groups.map(group => (
                        <span
                          key={group}
                          className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md text-sm font-bold flex items-center gap-1"
                        >
                          {group}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleClassGroup(group);
                            }}
                            className="hover:text-blue-900"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 px-2 text-sm italic">Select class groups...</span>
                    )}
                    <div className="flex-grow"></div>
                    <ChevronDown size={18} className={`text-gray-400 mr-2 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div
                      className="absolute z-50 top-full left-0 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200"
                      style={{ maxHeight: '240px' }}
                    >
                      <div className="p-2 border-b border-gray-100 sticky top-0 bg-white">
                        <input
                          type="text"
                          placeholder="Filter groups..."
                          className="w-full px-3 py-1.5 text-sm border-none focus:ring-0 outline-none"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            const items = document.querySelectorAll('.dropdown-item');
                            const term = e.target.value.toLowerCase();
                            items.forEach(item => {
                              const text = item.textContent.toLowerCase();
                              item.classList.toggle('hidden', !text.includes(term));
                            });
                          }}
                        />
                      </div>
                      {availableClassGroups.map(group => (
                        <div
                          key={group}
                          className={`dropdown-item flex items-center justify-between px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors ${formData.assigned_class_groups.includes(group) ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-700'
                            }`}
                          onClick={() => toggleClassGroup(group)}
                        >
                          <span>{group}</span>
                          {formData.assigned_class_groups.includes(group) && <Check size={16} />}
                        </div>
                      ))}
                      {availableClassGroups.length === 0 && (
                        <div className="px-4 py-3 text-sm text-gray-500 italic">No groups found</div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl text-orange-700 text-sm">
                  No class groups found in the roster. Please upload a roster first.
                </div>
              )}
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
                disabled={loading || availableClassGroups.length === 0}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-md disabled:opacity-50"
              >
                {loading ? 'Saving...' : (projectId ? 'Save Changes' : 'Create Project')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProjectBuilder;
