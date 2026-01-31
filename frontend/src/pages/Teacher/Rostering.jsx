import React, { useState, useEffect, useMemo } from 'react';
import { rosterApi, studentApi } from '../../services/api';
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Users,
  Search,
  Filter,
  UserPlus,
  ArrowUpDown,
  GraduationCap
} from 'lucide-react';

const Rostering = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  // Upload State
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  // Filter/Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await studentApi.listStudents();
      setStudents(response.data);
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

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
      // Refresh students after successful upload
      await fetchStudents();
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.detail || 'Failed to upload roster.');
    } finally {
      setUploading(false);
    }
  };

  const classGroups = useMemo(() => {
    const groups = new Set(students.map(s => s.class_group));
    return ['All', ...Array.from(groups).sort()];
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.id_code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesClass = selectedClass === 'All' || student.class_group === selectedClass;
      return matchesSearch && matchesClass;
    });
  }, [students, searchTerm, selectedClass]);

  const stats = useMemo(() => {
    return {
      total: students.length,
      classes: new Set(students.map(s => s.class_group)).size,
      yearLevels: new Set(students.map(s => s.year_level)).size
    };
  }, [students]);

  if (loading && students.length === 0) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display">Student Roster</h1>
          <p className="text-slate-500 dark:text-slate-400 font-body">Manage your students and class groups.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setShowUpload(!showUpload);
              setResults(null);
              setFile(null);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all font-display ${showUpload
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                : 'bg-primary text-white shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-600'
              }`}
          >
            {showUpload ? (
              <><ArrowLeft size={18} /> Back to Roster</>
            ) : (
              <><UserPlus size={18} /> Import Students</>
            )}
          </button>
        </div>
      </div>

      {showUpload ? (
        /* Upload Interface */
        <div className="max-w-3xl mx-auto w-full">
          <div className="bg-white dark:bg-[#1a2632] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 font-display">Bulk Import Students</h2>

            {!results ? (
              <div className="space-y-6">
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center transition-colors hover:border-primary">
                  <input
                    type="file"
                    id="csv-upload"
                    className="hidden"
                    accept=".csv"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center">
                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
                      <Upload size={32} />
                    </div>
                    <span className="text-lg font-bold text-slate-700 dark:text-slate-200 font-display">
                      {file ? file.name : 'Click to select CSV file'}
                    </span>
                    <span className="text-sm text-slate-400 mt-2 font-body">
                      CSV format required with header row
                    </span>
                  </label>
                </div>

                {error && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/30">
                    <AlertCircle size={20} />
                    <p className="font-medium text-sm font-body">{error}</p>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-600 transition-all shadow-md disabled:opacity-50 flex items-center gap-2 font-display"
                  >
                    {uploading ? 'Processing...' : 'Upload Roster'}
                  </button>
                </div>

                <div className="p-6 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800">
                  <h3 className="text-slate-900 dark:text-slate-200 font-bold mb-3 flex items-center gap-2 font-display">
                    <FileText size={18} className="text-primary" />
                    CSV Format Instructions
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-4 font-body">
                    The CSV should have a header row. Each student needs a unique <strong>ID Code</strong>.
                    The <strong>Avatar ID</strong> should match one of the predefined images (avatar-1 to avatar-20).
                  </p>
                  <div className="overflow-x-auto">
                    <code className="text-[10px] bg-white dark:bg-slate-950 p-3 block rounded-lg border border-slate-200 dark:border-slate-800 whitespace-nowrap text-slate-600 dark:text-slate-400 font-mono">
                      Name,Year Level,ID Code,Class Group,Password,Avatar ID<br />
                      John Doe,5,JD001,5A,password123,avatar-1<br />
                      Jane Smith,5,JS002,5A,securePass,avatar-2
                    </code>
                  </div>
                </div>
              </div>
            ) : (
              /* Upload Results */
              <div className="space-y-8">
                <div className="flex items-center justify-center p-8 bg-green-50 dark:bg-green-900/10 rounded-2xl border border-green-100 dark:border-green-900/20 text-center">
                  <div>
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-green-800 dark:text-green-400 font-display">Import Successful</h2>
                    <div className="mt-6 flex justify-center gap-10">
                      <div>
                        <span className="block text-3xl font-bold text-green-900 dark:text-green-200 font-display">{results.total}</span>
                        <span className="text-xs text-green-600 font-bold uppercase tracking-widest font-body">Total</span>
                      </div>
                      <div>
                        <span className="block text-3xl font-bold text-green-900 dark:text-green-200 font-display">{results.created}</span>
                        <span className="text-xs text-green-600 font-bold uppercase tracking-widest font-body">Created</span>
                      </div>
                      <div>
                        <span className="block text-3xl font-bold text-green-900 dark:text-green-200 font-display">{results.updated}</span>
                        <span className="text-xs text-green-600 font-bold uppercase tracking-widest font-body">Updated</span>
                      </div>
                    </div>
                  </div>
                </div>

                {results.errors.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 font-display">
                      <AlertCircle className="text-orange-500" size={20} />
                      Issues Encountered ({results.errors.length})
                    </h3>
                    <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 rounded-xl overflow-hidden">
                      <ul className="divide-y divide-orange-100 dark:divide-orange-900/30 max-h-48 overflow-y-auto font-body">
                        {results.errors.map((err, i) => (
                          <li key={i} className="p-3 text-orange-800 dark:text-orange-300 text-xs font-medium">
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
                    className="px-6 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-display"
                  >
                    Upload Another
                  </button>
                  <button
                    onClick={() => setShowUpload(false)}
                    className="px-8 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-blue-600 shadow-lg shadow-blue-200 dark:shadow-none font-display"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Student List Interface */
        <div className="flex flex-col gap-6">
          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-[#1a2632] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-primary">
                <Users size={24} />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 dark:text-white font-display leading-none mb-1">{stats.total}</p>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest font-body">Total Students</p>
              </div>
            </div>
            <div className="bg-white dark:bg-[#1a2632] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600">
                <GraduationCap size={24} />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 dark:text-white font-display leading-none mb-1">{stats.classes}</p>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest font-body">Active Classes</p>
              </div>
            </div>
            <div className="bg-white dark:bg-[#1a2632] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 text-orange-600">
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-orange-600">
                <ArrowUpDown size={24} />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 dark:text-white font-display leading-none mb-1">{stats.yearLevels}</p>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest font-body">Year Levels</p>
              </div>
            </div>
          </div>

          {/* Filters and List */}
          <div className="bg-white dark:bg-[#1a2632] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[500px]">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search students or ID codes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-body text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="text-slate-400" size={18} />
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none font-bold text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 font-display"
                >
                  {classGroups.map(group => (
                    <option key={group} value={group}>{group === 'All' ? 'All Classes' : `Class ${group}`}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              {filteredStudents.length === 0 ? (
                <div className="text-center py-20">
                  <div className="bg-slate-50 dark:bg-slate-900/40 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <Users size={32} />
                  </div>
                  <p className="text-slate-400 font-bold font-display uppercase tracking-widest">No students found</p>
                  <p className="text-slate-400 text-sm font-body">Try adjusting your filters or search term.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-900/40 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] font-body">
                      <th className="px-8 py-4">Student</th>
                      <th className="px-8 py-4 text-center">Year Level</th>
                      <th className="px-8 py-4 text-center">Class Group</th>
                      <th className="px-8 py-4 text-right">ID Code</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors group">
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-4">
                            <div className="size-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all font-display font-bold">
                              {student.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white font-display text-sm">{student.name}</p>
                              <p className="text-xs text-slate-400 font-body">Joined {new Date(student.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-4 text-center">
                          <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold font-display">
                            Year {student.year_level}
                          </span>
                        </td>
                        <td className="px-8 py-4 text-center">
                          <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-primary rounded-lg text-xs font-bold font-display">
                            {student.class_group}
                          </span>
                        </td>
                        <td className="px-8 py-4 text-right">
                          <code className="bg-slate-50 dark:bg-slate-950 px-2 py-1 rounded-md text-slate-500 dark:text-slate-400 text-[11px] font-mono border border-slate-100 dark:border-slate-900">
                            {student.id_code}
                          </code>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rostering;
