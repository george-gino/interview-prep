'use client';

import { useState, useRef, useEffect } from 'react';
import { LANGUAGES, LanguageKey } from '@/lib/types';

/**
 * Custom dropdown for selecting programming language
 * Styled to match the design system
 */
export default function LanguageSelector({
  value,
  onChange,
}: {
  value: LanguageKey;
  onChange: (lang: LanguageKey) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const currentLanguage = LANGUAGES[value];
  const languages = Object.entries(LANGUAGES) as [LanguageKey, typeof LANGUAGES[LanguageKey]][];

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Programming Language
      </label>
      
      {/* Custom Dropdown Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 text-left bg-white border-2 border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition cursor-pointer flex items-center justify-between"
      >
        <span className="flex items-center gap-2 text-base font-medium">
          <span className="text-xl">{currentLanguage.icon}</span>
          <span>{currentLanguage.name}</span>
        </span>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-xl overflow-hidden">
          {languages.map(([key, lang]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                onChange(key);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition flex items-center gap-3 ${
                key === value ? 'bg-blue-50 border-l-4 border-blue-500' : 'border-l-4 border-transparent'
              }`}
            >
              <span className="text-2xl">{lang.icon}</span>
              <span className={`text-base font-medium ${key === value ? 'text-blue-700' : 'text-gray-700'}`}>
                {lang.name}
              </span>
              {key === value && (
                <svg className="w-5 h-5 ml-auto text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


