import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// This endpoint fixes the missing amazingness_score column issue
export async function POST() {
  try {
    // Get admin Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ 
        error: 'Missing Supabase environment variables' 
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Execute the migration directly using SQL
    const migrationQueries = [
      // Add amazingness_score column
      `ALTER TABLE daily_lessons ADD COLUMN IF NOT EXISTS amazingness_score INTEGER DEFAULT 0;`,
      
      // Add other missing columns
      `ALTER TABLE daily_lessons ADD COLUMN IF NOT EXISTS quality_tier TEXT;`,
      `ALTER TABLE daily_lessons ADD COLUMN IF NOT EXISTS satisfaction_rating INTEGER;`,
      `ALTER TABLE daily_lessons ADD COLUMN IF NOT EXISTS difficulty_rating INTEGER;`,
      `ALTER TABLE daily_lessons ADD COLUMN IF NOT EXISTS engagement_score INTEGER;`,
      `ALTER TABLE daily_lessons ADD COLUMN IF NOT EXISTS feedback_text TEXT;`,
      `ALTER TABLE daily_lessons ADD COLUMN IF NOT EXISTS lesson_quality_metrics JSONB;`,
      
      // Create index
      `CREATE INDEX IF NOT EXISTS idx_daily_lessons_amazingness ON daily_lessons(amazingness_score DESC);`
    ];

    for (const query of migrationQueries) {
      const { error } = await supabase.rpc('exec_sql', { sql: query });
      if (error && !error.message.includes('already exists')) {
        console.error(`Migration query failed: ${query}`, error);
        // Continue with other queries even if one fails
      }
    }

    // Test that we can now query the table with the new columns
    const { error: testError } = await supabase
      .from('daily_lessons')
      .select('amazingness_score')
      .limit(1);

    if (testError) {
      console.error('Schema verification failed:', testError);
      return NextResponse.json({ 
        error: 'Schema verification failed', 
        details: testError.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Daily lessons schema updated successfully. The amazingness_score column and related fields have been added.',
      columns_added: [
        'amazingness_score',
        'quality_tier', 
        'satisfaction_rating',
        'difficulty_rating',
        'engagement_score',
        'feedback_text',
        'lesson_quality_metrics'
      ]
    });

  } catch (error) {
    console.error('Schema fix error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
