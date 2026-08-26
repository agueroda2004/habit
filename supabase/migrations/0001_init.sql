-- =============================================================
-- Habit Tracker V1 — Inicialización
-- Ejecutar en el SQL Editor de Supabase (proyecto existente)
-- =============================================================

-- ------------------------------------------------------------------
-- Tabla: categories_habit
-- Nombre elegido para no colisionar con la tabla `categories` existente.
-- ------------------------------------------------------------------
create table public.categories_habit (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  icon text,
  color text not null default '#10b981',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------------
-- Tabla: habits
-- ------------------------------------------------------------------
create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category_id uuid references public.categories_habit (id) on delete set null,
  name text not null,
  description text,
  icon text,
  color text not null default '#10b981',
  type text not null default 'boolean' check (type in ('boolean', 'numeric', 'duration')),
  target_value numeric,
  unit text,
  start_date date not null default current_date,
  end_date date,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date is null or end_date >= start_date)
);

-- ------------------------------------------------------------------
-- Tabla: habit_schedules
-- V1: un schedule por hábito (unique habit_id).
-- days_of_week: arreglo 0 (Domingo) .. 6 (Sábado).
-- ------------------------------------------------------------------
create table public.habit_schedules (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null unique references public.habits (id) on delete cascade,
  frequency_type text not null default 'daily' check (frequency_type in ('daily', 'weekly')),
  days_of_week smallint[] not null default '{0,1,2,3,4,5,6}',
  reminder_time time,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------------
-- Tabla: habit_logs
-- UNIQUE(habit_id, date) evita registrar el mismo hábito dos veces
-- para la misma fecha.
-- ------------------------------------------------------------------
create table public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits (id) on delete cascade,
  date date not null,
  value numeric,
  completed boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (habit_id, date)
);

-- ------------------------------------------------------------------
-- Índices
-- ------------------------------------------------------------------
create index idx_categories_habit_user on public.categories_habit (user_id);
create index idx_habits_user on public.habits (user_id);
create index idx_habits_user_archived on public.habits (user_id, archived_at);
create index idx_habits_category on public.habits (category_id);
create index idx_habit_logs_habit_date on public.habit_logs (habit_id, date);

-- ------------------------------------------------------------------
-- Trigger para actualizar updated_at automáticamente
-- ------------------------------------------------------------------
create or replace function public.set_updated_at ()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger categories_habit_set_updated_at
  before update on public.categories_habit
  for each row execute function public.set_updated_at ();

create trigger habits_set_updated_at
  before update on public.habits
  for each row execute function public.set_updated_at ();

create trigger habit_schedules_set_updated_at
  before update on public.habit_schedules
  for each row execute function public.set_updated_at ();

create trigger habit_logs_set_updated_at
  before update on public.habit_logs
  for each row execute function public.set_updated_at ();

-- ------------------------------------------------------------------
-- Row Level Security
-- Todas las políticas dependen de auth.uid().
-- ------------------------------------------------------------------
alter table public.categories_habit enable row level security;
alter table public.habits enable row level security;
alter table public.habit_schedules enable row level security;
alter table public.habit_logs enable row level security;

-- categories_habit
create policy "categories_habit select own"
  on public.categories_habit for select
  using (auth.uid() = user_id);

create policy "categories_habit insert own"
  on public.categories_habit for insert
  with check (auth.uid() = user_id);

create policy "categories_habit update own"
  on public.categories_habit for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "categories_habit delete own"
  on public.categories_habit for delete
  using (auth.uid() = user_id);

-- habits
create policy "habits select own"
  on public.habits for select
  using (auth.uid() = user_id);

create policy "habits insert own"
  on public.habits for insert
  with check (auth.uid() = user_id);

create policy "habits update own"
  on public.habits for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "habits delete own"
  on public.habits for delete
  using (auth.uid() = user_id);

-- habit_schedules (a través de habits)
create policy "habit_schedules select own"
  on public.habit_schedules for select
  using (exists (
    select 1 from public.habits h
    where h.id = habit_id and h.user_id = auth.uid()
  ));

create policy "habit_schedules insert own"
  on public.habit_schedules for insert
  with check (exists (
    select 1 from public.habits h
    where h.id = habit_id and h.user_id = auth.uid()
  ));

create policy "habit_schedules update own"
  on public.habit_schedules for update
  using (exists (
    select 1 from public.habits h
    where h.id = habit_id and h.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.habits h
    where h.id = habit_id and h.user_id = auth.uid()
  ));

create policy "habit_schedules delete own"
  on public.habit_schedules for delete
  using (exists (
    select 1 from public.habits h
    where h.id = habit_id and h.user_id = auth.uid()
  ));

-- habit_logs (a través de habits)
create policy "habit_logs select own"
  on public.habit_logs for select
  using (exists (
    select 1 from public.habits h
    where h.id = habit_id and h.user_id = auth.uid()
  ));

create policy "habit_logs insert own"
  on public.habit_logs for insert
  with check (exists (
    select 1 from public.habits h
    where h.id = habit_id and h.user_id = auth.uid()
  ));

create policy "habit_logs update own"
  on public.habit_logs for update
  using (exists (
    select 1 from public.habits h
    where h.id = habit_id and h.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.habits h
    where h.id = habit_id and h.user_id = auth.uid()
  ));

create policy "habit_logs delete own"
  on public.habit_logs for delete
  using (exists (
    select 1 from public.habits h
    where h.id = habit_id and h.user_id = auth.uid()
  ));
