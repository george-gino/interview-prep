'use client';

import { ProblemSelectorProps } from '@/lib/types';
import { useMemo } from 'react';

/**
 * Dropdown selector for choosing a coding problem
 * Displays problem details when selected
 * Groups problems by difficulty for easier selection
 */
export default function ProblemSelector({
  problems,
  selectedProblem,
  onSelectProblem,
}: ProblemSelectorProps) {
  // Group problems by difficulty
  const groupedProblems = useMemo(() => {
    const groups = {
      Easy: problems.filter(p => p.difficulty === 'Easy'),
      Medium: problems.filter(p => p.difficulty === 'Medium'),
      Hard: problems.filter(p => p.difficulty === 'Hard'),
    };
    return groups;
  }, [problems]);

  return (
    <select
      className="w-full px-3 py-2 text-sm border border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-700 text-gray-200 cursor-pointer hover:border-emerald-500"
      value={selectedProblem?.id || ''}
      onChange={(e) => {
        const problem = problems.find(p => p.id === parseInt(e.target.value));
        if (problem) onSelectProblem(problem);
      }}
    >
      <option value="" disabled>Choose a problem...</option>
      
      {/* Easy Problems */}
      {groupedProblems.Easy.length > 0 && (
        <optgroup label="EASY">
          {groupedProblems.Easy.map((problem) => (
            <option key={problem.id} value={problem.id}>
              {problem.title}
            </option>
          ))}
        </optgroup>
      )}
      
      {/* Medium Problems */}
      {groupedProblems.Medium.length > 0 && (
        <optgroup label="MEDIUM">
          {groupedProblems.Medium.map((problem) => (
            <option key={problem.id} value={problem.id}>
              {problem.title}
            </option>
          ))}
        </optgroup>
      )}
      
      {/* Hard Problems */}
      {groupedProblems.Hard.length > 0 && (
        <optgroup label="HARD">
          {groupedProblems.Hard.map((problem) => (
            <option key={problem.id} value={problem.id}>
              {problem.title}
            </option>
          ))}
        </optgroup>
      )}
    </select>
  );
}

