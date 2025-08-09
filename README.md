# AI Mind OS 🧠

The Operating S### 💎 Premium Features
- **Subscription Tiers** - Multiple pricing options via Stripe
- **Webhook Integration** - Automated subscription management
- **Advanced Briefings** - Premium intelligence reports
- **Priority Support** - Enhanced customer service
- **Advanced Analytics** - Detailed insights and reporting for Dangerous Thinkers.

## Overview

AI Mind OS is a comprehensive intelligence platform that combines AI-powered briefings, community-driven insights, gamified learning, and advanced analytics to help forward-thinking individuals and organizations stay ahead of the curve.

## Features

### 🎯 Core Intelligence
- **Daily AI Briefings**: Curated intelligence reports powered by OpenAI GPT-4
- **Live News Feed**: Real-time AI and technology news aggregation
- **Custom Intelligence**: Personalized briefings based on your interests

### 🌍 Community Intelligence
- **Submit Intel**: Share insights and discoveries with the community
- **AI Content Polish**: Automatic content enhancement using OpenAI
- **XP Rewards**: Earn experience points for valuable contributions
- **Telegram Notifications**: Real-time updates on community activity

### 🏆 Gamification
- **Leaderboards**: Track top contributors and engagement
- **XP System**: Experience points for various platform activities
- **Levels & Streaks**: Progressive advancement and daily engagement tracking
- **Badges**: Achievement system for milestones and contributions

### 📊 Analytics
- **Event Tracking**: Comprehensive user behavior analytics
- **Dashboard**: Visual insights into platform usage and engagement
- **Performance Metrics**: Track your progress and contributions

### 💎 Premium Features
- **Subscription Tiers**: Multiple pricing options via Stripe
- **Advanced Briefings**: Premium intelligence reports
- **Priority Support**: Enhanced customer service
- **Advanced Analytics**: Detailed insights and reporting

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **React Server Components** - Optimized performance

### Backend & Database
- **Supabase** - PostgreSQL database with real-time features
- **Row Level Security (RLS)** - Fine-grained access control
- **Server-Side Rendering (SSR)** - Supabase SSR client integration

### AI & Integrations
- **OpenAI GPT-4** - Content polishing and intelligence generation
- **Telegram Bot API** - Real-time notifications
- **Stripe** - Payment processing and subscriptions
- **News API** - Live news aggregation

### Infrastructure
- **Vercel** - Deployment and hosting
- **GitHub** - Version control and CI/CD
- **Environment Variables** - Secure configuration management

## Database Schema

### Core Tables
- `waitlist_entries` - User registrations and referral tracking
- `users` - User profiles and authentication
- `daily_lessons` - AI-generated intelligence briefings
- `community_intel` - User-submitted intelligence
- `xp_transactions` - Experience point tracking
- `analytics_events` - User behavior and engagement data

### Features
- **RLS Policies** - Secure data access
- **Triggers** - Automated data processing
- **Functions** - Custom database logic

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenAI API key
- Stripe account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/aimindos.git
   cd aimindos
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Configure your `.env.local`:
   ```bash
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Stripe
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
   
   # OpenAI
   OPENAI_API_KEY=sk-proj-your_openai_api_key
   
   # Telegram (optional)
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   TELEGRAM_CHAT_ID=your_telegram_chat_id
   
   # News API (optional)
   NEWS_API_KEY=your_news_api_key
   ```

4. **Set up the database**
   ```bash
   # Run the schema in your Supabase SQL editor
   cat supabase/schema.sql
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Endpoints

### `/api/waitlist` - Waitlist Management
- `POST` - Add user to waitlist with referral tracking
- Supports Supabase integration and mock mode

### `/api/intelligence` - AI Briefings
- `GET` - Fetch daily briefings and live news
- Powered by OpenAI and News API

### `/api/submit-intel` - Community Submissions
- `POST` - Submit community intelligence
- AI content polishing with OpenAI
- XP rewards and Telegram notifications

### `/api/leaderboard` - Gamification
- `GET` - Fetch user rankings and stats
- XP, levels, streaks, and badges

### `/api/analytics` - Analytics & Insights
- `GET` - Fetch analytics dashboard data
- `POST` - Track user events and behavior

### `/api/lessons/complete` - Learning Progress
- `POST` - Award XP for lesson completion
- XP rewards with streak bonuses and N8N integration

### `/api/stripe/webhook` - Subscription Management
- `POST` - Handle Stripe webhook events
- Automated subscription lifecycle management

## Development Features

### Mock Mode
All APIs support mock mode for development and testing:
- Automatic fallback when external services aren't configured
- Realistic mock data for full feature testing
- Console logging for debugging

### Error Handling
- Comprehensive error catching and logging
- User-friendly error messages
- Graceful fallbacks for external service failures

### Type Safety
- Full TypeScript implementation
- Strict type checking
- API response typing

## Deployment

### Vercel Deployment
1. **Connect to GitHub**
   - Link your repository to Vercel
   - Configure automatic deployments

2. **Environment Variables**
   - Add all production environment variables
   - Ensure Supabase URLs use production endpoints

3. **Custom Domain**
   - Configure your custom domain in Vercel
   - Update CORS settings in Supabase

### Database Setup
1. **Production Supabase**
   - Create production Supabase project
   - Run schema.sql in production
   - Configure RLS policies

2. **Stripe Configuration**
   - Set up production Stripe account
   - Configure webhooks for subscription management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is proprietary software. All rights reserved.

## Contact

- **Email**: hello@aimindos.com
- **Twitter**: [@aimindos](https://twitter.com/aimindos)
- **Website**: [aimindos.com](https://aimindos.com)

## Founder

**Brandy Pruitt** - CEO & Founder
- Building the future of AI-powered intelligence platforms
- Dangerous thinking, systematic execution
