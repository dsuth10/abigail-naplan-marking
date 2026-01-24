import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ThemeToggle from '../ThemeToggle';

const TeacherSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: 'dashboard', label: 'Dashboard', path: '/teacher/projects', fill: true },
    { icon: 'group', label: 'My Classes', path: '/teacher/roster', fill: false },
    { icon: 'folder_open', label: 'Projects', path: '/teacher/projects', fill: false },
    { icon: 'visibility', label: 'Monitoring', path: '#', fill: false },
    { icon: 'bar_chart', label: 'Results', path: '#', fill: false },
  ];

  const isActive = (path) => {
    if (path === '/teacher/projects') {
      return location.pathname === '/teacher/projects' || location.pathname.startsWith('/teacher/dashboard');
    }
    return location.pathname === path;
  };

  return (
    <aside className="hidden lg:flex w-72 flex-col justify-between bg-white dark:bg-[#1a2632] border-r border-[#dbe0e6] dark:border-gray-800 p-4 h-full shrink-0">
      <div className="flex flex-col gap-6">
        {/* Brand */}
        <div className="flex items-center gap-3 px-2">
          <div className="bg-primary/10 flex items-center justify-center rounded-xl size-10">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '24px' }}>school</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#111418] dark:text-white font-display">WriteSmart</h1>
        </div>
        
        {/* Navigation */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => item.path !== '#' && navigate(item.path)}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-[#617589] dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[#111418] dark:hover:text-white'
                }`}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: '24px', fontVariationSettings: item.fill ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {item.icon}
                </span>
                <span className={`text-sm ${active ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
              </button>
            );
          })}
        </nav>
        
        {/* Theme Toggle */}
        <div className="px-2">
          <ThemeToggle />
        </div>
      </div>
      
      {/* User Profile Bottom */}
      <div className="flex items-center gap-3 px-3 py-3 mt-auto rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors border-t border-[#f0f2f4] dark:border-gray-800 pt-4">
        <div className="relative">
          <div className="bg-center bg-no-repeat bg-cover rounded-full size-10 border border-gray-200 dark:border-gray-700 bg-gray-200"></div>
          <div className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full border-2 border-white dark:border-[#1a2632]"></div>
        </div>
        <div className="flex flex-col min-w-0">
          <p className="text-[#111418] dark:text-white text-sm font-semibold truncate">Teacher</p>
          <p className="text-[#617589] dark:text-gray-400 text-xs truncate">Account</p>
        </div>
        <span className="material-symbols-outlined ml-auto text-gray-400 dark:text-gray-300" style={{ fontSize: '20px' }}>more_vert</span>
      </div>
    </aside>
  );
};

export default TeacherSidebar;
