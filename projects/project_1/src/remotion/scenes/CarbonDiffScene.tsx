import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { FONT_MONO, FONT_SANS, PALETTE } from '../palette';
import {
  AndromedaPanel,
  BotAvatarCell,
  DopaiMintHudBar,
  MdxcnFrame,
  MdxcnRule,
  RemotionAsciiBackdrop,
} from '../primitives';

export interface CarbonDiffSceneProps {
  readonly extended?: boolean;
}

interface DiffLine {
  readonly kind: 'ctx' | 'del' | 'add';
  readonly lineNo: string;
  readonly code: string;
}

const CARBON_DIFF_LINES: readonly DiffLine[] = [
  { kind: 'ctx', lineNo: '41', code: 'export function evaluateCorridorTwin(corridor: CorridorPreset, bundle: NasaTelemetryBundle) {' },
  { kind: 'del', lineNo: '42', code: '-  const rawFires = loadStaticModisCsv(corridor.id);' },
  { kind: 'del', lineNo: '43', code: '-  return { safeAmps: corridor.nominalAmps, shelterSync: null };' },
  { kind: 'add', lineNo: '44', code: '+  const harmonized = clusterHarmonizedFootprints(bundle.modisC61, bundle.viirs375m);' },
  { kind: 'add', lineNo: '45', code: '+  const physics = computeIeee738Physics(corridor, bundle.powerByCorridor[corridor.id]);' },
  { kind: 'add', lineNo: '46', code: '+  const handoff = buildCradleFlowUrl(corridor.id, bundle.spaceWeather.protonFluxPfu, bundle.spaceWeather.kpIndex);' },
  { kind: 'add', lineNo: '47', code: '+  return { harmonized, safeAmps: physics.deratedAmps, ttceMin: physics.ttceMinutes, handoff };' },
  { kind: 'ctx', lineNo: '48', code: '}' },
];

const VERSION_ROWS = [
  {
    ver: 'v0.1 · Baseline',
    tone: 'del' as const,
    title: 'Raw MODIS + VIIRS duplicate thermal counts',
    note: '38% overlapping orbital scan ellipses and static nameplate line ratings.',
  },
  {
    ver: 'v1.4 · Physics Twin',
    tone: 'mid' as const,
    title: 'H3 elliptical deduplication + IEEE 738 derating',
    note: '26-year Burning Calendar paired with live NASA POWER T2M, wind, and TTCE closure.',
  },
  {
    ver: 'v2.4 · Shipped Today',
    tone: 'add' as const,
    title: 'Same-origin DopaiMint → CradleFlow storm shelter handoff',
    note: 'Live GOES-18 proton flux, DONKI CMEs, and 1,064 OSDR bio-assays drive React Flow shields.',
  },
] as const;

