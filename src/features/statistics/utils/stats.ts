import type { HabitLog } from "../../../types/habit";
import type { HabitWithCategory } from "../../../types/habit";
import { addDaysISO, daysBetween, todayISO } from "../../../shared/utils/dates";
import { isScheduledOn } from "../../habits/utils/schedule";

function scheduledDatesInRange(habit: HabitWithCategory, from: string, to: string): string[] {
  const dates: string[] = [];
  const start = habit.start_date > from ? habit.start_date : from;
  const end = habit.end_date && habit.end_date < to ? habit.end_date : to;
  const total = daysBetween(start, end);
  for (let i = 0; i <= total; i++) {
    const d = addDaysISO(start, i);
    if (isScheduledOn(habit, d)) dates.push(d);
  }
  return dates;
}

export type HabitStreak = {
  current: number;
  best: number;
  completionRate: number;
};

/**
 * Calcula rachas y tasa de cumplimiento de un hábito según su frecuencia.
 * Los días con `skipped = true` son neutros: no cuentan en el completion rate
 * ni rompen la racha actual.
 */
export function computeHabitStreak(
  habit: HabitWithCategory,
  logs: HabitLog[],
  lookbackDays = 365,
): HabitStreak {
  const habitLogs = logs.filter((l) => l.habit_id === habit.id);
  const completedMap = new Map(
    habitLogs.filter((l) => l.completed).map((l) => [l.date, true]),
  );
  const skippedMap = new Map(
    habitLogs.filter((l) => l.skipped).map((l) => [l.date, true]),
  );

  const today = todayISO();
  const from = addDaysISO(today, -lookbackDays);
  const scheduled = scheduledDatesInRange(habit, from, today);
  const nonSkipped = scheduled.filter((d) => !skippedMap.has(d));
  const completedCount = nonSkipped.filter((d) => completedMap.has(d)).length;
  const completionRate =
    nonSkipped.length > 0
      ? Math.round((completedCount / nonSkipped.length) * 100)
      : 0;

  let best = 0;
  let run = 0;
  for (const date of scheduled) {
    if (completedMap.has(date)) {
      run += 1;
      if (run > best) best = run;
    } else if (skippedMap.has(date)) {
      // Neutro: no rompe la racha ni la incrementa.
    } else {
      run = 0;
    }
  }

  let current = 0;
  const lastScheduled = scheduled[scheduled.length - 1];

  if (scheduled.length > 0) {
    let startIndex = scheduled.length - 1;

    const lastCompleted = lastScheduled ? completedMap.has(lastScheduled) : false;
    const lastSkipped = lastScheduled ? skippedMap.has(lastScheduled) : false;
    const lastPending = !lastCompleted && !lastSkipped;

    if (lastScheduled === today && lastPending) {
      // Hoy aún no marcado: la racha puede continuar.
      startIndex -= 1;
    } else if (lastScheduled !== today && lastPending) {
      startIndex = -1;
    }

    for (let i = startIndex; i >= 0; i--) {
      if (completedMap.has(scheduled[i])) {
        current += 1;
      } else if (skippedMap.has(scheduled[i])) {
        // Neutro: no rompe la racha.
      } else {
        break;
      }
    }
  }

  return { current, best, completionRate };
}

export type GlobalStats = {
  current: number;
  best: number;
  completionRate: number;
};

/**
 * Estadísticas globales: combina todos los hábitos.
 * Los días saltados (skipped) se excluyen del rate y no rompen la racha global.
 */
export function computeGlobalStats(
  habits: HabitWithCategory[],
  logs: HabitLog[],
): GlobalStats {
  if (habits.length === 0) return { current: 0, best: 0, completionRate: 0 };

  const today = todayISO();
  const from = addDaysISO(today, -365);

  const completedMap = new Map<string, boolean>();
  const skippedMap = new Map<string, boolean>();
  for (const l of logs) {
    if (l.completed) completedMap.set(`${l.habit_id}:${l.date}`, true);
    if (l.skipped) skippedMap.set(`${l.habit_id}:${l.date}`, true);
  }

  let scheduledTotal = 0;
  let completedTotal = 0;
  let best = 0;

  for (const habit of habits) {
    const dates = scheduledDatesInRange(habit, from, today);
    for (const d of dates) {
      const key = `${habit.id}:${d}`;
      if (skippedMap.has(key)) continue;
      scheduledTotal += 1;
      if (completedMap.has(key)) completedTotal += 1;
    }
    const { best: habitBest } = computeHabitStreak(habit, logs);
    if (habitBest > best) best = habitBest;
  }

  const completionRate =
    scheduledTotal > 0 ? Math.round((completedTotal / scheduledTotal) * 100) : 0;

  let current = 0;
  for (let i = 0; i < 365; i++) {
    const date = addDaysISO(today, -i);
    const scheduledToday = habits.filter((h) => isScheduledOn(h, date));
    if (scheduledToday.length === 0) break;
    const allHandled = scheduledToday.every(
      (h) =>
        completedMap.has(`${h.id}:${date}`) || skippedMap.has(`${h.id}:${date}`),
    );
    if (!allHandled) break;
    current += 1;
  }

  return { current, best, completionRate };
}

export type DayStat = { date: string; completed: number; total: number; percent: number };

/**
 * Progreso diario de un rango de días (para la vista semanal/mensual).
 * Los días saltados no cuentan en el denominador.
 */
export function computeDailySeries(
  habits: HabitWithCategory[],
  logs: HabitLog[],
  from: string,
  to: string,
): DayStat[] {
  const completedMap = new Map<string, boolean>();
  const skippedMap = new Map<string, boolean>();
  for (const l of logs) {
    if (l.completed) completedMap.set(`${l.habit_id}:${l.date}`, true);
    if (l.skipped) skippedMap.set(`${l.habit_id}:${l.date}`, true);
  }

  const total = daysBetween(from, to);
  const series: DayStat[] = [];
  for (let i = 0; i <= total; i++) {
    const date = addDaysISO(from, i);
    const scheduled = habits.filter((h) => isScheduledOn(h, date));
    const effective = scheduled.filter(
      (h) => !skippedMap.has(`${h.id}:${date}`),
    );
    const completed = effective.filter((h) =>
      completedMap.has(`${h.id}:${date}`),
    ).length;
    const percent =
      effective.length > 0
        ? Math.round((completed / effective.length) * 100)
        : 0;
    series.push({ date, completed, total: effective.length, percent });
  }
  return series;
}

export function computeHabitPerformance(
  habits: HabitWithCategory[],
  logs: HabitLog[],
): { habit: HabitWithCategory; streak: HabitStreak }[] {
  return habits
    .map((habit) => ({ habit, streak: computeHabitStreak(habit, logs) }))
    .sort((a, b) => b.streak.completionRate - a.streak.completionRate);
}
