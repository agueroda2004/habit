import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../lib/queryKeys";
import type {
  Habit,
  HabitInput,
  HabitLog,
  HabitUpdate,
  HabitWithCategory,
  ScheduleInput,
} from "../../../types/habit";
import {
  archiveHabit,
  createHabitWithSchedule,
  deleteHabitPermanently,
  fetchHabits,
  fetchSchedules,
  restoreHabit,
  updateHabitWithSchedule,
} from "../api/habits";
import {
  accumulateLog,
  fetchLogs,
  fetchLogsRange,
  setSkipped,
  upsertLog,
} from "../api/habitLogs";
import { useCategories } from "../../categories/hooks/useCategories";

export function useHabitsData(includeArchived: boolean) {
  const habitsQuery = useQuery({
    queryKey: queryKeys.habits(includeArchived),
    queryFn: () => fetchHabits(includeArchived),
    staleTime: 30_000,
  });
  const schedulesQuery = useQuery({
    queryKey: queryKeys.schedules,
    queryFn: fetchSchedules,
    staleTime: 60_000,
  });
  const categoriesQuery = useCategories();

  const data = useMemo<HabitWithCategory[] | undefined>(() => {
    if (!habitsQuery.data || !schedulesQuery.data) return undefined;
    const scheduleMap = new Map(schedulesQuery.data.map((s) => [s.habit_id, s]));
    const categoryMap = new Map(
      (categoriesQuery.data ?? []).map((c) => [c.id, c]),
    );
    return habitsQuery.data.map((h) => ({
      ...h,
      schedule: scheduleMap.get(h.id) ?? null,
      category: h.category_id ? (categoryMap.get(h.category_id) ?? null) : null,
    }));
  }, [habitsQuery.data, schedulesQuery.data, categoriesQuery.data]);

  return {
    data,
    isLoading: habitsQuery.isLoading || schedulesQuery.isLoading,
    isError: habitsQuery.isError || schedulesQuery.isError,
    refetch: () => {
      void habitsQuery.refetch();
      void schedulesQuery.refetch();
    },
  };
}

export function useLogs(date: string) {
  return useQuery({
    queryKey: queryKeys.logs(date),
    queryFn: () => fetchLogs(date),
    staleTime: 30_000,
  });
}

export function useLogsRange(from: string, to: string) {
  return useQuery({
    queryKey: queryKeys.logsRange(from, to),
    queryFn: () => fetchLogsRange(from, to),
    staleTime: 60_000,
  });
}

export function useToggleHabit(date: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      habit,
      completed,
    }: {
      habit: HabitWithCategory;
      completed: boolean;
    }) =>
      upsertLog({
        habit_id: habit.id,
        date,
        value: completed ? habit.target_value : null,
        completed,
        skipped: false,
      }),
    onMutate: async ({ habit, completed }) => {
      await qc.cancelQueries({ queryKey: ["logs"] });
      const prev = qc.getQueryData<HabitLog[]>(queryKeys.logs(date));
      qc.setQueryData<HabitLog[]>(queryKeys.logs(date), (old) => {
        const list = old ?? [];
        const existing = list.find((l) => l.habit_id === habit.id);
        const row = {
          id: existing?.id ?? `optimistic-${habit.id}`,
          habit_id: habit.id,
          date,
          value: completed ? habit.target_value : null,
          completed,
          skipped: false,
          created_at: existing?.created_at ?? new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        return existing
          ? list.map((l) => (l.habit_id === habit.id ? row : l))
          : [...list, row];
      });
      return { prev };
    },
    onError: (_error, _vars, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData(queryKeys.logs(date), ctx.prev);
      }
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ["logs"] });
    },
  });
}

export function useAccumulateHabit(date: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      habit,
      delta,
      currentValue,
    }: {
      habit: HabitWithCategory;
      delta: number;
      currentValue: number;
    }) =>
      accumulateLog({
        habit_id: habit.id,
        date,
        currentValue,
        delta,
        target_value: habit.target_value,
      }),
    onMutate: async ({ habit, delta, currentValue }) => {
      await qc.cancelQueries({ queryKey: ["logs"] });
      const prev = qc.getQueryData<HabitLog[]>(queryKeys.logs(date));
      const newValue = Math.max(0, currentValue + delta);
      const completed =
        habit.target_value != null ? newValue >= habit.target_value : newValue > 0;

      qc.setQueryData<HabitLog[]>(queryKeys.logs(date), (old) => {
        const list = old ?? [];
        const existing = list.find((l) => l.habit_id === habit.id);
        const row = {
          id: existing?.id ?? `optimistic-${habit.id}`,
          habit_id: habit.id,
          date,
          value: newValue,
          completed,
          skipped: false,
          created_at: existing?.created_at ?? new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        return existing
          ? list.map((l) => (l.habit_id === habit.id ? row : l))
          : [...list, row];
      });
      return { prev };
    },
    onError: (_error, _vars, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData(queryKeys.logs(date), ctx.prev);
      }
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ["logs"] });
    },
  });
}

export function useSkipHabit(date: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ habit, skipped }: { habit: HabitWithCategory; skipped: boolean }) =>
      setSkipped({ habit_id: habit.id, date, skipped }),
    onMutate: async ({ habit, skipped }) => {
      await qc.cancelQueries({ queryKey: ["logs"] });
      const prev = qc.getQueryData<HabitLog[]>(queryKeys.logs(date));
      qc.setQueryData<HabitLog[]>(queryKeys.logs(date), (old) => {
        const list = old ?? [];
        const existing = list.find((l) => l.habit_id === habit.id);
        const row = {
          id: existing?.id ?? `optimistic-${habit.id}`,
          habit_id: habit.id,
          date,
          value: 0,
          completed: false,
          skipped,
          created_at: existing?.created_at ?? new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        return existing
          ? list.map((l) => (l.habit_id === habit.id ? row : l))
          : [...list, row];
      });
      return { prev };
    },
    onError: (_error, _vars, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData(queryKeys.logs(date), ctx.prev);
      }
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ["logs"] });
    },
  });
}

export function useCreateHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { habit: HabitInput; schedule: Omit<ScheduleInput, "habit_id"> }) =>
      createHabitWithSchedule(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.habits(false) });
      void qc.invalidateQueries({ queryKey: queryKeys.schedules });
    },
  });
}

export function useUpdateHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; habit: HabitUpdate; schedule: Omit<ScheduleInput, "habit_id"> }) =>
      updateHabitWithSchedule(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["habits"] });
      void qc.invalidateQueries({ queryKey: queryKeys.schedules });
      void qc.invalidateQueries({ queryKey: ["logs"] });
    },
  });
}

export function useArchiveHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => archiveHabit(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["habits"] });
    },
  });
}

export function useRestoreHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => restoreHabit(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["habits"] });
    },
  });
}

export function useDeleteHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteHabitPermanently(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["habits"] });
      void qc.invalidateQueries({ queryKey: ["logs"] });
    },
  });
}

export type { Habit };
