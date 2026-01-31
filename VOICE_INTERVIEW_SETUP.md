# Voice Interview Feature Setup Guide

## Overview

The real-time voice interview feature allows users to have a natural conversation with an AI interviewer while solving coding problems. The AI asks questions, gives hints, and guides the candidate through the problem.

## How It Works

1. **User selects a problem** and chooses "Live Interview" mode
2. **AI greets the user** and invites them to start explaining their approach
3. **User speaks naturally** about their thought process and solution
4. **AI responds in real-time** with questions, hints, and encouragement
5. **Conversation continues** until user ends the interview
6. **Final feedback is generated** using the same Claude-based analysis as recorded mode

## Tech Stack

- **Deepgram API** - Speech-to-text transcription (real-time, high accuracy)
- **Groq API** - Fast LLM inference using Llama 3.1 70B (sub-second responses)
- **ElevenLabs API** - Natural text-to-speech (Rachel voice)

## Setup Instructions

### 1. Get API Keys

#### Deepgram (Speech-to-Text)
1. Go to https://deepgram.com
2. Sign up for a free account (includes $200 credit)
3. Navigate to Dashboard → API Keys
4. Create a new API key
5. Copy the key

#### Groq (LLM Inference)
1. Go to https://console.groq.com
2. Sign up for a free account
3. Navigate to API Keys
4. Create a new API key
5. Copy the key

#### ElevenLabs (Text-to-Speech)
1. Go to https://elevenlabs.io
2. Sign up for a free account (includes 10,000 characters/month)
3. Navigate to Profile → API Keys
4. Create a new API key
5. Copy the key

### 2. Add Environment Variables

Add these to your `.env.local` file:

```env
# Voice Interview APIs
DEEPGRAM_API_KEY=your_deepgram_api_key_here
GROQ_API_KEY=your_groq_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

### 3. Deploy to Vercel

Add the same environment variables in your Vercel project settings:

1. Go to your Vercel project
2. Settings → Environment Variables
3. Add each of the three API keys above
4. Redeploy your application

## Usage

### For Users

1. Navigate to any coding problem
2. Click the "Live Interview" mode toggle at the top
3. Click "Start AI Interview"
4. Allow microphone access when prompted
5. Listen to the AI's greeting
6. Start explaining your approach out loud
7. The AI will respond naturally with questions and hints
8. Continue the conversation until you're done
9. Click "End Interview" to get your final feedback

### Recording vs. Voice Mode

**Recorded Mode** (original)
- Record yourself explaining while coding
- Audio is transcribed after you finish
- Best for: Solo practice, working through solution first

**Live Interview Mode** (new)
- Real-time conversation with AI
- AI asks questions and gives hints
- Best for: Interactive practice, interview simulation

## Cost Estimates

### Free Tier Limits
- **Deepgram**: $200 credit (~400 hours of audio)
- **Groq**: Free (rate limited to ~14,400 requests/day)
- **ElevenLabs**: 10,000 characters/month (~20-30 interviews)

### Per Interview Cost (estimated)
- Deepgram: ~$0.02 (15 min interview)
- Groq: $0.00 (free tier)
- ElevenLabs: ~$0.04 (500 characters of AI speech)
- **Total: ~$0.06 per interview**

### Scaling Considerations
For production with high usage, consider:
- Deepgram: Pay-as-you-go at $0.0043/min
- Groq: Currently free, pricing TBA
- ElevenLabs: $5/month for 30,000 characters (100+ interviews)

## Technical Details

### Audio Flow
1. Browser captures microphone audio using MediaRecorder API
2. Audio chunks sent to API every 4 seconds
3. Deepgram transcribes audio to text
4. If speech detected, Groq generates AI response
5. ElevenLabs converts response to natural speech
6. Audio played in browser using Web Audio API

### Session Management
- Sessions stored in-memory Map (server-side)
- Each session tracks: problem, conversation history, transcript
- Sessions cleaned up on completion
- For production: use Redis for session storage

### AI Personality
The AI interviewer is designed to:
- Keep responses SHORT (1-2 sentences)
- Sound natural and conversational
- Guide without solving the problem
- Ask probing questions about edge cases, complexity
- Be encouraging and supportive

### Error Handling
- Microphone permission denied → Friendly error message
- API failures → Automatic retry with fallback
- No speech detected → Resume recording
- Session timeout → Redirect to problem selection

## Troubleshooting

### Microphone Not Working
- Check browser permissions (chrome://settings/content/microphone)
- Try a different browser (Chrome/Edge work best)
- Check if microphone is being used by another app

### AI Not Responding
- Check API keys are set correctly
- Check browser console for errors
- Verify Groq API rate limits not exceeded

### Audio Quality Issues
- Use a good microphone (headset recommended)
- Reduce background noise
- Speak clearly and at moderate pace

### No Audio Playback
- Check browser audio is not muted
- Try refreshing the page
- Check Web Audio API support (modern browsers only)

## Development Notes

### Files Created
- `app/api/voice-session/route.ts` - Main API endpoint
- `components/VoiceInterviewer.tsx` - Client component
- `app/problem/[id]/page.tsx` - Updated with mode toggle

### Key Dependencies
```json
{
  "@deepgram/sdk": "^3.x",
  "groq-sdk": "^0.x",
  "elevenlabs": "^1.x"
}
```

### Testing Checklist
- [ ] Microphone permission works
- [ ] AI greeting plays on start
- [ ] User speech is transcribed
- [ ] AI responds naturally
- [ ] Conversation flows smoothly
- [ ] End interview works
- [ ] Final feedback is generated
- [ ] Works in Chrome and Edge

## Future Enhancements

- Add speaker diarization (separate user/AI in transcript)
- Support multiple AI interviewer voices
- Add real-time code execution feedback
- Save conversation audio for playback
- Add interview analytics (speaking pace, pauses, etc.)
- WebSocket support for lower latency
- Multi-language support (Spanish, Chinese, etc.)

## Support

For issues or questions:
1. Check browser console for errors
2. Verify API keys are set correctly
3. Test with a simple problem first
4. Check API service status pages

---

**Ready to practice?** Head to the problems page and try the Live Interview mode!

