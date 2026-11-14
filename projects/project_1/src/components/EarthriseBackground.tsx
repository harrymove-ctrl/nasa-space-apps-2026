import { useEffect, useRef } from 'react';
import { mount, type Piece } from 'ascii.rest';
import * as earthrise from 'ascii.rest/pieces/earthrise';

const DARK_PIECE: Piece = earthrise;
const LIGHT_PIECE: Piece = {
  default: earthrise.default,
  meta: {
    ...earthrise.meta,
    palette: undefined,
    ground: undefined,
  },
};

export function EarthriseBackground({ isDark }: { isDark: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    return mount(el, isDark ? DARK_PIECE : LIGHT_PIECE);
  }, [isDark]);

  return (
    <div
      aria-hidden="true"
      data-slot="earthrise-bg"
      className="earthrise-bg pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
    >
      <canvas
        ref={canvasRef}
        className="earthrise-bg-canvas"
        style={{ width: 'max(100vw, 200vh)' }}
      />
      <div className="earthrise-bg-scrim" />
    </div>
  );
}
