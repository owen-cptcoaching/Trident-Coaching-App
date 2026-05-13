-- Execute this file in your Supabase SQL Editor to set up the database schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES (Users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  role text check(role in ('client', 'coach', 'head_coach')) default 'client',
  name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- HELPER FUNCTIONS FOR RLS
create or replace function public.get_user_role()
returns text as $$
  select role from public.profiles where id = auth.uid();
$$ language sql security definer;

create or replace function public.is_head_coach()
returns boolean as $$
  select public.get_user_role() = 'head_coach';
$$ language sql security definer;


-- USER STATS
create table public.user_stats (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  age integer,
  weight numeric,
  height numeric,
  gender text,
  activity_level text,
  goal text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- COACHING PLANS
create table public.coaching_plans (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  training_program jsonb,
  nutrition_plan jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CLIENT RELATIONS (Assigning clients to coaches)
create table public.coach_clients (
  id uuid default uuid_generate_v4() primary key,
  coach_id uuid references public.profiles(id) on delete cascade not null,
  client_id uuid references public.profiles(id) on delete cascade not null,
  status text default 'pending',
  plan_type text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(coach_id, client_id)
);


-- ROW LEVEL SECURITY (RLS)

-- Profiles: Users can read and update their own profile. Coaches can read all profiles of their clients.
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Coaches can view their clients' profiles" on public.profiles for select using (
  exists (
    select 1 from public.coach_clients cc 
    where cc.coach_id = auth.uid() and cc.client_id = public.profiles.id
  )
);
create policy "Head coaches can view any profile" on public.profiles for select using (
  public.is_head_coach()
);

-- User Stats: Users can CRUD their own stats. Coaches can read stats of their clients.
alter table public.user_stats enable row level security;
create policy "Users can manage own stats" on public.user_stats for all using (auth.uid() = user_id);
create policy "Coaches can view clients' stats" on public.user_stats for select using (
  exists (
    select 1 from public.coach_clients cc 
    where cc.coach_id = auth.uid() and cc.client_id = public.user_stats.user_id
  )
);
create policy "Head coaches can view any stats" on public.user_stats for select using (
  public.is_head_coach()
);

-- Coaching Plans: Users can view their plans. Coaches can CRUD plans for their clients.
alter table public.coaching_plans enable row level security;
create policy "Users can view own plans" on public.coaching_plans for select using (auth.uid() = user_id);
create policy "Users can manage own plans if they generate them" on public.coaching_plans for insert with check (auth.uid() = user_id); 
create policy "Coaches can manage clients' plans" on public.coaching_plans for all using (
  exists (
    select 1 from public.coach_clients cc 
    where cc.coach_id = auth.uid() and cc.client_id = public.coaching_plans.user_id
  )
);

-- Coach Clients: Coaches can manage their assignments. Clients can view their assignments.
alter table public.coach_clients enable row level security;
create policy "Coaches can manage their assignments" on public.coach_clients for all using (auth.uid() = coach_id);
create policy "Clients can view their assignments" on public.coach_clients for select using (auth.uid() = client_id);
create policy "Head coaches can view all assignments" on public.coach_clients for select using (
  public.is_head_coach()
);

-- AUTO CREATE PROFILE TRIGGER
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', 'client');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
