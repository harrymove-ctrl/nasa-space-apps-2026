import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { FONT_MONO, FONT_SANS, PALETTE, resolveAssetUrl } from '../palette';
import {
  AndromedaBrackets,
  AndromedaPanel,
  BotAvatarCell,
  DopaiMintHudBar,
  MdxcnFrame,
  MdxcnRule,
  RemotionAsciiBackdrop,
} from '../primitives';
import { SafeImg } from '../SafeImg';

interface GeoParticle {
  readonly id: number;
  readonly kind: 'hex' | 'tri';
  readonly xPct: number;
  readonly yPct: number;
  readonly size: number;
  readonly depth: number;
  readonly phase: number;
  readonly color: string;
}

const GEO_PARTICLES: readonly GeoParticle[] = Array.from({ length: 14 }, (_, i) => {
  const s1 = Math.sin(i * 17.31 + 2.7) * 10000;
  const f1 = s1 - Math.floor(s1);
  const s2 = Math.cos(i * 37.93 + 1.4) * 10000;
  const f2 = s2 - Math.floor(s2);
  return {
    id: i,
    kind: i % 2 === 0 ? 'hex' : 'tri',
    xPct: 5 + ((i * 14.2 + f1 * 12) % 90),
    yPct: 12 + ((i * 18.5 + f2 * 16) % 78),
    size: 14 + (i % 3) * 8,
    depth: 0.5 + (i % 3) * 0.22,
    phase: i * 0.72,
    color: i % 3 === 0 ? PALETTE.scannerGreen : i % 3 === 1 ? PALETTE.cyan : PALETTE.inkMuted,
  };
});

function WireShape({ kind, size, color }: { kind: 'hex' | 'tri'; size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {kind === 'hex' ? (
        <polygon
          points="16,2.5 28,9.5 28,22.5 16,29.5 4,22.5 4,9.5"
          stroke={color}
          strokeWidth="1.25"
          fill={color}
          fillOpacity="0.05"
        />
      ) : (
        <polygon
          points="16,3.5 28.5,27 3.5,27"
          stroke={color}
          strokeWidth="1.25"
          fill={color}
          fillOpacity="0.05"
        />
      )}
    </svg>
  );
}

export interface CyberpunkTechIntroProps {
  readonly compact?: boolean;
  readonly showGameBotHook?: boolean;
}

const CREW_BOTS = [
  {
    botFile: 'search.png' as const,
    roleLabel: 'FIRMS Recon',
    statusLabel: '375m Lock',
    delay: 16,
    phaseOffset: 0.0,
  },
  {
    botFile: 'work.png' as const,
    roleLabel: 'Grid Triage',
    statusLabel: 'IEEE 738',
    delay: 22,
    phaseOffset: 1.4,
  },
  {
    botFile: 'tools.png' as const,
    roleLabel: 'CradleFlow',
    statusLabel: 'Shield S',
    delay: 28,
    phaseOffset: 2.9,
  },
] as const;

