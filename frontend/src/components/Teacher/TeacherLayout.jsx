import React from 'react';
import TeacherSidebar from './TeacherSidebar';
import ThemeToggle from '../ThemeToggle';

const TeacherLayout = ({ children }) => {
  return (
    <div className="flex h-screen w-full bg-background font-body text-slate-900 overflow-hidden">
      <TeacherSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-border">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">school</span>
            <span className="font-display font-bold">WriteSmart</span>
          </div>
          <button className="p-2 text-slate-600">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="mx-auto max-w-[1600px] flex flex-col gap-10">
            {children}
          </div>
        </div>
      </main>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default TeacherLayout;
