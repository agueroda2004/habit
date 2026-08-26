import { Outlet } from "react-router-dom";
import { BottomNavigation } from "./BottomNavigation";
import { NAV_ITEMS } from "./navItems";
import { NavLink } from "react-router-dom";
import { ListChecks } from "lucide-react";
import { cn } from "../shared/utils/cn";
import { useSeedDefaultCategories } from "../features/categories/hooks/useSeedDefaultCategories";

export function AppLayout() {
  useSeedDefaultCategories();

  return (
    <div className="min-h-dvh">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-zinc-200 bg-white px-4 py-6 md:flex">
        <div className="mb-8 flex items-center gap-2 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-white">
            <ListChecks className="h-6 w-6" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-extrabold text-zinc-800">Hábitos</span>
        </div>
        <nav aria-label="Navegación principal" className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold transition",
                  isActive
                    ? "bg-primary-100 text-primary-700"
                    : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700",
                )
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </nav>
        <p className="px-2 text-xs font-medium text-zinc-400">Hábitos · V1</p>
      </aside>

      <main className="pb-24 pt-[max(1.25rem,env(safe-area-inset-top))] md:pb-12 md:pl-60">
        <div className="mx-auto w-full max-w-xl px-4 md:max-w-3xl md:px-8">
          <Outlet />
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
