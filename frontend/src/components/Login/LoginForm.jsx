import React, { useState } from 'react';
import { ArrowLeft, LogIn } from 'lucide-react';

const LoginForm = ({ student, onLogin, onBack }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onLogin(student.id, password);
    } catch {
      setError('Incorrect password. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full card-premium bg-white">
      <div className="flex flex-col items-center mb-10">
        <div className="w-32 h-32 rounded-full overflow-hidden bg-primary/5 border-4 border-primary/10 mb-6 group-hover:scale-105 transition-transform">
          <img
            src={`/src/assets/avatars/${student.avatar_id}.svg`}
            alt={student.name}
            className="w-full h-full object-cover p-2"
            onError={(e) => {
              e.target.src = 'https://api.dicebear.com/7.x/bottts/svg?seed=' + student.name;
            }}
          />
        </div>
        <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">Hi, {student.name}!</h2>
        <p className="text-slate-500 font-medium text-center leading-tight">Ready for your spelling assessment?</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="input-friendly text-center text-2xl tracking-[0.5em] font-bold text-slate-900 placeholder:tracking-normal placeholder:text-lg placeholder:font-medium placeholder:text-slate-400"
            autoFocus
            required
          />
        </div>

        {error && (
          <p className="text-red-500 text-center text-sm font-bold bg-red-50 py-2 rounded-lg animate-bounce">{error}</p>
        )}

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 btn-secondary"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 btn-primary"
          >
            {loading ? (
              <span className="animate-pulse">Checking...</span>
            ) : (
              <>
                Login
                <LogIn className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
