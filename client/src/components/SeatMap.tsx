interface SeatMapProps {
  capacity: number;
  occupied: string[];
  selected: string[];
  onToggle: (seat: string) => void;
  perRow?: number;
}

const ROW_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export default function SeatMap({ capacity, occupied, selected, onToggle, perRow = 10 }: SeatMapProps) {
  const rows = Math.ceil(capacity / perRow);

  return (
    <div className="overflow-x-auto">
      <div className="mx-auto w-fit">
        <div className="mb-6 rounded-md bg-gradient-to-b from-[var(--color-verde)]/40 to-transparent py-1.5 text-center text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--color-verde)]">
          Pantalla
        </div>
        <div className="space-y-2">
          {Array.from({ length: rows }).map((_, rowIdx) => {
            const rowLetter = ROW_LETTERS[rowIdx];
            return (
              <div key={rowLetter} className="flex items-center gap-2">
                <span className="w-5 text-center text-xs font-semibold text-slate-500">
                  {rowLetter}
                </span>
                <div className="flex gap-2">
                  {Array.from({ length: perRow }).map((_, colIdx) => {
                    const seatNumber = `${rowLetter}${colIdx + 1}`;
                    const isOccupied = occupied.includes(seatNumber);
                    const isSelected = selected.includes(seatNumber);

                    return (
                      <button
                        key={seatNumber}
                        disabled={isOccupied}
                        onClick={() => onToggle(seatNumber)}
                        title={seatNumber}
                        className={`h-8 w-8 rounded-md text-[10px] font-semibold transition ${
                          isOccupied
                            ? 'cursor-not-allowed bg-[var(--color-ink-line)] text-slate-600'
                            : isSelected
                              ? 'bg-[var(--color-verde)] text-[#052e16] glow-green'
                              : 'border border-[var(--color-ink-line)] bg-[var(--color-ink)] text-slate-400 hover:border-[var(--color-verde)] hover:text-[var(--color-verde)]'
                        }`}
                      >
                        {colIdx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-6 flex justify-center gap-5 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="h-3.5 w-3.5 rounded border border-[var(--color-ink-line)] bg-[var(--color-ink)]" />
            Libre
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3.5 w-3.5 rounded bg-[var(--color-verde)]" />
            Seleccionado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3.5 w-3.5 rounded bg-[var(--color-ink-line)]" />
            Ocupado
          </span>
        </div>
      </div>
    </div>
  );
}
