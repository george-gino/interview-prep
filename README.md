# AI Interview Practice Platform - MVP

A platform to practice coding interviews by recording your audio, analyzing your communication, and providing AI-powered feedback.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy the example environment file and add your API keys:

```bash
# Create .env.local file with these values:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here
```

**How to get API keys:**

- **Supabase**: Sign up at [supabase.com](https://supabase.com), create a project, and copy the URL and anon key from Project Settings → API
- **OpenAI**: Sign up at [platform.openai.com](https://platform.openai.com) and create an API key (used for GPT-4 feedback generation)

### 3. Set Up Supabase Database

Run the SQL from `supabase-schema.sql` in your Supabase SQL Editor to create the required tables.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
interview-prep/
├── app/
│   ├── page.tsx                    # Main interview interface
│   ├── session/[id]/page.tsx       # View completed session
│   ├── api/
│   │   ├── transcribe/route.ts     # Audio → text API
│   │   └── feedback/route.ts       # Generate AI feedback API
│   └── layout.tsx                  # Root layout
├── components/
│   ├── ProblemSelector.tsx         # Dropdown to pick problem
│   ├── CodeEditor.tsx              # Monaco editor wrapper
│   ├── AudioRecorder.tsx           # Record audio button
│   └── FeedbackDisplay.tsx         # Show AI feedback nicely
├── lib/
│   ├── supabase.ts                 # Supabase client setup
│   ├── types.ts                    # TypeScript interfaces
│   └── prompts.ts                  # AI prompt templates
└── package.json
```

## 🎯 Features (MVP)

- ✅ Select coding problem from dropdown
- ✅ Monaco code editor with language switching (Python/JavaScript)
- ✅ Audio recording with high-quality transcription (Deepgram)
- ✅ AI feedback generation (OpenAI GPT-4)
- ✅ View past sessions
- ✅ Professional-grade transcription

## 🧪 Testing Locally

1. Make sure your Supabase database has at least one problem in the `problems` table
2. Start the dev server: `npm run dev`
3. Select a problem
4. Write code and record your explanation
5. Stop recording to get feedback

**Note:** Audio recording requires HTTPS in production. Local dev (localhost) works fine.

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add all environment variables from your `.env.local` file
4. Click "Deploy"

Vercel automatically provides HTTPS, which is required for audio recording.

## 💰 Cost Estimates

Per interview session:
- Deepgram transcription: ~$0.0043/minute (~$0.05 for 10 min)
- OpenAI GPT-4 feedback: ~$0.05-0.10
- Supabase storage: ~$0.01
- **Total: ~$0.11-0.16 per session**

**Very affordable for high-quality transcription!**

## 🐛 Troubleshooting

### Audio Recording Not Working
- Check browser permissions (Chrome/Firefox work best)
- Must use HTTPS in production (localhost works for dev)
- Try incognito mode to reset permissions

### Supabase Connection Issues
- Verify URL doesn't have trailing slash
- Check you're using anon key, not service_role key
- Make sure you've run the SQL schema

### API Routes Failing
- Check all API keys are in .env.local
- Restart dev server after adding env variables
- Check browser console for error messages

## 📚 Next Steps (v2 Ideas)

- User authentication
- Payment/subscription system
- Real-time voice AI interviewer
- Video recording and analysis
- Code execution/testing
- Company-specific interview prep
- User dashboard with session history

## 📝 License

MIT

