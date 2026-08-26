import { createElement } from "react";
import { cn } from "../utils/cn";
import { getHabitIcon } from "../utils/iconRegistry";

type HabitIconProps = {
  name?: string | null;
  color?: string;
  boxClassName?: string;
  iconClassName?: string;
};

export function HabitIcon({ name, color, boxClassName, iconClassName }: HabitIconProps) {
  const Icon = getHabitIcon(name);
  return (
    <span
      className={cn(
        "flex items-center justify-center rounded-2xl",
        boxClassName,
      )}
      style={color ? { backgroundColor: `${color}1f`, color } : undefined}
    >
      {createElement(Icon, {
        className: cn("h-5 w-5", iconClassName),
        strokeWidth: 2.25,
      })}
    </span>
  );
}
