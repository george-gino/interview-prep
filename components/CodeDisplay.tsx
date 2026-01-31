'use client';

import { Editor } from '@monaco-editor/react';

/**
 * Read-only code display component for viewing submitted code
 * Used in session results page
 */
export default function CodeDisplay({
  language,
  value,
}: {
  language: string;
  value: string;
}) {
  return (
    <div className="h-full border border-gray-300 rounded-lg overflow-hidden">
      <Editor
        height="100%"
        language={language}
        value={value}
        theme="vs-dark"
        options={{
          readOnly: true,
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          domReadOnly: true,
        }}
      />
    </div>
  );
}


