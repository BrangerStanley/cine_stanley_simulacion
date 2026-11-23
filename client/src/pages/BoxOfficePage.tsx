import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { Reservation } from '../types';

type Result =
  | { type: 'ok'; reservation: Reservation }
  | { type: 'used' }
  | { type: 'pending' }
  | { type: 'error'; message: string }
  | null;

type Tab = 'validate' | 'pending';

export default function BoxOfficePage() {
  const [tab, setTab] = useState<Tab>('pending');

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result>(null);

  const [pending, setPending] = useState<Reservation[]>([]);
  const [loadingPending, setLoadingPending] = useState(true);
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  async function loadPending() {
    setLoadingPending(true);
    try {
      setPending(await api.pendingPayments());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar pagos');
    } finally {
      setLoadingPending(false);
    }
  }

  useEffect(() => {
    loadPending();
  }, []);

  async function validate(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await api.validateTicket(code.trim());
      setResult({ type: 'ok', reservation: res.reservation });
      setCode('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al validar';
      if (message.includes('ya utilizada')) setResult({ type: 'used' });
      else if (message.includes('no ha sido aprobado')) setResult({ type: 'pending' });
      else setResult({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  }

  async function review(id: string, approve: boolean) {
    setReviewing(id);
    setNotice('');
    setError('');
    try {
      const res = await api.reviewPayment(id, approve);
      setNotice(res.message);
      await loadPending();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al revisar pago');
    } finally {
      setReviewing(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-8">
      <h1 className="text-2xl font-black tracking-tight">Recepción / Taquilla</h1>
      <p className="mt-1 text-sm text-slate-400">
        Aprueba pagos y valida el acceso. Solo se permite entrar cuando el pago está aprobado.
      </p>

      <div className="mt-6 flex gap-2 border-b border-[var(--color-ink-line)]">
        <button
          onClick={() => setTab('pending')}
          className={`relative -mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition ${
            tab === 'pending'
              ? 'border-[var(--color-verde)] text-[var(--color-verde)]'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Pagos pendientes
          {pending.length > 0 && (
            <span className="ml-2 rounded-full bg-[var(--color-verde)] px-1.5 py-0.5 text-[10px] font-bold text-[#052e16]">
              {pending.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab('validate')}
          className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition ${
            tab === 'validate'
              ? 'border-[var(--color-verde)] text-[var(--color-verde)]'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Validar entrada
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
      )}
      {notice && (
        <p className="mt-4 rounded-lg bg-[var(--color-verde)]/10 px-3 py-2 text-sm text-[var(--color-verde)]">
          {notice}
        </p>
      )}

      {tab === 'pending' && (
        <div className="mt-6 space-y-4">
          {loadingPending && <p className="text-sm text-slate-400">Cargando pagos...</p>}
          {!loadingPending && pending.length === 0 && (
            <div className="card p-8 text-center text-sm text-slate-400">
              No hay pagos pendientes de revisión.
            </div>
          )}
          {pending.map((r) => (
            <div key={r.id} className="card animate-fade p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">
                    {r.function?.movie.title}{' '}
                    <span className="text-[var(--color-verde)]">· Asiento {r.seatNumber}</span>
                  </p>
                  <p className="text-xs text-slate-400">
                    {r.function?.theater.name} · {r.customerName}
                  </p>
                  <p className="mt-1 break-all text-[11px] text-slate-500">ID: {r.id}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => review(r.id, true)}
                    disabled={reviewing === r.id}
                    className="btn-primary px-3 py-1.5 text-sm"
                  >
                    Aprobar
                  </button>
                  <button
                    onClick={() => review(r.id, false)}
                    disabled={reviewing === r.id}
                    className="rounded-lg border border-red-500/50 px-3 py-1.5 text-sm text-red-400 transition hover:bg-red-500/10"
                  >
                    Rechazar
                  </button>
                </div>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-[160px_1fr]">
                {r.paymentImageUrl ? (
                  <a
                    href={r.paymentImageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block overflow-hidden rounded-lg border border-[var(--color-ink-line)]"
                  >
                    <img
                      src={r.paymentImageUrl}
                      alt="Comprobante de pago"
                      className="h-28 w-full object-cover"
                    />
                  </a>
                ) : (
                  <div className="grid h-28 place-items-center rounded-lg border border-dashed border-[var(--color-ink-line)] text-xs text-slate-600">
                    Sin imagen
                  </div>
                )}
                <div className="rounded-lg bg-[var(--color-ink)] p-3">
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">Referencia</p>
                  <p className="mt-1 text-sm text-slate-300">
                    {r.paymentProof?.trim() || 'Sin referencia de texto'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'validate' && (
        <div className="mt-6">
          <form onSubmit={validate} className="card space-y-4 p-6">
            <div>
              <label className="mb-1.5 block text-sm text-slate-300">Código de reserva</label>
              <input
                className="input font-mono text-sm"
                placeholder="Pega el ID de la reserva..."
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading || !code.trim()}
            >
              {loading ? 'Validando...' : 'Validar entrada'}
            </button>
          </form>

          {result && (
            <div className="mt-5 animate-fade">
              {result.type === 'ok' && (
                <div className="card border-[var(--color-verde)]/50 bg-[var(--color-verde)]/5 p-6 text-center">
                  <p className="text-2xl font-black text-[var(--color-verde)]">
                    ACCESO PERMITIDO
                  </p>
                  <div className="mt-4 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
                    <p>
                      <span className="text-slate-500">Película: </span>
                      {result.reservation.function?.movie.title}
                    </p>
                    <p>
                      <span className="text-slate-500">Sala: </span>
                      {result.reservation.function?.theater.name}
                    </p>
                    <p>
                      <span className="text-slate-500">Asiento: </span>
                      <span className="font-semibold text-white">
                        {result.reservation.seatNumber}
                      </span>
                    </p>
                    <p>
                      <span className="text-slate-500">Cliente: </span>
                      {result.reservation.customerName}
                    </p>
                  </div>
                </div>
              )}
              {result.type === 'used' && (
                <div className="card border-amber-500/50 bg-amber-500/5 p-6 text-center">
                  <p className="text-xl font-black text-amber-400">ENTRADA YA UTILIZADA</p>
                  <p className="mt-2 text-sm text-slate-400">
                    Este código ya fue validado previamente.
                  </p>
                </div>
              )}
              {result.type === 'pending' && (
                <div className="card border-amber-500/50 bg-amber-500/5 p-6 text-center">
                  <p className="text-xl font-black text-amber-400">PAGO PENDIENTE</p>
                  <p className="mt-2 text-sm text-slate-400">
                    Aprueba el pago en la pestaña "Pagos pendientes" antes de validar.
                  </p>
                </div>
              )}
              {result.type === 'error' && (
                <div className="card border-red-500/50 bg-red-500/5 p-6 text-center">
                  <p className="text-xl font-black text-red-400">ENTRADA INVÁLIDA</p>
                  <p className="mt-2 text-sm text-slate-400">{result.message}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
