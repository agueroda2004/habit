import type { LabelHTMLAttributes } from "react";
import { cn } from "../utils/cn";

export function Field({
  label,
  hint,
  error,
  children,
  htmlFor,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
} & Pick<LabelHTMLAttributes<HTMLLabelElement>, "htmlFor">) {
  return (
    <div className={cn("mb-4", className)}>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-sm font-bold text-zinc-600"
      >
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs font-medium text-zinc-400">{hint}</p>}
      {error && <p className="mt-1 text-xs font-bold text-red-500">{error}</p>}
    </div>
  );
}
