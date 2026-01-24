import React from 'react';
import TeacherSidebar from './TeacherSidebar';
import ThemeToggle from '../ThemeToggle';

const TeacherLayout = ({ children }) => {
  return (
    <div className="flex h-screen w-full bg-background-light dark:bg-background-dark font-display text-[#111418] dark:text-white overflow-hidden selection:bg-primary/20">
      <TeacherSidebar />
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-[#1a2632] border-b border-[#dbe0e6] dark:border-gray-800">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">school</span>
            <span className="font-bold font-display">WriteSmart</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button className="p-2 text-gray-600 dark:text-gray-300">
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto scrollbar-hide p-4 md:p-8 lg:p-10">
          <div className="mx-auto max-w-6xl flex flex-col gap-8">
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
