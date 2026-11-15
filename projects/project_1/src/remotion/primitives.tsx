import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { mount, type Piece } from 'ascii.rest';
import * as aurora from 'ascii.rest/pieces/aurora';
import * as earth from 'ascii.rest/pieces/earth';
import * as earthrise from 'ascii.rest/pieces/earthrise';
import * as galaxy from 'ascii.rest/pieces/galaxy';
import * as radar from 'ascii.rest/pieces/radar';
import * as solarSystem from 'ascii.rest/pieces/solar-system';
import * as starfield from 'ascii.rest/pieces/starfield';
import { FONT_MONO, FONT_SANS, PALETTE, resolveAssetUrl } from './palette';
import { SafeImg } from './SafeImg';

export type RemotionAsciiPiece =
  | 'earthrise'
  | 'earth'
  | 'radar'
  | 'aurora'
  | 'solar-system'
  | 'galaxy'
  | 'starfield';

const PIECES: Record<RemotionAsciiPiece, Piece> = {
  earthrise,
  earth,
  radar,
  aurora,
  'solar-system': solarSystem,
  galaxy,
  starfield,
};

const DARK_TINTS: Record<RemotionAsciiPiece, string> = {
  earthrise: '#e2e8f0',
  earth: '#38bdf8',
  radar: '#34d399',
  aurora: '#5eead4',
  'solar-system': '#60a5fa',
  galaxy: '#7dd3fc',
  starfield: '#bae6fd',
};

export interface RemotionAsciiBackdropProps {
  readonly piece: RemotionAsciiPiece;
  readonly mode?: 'dark' | 'light';
  readonly scrimOpacity?: number;
  readonly speed?: number;
  readonly offsetSec?: number;
}

/**
 * Deterministic frame-stepped ascii.rest canvas backdrop matching DopaiMint's
 * live EarthriseBackground & AsciiRestBackdrop in both dark (#090c14) and light (#f5f2ea) themes.
 */
export function RemotionAsciiBackdrop({
  piece,
  mode = 'dark',
  scrimOpacity = mode === 'dark' ? 0.64 : 0.72,
  speed = 0.85,
  offsetSec = 3.5,
}: RemotionAsciiBackdropProps) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const target = PIECES[piece];
  const cols = target.meta.cols ?? 80;
  const rows = target.meta.rows ?? 24;
  const cell = target.meta.cell ?? 2;
  const ratio = cols / (rows * cell);
  const canvasWidth = Math.max(width, Math.round(height * ratio));
  const timeSec = offsetSec + (frame / fps) * speed;

  useLayoutEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const handle = delayRender(`ascii-rest-${piece}-${mode}-${frame}`);
    let cleanup: (() => void) | undefined;
    try {
      const meta =
        mode === 'dark'
          ? target.meta
          : {
              ...target.meta,
              palette: undefined,
              ground: undefined,
            };
      const frozenPiece: Piece = {
        meta,
        default: (opts) => {
          const renderFrame = target.default(opts);
          return (_t, env) => renderFrame(timeSec, env);
        },
      };
      cleanup = mount(el, frozenPiece, { fps: 0 });
    } finally {
      continueRender(handle);
    }
    return () => {
      cleanup?.();
    };
  }, [target, piece, mode, timeSec, frame]);

  const bg = mode === 'dark' ? PALETTE.obsidianBase : PALETTE.warmPaper;
  const scrim =
    mode === 'dark'
      ? `rgba(9, 12, 20, ${scrimOpacity})`
      : `rgba(245, 242, 234, ${scrimOpacity})`;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: bg,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: canvasWidth,
          flexShrink: 0,
          color: mode === 'dark' ? DARK_TINTS[piece] : PALETTE.warmAccent,
          opacity: mode === 'dark' ? 0.82 : 0.28,
        }}
      />
      <AbsoluteFill style={{ backgroundColor: scrim }} />
    </AbsoluteFill>
  );
}

export function buildDashedBoxBackground(frameColor: string): CSSProperties {
  return {
    backgroundImage: [
      `repeating-linear-gradient(to right, ${frameColor} 0 2px, transparent 2px 7px)`,
      `repeating-linear-gradient(to bottom, ${frameColor} 0 2px, transparent 2px 7px)`,
      `repeating-linear-gradient(to right, ${frameColor} 0 2px, transparent 2px 7px)`,
      `repeating-linear-gradient(to bottom, ${frameColor} 0 2px, transparent 2px 7px)`,
    ].join(', '),
    backgroundRepeat: 'repeat-x, repeat-y, repeat-x, repeat-y',
    backgroundPosition: '0 0, 100% 0, 0 100%, 0 0',
    backgroundSize: '100% 1px, 1px 100%, 100% 1px, 1px 100%',
  };
}

