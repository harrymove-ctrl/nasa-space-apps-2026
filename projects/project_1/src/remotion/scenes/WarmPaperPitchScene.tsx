import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { FONT_MONO, FONT_SANS, PALETTE, resolveAssetUrl } from '../palette';

interface PitchMetric {
  readonly target: number;
  readonly suffix: string;
  readonly label: string;
  readonly detail: string;
}

const PITCH_METRICS: readonly PitchMetric[] = [
  {
    target: 8,
    suffix: ' -> 1',
    label: 'NASA Feeds Fused',
    detail: 'FIRMS, EONET, DONKI, GIBS, CMR SAR, POWER, CelesTrak, OSDR',
  },
  {
    target: 185,
    suffix: ' pfu',
    label: 'Live Proton Surge',
    detail: 'Directly seeds Phase 02 CradleFlow shelter simulation',
  },
  {
    target: 738,
    suffix: ' IEEE',
    label: 'Conductor Ampacity',
    detail: 'Real wind and thermal line derating per active flare',
  },
  {
    target: 0,
    suffix: ' gates',
    label: 'Zero Login Friction',
    detail: 'Instant browser execution across 50km field corridors',
  },
];

/**
 * Editorial Demo-Day Pitch on archival warm paper (#f5f2ea) with muted slate-teal accent (#1d6f8a).
 * Strictly zero closed captions or subtitle strips.
 * Transitions seamlessly through:
 * 1. The Problem
 * 2. The Numbers That Move (animated KPI numerals)
 * 3. The Ask
 */
