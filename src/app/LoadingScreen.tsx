import { ListChecks, Loader2 } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-zinc-50">
      <div className="animate-pop flex h-20 w-20 items-center justify-center rounded-3xl bg-primary text-white shadow-lg shadow-primary/30">
        <ListChecks className="h-11 w-11" strokeWidth={2.5} />
      </div>
      <div className="flex items-center gap-2 text-sm font-semibold text-zinc-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        Cargando…
      </div>
    </div>
  );
}
