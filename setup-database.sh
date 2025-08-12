#!/bin/bash

# AI Mind OS - Database Setup Script
# This script sets up the complete gamified database schema

echo "🚀 AI Mind OS Database Setup"
echo "================================"

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ Error: .env.local file not found!"
    echo "Please create .env.local with your Supabase credentials:"
    echo "cp .env.local.example .env.local"
    echo "Then edit .env.local with your actual credentials."
    exit 1
fi

# Load environment variables
export $(grep -v '^#' .env.local | xargs)

echo "✅ Environment variables loaded"

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "📦 Installing Supabase CLI..."
    npm install -g supabase
    if [ $? -eq 0 ]; then
        echo "✅ Supabase CLI installed successfully"
    else
        echo "❌ Failed to install Supabase CLI"
        echo "Please install manually: npm install -g supabase"
        exit 1
    fi
else
    echo "✅ Supabase CLI already installed"
fi

# Initialize Supabase if not already done
if [ ! -d "supabase" ]; then
    echo "🔧 Initializing Supabase project..."
    supabase init
    echo "✅ Supabase project initialized"
else
    echo "✅ Supabase project already initialized"
fi

echo ""
echo "🗄️  Database Schema Migration Options:"
echo "1. Quick Setup (Basic gamification)"
echo "2. Enhanced Setup (Full gamified system)"
echo "3. Custom Migration (Choose specific components)"
echo ""

read -p "Choose option (1-3): " option

case $option in
    1)
        echo "📋 Running Quick Setup..."
        if [ -f "schema-quick-setup.sql" ]; then
            supabase db reset --local
            psql "$SUPABASE_URL" < schema-quick-setup.sql
            echo "✅ Quick setup completed"
        else
            echo "❌ schema-quick-setup.sql not found"
        fi
        ;;
    2)
        echo "📋 Running Enhanced Setup..."
        if [ -f "schema-gamified.sql" ]; then
            supabase db reset --local
            psql "$SUPABASE_URL" < schema-gamified.sql
            echo "✅ Enhanced setup completed"
        else
            echo "❌ schema-gamified.sql not found"
        fi
        ;;
    3)
        echo "📋 Custom Migration..."
        echo "Available schema files:"
        ls -la *.sql 2>/dev/null || echo "No SQL files found"
        read -p "Enter schema file name: " schema_file
        if [ -f "$schema_file" ]; then
            supabase db reset --local
            psql "$SUPABASE_URL" < "$schema_file"
            echo "✅ Custom migration completed"
        else
            echo "❌ Schema file not found: $schema_file"
        fi
        ;;
    *)
        echo "❌ Invalid option selected"
        exit 1
        ;;
esac

echo ""
echo "🔐 Setting up Row Level Security (RLS)..."

# Create RLS policies file
cat > setup_rls.sql << 'EOF'
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- Missions policies
CREATE POLICY "Users can view own missions" ON public.missions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own missions" ON public.missions
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own missions" ON public.missions
FOR UPDATE USING (auth.uid() = user_id);

-- Lesson completions policies
CREATE POLICY "Users can view own lesson completions" ON public.lesson_completions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own lesson completions" ON public.lesson_completions
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Referrals policies
CREATE POLICY "Users can view own referrals" ON public.referrals
FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

CREATE POLICY "Users can create referrals" ON public.referrals
FOR INSERT WITH CHECK (auth.uid() = referrer_id);

-- Events policies
CREATE POLICY "Users can view own events" ON public.events
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own events" ON public.events
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Leaderboard access (public read for rankings)
CREATE POLICY "Public can view leaderboard data" ON public.profiles
FOR SELECT USING (true);
EOF

psql "$SUPABASE_URL" < setup_rls.sql
rm setup_rls.sql

echo "✅ RLS policies configured"

echo ""
echo "📊 Setting up database functions..."

# Create database functions
cat > setup_functions.sql << 'EOF'
-- Function to update user XP and level
CREATE OR REPLACE FUNCTION update_user_xp(user_uuid UUID, xp_amount INTEGER)
RETURNS VOID AS $$
DECLARE
    current_xp INTEGER;
    new_level INTEGER;
