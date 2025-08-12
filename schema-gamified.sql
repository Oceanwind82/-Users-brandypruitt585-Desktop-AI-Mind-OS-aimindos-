-- AI Mind OS - Gamified Learning Schema
-- This replaces the existing schema with a comprehensive gamified learning system

-- Enable extension(s)
create extension if not exists pgcrypto;

-- 1) PROFILES (Enhanced user profiles with gamification)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  path text check (path in ('Builder','Automator','Deal-Maker')),
  score int check (score between 0 and 100),
  xp int not null default 0 check (xp >= 0),
  streak int not null default 0 check (streak >= 0),
  last_mission date,
  learning_style text default 'visual' check (learning_style in ('visual', 'auditory', 'kinesthetic', 'reading')),
  skill_level text default 'beginner' check (skill_level in ('beginner', 'intermediate', 'advanced', 'expert')),
  interests text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.tg_set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end; $$ language plpgsql;

drop trigger if exists set_updated_at_profiles on public.profiles;
create trigger set_updated_at_profiles before update on public.profiles
for each row execute procedure public.tg_set_updated_at();

-- 2) MISSIONS (AI Learning Missions - replaces lessons table)
create table if not exists public.missions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  title text not null,
  description text,
  topic text,
  difficulty_level int default 1 check (difficulty_level between 1 and 10),
  xp_reward int default 10 check (xp_reward >= 0),
  status text not null default 'open' check (status in ('open','done','locked')),
  completion_time interval,
  amazingness_score int check (amazingness_score between 1 and 10),
  content jsonb default '{}',
  learning_objectives text[] default '{}',
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (user_id, date)
);
create index if not exists missions_user_date_idx on public.missions(user_id, date);
create index if not exists missions_topic_idx on public.missions(topic);
create index if not exists missions_status_idx on public.missions(status);

-- 3) LESSON_COMPLETIONS (Enhanced with gamification)
create table if not exists public.lesson_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id text not null,
  mission_id uuid references public.missions(id) on delete set null,
  amazingness_score int check (amazingness_score between 1 and 10),
  satisfaction_rating int check (satisfaction_rating between 1 and 5),
  engagement_score int check (engagement_score between 1 and 10),
  difficulty_rating int check (difficulty_rating between 1 and 5),
  completion_time interval,
  xp_earned int default 10,
  streak_bonus boolean default false,
  feedback_text text,
  lesson_quality_metrics jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz not null default now()
);
create index if not exists lesson_completions_user_idx on public.lesson_completions(user_id);
create index if not exists lesson_completions_lesson_idx on public.lesson_completions(lesson_id);

-- 4) REFERRALS (User referral system)
create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  ref_code text not null unique,
  referrer_id uuid not null references auth.users(id) on delete cascade,
  referee_id uuid references auth.users(id) on delete set null,
  status text not null default 'pending' check (status in ('pending','completed','cancelled')),
  credit_cents int not null default 0 check (credit_cents >= 0),
  reward_type text default 'subscription_discount' check (reward_type in ('subscription_discount', 'xp_bonus', 'exclusive_content')),
  created_at timestamptz not null default now()
);
create index if not exists referrals_referrer_idx on public.referrals(referrer_id);
create index if not exists referrals_code_idx on public.referrals(ref_code);

-- 5) EVENTS (Enhanced analytics log with gamification events)
create table if not exists public.events (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  type text not null,
  category text default 'general' check (category in ('general', 'learning', 'gamification', 'social', 'achievement')),
  meta jsonb not null default '{}'::jsonb,
  xp_impact int default 0,
  created_at timestamptz not null default now()
);
create index if not exists events_user_created_idx on public.events(user_id, created_at desc);
create index if not exists events_type_idx on public.events(type);
create index if not exists events_category_idx on public.events(category);

