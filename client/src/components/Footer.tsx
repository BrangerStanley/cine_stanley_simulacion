import { useEffect, useRef, useState } from 'react';

const CURRENT_YEAR = new Date().getFullYear();

export default function Footer() {
  const [isOpen, setIsOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousFocus = document.activeElement;
    closeButtonRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [isOpen]);

  return (
    <>
      <footer className="border-t border-[var(--color-ink-line)] bg-[var(--color-ink-soft)]/90 px-5 py-4">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <p className="font-bold tracking-tight">
            Cine<span className="text-[var(--color-verde)]">Stanley</span>
          </p>
          <p className="text-center text-xs text-slate-400">
            Sistema de gestión y reserva de cine · © {CURRENT_YEAR}
          </p>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-ink-line)] px-3 py-2 text-xs text-slate-300 transition hover:border-[var(--color-verde)]/60 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-verde)]"
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="9" cy="8" r="3" />
              <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 5.5a3 3 0 0 1 0 5.8M17.5 14.5c2.1.7 3.5 2.7 3.5 5.5" />
            </svg>
            Página web diseñada por
          </button>
        </div>
      </footer>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={(event) => {
            if (event.target === event.currentTarget) setIsOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="developer-modal-title"
            className="relative w-full max-w-lg animate-fade rounded-2xl border border-[var(--color-ink-line)] bg-[var(--color-ink-soft)] p-6 shadow-2xl"
          >
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Cerrar"
              className="absolute right-4 top-4 rounded-lg px-2 py-1 text-xl leading-none text-slate-400 transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-verde)]"
            >
              ×
            </button>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-verde)]">
              Desarrollo de software
            </p>
            <h2 id="developer-modal-title" className="mt-2 text-xl font-bold">
              Página web diseñada por
            </h2>
            <div className="mt-6 flex flex-col items-center gap-5 sm:flex-row">
              <img
                src="/Stanley.jpeg"
                alt="Ilustración de Stanley"
                className="h-32 w-32 shrink-0 rounded-2xl border border-white/10 object-cover"
                loading="lazy"
              />
              <div className="text-center sm:text-left">
                <h3 className="text-lg font-bold">Branger Stanley</h3>
                <p className="mt-1 text-sm text-slate-400">Desarrollador</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                  <a
                    href="mailto:cuentadebranger@gmail.com"
                    className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-ink-line)] px-3 py-1.5 text-xs text-slate-300 transition hover:border-[var(--color-verde)]/60 hover:text-white"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="15"
                      height="15"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="m3 7 9 6 9-6" />
                    </svg>
                    Correo
                  </a>
                  <a
                    href="https://github.com/BrangerStanley"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-ink-line)] px-3 py-1.5 text-xs text-slate-300 transition hover:border-[var(--color-verde)]/60 hover:text-white"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="15"
                      height="15"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.56.1.76-.24.76-.54v-2.08c-3.1.67-3.76-1.32-3.76-1.32-.5-1.28-1.24-1.62-1.24-1.62-1.01-.69.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15.99 1.7 2.6 1.2 3.23.91.1-.72.39-1.2.7-1.48-2.47-.28-5.06-1.24-5.06-5.5 0-1.22.44-2.22 1.15-3-.12-.28-.5-1.42.11-2.96 0 0 .94-.3 3.05 1.15a10.6 10.6 0 0 1 5.55 0c2.11-1.44 3.05-1.15 3.05-1.15.61 1.54.23 2.68.11 2.96.72.78 1.15 1.78 1.15 3 0 4.27-2.6 5.22-5.08 5.49.4.35.76 1.02.76 2.06v3.07c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z" />
                    </svg>
                    GitHub
                  </a>
                    <a
                      href="https://www.facebook.com/people/Stanleyzip-Programmer-Edition/61596773874150/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-ink-line)] px-3 py-1.5 text-xs text-slate-300 transition hover:border-[var(--color-verde)]/60 hover:text-white"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="15"
                        height="15"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.7V3.9c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3V10H7.3v3h2.8v8h3.4Z" />
                      </svg>
                      Facebook
                    </a>
                  <a
                    href="https://instagram.com/br_stanley"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-ink-line)] px-3 py-1.5 text-xs text-slate-300 transition hover:border-[var(--color-verde)]/60 hover:text-white"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="15"
                      height="15"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                    </svg>
                    Instagram
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
