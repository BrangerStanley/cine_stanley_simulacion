import type { Role } from '../types';

interface NavbarProps {
  role: Role | null;
  email: string;
  onLogout: () => void;
  active: string;
  onNavigate: (view: string) => void;
}

const NAV_BY_ROLE: Record<Role, { key: string; label: string }[]> = {
  CLIENT: [{ key: 'cartelera', label: 'Cartelera' }],
  STAFF: [{ key: 'taquilla', label: 'Taquilla' }],
  ADMIN: [
    { key: 'admin', label: 'Panel' },
    { key: 'cartelera', label: 'Cartelera' },
    { key: 'taquilla', label: 'Taquilla' },
  ],
};

export default function Navbar({ role, email, onLogout, active, onNavigate }: NavbarProps) {
  const items = role ? NAV_BY_ROLE[role] : [];

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--color-ink-line)] bg-[var(--color-ink-soft)]/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5">
        <button
          onClick={() => onNavigate(role === 'ADMIN' ? 'admin' : role === 'STAFF' ? 'taquilla' : 'cartelera')}
          className="group flex items-center gap-2.5"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#4ade80] to-[#22c55e] text-lg font-black text-[#052e16] shadow-[0_6px_20px_-6px_rgba(34,197,94,0.6)] transition group-hover:scale-105">
            C
          </span>
          <span className="text-lg font-bold tracking-tight">
            Cine<span className="text-[var(--color-verde)]">Stanley</span>
          </span>
        </button>

        <nav className="flex items-center gap-1">
          {items.map((item) => (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`relative rounded-lg px-3 py-1.5 text-sm transition ${
                active === item.key
                  ? 'bg-[var(--color-naranja)]/12 text-[var(--color-naranja-soft)]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {item.label}
              {active === item.key && (
                <span className="absolute inset-x-2 -bottom-[3px] h-[2px] rounded-full bg-gradient-to-r from-[#fb923c] to-[#f97316]" />
              )}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-xs text-slate-400">{email}</p>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-naranja-soft)]">
              {role}
            </p>
          </div>
          <button onClick={onLogout} className="btn-ghost text-sm">
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}