export function CarbonDiffScene({ extended = true }: CarbonDiffSceneProps) {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const u = Math.min(width / 1920, height / 1080);

  const headerSpring = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 175, mass: 0.72 },
  });
  const leftSpring = spring({
    frame: Math.max(0, frame - 6),
    fps,
    config: { damping: 16, stiffness: 165, mass: 0.78 },
  });
  const rightSpring = spring({
    frame: Math.max(0, frame - 10),
    fps,
    config: { damping: 16, stiffness: 165, mass: 0.78 },
  });

  const revealCadence = extended ? 14 : 6;
  const activeScanLine = interpolate(
    frame,
    [16, Math.max(36, durationInFrames - 36)],
    [0, CARBON_DIFF_LINES.length - 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  const padX = Math.round(64 * u);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: PALETTE.obsidianBase,
        fontFamily: FONT_SANS,
        color: PALETTE.inkPrimary,
        overflow: 'hidden',
      }}
    >
      <RemotionAsciiBackdrop piece="radar" mode="dark" scrimOpacity={0.66} speed={0.75} />

      <DopaiMintHudBar
        mode="dark"
        activeTab="Telemetry"
        rightLabel="Hackathon Shipping Diff · v0.1 → v2.4"
        scale={u}
      />

      {/* Section Heading matching Andromeda SectionHeading */}
      <div
        style={{
          position: 'absolute',
          top: Math.round(78 * u),
          left: padX,
          right: padX,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: Math.round(24 * u),
          transform: `translateY(${interpolate(headerSpring, [0, 1], [18 * u, 0])}px)`,
          opacity: headerSpring,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: Math.max(10, Math.round(12.5 * u)),
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: PALETTE.cyan,
            }}
          >
            WHAT WE SHIPPED IN 48 HOURS · CARBON DIFF MODEL
          </div>
          <h2
            style={{
              margin: `${Math.round(6 * u)}px 0 0 0`,
              fontSize: Math.round(40 * u),
              fontWeight: 600,
              letterSpacing: '-0.025em',
              lineHeight: 1.1,
              color: PALETTE.inkPrimary,
            }}
          >
            From siloed fire CSVs to a unified Earth-to-Orbit physics engine
          </h2>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: Math.round(10 * u),
            fontFamily: FONT_MONO,
            fontSize: Math.max(10, Math.round(12.5 * u)),
          }}
        >
          <span
            style={{
              padding: `${Math.round(6 * u)}px ${Math.round(12 * u)}px`,
              borderRadius: 4,
              border: '1px solid rgba(238, 107, 71, 0.42)',
              backgroundColor: 'rgba(238, 107, 71, 0.1)',
              color: PALETTE.coral,
            }}
          >
            -2 legacy stubs
          </span>
          <span
            style={{
              padding: `${Math.round(6 * u)}px ${Math.round(12 * u)}px`,
              borderRadius: 4,
              border: '1px solid rgba(52, 211, 153, 0.45)',
              backgroundColor: 'rgba(52, 211, 153, 0.12)',
              color: PALETTE.scannerBright,
            }}
          >
            +4 live NASA physics stages
          </span>
        </div>
      </div>

      {/* Main Split: Left mdxcn Version Progression + Right Carbon Code Window */}
      <div
        style={{
          position: 'absolute',
          top: Math.round(184 * u),
          left: padX,
          right: padX,
          bottom: Math.round(42 * u),
          display: 'grid',
          gridTemplateColumns: '0.94fr 1.36fr',
          gap: Math.round(28 * u),
          alignItems: 'stretch',
        }}
      >
        {/* Left: Versions Diff in official mdxcn dashed frame */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            transform: `translateY(${interpolate(leftSpring, [0, 1], [24 * u, 0])}px)`,
            opacity: leftSpring,
          }}
        >
          <MdxcnFrame
            title="HACKATHON VERSION PROGRESSION"
            mode="dark"
            scale={u}
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            bodyStyle={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: `${Math.round(24 * u)}px ${Math.round(22 * u)}px`,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: Math.round(14 * u) }}>
              {VERSION_ROWS.map((row, idx) => {
                const rSpring = spring({
                  frame: Math.max(0, frame - (10 + idx * (extended ? 16 : 8))),
                  fps,
                  config: { damping: 16, stiffness: 175, mass: 0.75 },
                });
                const borderCol =
                  row.tone === 'add'
                    ? 'rgba(52, 211, 153, 0.45)'
                    : row.tone === 'mid'
                      ? 'rgba(69, 184, 214, 0.38)'
                      : 'rgba(238, 107, 71, 0.36)';
                const badgeCol =
                  row.tone === 'add'
                    ? PALETTE.scannerBright
                    : row.tone === 'mid'
                      ? PALETTE.cyan
                      : PALETTE.coral;

                return (
                  <div
                    key={row.ver}
                    style={{
                      padding: `${Math.round(14 * u)}px ${Math.round(16 * u)}px`,
                      borderRadius: 4,
                      border: `1px solid ${borderCol}`,
                      backgroundColor: 'rgba(16, 22, 34, 0.88)',
                      transform: `translateX(${interpolate(rSpring, [0, 1], [-16 * u, 0])}px)`,
                      opacity: rSpring,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: Math.max(10, Math.round(11.5 * u)),
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: badgeCol,
                        fontWeight: 600,
                      }}
                    >
                      {row.ver}
                    </div>
                    <div
                      style={{
                        marginTop: Math.round(5 * u),
                        fontFamily: FONT_SANS,
                        fontSize: Math.round(18 * u),
                        fontWeight: 600,
                        color: PALETTE.inkPrimary,
                      }}
                    >
                      {row.title}
                    </div>
                    <div
                      style={{
                        marginTop: Math.round(4 * u),
                        fontFamily: FONT_SANS,
                        fontSize: Math.round(13.5 * u),
                        lineHeight: 1.4,
                        color: PALETTE.inkMuted,
                      }}
                    >
                      {row.note}
                    </div>
                  </div>
                );
              })}
            </div>

            <div>
              <MdxcnRule mode="dark" style={{ marginBottom: Math.round(14 * u) }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: Math.round(14 * u) }}>
                <BotAvatarCell
                  botFile="review.png"
                  roleLabel="QA Gate"
                  statusLabel="PASS"
                  size={Math.round(68 * u)}
                  phaseOffset={0.8}
                  style={{ padding: Math.round(8 * u), flexShrink: 0 }}
                />
                <div style={{ fontFamily: FONT_SANS, fontSize: Math.round(14 * u), lineHeight: 1.45, color: PALETTE.inkSecondary }}>
                  Verified against 8 keyless public endpoints with deterministic snapshot fallback and zero login gates.
                </div>
              </div>
            </div>
          </MdxcnFrame>
        </div>

        {/* Right: Carbon Code Diff Window inside AndromedaPanel */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            transform: `translateY(${interpolate(rightSpring, [0, 1], [24 * u, 0])}px)`,
            opacity: rightSpring,
          }}
        >
          <AndromedaPanel
            mode="dark"
            markerSize={Math.round(16 * u)}
            markerColor={PALETTE.cyan}
            style={{
              height: '100%',
              backgroundColor: '#0b101b',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Carbon Minimal Terminal Header */}
            <div
              style={{
                height: Math.round(48 * u),
                padding: `0 ${Math.round(20 * u)}px`,
                backgroundColor: '#101622',
                borderBottom: '1px solid rgba(241, 237, 228, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontFamily: FONT_MONO,
                fontSize: Math.max(10, Math.round(12.5 * u)),
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: Math.round(8 * u) }}>
                <span style={{ width: Math.round(10 * u), height: Math.round(10 * u), borderRadius: '50%', backgroundColor: PALETTE.coral }} />
                <span style={{ width: Math.round(10 * u), height: Math.round(10 * u), borderRadius: '50%', backgroundColor: '#eab308' }} />
                <span style={{ width: Math.round(10 * u), height: Math.round(10 * u), borderRadius: '50%', backgroundColor: PALETTE.scannerGreen }} />
                <span style={{ marginLeft: Math.round(10 * u), color: PALETTE.inkPrimary, fontWeight: 600 }}>
                  src/data/nasaLiveClient.ts
                </span>
                <span style={{ color: PALETTE.inkMuted }}>· unified diff</span>
              </div>
              <span style={{ color: PALETTE.cyan }}>tsc -b · 0 errors</span>
            </div>

            {/* Code Diff Body */}
            <div
              style={{
                flex: 1,
                padding: `${Math.round(22 * u)}px ${Math.round(20 * u)}px`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: Math.round(9 * u),
                fontFamily: FONT_MONO,
                fontSize: Math.max(11, Math.round(15.5 * u)),
                lineHeight: 1.45,
              }}
            >
              {CARBON_DIFF_LINES.map((line, index) => {
                const lSpring = spring({
                  frame: Math.max(0, frame - (12 + index * revealCadence)),
                  fps,
                  config: { damping: 18, stiffness: 190, mass: 0.7 },
                });
                const proximity = Math.max(0, 1 - Math.abs(activeScanLine - index));
                const rowBg =
                  line.kind === 'add'
                    ? `rgba(52, 211, 153, ${0.08 + proximity * 0.1})`
                    : line.kind === 'del'
                      ? 'rgba(238, 107, 71, 0.1)'
                      : 'rgba(16, 22, 34, 0.45)';
                const barColor =
                  line.kind === 'add'
                    ? PALETTE.scannerBright
                    : line.kind === 'del'
                      ? PALETTE.coral
                      : 'rgba(148, 163, 184, 0.2)';
                const codeColor =
                  line.kind === 'add'
                    ? '#c6ffe0'
                    : line.kind === 'del'
                      ? '#ffc1b2'
                      : PALETTE.inkSecondary;

                return (
                  <div
                    key={line.lineNo}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: Math.round(14 * u),
                      padding: `${Math.round(9 * u)}px ${Math.round(14 * u)}px`,
                      borderRadius: 4,
                      backgroundColor: rowBg,
                      borderLeft: `3px solid ${barColor}`,
                      transform: `translateX(${interpolate(lSpring, [0, 1], [20 * u, 0])}px)`,
                      opacity: lSpring,
                      overflow: 'hidden',
                    }}
                  >
                    <span
                      style={{
                        width: Math.round(26 * u),
                        flexShrink: 0,
                        color: PALETTE.inkMuted,
                        fontSize: Math.max(10, Math.round(12.5 * u)),
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {line.lineNo}
                    </span>
                    <span
                      style={{
                        color: codeColor,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {line.code}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Footer status strip inside Carbon window */}
            <div
              style={{
                padding: `${Math.round(12 * u)}px ${Math.round(20 * u)}px`,
                backgroundColor: '#101622',
                borderTop: '1px solid rgba(241, 237, 228, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontFamily: FONT_MONO,
                fontSize: Math.max(10, Math.round(12 * u)),
                color: PALETTE.inkMuted,
              }}
            >
              <span>FIRMS MODIS C6.1 + VIIRS 375m + NASA POWER + GOES-18 + OSDR</span>
              <span style={{ color: PALETTE.scannerGreen }}>SAME-ORIGIN /CRADLEFLOW/ READY</span>
            </div>
          </AndromedaPanel>
        </div>
      </div>
    </AbsoluteFill>
  );
}
