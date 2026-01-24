# TipTap Rich Text Editor Implementation Plan for Abigail NAPLAN Marking

## Executive Summary

This document outlines the complete implementation strategy for integrating TipTap as the rich text editor for the Abigail NAPLAN marking application. TipTap has been selected as the optimal balance between ease of implementation, polish, and assessment integrity compliance.

### Selection Rationale

TipTap was chosen over alternatives (Slate.js, Lexical, RemirrorJS, Draft.js) for the following reasons:

- **Assessment Integrity**: Provides excellent control over spellcheck disabling with clear, verifiable patterns
- **Ease of Implementation**: Pre-built extensions eliminate wheel reinvention; comes with polished UI components out-of-box
- **React Integration**: Official React support with hooks API; clean integration with existing Abigail codebase
- **Documentation Quality**: Among the best in the rich editor ecosystem; active community support
- **Maintenance**: Active development and security updates; proven in production environments
- **Progressive Enhancement**: Allows incremental feature additions without architectural changes
- **Offline-First Compatible**: Pure JavaScript; no external dependencies or internet requirements

---

## Architecture Overview

### Technology Stack Addition

**New Dependencies**:
```
@tiptap/react           # React wrapper for TipTap
@tiptap/pm              # ProseMirror layer (peer dependency)
@tiptap/extension-bold  # Bold formatting extension
@tiptap/extension-italic # Italic formatting extension
@tiptap/extension-paragraph # Paragraph structure
@tiptap/extension-document # Document root
@tiptap/extension-text  # Text node
@tiptap/extension-bullet-list # Unordered lists
@tiptap/extension-ordered-list # Ordered lists
@tiptap/extension-list-item # List item container
@tiptap/extension-heading # Multi-level headings
@tiptap/extension-blockquote # Block quotations
@tiptap/extension-code-block # Code/preformatted text
```

**Optional Future Dependencies**:
```
@tiptap/extension-link  # Hyperlink support
@tiptap/extension-image # Image embedding
@tiptap/extension-table # Table support
```

**Peer Dependencies** (already likely present):
```
react >= 16.8
react-dom >= 16.8
```

### Bundle Size Impact

- **TipTap core + basic extensions**: ~50-60 KB (gzipped: ~15-18 KB)
- **All optional extensions**: +30 KB (gzipped: +8 KB)
- **Total estimated**: ~80-90 KB gzipped (minimal impact on application)

### Integration Points

**Frontend Architecture**:
```
frontend/
├── src/
│   ├── components/
│   │   ├── Editor/
│   │   │   ├── AssessmentEditor.jsx       # Main editor component
│   │   │   ├── EditorToolbar.jsx          # Formatting toolbar
│   │   │   ├── SpellcheckLock.jsx         # Compliance enforcement wrapper
│   │   │   ├── WordCountDisplay.jsx       # Word count indicator
│   │   │   └── useSpellcheckDisable.js    # Custom hook for spellcheck control
│   │   └── StudentSubmissionPage/
│   │       └── (refactored to use new Editor)
│   ├── hooks/
│   │   ├── useEditor.js                   # TipTap editor initialization
│   │   └── useSpellcheckDisable.js        # Spellcheck enforcement
│   └── styles/
│       └── editor.css                     # Editor-specific styles
```

**Backend Considerations**:
- `Submission.content_raw` field: Updated to store TipTap JSON format (for future extraction)
- Alternative storage: Keep as plain HTML `text/html` for backward compatibility
- Recommendation: Store as both JSON (for structured data) and HTML (for display/export)

---

## Core Implementation Components

### 1. AssessmentEditor Component

**Purpose**: Main editor component for student writing during assessments.

**Responsibilities**:
- Initialize TipTap editor with assessment-specific configuration
- Enforce spellcheck disabling at all times
- Capture and save editor state
- Provide real-time word count and character tracking
- Manage local auto-save state

**Key Props**:
```javascript
interface AssessmentEditorProps {
  submissionId: string              // Database reference
  maxWords?: number                 // Optional word limit
  maxCharacters?: number            // Optional character limit
  onContentChange?: (content: string) => void  // Callback on changes
  onSubmit?: (content: string) => Promise<void>  // Submission handler
  readOnly?: boolean                // Disable editing if submitted
  initialContent?: string           // Load existing draft
}
```

**Component Structure**:
```jsx
export function AssessmentEditor({ 
  submissionId, 
  maxWords, 
  onContentChange,
  initialContent 
}) {
  const editor = useEditor({
    extensions: [/* configured below */],
    editorProps: {
      attributes: {
        class: 'assessment-editor-wrapper',
        spellcheck: 'false',  // Critical: strict attribute
      },
    },
    onUpdate: ({ editor }) => {
      onContentChange?.(editor.getHTML())
    },
  })

  // Use compliance hook (see below)
  useSpellcheckDisable(editor)

  return (
    <div className="editor-container" spellCheck="false">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
      <WordCountDisplay editor={editor} maxWords={maxWords} />
    </div>
  )
}
```

