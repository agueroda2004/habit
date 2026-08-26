import { Plus, Sprout } from "lucide-react";
import { useState } from "react";
import { notify } from "../../../shared/ui/notify";
import { Button } from "../../../shared/ui/Button";
import { EmptyState } from "../../../shared/ui/EmptyState";
import { HabitIcon } from "../../../shared/ui/HabitIcon";
import { DashboardSkeleton } from "../../../shared/ui/Skeleton";
import { DashboardHeader } from "./DashboardHeader";
import { DailyProgressCard } from "./DailyProgressCard";
import { HabitCard } from "../../habits/components/HabitCard";
import { HabitModal } from "../../habits/components/HabitModal";
import { ProgressSelector } from "../../habits/components/ProgressSelector";
import {
  useAccumulateHabit,
  useHabitsData,
  useLogs,
  useSkipHabit,
  useToggleHabit,
} from "../../habits/hooks/useHabits";
import { groupByCategory } from "../../habits/utils/group";
import { isScheduledOn } from "../../habits/utils/schedule";
import { computeDailyProgress } from "../utils/progress";
import { todayISO } from "../../../shared/utils/dates";
import type { HabitWithCategory } from "../../../types/habit";

export function DashboardPage() {
  const date = todayISO();
  const { data: habits, isLoading } = useHabitsData(false);
  const { data: logs } = useLogs(date);
  const toggleMutation = useToggleHabit(date);
  const accumulateMutation = useAccumulateHabit(date);
  const skipMutation = useSkipHabit(date);

  const [habitModal, setHabitModal] = useState<{
    open: boolean;
    habit: HabitWithCategory | null;
  }>({ open: false, habit: null });
  const [progressHabit, setProgressHabit] = useState<HabitWithCategory | null>(null);

  const todaysHabits = (habits ?? []).filter((h) => isScheduledOn(h, date));
  const progress = computeDailyProgress(todaysHabits, logs ?? []);
  const groups = groupByCategory(todaysHabits);

  const completedIds = new Set(
    (logs ?? []).filter((l) => l.completed).map((l) => l.habit_id),
  );
  const skippedIds = new Set(
    (logs ?? []).filter((l) => l.skipped).map((l) => l.habit_id),
  );

  function logValue(habitId: string): number {
    const log = (logs ?? []).find((l) => l.habit_id === habitId);
    return log?.value ?? 0;
  }

  function isIncremental(habit: HabitWithCategory): boolean {
    return (
      (habit.type === "duration" || habit.type === "numeric") &&
      habit.target_value != null &&
      habit.target_value > 0
    );
  }

  function handleActivate(habitId: string) {
    const habit = todaysHabits.find((h) => h.id === habitId);
    if (!habit) return;

    if (skippedIds.has(habitId)) {
      skipMutation.mutate(
        { habit, skipped: false },
        {
          onSuccess: () => notify.info("Omitido quitado"),
          onError: () => notify.error("No se pudo actualizar. Inténtalo de nuevo."),
        },
      );
      return;
    }

    if (isIncremental(habit)) {
      setProgressHabit(habit);
      return;
    }

    const completed = completedIds.has(habitId);
    toggleMutation.mutate(
      { habit, completed: !completed },
      {
        onSuccess: () => {
          if (completed) {
            notify.info("Hábito desmarcado");
          } else {
            notify.success("¡Bien hecho!");
          }
        },
        onError: () => notify.error("No se pudo actualizar. Inténtalo de nuevo."),
      },
    );
  }

  function handleSkip(habitId: string) {
    const habit = todaysHabits.find((h) => h.id === habitId);
    if (!habit) return;
    skipMutation.mutate(
      { habit, skipped: !skippedIds.has(habitId) },
      {
        onSuccess: () => notify.success("Hábito omitido por hoy"),
        onError: () => notify.error("No se pudo omitir. Inténtalo de nuevo."),
      },
    );
  }

  function handleApplyProgress(delta: number) {
    if (!progressHabit) return;
    const newValue = Math.max(0, logValue(progressHabit.id) + delta);
    accumulateMutation.mutate(
      {
        habit: progressHabit,
        delta,
        currentValue: logValue(progressHabit.id),
      },
      {
        onSuccess: () => {
          if (
            progressHabit.target_value != null &&
            newValue >= progressHabit.target_value
          ) {
            notify.success("¡Objetivo alcanzado!");
          } else {
            notify.success("Progreso registrado");
          }
        },
        onError: () => notify.error("No se pudo registrar. Inténtalo de nuevo."),
      },
    );
  }

  return (
    <div>
      <DashboardHeader progress={progress} />

      {isLoading ? (
        <DashboardSkeleton />
      ) : todaysHabits.length === 0 ? (
        <>
          <DailyProgressCard progress={progress} />
          <EmptyState
            icon={<Sprout className="h-8 w-8" />}
            title="Sin hábitos para hoy"
            description="Crea tu primer hábito y empieza a construir tu rutina."
            action={
              <Button onClick={() => setHabitModal({ open: true, habit: null })}>
                <Plus className="h-5 w-5" />
                Crear hábito
              </Button>
            }
          />
        </>
      ) : (
        <>
          <DailyProgressCard progress={progress} />

          {groups.map((group) => (
            <section key={group.category?.id ?? "none"} className="mb-6">
              {group.category && (
                <h2
                  className="mb-2 flex items-center gap-1.5 px-1 text-sm font-extrabold uppercase tracking-wide"
                  style={{ color: group.category.color || "#71717a" }}
                >
                  <HabitIcon
                    name={group.category.icon}
                    color={group.category.color}
                    boxClassName="h-6 w-6 rounded-md"
                    iconClassName="h-3.5 w-3.5"
                  />
                  {group.category.name}
                </h2>
              )}
              <div className="space-y-3">
                {group.habits.map((habit) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    completed={completedIds.has(habit.id)}
                    skipped={skippedIds.has(habit.id)}
                    progressValue={logValue(habit.id)}
                    isIncremental={isIncremental(habit)}
                    onToggle={() => handleActivate(habit.id)}
                    onSkip={() => handleSkip(habit.id)}
                    onEdit={() => setHabitModal({ open: true, habit })}
                    disabled={
                      toggleMutation.isPending ||
                      accumulateMutation.isPending ||
                      skipMutation.isPending
                    }
                  />
                ))}
              </div>
            </section>
          ))}

          <div className="mt-8 flex justify-center">
            <Button variant="secondary" onClick={() => setHabitModal({ open: true, habit: null })}>
              <Plus className="h-5 w-5" />
              Nuevo hábito
            </Button>
          </div>
        </>
      )}

      <HabitModal
        open={habitModal.open}
        onClose={() => setHabitModal({ open: false, habit: null })}
        habit={habitModal.habit}
      />

      <ProgressSelector
        open={progressHabit !== null}
        habit={progressHabit}
        currentValue={progressHabit ? logValue(progressHabit.id) : 0}
        onClose={() => setProgressHabit(null)}
        onApply={handleApplyProgress}
        loading={accumulateMutation.isPending}
      />
    </div>
  );
}
