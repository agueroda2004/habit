import { greeting, formatLongDate, todayISO } from "../../../shared/utils/dates";
import type { DailyProgress } from "../utils/progress";

export function DashboardHeader({ progress }: { progress: DailyProgress }) {
  const date = new Date();
  const dateISO = todayISO();

  return (
    <header className="mb-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-800">
            {greeting()}
          </h1>
          <p className="mt-0.5 text-sm font-medium capitalize text-zinc-500">
            {formatLongDate(dateISO)}
          </p>
        </div>
        <span className="mt-1 rounded-2xl bg-primary-100 px-3 py-1.5 text-sm font-extrabold text-primary-700">
          {progress.completed} / {progress.total}
        </span>
      </div>
      <span className="sr-only">{date.toDateString()}</span>
    </header>
  );
}