### 2. EditorToolbar Component

**Purpose**: Provides UI buttons for formatting operations.

**Features**:
- Bold button: Toggle bold formatting
- Italic button: Toggle italic formatting
- Heading levels: Toggle H1, H2, H3
- Lists: Toggle bullet list, numbered list
- Blockquote: Toggle blockquote
- Clear formatting: Reset all formatting
- Visual feedback: Highlight active buttons based on cursor position

**Implementation Approach**:
```jsx
function EditorToolbar({ editor }) {
  if (!editor) return null

  const formatButton = (command, isActive, icon, label) => (
    <button
      onClick={() => command()}
      className={isActive ? 'toolbar-button active' : 'toolbar-button'}
      title={label}
      type="button"
    >
      {icon}
    </button>
  )

  return (
    <div className="editor-toolbar" spellCheck="false">
      {/* Text formatting */}
      {formatButton(
        () => editor.chain().focus().toggleBold().run(),
        editor.isActive('bold'),
        <BoldIcon />,
        'Bold'
      )}
      {formatButton(
        () => editor.chain().focus().toggleItalic().run(),
        editor.isActive('italic'),
        <ItalicIcon />,
        'Italic'
      )}

      {/* Separators */}
      <div className="toolbar-separator" />

      {/* Lists */}
      {formatButton(
        () => editor.chain().focus().toggleBulletList().run(),
        editor.isActive('bulletList'),
        <ListIcon />,
        'Bullet List'
      )}
      {formatButton(
        () => editor.chain().focus().toggleOrderedList().run(),
        editor.isActive('orderedList'),
        <NumberedListIcon />,
        'Numbered List'
      )}

      {/* Other formatting */}
      {formatButton(
        () => editor.chain().focus().toggleBlockquote().run(),
        editor.isActive('blockquote'),
        <QuoteIcon />,
        'Blockquote'
      )}

      {/* Clear formatting */}
      <div className="toolbar-separator" />
      <button
        onClick={() => editor.chain().focus().clearNodes().run()}
        className="toolbar-button"
        title="Clear formatting"
      >
        <ClearIcon />
      </button>
    </div>
  )
}
```

**Styling Considerations**:
- Use Lucide React icons (already included in Abigail)
- Active state: Highlight color (match design system)
- Hover state: Subtle background change
- Disabled state: Reduce opacity when command unavailable

### 3. SpellcheckLock Wrapper Component

**Purpose**: Encapsulate spellcheck disabling logic in a reusable wrapper.

**Responsibilities**:
- Ensure `spellcheck="false"` on editor and all child elements
- Intercept paste events to strip formatting
- Monitor for attribute mutations that re-enable spellcheck
- Provide compliance audit trail (logging suspicious events)

**Implementation**:
```jsx
export function SpellcheckLock({ children, editorRef }) {
  useSpellcheckDisable(editorRef)

  return (
    <div 
      className="spellcheck-lock-wrapper"
      spellCheck="false"
      data-compliance="spellcheck-disabled"
      role="region"
      aria-label="Spellcheck disabled for assessment integrity"
    >
      {children}
    </div>
  )
}
```

### 4. useSpellcheckDisable Hook (Compliance Critical)

**Purpose**: Enforce and verify spellcheck disabling at runtime.

**Verification Strategy**:
1. Set `spellcheck="false"` on editor root element
2. Set `spellcheck="false"` on contenteditable div
3. Intercept paste events (copy-paste might carry formatting/spellcheck)
4. Monitor DOM mutations for attribute changes
5. Strip any spellcheck="true" that appears
6. Log suspicious events for compliance audit