-- 6) BRIEFS (Daily AI learning summaries)
create table if not exists public.briefs (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  storage_path text not null,
  title text not null,
  summary text,
  topics text[] default '{}',
  difficulty_level text default 'intermediate',
  estimated_read_time int default 5,
  created_at timestamptz not null default now()
);

-- 7) ACHIEVEMENTS (New: User achievements and badges)
create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_type text not null check (achievement_type in (
    'first_lesson', 'streak_3', 'streak_7', 'streak_30', 
    'topic_master', 'ai_expert', 'whiteboard_artist', 
    'referral_champion', 'perfect_score', 'speed_learner'
  )),
  title text not null,
  description text,
  badge_icon text,
  xp_bonus int default 0,
  unlocked_at timestamptz not null default now(),
  unique(user_id, achievement_type)
);
create index if not exists achievements_user_idx on public.achievements(user_id);

-- 8) AI_GENERATED_CONTENT (Enhanced content tracking)
create table if not exists public.ai_generated_content (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  content_type text not null check (content_type in ('lesson', 'assessment', 'trending', 'newsletter', 'course_outline', 'whiteboard_note')),
  topic text,
  audience text,
  format text,
  content_data jsonb not null,
  personalization_data jsonb,
  quality_score int check (quality_score between 1 and 10),
  usage_count int default 0,
  created_at timestamptz not null default now()
);
create index if not exists ai_content_user_idx on public.ai_generated_content(user_id);
create index if not exists ai_content_type_idx on public.ai_generated_content(content_type);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.missions enable row level security;
alter table public.lesson_completions enable row level security;
alter table public.referrals enable row level security;
alter table public.events enable row level security;
alter table public.briefs enable row level security;
alter table public.achievements enable row level security;
alter table public.ai_generated_content enable row level security;

-- POLICIES
-- profiles: only the owner can see/modify
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select
using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert
with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- missions: owner full access
drop policy if exists "missions_owner_all" on public.missions;
create policy "missions_owner_all" on public.missions for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- lesson_completions: owner full access
drop policy if exists "lesson_completions_owner_all" on public.lesson_completions;
create policy "lesson_completions_owner_all" on public.lesson_completions for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- referrals: referrer/referee can see their rows; users can self-insert as referee
drop policy if exists "referrals_read_own" on public.referrals;
create policy "referrals_read_own" on public.referrals for select
using (auth.uid() = referrer_id or auth.uid() = referee_id);

drop policy if exists "referrals_insert_self_referee" on public.referrals;
create policy "referrals_insert_self_referee" on public.referrals for insert
with check (auth.uid() = referee_id);

-- events: owner full access
drop policy if exists "events_owner_all" on public.events;
create policy "events_owner_all" on public.events for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- achievements: owner read access, system can insert
drop policy if exists "achievements_read_own" on public.achievements;
create policy "achievements_read_own" on public.achievements for select
using (auth.uid() = user_id);

drop policy if exists "achievements_insert_own" on public.achievements;
create policy "achievements_insert_own" on public.achievements for insert
with check (auth.uid() = user_id);

-- ai_generated_content: owner full access
drop policy if exists "ai_content_owner_all" on public.ai_generated_content;
create policy "ai_content_owner_all" on public.ai_generated_content for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- briefs: public read (for a browsable archive); authenticated can insert
drop policy if exists "briefs_public_read" on public.briefs;
create policy "briefs_public_read" on public.briefs for select using (true);

drop policy if exists "briefs_insert_auth" on public.briefs;
create policy "briefs_insert_auth" on public.briefs for insert
with check (auth.uid() is not null);

-- === RPCs (Remote Procedure Calls) ===

-- 1. Ensure a mission exists for a user on a given date
create or replace function public.ensure_mission_for_date(
  p_user_id uuid,
  p_date date,
  p_title text default 'Complete your first AI Learning Mission',
  p_topic text default 'AI Fundamentals'
) returns void language plpgsql as $$
begin
  if not exists (
    select 1 from public.missions m where m.user_id = p_user_id and m.date = p_date
  ) then
    insert into public.missions(user_id, date, title, topic, status)
    values (p_user_id, p_date, coalesce(p_title, 'AI Learning Mission'), p_topic, 'open');
  end if;
