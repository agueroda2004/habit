import { Check, Pencil, Plus, SkipForward } from "lucide-react";
import { cn } from "../../../shared/utils/cn";
import { HabitIcon } from "../../../shared/ui/HabitIcon";
import { ProgressBar } from "../../../shared/ui/ProgressBar";
import { habitTargetLabel } from "../utils/habitText";
import { formatScheduleLabel } from "../utils/schedule";
import type { HabitWithCategory } from "../../../types/habit";

type HabitCardProps = {
  habit: HabitWithCategory;
  completed: boolean;
  skipped?: boolean;
  onToggle: () => void;
  onSkip?: () => void;
  onEdit?: () => void;
  disabled?: boolean;
  isIncremental?: boolean;
  progressValue?: number;
};

export function HabitCard({
  habit,
  completed,
  skipped = false,
  onToggle,
  onSkip,
  onEdit,
  disabled,
  isIncremental = false,
  progressValue = 0,
}: HabitCardProps) {
  const target = habit.target_value ?? 0;
  const subtitle = habitTargetLabel(habit) || formatScheduleLabel(habit);
  const color = habit.color || "#10b981";

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-3xl border-2 bg-white p-3 pl-4 shadow-sm transition",
        completed
          ? "border-transparent"
          : skipped
            ? "border-zinc-100 bg-zinc-50/60"
            : "border-zinc-100 shadow-zinc-200/40",
      )}
      style={completed ? { backgroundColor: `${color}14` } : undefined}
    >
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        aria-pressed={completed}
        aria-label={
          skipped
            ? `${habit.name}, omitido`
            : isIncremental
              ? `${habit.name}, ${progressValue} de ${target}${habit.unit ? ` ${habit.unit}` : ""}`
              : `${habit.name}, ${completed ? "completado" : "pendiente"}`
        }
        className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl text-left outline-none transition active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-primary-400 disabled:opacity-60"
      >
        <HabitIcon
          name={habit.icon}
          color={color}
          boxClassName={cn("h-14 w-14 shrink-0", skipped && "opacity-50")}
        />

        <span className="min-w-0 flex-1">
          <span
            className={cn(
              "block truncate text-base font-extrabold",
              completed
                ? "text-zinc-500 line-through decoration-2"
                : skipped
                  ? "text-zinc-400"
                  : "text-zinc-800",
            )}
          >
            {habit.name}
          </span>
          <span
            className="mt-0.5 block truncate text-sm font-medium"
            style={{ color: completed ? "#71717a" : skipped ? "#c0c0c4" : "#a1a1aa" }}
          >
            {skipped
              ? "Omitido hoy"
              : isIncremental && target > 0
                ? `${progressValue} / ${target}${habit.unit ? ` ${habit.unit}` : ""}`
                : subtitle}
          </span>
        </span>

        {skipped ? (
          <span
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[3px] border-zinc-200",
              skipped && "bg-zinc-100 text-zinc-400",
            )}
          >
            <SkipForward className="h-6 w-6" strokeWidth={2.5} />
          </span>
        ) : isIncremental && target > 0 ? (
          <span className="flex w-14 shrink-0 flex-col items-end gap-1.5">
            <ProgressBar
              value={progressValue}
              max={target}
              color={completed ? color : undefined}
              className="h-2 w-14"
            />
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full transition",
                completed
                  ? "bg-primary text-white"
                  : "bg-primary-100 text-primary-600",
              )}
            >
              <Plus className="h-5 w-5" strokeWidth={3} />
            </span>
          </span>
        ) : (
          <span
            key={String(completed)}
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[3px] transition-all",
              completed
                ? "animate-pop border-transparent text-white shadow-md"
                : "border-zinc-200 text-transparent",
            )}
            style={completed ? { backgroundColor: color } : undefined}
          >
            <Check className="h-6 w-6" strokeWidth={3.5} />
          </span>
        )}
      </button>

      {onSkip && !completed && (
        <button
          type="button"
          onClick={onSkip}
          aria-label={skipped ? `Quitar omitido de ${habit.name}` : `Omitir ${habit.name} hoy`}
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition",
            skipped
              ? "bg-zinc-200 text-zinc-500 hover:bg-zinc-300"
              : "text-zinc-300 hover:bg-zinc-100 hover:text-zinc-500",
          )}
        >
          <SkipForward className="h-4 w-4" />
        </button>
      )}

      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Editar ${habit.name}`}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-zinc-300 transition hover:bg-zinc-100 hover:text-zinc-500 focus-visible:outline-2 focus-visible:outline-primary-400"
        >
          <Pencil className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
