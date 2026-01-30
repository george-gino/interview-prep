'use client';

import { Editor } from '@monaco-editor/react';
import { CodeEditorProps } from '@/lib/types';

/**
 * Monaco-based code editor component
 * Supports syntax highlighting for Python and JavaScript
 * Configured to simulate interview environment (no autocomplete)
 */
export default function CodeEditor({
  language,
  value,
  onChange,
  readOnly = false,
}: CodeEditorProps) {
  return (
    <div className="h-full border border-gray-300 rounded-lg overflow-hidden">
      <Editor
        height="100%"
        language={language}
        value={value}
        onChange={(value) => onChange(value || '')}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          readOnly: readOnly,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          // Disable features to simulate interview environment
          quickSuggestions: false,
          suggestOnTriggerCharacters: false,
          wordBasedSuggestions: 'off',
          parameterHints: { enabled: false },
        }}
      />
    </div>
  );
}

