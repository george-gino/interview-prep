'use client';

import { useRef, useEffect } from 'react';
import { AudioRecorderProps } from '@/lib/types';

/**
 * Speech recognition component using Web Speech API (free!)
 * Captures spoken words in real-time without any API costs
 */
export default function AudioRecorder({
  onRecordingComplete,
  isRecording,
  onToggleRecording,
}: AudioRecorderProps) {
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>('');
  const interimTranscriptRef = useRef<string>(''); // Track interim results too

  useEffect(() => {
    // Check if browser supports Web Speech API
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true; // Keep listening until stopped
        recognitionRef.current.interimResults = true; // Get results as you speak
        recognitionRef.current.lang = 'en-US';

        // Handle speech recognition results
        recognitionRef.current.onresult = (event: any) => {
          console.log('🎯 onresult fired! Results:', event.results.length);
          
          let interimTranscript = '';
          let finalTranscript = '';

          // Process all speech results
          for (let i = 0; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            const isFinal = event.results[i].isFinal;
            const confidence = event.results[i][0].confidence;
            
            console.log(`  Result ${i}: "${transcript}" (final: ${isFinal}, confidence: ${confidence})`);
            
            if (isFinal) {
              finalTranscript += transcript + ' ';
              transcriptRef.current += transcript + ' ';
              console.log('✅ Final transcript added:', transcript);
            } else {
              interimTranscript += transcript;
              interimTranscriptRef.current = transcript;
              console.log('📝 Interim transcript:', transcript);
            }
          }
          
          console.log('📊 Total accumulated:', transcriptRef.current.length, 'chars');
          console.log('📊 Current interim:', interimTranscriptRef.current.length, 'chars');
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('❌ Speech recognition error:', event.error);
          console.error('   Error details:', event);
          if (event.error === 'no-speech') {
            console.log('⚠️ No speech detected, but continuing...');
          } else if (event.error === 'audio-capture') {
            console.error('❌ Audio capture failed - check microphone!');
          } else {
            console.error('❌ Error:', event.error);
          }
        };

        recognitionRef.current.onend = () => {
          // If recording is still active, restart recognition
          // (Chrome stops after ~60 seconds of silence)
          if (isRecording) {
            console.log('Restarting speech recognition...');
            try {
              recognitionRef.current?.start();
            } catch (error) {
              console.log('Recognition already started or ended');
            }
          }
        };
      }
    }

    return () => {
      // Cleanup on unmount
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isRecording]);

  /**
   * Starts speech recognition using Web Speech API
   * Free and built into modern browsers!
   */
  const startRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    try {
      transcriptRef.current = ''; // Reset transcript
      interimTranscriptRef.current = ''; // Reset interim too
      console.log('🎤 Starting speech recognition...');
      console.log('   Continuous:', recognitionRef.current.continuous);
      console.log('   Interim results:', recognitionRef.current.interimResults);
      console.log('   Language:', recognitionRef.current.lang);
      recognitionRef.current.start();
      onToggleRecording();
      console.log('✅ Speech recognition started successfully!');
      console.log('👄 SPEAK NOW! Say something out loud...');
    } catch (error) {
      console.error('❌ Error starting speech recognition:', error);
      alert('Could not start speech recognition. Please try again.');
    }
  };

  /**
   * Stops speech recognition and returns the transcript
   */
  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      onToggleRecording();
      
      // Wait a moment for any final results to come through
      setTimeout(() => {
        // Combine final transcript with any remaining interim transcript
        let fullTranscript = transcriptRef.current.trim();
        
        // If we have interim text and no final text, use the interim
        if (fullTranscript.length === 0 && interimTranscriptRef.current.length > 0) {
          fullTranscript = interimTranscriptRef.current.trim();
          console.log('⚠️ Using interim transcript (no final results)');
        }
        
        console.log('🛑 Recording stopped');
        console.log('📝 Final transcript:', fullTranscript.substring(0, 100) + '...');
        console.log('📊 Total length:', fullTranscript.length, 'characters');
        
        // Convert transcript to a blob (just for compatibility with existing code)
        const blob = new Blob([fullTranscript], { type: 'text/plain' });
        onRecordingComplete(blob);
      }, 500); // Wait 500ms for final results
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
      {!recognitionRef.current && typeof window !== 'undefined' && (
        <span className="text-sm text-orange-600">
          ⚠️ Speech recognition not supported. Use Chrome/Edge/Safari.
        </span>
      )}
    </div>
  );
}

