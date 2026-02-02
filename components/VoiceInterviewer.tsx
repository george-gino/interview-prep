'use client';

import { useState, useRef, useEffect } from 'react';

interface VoiceInterviewerProps {
  problemId: number;
  onComplete: (transcript: string, durationSeconds: number) => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function VoiceInterviewer({ problemId, onComplete }: VoiceInterviewerProps) {
  const [isActive, setIsActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [transcript, setTranscript] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Start the voice interview
   */
  const startInterview = async () => {
    try {
      setError(null);
      console.log('[VOICE-INTERVIEW] Starting interview...');

      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // Initialize AudioContext for playback
      audioContextRef.current = new AudioContext();

      // Start session
      const formData = new FormData();
      formData.append('action', 'start');
      formData.append('problemId', problemId.toString());

      const response = await fetch('/api/voice-session', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to start session');
      }

      const data = await response.json();
      console.log('[VOICE-INTERVIEW] Session started:', data.sessionId);

      setSessionId(data.sessionId);
      setTranscript([{ role: 'assistant', content: data.greetingText }]);
      setIsActive(true);
      setStartTime(Date.now()); // Track interview start time

      // Play greeting audio
      setIsAISpeaking(true);
      await playAudio(data.greetingAudio);
      setIsAISpeaking(false);

      // Start recording user
      startRecording(stream);

    } catch (err: any) {
      console.error('[VOICE-INTERVIEW] Error:', err);
      setError(err.message || 'Failed to start interview');
      cleanupResources();
    }
  };

  /**
   * Start recording user audio
   */
  const startRecording = (stream: MediaStream) => {
    console.log('[VOICE-INTERVIEW] Starting recording...');
    
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    recordingChunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordingChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.start();
    setIsRecording(true);

    // Send chunks every 4 seconds
    recordingIntervalRef.current = setInterval(async () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        await processAudioChunk();
      }
    }, 4000);
  };

  /**
   * Process and send audio chunk
   */
  const processAudioChunk = async () => {
    if (!sessionId || recordingChunksRef.current.length === 0) return;

    console.log('[VOICE-INTERVIEW] Processing audio chunk...');

    // Stop recording temporarily
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }

    // Wait a bit for ondataavailable to fire
    await new Promise(resolve => setTimeout(resolve, 100));

    const audioBlob = new Blob(recordingChunksRef.current, { type: 'audio/webm' });
    recordingChunksRef.current = [];

    if (audioBlob.size < 1000) {
      // Too small, restart recording
      if (mediaStreamRef.current) {
        startRecording(mediaStreamRef.current);
      }
      return;
    }

