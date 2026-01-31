// lib/types.ts

/**
 * Represents a coding interview problem from the database
 */
export interface Problem {
  id: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  starter_code: {
    python: string;
    javascript: string;
    typescript: string;
    java: string;
    cpp: string;
    go: string;
    rust: string;
  };
  created_at: string;
}

/**
 * Supported programming languages
 */
export const LANGUAGES = {
  python: { name: 'Python', color: '#3776AB', monaco: 'python' },
  javascript: { name: 'JavaScript', color: '#F7DF1E', monaco: 'javascript' },
  typescript: { name: 'TypeScript', color: '#3178C6', monaco: 'typescript' },
  java: { name: 'Java', color: '#007396', monaco: 'java' },
  cpp: { name: 'C++', color: '#00599C', monaco: 'cpp' },
  go: { name: 'Go', color: '#00ADD8', monaco: 'go' },
  rust: { name: 'Rust', color: '#CE412B', monaco: 'rust' },
} as const;

export type LanguageKey = keyof typeof LANGUAGES;

/**
 * Represents a completed interview session
 */
export interface Session {
  id: string;
  problem_id: number;
  language: string;
  code: string;
  audio_url?: string;
  transcript?: string;
  feedback?: string;
  score?: number;
  duration_seconds?: number;
  created_at: string;
}

/**
 * Props for AudioRecorder component
 */
export interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  isRecording: boolean;
  onToggleRecording: () => void;
}

/**
 * Props for CodeEditor component
 */
export interface CodeEditorProps {
  language: string;
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

/**
 * Props for ProblemSelector component
 */
export interface ProblemSelectorProps {
  problems: Problem[];
  selectedProblem: Problem | null;
  onSelectProblem: (problem: Problem) => void;
}

/**
 * Structured feedback from Claude API
 */
export interface FeedbackData {
  communication_score: number;
  problem_solving_score: number;
  code_quality_score: number;
  overall_score: number;
  strengths: string[];
  improvements: string[];
  next_steps: string[];
  raw_feedback: string;
}

