# Hábitos — PWA de seguimiento de hábitos

Aplicación personal de hábitos (mobile-first, instalable como PWA), construida con
React + TypeScript + Tailwind CSS + Vite + Supabase.

## Stack

- React 19, TypeScript, Tailwind CSS v4
- Vite + `vite-plugin-pwa` (manifest + service worker)
- Supabase (Auth + PostgreSQL + RLS)
- TanStack Query (server state), Zustand (sesión), react-hot-toast

## Requisitos previos

1. Tener un proyecto Supabase existente (no crear uno nuevo).
2. Crear un usuario en **Authentication → Users** en la consola de Supabase
   (esta app solo permite login, no signup).
3. Ejecutar la migración en el **SQL Editor**:
   `supabase/migrations/0001_init.sql`
   (crea `categories_habit`, `habits`, `habit_schedules`, `habit_logs`, índices y RLS).
4. Crear el archivo `.env` en la raíz:

```
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-public-key
```

> Usa solo la **anon/publishable key**. Nunca expongas la service role key en el frontend.

## Comandos

```bash
pnpm install
pnpm dev        # servidor de desarrollo
pnpm build      # build de producción + PWA
pnpm preview    # previsualizar el build
pnpm lint       # eslint
```

## Scripts

- `scripts/gen-icons.ps1` — regenera los iconos PWA (`public/icons/*.png`).

## Estructura

```
src/
├── app/            # layout, navegación, providers
├── features/       # auth, habits, categories, dashboard, history, statistics, settings
├── pages/          # (rutas delgadas que delegan en features)
├── shared/         # ui (incluye DatePicker), hooks, utils, constants
├── lib/supabase/   # cliente tipado
└── types/          # database.ts (tipos Supabase) y domain types
```

## Notas

- Solo login con email + contraseña (sin registro).
- Las categorías iniciales (Salud, Aprendizaje, Productividad, Personal) se crean
  automáticamente la primera vez si no existen.
- El Date Picker compartido está en `src/shared/ui/DatePicker.tsx`.
- Los hábitos se archivan (no se eliminan) y se administran desde Ajustes.