    try {
      // Transcribe
      const transcribeForm = new FormData();
      transcribeForm.append('action', 'transcribe');
      transcribeForm.append('sessionId', sessionId);
      transcribeForm.append('audio', audioBlob, 'audio.webm');

      const transcribeResponse = await fetch('/api/voice-session', {
        method: 'POST',
        body: transcribeForm,
      });

      const { transcript: userText } = await transcribeResponse.json();
      console.log('[VOICE-INTERVIEW] User transcript:', userText);

      if (userText && userText.trim().length > 3) {
        // Add user message to transcript
        setTranscript(prev => [...prev, { role: 'user', content: userText }]);

        // Stop recording while AI responds
        setIsRecording(false);
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
        }

        // Get AI response
        const respondForm = new FormData();
        respondForm.append('action', 'respond');
        respondForm.append('sessionId', sessionId);
        respondForm.append('transcript', userText);

        const respondResponse = await fetch('/api/voice-session', {
          method: 'POST',
          body: respondForm,
        });

        const { responseText, responseAudio } = await respondResponse.json();
        console.log('[VOICE-INTERVIEW] AI response:', responseText);

        // Add AI message to transcript
        setTranscript(prev => [...prev, { role: 'assistant', content: responseText }]);

        // Play AI audio
        setIsAISpeaking(true);
        await playAudio(responseAudio);
        setIsAISpeaking(false);

        // Resume recording
        if (mediaStreamRef.current) {
          startRecording(mediaStreamRef.current);
        }
      } else {
        // No speech detected, resume recording
        if (mediaStreamRef.current) {
          startRecording(mediaStreamRef.current);
        }
      }
    } catch (err) {
      console.error('[VOICE-INTERVIEW] Process error:', err);
      // Resume recording on error
      if (mediaStreamRef.current) {
        startRecording(mediaStreamRef.current);
      }
    }
  };

  /**
   * Play audio from base64
   */
  const playAudio = async (audioBase64: string): Promise<void> => {
    if (!audioContextRef.current) return;

    try {
      const audioBytes = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));
      const audioBuffer = await audioContextRef.current.decodeAudioData(audioBytes.buffer);
      
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      
      return new Promise((resolve) => {
        source.onended = () => resolve();
        source.start();
      });
    } catch (err) {
      console.error('[VOICE-INTERVIEW] Audio playback error:', err);
    }
  };

  /**
   * End the interview
   */
  const endInterview = async () => {
    if (!sessionId) return;

    console.log('[VOICE-INTERVIEW] Ending interview...');
    setIsRecording(false);
    setIsAISpeaking(false);

    try {
      // Calculate interview duration
      const durationSeconds = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;

      // End session
      const formData = new FormData();
      formData.append('action', 'end');
      formData.append('sessionId', sessionId);

      const response = await fetch('/api/voice-session', {
        method: 'POST',
        body: formData,
      });

      const { fullTranscript } = await response.json();
      console.log('[VOICE-INTERVIEW] Interview ended, transcript length:', fullTranscript.length);
      console.log('[VOICE-INTERVIEW] Duration:', durationSeconds, 'seconds');

      // Pass transcript and duration to parent
      onComplete(fullTranscript, durationSeconds);
      
    } catch (err) {
      console.error('[VOICE-INTERVIEW] End error:', err);
      setError('Failed to end interview');
    } finally {
      cleanupResources();
    }
  };

  /**
   * Cleanup resources
   */
  const cleanupResources = () => {
    console.log('[VOICE-INTERVIEW] Cleaning up resources...');
    
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    setIsActive(false);
    setIsRecording(false);
    setIsAISpeaking(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupResources();
    };
  }, []);

  return (
    <div className="space-y-3">
      {/* Main Controls */}
      {!isActive ? (
        <div className="flex items-center justify-between">
          <button
            onClick={startInterview}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
            Start AI Interview
          </button>
          <p className="text-xs text-gray-400">
            Talk with the AI interviewer while you code. Explain your approach naturally.
          </p>
        </div>
      ) : (
        <>
          {/* Status Bar */}
          <div className="flex items-center justify-between">
            {/* Status Indicator */}
            <div className="flex items-center gap-3">
              {isAISpeaking ? (
                <>
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                  </span>
                  <span className="text-blue-400 font-semibold">AI is speaking...</span>
                </>
              ) : isRecording ? (
                <>
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <span className="text-emerald-400 font-semibold">Listening...</span>
                </>
              ) : (
                <>
                  <span className="h-3 w-3 rounded-full bg-gray-500"></span>
                  <span className="text-gray-400 font-semibold">Paused</span>
                </>
              )}
              
              {/* Latest Message Preview */}
              {transcript.length > 0 && (
                <div className="ml-4 text-xs text-gray-400 max-w-md truncate">
                  <span className="font-bold">
                    {transcript[transcript.length - 1].role === 'user' ? 'You: ' : 'AI: '}
                  </span>
                  {transcript[transcript.length - 1].content}
                </div>
              )}
            </div>
            
            {/* Controls */}
            <button
              onClick={endInterview}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-all"
            >
              End Interview
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs">
              {error}
            </div>
          )}
        </>
      )}
    </div>
  );
}