export function WarmPaperPitchScene() {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const u = Math.min(width / 1920, height / 1080);

  // Split duration evenly into 3 beats: Problem (0..32%), Numbers (32..68%), Ask (68..100%)
  const t1 = Math.round(durationInFrames * 0.32);
  const t2 = Math.round(durationInFrames * 0.68);

  const stage2Spring = spring({
    frame: Math.max(0, frame - t1),
    fps,
    config: { damping: 18, stiffness: 135, mass: 0.9 },
  });
  const stage3Spring = spring({
    frame: Math.max(0, frame - t2),
    fps,
    config: { damping: 18, stiffness: 135, mass: 0.9 },
  });

  const opProblem = interpolate(stage2Spring, [0, 0.36], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const opNumbers =
    interpolate(stage2Spring, [0.34, 0.7], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }) *
    interpolate(stage3Spring, [0, 0.36], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  const opAsk = interpolate(stage3Spring, [0.34, 0.72], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Top folio rule draw-in
  const headerEntrance = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 160, mass: 0.75 },
  });
  const ruleScaleX = interpolate(headerEntrance, [0, 1], [0.1, 1]);

  // Number counter sweep settles early inside Beat 2 so target numbers hold cleanly before Beat 3
  const countProgress = interpolate(
    frame,
    [t1 + 4, Math.max(t1 + 12, Math.round((t1 + t2) * 0.52))],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  // Plush mascot stamp spring inside Beat 3
  const botAskSpring = spring({
    frame: Math.max(0, frame - (t2 + 6)),
    fps,
    config: { damping: 13, stiffness: 165, mass: 0.75 },
  });
  const botFloat = Math.sin(frame * 0.09) * 5 * u;

  const activeStepIndex = frame < t1 ? 0 : frame < t2 ? 1 : 2;
  const stepNames = ['01 / THE PROBLEM', '02 / THE NUMBERS THAT MOVE', '03 / THE ASK'];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: PALETTE.warmPaper,
        color: PALETTE.warmInk,
        fontFamily: FONT_SANS,
        overflow: 'hidden',
      }}
    >
      {/* Subtle archival paper tint vignette */}
      <AbsoluteFill
        style={{
          backgroundImage:
            'radial-gradient(circle at 84% 16%, rgba(29, 111, 138, 0.08) 0%, transparent 45%), radial-gradient(circle at 12% 88%, rgba(29, 111, 138, 0.06) 0%, transparent 42%)',
          pointerEvents: 'none',
        }}
      />

      {/* Editorial folio header */}
      <div
        style={{
          position: 'absolute',
          top: Math.round(52 * u),
          left: Math.round(108 * u),
          right: Math.round(108 * u),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontFamily: FONT_MONO,
          fontSize: Math.round(16 * u),
          color: PALETTE.warmAccent,
          letterSpacing: '0.16em',
        }}
      >
        <span>DOPAIMINT · DEMO-DAY PITCH</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: Math.round(24 * u) }}>
          {stepNames.map((label, idx) => (
            <span
              key={label}
              style={{
                opacity: idx === activeStepIndex ? 1 : 0.36,
                fontWeight: idx === activeStepIndex ? 700 : 500,
              }}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Archival hairline rule */}
      <div
        style={{
          position: 'absolute',
          top: Math.round(94 * u),
          left: Math.round(108 * u),
          right: Math.round(108 * u),
          height: 1.5,
          backgroundColor: 'rgba(14, 20, 30, 0.14)',
          transform: `scaleX(${ruleScaleX})`,
          transformOrigin: 'left center',
        }}
      />

      {/* Board 01: The Problem */}
      <div
        style={{
          position: 'absolute',
          top: Math.round(150 * u),
          left: Math.round(108 * u),
          right: Math.round(108 * u),
          bottom: Math.round(92 * u),
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          opacity: opProblem,
          transform: `translateY(${interpolate(stage2Spring, [0, 1], [0, -24 * u])}px)`,
        }}
      >
        <div
          style={{
            fontFamily: FONT_MONO,
            fontSize: Math.round(18 * u),
            color: PALETTE.warmAccent,
            letterSpacing: '0.14em',
            fontWeight: 600,
          }}
        >
          THE PROBLEM
        </div>
        <div
          style={{
            marginTop: Math.round(22 * u),
            fontSize: Math.round(72 * u),
            fontWeight: 700,
            letterSpacing: '-0.03em',
            lineHeight: 1.07,
            maxWidth: Math.round(1380 * u),
          }}
        >
          Earth hazard feeds and orbital crew training sit on disconnected islands.
        </div>
        <div
          style={{
            marginTop: Math.round(32 * u),
            fontSize: Math.round(30 * u),
            lineHeight: 1.45,
            color: '#465264',
            maxWidth: Math.round(1240 * u),
          }}
        >
          When solar particle surges or wildfire plumes strike at once, dispatchers spend precious minutes hunting spreadsheets instead of acting on one verified signal.
        </div>

        <div
          style={{
            marginTop: Math.round(48 * u),
            display: 'flex',
            gap: Math.round(20 * u),
          }}
        >
          {['VIIRS Thermal Silo', 'DONKI Proton Table', 'Grid Load PDF', 'Offline Crew Manual'].map(
            (chip) => (
              <div
                key={chip}
                style={{
                  padding: `${Math.round(12 * u)}px ${Math.round(20 * u)}px`,
                  borderRadius: Math.round(10 * u),
                  border: '1px solid rgba(14, 20, 30, 0.16)',
                  backgroundColor: '#ece7da',
                  fontFamily: FONT_MONO,
                  fontSize: Math.round(17 * u),
                  color: '#394352',
                }}
              >
                {chip}
              </div>
            ),
          )}
        </div>
      </div>

      {/* Board 02: The Numbers That Move */}
      <div
        style={{
          position: 'absolute',
          top: Math.round(146 * u),
          left: Math.round(108 * u),
          right: Math.round(108 * u),
          bottom: Math.round(88 * u),
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          opacity: opNumbers,
          transform: `translateY(${interpolate(stage2Spring, [0, 1], [32 * u, 0]) - interpolate(stage3Spring, [0, 1], [0, 26 * u])}px)`,
        }}
      >
        <div
          style={{
            fontFamily: FONT_MONO,
            fontSize: Math.round(18 * u),
            color: PALETTE.warmAccent,
            letterSpacing: '0.14em',
            fontWeight: 600,
          }}
        >
          THE NUMBERS THAT MOVE
        </div>
        <div
          style={{
            marginTop: Math.round(14 * u),
            fontSize: Math.round(52 * u),
            fontWeight: 700,
            letterSpacing: '-0.025em',
          }}
        >
          Measured across live NASA endpoints and simulator physics.
        </div>

        <div
          style={{
            marginTop: Math.round(38 * u),
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: Math.round(24 * u),
          }}
        >
          {PITCH_METRICS.map((metric, idx) => {
            const eased = Math.min(1, Math.max(0, countProgress * (1.2 - idx * 0.08)));
            const currentVal = Math.round(metric.target * eased);
            return (
              <div
                key={metric.label}
                style={{
                  backgroundColor: '#ebe6d8',
                  border: '1px solid rgba(29, 111, 138, 0.25)',
                  borderTop: `4px solid ${PALETTE.warmAccent}`,
                  borderRadius: Math.round(14 * u),
                  padding: `${Math.round(28 * u)}px ${Math.round(24 * u)}px`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: Math.round(54 * u),
                      fontWeight: 700,
                      color: PALETTE.warmAccent,
                      letterSpacing: '-0.03em',
                      lineHeight: 1.05,
                    }}
                  >
                    {currentVal}
                    <span style={{ fontSize: Math.round(28 * u), opacity: 0.85 }}>
                      {metric.suffix}
                    </span>
                  </div>
                  <div
                    style={{
                      marginTop: Math.round(16 * u),
                      fontSize: Math.round(24 * u),
                      fontWeight: 700,
                      color: PALETTE.warmInk,
                    }}
                  >
                    {metric.label}
                  </div>
                </div>
                <div
                  style={{
                    marginTop: Math.round(14 * u),
                    fontSize: Math.round(17 * u),
                    lineHeight: 1.4,
                    color: '#465264',
                  }}
                >
                  {metric.detail}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Board 03: The Ask */}
      <div
        style={{
          position: 'absolute',
          top: Math.round(148 * u),
          left: Math.round(108 * u),
          right: Math.round(108 * u),
          bottom: Math.round(88 * u),
          display: 'grid',
          gridTemplateColumns: '1.45fr 0.85fr',
          alignItems: 'center',
          gap: Math.round(48 * u),
          opacity: opAsk,
          transform: `translateY(${interpolate(stage3Spring, [0, 1], [32 * u, 0])}px)`,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: Math.round(18 * u),
              color: PALETTE.warmAccent,
              letterSpacing: '0.14em',
              fontWeight: 600,
            }}
          >
            THE ASK
          </div>
          <div
            style={{
              marginTop: Math.round(18 * u),
              fontSize: Math.round(66 * u),
              fontWeight: 700,
              letterSpacing: '-0.03em',
              lineHeight: 1.08,
            }}
          >
            Run the live triage loop on your browser today.
          </div>
          <div
            style={{
              marginTop: Math.round(26 * u),
              fontSize: Math.round(26 * u),
              lineHeight: 1.48,
              color: '#465264',
              maxWidth: Math.round(920 * u),
            }}
          >
            Pilot DopaiMint + CradleFlow with regional grid teams, STEM cadets, and NASA Space Apps reviewers. Open source, live telemetry, zero barrier to entry.
          </div>

          <div
            style={{
              marginTop: Math.round(38 * u),
              display: 'inline-flex',
              alignItems: 'center',
              gap: Math.round(18 * u),
              padding: `${Math.round(18 * u)}px ${Math.round(28 * u)}px`,
              borderRadius: Math.round(14 * u),
              backgroundColor: PALETTE.warmAccent,
              color: '#ffffff',
              fontFamily: FONT_MONO,
              fontSize: Math.round(20 * u),
              fontWeight: 600,
            }}
          >
            <span>dopaimint-production.up.railway.app</span>
            <span style={{ opacity: 0.78 }}>↗</span>
          </div>
        </div>

        {/* Archival stamped card with plush Bot Avatar + harmonized emblem */}
        <div
          style={{
            backgroundColor: '#ebe6d8',
            border: '1px solid rgba(29, 111, 138, 0.28)',
            borderRadius: Math.round(24 * u),
            padding: Math.round(34 * u),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            transform: `scale(${interpolate(botAskSpring, [0, 1], [0.9, 1])}) translateY(${botFloat}px)`,
          }}
        >
          <Img
            src={resolveAssetUrl('/video-assets/bots/design.png')}
            style={{
              width: Math.round(240 * u),
              height: Math.round(240 * u),
              objectFit: 'contain',
            }}
          />
          <div
            style={{
              marginTop: Math.round(16 * u),
              fontFamily: FONT_MONO,
              fontSize: Math.round(15 * u),
              letterSpacing: '0.12em',
              color: PALETTE.warmAccent,
              fontWeight: 700,
            }}
          >
            NASA SPACE APPS 2026
          </div>
          <div
            style={{
              marginTop: Math.round(6 * u),
              fontSize: Math.round(22 * u),
              fontWeight: 700,
              color: PALETTE.warmInk,
            }}
          >
            DopaiMint x CradleFlow
          </div>
        </div>
      </div>

      {/* Subtle archival bottom folio (never closed captions) */}
      <div
        style={{
          position: 'absolute',
          bottom: Math.round(36 * u),
          left: Math.round(108 * u),
          right: Math.round(108 * u),
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: FONT_MONO,
          fontSize: Math.round(13 * u),
          color: '#6b7280',
          letterSpacing: '0.12em',
        }}
      >
        <span>EARTH + SPACE CORRIDOR INTELLIGENCE</span>
        <span>FOLIO // ARCHIVAL TELEMETRY</span>
      </div>
    </AbsoluteFill>
  );
}