**Full Implementation**:
```javascript
import { useEffect, useRef } from 'react'

/**
 * Hook to enforce and verify spellcheck is disabled.
 * Critical for assessment integrity compliance.
 * 
 * @param {RefObject} editorRef - Reference to editor container
 * @returns {Object} Status object with verification results
 */
export function useSpellcheckDisable(editorRef) {
  const mutationObserverRef = useRef(null)
  const complianceLogRef = useRef([])

  useEffect(() => {
    if (!editorRef?.current) return

    const editorElement = editorRef.current
    const contentEditableSelector = '[contenteditable="true"]'

    // 1. Initial enforcement - set spellcheck="false" explicitly
    const enforceSpellcheckOff = () => {
      editorElement.spellcheck = false
      editorElement.setAttribute('spellcheck', 'false')

      const contentEditable = editorElement.querySelector(contentEditableSelector)
      if (contentEditable) {
        contentEditable.spellcheck = false
        contentEditable.setAttribute('spellcheck', 'false')
        // Remove browser-added spellcheck dictionaries
        contentEditable.removeAttribute('spell-check')
      }
    }

    // 2. Handle paste events - only allow plain text
    const handlePaste = (event) => {
      event.preventDefault()

      // Extract plain text only
      const text = event.clipboardData?.getData('text/plain') || ''

      // Use execCommand to insert plain text (no formatting)
      document.execCommand('insertText', false, text)

      complianceLogRef.current.push({
        event: 'paste_intercepted',
        timestamp: new Date().toISOString(),
        textLength: text.length,
      })
    }

    // 3. Monitor mutations - catch attempts to re-enable spellcheck
    const handleMutations = (mutations) => {
      let spellcheckReenabled = false

      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'spellcheck') {
          const target = mutation.target
          if (target.getAttribute('spellcheck') === 'true') {
            complianceLogRef.current.push({
              event: 'spellcheck_reenabled_attempt',
              timestamp: new Date().toISOString(),
              element: target.tagName,
            })

            // Immediately re-disable
            target.spellcheck = false
            target.setAttribute('spellcheck', 'false')
            spellcheckReenabled = true
          }
        }
      }

      if (spellcheckReenabled) {
        console.warn('[Abigail Compliance] Spellcheck re-enable attempt detected and blocked')
      }
    }

    // Initial enforcement
    enforceSpellcheckOff()

    // Add paste handler
    editorElement.addEventListener('paste', handlePaste, true)

    // Monitor for attribute changes (including spellcheck)
    mutationObserverRef.current = new MutationObserver(handleMutations)
    mutationObserverRef.current.observe(editorElement, {
      attributes: true,
      subtree: true,
      attributeFilter: ['spellcheck'],
      attributeOldValue: true,
    })

    // Periodic enforcement (extra paranoid mode)
    const enforcementInterval = setInterval(enforceSpellcheckOff, 5000) // Every 5s

    // Cleanup
    return () => {
      clearInterval(enforcementInterval)
      editorElement.removeEventListener('paste', handlePaste, true)
      mutationObserverRef.current?.disconnect()
    }
  }, [editorRef])

  // Provide compliance verification function
  return {
    getComplianceLog: () => complianceLogRef.current,
    clearComplianceLog: () => {
      complianceLogRef.current = []
    },
  }
}
```

**Compliance Audit Function**:
```javascript
/**
 * Verify spellcheck is disabled on element.
 * Used for pre-submission compliance check.
 */
export function verifySpellcheckDisabled(editorElement) {
  const results = {
    passed: true,
    violations: [],
  }

  // Check editor root
  if (editorElement.spellcheck !== false || 
      editorElement.getAttribute('spellcheck') !== 'false') {
    results.passed = false
    results.violations.push('Editor root spellcheck not disabled')
  }

  // Check contenteditable
  const contentEditable = editorElement.querySelector('[contenteditable]')
  if (contentEditable) {
    if (contentEditable.spellcheck !== false ||
        contentEditable.getAttribute('spellcheck') !== 'false') {
      results.passed = false
      results.violations.push('Contenteditable spellcheck not disabled')
    }
  }

  return results
}
```

### 5. WordCountDisplay Component

**Purpose**: Real-time word and character count display with optional limits.

**Features**:
- Display current word count
- Display current character count
- Show progress toward limit (if set)
- Color coding: Green (under), Yellow (80%), Red (over limit)
- Read-only display (no user interaction)

**Implementation**:
```jsx
export function WordCountDisplay({ editor, maxWords, maxCharacters }) {
  const [stats, setStats] = useState({ words: 0, characters: 0 })

  useEffect(() => {
    if (!editor) return

    const updateStats = () => {
      const text = editor.getText()
      const words = text.trim() ? text.trim().split(/\s+/).length : 0
      const characters = text.length

      setStats({ words, characters })
    }

    editor.on('update', updateStats)
    updateStats() // Initial count

    return () => {
      editor.off('update', updateStats)
    }
  }, [editor])

  const wordPercentage = maxWords ? (stats.words / maxWords) * 100 : 0
  const charPercentage = maxCharacters ? (stats.characters / maxCharacters) * 100 : 0

  const getStatusColor = (percentage) => {
    if (percentage > 100) return 'text-red-600'
    if (percentage > 80) return 'text-yellow-600'
    return 'text-gray-600'
  }

  return (
    <div className="word-count-display">
      <div className={`count-item ${getStatusColor(wordPercentage)}`}>
        <span>{stats.words}</span>
        {maxWords && <span> / {maxWords}</span>}
        <span> words</span>
      </div>
      <div className="count-separator">•</div>
      <div className={`count-item ${getStatusColor(charPercentage)}`}>
        <span>{stats.characters}</span>
        {maxCharacters && <span> / {maxCharacters}</span>}
        <span> characters</span>
      </div>
    </div>
  )
}
```

