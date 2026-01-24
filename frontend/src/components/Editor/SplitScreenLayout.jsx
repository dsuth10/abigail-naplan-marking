import React from 'react';

const SplitScreenLayout = ({ stimulus, children }) => {
  const getGenreLabel = (genre) => {
    if (!genre) return 'Writing Prompt';
    return genre === 'NARRATIVE' ? 'Narrative Prompt' : 'Writing Prompt';
  };

  return (
    <main className="flex flex-1 overflow-hidden">
      {/* Left Panel: Stimulus Zone (40%) */}
      <section className="w-full md:w-5/12 bg-background-light dark:bg-background-dark border-r border-[#e5e7eb] dark:border-gray-800 flex flex-col overflow-hidden">
        <div className="overflow-y-auto p-8 lg:p-10 scroll-smooth h-full">
          <div className="max-w-[640px] mx-auto space-y-6">
            {/* Prompt Tag */}
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-primary text-xs font-bold uppercase tracking-wider font-display">
              {getGenreLabel(stimulus?.genre)}
            </div>
            
            {/* Heading */}
            {stimulus?.title && (
              <h1 className="text-[#111418] dark:text-white tracking-tight text-3xl md:text-4xl font-bold leading-tight font-display">
                {stimulus.title}
              </h1>
            )}
            
            {/* Stimulus Content */}
            {stimulus?.stimulus_html && (
              <div
                className="prose prose-slate dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: stimulus.stimulus_html }}
              />
            )}
            
            {/* Instructions Card */}
            <div className="p-6 bg-white dark:bg-[#1e293b] rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-bold mb-3 text-slate-800 dark:text-slate-100 font-display">
                <span className="material-symbols-outlined text-primary">lightbulb</span>
                Task Instructions
              </h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4 font-body">
                Read the prompt carefully and plan your response.
              </p>
              <ul className="space-y-2 list-none pl-0 text-slate-600 dark:text-slate-300 font-body">
                <li className="flex gap-3 items-start">
                  <span className="mt-1 size-1.5 rounded-full bg-primary shrink-0"></span>
                  <span>Write your response in the editor on the right.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="mt-1 size-1.5 rounded-full bg-primary shrink-0"></span>
                  <span>Think about your ideas, structure, and language choices.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="mt-1 size-1.5 rounded-full bg-primary shrink-0"></span>
                  <span>Remember to check your spelling and punctuation carefully.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      
      {/* Right Panel: Composition Zone (60%) */}
      <section className="w-full md:w-7/12 flex flex-col bg-paper-light dark:bg-paper-dark relative">
        {children}
      </section>
    </main>
  );
};

export default SplitScreenLayout;
