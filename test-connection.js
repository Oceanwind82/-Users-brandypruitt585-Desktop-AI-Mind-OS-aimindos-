const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testConnection() {
  console.log('🔌 Testing AI Mind OS Database Connection');
  console.log('=========================================');
  console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('Project:', process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]);
  console.log('');
  
  try {
    // Test basic connection
    console.log('1. Testing connection...');
    const { data, error } = await supabase.from('profiles').select('*').limit(1);
    
    if (error && error.code === 'PGRST116') {
      console.log('✅ Connection successful');
      console.log('📋 Table "profiles" not found (expected before migration)');
      console.log('🚀 Ready for database migration!');
      console.log('');
      console.log('Next Steps:');
      console.log('1. Go to: https://supabase.com/dashboard/project/taydgzzxdamgxciqldzq');
      console.log('2. Click: SQL Editor');
      console.log('3. Copy & paste: database-quick-setup.sql');
      console.log('4. Click: Run');
      console.log('5. ✅ Migration complete!');
      
    } else if (error) {
      console.log('⚠️  Connection issue:', error.message);
      console.log('');
      console.log('Troubleshooting:');
      console.log('- Check your .env.local file');
      console.log('- Verify Supabase project is active');
      console.log('- Ensure service role key is correct');
      
    } else {
      console.log('✅ Connection successful');
      console.log('📊 Found existing profiles table with', data?.length || 0, 'records');
      console.log('⚡ Database appears to be already set up');
      
      // Test other tables
      const tables = ['missions', 'lesson_completions', 'referrals', 'events'];
      console.log('');
      console.log('2. Checking gamification tables...');
      
      for (const table of tables) {
        try {
          const { error: tableError } = await supabase.from(table).select('*').limit(1);
          if (tableError && tableError.code === 'PGRST116') {
            console.log(`❌ Table "${table}" missing`);
          } else if (tableError) {
            console.log(`⚠️  Table "${table}" - ${tableError.message}`);
          } else {
            console.log(`✅ Table "${table}" exists`);
          }
        } catch (err) {
          console.log(`❌ Table "${table}" - ${err.message}`);
        }
      }
    }
    
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    console.log('');
    console.log('Please check:');
    console.log('- Internet connection');
    console.log('- Supabase project status');
    console.log('- Environment variables in .env.local');
  }
}

testConnection();