export function CyberpunkTechIntro({
  compact = false,
  showGameBotHook = true,
}: CyberpunkTechIntroProps) {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const u = Math.min(width / 1920, height / 1080);

  // Spring-driven tactical corner reticle lock-in (bold & visible at frame 0)
  const reticleSpring = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 185, mass: 0.72 },
  });
  const reticleInset = Math.round(interpolate(reticleSpring, [0, 1], [32 * u, 22 * u]));

  // Vertical green orbital azimuth scanner sweep starting inside stage at frame 0
  const scanProgress = interpolate(
    frame,
    [0, Math.round(durationInFrames * 0.68), durationInFrames],
    [0.18, 0.94, 0.61],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.inOut(Easing.cubic),
    },
  );
  const scanX = width * scanProgress;

  // Physics-based pop-in springs matching DopaiMint web cadence (visible poster at frame 0)
  const pillSpring = spring({
    frame: Math.max(0, frame - 2),
    fps,
    config: { damping: 16, stiffness: 190, mass: 0.7 },
  });
  const heroSpring = spring({
    frame: Math.max(0, frame - 5),
    fps,
    config: { damping: 15, stiffness: 175, mass: 0.75 },
  });
  const stageSpring = spring({
    frame: Math.max(0, frame - 8),
    fps,
    config: { damping: 16, stiffness: 165, mass: 0.8 },
  });

  const padX = Math.round(64 * u);
  const padY = Math.round(28 * u);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: PALETTE.obsidianBase,
        fontFamily: FONT_SANS,
        color: PALETTE.inkPrimary,
        overflow: 'hidden',
      }}
    >
      {/* Clean project backdrop: deterministic ascii.rest radar/earthrise field */}
      <RemotionAsciiBackdrop piece="earthrise" mode="dark" scrimOpacity={0.68} speed={0.9} />

      {/* Subtle floating geometric wireframe triangles & hexagons */}
      {GEO_PARTICLES.map((p) => {
        const pEnter = spring({
          frame: Math.max(0, frame - (p.id % 6) * 2),
          fps,
          config: { damping: 18, stiffness: 140, mass: 0.8 },
        });
        const dx = Math.sin(frame * 0.03 * p.depth + p.phase) * 20 * u;
        const dy = Math.cos(frame * 0.024 * p.depth + p.phase) * 16 * u;
        const rot = (frame * 0.55 * p.depth + p.id * 24) % 360;
        const opacity = (0.45 + 0.55 * pEnter) * (0.22 + 0.16 * Math.sin(frame * 0.045 + p.phase));
        return (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: `${p.xPct}%`,
              top: `${p.yPct}%`,
              opacity,
              transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg) scale(${interpolate(pEnter, [0, 1], [0.5, 1])})`,
              pointerEvents: 'none',
            }}
          >
            <WireShape
              kind={p.kind}
              size={Math.max(12, Math.round(p.size * u))}
              color={p.color}
            />
          </div>
        );
      })}

      {/* Exact DopaiMint live web top navbar */}
      <DopaiMintHudBar
        mode="dark"
        activeTab="Overview"
        rightLabel="8/8 NASA Live · Zero Login"
        scale={u}
      />

      {/* Animated outer tactical corner brackets */}
      <div
        style={{
          position: 'absolute',
          top: Math.round(56 * u) + reticleInset,
          left: reticleInset,
          right: reticleInset,
          bottom: reticleInset,
          pointerEvents: 'none',
          opacity: interpolate(frame, [0, 8], [0.85, 0.94], { extrapolateRight: 'clamp' }),
        }}
      >
        <AndromedaBrackets
          size={Math.round(28 * u)}
          offset={0}
          strokeWidth={Math.max(1.5, 2 * u)}
          color={PALETTE.scannerGreen}
          radius={4}
        />
      </div>

      {/* Crisp vertical green azimuth scanner beam (clean technical laser, zero muddy neon glow) */}
      <div
        style={{
          position: 'absolute',
          top: Math.round(56 * u),
          bottom: 0,
          left: scanX - Math.round(110 * u),
          width: Math.round(110 * u),
          background:
            'linear-gradient(90deg, rgba(52,211,153,0) 0%, rgba(52,211,153,0.045) 72%, rgba(93,255,154,0.14) 100%)',
          pointerEvents: 'none',
          zIndex: 8,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: Math.round(56 * u),
          bottom: 0,
          left: scanX,
          width: Math.max(1.5, Math.round(2 * u)),
          backgroundColor: PALETTE.scannerBright,
          boxShadow: `0 0 ${Math.round(10 * u)}px rgba(52, 211, 153, 0.55)`,
          pointerEvents: 'none',
          zIndex: 9,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: Math.round(68 * u),
          left: Math.min(width - Math.round(210 * u), Math.max(padX, scanX + Math.round(10 * u))),
          padding: `${Math.round(3 * u)}px ${Math.round(8 * u)}px`,
          borderRadius: 3,
          backgroundColor: 'rgba(9, 12, 20, 0.88)',
          border: '1px solid rgba(52, 211, 153, 0.38)',
          fontFamily: FONT_MONO,
          fontSize: Math.max(9, Math.round(11.5 * u)),
          letterSpacing: '0.1em',
          color: PALETTE.scannerBright,
          pointerEvents: 'none',
          zIndex: 10,
        }}
      >
        AZ SCAN {(scanProgress * 360).toFixed(1)}° · PASS LOCK
      </div>

      {/* Main Two-Column Stage matching HeroSection.tsx + mdxcn + bot-avatars */}
      <div
        style={{
          position: 'absolute',
          top: Math.round(64 * u),
          left: 0,
          right: 0,
          bottom: 0,
          padding: `${padY}px ${padX}px`,
          display: 'grid',
          gridTemplateColumns: '1.12fr 1fr',
          gap: Math.round(36 * u),
          alignItems: 'center',
        }}
      >
        {/* Left Column: Andromeda Hero Hook + Live Corridor Readout */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: Math.round(18 * u) }}>
          {/* Exact HeroSection fact badge pill */}
          <div
            style={{
              display: 'inline-flex',
              alignSelf: 'flex-start',
              alignItems: 'center',
              gap: Math.round(14 * u),
              padding: `${Math.round(7 * u)}px ${Math.round(16 * u)}px`,
              borderRadius: 999,
              border: '1px solid rgba(241, 237, 228, 0.16)',
              backgroundColor: 'rgba(16, 22, 34, 0.88)',
              fontFamily: FONT_MONO,
              fontSize: Math.max(10, Math.round(12.5 * u)),
              color: PALETTE.inkSecondary,
              transform: `translateY(${interpolate(pillSpring, [0, 1], [8 * u, 0])}px) scale(${interpolate(pillSpring, [0, 1], [0.97, 1])})`,
              opacity: interpolate(pillSpring, [0, 1], [0.9, 1]),
            }}
          >
            <span style={{ color: PALETTE.scannerGreen }}>● NASA Space Apps 2026</span>
            <span style={{ opacity: 0.35 }}>|</span>
            <span>26 Years MODIS + VIIRS</span>
            <span style={{ opacity: 0.35 }}>|</span>
            <span style={{ color: PALETTE.cyan }}>IEEE 738 + GOES-18</span>
          </div>

          {/* Exact Andromeda sentence-case 600 display typography */}
          <div
            style={{
              transform: `translateY(${interpolate(heroSpring, [0, 1], [10 * u, 0])}px) scale(${interpolate(heroSpring, [0, 1], [0.985, 1])})`,
              opacity: interpolate(heroSpring, [0, 1], [0.94, 1]),
            }}
          >
            <h1
              style={{
                margin: 0,
                fontSize: Math.round((compact ? 50 : 56) * u),
                fontWeight: 600,
                lineHeight: 1.08,
                letterSpacing: '-0.028em',
                color: PALETTE.inkPrimary,
              }}
            >
              Orbital fire and solar risk telemetry for grid crews and space missions
            </h1>
            <p
              style={{
                margin: `${Math.round(14 * u)}px 0 0 0`,
                fontSize: Math.round(19 * u),
                lineHeight: 1.45,
                fontWeight: 400,
                color: PALETTE.inkSecondary,
                textShadow: '0 2px 14px rgba(9, 12, 20, 0.95)',
                maxWidth: Math.round(820 * u),
              }}
            >
              DopaiMint fuses 8 keyless NASA, NOAA, and ESA streams into IEEE 738 conductor safety limits and one-click CradleFlow storm shelter automation.
            </p>
          </div>

          {/* mdxcn [ LIVE CORRIDOR READOUT ] matching MinimalLandingSections */}
          <div
            style={{
              marginTop: Math.round(6 * u),
              transform: `translateY(${interpolate(stageSpring, [0, 1], [10 * u, 0])}px)`,
              opacity: interpolate(stageSpring, [0, 1], [0.9, 1]),
            }}
          >
            <MdxcnFrame
              title="LIVE CORRIDOR READOUT · BUTTE 230 KV"
              mode="dark"
              scale={u}
              bodyStyle={{
                padding: `${Math.round(18 * u)}px ${Math.round(20 * u)}px`,
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: Math.round(14 * u),
                }}
              >
                {[
                  { label: 'SAFE LIMIT', value: '425 A', hint: 'IEEE 738 live', color: PALETTE.coral },
                  { label: 'VIIRS DEDUP', value: '375 m', hint: 'H3 harmonized', color: PALETTE.cyan },
                  { label: 'GOES-18 FLUX', value: '185 pfu', hint: 'Kp 6.3 handoff', color: PALETTE.scannerGreen },
                  { label: 'OSDR ASSAYS', value: '1,064', hint: 'Bio-shielded', color: PALETTE.inkPrimary },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div
                      style={{
                        fontSize: Math.max(9, Math.round(10.5 * u)),
                        letterSpacing: '0.08em',
                        color: PALETTE.inkMuted,
                      }}
                    >
                      {stat.label}
                    </div>
                    <div
                      style={{
                        marginTop: Math.round(4 * u),
                        fontSize: Math.round(22 * u),
                        fontWeight: 700,
                        fontVariantNumeric: 'tabular-nums',
                        color: stat.color,
                      }}
                    >
                      {stat.value}
                    </div>
                    <div
                      style={{
                        marginTop: Math.round(2 * u),
                        fontSize: Math.max(9, Math.round(10.5 * u)),
                        color: PALETTE.inkMuted,
                      }}
                    >
                      {stat.hint}
                    </div>
                  </div>
                ))}
              </div>
            </MdxcnFrame>
          </div>
        </div>

        {/* Right Column: Live Web Observatory Window + Bot-Avatars Mission Game Hook */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: Math.round(18 * u),
            transform: `translateY(${interpolate(stageSpring, [0, 1], [12 * u, 0])}px) scale(${interpolate(stageSpring, [0, 1], [0.98, 1])})`,
            opacity: interpolate(stageSpring, [0, 1], [0.9, 1]),
          }}
        >
          {/* Real live DopaiMint web UI frame */}
          <AndromedaPanel
            mode="dark"
            markerSize={Math.round(16 * u)}
            markerColor={PALETTE.cyan}
            style={{
              padding: Math.round(10 * u),
              backgroundColor: 'rgba(11, 16, 27, 0.94)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: `${Math.round(4 * u)}px ${Math.round(8 * u)}px ${Math.round(10 * u)}px`,
                fontFamily: FONT_MONO,
                fontSize: Math.max(9, Math.round(11 * u)),
                color: PALETTE.inkMuted,
              }}
            >
              <span>https://dopaimint-production.up.railway.app</span>
              <span style={{ color: PALETTE.scannerGreen }}>HTTP 200 · LIVE WEB</span>
            </div>
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: Math.round((showGameBotHook ? 390 : 560) * u),
                borderRadius: 3,
                overflow: 'hidden',
                border: '1px solid rgba(241, 237, 228, 0.12)',
              }}
            >
              <SafeImg
                src={resolveAssetUrl('/video-assets/screens/step-1-observatory.jpg')}
                alt="DopaiMint live web observatory"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center top',
                }}
              />
            </div>
          </AndromedaPanel>

          {/* bot-avatars.vercel.app Animated Crew Cells Introducing Phase 01 -> Phase 02 */}
          {showGameBotHook ? (
            <MdxcnFrame
              title="MISSION DRILL CREW · PHASE 01 TRIAGE → PHASE 02 CRADLEFLOW"
              mode="dark"
              accentColor={PALETTE.scannerGreen}
              scale={u}
              bodyStyle={{
                padding: `${Math.round(18 * u)}px ${Math.round(18 * u)}px ${Math.round(14 * u)}px`,
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: Math.round(12 * u),
                }}
              >
                {CREW_BOTS.map((bot) => {
                  const bSpring = spring({
                    frame: Math.max(0, frame - bot.delay),
                    fps,
                    config: { damping: 13, stiffness: 180, mass: 0.72 },
                  });
                  return (
                    <div
                      key={bot.roleLabel}
                      style={{
                        transform: `translateY(${interpolate(bSpring, [0, 1], [8 * u, 0])}px) scale(${interpolate(bSpring, [0, 1], [0.93, 1])})`,
                        opacity: interpolate(bSpring, [0, 1], [0.88, 1]),
                      }}
                    >
                      <BotAvatarCell
                        botFile={bot.botFile}
                        roleLabel={bot.roleLabel}
                        statusLabel={bot.statusLabel}
                        size={Math.round(112 * u)}
                        phaseOffset={bot.phaseOffset}
                      />
                    </div>
                  );
                })}
              </div>
              <MdxcnRule mode="dark" style={{ marginTop: Math.round(12 * u) }} />
              <div
                style={{
                  marginTop: Math.round(9 * u),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: Math.max(9, Math.round(11.5 * u)),
                  color: PALETTE.inkSecondary,
                }}
              >
                <span>Interactive 3-wave grid drill + React Flow habitat shelter</span>
                <span style={{ color: PALETTE.cyan, fontWeight: 600 }}>/?view=game →</span>
              </div>
            </MdxcnFrame>
          ) : null}
        </div>
      </div>
    </AbsoluteFill>
  );
}
