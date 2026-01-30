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
          className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white cursor-pointer hover:border-gray-400 transition"
          value={selectedProblem?.id || ''}
          onChange={(e) => {
            const problem = problems.find(p => p.id === parseInt(e.target.value));
            if (problem) onSelectProblem(problem);
          }}
        >
          <option value="" disabled>Choose a problem to practice...</option>
          
          {/* Easy Problems */}
          {groupedProblems.Easy.length > 0 && (
            <optgroup label="🟢 Easy">
              {groupedProblems.Easy.map((problem) => (
                <option key={problem.id} value={problem.id}>
                  {problem.title}
                </option>
              ))}
            </optgroup>
          )}
          
          {/* Medium Problems */}
          {groupedProblems.Medium.length > 0 && (
            <optgroup label="🟡 Medium">
              {groupedProblems.Medium.map((problem) => (
                <option key={problem.id} value={problem.id}>
                  {problem.title}
                </option>
              ))}
            </optgroup>
          )}
          
          {/* Hard Problems */}
          {groupedProblems.Hard.length > 0 && (
            <optgroup label="🔴 Hard">
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
        <div className="p-6 bg-white rounded-lg border-2 border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-bold text-gray-900">
              {selectedProblem.title}
            </h3>
            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
              selectedProblem.difficulty === 'Easy' ? 'bg-green-100 text-green-700 border border-green-300' :
              selectedProblem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' :
              'bg-red-100 text-red-700 border border-red-300'
            }`}>
              {selectedProblem.difficulty}
            </span>
          </div>
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {selectedProblem.description}
          </div>
        </div>
      )}
    </div>
  );
}

