# AI Interview Practice Platform

A comprehensive platform for practicing technical coding interviews with real-time AI feedback. Practice solo with recorded sessions or engage in live conversations with an AI interviewer.

## Overview

This application helps developers prepare for technical interviews by:
- Solving coding problems while explaining their thought process
- Recording audio explanations or having live AI conversations
- Receiving detailed feedback on code quality, communication, and problem-solving approach
- Tracking progress across multiple interview sessions

## Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Email + Google OAuth)
- **Code Editor**: Monaco Editor
- **AI Models**: 
  - OpenAI GPT-4 (feedback analysis)
  - Groq Llama 3.1 70B (real-time conversation)
- **Audio Services**:
  - Deepgram (speech-to-text)
  - ElevenLabs (text-to-speech)

## Features

### Core Functionality
- Select from curated coding problems (Easy, Medium, Hard)
- Multi-language code editor (Python, JavaScript, TypeScript, Java, C++, Go, Rust)
- Two interview modes:
  - **Recorded Mode**: Record yourself explaining as you code
  - **Live Interview Mode**: Real-time conversation with AI interviewer
- Structured feedback across 5 key dimensions:
  - Problem Understanding
  - Code Quality
  - Communication
  - Algorithm & Logic
  - Time & Space Complexity
- Session history and detailed feedback review

### Authentication
- Email/password authentication
- Google OAuth sign-in
- Protected routes for authenticated users

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Supabase account
- API keys (see Environment Variables section)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd interview-prep
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (see next section)

4. Set up Supabase database (see Database Setup section)

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI APIs
OPENAI_API_KEY=your_openai_api_key
DEEPGRAM_API_KEY=your_deepgram_api_key

