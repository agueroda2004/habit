import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Modal } from "../../../shared/ui/Modal";
import { Button } from "../../../shared/ui/Button";
import { Input } from "../../../shared/ui/Input";
import { ProgressBar } from "../../../shared/ui/ProgressBar";
import { HabitIcon } from "../../../shared/ui/HabitIcon";
import { cn } from "../../../shared/utils/cn";
import type { HabitWithCategory } from "../../../types/habit";

type Props = {
  open: boolean;
  habit: HabitWithCategory | null;
  currentValue: number;
  onClose: () => void;
  onApply: (delta: number) => void;
  loading?: boolean;
};

export function ProgressSelector({
  open,
  habit,
  currentValue,
  onClose,
  onApply,
  loading,
}: Props) {
  const [amount, setAmount] = useState("10");

  if (!habit) return null;

  const target = habit.target_value ?? 0;
  const value = currentValue;
  const completed = target > 0 ? value >= target : value > 0;
  const parsed = Number(amount);
  const isValid = !Number.isNaN(parsed) && parsed > 0;
  const unit = habit.unit ? ` ${habit.unit}` : "";
  const color = habit.color || "#10b981";

  function handleApply(sign: 1 | -1) {
    if (!isValid) return;
    onApply(sign * parsed);
  }

  function preset(value: string) {
    setAmount(value);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Registrar progreso"
    >
      <div className="flex flex-col items-center gap-5 pt-2 text-center">
        <HabitIcon
          name={habit.icon}
          color={color}
          boxClassName="h-16 w-16"
          iconClassName="h-8 w-8"
        />
        <div>
          <h3 className="text-lg font-extrabold text-zinc-800">{habit.name}</h3>
          <p className="text-sm font-semibold text-zinc-500">
            {target > 0 ? `${value} / ${target}${unit}` : `${value}${unit}`}
          </p>
        </div>

        <div className="w-full">
          <ProgressBar
            value={value}
            max={target > 0 ? target : Math.max(value, 1)}
            color={color}
            className="h-4"
          />
        </div>

        {completed && (
          <p className="rounded-full bg-primary-100 px-4 py-1.5 text-sm font-extrabold text-primary-700">
            ¡Objetivo alcanzado!
          </p>
        )}

        <div className="w-full rounded-2xl bg-zinc-50 p-3">
          <p className="mb-2 text-left text-xs font-bold uppercase tracking-wide text-zinc-400">
            Cantidad a registrar
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              className="h-12 w-12 shrink-0 px-0"
              onClick={() => handleApply(-1)}
              disabled={!isValid || value <= 0 || loading}
              aria-label="Restar"
            >
              <Minus className="h-5 w-5" />
            </Button>
            <Input
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-center font-bold"
              aria-label="Cantidad a registrar"
            />
            <Button
              variant="primary"
              className="h-12 w-12 shrink-0 px-0"
              onClick={() => handleApply(1)}
              disabled={!isValid || loading}
              aria-label="Sumar"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>

          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {["1", "5", "10", "15", "30"].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => preset(p)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm font-bold transition",
                  amount === p
                    ? "bg-primary text-white"
                    : "bg-white text-zinc-500 hover:bg-zinc-100",
                )}
              >
                +{p}
              </button>
            ))}
          </div>
        </div>

        <div className="flex w-full gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onClose}
            disabled={loading}
            type="button"
          >
            Cerrar
          </Button>
          <Button
            className="flex-1"
            onClick={() => handleApply(1)}
            disabled={!isValid || loading}
            type="button"
          >
            {loading ? "Guardando…" : "Sumar"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
