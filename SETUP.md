# Setup Guide - Step by Step

Follow these steps to get your AI Interview Practice Platform running this weekend!

## Step 1: Set Up Supabase (15 minutes)

### 1.1 Create Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub (fastest)

### 1.2 Create New Project
1. Click "New Project"
2. Choose an organization (or create one)
3. Fill in:
   - **Name**: interview-prep
   - **Database Password**: Generate a strong password (save it somewhere!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free (perfect for MVP)
4. Click "Create new project" (takes 2-3 minutes)

### 1.3 Set Up Database
1. Click "SQL Editor" in the left sidebar
2. Click "New query"
3. Copy the entire contents of `supabase-schema.sql`
4. Paste into the editor
5. Click "Run" (bottom right)
6. You should see "Success. No rows returned" ✅

### 1.4 Get API Keys
1. Click "Project Settings" (gear icon in bottom left)
2. Click "API" in the left menu
3. Copy these values (you'll need them next):
   - **URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (long string)

## Step 2: Get API Keys (10 minutes)

### 2.1 OpenAI API Key
1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Click your profile → "View API keys"
4. Click "Create new secret key"
5. Name it "interview-prep"
6. Copy the key (starts with `sk-...`)
7. **Important**: Add $5-10 credit at [platform.openai.com/account/billing](https://platform.openai.com/account/billing)

### 2.2 Anthropic API Key
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in
3. Click "API Keys" in the left sidebar
4. Click "Create Key"
5. Name it "interview-prep"
6. Copy the key (starts with `sk-ant-...`)
7. **Important**: Add $5-10 credit in account settings

## Step 3: Configure Environment Variables (2 minutes)

1. Create a file called `.env.local` in the project root (same folder as package.json)
2. Add this content (replace with YOUR keys):

```bash
# Supabase Configuration (from Step 1.4)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your_long_key_here

# OpenAI Configuration (from Step 2.1)
OPENAI_API_KEY=sk-...your_key_here

# Anthropic Configuration (from Step 2.2)
ANTHROPIC_API_KEY=sk-ant-...your_key_here
```

3. Save the file
4. **NEVER commit this file to Git** (it's already in .gitignore)

## Step 4: Run the App (2 minutes)

```bash
# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

You should see the interview practice page! 🎉

## Step 5: Test It Out (5 minutes)

1. Select "Two Sum" from the dropdown
2. Choose Python or JavaScript
3. Write some code in the editor
4. Click "🎤 Start Recording"
5. Allow microphone access when prompted
6. Talk through your solution out loud (like a real interview!)
7. Click "Stop Recording"
8. Wait 30-60 seconds for AI processing
9. View your feedback!

## Troubleshooting

### "Failed to load problems"
- Check your Supabase URL and anon key in `.env.local`
- Make sure you ran the SQL schema
- Check browser console (F12) for errors

### "Could not access microphone"
- Click the 🔒 icon in browser address bar
- Allow microphone access
- Refresh the page and try again

### "Transcription failed" or "Feedback generation failed"
- Check your OpenAI and Anthropic API keys
- Make sure you've added billing credit to both accounts
- Check that keys don't have extra spaces or quotes

### Dependencies won't install
- Delete `node_modules` folder
- Delete `package-lock.json`
- Run `npm install` again

### TypeScript errors
- Run `npm run build` to see all errors
- Most should be fixed automatically
- Reach out if you see persistent errors

## What's Next?

Once everything works:

1. **Add more problems**: Insert more rows in Supabase `problems` table
2. **Test with friends**: Share your localhost URL (they need to be on same network)
3. **Deploy to Vercel**: Follow deployment guide in README.md
4. **Collect feedback**: See what users find helpful vs. confusing
5. **Iterate**: Based on feedback, decide what features to add in v2

## Cost Tracking

Keep an eye on your usage:
- **OpenAI**: [platform.openai.com/usage](https://platform.openai.com/usage)
- **Anthropic**: [console.anthropic.com](https://console.anthropic.com) → Usage
- **Supabase**: Free tier includes 500MB database, 1GB file storage

For 10 test users doing 5 sessions each:
- ~50 sessions × $2 = **~$100 total**

This is totally reasonable for MVP validation!

## Need Help?

If you get stuck:
1. Check browser console (F12) for errors
2. Check terminal for server errors
3. Read the error messages carefully
4. Google the specific error
5. Check Supabase logs (Dashboard → Logs)

Good luck! You've got this! 🚀

