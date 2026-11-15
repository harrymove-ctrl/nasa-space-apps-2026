import { useEffect, useLayoutEffect, useRef } from 'react';
import { mount, type Piece } from 'ascii.rest';
import * as aurora from 'ascii.rest/pieces/aurora';
import * as earth from 'ascii.rest/pieces/earth';
import * as earthrise from 'ascii.rest/pieces/earthrise';
import * as galaxy from 'ascii.rest/pieces/galaxy';
import * as radar from 'ascii.rest/pieces/radar';
import * as solarSystem from 'ascii.rest/pieces/solar-system';
import * as starfield from 'ascii.rest/pieces/starfield';

export type AsciiPieceName =
  | 'earthrise'
  | 'earth'
  | 'radar'
  | 'aurora'
  | 'solar-system'
  | 'galaxy'
  | 'starfield';

const PIECES: Record<AsciiPieceName, Piece> = {
  earthrise,
  earth,
  radar,
  aurora,
  'solar-system': solarSystem,
  galaxy,
  starfield,
};

const PIECE_TINTS: Record<AsciiPieceName, string> = {
  earthrise: '#e2e8f0',
  earth: '#38bdf8',
  radar: '#34d399',
  aurora: '#5eead4',
  'solar-system': '#60a5fa',
  galaxy: '#7dd3fc',
  starfield: '#bae6fd',
};

export interface AsciiRestBackdropProps {
  piece: AsciiPieceName;
  timeSec?: number;
  className?: string;
  scrimOpacity?: number;
}

export function AsciiRestBackdrop({
  piece,
  timeSec,
  className = '',
  scrimOpacity = 0.56,
}: AsciiRestBackdropProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const target = PIECES[piece];
  const cols = target.meta.cols ?? 80;
  const rows = target.meta.rows ?? 24;
  const cell = target.meta.cell ?? 2;
  const ratio = cols / (rows * cell);
  const tint = PIECE_TINTS[piece];

  // Live animation mode when timeSec is omitted
  useEffect(() => {
    if (typeof timeSec === 'number') return;
    const el = canvasRef.current;
    if (!el) return;
    return mount(el, target, { motion: true });
  }, [target, timeSec]);

  // Deterministic frame mode when timeSec is explicitly stepped
  useLayoutEffect(() => {
    if (typeof timeSec !== 'number') return;
    const el = canvasRef.current;
    if (!el) return;
    const frozenPiece: Piece = {
      meta: target.meta,
      default: (opts) => {
        const renderFrame = target.default(opts);
        return (_t, env) => renderFrame(timeSec, env);
      },
    };
    return mount(el, frozenPiece, { fps: 0 });
  }, [target, timeSec]);

  return (
    <div
      aria-hidden="true"
      data-slot="ascii-rest-bg"
      data-piece={piece}
      className={`pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden bg-[#090c14] select-none ${className}`}
      style={{ containerType: 'size' }}
    >
      <canvas
        ref={canvasRef}
        className="shrink-0 opacity-85"
        style={{
          color: tint,
          width: `max(100cqw, calc(100cqh * ${ratio.toFixed(4)}))`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{ backgroundColor: `rgba(9, 12, 20, ${scrimOpacity})` }}
      />
    </div>
  );
}
