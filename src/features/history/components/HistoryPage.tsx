import { useState } from "react";
import { CalendarDays, Check, SkipForward } from "lucide-react";
import DatePicker from "../../../shared/ui/DatePicker";
import { ProgressBar } from "../../../shared/ui/ProgressBar";
import { EmptyState } from "../../../shared/ui/EmptyState";
import { HabitIcon } from "../../../shared/ui/HabitIcon";
import { Skeleton } from "../../../shared/ui/Skeleton";
import { notify } from "../../../shared/ui/notify";
import { ProgressSelector } from "../../habits/components/ProgressSelector";
import { formatLongDate, todayISO } from "../../../shared/utils/dates";
import {
  useAccumulateHabit,
  useHabitsData,
  useLogs,
  useSkipHabit,
  useToggleHabit,
} from "../../habits/hooks/useHabits";
import { isScheduledOn } from "../../habits/utils/schedule";
import type { HabitWithCategory } from "../../../types/habit";

export function HistoryPage() {
  const [date, setDate] = useState(todayISO());
  const { data: habits, isLoading } = useHabitsData(false);
  const { data: logs } = useLogs(date);
  const toggleMutation = useToggleHabit(date);
  const accumulateMutation = useAccumulateHabit(date);
  const skipMutation = useSkipHabit(date);

  const [progressHabit, setProgressHabit] = useState<HabitWithCategory | null>(null);

  const scheduled = (habits ?? []).filter((h) => isScheduledOn(h, date));
  const completedIds = new Set(
    (logs ?? []).filter((l) => l.completed).map((l) => l.habit_id),
  );
  const skippedIds = new Set(
    (logs ?? []).filter((l) => l.skipped).map((l) => l.habit_id),
  );
  const effective = scheduled.filter((h) => !skippedIds.has(h.id));
  const completed = effective.filter((h) => completedIds.has(h.id)).length;
  const percent =
    effective.length > 0 ? Math.round((completed / effective.length) * 100) : 0;

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

  function handleToggleComplete(habit: HabitWithCategory) {
    if (isIncremental(habit)) {
      setProgressHabit(habit);
      return;
    }
    const done = completedIds.has(habit.id);
    toggleMutation.mutate(
      { habit, completed: !done },
      {
        onSuccess: () =>
          notify.success(done ? "Hábito desmarcado" : "Hábito completado"),
        onError: () => notify.error("No se pudo actualizar. Inténtalo de nuevo."),
      },
    );
  }

  function handleSkip(habit: HabitWithCategory) {
    const skipped = skippedIds.has(habit.id);
    skipMutation.mutate(
      { habit, skipped: !skipped },
      {
        onSuccess: () =>
          notify.success(skipped ? "Omitido quitado" : "Hábito omitido"),
        onError: () => notify.error("No se pudo actualizar. Inténtalo de nuevo."),
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
      <h1 className="mb-4 text-2xl font-extrabold tracking-tight text-zinc-800">
        Historial
      </h1>

      <div className="mb-5">
        <DatePicker value={date} onChange={setDate} maxDate={new Date()} />
      </div>

      <p className="mb-3 text-sm font-semibold capitalize text-zinc-500">
        {formatLongDate(date)}
      </p>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : scheduled.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="h-8 w-8" />}
          title="Sin hábitos en esta fecha"
          description="No hay hábitos programados para este día."
        />
      ) : (
        <>
          <div className="mb-5 rounded-3xl bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-baseline justify-between">
              <span className="text-sm font-extrabold text-zinc-700">
                {completed} / {effective.length} completados
              </span>
              <span className="text-xl font-extrabold text-primary-600">{percent}%</span>
            </div>
            <ProgressBar value={completed} max={effective.length} />
          </div>

          <div className="space-y-3">
            {scheduled.map((habit: HabitWithCategory) => {
              const done = completedIds.has(habit.id);
              const skipped = skippedIds.has(habit.id);
              const color = habit.color || "#10b981";
              const log = (logs ?? []).find((l) => l.habit_id === habit.id);
              const value = log?.value ?? 0;
              const target = habit.target_value ?? 0;
              const incremental = isIncremental(habit);
              return (
                <div
                  key={habit.id}
                  className="flex items-center gap-3 rounded-3xl border-2 border-zinc-100 bg-white p-4 shadow-sm"
                  style={
                    done
                      ? { backgroundColor: `${color}14` }
                      : skipped
                        ? { backgroundColor: "#fafafa" }
                        : undefined
                  }
                >
                  <HabitIcon
                    name={habit.icon}
                    color={color}
                    boxClassName={
                      skipped ? "h-12 w-12 shrink-0 opacity-50" : "h-12 w-12 shrink-0"
                    }
                  />
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block truncate text-base font-extrabold ${
                        done
                          ? "text-zinc-500 line-through"
                          : skipped
                            ? "text-zinc-400"
                            : "text-zinc-800"
                      }`}
                    >
                      {habit.name}
                    </span>
                    {skipped ? (
                      <span className="mt-0.5 block truncate text-sm font-semibold text-zinc-400">
                        Omitido
                      </span>
                    ) : incremental ? (
                      <span className="mt-0.5 block truncate text-sm font-semibold text-zinc-400">
                        {value} / {target}
                        {habit.unit ? ` ${habit.unit}` : ""}
                      </span>
                    ) : null}
                  </span>

                  {!done && (
                    <button
                      type="button"
                      onClick={() => handleSkip(habit)}
                      aria-label={
                        skipped
                          ? `Quitar omitido de ${habit.name}`
                          : `Omitir ${habit.name} este día`
                      }
                      className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                        skipped
                          ? "bg-zinc-200 text-zinc-500 hover:bg-zinc-300"
                          : "bg-zinc-100 text-zinc-400 hover:bg-zinc-200"
                      }`}
                    >
                      <SkipForward className="h-4 w-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleToggleComplete(habit)}
                    aria-label={
                      done
                        ? `Desmarcar ${habit.name}`
                        : incremental
                          ? `Registrar progreso de ${habit.name}`
                          : `Completar ${habit.name}`
                    }
                    className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                      done
                        ? "bg-primary text-white"
                        : "border-2 border-zinc-300 bg-white text-zinc-300 hover:border-primary-400 hover:text-primary-500"
                    }`}
                  >
                    <Check className="h-5 w-5" strokeWidth={3} />
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

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