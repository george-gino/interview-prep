'use client';

import { useState } from 'react';
import Link from 'next/link';
import AuthModal from '@/components/AuthModal';

export default function LandingPage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
      {/* Navigation */}
      <nav className="bg-slate-900/50 backdrop-blur-lg border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg"></div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              AI Interview Practice
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => openAuth('login')}
              className="px-6 py-2 text-gray-300 hover:text-white font-medium transition"
            >
              Log In
            </button>
            <button
              onClick={() => openAuth('signup')}
              className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-lg transition-all"
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="inline-block px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-sm font-semibold mb-6">
          🚀 Master Your Coding Interviews
        </div>
        <h1 className="text-6xl font-bold mb-6 leading-tight">
          <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
            Practice Interviews
          </span>
          <br />
          <span className="text-white">Get AI-Powered Feedback</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
          Simulate real coding interviews with voice explanations. Our AI analyzes your problem-solving approach, 
          code quality, and communication skills to help you land your dream job.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => openAuth('signup')}
            className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-lg font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg"
          >
            Start Practicing Free
          </button>
          <button
            onClick={() => openAuth('login')}
            className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white text-lg font-bold rounded-xl transition-all border border-gray-700"
          >
            Watch Demo
          </button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center mb-16 text-white">
          Why Choose AI Interview Practice?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="p-8 bg-gray-800/50 border border-gray-700 rounded-2xl hover:border-emerald-500/50 transition-all">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Real Interview Simulation</h3>
            <p className="text-gray-400 leading-relaxed">
              Practice with real LeetCode-style problems while explaining your thought process out loud, 
              just like in actual technical interviews.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-8 bg-gray-800/50 border border-gray-700 rounded-2xl hover:border-emerald-500/50 transition-all">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Detailed AI Feedback</h3>
            <p className="text-gray-400 leading-relaxed">
              Get comprehensive feedback on problem understanding, code quality, communication, 
              algorithm design, and complexity analysis.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-8 bg-gray-800/50 border border-gray-700 rounded-2xl hover:border-emerald-500/50 transition-all">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Multi-Language Support</h3>
            <p className="text-gray-400 leading-relaxed">
              Practice in Python, JavaScript, TypeScript, Java, C++, Go, or Rust. 
              Choose your preferred language and ace your interview.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center mb-16 text-white">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { step: 1, title: 'Choose Problem', desc: 'Select from curated coding problems sorted by difficulty' },
            { step: 2, title: 'Code & Explain', desc: 'Write your solution while explaining your approach out loud' },
            { step: 3, title: 'AI Analysis', desc: 'Our AI transcribes and analyzes your explanation and code' },
            { step: 4, title: 'Get Feedback', desc: 'Receive detailed scores and actionable improvement tips' },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">
                {item.step}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="p-12 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-3xl">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Ace Your Next Interview?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Join developers who are landing their dream jobs with AI-powered interview practice.
          </p>
          <button
            onClick={() => openAuth('signup')}
            className="px-10 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-lg font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg"
          >
            Get Started for Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-500 text-sm">
          © 2024 AI Interview Practice. Built to help developers succeed.
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        mode={authMode}
      />
    </div>
  );
}

