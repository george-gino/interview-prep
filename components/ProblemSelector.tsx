'use client';

import { ProblemSelectorProps } from '@/lib/types';

/**
 * Dropdown selector for choosing a coding problem
 * Displays problem details when selected
 */
export default function ProblemSelector({
  problems,
  selectedProblem,
  onSelectProblem,
}: ProblemSelectorProps) {
  return (
    <div className="space-y-4">
      {/* Problem Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select a Problem
        </label>
        <select
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={selectedProblem?.id || ''}
          onChange={(e) => {
            const problem = problems.find(p => p.id === parseInt(e.target.value));
            if (problem) onSelectProblem(problem);
          }}
        >
          <option value="">Choose a problem...</option>
          {problems.map((problem) => (
            <option key={problem.id} value={problem.id}>
              {problem.title} ({problem.difficulty})
            </option>
          ))}
        </select>
      </div>

      {/* Display selected problem description */}
      {selectedProblem && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-2">
            {selectedProblem.title}
            <span className={`ml-2 text-sm px-2 py-1 rounded ${
              selectedProblem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
              selectedProblem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {selectedProblem.difficulty}
            </span>
          </h3>
          <p className="text-gray-700 whitespace-pre-wrap">
            {selectedProblem.description}
          </p>
        </div>
      )}
    </div>
  );
}

