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
  return (
    <div className="space-y-6">
      {/* Overall Score Display */}
      {score && (
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-100 text-blue-600 text-3xl font-bold">
            {score}/10
          </div>
          <p className="mt-2 text-gray-600">Overall Score</p>
        </div>
      )}

      {/* Detailed Feedback */}
      <div className="prose max-w-none">
        <div className="bg-white p-6 rounded-lg border border-gray-200 whitespace-pre-wrap">
          {feedback}
        </div>
      </div>
    </div>
  );
}

