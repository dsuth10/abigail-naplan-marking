import React from 'react';
import { useTheme } from '../hooks/useTheme';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors ${className}`}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? (
        <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
          light_mode
        </span>
      ) : (
        <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
          dark_mode
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;
