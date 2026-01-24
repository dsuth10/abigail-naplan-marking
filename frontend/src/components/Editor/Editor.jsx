import React, { useEffect, useRef } from 'react';

const Editor = ({ value, onChange, disabled }) => {
  const textareaRef = useRef(null);

  useEffect(() => {
    // Ensure spellcheck is disabled via JS as well
    if (textareaRef.current) {
      textareaRef.current.setAttribute('spellcheck', 'false');
      textareaRef.current.setAttribute('autocorrect', 'off');
      textareaRef.current.setAttribute('autocapitalize', 'off');
      textareaRef.current.setAttribute('autocomplete', 'off');
    }
  }, []);

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-inner overflow-hidden border border-gray-200">
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
        <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Your Writing</span>
        <span className="text-xs text-gray-400">Autosaving...</span>
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="flex-1 p-6 text-lg leading-relaxed resize-none outline-none focus:ring-0 spellcheck-false"
        placeholder="Start writing here..."
        spellCheck="false"
        autoCorrect="off"
        autoCapitalize="off"
        autoComplete="off"
        style={{
          fontFamily: 'system-ui, -apple-system, sans-serif',
          // Additional CSS protection against browser highlights
          WebkitSpellCheck: 'false',
          msSpellCheck: 'false',
          MozSpellCheck: 'false',
        }}
      />
      <style>{`
        .spellcheck-false {
          caret-color: #2563eb;
        }
        /* Target specific browser spellcheck styling if possible */
        textarea:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
};

export default Editor;