end; $$;

grant execute on function public.ensure_mission_for_date(uuid, date, text, text) to anon, authenticated;

-- 2. Complete a mission and update streak/xp with achievement checking
create or replace function public.complete_mission(
  p_user_id uuid,
  p_date date,
  p_amazingness_score int default 8,
  p_completion_time interval default '30 minutes'
) returns void language plpgsql as $$
declare
  v_new_streak int;
  v_total_xp int;
  v_xp_reward int := 10;
begin
  -- Update mission
  update public.missions
     set status = 'done',
         completed_at = now(),
         amazingness_score = p_amazingness_score,
         completion_time = p_completion_time
   where user_id = p_user_id and date = p_date;

  -- Calculate streak and XP
  update public.profiles
     set streak = case when last_mission = (p_date - 1) then coalesce(streak,0) + 1 else 1 end,
         last_mission = p_date,
         xp = coalesce(xp,0) + v_xp_reward + case when p_amazingness_score >= 9 then 5 else 0 end,
         updated_at = now()
   where id = p_user_id
   returning streak, xp into v_new_streak, v_total_xp;

  -- Log event
  insert into public.events(user_id, type, category, meta, xp_impact)
  values (p_user_id, 'mission_completed', 'learning', 
          jsonb_build_object('date', p_date, 'amazingness_score', p_amazingness_score),
          v_xp_reward);

  -- Check for achievements
  perform public.check_achievements(p_user_id, v_new_streak, v_total_xp);
end; $$;

grant execute on function public.complete_mission(uuid, date, int, interval) to anon, authenticated;

-- 3. Check and award achievements
create or replace function public.check_achievements(
  p_user_id uuid,
  p_current_streak int,
  p_total_xp int
) returns void language plpgsql as $$
begin
  -- First lesson achievement
  if not exists (select 1 from public.achievements where user_id = p_user_id and achievement_type = 'first_lesson') then
    if exists (select 1 from public.missions where user_id = p_user_id and status = 'done') then
      insert into public.achievements(user_id, achievement_type, title, description, badge_icon, xp_bonus)
      values (p_user_id, 'first_lesson', '🎯 First Mission Complete', 'Completed your first AI learning mission', '🎯', 25);
      
      update public.profiles set xp = xp + 25 where id = p_user_id;
    end if;
  end if;

  -- Streak achievements
  if p_current_streak >= 3 and not exists (select 1 from public.achievements where user_id = p_user_id and achievement_type = 'streak_3') then
    insert into public.achievements(user_id, achievement_type, title, description, badge_icon, xp_bonus)
    values (p_user_id, 'streak_3', '🔥 3-Day Streak', 'Completed missions for 3 days in a row', '🔥', 50);
    update public.profiles set xp = xp + 50 where id = p_user_id;
  end if;

  if p_current_streak >= 7 and not exists (select 1 from public.achievements where user_id = p_user_id and achievement_type = 'streak_7') then
    insert into public.achievements(user_id, achievement_type, title, description, badge_icon, xp_bonus)
    values (p_user_id, 'streak_7', '🚀 Weekly Warrior', 'Completed missions for 7 days in a row', '🚀', 100);
    update public.profiles set xp = xp + 100 where id = p_user_id;
  end if;

  if p_current_streak >= 30 and not exists (select 1 from public.achievements where user_id = p_user_id and achievement_type = 'streak_30') then
    insert into public.achievements(user_id, achievement_type, title, description, badge_icon, xp_bonus)
    values (p_user_id, 'streak_30', '👑 Learning Legend', 'Completed missions for 30 days in a row', '👑', 500);
    update public.profiles set xp = xp + 500 where id = p_user_id;
  end if;
