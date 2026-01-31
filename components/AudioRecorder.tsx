'use client';

import { useRef } from 'react';
import { AudioRecorderProps } from '@/lib/types';

/**
 * Audio recording component with start/stop functionality
 * Uses browser MediaRecorder API to capture microphone input
 * Then sends to OpenAI Whisper for transcription
 */
export default function AudioRecorder({
  onRecordingComplete,
  isRecording,
  onToggleRecording,
}: AudioRecorderProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  /**
   * Starts audio recording using user's microphone
   * Requests permission if not already granted
   */
  const startRecording = async () => {
    try {
      console.log('[AUDIO] Requesting microphone access...');
      
      // Request microphone access from browser
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      console.log('[AUDIO] Microphone access granted');
      
      // Create MediaRecorder to capture audio
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      // Collect audio data chunks as recording happens
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
          console.log('[AUDIO] Audio chunk received:', event.data.size, 'bytes');
        }
      };

      // When recording stops, create final audio blob
      mediaRecorder.onstop = () => {
        console.log('[AUDIO] Recording stopped, creating audio file...');
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        console.log('[AUDIO] Audio file created:', audioBlob.size, 'bytes');
        onRecordingComplete(audioBlob);
        
        // Stop all audio tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
        console.log('[AUDIO] Microphone released');
      };

      // Start capturing audio
      mediaRecorder.start();
      onToggleRecording();
      console.log('[AUDIO] Recording started! Speak now...');
      
    } catch (error) {
      console.error('[ERROR] Error accessing microphone:', error);
      alert('Could not access microphone. Please check your browser permissions.');
    }
  };

  /**
   * Stops the current recording
   * Triggers onstop event which creates the audio blob
   */
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      console.log('[AUDIO] Stopping recording...');
      mediaRecorderRef.current.stop();
      onToggleRecording();
    }
  };

  return (
    <div className="flex items-center gap-3">
      {!isRecording ? (
        <button
          onClick={startRecording}
          className="group px-8 py-3 rounded-lg font-bold text-white shadow-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 hover:scale-105 hover:shadow-xl transform transition-all flex items-center gap-3"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
          </svg>
          Start Recording
        </button>
      ) : (
        <button
          onClick={stopRecording}
          className="px-8 py-3 rounded-lg font-bold text-white shadow-lg bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 hover:scale-105 hover:shadow-xl transform transition-all flex items-center gap-3"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </span>
          Stop Recording
        </button>
      )}
    </div>
  );
}
