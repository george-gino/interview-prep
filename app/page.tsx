'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ProblemSelector from '@/components/ProblemSelector';
import CodeEditor from '@/components/CodeEditor';
import AudioRecorder from '@/components/AudioRecorder';
import { getProblems, createSession, updateSession } from '@/lib/supabase';
import { Problem } from '@/lib/types';

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
  const [language, setLanguage] = useState<'python' | 'javascript'>('python');
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
   * Updates code editor when problem or language changes
   * Loads the appropriate starter code template
   */
  useEffect(() => {
    if (selectedProblem) {
      setCode(selectedProblem.starter_code[language]);
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
      console.log('⏱️ Setting start time:', now);
      startTimeRef.current = now; // Store in ref for immediate access
      setIsRecording(true);
      console.log('✅ Recording state set to true');
    } else {
      // Stopping interview (actual recording stop handled by AudioRecorder)
      console.log('⏸️ Setting recording state to false');
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
    console.log('🎤 handleRecordingComplete called');
    console.log('  Selected problem:', selectedProblem?.title || 'NONE');
    console.log('  Start time:', startTimeRef.current || 'NONE');
    console.log('  Blob size:', blob.size, 'bytes');
    
    if (!selectedProblem) {
      console.error('❌ No problem selected!');
      alert('Please select a problem before recording.');
      return;
    }
    
    if (!startTimeRef.current) {
      console.error('❌ No start time! This should not happen.');
      alert('Recording error: start time not set. Please try again.');
      return;
    }

    console.log('✅ Validation passed, processing recording...');
    console.log('  Problem:', selectedProblem.title);
    console.log('  Language:', language);
    console.log('  Code length:', code.length);
    
    setIsProcessing(true);
    
    try {
      // Calculate interview duration
      const durationSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
      console.log('  Duration:', durationSeconds, 'seconds');

      // Step 1: Save initial session to database
      console.log('💾 Creating session...');
      const session = await createSession({
        problem_id: selectedProblem.id,
        language,
        code,
        duration_seconds: durationSeconds,
      });

      console.log('✅ Session created:', session.id);

      // Step 2: Transcribe audio using OpenAI Whisper
      console.log('📝 Transcribing audio with Whisper...');
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
      console.log('✅ Transcription complete:', transcript.length, 'characters');
      console.log('  First 100 chars:', transcript.substring(0, 100));
      
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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">AI Interview Practice</h1>
        <p className="text-gray-600 mb-8">Practice coding interviews with AI-powered feedback</p>

        {/* Problem Selection */}
        <div className="mb-6">
          <ProblemSelector
            problems={problems}
            selectedProblem={selectedProblem}
            onSelectProblem={setSelectedProblem}
          />
        </div>

        {/* Language Selector */}
        {selectedProblem && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Programming Language
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setLanguage('python')}
                className={`px-4 py-2 rounded-lg transition ${
                  language === 'python'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Python
              </button>
              <button
                onClick={() => setLanguage('javascript')}
                className={`px-4 py-2 rounded-lg transition ${
                  language === 'javascript'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                JavaScript
              </button>
            </div>
          </div>
        )}

        {/* Code Editor */}
        {selectedProblem && (
          <div className="mb-6 h-96">
            <CodeEditor
              language={language}
              value={code}
              onChange={setCode}
            />
          </div>
        )}

        {/* Recording Controls */}
        {selectedProblem && (
          <div className="flex items-center gap-4">
            <AudioRecorder
              onRecordingComplete={handleRecordingComplete}
              isRecording={isRecording}
              onToggleRecording={handleToggleRecording}
            />
            
            {/* Timer Display */}
            {isRecording && startTimeRef.current && (
              <span className="text-gray-600 font-mono">
                Time: {Math.floor((Date.now() - startTimeRef.current) / 1000)}s
              </span>
            )}
          </div>
        )}

        {/* Processing Overlay */}
        {isProcessing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg text-center max-w-md">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg font-medium mb-2">Processing your interview...</p>
              <p className="text-sm text-gray-600">
                Transcribing audio and generating feedback. This may take 30-60 seconds.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

