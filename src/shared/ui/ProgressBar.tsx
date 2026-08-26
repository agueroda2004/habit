import { cn } from "../utils/cn";

type ProgressBarProps = {
  value: number;
  max: number;
  color?: string;
  className?: string;
  trackClassName?: string;
};

export function ProgressBar({
  value,
  max,
  color = "#10b981",
  className,
  trackClassName,
}: ProgressBarProps) {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label={`${value} de ${max}`}
      className={cn("h-3 w-full overflow-hidden rounded-full bg-zinc-200", trackClassName, className)}
    >
      <div
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{ width: `${percent}%`, backgroundColor: color }}
      />
    </div>
  );
}
