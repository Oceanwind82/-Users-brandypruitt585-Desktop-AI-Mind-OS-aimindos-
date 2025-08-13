import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
await dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyMigration() {
  console.log('🔍 Verifying AI Mind OS Database Migration');
  console.log('==========================================');
  
  const requiredTables = [
    'profiles',
    'missions', 
    'lesson_completions',
    'referrals',
    'events'
  ];
  
  let allTablesExist = true;
  
  for (const table of requiredTables) {
    try {
      const { error } = await supabase.from(table).select('*').limit(1);
      
      if (error && error.code === 'PGRST116') {
        console.log(`❌ Table "${table}" - NOT FOUND`);
        allTablesExist = false;
      } else if (error) {
        console.log(`⚠️  Table "${table}" - ${error.message}`);
        allTablesExist = false;
      } else {
        console.log(`✅ Table "${table}" - EXISTS`);
      }
    } catch (err) {
      console.log(`❌ Table "${table}" - ERROR: ${err.message}`);
      allTablesExist = false;
    }
  }
  
  console.log('');
  
  if (allTablesExist) {
    console.log('🎉 MIGRATION SUCCESSFUL!');
    console.log('✅ All gamification tables created');
    console.log('✅ Database ready for AI Mind OS');
    console.log('');
    console.log('🚀 Next Steps:');
    console.log('1. Start dev server: npm run dev');
    console.log('2. Visit: http://localhost:3000/dashboard');
    console.log('3. Test: Gamification features');
    console.log('4. Deploy: Ready for production!');
    
    // Test inserting sample data
    console.log('');
    console.log('🧪 Testing sample data insertion...');
    try {
      const { error: insertError } = await supabase
        .from('events')
        .insert({
          type: 'migration_test',
          category: 'general',
          meta: { message: 'Database migration successful!' }
        });
        
      if (insertError) {
        console.log('⚠️  Sample insert test:', insertError.message);
      } else {
        console.log('✅ Sample data insertion working');
      }
    } catch (err) {
      console.log('⚠️  Insert test error:', err.message);
    }
    
  } else {
    console.log('❌ MIGRATION INCOMPLETE');
    console.log('');
    console.log('📋 Required Actions:');
    console.log('1. Go to: https://supabase.com/dashboard/project/taydgzzxdamgxciqldzq');
    console.log('2. Click: SQL Editor → New Query');
    console.log('3. Copy & paste: database-quick-setup.sql');
    console.log('4. Click: Run');
    console.log('5. Re-run: node verify-migration.js');
  }
}

verifyMigration();
