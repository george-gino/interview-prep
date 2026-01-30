import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@deepgram/sdk';

const deepgram = createClient(process.env.DEEPGRAM_API_KEY!);

/**
 * API route to transcribe audio using Deepgram
 * Accepts audio file via FormData and returns transcript text
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    console.log('🎤 Transcribing audio with Deepgram:', audioFile.name, audioFile.size, 'bytes');

    // Convert file to buffer
    const audioBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(audioBuffer);

    // Send audio to Deepgram for transcription
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      buffer,
      {
        model: 'nova-2',
        smart_format: true,
        punctuate: true,
        utterances: true,
      }
    );

    if (error) {
      console.error('❌ Deepgram error:', error);
      return NextResponse.json(
        { error: 'Transcription failed' },
        { status: 500 }
      );
    }

    // Extract transcript from Deepgram response
    const transcript = result.results.channels[0].alternatives[0].transcript;
    
    console.log('✅ Transcription complete:', transcript.length, 'characters');
    console.log('   Confidence:', result.results.channels[0].alternatives[0].confidence);

    return NextResponse.json({
      transcript,
    });
    
  } catch (error) {
    console.error('❌ Transcription error:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}

