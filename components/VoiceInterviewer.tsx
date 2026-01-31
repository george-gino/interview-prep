'use client';

import { useState, useRef, useEffect } from 'react';

interface VoiceInterviewerProps {
  problemId: number;
  onComplete: (transcript: string) => void;
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

      // Pass transcript to parent
      onComplete(fullTranscript);
      
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
    <div className="space-y-6">
      {/* Status and Controls */}
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
        {!isActive ? (
          <div className="text-center">
            <button
              onClick={startInterview}
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-lg font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg"
            >
              <span className="flex items-center gap-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
                Start AI Interview
              </span>
            </button>
            <p className="text-sm text-gray-400 mt-4">
              Have a natural conversation with our AI interviewer
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Status Indicator */}
            <div className="flex items-center justify-between">
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
              </div>
              <button
                onClick={endInterview}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-all"
              >
                End Interview
              </button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Transcript Display */}
      {transcript.length > 0 && (
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 max-h-96 overflow-y-auto">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
            Conversation
          </h3>
          <div className="space-y-3">
            {transcript.slice(-10).map((message, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-emerald-500/10 border border-emerald-500/30'
                    : 'bg-blue-500/10 border border-blue-500/30'
                }`}
              >
                <div className={`text-xs font-bold mb-1 ${
                  message.role === 'user' ? 'text-emerald-400' : 'text-blue-400'
                }`}>
                  {message.role === 'user' ? 'You' : 'AI Interviewer'}
                </div>
                <div className="text-gray-300 text-sm">{message.content}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

