import { useState } from 'react';
import { api, saveSession } from '../lib/api';

interface LoginPageProps {
  onLogin: (role: string, email: string) => void;
}

const DEMO_ACCOUNTS = [
  { email: 'client@cinestanley.com', role: 'Cliente' },
  { email: 'staff@cinestanley.com', role: 'Recepcionista' },
  { email: 'admin@cinestanley.com', role: 'Administrador' },
];

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('client@cinestanley.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.login(email, password);
      saveSession(res.token, res.role);
      onLogin(res.role, email);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative grid flex-1 place-items-center overflow-hidden px-5 py-10">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 animate-float rounded-full bg-gradient-to-br from-[#fb923c]/25 via-[#f97316]/15 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-24 h-80 w-80 animate-float rounded-full bg-gradient-to-tr from-[var(--color-verde)]/15 to-transparent blur-3xl" />

      <div className="relative w-full max-w-md animate-fade">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-[#4ade80] via-[#22c55e] to-[#16a34a] text-3xl font-black text-[#052e16] shadow-[0_10px_40px_-8px_rgba(34,197,94,0.7)] glow-green">
            C
          </span>
          <h1 className="text-3xl font-black tracking-tight">
            Cine<span className="text-[var(--color-verde)]">Stanley</span>
          </h1>
          <p className="mt-1.5 text-sm text-slate-400">
            Sistema de gestión y reserva de cine
          </p>
          <span className="mx-auto mt-4 block h-px w-24 bg-gradient-to-r from-transparent via-[var(--color-verde)]/50 to-transparent" />
        </div>

        <form
          onSubmit={handleSubmit}
          className="card space-y-4 p-6 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.9)]"
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Correo</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Contraseña</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
          )}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="mt-6 text-center text-[11px] uppercase tracking-widest text-slate-500">
          Acceso rápido de demostración
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.email}
              onClick={() => {
                setEmail(acc.email);
                setPassword('password123');
              }}
              className="rounded-full border border-[var(--color-ink-line)] px-3 py-1 text-xs text-slate-400 transition hover:border-[var(--color-naranja)] hover:bg-[var(--color-naranja)]/10 hover:text-[var(--color-naranja-soft)]"
            >
              {acc.role}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
