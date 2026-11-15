import { useMemo } from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { FONT_MONO, FONT_SANS, PALETTE, resolveAssetUrl } from '../palette';

interface ParticleSpec {
  readonly id: number;
  readonly kind: 'hex' | 'tri';
  readonly xPct: number;
  readonly yPct: number;
  readonly size: number;
  readonly depth: number;
  readonly phase: number;
  readonly tint: string;
}

const PARTICLES: readonly ParticleSpec[] = Array.from({ length: 18 }, (_, i) => {
  const seed = Math.sin(i * 19.37 + 4.13) * 10000;
  const frac = seed - Math.floor(seed);
  const seed2 = Math.cos(i * 41.11 + 1.9) * 10000;
  const frac2 = seed2 - Math.floor(seed2);
  return {
    id: i,
    kind: i % 2 === 0 ? 'hex' : 'tri',
    xPct: 6 + ((i * 13.7 + frac * 11) % 88),
    yPct: 8 + ((i * 17.3 + frac2 * 19) % 84),
    size: 16 + (i % 4) * 9,
    depth: 0.45 + (i % 3) * 0.25,
    phase: i * 0.65,
    tint: i % 3 === 0 ? PALETTE.scannerGreen : i % 3 === 1 ? PALETTE.cyan : PALETTE.coral,
  };
});

function HexagonSvg({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <polygon
        points="16,2 28,9 28,23 16,30 4,23 4,9"
        stroke={color}
        strokeWidth="1.5"
        fill={color}
        fillOpacity="0.08"
      />
    </svg>
  );
}

function TriangleSvg({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <polygon
        points="16,3 29,27 3,27"
        stroke={color}
        strokeWidth="1.5"
        fill={color}
        fillOpacity="0.09"
      />
    </svg>
  );
}

export interface CyberpunkTechIntroProps {
  readonly compact?: boolean;
  readonly showGameBotHook?: boolean;
}

