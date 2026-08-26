import { Archive } from "lucide-react";
import { useState } from "react";
import { Modal } from "../../../shared/ui/Modal";
import { notify } from "../../../shared/ui/notify";
import { Button } from "../../../shared/ui/Button";
import { ConfirmDialog } from "../../../shared/ui/ConfirmDialog";
import { ALL_DAYS } from "../../../shared/constants/days";
import { useAuthStore } from "../../auth/stores/authStore";
import type { HabitFormValues, HabitWithCategory } from "../../../types/habit";
import { HabitForm } from "./HabitForm";
import { useArchiveHabit, useCreateHabit, useUpdateHabit } from "../hooks/useHabits";

type Props = {
  open: boolean;
  onClose: () => void;
  habit: HabitWithCategory | null;
};

export function HabitModal({ open, onClose, habit }: Props) {
  const user = useAuthStore((s) => s.user);
  const createMutation = useCreateHabit();
  const updateMutation = useUpdateHabit();
  const archiveMutation = useArchiveHabit();
  const [archiveOpen, setArchiveOpen] = useState(false);
  const submitting =
    createMutation.isPending || updateMutation.isPending || archiveMutation.isPending;

  function handleSubmit(values: HabitFormValues) {
    if (!user) return;
    const target = values.type === "boolean" ? null : Number(values.target_value);
    const base = {
      name: values.name,
      description: values.description.trim() || null,
      icon: values.icon,
      color: values.color,
      category_id: values.category_id,
      type: values.type,
      target_value: target,
      unit: values.type === "boolean" ? null : values.unit.trim(),
      start_date: values.start_date,
      end_date: values.end_date,
    };
    const schedule = {
      frequency_type: values.frequency_type,
      days_of_week:
        values.frequency_type === "daily" ? ALL_DAYS : values.days_of_week,
    };

    if (habit) {
      updateMutation.mutate(
        { id: habit.id, habit: base, schedule },
        {
          onSuccess: () => {
            notify.success("Hábito actualizado");
            onClose();
          },
          onError: () => notify.error("No se pudo guardar el hábito."),
        },
      );
      return;
    }

    createMutation.mutate(
      { habit: { ...base, user_id: user.id }, schedule },
      {
        onSuccess: () => {
          notify.success("¡Hábito creado!");
          onClose();
        },
        onError: () => notify.error("No se pudo crear el hábito."),
      },
    );
  }

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={habit ? "Editar hábito" : "Nuevo hábito"}
      >
        {habit && (
          <Button
            variant="soft"
            className="mb-4 w-full"
            onClick={() => setArchiveOpen(true)}
          >
            <Archive className="h-4 w-4" />
            Archivar hábito
          </Button>
        )}
        <HabitForm
          habit={habit}
          onSubmit={handleSubmit}
          onCancel={onClose}
          submitting={submitting}
        />
      </Modal>

      <ConfirmDialog
        open={archiveOpen}
        title="Archivar hábito"
        message={
          habit
            ? `¿Archivar "${habit.name}"? Dejará de aparecer en el dashboard, pero conservarás su historial.`
            : ""
        }
        confirmLabel="Archivar"
        loading={archiveMutation.isPending}
        onCancel={() => setArchiveOpen(false)}
        onConfirm={() => {
          if (!habit) return;
          archiveMutation.mutate(habit.id, {
            onSuccess: () => {
              notify.success("Hábito archivado");
              setArchiveOpen(false);
              onClose();
            },
            onError: () => notify.error("No se pudo archivar."),
          });
        }}
      />
    </>
  );
}
