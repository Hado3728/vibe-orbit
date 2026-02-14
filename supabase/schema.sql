-- Enable Extensions
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- USERS TABLE
create table public.users (
  id uuid references auth.users(id) on delete cascade not null primary key,
  username text unique,
  age int,
  interests text[],
  quiz_answers int[],
  onboarded boolean default false,
  age_verified boolean default false,
  is_admin boolean default false,
  created_at timestamptz default now()
);

-- ROOMS TABLE
create table public.rooms (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  tags text[],
  created_at timestamptz default now()
);

-- ROOM MEMBERS TABLE
create table public.room_members (
  user_id uuid references public.users(id) on delete cascade not null,
  room_id uuid references public.rooms(id) on delete cascade not null,
  joined_at timestamptz default now(),
  primary key (user_id, room_id)
);

-- MESSAGES TABLE
create table public.messages (
  id bigint generated always as identity primary key,
  room_id uuid references public.rooms(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  text text not null,
  timestamp timestamptz default now(),
  flagged boolean default false
);

-- CONNECT REQUESTS TABLE
create table public.connect_requests (
  id uuid default gen_random_uuid() primary key,
  from_user uuid references public.users(id) on delete cascade not null,
  to_user uuid references public.users(id) on delete cascade not null,
  status text check (status in ('pending', 'accepted', 'rejected')) default 'pending',
  created_at timestamptz default now()
);

-- PRIVATE MESSAGES TABLE
create table public.private_messages (
  id bigint generated always as identity primary key,
  user_a uuid references public.users(id) on delete cascade not null,
  user_b uuid references public.users(id) on delete cascade not null,
  text text not null,
  timestamp timestamptz default now()
);

-- REPORTS TABLE
create table public.reports (
  id uuid default gen_random_uuid() primary key,
  reporter_id uuid references public.users(id) on delete cascade not null,
  reported_id uuid references public.users(id) on delete cascade not null,
  message_id bigint references public.messages(id) on delete set null,
  reason text not null,
  note text,
  resolved boolean default false,
  timestamp timestamptz default now()
);

-- INDEXES FOR PERFORMANCE
create index on public.room_members(room_id);
create index on public.messages(room_id);
create index on public.messages(user_id);

-- ENABLE RLS
alter table public.users enable row level security;
alter table public.rooms enable row level security;
alter table public.room_members enable row level security;
alter table public.messages enable row level security;
alter table public.connect_requests enable row level security;
alter table public.private_messages enable row level security;
alter table public.reports enable row level security;

-- USERS POLICIES
create policy "Users can read own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

create policy "Users can read limited public profile"
  on public.users for select
  using (
    auth.uid() = id
    OR (
      username is not null
      AND interests is not null
    )
  );

-- ROOMS POLICIES
create policy "Authenticated users can read rooms"
  on public.rooms for select
  using (auth.role() = 'authenticated');

-- ROOM MEMBERS POLICIES
create policy "Users can read memberships they are involved in"
  on public.room_members for select
  using (auth.uid() = user_id);

create policy "Users can join rooms"
  on public.room_members for insert
  with check (auth.uid() = user_id);

-- MESSAGES POLICIES
create policy "Users can read messages in rooms they belong to"
  on public.messages for select
  using (
    exists (
      select 1 from public.room_members
      where room_members.room_id = messages.room_id
      and room_members.user_id = auth.uid()
    )
  );

create policy "Users can insert messages in rooms they belong to"
  on public.messages for insert
  with check (
    exists (
      select 1 from public.room_members
      where room_members.room_id = messages.room_id
      and room_members.user_id = auth.uid()
    )
  );

-- CONNECT REQUESTS POLICIES
create policy "Users can read their own connect requests"
  on public.connect_requests for select
  using (auth.uid() = from_user or auth.uid() = to_user);

create policy "Users can insert connect requests"
  on public.connect_requests for insert
  with check (auth.uid() = from_user);

create policy "Users can update requests sent to them"
  on public.connect_requests for update
  using (auth.uid() = to_user);

-- PRIVATE MESSAGES POLICIES
create policy "Users can read their private messages"
  on public.private_messages for select
  using (auth.uid() = user_a or auth.uid() = user_b);

create policy "Users can send PM only as themselves"
  on public.private_messages for insert
  with check (
    auth.uid() = user_a
    and user_a <> user_b
  );

-- REPORTS POLICIES
create policy "Users can insert reports"
  on public.reports for insert
  with check (auth.uid() = reporter_id);

create policy "Admin can read all reports"
  on public.reports for select
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid() and users.is_admin = true
    )
  );

create policy "Admin can update reports"
  on public.reports for update
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid() and users.is_admin = true
    )
  );
