import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { FONT_MONO, FONT_SANS, PALETTE, resolveAssetUrl } from '../palette';

export interface CarbonDiffSceneProps {
  readonly extended?: boolean;
}

interface DiffLine {
  readonly kind: 'ctx' | 'del' | 'add';
  readonly code: string;
}

const CODE_DIFF_LINES: readonly DiffLine[] = [
  { kind: 'ctx', code: 'export function dispatchCorridor(pass: CorridorPass) {' },
  { kind: 'del', code: '- return openStaticFallbackTab("cradleflow");' },
  { kind: 'add', code: '+ const plume = fuseEllipticPlumes(pass.viirs, pass.modis);' },
  { kind: 'add', code: '+ const limitA = derateIeee738(pass.tempC, pass.windMs);' },
  { kind: 'add', code: '+ const handoff = buildCradleUrl(pass.id, pass.fluxPfu, pass.kp);' },
  { kind: 'add', code: '+ return mountShelterTwin(plume, limitA, handoff);' },
  { kind: 'ctx', code: '}' },
];

interface FeatureStep {
  readonly step: string;
  readonly title: string;
  readonly detail: string;
  readonly image: string;
  readonly accent: string;
}

const FEATURE_STEPS: readonly FeatureStep[] = [
  {
    step: 'STEP 01',
    title: 'Orbital Corridor Fusion',
    detail: 'VIIRS + MODIS fire ellipse · IEEE 738 line load',
    image: '/video-assets/screens/overview-hero.jpg',
    accent: PALETTE.cyan,
  },
  {
    step: 'STEP 02',
    title: 'Triage & Telemetry',
    detail: 'Real NASA DONKI + OSDR triage loop',
    image: '/video-assets/screens/triage-game.jpg',
    accent: PALETTE.sky,
  },
  {
    step: 'STEP 03',
    title: 'CradleFlow Habitat',
    detail: 'Live proton & Kp handoff seals Grade S shelter',
    image: '/video-assets/screens/cradleflow-unified.jpg',
    accent: PALETTE.scannerBright,
  },
];

/**
 * Carbon-model hackathon narrative:
 * 1. Headline: What we are shipping on NASA Space Apps 2026
 * 2. Versions diff (v1 Single-Feed Silos -> v2 DopaiMint x CradleFlow)
 * 3. Animated unified code diff with Carbon glass chrome
 * 4. Step-by-step live feature highlight cards
 */
