import { BarChart3, CalendarDays, House, Settings } from "lucide-react";

export const NAV_ITEMS = [
  { to: "/", label: "Hoy", icon: House },
  { to: "/history", label: "Historial", icon: CalendarDays },
  { to: "/statistics", label: "Stats", icon: BarChart3 },
  { to: "/settings", label: "Ajustes", icon: Settings },
];
