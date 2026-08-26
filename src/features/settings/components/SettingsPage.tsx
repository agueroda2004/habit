import { useState } from "react";
import { Archive, FolderKanban, LogOut, RotateCcw, Trash2, UserCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabase/client";
import { useAuthStore } from "../../auth/stores/authStore";
import { notify } from "../../../shared/ui/notify";
import { Button } from "../../../shared/ui/Button";
import { Card } from "../../../shared/ui/Card";
import { EmptyState } from "../../../shared/ui/EmptyState";
import { HabitIcon } from "../../../shared/ui/HabitIcon";
import { ConfirmDialog } from "../../../shared/ui/ConfirmDialog";
import { Skeleton } from "../../../shared/ui/Skeleton";
import { CategoryManager } from "../../categories/components/CategoryManager";
import type { HabitWithCategory } from "../../../types/habit";
import {
  useDeleteHabit,
  useHabitsData,
  useRestoreHabit,
} from "../../habits/hooks/useHabits";

export function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<HabitWithCategory | null>(null);

  const { data: archived, isLoading } = useHabitsData(true);
  const archivedHabits = (archived ?? []).filter((h) => h.archived_at);
  const restoreMutation = useRestoreHabit();
  const deleteMutation = useDeleteHabit();

  async function handleLogout() {
    await supabase.auth.signOut();
    notify.info("Sesión cerrada");
    navigate("/login");
  }

  return (
    <div>
      <h1 className="mb-5 text-2xl font-extrabold tracking-tight text-zinc-800">
        Ajustes
      </h1>

      <Card className="mb-4 flex items-center gap-4 p-5">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary-100 text-3xl">
          {user?.email ? (
            <span className="text-2xl font-extrabold text-primary-700">
              {user.email.charAt(0).toUpperCase()}
            </span>
          ) : (
            <UserCircle2 className="h-8 w-8 text-primary-600" />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-lg font-extrabold text-zinc-800">{user?.email}</p>
          <p className="text-sm font-medium text-zinc-400">Cuenta conectada</p>
        </div>
      </Card>

      <Button variant="secondary" className="mb-4 w-full" onClick={() => setCategoriesOpen(true)}>
        <FolderKanban className="h-5 w-5" />
        Administrar categorías
      </Button>

      <div className="mb-4">
        <h2 className="mb-2 px-1 text-sm font-extrabold uppercase tracking-wide text-zinc-400">
          Hábitos archivados
        </h2>
        {isLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : archivedHabits.length === 0 ? (
          <EmptyState
            icon={<Archive className="h-8 w-8" />}
            title="Sin hábitos archivados"
            description="Cuando archives un hábito aparecerá aquí."
          />
        ) : (
          <div className="space-y-3">
            {archivedHabits.map((habit) => (
              <div key={habit.id} className="flex items-center gap-3 rounded-2xl border-2 border-zinc-100 bg-white p-3">
                <HabitIcon
                  name={habit.icon}
                  color={habit.color}
                  boxClassName="h-11 w-11 rounded-xl opacity-60"
                />
                <span className="flex-1 truncate text-sm font-bold text-zinc-600">
                  {habit.name}
                </span>
                <button
                  type="button"
                  aria-label={`Restaurar ${habit.name}`}
                  onClick={() =>
                    restoreMutation.mutate(habit.id, {
                      onSuccess: () => notify.success("Hábito restaurado"),
                      onError: () => notify.error("No se pudo restaurar."),
                    })
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-600 transition hover:bg-primary-100"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label={`Eliminar ${habit.name}`}
                  onClick={() => setHabitToDelete(habit)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-500 transition hover:bg-red-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Button variant="danger" className="w-full" onClick={handleLogout}>
        <LogOut className="h-5 w-5" />
        Cerrar sesión
      </Button>

      <CategoryManager open={categoriesOpen} onClose={() => setCategoriesOpen(false)} />

      <ConfirmDialog
        open={habitToDelete !== null}
        title="Eliminar hábito"
        message={
          habitToDelete
            ? `¿Eliminar definitivamente "${habitToDelete.name}"? Se perderán todos sus datos y estadísticas.`
            : ""
        }
        confirmLabel="Eliminar"
        tone="danger"
        loading={deleteMutation.isPending}
        onCancel={() => setHabitToDelete(null)}
        onConfirm={() => {
          if (!habitToDelete) return;
          deleteMutation.mutate(habitToDelete.id, {
            onSuccess: () => {
              notify.success("Hábito eliminado");
              setHabitToDelete(null);
            },
            onError: () => {
              notify.error("No se pudo eliminar.");
              setHabitToDelete(null);
            },
          });
        }}
      />
    </div>
  );
}
