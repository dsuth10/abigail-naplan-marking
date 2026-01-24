import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { rosterApi } from '../../services/api';
import { Upload, FileText, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

const Rostering = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile);
      setError('');
    } else {
      setFile(null);
      setError('Please select a valid CSV file.');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await rosterApi.uploadRoster(formData);
      setResults(response.data);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.detail || 'Failed to upload roster.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate('/teacher/projects')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Student Rostering</h1>
          <p className="text-gray-500 mb-8">Upload a CSV file to bulk-import students into the system.</p>

          {!results ? (
            <div className="space-y-6">
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center transition-colors hover:border-blue-400">
                <input
                  type="file"
                  id="csv-upload"
                  className="hidden"
                  accept=".csv"
                  onChange={handleFileChange}
                />
                <label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                    <Upload size={32} />
                  </div>
                  <span className="text-lg font-semibold text-gray-700">
                    {file ? file.name : 'Click to select CSV file'}
                  </span>
                  <span className="text-sm text-gray-400 mt-2">
                    Required columns: Name, Year Level, ID Code, Class Group, Password, Avatar ID
                  </span>
                </label>
              </div>

              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-xl">
                  <AlertCircle size={20} />
                  <p className="font-medium">{error}</p>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Uploading...
                    </>
                  ) : (
                    'Upload Roster'
                  )}
                </button>
              </div>

              <div className="mt-8 p-6 bg-blue-50 rounded-xl">
                <h3 className="text-blue-800 font-bold mb-3 flex items-center gap-2">
                  <FileText size={18} />
                  CSV Format Instructions
                </h3>
                <p className="text-blue-700 text-sm leading-relaxed">
                  The CSV should have a header row. Each student needs a unique <strong>ID Code</strong>. 
                  The <strong>Avatar ID</strong> should match one of the predefined images (e.g., avatar1, avatar2).
                </p>
                <div className="mt-4 overflow-x-auto">
                  <code className="text-xs bg-white p-2 block rounded border border-blue-100 whitespace-nowrap">
                    Name,Year Level,ID Code,Class Group,Password,Avatar ID<br />
                    John Doe,5,JD001,5A,password123,avatar1<br />
                    Jane Smith,5,JS002,5A,securePass,avatar2
                  </code>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex items-center justify-center p-8 bg-green-50 rounded-2xl border border-green-100">
                <div className="text-center">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={40} />
                  </div>
                  <h2 className="text-2xl font-bold text-green-800">Upload Successful</h2>
                  <div className="mt-4 grid grid-cols-3 gap-8">
                    <div>
                      <span className="block text-3xl font-bold text-green-700">{results.total}</span>
                      <span className="text-sm text-green-600 uppercase tracking-wider font-semibold">Total</span>
                    </div>
                    <div>
                      <span className="block text-3xl font-bold text-green-700">{results.created}</span>
                      <span className="text-sm text-green-600 uppercase tracking-wider font-semibold">Created</span>
                    </div>
                    <div>
                      <span className="block text-3xl font-bold text-green-700">{results.updated}</span>
                      <span className="text-sm text-green-600 uppercase tracking-wider font-semibold">Updated</span>
                    </div>
                  </div>
                </div>
              </div>

              {results.errors.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <AlertCircle className="text-orange-500" size={24} />
                    Issues Encountered ({results.errors.length})
                  </h3>
                  <div className="bg-orange-50 border border-orange-100 rounded-xl overflow-hidden">
                    <ul className="divide-y divide-orange-100 max-h-64 overflow-y-auto">
                      {results.errors.map((err, i) => (
                        <li key={i} className="p-4 text-orange-800 text-sm font-medium">
                          {err}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setResults(null)}
                  className="px-6 py-2 border border-gray-300 rounded-lg font-semibold text-gray-600 hover:bg-gray-50 transition-all"
                >
                  Upload Another File
                </button>
                <button
                  onClick={() => navigate('/teacher/projects')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-md"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Rostering;