export function CyberpunkTechIntro({
  compact = false,
  showGameBotHook = true,
}: CyberpunkTechIntroProps) {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();

  const u = Math.min(width / 1920, height / 1080);

  // Corner reticle spring lock-in (stiff tactical snap, subtle settle)
  const bracketSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 170, mass: 0.7 },
  });
  const bracketOffset = interpolate(bracketSpring, [0, 1], [68 * u, 28 * u]);
  const bracketOpacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: 'clamp' });

  // Vertical green scanner beam sweeps smoothly left -> right -> settles across active target
  const scanProgress = interpolate(
    frame,
    [4, Math.round(durationInFrames * 0.72), durationInFrames],
    [0.06, 0.94, 0.72],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.inOut(Easing.cubic),
    }
  );
  const scanX = width * scanProgress;

  // Headline pop-in with physics-based overshoot
  const titlePop = spring({
    frame: Math.max(0, frame - 6),
    fps,
    config: { damping: 12, stiffness: 195, mass: 0.65 },
  });
  const badgePop = spring({
    frame: Math.max(0, frame - 14),
    fps,
    config: { damping: 14, stiffness: 185, mass: 0.7 },
  });

  // Bot avatar entrance + rhythmic laptop typing bounce
  const botPop = spring({
    frame: Math.max(0, frame - 22),
    fps,
    config: { damping: 12, stiffness: 155, mass: 0.85 },
  });
  const botBobY = Math.sin(frame * 0.42) * (4.2 * u);
  const botTilt = Math.sin(frame * 0.21) * 1.4;

  // Camera subtle push-in across duration
  const cameraScale = interpolate(frame, [0, durationInFrames], [0.985, 1.025], {
    extrapolateRight: 'clamp',
  });

  const statPills = useMemo(
    () => [
      { label: '8 NASA FEEDS', value: 'KEYLESS LIVE', accent: PALETTE.cyan },
      { label: 'VIIRS THERMAL', value: '375 M LOCK', accent: PALETTE.coral },
      { label: 'HABITAT TWIN', value: 'GRADE S AUTO', accent: PALETTE.scannerGreen },
    ],
    []
  );

  const bracketArm = Math.round((compact ? 42 : 58) * u);
  const bracketPad = Math.round(bracketOffset);
  const botCardSize = Math.round((compact ? 255 : 365) * u);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: PALETTE.obsidianBase,
        overflow: 'hidden',
        fontFamily: FONT_SANS,
      }}
    >
      {/* Clean orbital project backdrop: subtle obsidian ambient glow + technical dot matrix */}
      <AbsoluteFill
        style={{
          transform: `scale(${cameraScale})`,
          backgroundImage: `radial-gradient(64% 58% at 24% 38%, rgba(69, 184, 214, 0.14) 0%, transparent 65%), radial-gradient(48% 52% at 78% 66%, rgba(52, 211, 153, 0.12) 0%, transparent 65%), radial-gradient(circle, rgba(148, 163, 184, 0.22) 1px, transparent 1px)`,
          backgroundSize: '100% 100%, 100% 100%, 26px 26px',
        }}
      />

      {/* Deterministic floating geometric triangle + hexagon particles */}
      {PARTICLES.map((p) => {
        const driftX = Math.sin(frame * 0.032 * p.depth + p.phase) * 26 * u;
        const driftY = Math.cos(frame * 0.026 * p.depth + p.phase) * 22 * u;
        const spin = (frame * 0.65 * p.depth + p.id * 22) % 360;
        const alpha = 0.26 + 0.24 * Math.sin(frame * 0.05 + p.phase);
        const scaledSize = Math.max(12, Math.round(p.size * u * 1.15));
        return (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: `${p.xPct}%`,
              top: `${p.yPct}%`,
              opacity: alpha,
              transform: `translate(${driftX}px, ${driftY}px) rotate(${spin}deg)`,
              pointerEvents: 'none',
            }}
          >
            {p.kind === 'hex' ? (
              <HexagonSvg size={scaledSize} color={p.tint} />
            ) : (
              <TriangleSvg size={scaledSize} color={p.tint} />
            )}
          </div>
        );
      })}

      {/* Vertical green scanner line + soft emerald phosphor wash */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: scanX - 160 * u,
          width: 162 * u,
          background:
            'linear-gradient(90deg, rgba(52,211,153,0) 0%, rgba(52,211,153,0.06) 72%, rgba(93,255,154,0.22) 100%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: scanX,
          width: Math.max(2, Math.round(3 * u)),
          background: PALETTE.scannerBright,
          boxShadow: `0 0 ${24 * u}px ${PALETTE.scannerBright}, 0 0 ${52 * u}px ${PALETTE.scannerGreen}`,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: bracketPad + 10 * u,
          left: Math.min(width - 170 * u, Math.max(bracketPad + 16 * u, scanX + 12 * u)),
          fontFamily: FONT_MONO,
          fontSize: Math.max(10, Math.round(14 * u)),
          letterSpacing: '0.14em',
          color: PALETTE.scannerBright,
          opacity: 0.85,
          pointerEvents: 'none',
        }}
      >
        SCAN // {(scanProgress * 360).toFixed(1)}° AZ
      </div>

      {/* Animated corner reticle brackets */}
      {(
        [
          { top: bracketPad, left: bracketPad, bt: true, bl: true },
          { top: bracketPad, right: bracketPad, bt: true, br: true },
          { bottom: bracketPad, left: bracketPad, bb: true, bl: true },
          { bottom: bracketPad, right: bracketPad, bb: true, br: true },
        ] as Array<{
          top?: number;
          bottom?: number;
          left?: number;
          right?: number;
          bt?: boolean;
          bb?: boolean;
          bl?: boolean;
          br?: boolean;
        }>
      ).map((corner, idx) => (
        <div
          key={idx}
          style={{
            position: 'absolute',
            ...corner,
            width: bracketArm,
            height: bracketArm,
            opacity: bracketOpacity,
            borderTop: corner.bt ? `${Math.max(2, Math.round(3 * u))}px solid ${PALETTE.scannerGreen}` : 'none',
            borderBottom: corner.bb ? `${Math.max(2, Math.round(3 * u))}px solid ${PALETTE.scannerGreen}` : 'none',
            borderLeft: corner.bl ? `${Math.max(2, Math.round(3 * u))}px solid ${PALETTE.scannerGreen}` : 'none',
            borderRight: corner.br ? `${Math.max(2, Math.round(3 * u))}px solid ${PALETTE.scannerGreen}` : 'none',
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Main Content Stage: Left Pop-In Hook + Right Bot-Avatars Game Intro */}
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `${Math.round(78 * u)}px ${Math.round(92 * u)}px`,
          gap: Math.round(44 * u),
        }}
      >
        {/* Left: Pop-In Orbital Hook & Metrics */}
        <div
          style={{
            flex: 1.35,
            display: 'flex',
            flexDirection: 'column',
            gap: Math.round(24 * u),
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              alignSelf: 'flex-start',
              gap: Math.round(10 * u),
              padding: `${Math.round(8 * u)}px ${Math.round(16 * u)}px`,
              borderRadius: Math.round(6 * u),
              border: `1px solid rgba(52, 211, 153, 0.45)`,
              backgroundColor: 'rgba(52, 211, 153, 0.1)',
              color: PALETTE.scannerBright,
              fontFamily: FONT_MONO,
              fontSize: Math.max(11, Math.round(16 * u)),
              fontWeight: 700,
              letterSpacing: '0.16em',
              transform: `scale(${interpolate(badgePop, [0, 1], [0.8, 1])})`,
              opacity: badgePop,
            }}
          >
            <span
              style={{
                width: Math.round(10 * u),
                height: Math.round(10 * u),
                borderRadius: '50%',
                backgroundColor: PALETTE.scannerBright,
                boxShadow: `0 0 ${12 * u}px ${PALETTE.scannerBright}`,
              }}
            />
            NASA SPACE APPS 2026 // MISSION TELEMETRY TWIN
          </div>

          <div
            style={{
              transform: `translateY(${interpolate(titlePop, [0, 1], [38 * u, 0])}px) scale(${interpolate(titlePop, [0, 1], [0.9, 1])})`,
              opacity: titlePop,
            }}
          >
            <h1
              style={{
                margin: 0,
                fontSize: Math.round((compact ? 74 : 96) * u),
                lineHeight: 0.98,
                fontWeight: 800,
                letterSpacing: '-0.03em',
                color: PALETTE.inkPrimary,
              }}
            >
              DOPAIMINT
              <span style={{ color: PALETTE.cyan }}>.</span>
            </h1>
            <p
              style={{
                margin: `${Math.round(16 * u)}px 0 0 0`,
                fontSize: Math.round((compact ? 25 : 32) * u),
                lineHeight: 1.28,
                fontWeight: 500,
                color: PALETTE.inkSecondary,
                maxWidth: Math.round(780 * u),
              }}
            >
              From orbital thermal lock to autonomous lunar habitat survival in one unified twin.
            </p>
          </div>

          {/* 3 Cyberpunk Telemetry Pop-In Pills */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: Math.round(14 * u),
              marginTop: Math.round(8 * u),
            }}
          >
            {statPills.map((pill, idx) => {
              const s = spring({
                frame: Math.max(0, frame - (18 + idx * 5)),
                fps,
                config: { damping: 14, stiffness: 185, mass: 0.7 },
              });
              return (
                <div
                  key={pill.label}
                  style={{
                    padding: `${Math.round(12 * u)}px ${Math.round(18 * u)}px`,
                    borderRadius: Math.round(6 * u),
                    border: `1px dashed rgba(148, 163, 184, 0.34)`,
                    backgroundColor: 'rgba(16, 22, 34, 0.9)',
                    transform: `translateY(${interpolate(s, [0, 1], [20 * u, 0])}px)`,
                    opacity: s,
                  }}
                >
                  <div
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: Math.max(10, Math.round(12.5 * u)),
                      letterSpacing: '0.12em',
                      color: PALETTE.inkMuted,
                    }}
                  >
                    {pill.label}
                  </div>
                  <div
                    style={{
                      marginTop: Math.round(4 * u),
                      fontFamily: FONT_MONO,
                      fontSize: Math.max(13, Math.round(19 * u)),
                      fontWeight: 700,
                      color: pill.accent,
                    }}
                  >
                    {pill.value}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Bot-Avatars Animated Game Intro Card */}
        {showGameBotHook ? (
          <div
            style={{
              flex: 0.9,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              transform: `translateY(${interpolate(botPop, [0, 1], [54 * u, 0])}px) scale(${interpolate(botPop, [0, 1], [0.85, 1])})`,
              opacity: botPop,
            }}
          >
            <div
              style={{
                position: 'relative',
                padding: `${Math.round(24 * u)}px ${Math.round(28 * u)}px`,
                borderRadius: Math.round(14 * u),
                border: `1px solid rgba(69, 184, 214, 0.42)`,
                backgroundColor: 'rgba(16, 22, 34, 0.92)',
                boxShadow: `0 ${26 * u}px ${64 * u}px rgba(0, 0, 0, 0.65), 0 0 ${36 * u}px rgba(69, 184, 214, 0.14)`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              {/* Soft cyan monitor glow behind the typing plush Engineer bot */}
              <div
                style={{
                  position: 'absolute',
                  width: botCardSize * 0.85,
                  height: botCardSize * 0.85,
                  borderRadius: '50%',
                  background:
                    'radial-gradient(circle, rgba(69, 184, 214, 0.25) 0%, rgba(52, 211, 153, 0.08) 55%, transparent 75%)',
                  top: Math.round(24 * u),
                }}
              />
              <img
                src={resolveAssetUrl('/video-assets/bots/work.png')}
                alt="Bot Engineer introducing CradleFlow mission game"
                style={{
                  position: 'relative',
                  width: botCardSize,
                  height: botCardSize,
                  objectFit: 'contain',
                  transform: `translateY(${botBobY}px) rotate(${botTilt}deg)`,
                }}
              />
              <div
                style={{
                  marginTop: Math.round(12 * u),
                  display: 'flex',
                  alignItems: 'center',
                  gap: Math.round(10 * u),
                  fontFamily: FONT_MONO,
                  fontSize: Math.max(11, Math.round(15 * u)),
                  color: PALETTE.inkPrimary,
                  letterSpacing: '0.08em',
                }}
              >
                <span
                  style={{
                    color: PALETTE.scannerBright,
                    fontWeight: 700,
                  }}
                >
                  PHASE 01 → 02
                </span>
                <span style={{ color: PALETTE.inkMuted }}>TRIAGE TO CRADLEFLOW</span>
              </div>
            </div>
          </div>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
