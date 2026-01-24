import React, { useEffect, useRef, useState } from 'react';

const Editor = ({ value, onChange, disabled, saving }) => {
  const textareaRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    // Ensure spellcheck is disabled via JS as well
    if (textareaRef.current) {
      textareaRef.current.setAttribute('spellcheck', 'false');
      textareaRef.current.setAttribute('autocorrect', 'off');
      textareaRef.current.setAttribute('autocapitalize', 'off');
      textareaRef.current.setAttribute('autocomplete', 'off');
    }
  }, []);

  const handleFormat = (command) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    let formattedText = '';
    switch (command) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'underline':
        formattedText = `__${selectedText}__`;
        break;
      default:
        return;
    }
    
    const newValue = value.substring(0, start) + formattedText + value.substring(end);
    onChange(newValue);
    
    // Restore focus and selection
    setTimeout(() => {
      textarea.focus();
      const newStart = start + formattedText.length;
      textarea.setSelectionRange(newStart, newStart);
    }, 0);
  };

  return (
    <>
      {/* Editor Toolbar */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-[#e5e7eb] dark:border-gray-700 bg-white dark:bg-[#1a2634] shrink-0">
        <button
          onClick={() => handleFormat('bold')}
          disabled={disabled}
          className="p-2 rounded hover:bg-slate-100 dark:hover:bg-gray-700 text-slate-600 dark:text-slate-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Bold"
        >
          <span className="material-symbols-outlined text-[20px]">format_bold</span>
        </button>
        <button
          onClick={() => handleFormat('italic')}
          disabled={disabled}
          className="p-2 rounded hover:bg-slate-100 dark:hover:bg-gray-700 text-slate-600 dark:text-slate-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Italic"
        >
          <span className="material-symbols-outlined text-[20px]">format_italic</span>
        </button>
        <button
          onClick={() => handleFormat('underline')}
          disabled={disabled}
          className="p-2 rounded hover:bg-slate-100 dark:hover:bg-gray-700 text-slate-600 dark:text-slate-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Underline"
        >
          <span className="material-symbols-outlined text-[20px]">format_underlined</span>
        </button>
        <div className="w-px h-6 bg-slate-200 dark:bg-gray-700 mx-2"></div>
        <div className="ml-auto flex items-center gap-2 px-3 py-1 rounded bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-medium font-body">
          <span className="material-symbols-outlined text-[16px]">
            {saving ? 'cloud_sync' : 'cloud_done'}
          </span>
          <span>{saving ? 'Saving...' : 'Saved'}</span>
        </div>
      </div>
      
      {/* Text Editor Area */}
      <div className="flex-1 relative group cursor-text">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autocapitalize="off"
          autocomplete="off"
          autocorrect="off"
          className="w-full h-full p-8 lg:p-12 text-lg leading-loose resize-none focus:outline-none bg-transparent border-none text-slate-800 dark:text-slate-200 placeholder-slate-300 dark:placeholder-slate-600 font-body"
          placeholder="Start typing your story here..."
          spellCheck="false"
          style={{
            caretColor: '#137fec',
            WebkitSpellCheck: 'false',
            msSpellCheck: 'false',
            MozSpellCheck: 'false',
          }}
        />
        {/* Focus Indicator (Subtle bottom bar) */}
        <div
          className={`absolute bottom-0 left-0 w-full h-0.5 bg-primary transition-opacity ${
            isFocused ? 'opacity-100' : 'opacity-0'
          }`}
        ></div>
      </div>
      
      {/* Editor Footer / Status */}
      <div className="shrink-0 px-6 py-2 bg-white dark:bg-[#1a2634] border-t border-[#e5e7eb] dark:border-gray-800 flex justify-between items-center text-xs text-slate-400 dark:text-slate-300 font-body">
        <span>Assessment Mode Active</span>
        <span>Spellcheck: Disabled</span>
      </div>
      
      <style>{`
        textarea::spelling-error { text-decoration: none; }
        textarea::grammar-error { text-decoration: none; }
      `}</style>
    </>
  );
};

export default Editor;
