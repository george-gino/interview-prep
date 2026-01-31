import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@deepgram/sdk';
import Groq from 'groq-sdk';
import { ElevenLabsClient } from 'elevenlabs';
import { supabase } from '@/lib/supabase';

// Initialize API clients
const deepgram = createClient(process.env.DEEPGRAM_API_KEY || '');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

// Debug: Check if ElevenLabs API key is loaded
console.log('[ELEVENLABS] API key exists:', !!process.env.ELEVENLABS_API_KEY);
console.log('[ELEVENLABS] API key prefix:', process.env.ELEVENLABS_API_KEY?.substring(0, 10));

const elevenlabs = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY || '' });

// In-memory session storage (use Redis in production)
const sessions = new Map<string, VoiceSession>();

interface VoiceSession {
  sessionId: string;
  problemId: number;
  problem: any;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  startTime: number;
  fullTranscript: string;
}

/**
 * Generate AI interviewer prompt
 */
function generateInterviewerPrompt(problem: any, history: Array<{ role: string; content: string }>) {
  const recentHistory = history.slice(-6).map(m => `${m.role}: ${m.content}`).join('\n');
  
  return `You are an expert technical interviewer conducting a live coding interview.

PROBLEM: ${problem.title}
${problem.description}

YOUR ROLE:
- Guide the candidate naturally with SHORT responses (1-2 sentences max)
- Ask clarifying questions
- Give subtle hints without solving
- Encourage thinking out loud
- Sound conversational, not robotic

RULES:
- Keep responses VERY SHORT (under 30 words)
- Use casual language: "hmm", "I see", "okay", "interesting"
- Never write code or solve the problem
- Guide with questions, not answers
- Be encouraging and supportive

Current conversation:
${recentHistory}

Respond naturally to continue the interview.`;
}

/**
 * POST /api/voice-session
 * Handles voice interview session actions
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const action = formData.get('action') as string;

    switch (action) {
      case 'start':
        return await handleStart(formData);
      case 'transcribe':
        return await handleTranscribe(formData);
      case 'respond':
        return await handleRespond(formData);
      case 'end':
        return await handleEnd(formData);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('[VOICE-SESSION] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * Start a new voice interview session
 */
async function handleStart(formData: FormData) {
  const problemId = parseInt(formData.get('problemId') as string);
  
  console.log('[VOICE-SESSION] Starting session for problem:', problemId);

  // Fetch problem from database
  const { data: problem, error } = await supabase
    .from('problems')
    .select('*')
    .eq('id', problemId)
    .single();

  if (error || !problem) {
    throw new Error('Problem not found');
  }

  // Create session
  const sessionId = `voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const greeting = `Hi! I'm your AI interviewer today. Let's work on ${problem.title} together. Take a moment to read the problem, and when you're ready, start explaining your approach out loud.`;

  const session: VoiceSession = {
    sessionId,
    problemId,
    problem,
    conversationHistory: [
      { role: 'assistant', content: greeting }
    ],
    startTime: Date.now(),
    fullTranscript: `AI: ${greeting}\n\n`,
  };

  sessions.set(sessionId, session);

  // Generate greeting audio
  console.log('[VOICE-SESSION] Generating greeting audio...');
  const audioStream = await elevenlabs.textToSpeech.convert('21m00Tcm4TlvDq8ikWAM', {
    text: greeting,
    model_id: 'eleven_turbo_v2',
  });

  // Convert stream to buffer
  const chunks: Uint8Array[] = [];
  for await (const chunk of audioStream) {
    chunks.push(chunk);
  }
  const audioBuffer = Buffer.concat(chunks);
  const audioBase64 = audioBuffer.toString('base64');

  console.log('[VOICE-SESSION] Session started:', sessionId);

  return NextResponse.json({
    sessionId,
    greetingText: greeting,
    greetingAudio: audioBase64,
  });
}

/**
 * Transcribe user audio chunk
 */
async function handleTranscribe(formData: FormData) {
  const sessionId = formData.get('sessionId') as string;
  const audioFile = formData.get('audio') as File;

  if (!sessionId || !audioFile) {
    throw new Error('Missing sessionId or audio');
  }

  const session = sessions.get(sessionId);
  if (!session) {
    throw new Error('Session not found');
  }

  console.log('[VOICE-SESSION] Transcribing audio, size:', audioFile.size);

  // Convert File to Buffer
  const arrayBuffer = await audioFile.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Transcribe with Deepgram
  const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
    buffer,
    {
      model: 'nova-2',
      smart_format: true,
      language: 'en-US',
    }
  );

  if (error) {
    console.error('[VOICE-SESSION] Deepgram error:', error);
    throw new Error('Transcription failed');
  }

  const transcript = result.results?.channels[0]?.alternatives[0]?.transcript || '';
  console.log('[VOICE-SESSION] Transcript:', transcript);

  // Add to session history if not empty
  if (transcript.trim()) {
    session.conversationHistory.push({
      role: 'user',
      content: transcript,
    });
    session.fullTranscript += `User: ${transcript}\n\n`;
  }

  return NextResponse.json({ transcript });
}

/**
 * Generate AI response to user's transcript
 */
async function handleRespond(formData: FormData) {
  const sessionId = formData.get('sessionId') as string;
  const userTranscript = formData.get('transcript') as string;

  if (!sessionId) {
    throw new Error('Missing sessionId');
  }

  const session = sessions.get(sessionId);
  if (!session) {
    throw new Error('Session not found');
  }

  console.log('[VOICE-SESSION] Generating AI response...');

  // Generate AI response using Groq
  const systemPrompt = generateInterviewerPrompt(session.problem, session.conversationHistory);
  
  const completion = await groq.chat.completions.create({
    model: 'llama-3.1-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userTranscript },
    ],
    temperature: 0.8,
    max_tokens: 150,
  });

  const aiResponse = completion.choices[0]?.message?.content || "Could you elaborate on that?";
  console.log('[VOICE-SESSION] AI response:', aiResponse);

  // Add to conversation history
  session.conversationHistory.push({
    role: 'assistant',
    content: aiResponse,
  });
  session.fullTranscript += `AI: ${aiResponse}\n\n`;

  // Generate audio for response
  console.log('[VOICE-SESSION] Generating response audio...');
  const audioStream = await elevenlabs.textToSpeech.convert('21m00Tcm4TlvDq8ikWAM', {
    text: aiResponse,
    model_id: 'eleven_turbo_v2',
  });

  // Convert stream to buffer
  const chunks: Uint8Array[] = [];
  for await (const chunk of audioStream) {
    chunks.push(chunk);
  }
  const audioBuffer = Buffer.concat(chunks);
  const audioBase64 = audioBuffer.toString('base64');

  return NextResponse.json({
    responseText: aiResponse,
    responseAudio: audioBase64,
  });
}

/**
 * End interview session
 */
async function handleEnd(formData: FormData) {
  const sessionId = formData.get('sessionId') as string;

  if (!sessionId) {
    throw new Error('Missing sessionId');
  }

  const session = sessions.get(sessionId);
  if (!session) {
    throw new Error('Session not found');
  }

  console.log('[VOICE-SESSION] Ending session:', sessionId);

  const duration = Math.floor((Date.now() - session.startTime) / 1000);

  // Clean up session
  sessions.delete(sessionId);

  return NextResponse.json({
    fullTranscript: session.fullTranscript,
    duration,
    conversationHistory: session.conversationHistory,
  });
}

