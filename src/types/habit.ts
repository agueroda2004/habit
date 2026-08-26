import type { Database } from "./database";

export type Category = Database["public"]["Tables"]["categories_habit"]["Row"];
export type Habit = Database["public"]["Tables"]["habits"]["Row"];
export type HabitSchedule =
  Database["public"]["Tables"]["habit_schedules"]["Row"];
export type HabitLog = Database["public"]["Tables"]["habit_logs"]["Row"];

export type CategoryInput =
  Database["public"]["Tables"]["categories_habit"]["Insert"];
export type HabitInput = Database["public"]["Tables"]["habits"]["Insert"];
export type HabitUpdate = Database["public"]["Tables"]["habits"]["Update"];
export type ScheduleInput =
  Database["public"]["Tables"]["habit_schedules"]["Insert"];
export type LogInput = Database["public"]["Tables"]["habit_logs"]["Insert"];

export type HabitWithSchedule = Habit & { schedule: HabitSchedule | null };
export type HabitWithCategory = Habit & {
  category: Category | null;
  schedule: HabitSchedule | null;
};

export type HabitFormValues = {
  name: string;
  description: string;
  icon: string | null;
  color: string;
  category_id: string | null;
  type: Habit["type"];
  target_value: string;
  unit: string;
  start_date: string;
  end_date: string | null;
  frequency_type: HabitSchedule["frequency_type"];
  days_of_week: number[];
};
