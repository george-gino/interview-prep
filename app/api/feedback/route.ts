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

    // Generate prompt for OpenAI
    const prompt = generateFeedbackPrompt(problemDescription, code, transcript);

    // Call OpenAI API (using GPT-4 for best quality, or use 'gpt-3.5-turbo' for cheaper)
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // or 'gpt-3.5-turbo' for lower cost
      messages: [
        {
          role: 'system',
          content: 'You are an expert technical interviewer providing constructive feedback on coding interviews.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    // Extract feedback text from response
    const feedback = completion.choices[0]?.message?.content || '';

    // Extract overall score from feedback using regex
    const scoreMatch = feedback.match(/Overall Score:\s*(\d+)\/10/i);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : undefined;

    console.log('Feedback generated successfully, score:', score);

    return NextResponse.json({
      feedback,
      score,
    });
    
  } catch (error) {
    console.error('Feedback generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate feedback' },
      { status: 500 }
    );
  }
}