end; $$;

grant execute on function public.check_achievements(uuid, int, int) to anon, authenticated;

-- 4. Public leaderboard (SECURITY DEFINER to bypass RLS for aggregate)
create or replace function public.get_learning_leaderboard(
  limit_count int default 50
) returns table (
  user_id uuid,
  display_name text,
  total_xp bigint,
  current_streak int,
  missions_completed bigint,
  avg_amazingness decimal
) language sql security definer set search_path = public as $$
  select p.id as user_id,
         coalesce(p.display_name, 'Anonymous Learner') as display_name,
         coalesce(p.xp, 0) as total_xp,
         coalesce(p.streak, 0) as current_streak,
         count(m.*) filter (where m.status = 'done') as missions_completed,
         round(avg(m.amazingness_score), 1) as avg_amazingness
    from public.profiles p
    left join public.missions m on p.id = m.user_id
   group by p.id, p.display_name, p.xp, p.streak
   order by total_xp desc, current_streak desc, missions_completed desc
   limit limit_count;
$$;

grant execute on function public.get_learning_leaderboard(int) to anon, authenticated;

-- 5. Get referral leaderboard
create or replace function public.get_referral_leaderboard(
  limit_count int default 50
) returns table (
  referrer_id uuid,
  display_name text,
  referrals bigint,
  credit_cents bigint
) language sql security definer set search_path = public as $$
  select r.referrer_id,
         coalesce(p.display_name, 'Anonymous Referrer') as display_name,
         count(*) filter (where r.status = 'completed') as referrals,
         coalesce(sum(r.credit_cents), 0) as credit_cents
    from public.referrals r
    left join public.profiles p on r.referrer_id = p.id
   group by r.referrer_id, p.display_name
   order by referrals desc, credit_cents desc
   limit limit_count;
$$;

grant execute on function public.get_referral_leaderboard(int) to anon, authenticated;

-- 6. Generate daily mission for user
create or replace function public.generate_daily_mission(
  p_user_id uuid,
  p_date date default current_date
) returns jsonb language plpgsql as $$
declare
  v_user_profile record;
  v_mission_title text;
  v_mission_topic text;
  v_difficulty int;
begin
  -- Get user profile
  select * into v_user_profile from public.profiles where id = p_user_id;
  
  -- Generate mission based on user's path and level
  case v_user_profile.path
    when 'Builder' then
      v_mission_title := 'Build an AI Project Component';
      v_mission_topic := 'AI Development';
    when 'Automator' then 
      v_mission_title := 'Automate a Learning Process';
      v_mission_topic := 'AI Automation';
    when 'Deal-Maker' then
      v_mission_title := 'Explore AI Business Applications';
      v_mission_topic := 'AI Business Strategy';
    else
      v_mission_title := 'Discover AI Fundamentals';
      v_mission_topic := 'AI Basics';
  end case;

  -- Set difficulty based on user XP
  v_difficulty := case 
    when v_user_profile.xp < 100 then 1
    when v_user_profile.xp < 500 then 3
    when v_user_profile.xp < 1000 then 5
    when v_user_profile.xp < 2000 then 7
    else 9
  end;

  -- Create the mission
  perform public.ensure_mission_for_date(p_user_id, p_date, v_mission_title, v_mission_topic);
  
  -- Update mission with generated details
  update public.missions 
  set difficulty_level = v_difficulty,
      description = format('Personalized %s mission for your learning journey', v_mission_topic),
      xp_reward = 10 + (v_difficulty * 2)
  where user_id = p_user_id and date = p_date;

  return jsonb_build_object(
    'title', v_mission_title,
    'topic', v_mission_topic,
    'difficulty', v_difficulty,
    'xp_reward', 10 + (v_difficulty * 2)
  );
end; $$;

grant execute on function public.generate_daily_mission(uuid, date) to anon, authenticated;
