import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { FONT_MONO, FONT_SANS, PALETTE, resolveAssetUrl } from '../palette';
import {
  AndromedaPanel,
  BotAvatarCell,
  DopaiMintHudBar,
  MdxcnFrame,
  MdxcnRule,
  RemotionAsciiBackdrop,
} from '../primitives';
import { SafeImg } from '../SafeImg';

export interface WarmPaperPitchSceneProps {
  readonly compactSummary?: boolean;
}

interface PitchStat {
  readonly target: number;
  readonly suffix: string;
  readonly label: string;
  readonly detail: string;
}

const PITCH_STATS: readonly PitchStat[] = [
  {
    target: 8,
    suffix: ' → 1',
    label: 'Keyless NASA streams fused',
    detail: 'FIRMS MODIS/VIIRS, POWER, GIBS, SAR, EONET, DONKI, GOES-18, OSDR',
  },
  {
    target: 38,
    suffix: '%',
    label: 'Duplicate fire alerts removed',
    detail: '26-year H3 elliptical harmonization across Terra, Aqua, and NOAA-20/21',
  },
  {
    target: 425,
    suffix: ' A',
    label: 'Live IEEE 738 safe line limit',
    detail: 'Dynamic conductor thermal derating + 65 min TTCE spread closure',
  },
  {
    target: 1064,
    suffix: ' OSDR',
    label: 'Space biology studies wired',
    detail: 'Same-origin CradleFlow shelter holds crew dose below 12 mSv (Grade S)',
  },
];

/**
 * Editorial Demo-Day Pitch rendered on DopaiMint's exact Light Theme:
 * - Warm archival paper (#f5f2ea) + deterministic light-mode ascii.rest earthrise canvas
 * - Low-saturation slate-teal accent (#1d6f8a)
 * - Official mdxcn [ TITLE ] dashed frames + 4px Andromeda panels
 * - Strictly ZERO closed captions or subtitle overlays
 */
