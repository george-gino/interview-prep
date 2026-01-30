// Quick script to seed problems into Supabase
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://kaznyzbmhpgevlgeatjn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imthem55emJtaHBnZXZsZ2VhdGpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4MDEyNjIsImV4cCI6MjA4NTM3NzI2Mn0.TzSyFFu10Do0zVWNvPRGbdXRcK80b6zy5K6Q6dB3Aao'
);

const problems = [
  {
    title: 'Two Sum',
    difficulty: 'Easy',
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

Example:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].`,
    starter_code: {
      python: 'def two_sum(nums, target):\n    # Your code here\n    pass',
      javascript: 'function twoSum(nums, target) {\n    // Your code here\n}'
    }
  },
  {
    title: 'Reverse String',
    difficulty: 'Easy',
    description: `Write a function that reverses a string. The input string is given as an array of characters.

You must do this by modifying the input array in-place with O(1) extra memory.

Example:
Input: s = ["h","e","l","l","o"]
Output: ["o","l","l","e","h"]`,
    starter_code: {
      python: 'def reverse_string(s):\n    # Your code here\n    pass',
      javascript: 'function reverseString(s) {\n    // Your code here\n}'
    }
  },
  {
    title: 'Valid Palindrome',
    difficulty: 'Easy',
    description: `A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.

Given a string s, return true if it is a palindrome, or false otherwise.

Example:
Input: s = "A man, a plan, a canal: Panama"
Output: true
Explanation: "amanaplanacanalpanama" is a palindrome.`,
    starter_code: {
      python: 'def is_palindrome(s):\n    # Your code here\n    pass',
      javascript: 'function isPalindrome(s) {\n    // Your code here\n}'
    }
  },
  {
    title: 'Best Time to Buy and Sell Stock',
    difficulty: 'Easy',
    description: `You are given an array prices where prices[i] is the price of a given stock on the ith day.

You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.

Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.

Example:
Input: prices = [7,1,5,3,6,4]
Output: 5
Explanation: Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.`,
    starter_code: {
      python: 'def max_profit(prices):\n    # Your code here\n    pass',
      javascript: 'function maxProfit(prices) {\n    // Your code here\n}'
    }
  },
  {
    title: 'Valid Anagram',
    difficulty: 'Easy',
    description: `Given two strings s and t, return true if t is an anagram of s, and false otherwise.

An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.

Example:
Input: s = "anagram", t = "nagaram"
Output: true`,
    starter_code: {
      python: 'def is_anagram(s, t):\n    # Your code here\n    pass',
      javascript: 'function isAnagram(s, t) {\n    // Your code here\n}'
    }
  }
];

async function seedProblems() {
  console.log('🌱 Seeding problems into Supabase...\n');

  for (let i = 0; i < problems.length; i++) {
    const problem = problems[i];
    console.log(`Inserting ${i + 1}/${problems.length}: ${problem.title}...`);
    
    const { data, error } = await supabase
      .from('problems')
      .insert(problem)
      .select();

    if (error) {
      console.log(`  ❌ Error: ${error.message}`);
      console.log(`     Details:`, error);
    } else {
      console.log(`  ✅ Success! ID: ${data[0].id}`);
    }
  }

  console.log('\n📊 Checking total problems in database...');
  const { data: allProblems, error } = await supabase
    .from('problems')
    .select('*');

  if (error) {
    console.log('❌ Error fetching problems:', error.message);
  } else {
    console.log(`✅ Total problems in database: ${allProblems.length}`);
    allProblems.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.title} (${p.difficulty})`);
    });
  }
}

seedProblems();