---

## TipTap Editor Configuration

### Extension Set

**Phase 1: MVP Extensions** (Immediate Implementation)

```javascript
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import ListItem from '@tiptap/extension-list-item'

export const MVP_EXTENSIONS = [
  Document,
  Paragraph,
  Text,
  Bold.configure({
    HTMLAttributes: {
      class: 'font-bold',
    },
  }),
  Italic.configure({
    HTMLAttributes: {
      class: 'italic',
    },
  }),
  BulletList.configure({
    HTMLAttributes: {
      class: 'list-disc list-inside',
    },
  }),
  OrderedList.configure({
    HTMLAttributes: {
      class: 'list-decimal list-inside',
    },
  }),
  ListItem,
]
```

**Phase 2: Enhanced Extensions** (Following MVP)

```javascript
import Heading from '@tiptap/extension-heading'
import Blockquote from '@tiptap/extension-blockquote'
import CodeBlock from '@tiptap/extension-code-block'
import HardBreak from '@tiptap/extension-hard-break'

export const ENHANCED_EXTENSIONS = [
  ...MVP_EXTENSIONS,
  Heading.configure({
    levels: [1, 2, 3],
  }),
  Blockquote.configure({
    HTMLAttributes: {
      class: 'border-l-4 border-gray-300 pl-4 italic',
    },
  }),
  CodeBlock.configure({
    HTMLAttributes: {
      class: 'bg-gray-100 p-4 rounded font-mono text-sm',
    },
  }),
  HardBreak,
]
```

**Phase 3: Advanced Extensions** (Optional, Future)

```javascript
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'

export const ADVANCED_EXTENSIONS = [
  ...ENHANCED_EXTENSIONS,
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      class: 'text-blue-600 underline',
    },
  }),
  Image.configure({
    HTMLAttributes: {
      class: 'max-w-full h-auto',
    },
  }),
]
```

### Editor Initialization Hook

```javascript
import { useEditor } from '@tiptap/react'
import { MVP_EXTENSIONS } from './extensions'

export function useAssessmentEditor({ initialContent = '', onUpdate } = {}) {
  const editor = useEditor({
    extensions: MVP_EXTENSIONS,
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'assessment-editor',
        spellcheck: 'false',
        autocorrect: 'off',
        autocapitalize: 'off',
        autocomplete: 'off',
      },
      // Prevent any paste with formatting
      handlePaste: (view, event) => {
        // Get plain text from clipboard
        const text = event.clipboardData?.getData('text/plain') || ''

        if (text) {
          // Insert as plain text only
          const { $from } = view.state.selection
          view.dispatch(
            view.state.tr.insertText(text, $from.pos, $from.pos)
          )
          return true // Prevent default paste
        }

        return false
      },
    },
    onUpdate: ({ editor }) => {
      onUpdate?.(editor)
    },
  })

  return editor
}
```

### Content Format Strategy

**Storage Format**: Recommend storing as HTML for maximum compatibility and future-proofing.

```javascript
// Get content as HTML (recommended for storage)
const htmlContent = editor.getHTML()

// Get content as JSON (for advanced features later)
const jsonContent = editor.getJSON()

// Get plain text (for submission backup)
const plainText = editor.getText()
```

**Database Schema Update**:
```sql
ALTER TABLE submissions ADD COLUMN content_html TEXT;
ALTER TABLE submissions ADD COLUMN content_json JSONB;
-- Keep existing content_raw for backward compatibility

-- Create indices for performance
CREATE INDEX idx_submissions_content_html 
  ON submissions(id) WHERE content_html IS NOT NULL;
```

---

## Styling and Theming

### CSS Framework Integration

**Tailwind CSS Integration** (Abigail already uses Tailwind):

