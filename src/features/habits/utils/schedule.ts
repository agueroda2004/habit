import { DAY_SHORT } from "../../../shared/constants/days";
import type { HabitWithSchedule } from "../../../types/habit";

/**
 * Determina si un hábito "toca" en una fecha dada, considerando:
 * - Rango de fechas (start_date / end_date)
 * - Frecuencia diaria o días seleccionados
 */
export function isScheduledOn(
  habit: Pick<HabitWithSchedule, "start_date" | "end_date" | "schedule">,
  dateISO: string,
): boolean {
  if (dateISO < habit.start_date) return false;
  if (habit.end_date && dateISO > habit.end_date) return false;

  const schedule = habit.schedule;
  if (!schedule || schedule.frequency_type === "daily") return true;

  const [y, m, d] = dateISO.split("-").map(Number);
  const weekday = new Date(y, (m ?? 1) - 1, d ?? 1).getDay();
  return schedule.days_of_week.includes(weekday);
}

const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

export function formatScheduleLabel(
  habit: Pick<HabitWithSchedule, "schedule">,
): string {
  const schedule = habit.schedule;
  if (!schedule || schedule.frequency_type === "daily") return "Todos los días";

  const sorted = [...schedule.days_of_week].sort(
    (a, b) => WEEK_ORDER.indexOf(a) - WEEK_ORDER.indexOf(b),
  );
  return sorted.map((d) => DAY_SHORT[d] ?? "").join(" · ");
}
