# Deployment Guide - Vercel

Deploy your AI Interview Practice Platform to production in under 10 minutes!

## Why Vercel?

- ✅ Free tier perfect for MVP
- ✅ Automatic HTTPS (required for audio recording)
- ✅ Global CDN for fast loading
- ✅ Easy GitHub integration
- ✅ Zero configuration for Next.js

## Step 1: Prepare Your Code (2 minutes)

### 1.1 Initialize Git (if not already done)
```bash
git init
git add .
git commit -m "Initial commit - AI Interview Practice MVP"
```

### 1.2 Create GitHub Repository
1. Go to [github.com](https://github.com)
2. Click "+" → "New repository"
3. Name it: `interview-prep`
4. Make it **Private** (your API keys are in .env.local, which is gitignored)
5. Don't add README or .gitignore (we already have them)
6. Click "Create repository"

### 1.3 Push to GitHub
```bash
# Copy the commands from GitHub's "...or push an existing repository" section
git remote add origin https://github.com/YOUR_USERNAME/interview-prep.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Vercel (5 minutes)

### 2.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up"
3. Choose "Continue with GitHub" (easiest)
4. Authorize Vercel to access your GitHub

### 2.2 Import Project
1. Click "Add New..." → "Project"
2. Find your `interview-prep` repository
3. Click "Import"

### 2.3 Configure Project
**Framework Preset**: Next.js (should be auto-detected) ✅

**Root Directory**: `./` (leave as is) ✅

**Build Settings**: Leave defaults ✅

### 2.4 Add Environment Variables
Click "Environment Variables" and add these **one by one**:

| Name | Value | Source |
|------|-------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` | From Supabase Dashboard |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` | From Supabase Dashboard |
| `OPENAI_API_KEY` | `sk-...` | From OpenAI Platform |
| `ANTHROPIC_API_KEY` | `sk-ant-...` | From Anthropic Console |

**Important**: 
- Copy exactly from your `.env.local` file
- No quotes around values
- Make sure there are no extra spaces

### 2.5 Deploy!
1. Click "Deploy"
2. Wait 2-3 minutes (watch the build logs)
3. See "Congratulations!" 🎉

## Step 3: Test Production (3 minutes)

### 3.1 Visit Your Site
Click the preview image or "Visit" button. Your URL will be:
```
https://interview-prep-xxxxx.vercel.app
```

### 3.2 Test Full Flow
1. Select a problem
2. Start recording (should ask for mic permission)
3. Code and talk
4. Stop recording
5. Wait for feedback
6. ✅ Success!

### 3.3 Common Issues

**"Failed to load problems"**
- Check environment variables in Vercel
- Dashboard → Settings → Environment Variables
- Make sure all 4 are present and correct

**"Network error" or API failures**
- Check Vercel Functions logs: Dashboard → Deployments → [Your deployment] → Functions
- Look for error messages
- Usually means API keys are wrong or missing

**Audio recording not working**
- This should work automatically in production (HTTPS)
- If not, check browser console for errors
- Try different browser (Chrome recommended)

## Step 4: Custom Domain (Optional)

### 4.1 Add Your Domain
1. Go to Vercel Dashboard → Settings → Domains
2. Add your domain (e.g., `interviewprep.yourdomain.com`)
3. Follow DNS instructions from your domain provider
4. Wait 5-10 minutes for DNS propagation
5. ✅ Your app is now on your domain!

## Automatic Deployments

Every time you push to GitHub:
```bash
git add .
git commit -m "Add new feature"
git push
```

Vercel automatically:
1. Detects the push
2. Builds your app
3. Deploys if build succeeds
4. Sends you an email
5. Updates your production URL

This is **incredibly powerful** for rapid iteration!

## Monitoring & Debugging

### View Logs
1. Go to Vercel Dashboard
2. Click your project
3. Click "Deployments"
4. Click on a deployment
5. See build logs and runtime logs

### Check Analytics
1. Go to project → Analytics
2. See page views, top pages, etc.
3. Free tier includes basic analytics

### View Function Logs
1. Go to project → Deployments → [Deployment]
2. Click "Functions" tab
3. See API route logs (transcribe, feedback)
4. Useful for debugging AI issues

## Cost Considerations

### Vercel Free Tier Limits
- 100GB bandwidth/month
- 100 hours serverless function execution/month
- **For MVP**: This is plenty! (support ~1000 sessions)

### What Costs Money
- ❌ Not Vercel (free tier is generous)
- ✅ OpenAI API (~$0.20/session)
- ✅ Anthropic API (~$1-2/session)
- ✅ Supabase (free up to 500MB database)

### Monitoring Costs
- **OpenAI**: [platform.openai.com/usage](https://platform.openai.com/usage)
- **Anthropic**: [console.anthropic.com](https://console.anthropic.com)
- **Vercel**: Dashboard → Usage (shows function hours)

## Scaling Up (Future)

When you're ready to handle more traffic:

1. **Vercel Pro** ($20/month):
   - More bandwidth
   - More function hours
   - Password protection
   - Better analytics

2. **Supabase Pro** ($25/month):
   - 8GB database
   - Daily backups
   - Better performance

3. **Optimize API calls**:
   - Cache common responses
   - Use streaming for long responses
   - Batch requests when possible

## Security Checklist

Before sharing publicly:

- ✅ Environment variables are in Vercel (not in code)
- ✅ `.env.local` is in `.gitignore`
- ✅ Supabase Row Level Security is enabled (already done in schema)
- ✅ API keys have spending limits set
- ⚠️ No authentication (add in v2 if needed)

## Sharing Your MVP

Now that you're deployed:

1. **Share the URL** with friends, on Twitter, in communities
2. **Ask for feedback**: "What would make this more helpful?"
3. **Watch the logs**: See what problems people try, where they get stuck
4. **Iterate fast**: Fix issues and push updates (auto-deploy)
5. **Collect emails** (optional): Add a simple form to gauge interest

## Rollback (If Something Breaks)

Vercel keeps all your deployments:

1. Go to Deployments
2. Find a working deployment
3. Click "..." → "Promote to Production"
4. Instant rollback! ✅

## Next Steps

- Add more interview problems to Supabase
- Share on Twitter/LinkedIn/Reddit
- Get feedback from 10-20 users
- Iterate based on feedback
- Consider adding auth, payments, video (v2)

Congrats on deploying your MVP! 🎉🚀

