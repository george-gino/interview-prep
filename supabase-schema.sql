-- Supabase Database Schema for AI Interview Practice Platform

-- Table: problems
-- Stores coding interview problems
CREATE TABLE problems (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  description TEXT NOT NULL,
  starter_code JSONB NOT NULL, -- { "python": "...", "javascript": "..." }
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: sessions
-- Stores completed interview sessions
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id BIGINT REFERENCES problems(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  code TEXT NOT NULL,
  audio_url TEXT,
  transcript TEXT,
  feedback TEXT,
  score INTEGER CHECK (score >= 0 AND score <= 10),
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX idx_sessions_problem_id ON sessions(problem_id);
CREATE INDEX idx_sessions_created_at ON sessions(created_at DESC);

-- Enable Row Level Security (optional for MVP, required for production)
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Allow public read access to problems (for MVP without auth)
CREATE POLICY "Allow public read access to problems"
  ON problems
  FOR SELECT
  USING (true);

-- Allow public insert/update access to sessions (for MVP without auth)
CREATE POLICY "Allow public insert access to sessions"
  ON sessions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to sessions"
  ON sessions
  FOR UPDATE
  USING (true);

CREATE POLICY "Allow public read access to sessions"
  ON sessions
  FOR SELECT
  USING (true);

-- Insert sample problems for testing
INSERT INTO problems (title, difficulty, description, starter_code) VALUES
(
  'Two Sum',
  'Easy',
  'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

Example:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].',
  '{
    "python": "def two_sum(nums, target):\n    # Your code here\n    pass",
    "javascript": "function twoSum(nums, target) {\n    // Your code here\n}"
  }'::jsonb
),
(
  'Reverse String',
  'Easy',
  'Write a function that reverses a string. The input string is given as an array of characters.

You must do this by modifying the input array in-place with O(1) extra memory.

Example:
Input: s = ["h","e","l","l","o"]
Output: ["o","l","l","e","h"]',
  '{
    "python": "def reverse_string(s):\n    # Your code here\n    pass",
    "javascript": "function reverseString(s) {\n    // Your code here\n}"
  }'::jsonb
),
(
  'Valid Palindrome',
  'Easy',
  'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.

Given a string s, return true if it is a palindrome, or false otherwise.

Example:
Input: s = "A man, a plan, a canal: Panama"
Output: true
Explanation: "amanaplanacanalpanama" is a palindrome.',
  '{
    "python": "def is_palindrome(s):\n    # Your code here\n    pass",
    "javascript": "function isPalindrome(s) {\n    // Your code here\n}"
  }'::jsonb
),
(
  'Best Time to Buy and Sell Stock',
  'Easy',
  'You are given an array prices where prices[i] is the price of a given stock on the ith day.

You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.

Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.

Example:
Input: prices = [7,1,5,3,6,4]
Output: 5
Explanation: Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.',
  '{
    "python": "def max_profit(prices):\n    # Your code here\n    pass",
    "javascript": "function maxProfit(prices) {\n    // Your code here\n}"
  }'::jsonb
),
(
  'Valid Anagram',
  'Easy',
  'Given two strings s and t, return true if t is an anagram of s, and false otherwise.

An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.

Example:
Input: s = "anagram", t = "nagaram"
Output: true',
  '{
    "python": "def is_anagram(s, t):\n    # Your code here\n    pass",
    "javascript": "function isAnagram(s, t) {\n    // Your code here\n}"
  }'::jsonb
);

