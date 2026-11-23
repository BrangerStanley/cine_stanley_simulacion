function toEmbedUrl(url: string): string {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    }
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v) return `https://www.youtube.com/embed/${v}`;
      if (u.pathname.startsWith('/embed/')) return url;
    }
  } catch {
    /* ignore */
  }
  return url;
}

interface TrailerModalProps {
  url: string;
  title: string;
  onClose: () => void;
}

export default function TrailerModal({ url, title, onClose }: TrailerModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl animate-fade overflow-hidden rounded-2xl border border-[var(--color-ink-line)] bg-[var(--color-ink-soft)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="font-semibold">Tráiler · {title}</h3>
          <div className="flex items-center gap-2">
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-slate-400 underline hover:text-[var(--color-verde)]"
            >
              Abrir
            </a>
            <button onClick={onClose} className="btn-ghost px-2 py-1 text-xs">
              Cerrar
            </button>
          </div>
        </div>
        <div className="aspect-video w-full bg-black">
          <iframe
            src={toEmbedUrl(url)}
            title={`Tráiler de ${title}`}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
