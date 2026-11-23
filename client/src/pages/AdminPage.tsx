import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { Metrics, Movie, Theater } from '../types';

export default function AdminPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [movieForm, setMovieForm] = useState({
    title: '',
    duration: 90,
    description: '',
    posterUrl: '',
    trailerUrl: '',
  });
  const [funcForm, setFuncForm] = useState({ movieId: '', theaterId: '', startTime: '' });

  async function load() {
    try {
      const [m, mv, th] = await Promise.all([api.metrics(), api.movies(), api.theaters()]);
      setMetrics(m);
      setMovies(mv);
      setTheaters(th);
      setFuncForm((f) => ({
        ...f,
        movieId: f.movieId || mv[0]?.id || '',
        theaterId: f.theaterId || th[0]?.id || '',
      }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar datos');
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createMovie(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await api.createMovie(movieForm);
      setMessage('Película creada correctamente');
      setMovieForm({ title: '', duration: 90, description: '', posterUrl: '', trailerUrl: '' });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al crear película');
    }
  }

  async function createFunction(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await api.createFunction(funcForm);
      setMessage('Función programada correctamente');
      setFuncForm((f) => ({ ...f, startTime: '' }));
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al programar función');
    }
  }

  const uniqueTheaters = theaters;

  const cards = metrics
    ? [
        { label: 'Reservas totales', value: metrics.totalReservations },
        { label: 'Check-ins', value: metrics.checkedInReservations },
        { label: 'Ingresos est.', value: `$${metrics.totalIncome}` },
        { label: 'Asistencia', value: metrics.attendanceRate },
      ]
    : [];

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <h1 className="text-2xl font-black tracking-tight">Panel de administración</h1>
      <p className="mt-1 text-sm text-slate-400">Métricas y gestión del catálogo.</p>

      {error && (
        <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
      )}
      {message && (
        <p className="mt-4 rounded-lg bg-[var(--color-verde)]/10 px-3 py-2 text-sm text-[var(--color-verde)]">
          {message}
        </p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <p className="text-xs uppercase tracking-wide text-slate-500">{c.label}</p>
            <p className="mt-1 text-3xl font-black text-gradient-brand">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <form onSubmit={createMovie} className="card space-y-4 p-6">
          <h2 className="font-bold">Nueva película</h2>
          <input
            className="input"
            placeholder="Título"
            value={movieForm.title}
            onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
            required
          />
          <input
            className="input"
            type="number"
            min={1}
            placeholder="Duración (min)"
            value={movieForm.duration}
            onChange={(e) => setMovieForm({ ...movieForm, duration: Number(e.target.value) })}
            required
          />
          <textarea
            className="input min-h-20"
            placeholder="Descripción"
            value={movieForm.description}
            onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })}
            required
          />
          <input
            className="input"
            type="url"
            placeholder="URL del póster (imagen)"
            value={movieForm.posterUrl}
            onChange={(e) => setMovieForm({ ...movieForm, posterUrl: e.target.value })}
          />
          <input
            className="input"
            type="url"
            placeholder="URL del tráiler (YouTube)"
            value={movieForm.trailerUrl}
            onChange={(e) => setMovieForm({ ...movieForm, trailerUrl: e.target.value })}
          />
          <button type="submit" className="btn-primary w-full">
            Crear película
          </button>
        </form>

        <form onSubmit={createFunction} className="card space-y-4 p-6">
          <h2 className="font-bold">Programar función</h2>
          <select
            className="input"
            value={funcForm.movieId}
            onChange={(e) => setFuncForm({ ...funcForm, movieId: e.target.value })}
            required
          >
            <option value="">Selecciona película</option>
            {movies.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
          <select
            className="input"
            value={funcForm.theaterId}
            onChange={(e) => setFuncForm({ ...funcForm, theaterId: e.target.value })}
            required
          >
            <option value="">Selecciona sala</option>
            {uniqueTheaters.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.capacity} asientos)
              </option>
            ))}
          </select>
          <input
            className="input"
            type="datetime-local"
            value={funcForm.startTime}
            onChange={(e) => setFuncForm({ ...funcForm, startTime: e.target.value })}
            required
          />
          <button type="submit" className="btn-primary w-full">
            Programar función
          </button>
        </form>
      </div>
    </div>
  );
}
