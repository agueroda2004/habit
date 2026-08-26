import type { HabitLog } from "../../../types/habit";
import type { HabitWithCategory } from "../../../types/habit";

export type DailyProgress = {
  completed: number;
  total: number;
  percent: number;
};

export function computeDailyProgress(
  habits: HabitWithCategory[],
  logs: HabitLog[],
): DailyProgress {
  const completedIds = new Set(
    logs.filter((l) => l.completed).map((l) => l.habit_id),
  );
  const completed = habits.filter((h) => completedIds.has(h.id)).length;
  const total = habits.length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { completed, total, percent };
}