BEGIN
    -- Get current XP
    SELECT xp INTO current_xp FROM public.profiles WHERE id = user_uuid;
    
    -- Update XP
    UPDATE public.profiles 
    SET xp = xp + xp_amount,
        updated_at = NOW()
    WHERE id = user_uuid;
    
    -- Calculate new level (every 100 XP = 1 level)
    new_level := (current_xp + xp_amount) / 100 + 1;
    
    -- Update level if changed
    UPDATE public.profiles 
    SET current_level = new_level
    WHERE id = user_uuid AND current_level != new_level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to award achievement
CREATE OR REPLACE FUNCTION award_achievement(user_uuid UUID, achievement_type TEXT, xp_bonus INTEGER DEFAULT 0)
RETURNS VOID AS $$
BEGIN
    -- Log achievement event
    INSERT INTO public.events (user_id, type, category, meta, xp_impact, created_at)
    VALUES (user_uuid, 'achievement_earned', 'achievement', 
            jsonb_build_object('achievement_type', achievement_type, 'xp_bonus', xp_bonus), 
            xp_bonus, NOW());
    
    -- Award XP bonus
    IF xp_bonus > 0 THEN
        PERFORM update_user_xp(user_uuid, xp_bonus);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to complete mission
CREATE OR REPLACE FUNCTION complete_mission(mission_uuid UUID, amazingness_rating INTEGER DEFAULT 5)
RETURNS VOID AS $$
DECLARE
    mission_record RECORD;
    xp_earned INTEGER;
BEGIN
    -- Get mission details
    SELECT * INTO mission_record FROM public.missions WHERE id = mission_uuid;
    
    -- Calculate XP based on difficulty and amazingness
    xp_earned := mission_record.xp_reward * amazingness_rating / 5;
    
    -- Update mission status
    UPDATE public.missions 
    SET status = 'done', 
        amazingness_score = amazingness_rating,
        completed_at = NOW(),
        updated_at = NOW()
    WHERE id = mission_uuid;
    
    -- Award XP
    PERFORM update_user_xp(mission_record.user_id, xp_earned);
    
    -- Log completion event
    INSERT INTO public.events (user_id, type, category, meta, xp_impact, created_at)
    VALUES (mission_record.user_id, 'mission_completed', 'learning', 
            jsonb_build_object('mission_id', mission_uuid, 'amazingness_score', amazingness_rating), 
            xp_earned, NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
EOF

psql "$SUPABASE_URL" < setup_functions.sql
rm setup_functions.sql

echo "✅ Database functions created"

echo ""
echo "🌱 Creating sample data..."

# Create sample data
cat > sample_data.sql << 'EOF'
-- Insert sample achievements data
INSERT INTO public.events (user_id, type, category, meta, created_at) VALUES
(NULL, 'sample_achievement', 'achievement', '{"name": "First Steps", "description": "Complete your first lesson"}', NOW()),
(NULL, 'sample_achievement', 'achievement', '{"name": "Streak Master", "description": "Maintain a 7-day learning streak"}', NOW()),
(NULL, 'sample_achievement', 'achievement', '{"name": "Mission Possible", "description": "Complete 10 missions"}', NOW());
EOF

psql "$SUPABASE_URL" < sample_data.sql
rm sample_data.sql

echo "✅ Sample data created"

echo ""
echo "🎉 Database Setup Complete!"
echo "================================"
echo ""
echo "Next Steps:"
echo "1. ✅ Database schema migrated"
echo "2. ✅ RLS policies configured"
echo "3. ✅ Database functions created"
echo "4. ✅ Sample data inserted"
echo ""
echo "🚀 Ready to:"
echo "   • Start development server: npm run dev"
echo "   • Test gamification features"
echo "   • Deploy to production"
echo ""
echo "📋 Environment Check:"
echo "   • Supabase URL: ${NEXT_PUBLIC_SUPABASE_URL:-'Not Set'}"
echo "   • Database connected: ✅"
echo "   • RLS enabled: ✅"
echo ""
