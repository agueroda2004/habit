import { BarChart3, Flame, Trophy, Target, TrendingUp, TrendingDown } from "lucide-react";
import { EmptyState } from "../../../shared/ui/EmptyState";
import { HabitIcon } from "../../../shared/ui/HabitIcon";
import { Skeleton } from "../../../shared/ui/Skeleton";
import { addDaysISO, formatShortDate, todayISO } from "../../../shared/utils/dates";
import { useHabitsData, useLogsRange } from "../../habits/hooks/useHabits";
import {
  computeDailySeries,
  computeGlobalStats,
  computeHabitPerformance,
} from "../utils/stats";
import { DAY_SHORT } from "../../../shared/constants/days";

function MiniBars({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-1">
      {values.map((v, i) => (
        <div
          key={i}
          className="w-full rounded-t-md bg-primary-200 transition-all"
          style={{ height: `${Math.max(6, (v / max) * 100)}px`, opacity: 0.5 + (v / 100) * 0.5 }}
          title={`${v}%`}
        />
      ))}
    </div>
  );
}

export function StatisticsPage() {
  const today = todayISO();
  const { data: habits, isLoading } = useHabitsData(false);
  const active = habits ?? [];
  const from = addDaysISO(today, -30);
  const { data: logs } = useLogsRange(from, today);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    );
  }

  if (active.length === 0) {
    return (
      <div>
        <h1 className="mb-4 text-2xl font-extrabold tracking-tight text-zinc-800">
          Estadísticas
        </h1>
        <EmptyState
          icon={<BarChart3 className="h-8 w-8" />}
          title="Aún no hay datos"
          description="Crea hábitos y completa algunos para ver tus estadísticas."
        />
      </div>
    );
  }

  const logList = logs ?? [];
  const global = computeGlobalStats(active, logList);
  const daily = computeDailySeries(active, logList, from, today);
  const weekly = daily.slice(-7);
  const performance = computeHabitPerformance(active, logList);

  const bestPerformer = performance[0];
  const worstPerformer = performance[performance.length - 1];

  return (
    <div>
      <h1 className="mb-4 text-2xl font-extrabold tracking-tight text-zinc-800">
        Estadísticas
      </h1>

      <div className="mb-4 grid grid-cols-3 gap-3">
        <div className="rounded-3xl bg-orange-50 p-4 text-center">
          <Flame className="mx-auto mb-1 h-6 w-6 text-orange-500" />
          <p className="text-2xl font-extrabold text-orange-600">{global.current}</p>
          <p className="text-xs font-bold text-orange-500/80">Racha actual</p>
        </div>
        <div className="rounded-3xl bg-amber-50 p-4 text-center">
          <Trophy className="mx-auto mb-1 h-6 w-6 text-amber-500" />
          <p className="text-2xl font-extrabold text-amber-600">{global.best}</p>
          <p className="text-xs font-bold text-amber-500/80">Mejor racha</p>
        </div>
        <div className="rounded-3xl bg-primary-50 p-4 text-center">
          <Target className="mx-auto mb-1 h-6 w-6 text-primary-600" />
          <p className="text-2xl font-extrabold text-primary-700">{global.completionRate}%</p>
          <p className="text-xs font-bold text-primary-600/80">Cumplimiento</p>
        </div>
      </div>

      <div className="mb-4 rounded-3xl border border-zinc-100 bg-white p-5 shadow-sm">
        <h2 className="mb-1 text-base font-extrabold text-zinc-700">Últimos 7 días</h2>
        <p className="mb-4 text-xs font-medium text-zinc-400">Progreso diario en %</p>
        <MiniBars values={weekly.map((d) => d.percent)} />
        <div className="mt-2 flex justify-between text-[10px] font-bold text-zinc-400">
          {weekly.map((d) => {
            const dow = new Date(`${d.date}T00:00:00`).getDay();
            return <span key={d.date}>{DAY_SHORT[dow]}</span>;
          })}
        </div>
      </div>

      <div className="mb-4 rounded-3xl border border-zinc-100 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-base font-extrabold text-zinc-700">Este mes</h2>
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-3xl font-extrabold text-primary-600">
            {daily.length > 0 ? Math.round(daily.reduce((a, b) => a + b.percent, 0) / daily.length) : 0}%
          </span>
          <span className="text-xs font-semibold text-zinc-400">
            promedio de {daily.filter((d) => d.total > 0).length} días
          </span>
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(14px,1fr))] gap-1">
          {daily.map((d) => (
            <div
              key={d.date}
              className="h-4 rounded-sm"
              style={{
                backgroundColor: d.total === 0 ? "#f4f4f5" : `rgba(16,185,129,${0.2 + d.percent / 125})`,
              }}
              title={`${formatShortDate(d.date)}: ${d.percent}%`}
            />
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-zinc-100 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-base font-extrabold text-zinc-700">Rendimiento por hábito</h2>
        <div className="space-y-3">
          {bestPerformer && (
            <div className="flex items-center gap-3 rounded-2xl bg-primary-50 p-3">
              <TrendingUp className="h-5 w-5 shrink-0 text-primary-600" />
              <span className="flex-1 truncate text-sm font-bold text-zinc-700">
                {bestPerformer.habit.name}
              </span>
              <span className="text-sm font-extrabold text-primary-700">
                {bestPerformer.streak.completionRate}%
              </span>
            </div>
          )}
          {worstPerformer && bestPerformer !== worstPerformer && (
            <div className="flex items-center gap-3 rounded-2xl bg-red-50 p-3">
              <TrendingDown className="h-5 w-5 shrink-0 text-red-500" />
              <span className="flex-1 truncate text-sm font-bold text-zinc-700">
                {worstPerformer.habit.name}
              </span>
              <span className="text-sm font-extrabold text-red-500">
                {worstPerformer.streak.completionRate}%
              </span>
            </div>
          )}
        </div>
        <div className="mt-4 space-y-2">
          {performance.map(({ habit, streak }) => (
            <div key={habit.id} className="flex items-center gap-3">
              <HabitIcon
                name={habit.icon}
                color={habit.color}
                boxClassName="h-8 w-8 rounded-lg"
                iconClassName="h-4 w-4"
              />
              <span className="flex-1 truncate text-sm font-semibold text-zinc-600">
                {habit.name}
              </span>
              <span className="flex items-center gap-1 text-xs font-bold text-zinc-400">
                <Flame className="h-3.5 w-3.5 text-orange-400" /> {streak.current}
                <span className="mx-1 text-zinc-300">·</span>
                <Trophy className="h-3.5 w-3.5 text-amber-400" /> {streak.best}
              </span>
              <span className="w-12 text-right text-sm font-extrabold text-zinc-700">
                {streak.completionRate}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
