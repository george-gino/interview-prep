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
      console.log('🎤 Requesting microphone access...');
      
      // Request microphone access from browser
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      console.log('✅ Microphone access granted');
      
      // Create MediaRecorder to capture audio
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      // Collect audio data chunks as recording happens
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
          console.log('📊 Audio chunk received:', event.data.size, 'bytes');
        }
      };

      // When recording stops, create final audio blob
      mediaRecorder.onstop = () => {
        console.log('🛑 Recording stopped, creating audio file...');
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        console.log('📦 Audio file created:', audioBlob.size, 'bytes');
        onRecordingComplete(audioBlob);
        
        // Stop all audio tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
        console.log('🔌 Microphone released');
      };

      // Start capturing audio
      mediaRecorder.start();
      onToggleRecording();
      console.log('🎙️ Recording started! Speak now...');
      
    } catch (error) {
      console.error('❌ Error accessing microphone:', error);
      alert('Could not access microphone. Please check your browser permissions.');
    }
  };

  /**
   * Stops the current recording
   * Triggers onstop event which creates the audio blob
   */
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      console.log('⏹️ Stopping recording...');
      mediaRecorderRef.current.stop();
      onToggleRecording();
    }
  };

  return (
    <div className="flex items-center gap-3">
      {!isRecording ? (
        <button
          onClick={startRecording}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          🎤 Start Recording
        </button>
      ) : (
        <button
          onClick={stopRecording}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
        >
          <span className="w-3 h-3 bg-white rounded-full animate-pulse"></span>
          Stop Recording
        </button>
      )}
    </div>
  );
}
