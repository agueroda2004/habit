import { useState, type FormEvent } from "react";
import { ListChecks, LogIn } from "lucide-react";
import { supabase } from "../../../lib/supabase/client";
import { cn } from "../../../shared/utils/cn";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Ingresa tu correo y contraseña.");
      return;
    }
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);

    if (authError) {
      setError(
        authError.message.includes("Invalid login credentials")
          ? "Correo o contraseña incorrectos."
          : "Algo salió mal. Inténtalo de nuevo.",
      );
      return;
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-primary-50 via-primary-100/60 to-primary-200/40 px-4 py-10">
      <div className="w-full max-w-sm animate-fade-up">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="animate-pop flex h-20 w-20 items-center justify-center rounded-3xl bg-primary text-white shadow-lg shadow-primary/30">
            <ListChecks className="h-11 w-11" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-800">
            Hábitos
          </h1>
          <p className="text-sm font-medium text-zinc-500">
            Crea tu mejor versión, un día a la vez.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-zinc-100 bg-white p-6 shadow-xl shadow-zinc-200/50"
        >
          <label className="mb-1.5 block text-sm font-bold text-zinc-600" htmlFor="login-email">
            Correo
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            className="mb-4 h-12 w-full rounded-2xl border-2 border-zinc-200 bg-zinc-50 px-4 text-base font-medium text-zinc-800 outline-none transition placeholder:text-zinc-400 focus:border-primary-400 focus:bg-white"
          />

          <label className="mb-1.5 block text-sm font-bold text-zinc-600" htmlFor="login-password">
            Contraseña
          </label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="mb-5 h-12 w-full rounded-2xl border-2 border-zinc-200 bg-zinc-50 px-4 text-base font-medium text-zinc-800 outline-none transition placeholder:text-zinc-400 focus:border-primary-400 focus:bg-white"
          />

          {error && (
            <p
              role="alert"
              className="mb-4 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={cn(
              "flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-base font-extrabold text-white transition active:translate-y-0.5",
              "bg-primary shadow-[0_4px_0_0_#047857] hover:brightness-105 disabled:opacity-60",
            )}
          >
            {loading ? (
              "Entrando…"
            ) : (
              <>
                <LogIn className="h-5 w-5" />
                Iniciar sesión
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
