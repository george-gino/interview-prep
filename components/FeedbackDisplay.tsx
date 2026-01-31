'use client';

/**
 * Displays AI-generated feedback in a readable format
 * Shows overall score and detailed feedback text
 */
export default function FeedbackDisplay({
  feedback,
  score,
}: {
  feedback: string;
  score?: number;
}) {
  // Determine score color
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'from-emerald-500 to-teal-600';
    if (score >= 6) return 'from-blue-500 to-indigo-600';
    if (score >= 4) return 'from-amber-500 to-orange-600';
    return 'from-red-500 to-rose-600';
  };

  return (
    <div className="space-y-8">
      {/* Overall Score Display */}
      {score && (
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br ${getScoreColor(score)} text-white text-4xl font-bold shadow-xl`}>
            {score}/10
          </div>
          <p className="mt-3 text-lg font-semibold text-gray-700">Overall Performance</p>
        </div>
      )}

      {/* Detailed Feedback */}
      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Detailed Feedback
        </h3>
        <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {feedback}
        </div>
      </div>
    </div>
  );
}

