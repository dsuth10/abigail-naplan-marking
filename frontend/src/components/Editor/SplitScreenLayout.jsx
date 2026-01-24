import React from 'react';

const SplitScreenLayout = ({ stimulus, children }) => {
  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] gap-6 p-6">
      {/* Stimulus Side */}
      <div className="w-full lg:w-1/2 h-1/2 lg:h-full bg-white rounded-xl shadow-md overflow-y-auto p-8 border border-gray-100">
        <div className="prose prose-blue max-w-none">
          {stimulus.title && <h1 className="text-3xl font-bold mb-6 text-gray-800">{stimulus.title}</h1>}
          <div 
            className="stimulus-content"
            dangerouslySetInnerHTML={{ __html: stimulus.stimulus_html }} 
          />
        </div>
      </div>

      {/* Editor Side */}
      <div className="w-full lg:w-1/2 h-1/2 lg:h-full">
        {children}
      </div>
    </div>
  );
};

export default SplitScreenLayout;