```css
/* editor.css - Use Tailwind utilities directly in components */

.editor-container {
  @apply w-full;
}

.assessment-editor {
  @apply min-h-96 p-4 border border-gray-300 rounded-lg;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500;
  @apply font-sans text-base leading-relaxed;
  
  /* Override any browser defaults */
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}

.assessment-editor p {
  @apply my-2;
}

.assessment-editor ul {
  @apply list-disc list-inside ml-4 my-2;
}

.assessment-editor ol {
  @apply list-decimal list-inside ml-4 my-2;
}

.assessment-editor li {
  @apply my-1;
}

.assessment-editor blockquote {
  @apply border-l-4 border-gray-300 pl-4 italic text-gray-700 my-2;
}

.assessment-editor code {
  @apply bg-gray-100 px-2 py-1 rounded font-mono text-sm;
}

.assessment-editor pre {
  @apply bg-gray-100 p-4 rounded-lg overflow-x-auto my-2;
}

.editor-toolbar {
  @apply flex gap-2 p-3 border-b border-gray-300 bg-gray-50;
  @apply flex-wrap;
}

.toolbar-button {
  @apply px-3 py-2 rounded border border-gray-300;
  @apply hover:bg-gray-100 hover:border-gray-400;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500;
  @apply transition-colors duration-150;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}

.toolbar-button.active {
  @apply bg-blue-500 text-white border-blue-600;
  @apply hover:bg-blue-600;
}

.toolbar-separator {
  @apply w-px bg-gray-300 mx-1;
}

.word-count-display {
  @apply flex gap-3 p-3 border-t border-gray-200 bg-gray-50;
  @apply text-sm text-gray-600;
}

.count-item {
  @apply flex gap-1;
}

.count-separator {
  @apply text-gray-400;
}
```

### Dark Mode Support

```css
@media (prefers-color-scheme: dark) {
  .assessment-editor {
    @apply bg-gray-900 text-white border-gray-700;
    @apply focus:ring-blue-400;
  }

  .editor-toolbar {
    @apply bg-gray-800 border-gray-700;
  }

  .toolbar-button {
    @apply border-gray-600 hover:bg-gray-700 hover:border-gray-500;
  }

  .toolbar-button.active {
    @apply bg-blue-600 border-blue-500;
  }

  .assessment-editor blockquote {
    @apply border-gray-600 text-gray-300;
  }

  .assessment-editor code {
    @apply bg-gray-800;
  }
}
```

---

## Integration with Student Submission Flow

### Refactored StudentSubmissionPage Component

```jsx
import { useState, useRef } from 'react'
import { AssessmentEditor } from '../Editor/AssessmentEditor'
import { useSpellcheckDisable } from '../hooks/useSpellcheckDisable'

export function StudentSubmissionPage({ projectId, studentId }) {
  const editorRef = useRef(null)
  const [submission, setSubmission] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const spellcheckStatus = useSpellcheckDisable(editorRef)

  const handleContentChange = (content) => {
    setSubmission(prev => ({
      ...prev,
      content_html: content,
      updated_at: new Date(),
    }))
  }

  const handleSubmit = async () => {
    // Verify spellcheck compliance before submission
    const complianceCheck = verifySpellcheckDisabled(editorRef.current)
    if (!complianceCheck.passed) {
      console.error('Compliance check failed:', complianceCheck.violations)
      // Optionally: Show error to student
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          student_id: studentId,
          content_html: submission.content_html,
          content_plain_text: editor.getText(),
          status: 'SUBMITTED',
          submitted_at: new Date().toISOString(),
        }),
      })

      if (!response.ok) throw new Error('Submission failed')

      // Show success
      setSubmission(prev => ({ ...prev, status: 'SUBMITTED' }))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="submission-page">
      <div className="stimulus-area">
        {/* Stimulus material display */}
      </div>

      <div className="editor-area">
        <h2>Your Writing</h2>
        <AssessmentEditor
          ref={editorRef}
          submissionId={studentId}
          onContentChange={handleContentChange}
          maxWords={500}
          initialContent={submission?.content_html}
        />
      </div>

      <div className="submission-actions">
        <button
          onClick={handleSubmit}
          disabled={isSaving || !submission?.content_html}
          className="submit-button"
        >
          {isSaving ? 'Submitting...' : 'Submit Writing'}
        </button>
      </div>
    </div>
  )
}
```

---

## Testing Strategy

### Unit Tests

**Test: Spellcheck Disabling**
```javascript
// tests/useSpellcheckDisable.test.js
import { renderHook, waitFor } from '@testing-library/react'
import { useSpellcheckDisable } from '../hooks/useSpellcheckDisable'

describe('useSpellcheckDisable', () => {
  it('should disable spellcheck on editor element', async () => {
    const ref = { current: document.createElement('div') }
    
    renderHook(() => useSpellcheckDisable(ref))
    
    await waitFor(() => {
      expect(ref.current.spellcheck).toBe(false)
      expect(ref.current.getAttribute('spellcheck')).toBe('false')
    })
  })

  it('should intercept paste events and allow only plain text', () => {
    const ref = { current: document.createElement('div') }
    renderHook(() => useSpellcheckDisable(ref))

    const pasteEvent = new ClipboardEvent('paste', {
      clipboardData: new DataTransfer(),
    })
    pasteEvent.clipboardData.setData('text/html', '<b>Bold Text</b>')
    pasteEvent.clipboardData.setData('text/plain', 'Plain Text')

    ref.current.dispatchEvent(pasteEvent)

    expect(pasteEvent.defaultPrevented).toBe(true)
  })

  it('should detect and block spellcheck re-enable attempts', async () => {
    const ref = { current: document.createElement('div') }
    const { result } = renderHook(() => useSpellcheckDisable(ref))

    // Simulate spellcheck re-enable
    ref.current.setAttribute('spellcheck', 'true')
    
    await waitFor(() => {
      const log = result.current.getComplianceLog()
      expect(log.some(entry => 
        entry.event === 'spellcheck_reenabled_attempt'
      )).toBe(true)
    })
  })
})
```

