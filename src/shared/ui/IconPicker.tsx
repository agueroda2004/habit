import { getHabitIcon } from "../utils/iconRegistry";
import { HABIT_ICONS } from "../constants/icons";
import { cn } from "../utils/cn";

export function IconPicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  return (
    <div className="max-h-44 overflow-y-auto rounded-2xl bg-zinc-50 p-2">
      <div className="grid grid-cols-8 gap-1.5">
        {HABIT_ICONS.map((name) => {
          const Icon = getHabitIcon(name);
          const isSelected = value === name;
          return (
            <button
              key={name}
              type="button"
              onClick={() => onChange(isSelected ? null : name)}
              aria-label={`Icono ${name}`}
              aria-pressed={isSelected}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl text-primary-600 transition active:scale-90",
                isSelected
                  ? "bg-primary-200 text-primary-800 ring-2 ring-primary-400"
                  : "hover:bg-zinc-200",
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={2.25} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
