import type { HabitFormValues } from "../../../types/habit";

export function validateHabitForm(values: HabitFormValues): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!values.name.trim()) errors.name = "El nombre es obligatorio.";
  if (!values.start_date) errors.start_date = "Selecciona una fecha de inicio.";
  if (values.end_date && values.end_date < values.start_date) {
    errors.end_date = "Debe ser posterior a la fecha de inicio.";
  }
  if (values.frequency_type === "weekly" && values.days_of_week.length === 0) {
    errors.days_of_week = "Selecciona al menos un día.";
  }
  if (values.type !== "boolean") {
    const target = Number(values.target_value);
    if (!values.target_value) {
      errors.target_value = "Ingresa un objetivo.";
    } else if (Number.isNaN(target) || target <= 0) {
      errors.target_value = "Debe ser un número mayor a 0.";
    }
    if (!values.unit.trim()) {
      errors.unit = "Ingresa una unidad.";
    }
  }

  return errors;
}
