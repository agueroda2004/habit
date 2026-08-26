import { cn } from "../utils/cn";

type Option<T extends string> = { value: T; label: string };

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      className={cn(
        "flex rounded-2xl bg-zinc-100 p-1",
        className,
      )}
    >
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex-1 rounded-xl px-3 py-2 text-sm font-bold transition",
              selected
                ? "bg-white text-primary-700 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
