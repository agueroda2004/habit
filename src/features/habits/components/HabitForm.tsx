import { useMemo, useState, type FormEvent } from "react";
import { cn } from "../../../shared/utils/cn";
import { Button } from "../../../shared/ui/Button";
import { Field } from "../../../shared/ui/Field";
import { Input, Textarea } from "../../../shared/ui/Input";
import { Dropdown } from "../../../shared/ui/Dropdown";
import { SegmentedControl } from "../../../shared/ui/SegmentedControl";
import { IconPicker } from "../../../shared/ui/IconPicker";
import { ColorPicker } from "../../../shared/ui/ColorPicker";
import DatePicker from "../../../shared/ui/DatePicker";
import { getHabitIcon } from "../../../shared/utils/iconRegistry";
import { DAY_SHORT, ALL_DAYS } from "../../../shared/constants/days";
import { UNIT_OPTIONS } from "../../../shared/constants/units";
import { todayISO } from "../../../shared/utils/dates";
import type { HabitFormValues, HabitWithCategory } from "../../../types/habit";
import { validateHabitForm } from "../utils/validation";
import { useCategories } from "../../categories/hooks/useCategories";

type Props = {
  habit?: HabitWithCategory | null;
  onSubmit: (values: HabitFormValues) => void;
  onCancel: () => void;
  submitting?: boolean;
};

const TYPE_OPTIONS: { value: HabitFormValues["type"]; label: string }[] = [
  { value: "boolean", label: "Sí / No" },
  { value: "numeric", label: "Cantidad" },
  { value: "duration", label: "Tiempo" },
];

const FREQ_OPTIONS: { value: HabitFormValues["frequency_type"]; label: string }[] = [
  { value: "daily", label: "Todos los días" },
  { value: "weekly", label: "Días específicos" },
];

export function HabitForm({ habit, onSubmit, onCancel, submitting }: Props) {
  const { data: categories } = useCategories();

  const [name, setName] = useState(habit?.name ?? "");
  const [description, setDescription] = useState(habit?.description ?? "");
  const [icon, setIcon] = useState<string | null>(habit?.icon ?? "target");
  const [color, setColor] = useState(habit?.color ?? "#10b981");
  const [categoryId, setCategoryId] = useState<string>(habit?.category_id ?? "");
  const [type, setType] = useState<HabitFormValues["type"]>(habit?.type ?? "boolean");
  const [targetValue, setTargetValue] = useState(
    habit?.target_value != null ? String(habit.target_value) : "",
  );
  const [unit, setUnit] = useState(habit?.unit ?? (habit?.type === "duration" ? "minutos" : ""));
  const [startDate, setStartDate] = useState(habit?.start_date ?? todayISO());
  const [endDate, setEndDate] = useState(habit?.end_date ?? "");
  const [frequency, setFrequency] = useState<HabitFormValues["frequency_type"]>(
    habit?.schedule?.frequency_type ?? "daily",
  );
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(
    habit?.schedule?.days_of_week ?? ALL_DAYS,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const endDateParsed = useMemo(
    () => (endDate ? new Date(`${endDate}T00:00:00`) : undefined),
    [endDate],
  );

  function toggleDay(day: number) {
    setDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const values: HabitFormValues = {
      name,
      description,
      icon,
      color,
      category_id: categoryId || null,
      type,
      target_value: targetValue,
      unit,
      start_date: startDate,
      end_date: endDate || null,
      frequency_type: frequency,
      days_of_week: frequency === "daily" ? ALL_DAYS : daysOfWeek,
    };
    const validation = validateHabitForm(values);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;
    onSubmit(values);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Nombre" htmlFor="habit-name" error={errors.name}>
        <Input
          id="habit-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej. Hacer ejercicio"
          autoFocus
        />
      </Field>

      <Field label="Descripción (opcional)" htmlFor="habit-desc">
        <Textarea
          id="habit-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ej. 30 minutos de cardio"
        />
      </Field>

      <Field label="Categoría" htmlFor="habit-category">
        <Dropdown
          id="habit-category"
          value={categoryId}
          onChange={setCategoryId}
          placeholder="Sin categoría"
          options={[
            { value: "", label: "Sin categoría" },
            ...(categories ?? []).map((c) => {
              const Icon = getHabitIcon(c.icon);
              return {
                value: c.id,
                label: c.name,
                icon: <Icon className="h-4 w-4" />,
              };
            }),
          ]}
        />
      </Field>

      <Field label="Tipo">
        <SegmentedControl
          options={TYPE_OPTIONS}
          value={type}
          onChange={setType}
        />
      </Field>

      {type !== "boolean" && (
        <div className="grid grid-cols-2 gap-3">
          <Field
            label={type === "duration" ? "Duración" : "Objetivo"}
            htmlFor="habit-target"
            error={errors.target_value}
          >
            <Input
              id="habit-target"
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              placeholder={type === "duration" ? "30" : "8"}
            />
          </Field>
          <Field label="Unidad" htmlFor="habit-unit" error={errors.unit}>
            <Dropdown
              id="habit-unit"
              value={unit}
              onChange={setUnit}
              placeholder="minutos"
              options={UNIT_OPTIONS.map((u) => ({ value: u, label: u }))}
            />
          </Field>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Fecha de inicio" error={errors.start_date}>
          <DatePicker
            value={startDate}
            onChange={setStartDate}
            maxDate={endDateParsed}
          />
        </Field>
        <Field label="Fecha final (opcional)" error={errors.end_date}>
          <DatePicker value={endDate} onChange={setEndDate} minDate={new Date(`${startDate}T00:00:00`)} />
        </Field>
      </div>

      <Field label="Frecuencia">
        <SegmentedControl options={FREQ_OPTIONS} value={frequency} onChange={setFrequency} />
      </Field>

      {frequency === "weekly" && (
        <div>
          <div className="flex justify-between gap-1.5">
            {ALL_DAYS.map((day) => (
              <button
                key={day}
                type="button"
                aria-pressed={daysOfWeek.includes(day)}
                onClick={() => toggleDay(day)}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold transition active:scale-90",
                  daysOfWeek.includes(day)
                    ? "bg-primary text-white shadow-[0_3px_0_0_#047857]"
                    : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200",
                )}
              >
                {DAY_SHORT[day]}
              </button>
            ))}
          </div>
          {errors.days_of_week && (
            <p className="mt-1.5 text-xs font-bold text-red-500">{errors.days_of_week}</p>
          )}
        </div>
      )}

      <Field label="Icono">
        <IconPicker value={icon} onChange={setIcon} />
      </Field>

      <Field label="Color">
        <ColorPicker value={color} onChange={setColor} />
      </Field>

      <div className="flex gap-3 pt-2">
        <Button variant="secondary" className="flex-1" onClick={onCancel} type="button">
          Cancelar
        </Button>
        <Button type="submit" className="flex-1" disabled={submitting}>
          {habit ? "Guardar" : "Crear hábito"}
        </Button>
      </div>
    </form>
  );
}