export function WarmPaperPitchScene({ compactSummary = false }: WarmPaperPitchSceneProps) {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const u = Math.min(width / 1920, height / 1080);
  const padX = Math.round(76 * u);

  if (compactSummary) {
    // Unhurried single-board executive folio for the 28.50s NASA Field 3 cut (zero rushed board flips!)
    const enter1 = spring({
      frame: Math.max(0, frame - 4),
      fps,
      config: { damping: 16, stiffness: 165, mass: 0.78 },
    });
    const enter2 = spring({
      frame: Math.max(0, frame - 14),
      fps,
      config: { damping: 16, stiffness: 165, mass: 0.78 },
    });
    const enter3 = spring({
      frame: Math.max(0, frame - 24),
      fps,
      config: { damping: 16, stiffness: 165, mass: 0.78 },
    });
    const countP = interpolate(frame, [10, 68], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });

    return (
      <AbsoluteFill
        style={{
          backgroundColor: PALETTE.warmPaper,
          color: PALETTE.warmInk,
          fontFamily: FONT_SANS,
          overflow: 'hidden',
        }}
      >
        <RemotionAsciiBackdrop piece="earthrise" mode="light" scrimOpacity={0.68} speed={0.65} />

        <DopaiMintHudBar
          mode="light"
          activeTab="Slides"
          rightLabel="Demo-Day Folio · Warm Archival Light Mode"
          scale={u}
        />

        <div
          style={{
            position: 'absolute',
            top: Math.round(72 * u),
            left: padX,
            right: padX,
            bottom: Math.max(120, Math.round(176 * u)),
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: Math.round(11 * u),
          }}
        >
          {/* 01 // THE PROBLEM */}
          <div
            style={{
              transform: `translateY(${interpolate(enter1, [0, 1], [10 * u, 0])}px)`,
              opacity: interpolate(enter1, [0, 1], [0.9, 1]),
            }}
          >
            <MdxcnFrame
              title="01 // THE PROBLEM"
              mode="light"
              scale={u}
              titleAlign="left"
              bodyStyle={{ padding: `${Math.round(14 * u)}px ${Math.round(22 * u)}px` }}
            >
              <div
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: Math.round(26 * u),
                  fontWeight: 600,
                  letterSpacing: '-0.022em',
                  lineHeight: 1.18,
                  color: PALETTE.warmInk,
                }}
              >
                Wildfire plumes, grid conductor sag, and solar radiation alerts live in disconnected silos when minutes decide survival.
              </div>
            </MdxcnFrame>
          </div>

          {/* 02 // THE NUMBERS THAT MOVE */}
          <div
            style={{
              transform: `translateY(${interpolate(enter2, [0, 1], [20 * u, 0])}px)`,
              opacity: enter2,
            }}
          >
            <MdxcnFrame
              title="02 // THE NUMBERS THAT MOVE"
              mode="light"
              scale={u}
              titleAlign="left"
              bodyStyle={{ padding: `${Math.round(15 * u)}px ${Math.round(22 * u)}px` }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: Math.round(16 * u),
                }}
              >
                {PITCH_STATS.map((stat) => (
                  <AndromedaPanel
                    key={stat.label}
                    mode="light"
                    markerSize={Math.round(12 * u)}
                    style={{ padding: `${Math.round(16 * u)}px ${Math.round(16 * u)}px` }}
                  >
                    <div
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: Math.round(32 * u),
                        fontWeight: 700,
                        fontVariantNumeric: 'tabular-nums',
                        color: PALETTE.warmAccent,
                        lineHeight: 1.05,
                      }}
                    >
                      {Math.round(stat.target * countP).toLocaleString()}
                      <span style={{ fontSize: Math.round(18 * u) }}>{stat.suffix}</span>
                    </div>
                    <div
                      style={{
                        marginTop: Math.round(8 * u),
                        fontFamily: FONT_SANS,
                        fontSize: Math.round(15.5 * u),
                        fontWeight: 600,
                        color: PALETTE.warmInk,
                      }}
                    >
                      {stat.label}
                    </div>
                    <div
                      style={{
                        marginTop: Math.round(4 * u),
                        fontFamily: FONT_SANS,
                        fontSize: Math.round(12.5 * u),
                        lineHeight: 1.35,
                        color: PALETTE.warmMuted,
                      }}
                    >
                      {stat.detail}
                    </div>
                  </AndromedaPanel>
                ))}
              </div>
            </MdxcnFrame>
          </div>

          {/* 03 // THE ASK */}
          <div
            style={{
              transform: `translateY(${interpolate(enter3, [0, 1], [20 * u, 0])}px)`,
              opacity: enter3,
            }}
          >
            <MdxcnFrame
              title="03 // THE ASK"
              mode="light"
              scale={u}
              titleAlign="left"
              bodyStyle={{ padding: `${Math.round(18 * u)}px ${Math.round(24 * u)}px` }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: Math.round(24 * u),
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: Math.round(18 * u) }}>
                  <BotAvatarCell
                    botFile="design.png"
                    roleLabel="Open Twin"
                    statusLabel="LIVE"
                    mode="light"
                    size={Math.round(74 * u)}
                    phaseOffset={1.1}
                    style={{ padding: Math.round(8 * u), flexShrink: 0 }}
                  />
                  <div>
                    <div
                      style={{
                        fontFamily: FONT_SANS,
                        fontSize: Math.round(25 * u),
                        fontWeight: 600,
                        letterSpacing: '-0.02em',
                        color: PALETTE.warmInk,
                      }}
                    >
                      Test the live zero-login observatory and 3-wave drill right in your browser
                    </div>
                    <div
                      style={{
                        marginTop: Math.round(4 * u),
                        fontFamily: FONT_SANS,
                        fontSize: Math.round(15 * u),
                        color: PALETTE.warmMuted,
                      }}
                    >
                      Open-source NASA Space Apps 2026 entry · Live telemetry, interactive deck, and CradleFlow simulator
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    flexShrink: 0,
                    padding: `${Math.round(13 * u)}px ${Math.round(20 * u)}px`,
                    borderRadius: 4,
                    backgroundColor: PALETTE.warmAccent,
                    color: '#faf8f2',
                    fontFamily: FONT_MONO,
                    fontSize: Math.round(15 * u),
                    fontWeight: 600,
                  }}
                >
                  dopaimint-production.up.railway.app ↗
                </div>
              </div>
            </MdxcnFrame>
          </div>
        </div>

        {/* Archival bottom folio raised above Remotion <Player controls> chrome */}
        <div
          style={{
            position: 'absolute',
            bottom: Math.max(92, Math.round(144 * u)),
            left: padX,
            right: padX,
            display: 'flex',
            justifyContent: 'space-between',
            fontFamily: FONT_MONO,
            fontSize: Math.max(10, Math.round(12.5 * u)),
            color: '#52606d',
            letterSpacing: '0.12em',
          }}
        >
          <span>EARTH + SPACE CORRIDOR INTELLIGENCE</span>
          <span>FOLIO // ARCHIVAL TELEMETRY</span>
        </div>
      </AbsoluteFill>
    );
  }

  // Full 3-Board Demo-Day Pitch (Problem -> Numbers That Move -> The Ask) for Full Product Demo
  const t1 = Math.round(durationInFrames * 0.32);
  const t2 = Math.round(durationInFrames * 0.67);

  const s2 = spring({
    frame: Math.max(0, frame - t1),
    fps,
    config: { damping: 18, stiffness: 135, mass: 0.88 },
  });
  const s3 = spring({
    frame: Math.max(0, frame - t2),
    fps,
    config: { damping: 18, stiffness: 135, mass: 0.88 },
  });

  const opProblem = interpolate(s2, [0, 0.42], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const opNumbers =
    interpolate(s2, [0.36, 0.76], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }) *
    interpolate(s3, [0, 0.42], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  const opAsk = interpolate(s3, [0.36, 0.76], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const countProgress = interpolate(
    frame,
    [t1 + 6, Math.max(t1 + 18, t1 + Math.round((t2 - t1) * 0.45))],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  const activeIdx = frame < t1 ? 0 : frame < t2 ? 1 : 2;
  const chapters = ['01 // THE PROBLEM', '02 // THE NUMBERS THAT MOVE', '03 // THE ASK'] as const;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: PALETTE.warmPaper,
        color: PALETTE.warmInk,
        fontFamily: FONT_SANS,
        overflow: 'hidden',
      }}
    >
      <RemotionAsciiBackdrop piece="earthrise" mode="light" scrimOpacity={0.68} speed={0.65} />

      <DopaiMintHudBar
        mode="light"
        activeTab="Overview"
        rightLabel="Demo-Day Pitch · Warm Paper Light Mode"
        scale={u}
      />

      {/* Editorial Folio Strip */}
      <div
        style={{
          position: 'absolute',
          top: Math.round(76 * u),
          left: padX,
          right: padX,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontFamily: FONT_MONO,
          fontSize: Math.max(10, Math.round(13 * u)),
          letterSpacing: '0.12em',
          color: PALETTE.warmAccent,
        }}
      >
        <span>DOPAIMINT × CRADLEFLOW · EXECUTIVE BRIEF</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: Math.round(24 * u) }}>
          {chapters.map((label, idx) => (
            <span
              key={label}
              style={{
                opacity: idx === activeIdx ? 1 : 0.38,
                fontWeight: idx === activeIdx ? 700 : 500,
              }}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      <MdxcnRule
        mode="light"
        style={{
          position: 'absolute',
          top: Math.round(108 * u),
          left: padX,
          width: width - padX * 2,
        }}
      />

      {/* ACT 01: THE PROBLEM */}
      <div
        style={{
          position: 'absolute',
          top: Math.round(126 * u),
          left: padX,
          right: padX,
          bottom: Math.round(174 * u),
          display: 'grid',
          gridTemplateColumns: '1.18fr 0.82fr',
          gap: Math.round(36 * u),
          alignItems: 'center',
          opacity: opProblem,
          transform: `translateY(${interpolate(s2, [0, 1], [0, -24 * u])}px)`,
        }}
      >
        <MdxcnFrame
          title="01 // THE PROBLEM"
          mode="light"
          scale={u}
          titleAlign="left"
          bodyStyle={{ padding: `${Math.round(34 * u)}px ${Math.round(32 * u)}px` }}
        >
          <h2
            style={{
              margin: 0,
              fontFamily: FONT_SANS,
              fontSize: Math.round(50 * u),
              fontWeight: 600,
              letterSpacing: '-0.028em',
              lineHeight: 1.1,
              color: PALETTE.warmInk,
            }}
          >
            Earth hazard feeds and space habitat drills sit on disconnected islands.
          </h2>
          <p
            style={{
              margin: `${Math.round(20 * u)}px 0 0 0`,
              fontFamily: FONT_SANS,
              fontSize: Math.round(21 * u),
              lineHeight: 1.48,
              color: PALETTE.warmMuted,
            }}
          >
            Grid operators face 38% duplicate multi-satellite fire counts and static line ratings, while crew trainers rely on offline radiation tables disconnected from live NOAA GOES-18 storms.
          </p>
          <MdxcnRule mode="light" style={{ margin: `${Math.round(24 * u)}px 0 ${Math.round(18 * u)}px` }} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: Math.round(10 * u) }}>
            {[
              'Duplicate MODIS + VIIRS hits',
              'Static nameplate ampacity',
              'Unlinked GOES-18 proton alerts',
              'Offline crew shelter SOPs',
            ].map((item) => (
              <span
                key={item}
                style={{
                  padding: `${Math.round(7 * u)}px ${Math.round(13 * u)}px`,
                  borderRadius: 4,
                  border: '1px solid rgba(14, 20, 30, 0.16)',
                  backgroundColor: PALETTE.warmPaperCard,
                  fontFamily: FONT_MONO,
                  fontSize: Math.max(10, Math.round(12.5 * u)),
                  color: PALETTE.warmInk,
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </MdxcnFrame>

        <AndromedaPanel
          mode="light"
          markerSize={Math.round(16 * u)}
          style={{
            padding: Math.round(12 * u),
            backgroundColor: '#ece8dd',
          }}
        >
          <div
            style={{
              padding: `${Math.round(4 * u)}px ${Math.round(8 * u)}px ${Math.round(10 * u)}px`,
              display: 'flex',
              justifyContent: 'space-between',
              fontFamily: FONT_MONO,
              fontSize: Math.max(9, Math.round(11 * u)),
              color: PALETTE.warmMuted,
            }}
          >
            <span>LIVE LIGHT THEME · /?theme=light</span>
            <span style={{ color: PALETTE.warmAccent }}>SAME DESIGN SYSTEM</span>
          </div>
          <div
            style={{
              width: '100%',
              height: Math.round(470 * u),
              borderRadius: 3,
              overflow: 'hidden',
              border: '1px solid rgba(14, 20, 30, 0.14)',
            }}
          >
            <SafeImg
              src={resolveAssetUrl('/video-assets/screens/step-6-light-paper.jpg')}
              alt="DopaiMint warm archival paper light mode"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center top',
              }}
            />
          </div>
        </AndromedaPanel>
      </div>

      {/* ACT 02: THE NUMBERS THAT MOVE */}
      <div
        style={{
          position: 'absolute',
          top: Math.round(126 * u),
          left: padX,
          right: padX,
          bottom: Math.round(174 * u),
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          opacity: opNumbers,
          transform: `translateY(${interpolate(s2, [0, 1], [28 * u, 0]) - interpolate(s3, [0, 1], [0, 24 * u])}px)`,
        }}
      >
        <MdxcnFrame
          title="02 // THE NUMBERS THAT MOVE"
          mode="light"
          scale={u}
          titleAlign="left"
          bodyStyle={{ padding: `${Math.round(32 * u)}px ${Math.round(32 * u)}px` }}
        >
          <div
            style={{
              fontFamily: FONT_SANS,
              fontSize: Math.round(40 * u),
              fontWeight: 600,
              letterSpacing: '-0.025em',
              color: PALETTE.warmInk,
            }}
          >
            Verified end-to-end across live keyless NASA telemetry and IEEE 738 physics
          </div>

          <div
            style={{
              marginTop: Math.round(28 * u),
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: Math.round(20 * u),
            }}
          >
            {PITCH_STATS.map((stat, idx) => {
              const p = interpolate(
                countProgress,
                [idx * 0.08, 0.74 + idx * 0.08],
                [0, 1],
                { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
              );
              return (
                <AndromedaPanel
                  key={stat.label}
                  mode="light"
                  markerSize={Math.round(14 * u)}
                  style={{
                    padding: `${Math.round(24 * u)}px ${Math.round(20 * u)}px`,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: Math.round(270 * u),
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: Math.round(48 * u),
                        fontWeight: 700,
                        fontVariantNumeric: 'tabular-nums',
                        color: PALETTE.warmAccent,
                        letterSpacing: '-0.025em',
                        lineHeight: 1.05,
                      }}
                    >
                      {Math.round(stat.target * p).toLocaleString()}
                      <span style={{ fontSize: Math.round(24 * u) }}>{stat.suffix}</span>
                    </div>
                    <div
                      style={{
                        marginTop: Math.round(14 * u),
                        fontFamily: FONT_SANS,
                        fontSize: Math.round(20 * u),
                        fontWeight: 600,
                        lineHeight: 1.25,
                        color: PALETTE.warmInk,
                      }}
                    >
                      {stat.label}
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: Math.round(14 * u),
                      paddingTop: Math.round(12 * u),
                      borderTop: '1px dashed rgba(14, 20, 30, 0.18)',
                      fontFamily: FONT_SANS,
                      fontSize: Math.round(14.5 * u),
                      lineHeight: 1.4,
                      color: PALETTE.warmMuted,
                    }}
                  >
                    {stat.detail}
                  </div>
                </AndromedaPanel>
              );
            })}
          </div>
        </MdxcnFrame>
      </div>

      {/* ACT 03: THE ASK */}
      <div
        style={{
          position: 'absolute',
          top: Math.round(126 * u),
          left: padX,
          right: padX,
          bottom: Math.round(174 * u),
          display: 'grid',
          gridTemplateColumns: '1.32fr 0.68fr',
          gap: Math.round(36 * u),
          alignItems: 'center',
          opacity: opAsk,
          transform: `translateY(${interpolate(s3, [0, 1], [28 * u, 0])}px)`,
        }}
      >
        <MdxcnFrame
          title="03 // THE ASK"
          mode="light"
          scale={u}
          titleAlign="left"
          bodyStyle={{ padding: `${Math.round(36 * u)}px ${Math.round(34 * u)}px` }}
        >
          <h2
            style={{
              margin: 0,
              fontFamily: FONT_SANS,
              fontSize: Math.round(52 * u),
              fontWeight: 600,
              letterSpacing: '-0.028em',
              lineHeight: 1.1,
              color: PALETTE.warmInk,
            }}
          >
            Open the live observatory and run the 3-wave triage drill today.
          </h2>
          <p
            style={{
              margin: `${Math.round(20 * u)}px 0 0 0`,
              fontFamily: FONT_SANS,
              fontSize: Math.round(21 * u),
              lineHeight: 1.48,
              color: PALETTE.warmMuted,
            }}
          >
            Built for regional utility crews, mission ops educators, and NASA Space Apps 2026 judges. Zero login, open-source TypeScript, and instant browser replay.
          </p>

          <div
            style={{
              marginTop: Math.round(30 * u),
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: Math.round(14 * u),
            }}
          >
            <span
              style={{
                padding: `${Math.round(15 * u)}px ${Math.round(24 * u)}px`,
                borderRadius: 4,
                backgroundColor: PALETTE.warmAccent,
                color: '#faf8f2',
                fontFamily: FONT_MONO,
                fontSize: Math.round(18 * u),
                fontWeight: 600,
              }}
            >
              https://dopaimint-production.up.railway.app ↗
            </span>
            <span
              style={{
                padding: `${Math.round(15 * u)}px ${Math.round(20 * u)}px`,
                borderRadius: 4,
                border: '1px solid rgba(14, 20, 30, 0.22)',
                backgroundColor: PALETTE.warmPaperCard,
                color: PALETTE.warmInk,
                fontFamily: FONT_MONO,
                fontSize: Math.round(16 * u),
              }}
            >
              /submission/ · 7-Slide Deck &amp; Demo
            </span>
          </div>
        </MdxcnFrame>

        <MdxcnFrame
          title="CREW CERTIFICATION"
          mode="light"
          scale={u}
          bodyStyle={{
            padding: `${Math.round(28 * u)}px ${Math.round(24 * u)}px`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <BotAvatarCell
            botFile="design.png"
            roleLabel="DopaiMint × CradleFlow"
            statusLabel="2026"
            mode="light"
            size={Math.round(196 * u)}
            phaseOffset={0.6}
          />
          <div
            style={{
              marginTop: Math.round(18 * u),
              fontFamily: FONT_SANS,
              fontSize: Math.round(19 * u),
              fontWeight: 600,
              color: PALETTE.warmInk,
            }}
          >
            Unified Earth-to-Orbit Digital Twin
          </div>
          <div
            style={{
              marginTop: Math.round(6 * u),
              fontFamily: FONT_MONO,
              fontSize: Math.max(10, Math.round(12 * u)),
              color: PALETTE.warmMuted,
            }}
          >
            8 Keyless APIs · Grade S Shelter Certified
          </div>
        </MdxcnFrame>
      </div>

      {/* Subtle archival bottom folio safely cleared above <Player controls> chrome */}
      <div
        style={{
          position: 'absolute',
          bottom: Math.max(92, Math.round(144 * u)),
          left: padX,
          right: padX,
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: FONT_MONO,
          fontSize: Math.max(10, Math.round(13 * u)),
          color: '#52606d',
          letterSpacing: '0.12em',
        }}
      >
        <span>EARTH + SPACE CORRIDOR INTELLIGENCE</span>
        <span>FOLIO // ARCHIVAL TELEMETRY</span>
      </div>
    </AbsoluteFill>
  );
}