export function MdxcnRule({
  mode = 'dark',
  style,
}: {
  readonly mode?: 'dark' | 'light';
  readonly style?: CSSProperties;
}) {
  const frameColor =
    mode === 'dark' ? 'rgba(148, 163, 184, 0.44)' : 'rgba(14, 20, 30, 0.32)';
  return (
    <div
      style={{
        width: '100%',
        height: 1,
        backgroundImage: `repeating-linear-gradient(to right, ${frameColor} 0 2px, transparent 2px 7px)`,
        ...style,
      }}
    />
  );
}

export interface MdxcnFrameProps {
  readonly title?: string;
  readonly mode?: 'dark' | 'light';
  readonly accentColor?: string;
  readonly surfaceColor?: string;
  readonly scale?: number;
  readonly titleAlign?: 'center' | 'left';
  readonly style?: CSSProperties;
  readonly bodyStyle?: CSSProperties;
  readonly children: ReactNode;
}

/**
 * Exact inline-CSS replica of DopaiMint's official mdxcn <Graph> frame:
 * 2px/7px dashed border, + corner marks on surface masks, and [ TITLE ] edge label.
 */
export function MdxcnFrame({
  title,
  mode = 'dark',
  accentColor,
  surfaceColor,
  scale = 1,
  titleAlign = 'center',
  style,
  bodyStyle,
  children,
}: MdxcnFrameProps) {
  const surface =
    surfaceColor ?? (mode === 'dark' ? PALETTE.obsidianSubtle : '#faf8f2');
  const frameColor =
    mode === 'dark' ? 'rgba(148, 163, 184, 0.46)' : 'rgba(14, 20, 30, 0.34)';
  const accent =
    accentColor ?? (mode === 'dark' ? PALETTE.cyan : PALETTE.warmAccent);
  const cornerBox = Math.max(12, Math.round(16 * scale));
  const titleFont = Math.max(10, Math.round(13 * scale));

  const corners: Array<CSSProperties> = [
    { top: 0, left: 0, transform: 'translate(-50%, -50%)' },
    { top: 0, right: 0, transform: 'translate(50%, -50%)' },
    { bottom: 0, left: 0, transform: 'translate(-50%, 50%)' },
    { bottom: 0, right: 0, transform: 'translate(50%, 50%)' },
  ];

  return (
    <div
      style={{
        position: 'relative',
        backgroundColor: surface,
        ...buildDashedBoxBackground(frameColor),
        fontFamily: FONT_MONO,
        color: mode === 'dark' ? PALETTE.inkPrimary : PALETTE.warmInk,
        ...style,
      }}
    >
      {title ? (
        <div
          style={{
            position: 'absolute',
            top: 0,
            ...(titleAlign === 'center'
              ? { left: '50%', transform: 'translate(-50%, -50%)' }
              : { left: Math.round(22 * scale), transform: 'translateY(-50%)' }),
            zIndex: 4,
            backgroundColor: surface,
            padding: `0 ${Math.round(10 * scale)}px`,
            fontFamily: FONT_MONO,
            fontSize: titleFont,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            color: accent,
          }}
        >
          [ {title} ]
        </div>
      ) : null}

      {corners.map((pos, idx) => (
        <span
          key={idx}
          style={{
            position: 'absolute',
            zIndex: 3,
            width: cornerBox,
            height: cornerBox,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: surface,
            color: frameColor,
            fontFamily: FONT_MONO,
            fontSize: Math.max(11, Math.round(14 * scale)),
            lineHeight: 1,
            ...pos,
          }}
        >
          +
        </span>
      ))}

      <div
        style={{
          padding: `${Math.round(22 * scale)}px ${Math.round(24 * scale)}px`,
          ...bodyStyle,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export interface AndromedaBracketsProps {
  readonly size?: number;
  readonly offset?: number;
  readonly strokeWidth?: number;
  readonly color?: string;
  readonly radius?: number;
}

/**
 * Exact inline-CSS replica of DopaiMint's CornerMarkers (CornerFrame.tsx).
 */
export function AndromedaBrackets({
  size = 14,
  offset = -1,
  strokeWidth = 1.5,
  color = 'rgba(241, 237, 228, 0.42)',
  radius = 4,
}: AndromedaBracketsProps) {
  const base: CSSProperties = {
    position: 'absolute',
    width: size,
    height: size,
    borderStyle: 'solid',
    borderColor: color,
    borderWidth: 0,
    pointerEvents: 'none',
    zIndex: 5,
  };
  return (
    <>
      <span
        style={{
          ...base,
          top: offset,
          left: offset,
          borderTopWidth: strokeWidth,
          borderLeftWidth: strokeWidth,
          borderTopLeftRadius: radius,
        }}
      />
      <span
        style={{
          ...base,
          top: offset,
          right: offset,
          borderTopWidth: strokeWidth,
          borderRightWidth: strokeWidth,
          borderTopRightRadius: radius,
        }}
      />
      <span
        style={{
          ...base,
          bottom: offset,
          left: offset,
          borderBottomWidth: strokeWidth,
          borderLeftWidth: strokeWidth,
          borderBottomLeftRadius: radius,
        }}
      />
      <span
        style={{
          ...base,
          bottom: offset,
          right: offset,
          borderBottomWidth: strokeWidth,
          borderRightWidth: strokeWidth,
          borderBottomRightRadius: radius,
        }}
      />
    </>
  );
}

export interface AndromedaPanelProps {
  readonly mode?: 'dark' | 'light';
  readonly markerSize?: number;
  readonly markerColor?: string;
  readonly style?: CSSProperties;
  readonly children: ReactNode;
}

export function AndromedaPanel({
  mode = 'dark',
  markerSize = 14,
  markerColor,
  style,
  children,
}: AndromedaPanelProps) {
  const border =
    mode === 'dark' ? 'rgba(241, 237, 228, 0.14)' : 'rgba(14, 20, 30, 0.16)';
  const bg =
    mode === 'dark' ? 'rgba(16, 22, 34, 0.92)' : 'rgba(236, 232, 221, 0.94)';
  const mColor =
    markerColor ??
    (mode === 'dark' ? 'rgba(241, 237, 228, 0.42)' : 'rgba(14, 20, 30, 0.36)');
  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 4,
        border: `1px solid ${border}`,
        backgroundColor: bg,
        fontFamily: FONT_SANS,
        color: mode === 'dark' ? PALETTE.inkPrimary : PALETTE.warmInk,
        ...style,
      }}
    >
      <AndromedaBrackets size={markerSize} color={mColor} radius={4} />
      {children}
    </div>
  );
}

export interface DopaiMintHudBarProps {
  readonly mode?: 'dark' | 'light';
  readonly activeTab?: 'Overview' | 'Demo' | 'Plates' | 'Telemetry' | 'Map' | 'Trainer' | 'Slides';
  readonly rightLabel?: string;
  readonly scale?: number;
}

/**
 * Exact replica of DopaiMint's live Andromeda Navbar (Navbar.tsx) for 100% web UI/UX continuity.
 */
export function DopaiMintHudBar({
  mode = 'dark',
  activeTab = 'Demo',
  rightLabel = '8/8 NASA Live · Zero Login',
  scale = 1,
}: DopaiMintHudBarProps) {
  const isDark = mode === 'dark';
  const tabs = ['Overview', 'Demo', 'Plates', 'Telemetry', 'Map', 'Trainer', 'Slides'] as const;
  const h = Math.round(56 * scale);
  const px = Math.round(44 * scale);

  return (
    <div
      style={{
        height: h,
        padding: `0 ${px}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: isDark ? 'rgba(9, 12, 20, 0.88)' : 'rgba(245, 242, 234, 0.92)',
        borderBottom: `1px solid ${isDark ? 'rgba(241, 237, 228, 0.12)' : 'rgba(14, 20, 30, 0.12)'}`,
        fontFamily: FONT_SANS,
        zIndex: 20,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: Math.round(28 * scale) }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: Math.round(10 * scale),
            fontSize: Math.max(12, Math.round(15 * scale)),
            fontWeight: 600,
            letterSpacing: '-0.01em',
            color: isDark ? PALETTE.inkPrimary : PALETTE.warmInk,
          }}
        >
          <svg
            width={Math.round(20 * scale)}
            height={Math.round(20 * scale)}
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              cx="12"
              cy="12"
              r="9.5"
              stroke={isDark ? PALETTE.inkPrimary : PALETTE.warmInk}
              strokeOpacity="0.42"
            />
            <circle
              cx="12"
              cy="12"
              r="4"
              stroke={isDark ? PALETTE.cyan : PALETTE.warmAccent}
              strokeWidth="1.6"
            />
            <circle
              cx="16.5"
              cy="7.5"
              r="2.1"
              fill={isDark ? PALETTE.coral : '#d94f30'}
            />
          </svg>
          <span>DOPAIMINT</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: Math.round(6 * scale) }}>
          {tabs.map((tab) => {
            const active = tab === activeTab;
            return (
              <span
                key={tab}
                style={{
                  padding: `${Math.round(5 * scale)}px ${Math.round(11 * scale)}px`,
                  borderRadius: 4,
                  fontSize: Math.max(10, Math.round(13 * scale)),
                  fontWeight: active ? 600 : 500,
                  color: active
                    ? isDark
                      ? PALETTE.cyan
                      : PALETTE.warmAccent
                    : isDark
                      ? PALETTE.inkMuted
                      : PALETTE.warmMuted,
                  backgroundColor: active
                    ? isDark
                      ? 'rgba(69, 184, 214, 0.12)'
                      : 'rgba(29, 111, 138, 0.1)'
                    : 'transparent',
                }}
              >
                {tab}
              </span>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: Math.round(10 * scale) }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: Math.round(7 * scale),
            padding: `${Math.round(5 * scale)}px ${Math.round(11 * scale)}px`,
            borderRadius: 4,
            border: `1px solid ${isDark ? 'rgba(241, 237, 228, 0.14)' : 'rgba(14, 20, 30, 0.16)'}`,
            backgroundColor: isDark ? 'rgba(16, 22, 34, 0.9)' : 'rgba(236, 232, 221, 0.9)',
            fontFamily: FONT_MONO,
            fontSize: Math.max(10, Math.round(11.5 * scale)),
            color: isDark ? PALETTE.inkSecondary : PALETTE.warmInk,
          }}
        >
          <span
            style={{
              width: Math.max(6, Math.round(7 * scale)),
              height: Math.max(6, Math.round(7 * scale)),
              borderRadius: '50%',
              backgroundColor: isDark ? PALETTE.scannerGreen : '#15803d',
            }}
          />
          {rightLabel}
        </span>
      </div>
    </div>
  );
}

export interface BotAvatarCellProps {
  readonly botFile:
    | 'work.png'
    | 'tools.png'
    | 'search.png'
    | 'ideas.png'
    | 'review.png'
    | 'design.png'
    | 'files.png';
  readonly roleLabel: string;
  readonly statusLabel?: string;
  readonly mode?: 'dark' | 'light';
  readonly size?: number;
  readonly phaseOffset?: number;
  readonly style?: CSSProperties;
}

/**
 * Authentic bot-avatars.vercel.app 1px grid cell with 5.5s breathing keyframe physics.
 */
export function BotAvatarCell({
  botFile,
  roleLabel,
  statusLabel,
  mode = 'dark',
  size = 132,
  phaseOffset = 0,
  style,
}: BotAvatarCellProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [hoverSeed] = useState(phaseOffset);

  // Authentic 5.5s sinusoidal breathe from bot-avatars.vercel.app/style.css:
  // 0%,100%: scale(1) translateY(0); 50%: scale(1.018) translateY(-2px)
  const cycle = ((frame / fps + hoverSeed) % 5.5) / 5.5;
  const wave = 0.5 - 0.5 * Math.cos(cycle * Math.PI * 2);
  const breatheScale = 1 + 0.022 * wave;
  const breatheY = -3.2 * wave;

  const isDark = mode === 'dark';

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `${Math.round(size * 0.11)}px ${Math.round(size * 0.12)}px`,
        borderRadius: 4,
        border: `1px solid ${isDark ? '#232e42' : 'rgba(14, 20, 30, 0.16)'}`,
        backgroundColor: isDark ? '#0b101b' : '#faf8f2',
        ...style,
      }}
    >
      <SafeImg
        src={resolveAssetUrl(`/video-assets/bots/${botFile}`)}
        alt={roleLabel}
        style={{
          width: size,
          height: size,
          objectFit: 'contain',
          transform: `translateY(${breatheY}px) scale(${breatheScale})`,
          transformOrigin: 'center bottom',
        }}
      />
      <div
        style={{
          marginTop: Math.round(size * 0.08),
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 6,
          paddingTop: Math.round(size * 0.06),
          borderTop: `1px dashed ${isDark ? 'rgba(148, 163, 184, 0.28)' : 'rgba(14, 20, 30, 0.22)'}`,
          fontFamily: FONT_MONO,
          fontSize: Math.max(10, Math.round(size * 0.095)),
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: isDark ? PALETTE.inkSecondary : PALETTE.warmInk,
        }}
      >
        <span>{roleLabel}</span>
        {statusLabel ? (
          <span style={{ color: isDark ? PALETTE.cyan : PALETTE.warmAccent, fontWeight: 600 }}>
            {statusLabel}
          </span>
        ) : null}
      </div>
    </div>
  );
}