# Voice Interview APIs
GROQ_API_KEY=your_groq_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
```

### How to Get API Keys

**Supabase**
- Sign up at [supabase.com](https://supabase.com)
- Create a new project
- Go to Project Settings → API
- Copy the Project URL and anon/public key

**OpenAI**
- Sign up at [platform.openai.com](https://platform.openai.com)
- Navigate to API Keys section
- Create a new API key

**Deepgram**
- Sign up at [deepgram.com](https://deepgram.com)
- Free tier includes $200 credit
- Create API key from Dashboard

**Groq**
- Sign up at [console.groq.com](https://console.groq.com)
- Currently free with rate limits
- Create API key from console

**ElevenLabs**
- Sign up at [elevenlabs.io](https://elevenlabs.io)
- Free tier includes 10,000 characters/month
- Get API key from Profile → API Keys

## Database Setup

### Create Tables

Run the following SQL in your Supabase SQL Editor:

```sql
-- Problems table
CREATE TABLE problems (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  starter_code_python TEXT,
  starter_code_javascript TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions table
CREATE TABLE sessions (
  id BIGSERIAL PRIMARY KEY,
  problem_id BIGINT REFERENCES problems(id),
  language TEXT NOT NULL,
  code TEXT NOT NULL,
  transcript TEXT,
  feedback JSONB,
  score INTEGER,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Set Up Row Level Security (RLS)

Enable public access for the MVP (adjust for production):

```sql
-- Enable RLS
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Allow public read access to problems
CREATE POLICY "Allow public read access" ON problems
  FOR SELECT USING (true);

-- Allow public insert to problems (for seeding)
CREATE POLICY "Allow public insert" ON problems
  FOR INSERT WITH CHECK (true);

-- Allow public access to sessions
CREATE POLICY "Allow public insert" ON sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update" ON sessions
  FOR UPDATE USING (true);

CREATE POLICY "Allow public select" ON sessions
  FOR SELECT USING (true);
```

### Seed Sample Problems

Insert a few sample problems to get started:

```sql
INSERT INTO problems (title, description, difficulty, starter_code_python, starter_code_javascript)
VALUES 
  (
    'Two Sum',
    'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    'Easy',
    'def two_sum(nums, target):\n    # Your code here\n    pass',
    'function twoSum(nums, target) {\n    // Your code here\n}'
  );
```

## Project Structure

```
interview-prep/
├── app/
│   ├── page.tsx                    # Root redirect
│   ├── landing/page.tsx            # Landing page
│   ├── problems/page.tsx           # Problem list
│   ├── problem/[id]/page.tsx       # Interview interface
│   ├── session/[id]/page.tsx       # Session results
│   ├── api/
│   │   ├── transcribe/route.ts     # Deepgram audio transcription
│   │   ├── feedback/route.ts       # OpenAI feedback generation
│   │   └── voice-session/route.ts  # Real-time voice interview
│   ├── layout.tsx                  # Root layout
│   └── globals.css                 # Global styles
├── components/
│   ├── AuthModal.tsx               # Login/signup modal
│   ├── CodeEditor.tsx              # Monaco editor wrapper
│   ├── CodeDisplay.tsx             # Read-only code display
│   ├── AudioRecorder.tsx           # Audio recording controls
│   ├── VoiceInterviewer.tsx        # Live AI interview component
│   ├── LanguageSelector.tsx        # Language dropdown
│   └── FeedbackDisplay.tsx         # Structured feedback cards
├── lib/
│   ├── supabase.ts                 # Supabase client
│   ├── auth.ts                     # Authentication helpers
│   ├── types.ts                    # TypeScript interfaces
│   └── prompts.ts                  # AI prompt templates
└── package.json
```

## Interview Modes

### Recorded Mode
Traditional interview practice where you:
1. Select a problem and programming language
2. Start recording your audio
3. Code while explaining your approach out loud
4. Stop recording when finished
5. Receive AI-generated feedback

### Live Interview Mode
Interactive conversation with AI interviewer:
1. Select a problem
2. Click "Live Interview"
3. AI greets you and asks you to explain your approach
4. Speak naturally about your solution
5. AI responds with questions, hints, and guidance
6. End interview when ready
7. Receive comprehensive feedback

## Cost Estimates

### Per Interview Session

**Recorded Mode:**
- Deepgram transcription: ~$0.02 (15 min)
- OpenAI GPT-4 feedback: ~$0.05
- Total: ~$0.07 per session

**Live Interview Mode:**
- Deepgram transcription: ~$0.02 (15 min)
- Groq inference: $0.00 (free tier)
- ElevenLabs TTS: ~$0.04 (500 characters)
- OpenAI GPT-4 feedback: ~$0.05
- Total: ~$0.11 per session

### Free Tier Limits
- Deepgram: $200 credit (~10,000 minutes)
- Groq: Free with rate limits
- ElevenLabs: 10,000 characters/month
- OpenAI: Pay-as-you-go

## Deployment

### Vercel Deployment

1. Push code to GitHub:
```bash
git push origin main
```

2. Import repository in Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

3. Add environment variables:
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.local`

4. Deploy:
   - Click "Deploy"
   - Vercel will automatically detect Next.js and configure build settings

### Production Considerations

- Configure authentication redirect URLs in Supabase
- Set up proper RLS policies for user-specific data
- Enable Vercel Analytics (optional)
- Configure custom domain (optional)

## Development

### Running Locally

```bash
npm run dev
```

### Building for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Troubleshooting

### Audio Recording Not Working
- Ensure HTTPS is enabled (Vercel provides this automatically)
- Check browser microphone permissions
- Use Chrome or Edge for best compatibility
- Try incognito mode if permissions are cached

### Supabase Connection Issues
- Verify environment variables are set correctly
- Check Supabase URL doesn't have trailing slash
- Ensure RLS policies are configured
- Verify API keys are for the correct project

### API Errors
- Check all API keys are valid and active
- Verify rate limits haven't been exceeded
- Check API service status pages
- Review browser console and terminal logs

### Voice Interview Issues
- Ensure all three voice APIs are configured (Deepgram, Groq, ElevenLabs)
- Check microphone permissions
- Verify audio playback is not muted
- Restart dev server after adding environment variables

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## Support

For issues or questions, please open an issue on GitHub.
