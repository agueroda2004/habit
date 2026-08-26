import type { Habit } from "../../../types/habit";

export function habitTargetLabel(habit: Pick<Habit, "type" | "target_value" | "unit" | "description">): string {
  if (habit.description) return habit.description;
  if (habit.target_value != null) {
    const value = Number(habit.target_value);
    const unit = habit.unit ? ` ${habit.unit}` : "";
    return `${value}${unit}`;
  }
  return "";
}
