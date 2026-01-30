import { getSession } from '@/lib/supabase';
import CodeDisplay from '@/components/CodeDisplay';
import FeedbackDisplay from '@/components/FeedbackDisplay';
import Link from 'next/link';

/**
 * Page to view a completed interview session
 * Displays feedback, code, and transcript
 */
export default async function SessionPage({
  params,
}: {
  params: { id: string };
}) {
  // Fetch session data from database
  const session = await getSession(params.id);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 hover:underline"
          >
            ← Back to Practice
          </Link>
        </div>

        {/* Page Header */}
        <h1 className="text-3xl font-bold mb-2">Interview Results</h1>
        <p className="text-gray-600 mb-8">
          Problem: {session.problems.title} ({session.problems.difficulty}) • 
          Language: {session.language} • 
          Duration: {session.duration_seconds}s
        </p>

        {/* Feedback Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Your Feedback</h2>
          <FeedbackDisplay
            feedback={session.feedback || 'No feedback available'}
            score={session.score}
          />
        </div>

        {/* Code Review */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Your Code</h2>
          <div className="h-96">
            <CodeDisplay
              language={session.language}
              value={session.code}
            />
          </div>
        </div>

        {/* Transcript (Collapsible) */}
        {session.transcript && (
          <details className="mb-8">
            <summary className="text-xl font-semibold cursor-pointer mb-4 hover:text-blue-600">
              📝 Interview Transcript (click to expand)
            </summary>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <p className="whitespace-pre-wrap text-gray-700">
                {session.transcript}
              </p>
            </div>
          </details>
        )}

        {/* Call to Action */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Practice Another Problem
          </Link>
        </div>
      </div>
    </div>
  );
}