**Test: Editor Content Capture**
```javascript
// tests/AssessmentEditor.test.js
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AssessmentEditor } from '../components/Editor/AssessmentEditor'

describe('AssessmentEditor', () => {
  it('should capture typed content', async () => {
    const mockOnChange = jest.fn()
    render(<AssessmentEditor onContentChange={mockOnChange} />)

    const editor = screen.getByRole('textbox')
    await userEvent.type(editor, 'Test content')

    expect(mockOnChange).toHaveBeenCalled()
  })

  it('should format text with toolbar buttons', async () => {
    render(<AssessmentEditor />)
    
    const boldButton = screen.getByTitle('Bold')
    await userEvent.click(boldButton)

    expect(boldButton).toHaveClass('active')
  })
})
```

### Integration Tests

**Test: Complete Submission Flow**
```javascript
// tests/integration/submission-flow.test.js
describe('Student Submission Flow', () => {
  it('should allow student to write, format, and submit', async () => {
    // Setup
    const { user } = setup()
    
    // Navigate to submission page
    await user.goto('/assessments/123/submit')
    
    // Type content
    const editor = await user.find('[role="textbox"]')
    await user.type(editor, 'This is a test response.')
    
    // Apply formatting
    await user.click('button[title="Bold"]')
    await user.selectAll(editor)
    await user.keyboard('{Control>}b{/Control}')
    
    // Submit
    await user.click('button:has-text("Submit Writing")')
    
    // Verify submission
    const response = await user.waitFor(() =>
      screen.getByText('Writing submitted successfully')
    )
    expect(response).toBeVisible()
  })
})
```

### Compliance Verification Tests

**Test: Pre-Submission Compliance Check**
```javascript
// tests/compliance/spellcheck-verification.test.js
import { verifySpellcheckDisabled } from '../hooks/useSpellcheckDisable'

describe('Spellcheck Verification', () => {
  it('should pass when spellcheck properly disabled', () => {
    const element = document.createElement('div')
    element.spellcheck = false
    element.setAttribute('spellcheck', 'false')

    const result = verifySpellcheckDisabled(element)
    expect(result.passed).toBe(true)
    expect(result.violations).toHaveLength(0)
  })

  it('should fail when spellcheck enabled', () => {
    const element = document.createElement('div')
    element.spellcheck = true

    const result = verifySpellcheckDisabled(element)
    expect(result.passed).toBe(false)
    expect(result.violations).toContain('Editor root spellcheck not disabled')
  })
})
```

### Browser Compatibility Testing

**Tested on:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile: iOS Safari 14.5+, Chrome Android

**Specific Tests**:
- Spellcheck disabling effectiveness
- Paste event handling
- Selection and formatting
- Undo/redo functionality
- Mobile keyboard behavior

---

## Accessibility Compliance

### WCAG 2.1 Level AA Requirements

**Keyboard Navigation**:
- Tab focus moves through toolbar buttons
- Shift+Tab moves backward
- Enter/Space activates buttons
- Ctrl+B, Ctrl+I for common shortcuts
- Arrow keys navigate within editor

**Screen Reader Support**:
```jsx
<div
  role="region"
  aria-label="Assessment writing editor"
  aria-describedby="editor-instructions"
>
  <EditorContent editor={editor} />
</div>

<div id="editor-instructions" className="sr-only">
  Use the toolbar above to format your text. Type your response in the editor below.
</div>
```

**Color Contrast**:
- Toolbar buttons: 7:1 contrast ratio
- Editor text: 7:1 on white, 4.5:1 on gray backgrounds
- Active/focused states: Enhanced visibility

**Focus Indicators**:
```css
.toolbar-button:focus-visible {
  outline: 3px solid #2563eb; /* Blue */
  outline-offset: 2px;
}

.assessment-editor:focus-visible {
  outline: 3px solid #2563eb;
  outline-offset: -1px;
}
```

---

## Performance Considerations

### Optimization Strategies

**1. Lazy Loading**:
- Load TipTap extensions only when editor is needed
- Code split editor component from main bundle

**2. Debounce onUpdate Events**:
```javascript
const debouncedUpdate = useCallback(
  debounce((content) => onContentChange?.(content), 300),
  [onContentChange]
)
```

