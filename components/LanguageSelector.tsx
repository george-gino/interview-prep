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
        className="w-full px-3 py-2 text-left bg-gray-700 border border-gray-600 rounded-lg hover:border-gray-500 hover:bg-gray-650 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 cursor-pointer flex items-center justify-between"
      >
        <span className="flex items-center gap-2 text-sm font-medium">
          <span 
            className="w-2.5 h-2.5 rounded-full" 
            style={{ backgroundColor: currentLanguage.color }}
          ></span>
          <span className="text-gray-200">{currentLanguage.name}</span>
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl overflow-hidden">
          {languages.map(([key, lang]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                onChange(key);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-left hover:bg-gray-700 flex items-center gap-2 ${
                key === value ? 'bg-gray-700 border-l-4 border-gray-400' : 'border-l-4 border-transparent'
              }`}
            >
              <span 
                className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                style={{ backgroundColor: lang.color }}
              ></span>
              <span className={`text-sm font-medium ${key === value ? 'text-white' : 'text-gray-300'}`}>
                {lang.name}
              </span>
              {key === value && (
                <svg className="w-4 h-4 ml-auto text-gray-400" fill="currentColor" viewBox="0 0 20 20">
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


