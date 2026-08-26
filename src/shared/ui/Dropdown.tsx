import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "../utils/cn";

type DropdownOption = {
  value: string;
  label: string;
  icon?: ReactNode;
};

type DropdownProps = {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  id?: string;
};

export function Dropdown({
  options,
  value,
  onChange,
  placeholder = "Seleccionar",
  disabled = false,
  label,
  id,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value) ?? null;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "flex h-12 w-full items-center justify-between gap-2 rounded-2xl border-2 bg-zinc-50 px-4 text-left text-sm font-medium text-zinc-800 outline-none transition focus:border-primary-400 focus:bg-white disabled:opacity-50",
          open ? "border-primary bg-white" : "border-zinc-200 hover:border-zinc-300",
        )}
      >
        {selected ? (
          <span className="flex min-w-0 items-center gap-2">
            {selected.icon && (
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-700">
                {selected.icon}
              </span>
            )}
            <span className="truncate">{selected.label}</span>
          </span>
        ) : (
          <span className="text-zinc-400">{placeholder}</span>
        )}
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-zinc-400 transition", open && "rotate-180")}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-1 max-h-64 animate-scale-in overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-lg"
        >
          {options.length === 0 ? (
            <p className="px-3 py-2 text-sm font-medium text-zinc-400">Sin opciones</p>
          ) : (
            options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition",
                    isSelected
                      ? "bg-primary-50 text-primary-700"
                      : "text-zinc-700 hover:bg-zinc-100",
                  )}
                >
                  {option.icon && (
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                        isSelected ? "bg-primary-100 text-primary-700" : "bg-zinc-100 text-zinc-500",
                      )}
                    >
                      {option.icon}
                    </span>
                  )}
                  <span className="flex-1 truncate">{option.label}</span>
                  {isSelected && <Check className="h-4 w-4 shrink-0" strokeWidth={3} />}
                </button>
              );
            })
          )}
        </div>
      )}

      {label && (
        <span className="sr-only">
          {label}
          {selected ? `: ${selected.label}` : ""}
        </span>
      )}
    </div>
  );
}
