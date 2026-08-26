import { HABIT_COLORS } from "../constants/colors";
import { cn } from "../utils/cn";

export function ColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {HABIT_COLORS.map((c) => (
        <button
          key={c.value}
          type="button"
          aria-label={`Color ${c.name}`}
          aria-pressed={value === c.value}
          onClick={() => onChange(c.value)}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full text-white transition active:scale-90",
            value === c.value && "scale-110 ring-2 ring-zinc-400 ring-offset-2",
          )}
          style={{ backgroundColor: c.value }}
        >
          {value === c.value && (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      ))}
    </div>
  );
}
