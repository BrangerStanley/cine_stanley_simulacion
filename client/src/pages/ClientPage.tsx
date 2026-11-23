import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { Movie, FunctionItem, Reservation } from '../types';
import SeatMap from '../components/SeatMap';
import TrailerModal from '../components/TrailerModal';

export default function ClientPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [active, setActive] = useState<{ movie: Movie; func: FunctionItem } | null>(null);
  const [occupied, setOccupied] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [paymentText, setPaymentText] = useState('');
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [reserving, setReserving] = useState(false);
  const [tickets, setTickets] = useState<Reservation[] | null>(null);
  const [trailer, setTrailer] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    api
      .movies()
      .then(setMovies)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function openFunction(movie: Movie, func: FunctionItem) {
    setActive({ movie, func });
    setSelected([]);
    setTickets(null);
    try {
      const { occupiedSeats } = await api.seats(func.id);
      setOccupied(occupiedSeats);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar asientos');
    }
  }

  function toggleSeat(seat: string) {
    setSelected((prev) =>
      prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat],
    );
  }

  async function reserve() {
    if (!active || selected.length === 0 || !customerName.trim()) return;
    if (!paymentText.trim() && !paymentFile) {
      setError('Debes adjuntar un comprobante de pago (imagen o texto).');
      return;
    }
    setReserving(true);
    setError('');
    try {
      const res = await api.createReservation(
        active.func.id,
        selected,
        customerName.trim(),
        paymentText.trim(),
        paymentFile,
      );
      setTickets(res.reservations);
      setOccupied((prev) => [...prev, ...selected]);
      setSelected([]);
      setCustomerName('');
      setPaymentText('');
      setPaymentFile(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al reservar');
    } finally {
      setReserving(false);
    }
  }

  if (loading) {
    return <p className="py-20 text-center text-slate-400">Cargando cartelera...</p>;
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <span className="accent-bar mb-3 block" />
      <h1 className="text-2xl font-black tracking-tight">
        Cartelera <span className="text-gradient-brand">hoy</span>
      </h1>
      <p className="mt-1 text-sm text-slate-400">
        Elige una película, función y tus asientos. Tu reserva se activa cuando recepción aprueba el pago.
      </p>

      {error && (
        <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
      )}

      {!active && (
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {movies.map((movie) => (
            <article key={movie.id} className="card card-hover animate-fade overflow-hidden">
              <div className="relative h-44 bg-gradient-to-br from-[#f97316]/25 via-[var(--color-ink-soft)] to-[var(--color-ink)]">
                {movie.posterUrl ? (
                  <img
                    src={movie.posterUrl}
                    alt={`Póster de ${movie.title}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-end p-4">
                    <h2 className="text-xl font-bold leading-tight">{movie.title}</h2>
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-3">
                  <h2 className="text-lg font-bold leading-tight">{movie.title}</h2>
                </div>
                {movie.trailerUrl && (
                  <button
                    onClick={() => setTrailer({ url: movie.trailerUrl!, title: movie.title })}
                    className="absolute right-3 top-3 rounded-full bg-gradient-to-br from-[var(--color-verde)] to-[#16a34a] px-3 py-1.5 text-xs font-bold text-[#052e16] shadow-[0_6px_18px_-6px_rgba(34,197,94,0.7)] transition hover:scale-105"
                  >
                    ▶ Tráiler
                  </button>
                )}
              </div>
              <div className="space-y-3 p-4">
                <p className="line-clamp-2 text-sm text-slate-400">{movie.description}</p>
                <p className="text-xs font-medium text-[var(--color-verde)]">
                  {movie.duration} min
                </p>
                <div className="space-y-2">
                  {movie.functions.length === 0 && (
                    <p className="text-xs text-slate-500">Sin funciones programadas</p>
                  )}
                  {movie.functions.map((func) => (
                    <button
                      key={func.id}
                      onClick={() => openFunction(movie, func)}
                      className="flex w-full items-center justify-between rounded-lg border border-[var(--color-ink-line)] px-3 py-2 text-left text-sm transition hover:border-[var(--color-verde)]/70 hover:bg-[var(--color-verde)]/5"
                    >
                      <span>{func.theater.name}</span>
                      <span className="text-[var(--color-verde)]">
                        {new Date(func.startTime).toLocaleString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {active && (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="card p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">{active.movie.title}</h2>
                <p className="text-sm text-slate-400">
                  {active.func.theater.name} ·{' '}
                  {new Date(active.func.startTime).toLocaleString('es-ES', {
                    day: '2-digit',
                    month: 'long',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <button onClick={() => setActive(null)} className="btn-ghost text-sm">
                Volver
              </button>
            </div>
            <SeatMap
              capacity={active.func.theater.capacity}
              occupied={occupied}
              selected={selected}
              onToggle={toggleSeat}
            />
          </div>

          <aside className="card h-fit space-y-4 p-6">
            <h3 className="font-bold">Tu reserva</h3>
            <div>
              <label className="mb-1.5 block text-sm text-slate-300">Nombre del cliente</label>
              <input
                className="input"
                placeholder="Nombre completo"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>

            <div className="space-y-2 rounded-xl border border-[var(--color-ink-line)] p-3">
              <p className="text-sm font-semibold text-slate-200">Comprobante de pago</p>
              <p className="text-[11px] text-slate-500">
                Adjunta una imagen del pago o escribe una referencia (nº de operación).
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPaymentFile(e.target.files?.[0] ?? null)}
                className="w-full text-xs text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--color-verde)] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#052e16]"
              />
              {paymentFile && (
                <p className="truncate text-[11px] text-[var(--color-verde)]">
                  {paymentFile.name}
                </p>
              )}
              <input
                className="input text-sm"
                placeholder="Referencia de pago (texto)"
                value={paymentText}
                onChange={(e) => setPaymentText(e.target.value)}
              />
            </div>

            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Asientos</span>
                <span className="font-semibold text-white">
                  {selected.length ? selected.join(', ') : '—'}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total ({selected.length} × $10)</span>
                <span className="font-semibold text-[var(--color-verde)]">
                  ${selected.length * 10}
                </span>
              </div>
            </div>
            <button
              onClick={reserve}
              className="btn-primary w-full"
              disabled={
                reserving ||
                selected.length === 0 ||
                !customerName.trim() ||
                (!paymentText.trim() && !paymentFile)
              }
            >
              {reserving ? 'Procesando...' : 'Enviar reserva con pago'}
            </button>

            {tickets && (
              <div className="space-y-3 rounded-xl border border-[var(--color-verde)]/40 bg-[var(--color-verde)]/5 p-3">
                <p className="text-sm font-semibold text-[var(--color-verde)]">
                  Reserva registrada
                </p>
                <p className="text-[11px] text-slate-300">
                  Pendiente de aprobación de pago por recepción. Recibirás el acceso cuando sea
                  aprobado.
                </p>
                {tickets.map((t) => (
                  <div key={t.id} className="rounded-lg bg-[var(--color-ink)] p-2.5 text-xs">
                    <p className="font-semibold">Asiento {t.seatNumber}</p>
                    <p className="mt-0.5 break-all text-slate-400">ID: {t.id}</p>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>
      )}

      {trailer && (
        <TrailerModal url={trailer.url} title={trailer.title} onClose={() => setTrailer(null)} />
      )}
    </div>
  );
}
