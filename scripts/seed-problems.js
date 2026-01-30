/**
 * Script to bulk insert Blind 75 problems into Supabase
 * 
 * Usage:
 * 1. Make sure you have your .env.local file with SUPABASE credentials
 * 2. Run: node scripts/seed-problems.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedProblems() {
  try {
    // Read the problems JSON file
    const problemsPath = path.join(__dirname, 'blind75_problems.json');
    const problemsData = JSON.parse(fs.readFileSync(problemsPath, 'utf8'));

    console.log(`📚 Found ${problemsData.length} problems to insert`);

    // Insert problems in batches (Supabase has limits)
    const batchSize = 10;
    let inserted = 0;

    for (let i = 0; i < problemsData.length; i += batchSize) {
      const batch = problemsData.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('problems')
        .insert(batch)
        .select();

      if (error) {
        console.error(`❌ Error inserting batch ${i / batchSize + 1}:`, error);
        throw error;
      }

      inserted += batch.length;
      console.log(`✅ Inserted ${inserted}/${problemsData.length} problems`);
    }

    console.log('');
    console.log('🎉 Successfully inserted all problems!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Go to Supabase → Table Editor → problems table');
    console.log('2. Verify you see all the problems');
    console.log('3. Test your app - problems should now appear in the dropdown');

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the seed function
seedProblems();
