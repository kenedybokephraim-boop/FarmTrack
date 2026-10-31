# FarmTrack - Poultry Farm Management App

> A Progressive Web App designed for Nigerian poultry farmers to digitize farm operations, make data-driven decisions, and optimize productivity.

[![Next.js](https://img.shields.io/badge/Next.js-16.2.2-black)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2.4-blue)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20Database-green)](https://supabase.io)
[![PWA](https://img.shields.io/badge/PWA-Enabled-green)](https://web.dev/progressive-web-apps)

## 🎯 Problem Statement

Traditional poultry farming in Nigeria relies on paper records which are:
- Prone to loss/damage during rainy seasons
- Difficult to analyze for trends and insights
- Inaccessible when farmers are away from the farm
- Unable to provide early warnings for disease outbreaks

## 💡 Solution

FarmTrack provides a mobile-first web application that:
- Works offline via Progressive Web App (PWA) technology
- Tracks daily metrics: feed usage, mortality, egg production, and sales
- Provides AI-powered insights specific to Nigerian market conditions
- Generates proactive alerts for mortality spikes and production drops
- Is installable on low-end Android devices without Play Store dependency

## ✨ Features

### Core Features
- 📊 Dashboard with stats cards and weekly charts
- 📝 Daily Logs for feed, mortality, production, sales
- 🐔 Batch Management for multiple flocks
- 💰 Expenses tracking
- 📦 Inventory management
- 🤖 AI Consultant powered by Gemini API
- ⚠️ Smart Alerts for mortality/production issues

### Technical Features
- **PWA Support**: Installable on mobile devices with offline capability
- **Demo Mode**: Try the app without creating an account
- **Real-time Auth**: Supabase authentication with email verification
- **Responsive Design**: Mobile-first with Tailwind CSS

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16.2.2 (App Router) |
| Language | TypeScript 5 |
| UI Library | React 19 |
| Styling | Tailwind CSS 4 |
| Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth |
| AI | Google Gemini 1.5 Flash |
| Charts | Recharts |

## 🚀 Installation

1. Clone and install:
```bash
git clone <repo>
npm install
```

2. Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
NEXT_PUBLIC_GEMINI_API_KEY=your-key
```

3. Run dev server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## 📂 Project Structure

```
├── app/
│   ├── page.tsx              # Landing page with hero section
│   ├── layout.tsx            # Root layout with PWA meta tags
│   ├── dashboard/            # Main dashboard
│   ├── login/                # Authentication
│   ├── register/             # User registration
│   ├── batches/              # Flock management
│   ├── expenses/             # Financial tracking
│   ├── inventory/            # Stock management
│   └── ~offline/             # Offline fallback page
├── components/
│   ├── dashboard/
│   │   ├── StatsCards.tsx    # Metric cards (Revenue, Loss, Yield)
│   │   ├── AIAlerts.tsx     # Alert notifications
│   │   ├── AIConsultant.tsx # AI chat interface
│   │   └── WeeklyPoultryChart.tsx # Production chart
│   ├── forms/
│   │   └── DailyLogForm.tsx  # Daily record input
│   └── ui/                   # Reusable components
├── hooks/
│   ├── useAuth.ts            # Authentication logic
│   ├── useFarmData.ts        # Data fetching hooks
│   └── useAI.ts              # AI integration
├── lib/
│   ├── supabase.ts           # Supabase client
│   └── api/                  # API functions for each entity
└── types/
    └── index.ts              # TypeScript types
```

## 🗄️ Database Schema

```sql
-- Farmers table
farmers (id, email, phone, name, farm_type, created_at)

-- Daily records
daily_records (id, farmer_id, feed_bags_used, feed_cost, mortality_count,
               production_amt, sales_amount, record_date, created_at)

-- Batches (flocks)
batches (id, farmer_id, batch_name, animal_type, initial_count,
        current_count, acquired_date, created_at)

-- Expenses
expenses (id, farmer_id, category, description, amount, expense_date)

-- Inventory
inventory (id, farmer_id, item_name, quantity, reorder_level, created_at)

-- Alerts
ai_alerts (id, farmer_id, alert_type, title, message, severity, is_read)
```

## 🚢 Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Supabase Setup

1. Create new Supabase project
2. Run migration SQL for tables above
3. Enable email authentication
4. Configure email templates with redirect URL

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for learning and commercial purposes.