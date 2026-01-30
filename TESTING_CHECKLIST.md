# Testing Checklist

Use this checklist before you say "MVP is complete"!

## 🔧 Initial Setup Tests

- [ ] `npm install` completes without errors
- [ ] `.env.local` file created with all 4 API keys
- [ ] Supabase SQL schema runs successfully
- [ ] At least 5 problems exist in Supabase `problems` table
- [ ] `npm run dev` starts successfully on port 3000

## 🎯 Core Functionality Tests

### Problem Selection
- [ ] Can see list of problems when page loads
- [ ] Problem dropdown shows all problems with difficulty
- [ ] Can select a problem
- [ ] Problem description displays correctly
- [ ] Difficulty badge shows correct color (Easy=green, Medium=yellow, Hard=red)

### Code Editor
- [ ] Monaco editor loads and displays
- [ ] Can type code in the editor
- [ ] Syntax highlighting works
- [ ] Can switch between Python and JavaScript
- [ ] Starter code updates when switching languages
- [ ] Starter code updates when selecting different problem
- [ ] Can scroll in editor
- [ ] Line numbers are visible

### Audio Recording
- [ ] "Start Recording" button is visible when problem is selected
- [ ] Browser asks for microphone permission on first click
- [ ] Button changes to "Stop Recording" with red color
- [ ] Timer shows elapsed seconds while recording
- [ ] Can see pulsing animation on recording button
- [ ] Can stop recording successfully
- [ ] Microphone light turns off after stopping

### AI Processing
- [ ] "Processing..." overlay appears after stopping recording
- [ ] Spinner animation shows
- [ ] Processing message explains what's happening
- [ ] No errors in browser console during processing
- [ ] Processing takes 30-90 seconds (reasonable time)

### Feedback Display
- [ ] Automatically redirects to session results page
- [ ] Overall score displays (X/10)
- [ ] Detailed feedback text shows all sections
- [ ] Code is displayed (read-only) in Monaco editor
- [ ] Transcript is collapsible and shows spoken text
- [ ] "Back to Practice" link works
- [ ] "Practice Another Problem" button works

## 🔍 Browser Console Checks

During a full session, check console (F12) for:

- [ ] No red errors
- [ ] "Session created: [uuid]" message appears
- [ ] "Transcription complete" message appears
- [ ] "Feedback generated" message appears
- [ ] API responses are successful (200 status)

## 🌐 Network Checks

Open Network tab (F12 → Network) and verify:

- [ ] GET `/api/problems` returns problems (or Supabase query succeeds)
- [ ] POST `/api/transcribe` returns transcript
- [ ] POST `/api/feedback` returns feedback and score
- [ ] No 500 errors from API routes
- [ ] No CORS errors

## 📊 Database Checks

In Supabase Dashboard → Table Editor:

- [ ] `problems` table has sample data
- [ ] New row appears in `sessions` table after completing interview
- [ ] Session has correct `problem_id`, `language`, `code`
- [ ] Session has `transcript` after processing
- [ ] Session has `feedback` and `score` after processing
- [ ] `created_at` timestamp is correct

## 🎤 Audio Quality Checks

- [ ] Recording captures voice clearly (test on session page)
- [ ] Transcript is accurate (>80% correct)
- [ ] Background noise doesn't completely ruin transcript
- [ ] Whisper handles pauses and "umms" reasonably

## 🤖 AI Quality Checks

Review feedback to ensure:

- [ ] Communication score (X/10) is present
- [ ] Problem-solving score (X/10) is present
- [ ] Code quality score (X/10) is present
- [ ] Overall score is calculated correctly
- [ ] Feedback includes specific observations
- [ ] Feedback mentions what you actually said
- [ ] Strengths section has 2-3 points
- [ ] Improvements section has 2-3 points with advice
- [ ] Next steps section has actionable suggestions
- [ ] Tone is constructive and encouraging

## 🔄 Multiple Sessions Test

- [ ] Can complete multiple sessions in a row
- [ ] Each session gets unique ID
- [ ] Can switch problems between sessions
- [ ] Can switch languages between sessions
- [ ] Previous session code doesn't leak into new session

## 📱 Browser Compatibility

Test in at least 2 browsers:

### Chrome
- [ ] All features work
- [ ] Audio recording works
- [ ] Monaco editor loads

### Firefox
- [ ] All features work
- [ ] Audio recording works
- [ ] Monaco editor loads

### Safari (Mac only)
- [ ] All features work
- [ ] Audio recording works
- [ ] Monaco editor loads

## 🐛 Error Handling Tests

### Intentional Errors
Test that app handles errors gracefully:

- [ ] What happens if you try to record without selecting problem? (Should prevent)
- [ ] What happens if mic permission is denied? (Shows alert)
- [ ] What happens if API key is wrong? (Shows error message)
- [ ] What happens if Supabase is unreachable? (Shows error message)
- [ ] What happens if you refresh during processing? (May lose data - acceptable for MVP)

## 🚀 Production Readiness (Vercel)

After deploying to Vercel:

- [ ] Production URL loads successfully
- [ ] HTTPS is enabled (🔒 in address bar)
- [ ] Audio recording works on production (requires HTTPS)
- [ ] All environment variables are set correctly
- [ ] Can complete full flow on production
- [ ] No CORS errors on production
- [ ] Function logs show successful API calls

## 💰 Cost Monitoring

After 5 test sessions:

- [ ] Check OpenAI usage at platform.openai.com/usage
- [ ] Check Anthropic usage at console.anthropic.com
- [ ] Verify costs are ~$2-3 per session (expected)
- [ ] Set usage alerts if available

## 📈 Success Metrics (Optional)

If you want to validate the MVP with real users:

- [ ] 10 people complete at least one session
- [ ] 70%+ complete full session (don't quit halfway)
- [ ] 7+ out of 10 say feedback is helpful
- [ ] Collect qualitative feedback on what's missing
- [ ] Identify #1 complaint to fix in v2

## 🎉 MVP Complete!

When all core functionality tests pass, you can say:

**✅ MVP IS COMPLETE AND READY FOR TESTING!**

Now:
1. Share with friends
2. Post on Twitter/LinkedIn
3. Collect feedback
4. Iterate!

---

## Common Issues & Fixes

### "Problems won't load"
→ Check Supabase URL, run SQL schema, check RLS policies

### "Recording starts but processing fails"
→ Check OpenAI API key has billing enabled

### "Feedback is generic/bad"
→ Check Anthropic API key, try speaking more during session

### "Processing takes forever (>2 minutes)"
→ Check API rate limits, try smaller audio file, check network

### "Editor is blank"
→ Check Monaco editor loaded, check starter_code format in database

---

Good luck! 🚀

