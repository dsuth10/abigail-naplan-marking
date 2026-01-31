import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useSpellcheckDisable } from '../../hooks/useSpellcheckDisable';

const EditorToolbar = ({ editor, disabled }) => {
  if (!editor) return null;

  const toggleBold = () => editor.chain().focus().toggleBold().run();
  const toggleItalic = () => editor.chain().focus().toggleItalic().run();
  const toggleBulletList = () => editor.chain().focus().toggleBulletList().run();
  const toggleOrderedList = () => editor.chain().focus().toggleOrderedList().run();

  const isBold = editor.isActive('bold');
  const isItalic = editor.isActive('italic');
  const isBulletList = editor.isActive('bulletList');
  const isOrderedList = editor.isActive('orderedList');

  const buttonClass = (isActive) =>
    `p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isActive ? 'bg-primary text-white' : 'hover:bg-slate-100 text-slate-600'
    }`;

  return (
    <div className="flex items-center gap-1.5 px-6 py-3 border-b border-border bg-white shrink-0">
      <button
        onClick={toggleBold}
        disabled={disabled}
        className={buttonClass(isBold)}
        title="Bold (Ctrl+B)"
        type="button"
      >
        <span className="material-symbols-outlined text-[20px]">format_bold</span>
      </button>
      <button
        onClick={toggleItalic}
        disabled={disabled}
        className={buttonClass(isItalic)}
        title="Italic (Ctrl+I)"
        type="button"
      >
        <span className="material-symbols-outlined text-[20px]">format_italic</span>
      </button>

      <div className="w-px h-6 bg-border mx-2"></div>

      <button
        onClick={toggleBulletList}
        disabled={disabled}
        className={buttonClass(isBulletList)}
        title="Bullet List"
        type="button"
      >
        <span className="material-symbols-outlined text-[20px]">format_list_bulleted</span>
      </button>
      <button
        onClick={toggleOrderedList}
        disabled={disabled}
        className={buttonClass(isOrderedList)}
        title="Ordered List"
        type="button"
      >
        <span className="material-symbols-outlined text-[20px]">format_list_numbered</span>
      </button>

      <div className="ml-auto flex items-center gap-2.5 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
        <span className="material-symbols-outlined text-[16px]">info</span>
        Rich Editor Active
      </div>
    </div>
  );
};

const Editor = ({ value, onChange, disabled, saving }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable extensions we don't want or need for now
        heading: false,
        codeBlock: false,
        blockquote: false,
      }),
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      // Get HTML content to send to backend
      const html = editor.getHTML();
      // Get plain text for word count (backward compatibility)
      const text = editor.getText();

      // We pass an object if we want to support multiple formats, 
      // but for now we'll stick to a signature that AssessmentPage expects,
      // and update AssessmentPage to handle the output.
      onChange({
        html,
        text,
        json: editor.getJSON()
      });
    },
    editorProps: {
      attributes: {
        class: 'w-full h-full p-10 lg:p-16 text-xl lg:text-2xl leading-relaxed focus:outline-none bg-transparent border-none text-slate-800 placeholder-slate-300 font-body min-h-[500px]',
        spellcheck: 'false',
      },
    },
  });

  // Enforce spellcheck disabling
  useSpellcheckDisable(editor);

  // Sync value if it changes externally (e.g. initial load)
  React.useEffect(() => {
    if (editor && value !== editor.getHTML() && value !== editor.getText()) {
      editor.commands.setContent(value, false);
    }
  }, [value, editor]);

  // Sync disabled state
  React.useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled);
    }
  }, [disabled, editor]);

  return (
    <div className="flex flex-col h-full bg-slate-50/30">
      <EditorToolbar editor={editor} disabled={disabled} />

      <div className="flex-1 relative group cursor-text overflow-y-auto custom-scrollbar">
        <EditorContent editor={editor} />

        {/* Saving Indicator Overlay */}
        <div className="fixed bottom-12 right-12 z-50">
          <div className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl ${saving ? 'bg-white shadow-lg border-primary/20 scale-100' : 'bg-transparent border-transparent scale-90 opacity-0'
            } text-primary text-xs font-bold font-body border transition-all duration-300`}>
            <span className="material-symbols-outlined text-[18px] animate-spin">
              sync
            </span>
            <span className="uppercase tracking-wider">Saving...</span>
          </div>
        </div>
      </div>

      <div className="shrink-0 px-8 py-3 bg-white border-t border-border flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest font-body">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2">
            <span className={`size-2 rounded-full ${disabled ? 'bg-slate-300' : 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]'}`}></span>
            {disabled ? 'Read Only' : 'Assessment Active'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {saving ? (
            <span className="text-primary animate-pulse">Syncing...</span>
          ) : (
            <span className="text-green-500">All Changes Saved</span>
          )}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 5px;
          border: 2px solid transparent;
          background-clip: content-box;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #cbd5e1;
        }
        .ProseMirror {
          min-height: 100%;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #cbd5e1;
          pointer-events: none;
          height: 0;
        }
        .ProseMirror:focus {
          outline: none;
        }
        .ProseMirror ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin: 1rem 0;
        }
        .ProseMirror ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin: 1rem 0;
        }
        .ProseMirror strong {
          font-weight: 700;
        }
        .ProseMirror em {
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default Editor;