**3. Memoization**:
```jsx
export const AssessmentEditor = memo(function AssessmentEditor(props) {
  // Component implementation
})
```

**4. Word Count Optimization**:
- Calculate word count only on significant changes
- Avoid recalculation for every keystroke

**Expected Performance Metrics**:
- Editor initialization: < 100ms
- Keystroke response: < 50ms
- Formatting action: < 20ms
- Content persistence: < 200ms

### Bundle Size Management

**Current estimate**: ~50-60 KB (gzipped ~15-18 KB)

**Mitigation**:
- Tree-shake unused extensions
- Lazy load advanced extensions (heading, blockquote, links)
- Minification and gzip compression

---

## Data Migration and Backward Compatibility

### Handling Existing Plain Text Content

**Current State**: Submissions stored as plain text

**Migration Strategy**:
1. Create `content_html` field alongside `content_raw`
2. During first load, convert `content_raw` to basic HTML:
   ```javascript
   function plainTextToHTML(plainText) {
     return plainText
       .split('\n\n')
       .map(p => `<p>${escapeHtml(p.replace(/\n/g, '<br>'))}</p>`)
       .join('')
   }
   ```
3. Store both formats during transitional period
4. Frontend always reads from `content_html` if available, falls back to `content_raw`

**API Response Update**:
```javascript
// Get submission
GET /api/submissions/:id

Response:
{
  id: '...',
  content_raw: 'Original plain text',  // Preserved for backward compatibility
  content_html: '<p>Formatted content</p>',  // New TipTap format
  content_json: { type: 'doc', content: [...] }  // For future use
}
```

---

## Error Handling and Recovery

### Editor Errors

**Graceful Degradation**:
```javascript
export function AssessmentEditor({ ...props }) {
  const [error, setError] = useState(null)

  useEffect(() => {
    try {
      // Initialize editor
    } catch (err) {
      console.error('Editor initialization failed:', err)
      setError('Unable to load editor. Please refresh the page.')
    }
  }, [])

  if (error) {
    return (
      <div className="editor-error">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>
          Reload Page
        </button>
      </div>
    )
  }

  return <AssessmentEditor {...props} />
}
```

**Content Loss Prevention**:
```javascript
// Auto-save to localStorage
useEffect(() => {
  const timeout = setTimeout(() => {
    if (editor?.getHTML()) {
      localStorage.setItem(
        `submission_${submissionId}_draft`,
        editor.getHTML()
      )
    }
  }, 3000) // Save every 3 seconds

  return () => clearTimeout(timeout)
}, [editor])

// Recover from localStorage on mount
useEffect(() => {
  const savedContent = localStorage.getItem(`submission_${submissionId}_draft`)
  if (savedContent && !initialContent) {
    editor?.commands.setContent(savedContent)
  }
}, [])
```

---

## Security Considerations

### XSS Prevention

**HTML Sanitization**:
```javascript
import DOMPurify from 'dompurify'

// When storing content
const cleanHTML = DOMPurify.sanitize(editor.getHTML(), {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'blockquote'],
  ALLOWED_ATTR: ['class'],
})
```

**Content Security Policy**:
```html
<meta 
  http-equiv="Content-Security-Policy" 
  content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
>
```

### Paste Event Security

**Prevent Malicious Content**:
```javascript
handlePaste: (view, event) => {
  // Only allow plain text
  const text = event.clipboardData?.getData('text/plain') || ''
  
  // Reject if contains HTML-like patterns
  if (text.includes('<') && text.includes('>')) {
    console.warn('Suspicious content detected in paste')
    return true // Block paste
  }

  // Insert as plain text
  view.dispatch(
    view.state.tr.insertText(text, view.state.selection.from)
  )
  return true
}
```

---

## Monitoring and Compliance Logging

### Audit Trail

**Log Events**:
```javascript
const auditLog = {
  editor_initialized: { timestamp, user_id, session_id },
  content_started: { timestamp, user_id },
  formatting_applied: { timestamp, format_type, user_id },
  content_submitted: { timestamp, word_count, user_id },
  spellcheck_violation_blocked: { timestamp, reason, user_id },
}
```

**Storage**:
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  submission_id UUID REFERENCES submissions(id),
  event_type VARCHAR(50),
  timestamp TIMESTAMP,
  user_id UUID,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_submission ON audit_logs(submission_id);
