import React from 'react';

const SplitScreenLayout = ({ stimulus, children }) => {
  const getGenreLabel = (genre) => {
    if (!genre) return 'Writing Prompt';
    return genre === 'NARRATIVE' ? 'Narrative Prompt' : 'Writing Prompt';
  };

  return (
    <main className="flex flex-1 overflow-hidden">
      {/* Left Panel: Stimulus Zone (40%) */}
      <section className="w-full md:w-5/12 bg-slate-50 border-r border-border flex flex-col overflow-hidden">
        <div className="overflow-y-auto p-10 lg:p-12 scroll-smooth h-full">
          <div className="max-w-[640px] mx-auto space-y-8">
            {/* Prompt Tag */}
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider font-display">
              {getGenreLabel(stimulus?.genre)}
            </div>

            {/* Heading */}
            {stimulus?.title && (
              <h1 className="text-slate-900 tracking-tight text-4xl lg:text-5xl font-display font-bold leading-tight">
                {stimulus.title}
              </h1>
            )}

            {/* Stimulus Content */}
            {stimulus?.stimulus_html && (
              <div
                className="prose prose-slate prose-lg max-w-none text-slate-600 font-body leading-relaxed"
                dangerouslySetInnerHTML={{ __html: stimulus.stimulus_html }}
              />
            )}

            {/* Instructions Card */}
            <div className="p-8 bg-white rounded-3xl border border-border shadow-sm">
              <h3 className="flex items-center gap-3 text-xl font-display font-bold mb-4 text-slate-900">
                <span className="material-symbols-outlined text-primary text-2xl">lightbulb</span>
                Task Instructions
              </h3>
              {stimulus?.instructions ? (
                <div
                  className="prose prose-slate prose-sm max-w-none text-slate-600 font-body leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: stimulus.instructions }}
                />
              ) : (
                <>
                  <p className="text-slate-500 leading-relaxed mb-6 font-body font-medium">
                    Read the prompt carefully and plan your response.
                  </p>
                  <ul className="space-y-4 list-none pl-0 text-slate-600 font-body font-medium">
                    <li className="flex gap-4 items-start">
                      <span className="mt-2 size-2 rounded-full bg-primary shrink-0 shadow-sm shadow-primary/40"></span>
                      <span>Write your response in the editor on the right.</span>
                    </li>
                    <li className="flex gap-4 items-start">
                      <span className="mt-2 size-2 rounded-full bg-primary shrink-0 shadow-sm shadow-primary/40"></span>
                      <span>Think about your ideas, structure, and language choices.</span>
                    </li>
                    <li className="flex gap-4 items-start">
                      <span className="mt-2 size-2 rounded-full bg-primary shrink-0 shadow-sm shadow-primary/40"></span>
                      <span>Remember to check your spelling and punctuation carefully.</span>
                    </li>
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Right Panel: Composition Zone (60%) */}
      <section className="w-full md:w-7/12 flex flex-col bg-white relative">
        {children}
      </section>
    </main>
  );
};

export default SplitScreenLayout;
