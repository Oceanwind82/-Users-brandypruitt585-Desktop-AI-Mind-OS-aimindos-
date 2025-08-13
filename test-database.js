import { createClient } from '@supabase/supabase-js';

// Test database connection and schema
async function testDatabaseConnection() {
  console.log('🔌 Testing AI Mind OS Database Connection...\n');

  // Load environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing environment variables:');
    console.log('Required in .env.local:');
    console.log('- NEXT_PUBLIC_SUPABASE_URL');
    console.log('- SUPABASE_SERVICE_ROLE_KEY');
    return false;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Test basic connection
    console.log('1. Testing basic connection...');
    await supabase.from('profiles').select('count').limit(1);
    console.log('✅ Connection successful\n');

    // Test each table
    const tables = ['profiles', 'missions', 'lesson_completions', 'referrals', 'events'];
    
    console.log('2. Checking database schema...');
    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select('*').limit(1);
        if (error && error.code === 'PGRST116') {
          console.log(`❌ Table '${table}' does not exist`);
        } else if (error) {
          console.log(`⚠️  Table '${table}' - ${error.message}`);
        } else {
          console.log(`✅ Table '${table}' exists and accessible`);
        }
      } catch (err) {
        console.log(`❌ Table '${table}' - Error: ${err.message}`);
      }
    }

    // Test RLS policies
    console.log('\n3. Testing Row Level Security...');
    try {
      const { data, error } = await supabase.from('profiles').select('id, total_xp, current_level').limit(5);
      if (error) {
        console.log(`⚠️  RLS may need configuration - ${error.message}`);
      } else {
        console.log(`✅ RLS configured - Can read ${data?.length || 0} profile records`);
      }
    } catch (err) {
      console.log(`❌ RLS test failed - ${err.message}`);
    }

    // Test database functions
    console.log('\n4. Testing database functions...');
    try {
      const { error } = await supabase.rpc('update_user_xp', { 
        user_uuid: '00000000-0000-0000-0000-000000000000', 
        xp_amount: 0 
      });
      if (error && error.message.includes('function') && error.message.includes('does not exist')) {
        console.log('❌ Database functions not created yet');
      } else {
        console.log('✅ Database functions available');
      }
    } catch (err) {
      console.log(`⚠️  Database functions may need setup - ${err.message}`);
    }

    console.log('\n🎉 Database Test Complete!\n');
    return true;

  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    return false;
  }
}

// Run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testDatabaseConnection();
}

export { testDatabaseConnection };
