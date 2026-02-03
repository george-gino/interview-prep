import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { generateFeedbackPrompt } from '@/lib/prompts';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * API route to generate interview feedback using OpenAI
 * Accepts problem description, code, and transcript
 * Returns structured feedback and score
 */
export async function POST(request: NextRequest) {
  try {
    const { problemDescription, code, transcript } = await request.json();

    // Validate required fields
    if (!problemDescription || !code || !transcript) {
      return NextResponse.json(
        { error: 'Missing required fields: problemDescription, code, or transcript' },
        { status: 400 }
      );
    }

    console.log('Generating feedback for interview session');

    // Call OpenAI API to get structured feedback
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert technical interviewer. Provide feedback in JSON format with the following structure:
{
  "overallScore": <number 1-10>,
  "categories": [
    {
      "name": "Problem Understanding",
      "score": <number 1-10>,
      "feedback": "<detailed feedback>"
    },
    {
      "name": "Code Quality",
      "score": <number 1-10>,
      "feedback": "<detailed feedback>"
    },
    {
      "name": "Communication",
      "score": <number 1-10>,
      "feedback": "<detailed feedback>"
    },
    {
      "name": "Algorithm & Logic",
      "score": <number 1-10>,
      "feedback": "<detailed feedback>"
    },
    {
      "name": "Time & Space Complexity",
      "score": <number 1-10>,
      "feedback": "<detailed feedback>"
    }
  ]
}

CRITICAL: If the transcript contains both "User:" and "AI:" messages, ONLY evaluate the candidate's responses (lines starting with "User:"). IGNORE all AI interviewer messages (lines starting with "AI:"). The AI interviewer's questions/hints should NOT affect the candidate's score.

Keep feedback concise (2-3 sentences per category). Be constructive and specific.`,
        },
        {
          role: 'user',
          content: `Problem: ${problemDescription}

Code Solution:
${code}

Interview Transcript:
${transcript}

Remember: Only evaluate what the candidate (User:) said, not the AI interviewer's messages. Focus on the candidate's code and their verbal explanations.

Provide structured feedback in JSON format.`,
        },
      ],
      max_tokens: 2000,
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    // Parse the JSON response
    const feedbackData = JSON.parse(completion.choices[0]?.message?.content || '{}');

    console.log('Structured feedback generated successfully');

    return NextResponse.json({
      feedback: JSON.stringify(feedbackData),
      score: feedbackData.overallScore,
    });
    
  } catch (error) {
    console.error('Feedback generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate feedback' },
      { status: 500 }
    );
  }
}

