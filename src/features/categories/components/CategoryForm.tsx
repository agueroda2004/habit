import { useState, type FormEvent } from "react";
import { Button } from "../../../shared/ui/Button";
import { Field } from "../../../shared/ui/Field";
import { IconPicker } from "../../../shared/ui/IconPicker";
import { ColorPicker } from "../../../shared/ui/ColorPicker";
import { Input } from "../../../shared/ui/Input";
import type { Category } from "../../../types/habit";

type Props = {
  category?: Category | null;
  onSubmit: (values: { name: string; icon: string | null; color: string }) => void;
  onCancel: () => void;
  submitting?: boolean;
};

export function CategoryForm({ category, onSubmit, onCancel, submitting }: Props) {
  const [name, setName] = useState(category?.name ?? "");
  const [icon, setIcon] = useState<string | null>(category?.icon ?? "folder");
  const [color, setColor] = useState(category?.color ?? "#10b981");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }
    onSubmit({ name: name.trim(), icon, color });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Nombre" htmlFor="cat-name" error={error ?? undefined}>
        <Input
          id="cat-name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError(null);
          }}
          placeholder="Ej. Salud, Aprendizaje…"
          autoFocus
        />
      </Field>

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
          {category ? "Guardar" : "Crear"}
        </Button>
      </div>
    </form>
  );
}
