import { supabase } from "../../../lib/supabase/client";
import type { HabitLog } from "../../../types/habit";

export async function fetchLogs(date: string): Promise<HabitLog[]> {
  const { data, error } = await supabase
    .from("habit_logs")
    .select("*")
    .eq("date", date);
  if (error) throw error;
  return data ?? [];
}

export async function fetchLogsRange(from: string, to: string): Promise<HabitLog[]> {
  const { data, error } = await supabase
    .from("habit_logs")
    .select("*")
    .gte("date", from)
    .lte("date", to);
  if (error) throw error;
  return data ?? [];
}

export async function upsertLog(input: {
  habit_id: string;
  date: string;
  value: number | null;
  completed: boolean;
  skipped?: boolean;
}): Promise<void> {
  const { error } = await supabase
    .from("habit_logs")
    .upsert(input, { onConflict: "habit_id,date" });
  if (error) throw error;
}

/**
 * Acumula un delta sobre el valor del día del hábito.
 * newValue = currentValue + delta (mínimo 0).
 * completed = newValue >= target_value (si target existe).
 * Al registrar progreso se limpia el estado skipped.
 */
export async function accumulateLog(input: {
  habit_id: string;
  date: string;
  currentValue: number;
  delta: number;
  target_value: number | null;
}): Promise<void> {
  const newValue = Math.max(0, input.currentValue + input.delta);
  const completed =
    input.target_value != null ? newValue >= input.target_value : newValue > 0;
  await upsertLog({
    habit_id: input.habit_id,
    date: input.date,
    value: newValue,
    completed,
    skipped: false,
  });
}

/**
 * Marca o desmarca un hábito como "saltado" en una fecha.
 * Un día saltado no rompe rachas ni baja el completion rate.
 */
export async function setSkipped(input: {
  habit_id: string;
  date: string;
  skipped: boolean;
}): Promise<void> {
  const { error } = await supabase
    .from("habit_logs")
    .upsert(
      {
        habit_id: input.habit_id,
        date: input.date,
        value: 0,
        completed: false,
        skipped: input.skipped,
      },
      { onConflict: "habit_id,date" },
    );
  if (error) throw error;
}
