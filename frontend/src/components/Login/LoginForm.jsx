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
    <div className="max-w-md w-full clay-card p-10 bg-white">
      <div className="flex flex-col items-center mb-10">
        <div className="w-36 h-36 rounded-full overflow-hidden bg-indigo-50 border-8 border-white mb-6 shadow-inner">
          <img
            src={`/src/assets/avatars/${student.avatar_id}.svg`}
            alt={student.name}
            className="w-full h-full object-cover p-3"
            onError={(e) => {
              e.target.src = 'https://api.dicebear.com/7.x/bottts/svg?seed=' + student.name;
            }}
          />
        </div>
        <h2 className="text-3xl font-varela font-bold text-[var(--color-text)] mb-2">Hi, {student.name}!</h2>
        <p className="text-indigo-400 font-semibold text-center leading-tight">Ready for your spelling assessment?</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Type your password here..."
            className="w-full px-6 py-4 rounded-2xl bg-indigo-50/50 border-2 border-transparent focus:border-[var(--color-primary)] focus:bg-white outline-none transition-all text-center text-2xl tracking-[0.5em] font-bold text-[var(--color-text)] placeholder:tracking-normal placeholder:text-lg placeholder:font-medium placeholder:text-indigo-300 shadow-inner"
            autoFocus
            required
          />
        </div>

        {error && (
          <p className="text-red-500 text-center text-sm font-bold bg-red-50 py-2 rounded-lg animate-bounce">{error}</p>
        )}

        <div className="flex gap-6">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 clay-button font-bold text-indigo-600 hover:text-indigo-700"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 clay-button-cta font-bold text-lg disabled:opacity-50"
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
