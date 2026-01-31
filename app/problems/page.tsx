'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getProblems } from '@/lib/supabase';
import { Problem } from '@/lib/types';
import Link from 'next/link';

/**
 * Problem list page - displays all available coding problems
 * Allows sorting and filtering by difficulty
 */
export default function ProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [filteredProblems, setFilteredProblems] = useState<Problem[]>([]);
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    loadProblems();
  }, []);

  useEffect(() => {
    filterProblems();
  }, [problems, difficultyFilter, searchTerm]);

  async function loadProblems() {
    try {
      const data = await getProblems();
      setProblems(data);
      setFilteredProblems(data);
    } catch (error) {
      alert('Failed to load problems. Please refresh the page.');
    }
  }

  function filterProblems() {
    let filtered = problems;

    // Filter by difficulty
    if (difficultyFilter !== 'All') {
      filtered = filtered.filter(p => p.difficulty === difficultyFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProblems(filtered);
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
      case 'Medium':
        return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
      case 'Hard':
        return 'text-rose-400 bg-rose-500/20 border-rose-500/30';
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const counts = {
    All: problems.length,
    Easy: problems.filter(p => p.difficulty === 'Easy').length,
    Medium: problems.filter(p => p.difficulty === 'Medium').length,
    Hard: problems.filter(p => p.difficulty === 'Hard').length,
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-8 py-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">
          AI Interview Practice
        </h1>
        <p className="text-gray-400">Select a problem to begin your coding interview practice</p>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search problems..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Difficulty Filter */}
          <div className="flex gap-2">
            {(['All', 'Easy', 'Medium', 'Hard'] as const).map((difficulty) => (
              <button
                key={difficulty}
                onClick={() => setDifficultyFilter(difficulty)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  difficultyFilter === difficulty
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {difficulty} ({counts[difficulty]})
              </button>
            ))}
          </div>
        </div>

        {/* Problem List */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-750 border-b border-gray-700 text-sm font-semibold text-gray-400 uppercase tracking-wide">
            <div className="col-span-1 text-center">#</div>
            <div className="col-span-7">Problem</div>
            <div className="col-span-2 text-center">Difficulty</div>
            <div className="col-span-2 text-center">Action</div>
          </div>

          {/* Problem Rows */}
          {filteredProblems.length > 0 ? (
            <div className="divide-y divide-gray-700">
              {filteredProblems.map((problem, index) => (
                <div
                  key={problem.id}
                  className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-750 transition-colors group"
                >
                  {/* Number */}
                  <div className="col-span-1 flex items-center justify-center text-gray-500 font-mono">
                    {index + 1}
                  </div>

                  {/* Problem Title */}
                  <div className="col-span-7 flex items-center">
                    <Link
                      href={`/problem/${problem.id}`}
                      className="text-gray-200 hover:text-emerald-400 transition-colors font-medium"
                    >
                      {problem.title}
                    </Link>
                  </div>

                  {/* Difficulty */}
                  <div className="col-span-2 flex items-center justify-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${getDifficultyColor(problem.difficulty)}`}>
                      {problem.difficulty}
                    </span>
                  </div>

                  {/* Action Button */}
                  <div className="col-span-2 flex items-center justify-center">
                    <Link
                      href={`/problem/${problem.id}`}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-all hover:scale-105"
                    >
                      Solve
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-gray-500">
              No problems found matching your criteria.
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-6 text-center text-gray-500 text-sm">
          Showing {filteredProblems.length} of {problems.length} problems
        </div>
      </div>
    </div>
  );
}

