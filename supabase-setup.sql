-- FarmPulse Database Setup Script
-- Run this in Supabase SQL Editor in order: 1) Create Tables first, 2) Run RLS policies
-- 
-- NOTE: This setup is strictly for Poultry farming.
-- The farmers.id column is a UUID REFERENCES auth.users(id),
-- which is why RLS policies compare auth.uid() = id directly (no ::text cast needed).

-- ============================================
-- PART 1: CREATE TABLES
-- ============================================

-- Farmers table (links to auth.users via UUID primary key)
create table if not exists public.farmers (
  id uuid not null primary key references auth.users(id),
  full_name text,
  email text,
  bird_types text[] default ARRAY['Layers']::text[], -- Stores ['Layers'], ['Broilers'], or ['Layers', 'Broilers']
  farm_type text default 'Poultry',
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

comment on table public.farmers is 'Poultry-focused farmer profiles linked to auth.users';

-- Daily Records table
create table if not exists public.daily_records (
  id uuid not null default gen_random_uuid() primary key,
  farmer_id uuid not null references public.farmers(id),
  feed_bags_used numeric default 0,
  feed_cost numeric default 0,
  mortality_count numeric default 0,
  production_amt numeric default 0,
  egg_sales_amount numeric default 0,
  bird_sales_amount numeric default 0,
  manure_sales_amount numeric default 0,
  sales_amount numeric default 0,
  notes text,
  record_date date not null,
  created_at timestamptz not null default now()
);

alter table public.daily_records add column if not exists egg_sales_amount numeric default 0;
alter table public.daily_records add column if not exists bird_sales_amount numeric default 0;
alter table public.daily_records add column if not exists manure_sales_amount numeric default 0;

-- Health Logs table
create table if not exists public.health_logs (
  id uuid not null default gen_random_uuid() primary key,
  farmer_id uuid not null references public.farmers(id),
  action text not null,
  details text,
  cost numeric default 0,
  record_date date not null,
  created_at timestamptz not null default now()
);

-- Expenses table
create table if not exists public.expenses (
  id uuid not null default gen_random_uuid() primary key,
  farmer_id uuid not null references public.farmers(id),
  category text not null,
  description text,
  amount numeric not null,
  expense_date date not null,
  created_at timestamptz not null default now()
);

-- Batches table
create table if not exists public.batches (
  id uuid not null default gen_random_uuid() primary key,
  farmer_id uuid not null references public.farmers(id),
  batch_name text,
  animal_type text,
  initial_count numeric not null,
  current_count numeric not null,
  acquired_date date not null,
  created_at timestamptz not null default now()
);

-- Inventory table
create table if not exists public.inventory (
  id uuid not null default gen_random_uuid() primary key,
  farmer_id uuid not null references public.farmers(id),
  item_name text not null,
  quantity numeric default 0,
  unit text,
  reorder_level numeric,
  created_at timestamptz not null default now()
);

-- AI Alerts table
create table if not exists public.ai_alerts (
  id uuid not null default gen_random_uuid() primary key,
  farmer_id uuid not null references public.farmers(id),
  alert_type text not null,
  title text not null,
  message text not null,
  severity text default 'info',
  is_read boolean default false,
  created_at timestamptz not null default now()
);

-- ============================================
-- PART 2: ENABLE RLS
-- ============================================

alter table public.farmers enable row level security;
alter table public.daily_records enable row level security;
alter table public.health_logs enable row level security;
alter table public.expenses enable row level security;
alter table public.batches enable row level security;
alter table public.inventory enable row level security;
alter table public.ai_alerts enable row level security;

-- Allow authenticated users to read auth.users for lookups
alter table auth.users enable row level security;
create policy "Allow authenticated users to read own user data" on auth.users
  for select using (auth.uid() = id);

-- ============================================
-- PART 3: RLS POLICIES
-- ============================================
-- No ::text casts needed — farmers.id is UUID which matches auth.uid() natively.

-- Farmers policies (id is UUID, matches auth.uid() directly)
drop policy if exists "Farmers can view own data" on public.farmers;
create policy "Farmers can view own data" on public.farmers
  for select using (auth.uid() = id);

drop policy if exists "Farmers can insert own data" on public.farmers;
create policy "Farmers can insert own data" on public.farmers
  for insert with check (auth.uid() = id);

drop policy if exists "Farmers can update own data" on public.farmers;
create policy "Farmers can update own data" on public.farmers
  for update using (auth.uid() = id);

-- Daily records policies
drop policy if exists "Farmers can view own daily records" on public.daily_records;
create policy "Farmers can view own daily records" on public.daily_records
  for select using (auth.uid() = farmer_id);

drop policy if exists "Farmers can insert own daily records" on public.daily_records;
create policy "Farmers can insert own daily records" on public.daily_records
  for insert with check (auth.uid() = farmer_id);

drop policy if exists "Farmers can delete own daily records" on public.daily_records;
create policy "Farmers can delete own daily records" on public.daily_records
  for delete using (auth.uid() = farmer_id);

-- Health logs policies
drop policy if exists "Farmers can view own health logs" on public.health_logs;
create policy "Farmers can view own health logs" on public.health_logs
  for select using (auth.uid() = farmer_id);

drop policy if exists "Farmers can insert own health logs" on public.health_logs;
create policy "Farmers can insert own health logs" on public.health_logs
  for insert with check (auth.uid() = farmer_id);

drop policy if exists "Farmers can delete own health logs" on public.health_logs;
create policy "Farmers can delete own health logs" on public.health_logs
  for delete using (auth.uid() = farmer_id);

-- Expenses policies
drop policy if exists "Farmers can view own expenses" on public.expenses;
create policy "Farmers can view own expenses" on public.expenses
  for select using (auth.uid() = farmer_id);

drop policy if exists "Farmers can insert own expenses" on public.expenses;
create policy "Farmers can insert own expenses" on public.expenses
  for insert with check (auth.uid() = farmer_id);

drop policy if exists "Farmers can delete own expenses" on public.expenses;
create policy "Farmers can delete own expenses" on public.expenses
  for delete using (auth.uid() = farmer_id);

-- Batches policies
drop policy if exists "Farmers can view own batches" on public.batches;
create policy "Farmers can view own batches" on public.batches
  for select using (auth.uid() = farmer_id);

drop policy if exists "Farmers can insert own batches" on public.batches;
create policy "Farmers can insert own batches" on public.batches
  for insert with check (auth.uid() = farmer_id);

drop policy if exists "Farmers can update own batches" on public.batches;
create policy "Farmers can update own batches" on public.batches
  for update using (auth.uid() = farmer_id);

drop policy if exists "Farmers can delete own batches" on public.batches;
create policy "Farmers can delete own batches" on public.batches
  for delete using (auth.uid() = farmer_id);

-- Inventory policies
drop policy if exists "Farmers can view own inventory" on public.inventory;
create policy "Farmers can view own inventory" on public.inventory
  for select using (auth.uid() = farmer_id);

drop policy if exists "Farmers can insert own inventory" on public.inventory;
create policy "Farmers can insert own inventory" on public.inventory
  for insert with check (auth.uid() = farmer_id);

drop policy if exists "Farmers can update own inventory" on public.inventory;
create policy "Farmers can update own inventory" on public.inventory
  for update using (auth.uid() = farmer_id);

drop policy if exists "Farmers can delete own inventory" on public.inventory;
create policy "Farmers can delete own inventory" on public.inventory
  for delete using (auth.uid() = farmer_id);

-- AI Alerts policies
drop policy if exists "Farmers can view own alerts" on public.ai_alerts;
create policy "Farmers can view own alerts" on public.ai_alerts
  for select using (auth.uid() = farmer_id);

drop policy if exists "Farmers can insert own alerts" on public.ai_alerts;
create policy "Farmers can insert own alerts" on public.ai_alerts
  for insert with check (auth.uid() = farmer_id);

drop policy if exists "Farmers can update own alerts" on public.ai_alerts;
create policy "Farmers can update own alerts" on public.ai_alerts
  for update using (auth.uid() = farmer_id);

drop policy if exists "Farmers can delete own alerts" on public.ai_alerts;
create policy "Farmers can delete own alerts" on public.ai_alerts
  for delete using (auth.uid() = farmer_id);

-- ============================================
-- PART 4: CREATE INDEXES
-- ============================================

create index if not exists idx_daily_records_farmer_id on public.daily_records(farmer_id);
create index if not exists idx_daily_records_record_date on public.daily_records(record_date);
create index if not exists idx_health_logs_farmer_id on public.health_logs(farmer_id);
create index if not exists idx_expenses_farmer_id on public.expenses(farmer_id);
create index if not exists idx_batches_farmer_id on public.batches(farmer_id);
create index if not exists idx_inventory_farmer_id on public.inventory(farmer_id);
create index if not exists idx_ai_alerts_farmer_id on public.ai_alerts(farmer_id);
create index if not exists idx_farmers_id on public.farmers(id);

-- ============================================
-- PART 5: AUTH TRIGGER (auto-create farmer on signup)
-- ============================================

-- Create a function to auto-create farmer profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.farmers (id, email, full_name, farm_type, bird_types)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    'Poultry',
    ARRAY['Layers']::text[]
  );
  return new;
end;
$$ language plpgsql security definer;

-- Create the trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();