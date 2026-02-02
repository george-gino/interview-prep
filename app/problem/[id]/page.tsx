'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import CodeEditor from '@/components/CodeEditor';
import AudioRecorder from '@/components/AudioRecorder';
import VoiceInterviewer from '@/components/VoiceInterviewer';
import LanguageSelector from '@/components/LanguageSelector';
import { createSession, updateSession } from '@/lib/supabase';
import { Problem, LanguageKey, LANGUAGES } from '@/lib/types';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

/**
 * Individual problem interview page
 * Handles the complete interview flow for a specific problem
 */
export default function ProblemPage() {
  const params = useParams();
  const problemId = params.id as string;
  const [problem, setProblem] = useState<Problem | null>(null);
  const [language, setLanguage] = useState<LanguageKey>('python');
  const [code, setCode] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [interviewMode, setInterviewMode] = useState<'recorded' | 'voice'>('recorded');
  const startTimeRef = useRef<number | null>(null);
  
  const router = useRouter();

  // Load problem when component mounts
  useEffect(() => {
    if (problemId) {
      loadProblem(parseInt(problemId));
    }
  }, [problemId]);

  /**
   * Loads a specific problem from Supabase
   */
  async function loadProblem(id: number) {
    try {
      const { data, error } = await supabase
        .from('problems')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      setProblem(data);
    } catch (error) {
      alert('Failed to load problem. Please try again.');
      router.push('/problems');
    }
  }

  /**
   * Generates starter code template for languages not in database
   */
  const generateStarterCode = (lang: LanguageKey, problemTitle: string): string => {
    const functionName = problemTitle.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    
    const templates: Record<LanguageKey, string> = {
      python: `def ${functionName}():\n    # Your code here\n    pass`,
      javascript: `function ${functionName}() {\n    // Your code here\n}`,
      typescript: `function ${functionName}(): void {\n    // Your code here\n}`,
      java: `public class Solution {\n    public void ${functionName}() {\n        // Your code here\n    }\n}`,
      cpp: `class Solution {\npublic:\n    void ${functionName}() {\n        // Your code here\n    }\n};`,
      go: `func ${functionName}() {\n    // Your code here\n}`,
      rust: `impl Solution {\n    pub fn ${functionName}() {\n        // Your code here\n    }\n}`,
    };
    
    return templates[lang];
  };

  /**
   * Updates code editor when problem or language changes
   */
  useEffect(() => {
    if (problem) {
      const starterCode = problem.starter_code[language] || 
                         generateStarterCode(language, problem.title);
      setCode(starterCode);
    }
  }, [problem, language]);

  /**
   * Handles starting/stopping the interview session
   */
  function handleToggleRecording() {
    if (!isRecording) {
      const now = Date.now();
      console.log('[RECORDING] Setting start time:', now);
      startTimeRef.current = now;
      setIsRecording(true);
    } else {
      console.log('[RECORDING] Setting recording state to false');
      setIsRecording(false);
    }
  }

  /**
   * Handles when audio recording is complete
   */
  async function handleRecordingComplete(blob: Blob) {
    console.log('[RECORDING] handleRecordingComplete called');
    
    if (!problem) {
      console.error('[ERROR] No problem loaded!');
      alert('Problem not loaded. Please try again.');
      return;
    }
    
    if (!startTimeRef.current) {
      console.error('[ERROR] No start time!');
      alert('Recording error: start time not set. Please try again.');
      return;
    }

    console.log('[PROCESSING] Processing recording...');
    setIsProcessing(true);
    
    try {
      const durationSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);

      // Step 1: Save initial session to database
      console.log('[DATABASE] Creating session...');
      const session = await createSession({
        problem_id: problem.id,
        language,
        code,
        duration_seconds: durationSeconds,
      });

      console.log('[DATABASE] Session created:', session.id);

      // Step 2: Transcribe audio
      console.log('[TRANSCRIPTION] Transcribing audio with Deepgram...');
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');
      
      const transcribeResponse = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!transcribeResponse.ok) {
        throw new Error('Transcription failed');
      }

      const { transcript } = await transcribeResponse.json();
      console.log('[TRANSCRIPTION] Transcription complete:', transcript.length, 'characters');
      
      if (!transcript || transcript.trim().length === 0) {
        alert('No speech was detected. Please try again and speak while coding.');
        setIsProcessing(false);
        return;
      }

      // Step 3: Get AI feedback
      const feedbackResponse = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemDescription: problem.description,
          code,
          transcript,
        }),
      });

      if (!feedbackResponse.ok) {
        throw new Error('Feedback generation failed');
      }

      const { feedback, score } = await feedbackResponse.json();

      // Step 4: Update session with results
      await updateSession(session.id, {
        transcript,
        feedback,
        score,
      });

      // Step 5: Navigate to results page
      router.push(`/session/${session.id}`);
      
    } catch (error: any) {
      console.error('Error processing interview:', error);
      alert(`Error processing interview: ${error?.message || 'Unknown error'}`);
      setIsProcessing(false);
    }
  }

  /**
   * Handles when voice interview is complete
   */
  async function handleVoiceComplete(transcript: string, durationSeconds: number) {
    if (!problem) {
      alert('Problem not loaded. Please try again.');
      return;
    }

    console.log('[VOICE-COMPLETE] Processing voice interview...');
    console.log('[VOICE-COMPLETE] Final code length:', code.length);
    setIsProcessing(true);

    try {
      // Create session with the code written during interview
      const session = await createSession({
        problem_id: problem.id,
        language,
        code, // This is the code they wrote while talking
        duration_seconds: durationSeconds,
      });

      // Get AI feedback based on conversation transcript AND code
      const feedbackResponse = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemDescription: problem.description,
          code,
          transcript,
        }),
      });

      if (!feedbackResponse.ok) {
        throw new Error('Feedback generation failed');
      }

      const { feedback, score } = await feedbackResponse.json();

      // Update session with results
      await updateSession(session.id, {
        transcript,
        feedback,
        score,
      });

      // Navigate to results page
      router.push(`/session/${session.id}`);
      
    } catch (error: any) {
      console.error('Error processing voice interview:', error);
      alert(`Error processing interview: ${error?.message || 'Unknown error'}`);
      setIsProcessing(false);
    }
  }

  if (!problem) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading problem...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-slate-900 border-b border-slate-700 px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <Link
            href="/problems"
            className="flex items-center gap-2 text-gray-300 hover:text-emerald-400 transition-colors font-semibold"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-semibold">Back to Problems</span>
          </Link>
        </div>
        <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
          AI Interview Practice
        </h1>
      </div>

      {/* Main Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Problem Description */}
        <div className="w-[40%] border-r border-gray-700 overflow-y-auto bg-gray-800">
          <div className="p-6">
            {/* Problem Header */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-2xl font-bold text-white">
                  {problem.title}
                </h2>
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide border ${
                  problem.difficulty === 'Easy' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                  problem.difficulty === 'Medium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                  'bg-rose-500/20 text-rose-400 border-rose-500/30'
                }`}>
                  {problem.difficulty}
                </span>
              </div>
              <div className="h-px bg-gray-700"></div>
            </div>

            {/* Problem Description */}
            <div className="prose prose-sm prose-invert max-w-none">
              <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {problem.description}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Editor / Interview */}
        <div className="flex-1 flex flex-col bg-gray-900">
          {/* Editor Header */}
          <div className="flex-shrink-0 bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mode Toggle */}
              <div className="flex items-center gap-2 bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setInterviewMode('recorded')}
                  className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                    interviewMode === 'recorded'
                      ? 'bg-gray-600 text-white'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Recorded Mode
                </button>
                <button
                  onClick={() => setInterviewMode('voice')}
                  className={`px-4 py-2 rounded-md text-sm font-semibold transition-all flex items-center gap-2 ${
                    interviewMode === 'voice'
                      ? 'bg-emerald-600 text-white'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                  </svg>
                  Live Interview
                </button>
              </div>

              <div className="w-48">
                <LanguageSelector
                  value={language}
                  onChange={setLanguage}
                />
              </div>
            </div>
            
            {/* Recording Status */}
            {isRecording && startTimeRef.current && (
              <div className="flex items-center gap-3 px-3 py-1.5 bg-red-900/30 border border-red-700 rounded-lg">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="text-sm font-bold text-red-400">
                  Recording
                </span>
                <span className="text-sm font-mono font-bold text-red-400">
                  {Math.floor((Date.now() - startTimeRef.current) / 1000)}s
                </span>
              </div>
            )}
          </div>

          {/* Code Editor - Always Visible */}
          <div className="flex-1 overflow-hidden">
            <CodeEditor
              key={language}
              language={LANGUAGES[language].monaco}
              value={code}
              onChange={setCode}
            />
          </div>

          {/* Bottom Controls */}
          <div className="flex-shrink-0 bg-gray-800 border-t border-gray-700 px-6 py-4">
            {interviewMode === 'recorded' ? (
              <div className="flex items-center justify-between">
                <AudioRecorder
                  onRecordingComplete={handleRecordingComplete}
                  isRecording={isRecording}
                  onToggleRecording={handleToggleRecording}
                />
                {!isRecording && (
                  <p className="text-xs text-gray-400">
                    Start recording to begin your interview. Explain your approach as you code.
                  </p>
                )}
              </div>
            ) : (
              <VoiceInterviewer
                problemId={problem.id}
                onComplete={handleVoiceComplete}
              />
            )}
          </div>
        </div>
      </div>

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 p-10 rounded-2xl text-center max-w-md shadow-2xl">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-gray-700 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-xl font-bold text-white mb-3">Processing Your Interview</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Transcribing your audio and generating personalized feedback.
              <br />
              This may take 30-60 seconds.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

