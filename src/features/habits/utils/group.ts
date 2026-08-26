import type { Category, HabitWithCategory } from "../../../types/habit";

export type HabitGroup = {
  category: Category | null;
  habits: HabitWithCategory[];
};

export function groupByCategory(habits: HabitWithCategory[]): HabitGroup[] {
  const groups = new Map<string, HabitGroup>();

  for (const habit of habits) {
    const key = habit.category ? habit.category.id : "__none__";
    const group =
      groups.get(key) ?? { category: habit.category, habits: [] as HabitWithCategory[] };
    group.habits.push(habit);
    groups.set(key, group);
  }

  return Array.from(groups.values()).sort((a, b) => {
    if (a.category && !b.category) return -1;
    if (!a.category && b.category) return 1;
    return 0;
  });
}