CREATE INDEX idx_audit_logs_event_type ON audit_logs(event_type);
```

### Compliance Reports

**Generate Report**:
```javascript
async function generateComplianceReport(submissionId) {
  const logs = await fetchAuditLogs(submissionId)
  
  return {
    submission_id: submissionId,
    spellcheck_enforced: logs.every(
      l => !l.details?.spellcheck_violation
    ),
    violations_blocked: logs.filter(
      l => l.event_type === 'spellcheck_violation_blocked'
    ).length,
    assessment_integrity: logs.some(l => l.event_type === 'spellcheck_violation_blocked')
      ? 'COMPROMISED'
      : 'VERIFIED',
  }
}
```

---

## Future Enhancement Paths

### Phase 2: Advanced Formatting

- **Headings**: Multi-level heading support for longer responses
- **Blockquotes**: For evidence-based responses
- **Code blocks**: For technical/programming assessments
- **Tables**: For data organization (optional)

### Phase 3: Collaborative Features

- **Comments**: Teacher can add inline comments without editing
- **Track Changes**: Highlight revisions
- **Version History**: Track edits over time

### Phase 4: AI Integration

- **Autosuggest**: Grammar suggestions (optional, teacher-controlled)
- **Readability Analysis**: Flesch-Kincaid grade level display
- **Feedback Generation**: AI generates constructive feedback from rubric scores

### Phase 5: Mobile Optimization

- **Touch-Friendly Toolbar**: Larger buttons for tablets
- **Gesture Support**: Swipe for undo/redo
- **Landscape Mode**: Optimize for iPad

---

## Deployment and Rollout

### Pre-Deployment Checklist

- [ ] All unit tests passing (>90% coverage)
- [ ] Integration tests passing
- [ ] Accessibility audit completed (WCAG 2.1 AA)
- [ ] Cross-browser compatibility verified
- [ ] Performance benchmarks met (<50ms keystroke response)
- [ ] Spellcheck compliance verification passing
- [ ] Security review completed
- [ ] Documentation updated
- [ ] Stakeholder sign-off obtained

### Rollout Strategy

**Beta Testing**:
1. Deploy to staging environment
2. Invite pilot teachers (2-3 classrooms)
3. Collect feedback for 1-2 weeks
4. Iterate on UX issues
5. Finalize documentation

**Production Deployment**:
1. Deploy during low-usage window (off-school hours)
2. Monitor error rates for 24 hours
3. Gradually increase traffic (10% → 50% → 100%)
4. Provide rollback plan if critical issues emerge

**Teacher Communication**:
- Release notes highlighting new features
- Quick-start guide with toolbar explanation
- Keyboard shortcuts cheat sheet
- Support contact for issues

---

## Documentation Requirements

### Developer Documentation

- TipTap component API reference
- Extension configuration guide
- Custom hook documentation
- Testing guidelines
- Performance tuning tips

### End-User Documentation

**For Teachers**:
- How to view student responses
- Understanding formatting options
- Troubleshooting common issues

**For Students**:
- Getting started guide
- Keyboard shortcuts
- Accessibility features
- How to request help

### Compliance Documentation

- Spellcheck enforcement verification procedure
- Assessment integrity audit trail explanation
- Compliance report interpretation
- Security considerations

---

## Support and Maintenance

### Known Limitations

1. **Paste Handling**: Formatted text pasted becomes plain text (by design)
2. **Undo Limits**: Undo history limited to last 20 actions (configurable)
3. **Large Documents**: Performance degrades with 10,000+ words (rare for assessments)
4. **Mobile Keyboard**: Some autocorrect features may appear (requires browser update)

### Bug Tracking

- Use GitHub Issues for tracked bugs
- Include: Browser, OS, reproduction steps, screenshot
- Priority: Critical (submission blocking) → High → Medium → Low

### Performance Monitoring

```javascript
// Monitor keystroke latency
window.addEventListener('keydown', (e) => {
  const start = performance.now()
  requestAnimationFrame(() => {
    const latency = performance.now() - start
    if (latency > 100) {
      console.warn(`High keystroke latency: ${latency}ms`)
    }
  })
})
```

---

## Conclusion

This implementation plan provides a comprehensive approach to integrating TipTap as the rich text editor for Abigail NAPLAN Marking. The strategy balances ease of implementation with assessment integrity requirements, ensuring teachers and students have a polished, reliable editing experience while maintaining strict spellcheck enforcement.

The phased approach allows for rapid MVP delivery while preserving the flexibility to enhance features over time as needs evolve.

### Key Takeaways

1. **TipTap provides the optimal balance** of ease, polish, and compliance for this use case
2. **Spellcheck compliance is verified and enforceable** through multiple layers of protection
3. **Incremental enhancement path** allows for rapid delivery followed by thoughtful feature additions
4. **Thorough testing and monitoring** ensure assessment integrity is maintained
5. **Accessibility and security** are built-in from the start, not added later

### Next Steps

1. Review and approve this plan with stakeholders
2. Set up development environment with TipTap dependencies
3. Implement Phase 1 components (MVP)
4. Conduct security review before staging deployment
5. Begin beta testing with pilot teachers
6. Collect feedback and refine UX
7. Deploy to production with monitoring

