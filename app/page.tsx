'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ProblemSelector from '@/components/ProblemSelector';
import CodeEditor from '@/components/CodeEditor';
import AudioRecorder from '@/components/AudioRecorder';
import LanguageSelector from '@/components/LanguageSelector';
import { getProblems, createSession, updateSession } from '@/lib/supabase';
import { Problem, LanguageKey, LANGUAGES } from '@/lib/types';

/**
 * Main interview practice page
 * Handles the complete interview flow:
 * 1. Select problem
 * 2. Record audio while coding
 * 3. Process recording (transcribe + get feedback)
 * 4. Redirect to results
 */
export default function InterviewPage() {
  // State management
  const [problems, setProblems] = useState<Problem[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [language, setLanguage] = useState<LanguageKey>('python');
  const [code, setCode] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const startTimeRef = useRef<number | null>(null); // Use ref to avoid stale closures
  
  const router = useRouter();

  // Load problems when component mounts
  useEffect(() => {
    loadProblems();
  }, []);

  /**
   * Loads all problems from Supabase
   */
  async function loadProblems() {
    try {
      const data = await getProblems();
      setProblems(data);
    } catch (error) {
      alert('Failed to load problems. Please refresh the page.');
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
   * Loads the appropriate starter code template
   */
  useEffect(() => {
    if (selectedProblem) {
      // Get starter code from database or generate template
      const starterCode = selectedProblem.starter_code[language] || 
                         generateStarterCode(language, selectedProblem.title);
      setCode(starterCode);
    }
  }, [selectedProblem, language]);

  /**
   * Handles starting/stopping the interview session
   * Tracks start time for duration calculation
   */
  function handleToggleRecording() {
    if (!isRecording) {
      // Starting interview - record start time
      const now = Date.now();
      console.log('[RECORDING] Setting start time:', now);
      startTimeRef.current = now; // Store in ref for immediate access
      setIsRecording(true);
      console.log('[RECORDING] Recording state set to true');
    } else {
      // Stopping interview (actual recording stop handled by AudioRecorder)
      console.log('[RECORDING] Setting recording state to false');
      setIsRecording(false);
    }
  }

  /**
   * Handles when audio recording is complete
   * Orchestrates the full processing pipeline:
   * 1. Save session to database
   * 2. Transcribe audio
   * 3. Get AI feedback
   * 4. Update session with results
   * 5. Navigate to results page
   */
  async function handleRecordingComplete(blob: Blob) {
    console.log('[RECORDING] handleRecordingComplete called');
    console.log('[RECORDING] Selected problem:', selectedProblem?.title || 'NONE');
    console.log('[RECORDING] Start time:', startTimeRef.current || 'NONE');
    console.log('[RECORDING] Blob size:', blob.size, 'bytes');
    
    if (!selectedProblem) {
      console.error('[ERROR] No problem selected!');
      alert('Please select a problem before recording.');
      return;
    }
    
    if (!startTimeRef.current) {
      console.error('[ERROR] No start time! This should not happen.');
      alert('Recording error: start time not set. Please try again.');
      return;
    }

    console.log('[PROCESSING] Validation passed, processing recording...');
    console.log('[PROCESSING] Problem:', selectedProblem.title);
    console.log('[PROCESSING] Language:', language);
    console.log('[PROCESSING] Code length:', code.length);
    
    setIsProcessing(true);
    
    try {
      // Calculate interview duration
      const durationSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
      console.log('[PROCESSING] Duration:', durationSeconds, 'seconds');

      // Step 1: Save initial session to database
      console.log('[DATABASE] Creating session...');
      const session = await createSession({
        problem_id: selectedProblem.id,
        language,
        code,
        duration_seconds: durationSeconds,
      });

      console.log('[DATABASE] Session created:', session.id);

      // Step 2: Transcribe audio using OpenAI Whisper
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
      console.log('[TRANSCRIPTION] First 100 chars:', transcript.substring(0, 100));
      
      // Check if we have a transcript
      if (!transcript || transcript.trim().length === 0) {
        alert('No speech was detected. Please try again and speak while coding.');
        setIsProcessing(false);
        return;
      }

      // Step 3: Get AI feedback from Claude
      const feedbackResponse = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemDescription: selectedProblem.description,
          code,
          transcript,
        }),
      });

      if (!feedbackResponse.ok) {
        throw new Error('Feedback generation failed');
      }

      const { feedback, score } = await feedbackResponse.json();
      console.log('Feedback generated');

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
      const errorMessage = error?.message || 'Unknown error';
      alert(`Error processing interview: ${errorMessage}\n\nCheck browser console (F12) for details.`);
      setIsProcessing(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            AI Interview Practice
          </h1>
          <p className="text-gray-600 mt-2">Practice coding interviews with real-time AI feedback</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Problem Selection */}
        <div className="mb-8">
          <ProblemSelector
            problems={problems}
            selectedProblem={selectedProblem}
            onSelectProblem={setSelectedProblem}
          />
        </div>

        {selectedProblem && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Controls */}
            <div className="lg:col-span-1 space-y-6">
              {/* Language Selector */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                  Programming Language
                </h3>
                <LanguageSelector
                  value={language}
                  onChange={setLanguage}
                />
              </div>

              {/* Recording Controls */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                  Interview Session
                </h3>
                <AudioRecorder
                  onRecordingComplete={handleRecordingComplete}
                  isRecording={isRecording}
                  onToggleRecording={handleToggleRecording}
                />
                
                {/* Timer Display */}
                {isRecording && startTimeRef.current && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                      <span className="text-sm font-bold text-red-700">
                        Recording
                      </span>
                    </div>
                    <p className="text-2xl font-mono font-bold text-red-600 mt-2">
                      {Math.floor((Date.now() - startTimeRef.current) / 1000)}s
                    </p>
                  </div>
                )}
                
                {!isRecording && (
                  <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-xs text-gray-600">
                      Click Start Recording to begin your interview session. Explain your thought process as you code.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Code Editor */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Code Editor
                  </h3>
                  <span className="text-xs font-medium text-gray-500 px-2 py-1 bg-white rounded border border-gray-200">
                    {LANGUAGES[language].name}
                  </span>
                </div>
                <div className="h-[600px]">
                  <CodeEditor
                    key={language}
                    language={LANGUAGES[language].monaco}
                    value={code}
                    onChange={setCode}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Processing Overlay */}
        {isProcessing && (
          <div className="fixed inset-0 bg-gradient-to-br from-indigo-900/90 to-purple-900/90 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-10 rounded-2xl text-center max-w-md shadow-2xl">
              <div className="relative w-16 h-16 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <p className="text-xl font-bold text-gray-900 mb-3">Processing Your Interview</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                Transcribing your audio and generating personalized feedback.
                <br />
                This may take 30-60 seconds.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

