import { useState } from "react";
import { FolderKanban, Pencil, Plus, Trash2 } from "lucide-react";
import { useAuthStore } from "../../auth/stores/authStore";
import { notify } from "../../../shared/ui/notify";
import { Modal } from "../../../shared/ui/Modal";
import { Button } from "../../../shared/ui/Button";
import { EmptyState } from "../../../shared/ui/EmptyState";
import { HabitIcon } from "../../../shared/ui/HabitIcon";
import { ConfirmDialog } from "../../../shared/ui/ConfirmDialog";
import { Skeleton } from "../../../shared/ui/Skeleton";
import type { Category } from "../../../types/habit";
import { CategoryForm } from "./CategoryForm";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "../hooks/useCategories";

export function CategoryManager({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const user = useAuthStore((s) => s.user);
  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [editing, setEditing] = useState<Category | null | "new">(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  function handleSubmit(values: {
    name: string;
    icon: string | null;
    color: string;
  }) {
    if (!user) return;
    const payload = { ...values, user_id: user.id };
    if (editing === "new") {
      createCategory.mutate(payload, {
        onSuccess: () => {
          notify.success("Categoría creada");
          setEditing(null);
        },
        onError: () => notify.error("No se pudo crear la categoría."),
      });
    } else if (editing) {
      updateCategory.mutate(
        { id: editing.id, input: values },
        {
          onSuccess: () => {
            notify.success("Categoría actualizada");
            setEditing(null);
          },
          onError: () => notify.error("No se pudo actualizar la categoría."),
        },
      );
    }
  }

  function handleDelete(category: Category) {
    setCategoryToDelete(category);
  }

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={editing ? (editing === "new" ? "Nueva categoría" : "Editar categoría") : "Categorías"}
      >
      {editing ? (
        <CategoryForm
          category={editing === "new" ? null : editing}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
          submitting={createCategory.isPending || updateCategory.isPending}
        />
      ) : (
        <div className="space-y-3">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : categories && categories.length > 0 ? (
            categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center gap-3 rounded-2xl border-2 border-zinc-100 bg-white p-3"
              >
                <HabitIcon
                  name={category.icon}
                  color={category.color}
                  boxClassName="h-12 w-12 rounded-2xl"
                  iconClassName="h-6 w-6"
                />
                <span className="flex-1 text-sm font-bold text-zinc-700">
                  {category.name}
                </span>
                <button
                  type="button"
                  aria-label={`Editar ${category.name}`}
                  onClick={() => setEditing(category)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500 transition hover:bg-zinc-200"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label={`Eliminar ${category.name}`}
                  onClick={() => handleDelete(category)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500 transition hover:bg-red-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          ) : (
            <EmptyState
              icon={<FolderKanban className="h-8 w-8" />}
              title="Sin categorías"
              description="Crea categorías para organizar tus hábitos."
            />
          )}

          <Button className="w-full" onClick={() => setEditing("new")}>
            <Plus className="h-5 w-5" />
            Nueva categoría
          </Button>
        </div>
      )}
    </Modal>

    <ConfirmDialog
      open={categoryToDelete !== null}
      title="Eliminar categoría"
      message={
        categoryToDelete
          ? `¿Eliminar la categoría "${categoryToDelete.name}"? Esta acción no se puede deshacer.`
          : ""
      }
      confirmLabel="Eliminar"
      tone="danger"
      loading={deleteCategory.isPending}
      onCancel={() => setCategoryToDelete(null)}
      onConfirm={() => {
        if (!categoryToDelete) return;
        deleteCategory.mutate(categoryToDelete.id, {
          onSuccess: () => {
            notify.success("Categoría eliminada");
            setCategoryToDelete(null);
          },
          onError: (err) => {
            notify.error(
              err instanceof Error && err.message === "HAS_HABITS"
                ? "Esta categoría tiene hábitos asociados."
                : "No se pudo eliminar la categoría.",
            );
            setCategoryToDelete(null);
          },
        });
      }}
    />
    </>
  );
}
