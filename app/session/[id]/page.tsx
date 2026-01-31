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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Practice
          </Link>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Interview Results
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
              {session.problems.title}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
              session.problems.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700' :
              session.problems.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' :
              'bg-rose-100 text-rose-700'
            }`}>
              {session.problems.difficulty}
            </span>
            <span className="text-gray-600 text-sm">
              Language: <strong>{session.language}</strong>
            </span>
            <span className="text-gray-600 text-sm">
              Duration: <strong>{session.duration_seconds}s</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Feedback Section */}
        <div className="mb-8">
          <FeedbackDisplay
            feedback={session.feedback || 'No feedback available'}
            score={session.score}
          />
        </div>

        {/* Code Review */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Your Code
          </h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {session.language}
              </span>
            </div>
            <div className="h-[500px]">
              <CodeDisplay
                language={session.language}
                value={session.code}
              />
            </div>
          </div>
        </div>

        {/* Transcript (Collapsible) */}
        {session.transcript && (
          <details className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <summary className="px-6 py-4 cursor-pointer hover:bg-gray-50 transition flex items-center gap-2 font-bold text-gray-900">
              <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Interview Transcript
              <span className="ml-auto text-xs text-gray-500 font-normal">(click to expand)</span>
            </summary>
            <div className="px-6 py-6 border-t border-gray-200 bg-gray-50">
              <p className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">
                {session.transcript}
              </p>
            </div>
          </details>
        )}

        {/* Call to Action */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white shadow-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 hover:scale-105 hover:shadow-xl transform transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Practice Another Problem
          </Link>
        </div>
      </div>
    </div>
  );
}

