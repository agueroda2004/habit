import type { ButtonHTMLAttributes } from "react";
import { cn } from "../utils/cn";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  active?: boolean;
};

export function IconButton({ label, active, className, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-2xl transition active:scale-95 disabled:opacity-40",
        active
          ? "bg-primary-100 text-primary-700"
          : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700",
        className,
      )}
      {...props}
    />
  );
}
