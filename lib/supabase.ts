// lib/supabase.ts

import { createClient } from '@supabase/supabase-js';

// Validate environment variables are present
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Check your .env.local file.'
  );
}

/**
 * Supabase client for database operations
 * Uses the anon key which is safe for client-side use
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Fetches all coding problems from database
 * Sorted by difficulty (Easy -> Medium -> Hard)
 */
export async function getProblems() {
  const { data, error } = await supabase
    .from('problems')
    .select('*')
    .order('difficulty', { ascending: true });

  if (error) {
    console.error('Error fetching problems:', error);
    throw error;
  }

  return data;
}

/**
 * Saves a new interview session to database
 * @param sessionData - Initial session data (problem, language, code, duration)
 * @returns The created session object with generated ID
 */
export async function createSession(sessionData: {
  problem_id: number;
  language: string;
  code: string;
  duration_seconds: number;
}) {
  const { data, error } = await supabase
    .from('sessions')
    .insert(sessionData)
    .select()
    .single();

  if (error) {
    console.error('Error creating session:', error);
    throw error;
  }

  return data;
}

/**
 * Updates an existing session with transcript and feedback
 * Called after AI processing is complete
 */
export async function updateSession(
  sessionId: string,
  updates: {
    transcript?: string;
    feedback?: string;
    score?: number;
  }
) {
  const { data, error } = await supabase
    .from('sessions')
    .update(updates)
    .eq('id', sessionId)
    .select()
    .single();

  if (error) {
    console.error('Error updating session:', error);
    throw error;
  }

  return data;
}

/**
 * Fetches a single session by ID with related problem data
 * Used for displaying session results page
 */
export async function getSession(sessionId: string) {
  const { data, error } = await supabase
    .from('sessions')
    .select(`
      *,
      problems (*)
    `)
    .eq('id', sessionId)
    .single();

  if (error) {
    console.error('Error fetching session:', error);
    throw error;
  }

  return data;
}