export function CarbonDiffScene({ extended = true }: CarbonDiffSceneProps) {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const u = Math.min(width / 1920, height / 1080);

  // Beat timings adapt cleanly between 100f compact (28.5s demo) and 175f extended (1080p film)
  const diffSplitEnd = extended ? 92 : 52;
  const phase2Progress = spring({
    frame: Math.max(0, frame - diffSplitEnd),
    fps,
    config: { damping: 17, stiffness: 150, mass: 0.8 },
  });

  // Top bar entrance
  const headerSpring = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 170, mass: 0.7 },
  });
  const headerY = interpolate(headerSpring, [0, 1], [-18 * u, 0]);
  const headerOpacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: 'clamp' });

  // Card container entrance
  const windowSpring = spring({
    frame: Math.max(0, frame - 4),
    fps,
    config: { damping: 16, stiffness: 155, mass: 0.8 },
  });
  const windowScale = interpolate(windowSpring, [0, 1], [0.94, 1]);

  // Subtle background sweep indicator
  const lineCursor = interpolate(
    frame,
    [10, diffSplitEnd - 6],
    [0, CODE_DIFF_LINES.length - 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  // Determine whether beat 1 (Headline + Versions + Code Diff) or beat 2 (Step-by-Step Features) dominates
  const showCodeCardOpacity = interpolate(
    phase2Progress,
    [0, 0.36],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  const showFeatureStepsOpacity = interpolate(
    phase2Progress,
    [0.34, 0.72],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  const exitFade = interpolate(
    frame,
    [durationInFrames - 8, durationInFrames],
    [1, 0.9],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: PALETTE.obsidianBase,
        overflow: 'hidden',
        opacity: exitFade,
        fontFamily: FONT_SANS,
        color: PALETTE.inkPrimary,
      }}
    >
      {/* Subtle architectural blueprint background glow */}
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(circle at 20% 20%, rgba(69,184,214,0.12) 0%, transparent 48%), radial-gradient(circle at 82% 76%, rgba(93,255,154,0.08) 0%, transparent 50%)`,
          pointerEvents: 'none',
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(rgba(69,184,214,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(69,184,214,0.045) 1px, transparent 1px)`,
          backgroundSize: `${Math.round(52 * u)}px ${Math.round(52 * u)}px`,
          pointerEvents: 'none',
        }}
      />

      {/* Top hackathon header & version delta */}
      <div
        style={{
          position: 'absolute',
          top: Math.round(44 * u),
          left: Math.round(80 * u),
          right: Math.round(80 * u),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: Math.round(24 * u),
          transform: `translateY(${headerY}px)`,
          opacity: headerOpacity,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: Math.round(17 * u),
              letterSpacing: '0.16em',
              color: PALETTE.cyan,
              textTransform: 'uppercase',
            }}
          >
            HACKATHON SHIPPING LOG // CARBON DIFF MODEL
          </div>
          <div
            style={{
              marginTop: Math.round(8 * u),
              fontSize: Math.round(44 * u),
              fontWeight: 700,
              letterSpacing: '-0.025em',
              lineHeight: 1.08,
            }}
          >
            8 NASA Feeds into 1 Live Habitat Loop
          </div>
        </div>

        {/* Version pill comparison */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: Math.round(12 * u),
            fontFamily: FONT_MONO,
            fontSize: Math.round(16 * u),
          }}
        >
          <span
            style={{
              padding: `${Math.round(9 * u)}px ${Math.round(16 * u)}px`,
              borderRadius: Math.round(999 * u),
              border: `1px dashed rgba(238, 107, 71, 0.5)`,
              backgroundColor: 'rgba(238, 107, 71, 0.1)',
              color: PALETTE.coral,
            }}
          >
            v1.0 Siloed Feeds
          </span>
          <span style={{ color: PALETTE.inkMuted }}>→</span>
          <span
            style={{
              padding: `${Math.round(9 * u)}px ${Math.round(16 * u)}px`,
              borderRadius: Math.round(999 * u),
              border: `1px dashed rgba(93, 255, 154, 0.55)`,
              backgroundColor: 'rgba(93, 255, 154, 0.1)',
              color: PALETTE.scannerBright,
              fontWeight: 600,
            }}
          >
            v2.4 Unified Handoff
          </span>
        </div>
      </div>

      {/* Stage Layer A: Version Architecture Diff + Carbon Code Diff Window */}
      <div
        style={{
          position: 'absolute',
          top: Math.round(186 * u),
          left: Math.round(80 * u),
          right: Math.round(80 * u),
          bottom: Math.round(64 * u),
          display: 'grid',
          gridTemplateColumns: '1fr 1.65fr',
          gap: Math.round(28 * u),
          opacity: showCodeCardOpacity,
          transform: `scale(${windowScale}) translateY(${interpolate(phase2Progress, [0, 1], [0, -24 * u])}px)`,
          pointerEvents: 'none',
        }}
      >
        {/* Left panel: Version Architecture Diff */}
        <div
          style={{
            backgroundColor: 'rgba(16, 22, 34, 0.94)',
            border: `1.5px dashed ${PALETTE.obsidianBorder}`,
            borderRadius: Math.round(20 * u),
            padding: Math.round(28 * u),
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: `0 ${Math.round(24 * u)}px ${Math.round(60 * u)}px rgba(2, 6, 16, 0.65)`,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: FONT_MONO,
                fontSize: Math.round(15 * u),
                color: PALETTE.inkMuted,
                letterSpacing: '0.14em',
              }}
            >
              VERSIONS WE DIFF
            </div>
            <div
              style={{
                marginTop: Math.round(20 * u),
                padding: Math.round(18 * u),
                borderRadius: Math.round(14 * u),
                backgroundColor: 'rgba(238, 107, 71, 0.08)',
                border: '1px solid rgba(238, 107, 71, 0.35)',
              }}
            >
              <div style={{ fontFamily: FONT_MONO, fontSize: Math.round(14 * u), color: PALETTE.coral }}>
                - BEFORE // DISCONNECTED
              </div>
              <div style={{ marginTop: Math.round(8 * u), fontSize: Math.round(22 * u), fontWeight: 600 }}>
                Manual CSV + Mismatched UI
              </div>
              <div style={{ marginTop: Math.round(6 * u), fontSize: Math.round(17 * u), color: PALETTE.inkSecondary }}>
                Static proton defaults and blind grid loading.
              </div>
            </div>

            <div
              style={{
                marginTop: Math.round(18 * u),
                padding: Math.round(18 * u),
                borderRadius: Math.round(14 * u),
                backgroundColor: 'rgba(69, 184, 214, 0.1)',
                border: `1px solid ${PALETTE.cyan}`,
              }}
            >
              <div style={{ fontFamily: FONT_MONO, fontSize: Math.round(14 * u), color: PALETTE.scannerBright }}>
                + SHIPPING // DOPAIMINT x CRADLEFLOW
              </div>
              <div style={{ marginTop: Math.round(8 * u), fontSize: Math.round(22 * u), fontWeight: 600 }}>
                Closed-Loop NASA Engine
              </div>
              <div style={{ marginTop: Math.round(6 * u), fontSize: Math.round(17 * u), color: PALETTE.inkSecondary }}>
                Live DONKI flux &amp; Kp auto-seeds orbital shelter survival.
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: Math.round(14 * u),
              paddingTop: Math.round(16 * u),
              borderTop: '1px dashed rgba(148, 163, 184, 0.25)',
            }}
          >
            <Img
              src={resolveAssetUrl('/video-assets/bots/tools.png')}
              style={{ width: Math.round(52 * u), height: Math.round(52 * u), objectFit: 'contain' }}
            />
            <div style={{ fontFamily: FONT_MONO, fontSize: Math.round(15 * u), color: PALETTE.inkSecondary }}>
              100% deterministic · zero external runtime keys
            </div>
          </div>
        </div>

        {/* Right panel: Carbon Window Code Diff */}
        <div
          style={{
            backgroundColor: '#0c121e',
            border: `1.5px solid rgba(69, 184, 214, 0.42)`,
            borderRadius: Math.round(20 * u),
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: `0 ${Math.round(30 * u)}px ${Math.round(80 * u)}px rgba(2, 6, 16, 0.78), 0 0 ${Math.round(36 * u)}px rgba(69, 184, 214, 0.12)`,
          }}
        >
          {/* Carbon title chrome */}
          <div
            style={{
              height: Math.round(54 * u),
              padding: `0 ${Math.round(24 * u)}px`,
              backgroundColor: 'rgba(16, 22, 34, 0.98)',
              borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: Math.round(10 * u) }}>
              <span style={{ width: Math.round(13 * u), height: Math.round(13 * u), borderRadius: '50%', backgroundColor: PALETTE.coral }} />
              <span style={{ width: Math.round(13 * u), height: Math.round(13 * u), borderRadius: '50%', backgroundColor: '#f59e0b' }} />
              <span style={{ width: Math.round(13 * u), height: Math.round(13 * u), borderRadius: '50%', backgroundColor: PALETTE.scannerBright }} />
              <span
                style={{
                  marginLeft: Math.round(14 * u),
                  fontFamily: FONT_MONO,
                  fontSize: Math.round(16 * u),
                  color: PALETTE.inkSecondary,
                }}
              >
                src/engine/corridorHandoff.ts
              </span>
            </div>
            <span
              style={{
                fontFamily: FONT_MONO,
                fontSize: Math.round(14 * u),
                color: PALETTE.scannerBright,
              }}
            >
              +4 / -1 DIFF
            </span>
          </div>

          {/* Code lines */}
          <div
            style={{
              flex: 1,
              padding: `${Math.round(26 * u)}px ${Math.round(24 * u)}px`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: Math.round(11 * u),
              fontFamily: FONT_MONO,
              fontSize: Math.round(20 * u),
              lineHeight: 1.45,
            }}
          >
            {CODE_DIFF_LINES.map((line, index) => {
              const lineReveal = spring({
                frame: Math.max(0, frame - (8 + index * 5)),
                fps,
                config: { damping: 18, stiffness: 200, mass: 0.7 },
              });
              const activeGlow = Math.max(0, 1 - Math.abs(lineCursor - index));
              const bg =
                line.kind === 'add'
                  ? `rgba(93, 255, 154, ${0.09 + activeGlow * 0.14})`
                  : line.kind === 'del'
                    ? 'rgba(238, 107, 71, 0.12)'
                    : 'transparent';
              const textColor =
                line.kind === 'add'
                  ? '#b8ffd6'
                  : line.kind === 'del'
                    ? '#ffb4a1'
                    : PALETTE.inkSecondary;

              return (
                <div
                  key={line.code}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: Math.round(16 * u),
                    padding: `${Math.round(8 * u)}px ${Math.round(14 * u)}px`,
                    borderRadius: Math.round(8 * u),
                    backgroundColor: bg,
                    borderLeft:
                      line.kind === 'add'
                        ? `3px solid ${PALETTE.scannerBright}`
                        : line.kind === 'del'
                          ? `3px solid ${PALETTE.coral}`
                          : '3px solid transparent',
                    opacity: interpolate(lineReveal, [0, 1], [0, 1]),
                    transform: `translateX(${interpolate(lineReveal, [0, 1], [18 * u, 0])}px)`,
                    color: textColor,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                  }}
                >
                  <span style={{ color: PALETTE.inkMuted, fontSize: Math.round(14 * u), width: Math.round(24 * u) }}>
                    {index + 1}
                  </span>
                  <span>{line.code}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stage Layer B: Step-by-Step Feature Highlight Strip */}
      <div
        style={{
          position: 'absolute',
          top: Math.round(186 * u),
          left: Math.round(80 * u),
          right: Math.round(80 * u),
          bottom: Math.round(64 * u),
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: Math.round(26 * u),
          opacity: showFeatureStepsOpacity,
          transform: `translateY(${interpolate(showFeatureStepsOpacity, [0, 1], [28 * u, 0])}px)`,
          pointerEvents: 'none',
        }}
      >
        {FEATURE_STEPS.map((feat, idx) => {
          const cardPop = spring({
            frame: Math.max(0, frame - (diffSplitEnd + idx * 8)),
            fps,
            config: { damping: 16, stiffness: 180, mass: 0.72 },
          });
          const scale = interpolate(cardPop, [0, 1], [0.92, 1]);
          const highlightActive =
            frame >= diffSplitEnd + 16 + idx * (extended ? 22 : 10) &&
            frame < diffSplitEnd + 16 + (idx + 1) * (extended ? 22 : 10);

          return (
            <div
              key={feat.step}
              style={{
                backgroundColor: PALETTE.obsidianCard,
                border: `${highlightActive ? 2 : 1.5}px dashed ${highlightActive ? feat.accent : 'rgba(148, 163, 184, 0.32)'}`,
                borderRadius: Math.round(20 * u),
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transform: `scale(${scale})`,
                boxShadow: highlightActive
                  ? `0 0 ${Math.round(36 * u)}px ${feat.accent}33, 0 ${Math.round(24 * u)}px ${Math.round(52 * u)}px rgba(0,0,0,0.65)`
                  : `0 ${Math.round(18 * u)}px ${Math.round(44 * u)}px rgba(0,0,0,0.5)`,
              }}
            >
              <div
                style={{
                  padding: `${Math.round(12 * u)}px ${Math.round(18 * u)}px`,
                  backgroundColor: 'rgba(11, 16, 27, 0.96)',
                  borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: Math.round(14 * u),
                    fontWeight: 700,
                    color: feat.accent,
                    letterSpacing: '0.1em',
                  }}
                >
                  {feat.step}
                </span>
                <span
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: Math.round(12 * u),
                    color: PALETTE.inkMuted,
                  }}
                >
                  LIVE VIEW
                </span>
              </div>
              <div style={{ position: 'relative', flex: 1, overflow: 'hidden', backgroundColor: '#05080f' }}>
                <Img
                  src={resolveAssetUrl(feat.image)}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center top',
                  }}
                />
              </div>

              <div style={{ padding: `${Math.round(20 * u)}px ${Math.round(22 * u)}px` }}>
                <div style={{ fontSize: Math.round(24 * u), fontWeight: 700, color: PALETTE.inkPrimary }}>
                  {feat.title}
                </div>
                <div
                  style={{
                    marginTop: Math.round(6 * u),
                    fontFamily: FONT_MONO,
                    fontSize: Math.round(15 * u),
                    color: PALETTE.inkSecondary,
                    lineHeight: 1.35,
                  }}
                >
                  {feat.detail}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}
