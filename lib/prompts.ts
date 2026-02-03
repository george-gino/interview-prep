// lib/prompts.ts

/**
 * Generates the prompt for Claude to analyze an interview session
 * This prompt structure ensures consistent, actionable feedback
 */
export function generateFeedbackPrompt(
  problemDescription: string,
  code: string,
  transcript: string
): string {
  return `You are an expert technical interviewer evaluating a coding interview practice session.

PROBLEM:
${problemDescription}

CANDIDATE'S CODE:
\`\`\`
${code}
\`\`\`

INTERVIEW TRANSCRIPT:
${transcript}

IMPORTANT INSTRUCTIONS:
- The transcript contains both "User:" (the candidate) and "AI:" (the interviewer) messages
- ONLY evaluate the candidate's responses (lines starting with "User:")
- IGNORE all AI interviewer messages (lines starting with "AI:")
- Focus your feedback ENTIRELY on what the candidate said and their code
- The candidate's verbal explanation and code are what matter for scoring

Please provide detailed, constructive feedback in this EXACT format:

## Communication (Score: X/10)
- Did they explain their thought process clearly?
- Did they ask clarifying questions about requirements?
- Did they verbalize their approach before coding?
- Specific observations about their communication

## Problem-Solving (Score: X/10)
- Did they break down the problem systematically?
- Did they consider edge cases?
- Did they discuss time/space complexity trade-offs?
- Specific observations about their approach

## Code Quality (Score: X/10)
- Is the solution correct and handles edge cases?
- Is the code clean, readable, and well-structured?
- Did they test or walk through their solution?
- Specific observations about their code

## Overall Score: X/10

## Key Strengths:
- [Specific strength 1]
- [Specific strength 2]
- [Specific strength 3]

## Areas for Improvement:
- [Specific improvement 1 with actionable advice]
- [Specific improvement 2 with actionable advice]
- [Specific improvement 3 with actionable advice]

## Next Steps:
- [Actionable suggestion 1]
- [Actionable suggestion 2]

Be specific, constructive, and encouraging. Focus on both technical accuracy and interview communication skills.`;
}

