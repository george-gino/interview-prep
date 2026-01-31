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
    <div className="space-y-4">
      {/* Problem Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select a Problem
        </label>
        <select
          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white cursor-pointer hover:border-indigo-400 hover:shadow-md"
          value={selectedProblem?.id || ''}
          onChange={(e) => {
            const problem = problems.find(p => p.id === parseInt(e.target.value));
            if (problem) onSelectProblem(problem);
          }}
        >
          <option value="" disabled>Choose a problem to practice...</option>
          
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
        
        {/* Problem count by difficulty */}
        <div className="mt-2 flex gap-3 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            {groupedProblems.Easy.length} Easy
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
            {groupedProblems.Medium.length} Medium
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            {groupedProblems.Hard.length} Hard
          </span>
        </div>
      </div>

      {/* Display selected problem description */}
      {selectedProblem && (
        <div className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">
              {selectedProblem.title}
            </h3>
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide ${
              selectedProblem.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700' :
              selectedProblem.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' :
              'bg-rose-100 text-rose-700'
            }`}>
              {selectedProblem.difficulty}
            </span>
          </div>
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
            {selectedProblem.description}
          </div>
        </div>
      )}
    </div>
  );
}

