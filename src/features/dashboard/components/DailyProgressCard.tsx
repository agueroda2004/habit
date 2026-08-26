import { ProgressBar } from "../../../shared/ui/ProgressBar";
import type { DailyProgress } from "../utils/progress";

export function DailyProgressCard({ progress }: { progress: DailyProgress }) {
  return (
    <div className="mb-5 rounded-3xl bg-gradient-to-br from-primary-500 to-emerald-500 p-5 text-white shadow-lg shadow-primary-500/30">
      <div className="mb-1 flex items-baseline justify-between">
        <h2 className="text-base font-extrabold">Progreso de hoy</h2>
        <span className="text-3xl font-extrabold">{progress.percent}%</span>
      </div>
      <p className="mb-3 text-sm font-semibold text-primary-50/90">
        {progress.completed} de {progress.total} hábitos completados
      </p>
      <ProgressBar
        value={progress.completed}
        max={progress.total}
        trackClassName="bg-white/25"
        className="h-4"
      />
    </div>
  );
}
