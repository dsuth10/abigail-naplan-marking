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
      <div className="flex items-center gap-2 px-6 py-3 border-b border-border bg-white shrink-0">
        <button
          onClick={() => handleFormat('bold')}
          disabled={disabled}
          className="p-2.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:bg-slate-200"
          title="Bold"
        >
          <span className="material-symbols-outlined text-[22px]">format_bold</span>
        </button>
        <button
          onClick={() => handleFormat('italic')}
          disabled={disabled}
          className="p-2.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:bg-slate-200"
          title="Italic"
        >
          <span className="material-symbols-outlined text-[22px]">format_italic</span>
        </button>
        <button
          onClick={() => handleFormat('underline')}
          disabled={disabled}
          className="p-2.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:bg-slate-200"
          title="Underline"
        >
          <span className="material-symbols-outlined text-[22px]">format_underlined</span>
        </button>
        <div className="w-px h-8 bg-border mx-3"></div>
        <div className="ml-auto flex items-center gap-2.5 px-4 py-1.5 rounded-xl bg-green-50 text-green-700 text-xs font-bold font-body border border-green-100">
          <span className="material-symbols-outlined text-[18px]">
            {saving ? 'cloud_sync' : 'cloud_done'}
          </span>
          <span className="uppercase tracking-wider">{saving ? 'Saving...' : 'Saved'}</span>
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
          className="w-full h-full p-10 lg:p-16 text-xl lg:text-2xl leading-relaxed resize-none focus:outline-none bg-transparent border-none text-slate-800 placeholder-slate-300 font-body"
          placeholder="Start typing your story here..."
          spellCheck="false"
          style={{
            caretColor: '#0066FF',
            WebkitSpellCheck: 'false',
            msSpellCheck: 'false',
            MozSpellCheck: 'false',
          }}
        />
        {/* Focus Indicator (Subtle bottom bar) */}
        <div
          className={`absolute bottom-0 left-0 w-full h-0.5 bg-primary transition-opacity ${isFocused ? 'opacity-100' : 'opacity-0'
            }`}
        ></div>
      </div>

      {/* Editor Footer / Status */}
      <div className="shrink-0 px-8 py-3 bg-slate-50 border-t border-border flex justify-between items-center text-xs text-slate-400 font-bold uppercase tracking-widest font-body">
        <span>Assessment Mode Active</span>
        <span className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-red-400"></span>
          Spellcheck: Disabled
        </span>
      </div>

      <style>{`
        textarea::spelling-error { text-decoration: none; }
        textarea::grammar-error { text-decoration: none; }
      `}</style>
    </>
  );
};

export default Editor;
