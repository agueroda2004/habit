export const queryKeys = {
  categories: ["categories"] as const,
  habits: (includeArchived: boolean) => ["habits", includeArchived] as const,
  schedules: ["schedules"] as const,
  logs: (date: string) => ["logs", date] as const,
  logsRange: (from: string, to: string) => ["logs", from, to] as const,
};
