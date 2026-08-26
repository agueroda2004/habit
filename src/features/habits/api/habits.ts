import { supabase } from "../../../lib/supabase/client";
import type {
  Habit,
  HabitInput,
  HabitSchedule,
  HabitUpdate,
  ScheduleInput,
} from "../../../types/habit";

export async function fetchHabits(includeArchived: boolean): Promise<Habit[]> {
  let query = supabase.from("habits").select("*");
  if (includeArchived) {
    query = query.order("created_at", { ascending: true });
  } else {
    query = query.is("archived_at", null).order("created_at", { ascending: true });
  }
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function fetchSchedules(): Promise<HabitSchedule[]> {
  const { data, error } = await supabase.from("habit_schedules").select("*");
  if (error) throw error;
  return data ?? [];
}

export async function createHabitWithSchedule(input: {
  habit: HabitInput;
  schedule: Omit<ScheduleInput, "habit_id">;
}): Promise<Habit> {
  const { data: habit, error: habitError } = await supabase
    .from("habits")
    .insert(input.habit)
    .select()
    .single();
  if (habitError) throw habitError;

  const { error: scheduleError } = await supabase.from("habit_schedules").insert({
    ...input.schedule,
    habit_id: habit.id,
  });
  if (scheduleError) throw scheduleError;

  return habit;
}

export async function updateHabitWithSchedule(input: {
  id: string;
  habit: HabitUpdate;
  schedule: Omit<ScheduleInput, "habit_id">;
}): Promise<void> {
  const { error: habitError } = await supabase
    .from("habits")
    .update(input.habit)
    .eq("id", input.id);
  if (habitError) throw habitError;

  const { error: scheduleError } = await supabase
    .from("habit_schedules")
    .upsert({ ...input.schedule, habit_id: input.id }, { onConflict: "habit_id" });
  if (scheduleError) throw scheduleError;
}

export async function archiveHabit(id: string): Promise<void> {
  const { error } = await supabase
    .from("habits")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function restoreHabit(id: string): Promise<void> {
  const { error } = await supabase
    .from("habits")
    .update({ archived_at: null })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteHabitPermanently(id: string): Promise<void> {
  const { error } = await supabase.from("habits").delete().eq("id", id);
  if (error) throw error;
}
