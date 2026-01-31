import React, { useState } from 'react';
import { LogIn } from 'lucide-react';
import { teacherAuthApi } from '../../services/api';

const TeacherLoginPage = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await teacherAuthApi.login(username, password);
      localStorage.setItem('teacher_token', response.data.access_token);
      onLoginSuccess(response.data);
    } catch {
      setError('Incorrect username or password. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-16 px-6 lg:px-12 font-body flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-display font-bold text-slate-900 mb-4 tracking-tight">
            Abigail Spelling
          </h1>
          <p className="text-xl text-slate-500 font-medium">
            Teacher sign in
          </p>
        </div>

        <div className="card-premium bg-white p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-bold text-slate-600 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="input-friendly w-full text-slate-900 placeholder:text-slate-400"
                autoComplete="username"
                autoFocus
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-slate-600 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="input-friendly w-full text-slate-900 placeholder:text-slate-400"
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <p className="text-red-500 text-center text-sm font-bold bg-red-50 py-2 rounded-lg">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="animate-pulse">Signing in...</span>
              ) : (
                <>
                  Sign in
                  <LogIn className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeacherLoginPage;
