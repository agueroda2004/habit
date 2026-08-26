-- =============================================================
-- Habit Tracker — Feature: Skip
-- Añade el campo skipped a habit_logs para marcar días saltados
-- conscientemente (prioridad, familia, etc.) sin romper rachas
-- ni bajar el completion rate.
-- =============================================================

alter table public.habit_logs
  add column skipped boolean not null default false;
