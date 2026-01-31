'use client';

import { useState } from 'react';

interface FeedbackCategory {
  name: string;
  score: number;
  feedback: string;
}

interface FeedbackData {
  overallScore: number;
  categories: FeedbackCategory[];
}

/**
 * Displays AI-generated feedback in interactive category cards
 * Shows scores that expand to reveal detailed feedback when clicked
 */
export default function FeedbackDisplay({
  feedback,
  score,
}: {
  feedback: string;
  score?: number;
}) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  
  // Parse the feedback JSON
  let feedbackData: FeedbackData | null = null;
  try {
    feedbackData = JSON.parse(feedback);
  } catch {
    // Fallback for old format
    feedbackData = null;
  }

  // Determine score color
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'from-emerald-500 to-teal-600';
    if (score >= 6) return 'from-blue-500 to-indigo-600';
    if (score >= 4) return 'from-amber-500 to-orange-600';
    return 'from-red-500 to-rose-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 8) return 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20';
    if (score >= 6) return 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20';
    if (score >= 4) return 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20';
    return 'bg-rose-500/10 border-rose-500/30 hover:bg-rose-500/20';
  };

  const getScoreTextColor = (score: number) => {
    if (score >= 8) return 'text-emerald-400';
    if (score >= 6) return 'text-blue-400';
    if (score >= 4) return 'text-amber-400';
    return 'text-rose-400';
  };

  // If structured feedback available, show category cards
  if (feedbackData && feedbackData.categories) {
    return (
      <div className="space-y-6">
        {/* Overall Score */}
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br ${getScoreColor(feedbackData.overallScore)} text-white text-4xl font-bold shadow-xl`}>
            {feedbackData.overallScore}/10
          </div>
          <p className="mt-3 text-lg font-semibold text-white">Overall Performance</p>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {feedbackData.categories.map((category) => (
            <div key={category.name} className="space-y-2">
              {/* Score Card - Clickable */}
              <button
                onClick={() => setExpandedCategory(expandedCategory === category.name ? null : category.name)}
                className={`w-full p-6 rounded-xl border-2 transition-all ${getScoreBgColor(category.score)} ${
                  expandedCategory === category.name ? 'ring-2 ring-emerald-500 scale-105' : ''
                }`}
              >
                <div className="text-center">
                  <div className={`text-5xl font-bold ${getScoreTextColor(category.score)} mb-2`}>
                    {category.score}
                  </div>
                  <div className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
                    {category.name}
                  </div>
                </div>
              </button>

              {/* Expanded Feedback */}
              {expandedCategory === category.name && (
                <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 animate-fade-in">
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {category.feedback}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Click on any category to view detailed feedback
        </p>
      </div>
    );
  }

  // Fallback for old format
  return (
    <div className="space-y-8">
      {score && (
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br ${getScoreColor(score)} text-white text-4xl font-bold shadow-xl`}>
            {score}/10
          </div>
          <p className="mt-3 text-lg font-semibold text-white">Overall Performance</p>
        </div>
      )}
      <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 shadow-sm">
        <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
          {feedback}
        </div>
      </div>
    </div>
  );
}

