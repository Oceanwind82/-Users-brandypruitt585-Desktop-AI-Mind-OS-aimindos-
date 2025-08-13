-- Migration: Add missing amazingness_score column to daily_lessons table
-- Date: 2025-08-12
-- Fix for: "Could not find the 'amazingness_score' column of 'daily_lessons' in the schema cache"

-- Add the missing column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'daily_lessons' AND column_name = 'amazingness_score'
    ) THEN
        ALTER TABLE daily_lessons ADD COLUMN amazingness_score INTEGER DEFAULT 0;
    END IF;
END $$;

-- Add quality_tier column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'daily_lessons' AND column_name = 'quality_tier'
    ) THEN
        ALTER TABLE daily_lessons ADD COLUMN quality_tier TEXT;
    END IF;
END $$;

-- Add satisfaction_rating column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'daily_lessons' AND column_name = 'satisfaction_rating'
    ) THEN
        ALTER TABLE daily_lessons ADD COLUMN satisfaction_rating INTEGER;
    END IF;
END $$;

-- Add difficulty_rating column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'daily_lessons' AND column_name = 'difficulty_rating'
    ) THEN
        ALTER TABLE daily_lessons ADD COLUMN difficulty_rating INTEGER;
    END IF;
END $$;

-- Add engagement_score column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'daily_lessons' AND column_name = 'engagement_score'
    ) THEN
        ALTER TABLE daily_lessons ADD COLUMN engagement_score INTEGER;
    END IF;
END $$;

-- Add feedback_text column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'daily_lessons' AND column_name = 'feedback_text'
    ) THEN
        ALTER TABLE daily_lessons ADD COLUMN feedback_text TEXT;
    END IF;
END $$;

-- Add lesson_quality_metrics column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'daily_lessons' AND column_name = 'lesson_quality_metrics'
    ) THEN
        ALTER TABLE daily_lessons ADD COLUMN lesson_quality_metrics JSONB;
    END IF;
END $$;

-- Create index for amazingness_score if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_daily_lessons_amazingness ON daily_lessons(amazingness_score DESC);

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'daily_lessons' 
    AND column_name IN ('amazingness_score', 'quality_tier', 'satisfaction_rating', 'difficulty_rating', 'engagement_score', 'feedback_text', 'lesson_quality_metrics')
ORDER BY column_name;
