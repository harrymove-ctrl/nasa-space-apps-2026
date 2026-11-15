import { useEffect, useRef } from 'react';
import { mount, type Piece } from 'ascii.rest';
import * as aurora from 'ascii.rest/pieces/aurora';
import * as earthrise from 'ascii.rest/pieces/earthrise';
import * as radar from 'ascii.rest/pieces/radar';
import * as solarSystem from 'ascii.rest/pieces/solar-system';

export type LiveAsciiPiece = 'earthrise' | 'radar' | 'aurora' | 'solar-system';

const PIECES: Record<LiveAsciiPiece, Piece> = {
  earthrise,
  radar,
  aurora,
  'solar-system': solarSystem,
};

export function EarthriseBackground({
  isDark,
  piece = 'earthrise',
}: {
  isDark: boolean;
  piece?: LiveAsciiPiece;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const target = PIECES[piece];
  const cols = target.meta.cols ?? 80;
  const rows = target.meta.rows ?? 24;
  const cell = target.meta.cell ?? 2;
  const ratio = cols / (rows * cell);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const activePiece: Piece = isDark
      ? target
      : {
          default: target.default,
          meta: {
            ...target.meta,
            palette: undefined,
            ground: undefined,
          },
        };
    return mount(el, activePiece);
  }, [isDark, target]);

  return (
    <div
      aria-hidden="true"
      data-slot="earthrise-bg"
      data-piece={piece}
      className="earthrise-bg pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
    >
      <canvas
        ref={canvasRef}
        className="earthrise-bg-canvas"
        style={{ width: `max(100vw, calc(100vh * ${ratio.toFixed(4)}))` }}
      />
      <div className="earthrise-bg-scrim" />
    </div>
  );
}
