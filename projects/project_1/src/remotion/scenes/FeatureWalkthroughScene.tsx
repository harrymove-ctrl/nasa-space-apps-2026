import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { CursorTrack, type CursorWaypoint } from '@/components/snap-cn/cursor-track';
import { ScreenRecording, type CameraMove } from '@/components/snap-cn/screen-recording';
import { FONT_MONO, FONT_SANS, PALETTE } from '../palette';
import {
  AndromedaPanel,
  DopaiMintHudBar,
  MdxcnFrame,
  RemotionAsciiBackdrop,
} from '../primitives';

export interface FeatureWalkthroughSceneProps {
  readonly compact?: boolean;
}

interface WalkthroughStepSpec {
  readonly badge: string;
  readonly title: string;
  readonly subtitle: string;
  readonly metricLabel: string;
  readonly metricValue: string;
  readonly src: string;
  readonly camera: CameraMove[];
  readonly cursor: CursorWaypoint[];
  readonly calloutSide: 'left' | 'right';
}

function buildSteps(compact: boolean): WalkthroughStepSpec[] {
  if (compact) {
    // 3 crisp 90-frame (3.0s each = 9.0s total) recorded live product steps for the 28.50s NASA cut
    return [
      {
        badge: 'STEP 01 // OBSERVATORY & BURNING CALENDAR',
        title: 'Inspect live IEEE 738 line limits and 26-year H3 fire deduplication',
        subtitle: 'MODIS C6.1 + VIIRS 375 m merged with NASA POWER wind & ambient derating',
        metricLabel: 'SAFE AMPACITY',
        metricValue: '425 A · 65 min TTCE',
        src: '/video-assets/screens/step-2-calendar.jpg',
        camera: [
          { at: 14, duration: 24, zoom: 1.44, x: 0.48, y: 0.36 },
          { at: 64, duration: 20, zoom: 1.05, x: 0.5, y: 0.5 },
        ],
        cursor: [
          { at: 0, x: 0.18, y: 0.72, duration: 6 },
          { at: 8, x: 0.56, y: 0.32, duration: 18, click: true },
          { at: 42, x: 0.38, y: 0.62, duration: 18, click: true },
        ],
        calloutSide: 'right',
      },
      {
        badge: 'STEP 02 // 5-LAYER ORBITAL PROVENANCE MAP',
        title: 'Verify every corridor hazard against its live NASA & NOAA endpoint',
        subtitle: 'Interactive FIRMS, EONET v3, GIBS WMTS, GOES-18, and OSDR citation graph',
        metricLabel: 'LIVE FEEDS',
        metricValue: '8 / 8 Keyless APIs',
        src: '/video-assets/screens/step-3-map.jpg',
        camera: [
          { at: 14, duration: 24, zoom: 1.48, x: 0.54, y: 0.48 },
          { at: 64, duration: 20, zoom: 1.05, x: 0.5, y: 0.5 },
        ],
        cursor: [
          { at: 0, x: 0.78, y: 0.24, duration: 6 },
          { at: 8, x: 0.48, y: 0.48, duration: 18, click: true },
          { at: 44, x: 0.68, y: 0.56, duration: 18, click: true },
        ],
        calloutSide: 'left',
      },
      {
        badge: 'STEP 03 // PHASE 01 TRIAGE → CRADLEFLOW SHELTER',
        title: 'Hand off solar proton flux directly into React Flow habitat automation',
        subtitle: 'Same-origin CradleFlow canvas seals storm shields below the 12 mSv crew cap',
        metricLabel: 'HABITAT GRADE',
        metricValue: 'SCORE 100 (S)',
        src: '/video-assets/screens/step-5-cradleflow.jpg',
        camera: [
          { at: 14, duration: 24, zoom: 1.52, x: 0.52, y: 0.58 },
          { at: 66, duration: 20, zoom: 1.04, x: 0.5, y: 0.5 },
        ],
        cursor: [
          { at: 0, x: 0.28, y: 0.34, duration: 6 },
          { at: 8, x: 0.43, y: 0.43, duration: 16, click: true },
          { at: 40, x: 0.54, y: 0.68, duration: 18, click: true },
        ],
        calloutSide: 'left',
      },
    ];
  }

  // 4 unhurried ~172-frame (5.75s each = 23.0s total) recorded live walkthrough steps for the Full Product Demo
  return [
    {
      badge: 'STEP 01 // LIVE CORRIDOR OBSERVATORY',
      title: 'Zero-login orbital fire & solar risk readout on page load',
      subtitle: 'Pairs Butte 230 kV IEEE 738 conductor limits with GOES-18 X-ray & proton telemetry',
      metricLabel: 'BUTTE 230 KV',
      metricValue: '425 A Safe · Kp 0.67',
      src: '/video-assets/screens/step-1-observatory.jpg',
      camera: [
        { at: 22, duration: 28, zoom: 1.52, x: 0.34, y: 0.52 },
        { at: 92, duration: 28, zoom: 1.46, x: 0.66, y: 0.54 },
        { at: 142, duration: 24, zoom: 1.02, x: 0.5, y: 0.5 },
      ],
      cursor: [
        { at: 0, x: 0.14, y: 0.82, duration: 8 },
        { at: 12, x: 0.34, y: 0.52, duration: 22, click: true },
        { at: 78, x: 0.72, y: 0.62, duration: 24, click: true },
        { at: 132, x: 0.46, y: 0.3, duration: 20, click: true },
      ],
      calloutSide: 'right',
    },
    {
      badge: 'STEP 02 // 26-YEAR BURNING CALENDAR & IEEE 738',
      title: 'Elliptical H3 deduplication across MODIS C6.1 and VIIRS 375 m',
      subtitle: 'Eliminates 38% duplicate multi-satellite fire counts and computes TTCE closure minutes',
      metricLabel: 'ARCHIVE SPAN',
      metricValue: '2000–2026 Harmonized',
      src: '/video-assets/screens/step-2-calendar.jpg',
      camera: [
        { at: 22, duration: 28, zoom: 1.48, x: 0.5, y: 0.34 },
        { at: 92, duration: 28, zoom: 1.5, x: 0.46, y: 0.68 },
        { at: 142, duration: 24, zoom: 1.02, x: 0.5, y: 0.5 },
      ],
      cursor: [
        { at: 0, x: 0.82, y: 0.22, duration: 8 },
        { at: 12, x: 0.58, y: 0.32, duration: 22, click: true },
        { at: 78, x: 0.44, y: 0.68, duration: 24, click: true },
      ],
      calloutSide: 'right',
    },
    {
      badge: 'STEP 03 // ASK THE GRID & 5-LAYER PROVENANCE MAP',
      title: 'Every corridor claim traced to its exact NASA sensor record',
      subtitle: 'Inspect live FIRMS hotspots, EONET v3 events, GIBS rasters, and Sentinel-1 SAR',
      metricLabel: 'PROVENANCE',
      metricValue: '5 Verified Sensor Layers',
      src: '/video-assets/screens/step-3-map.jpg',
      camera: [
        { at: 22, duration: 28, zoom: 1.52, x: 0.52, y: 0.48 },
        { at: 96, duration: 26, zoom: 1.42, x: 0.72, y: 0.46 },
        { at: 142, duration: 24, zoom: 1.02, x: 0.5, y: 0.5 },
      ],
      cursor: [
        { at: 0, x: 0.2, y: 0.36, duration: 8 },
        { at: 12, x: 0.48, y: 0.48, duration: 22, click: true },
        { at: 82, x: 0.74, y: 0.44, duration: 22, click: true },
      ],
      calloutSide: 'left',
    },
    {
      badge: 'STEP 04 // PHASE 01 TRIAGE → PHASE 02 CRADLEFLOW',
      title: 'One-click handoff into React Flow lunar & Mars storm automation',
      subtitle: 'Wires DONKI proton flux + OSDR-340 bio-monitors to seal habitat water-wall shields',
      metricLabel: 'CREW DOSE',
      metricValue: '0.00 / 12 mSv · Grade S',
      src: '/video-assets/screens/step-5-cradleflow.jpg',
      camera: [
        { at: 20, duration: 28, zoom: 1.5, x: 0.44, y: 0.36 },
        { at: 88, duration: 28, zoom: 1.56, x: 0.56, y: 0.66 },
        { at: 144, duration: 24, zoom: 1.02, x: 0.5, y: 0.5 },
      ],
      cursor: [
        { at: 0, x: 0.26, y: 0.28, duration: 8 },
        { at: 12, x: 0.43, y: 0.43, duration: 20, click: true },
        { at: 74, x: 0.52, y: 0.68, duration: 24, click: true },
        { at: 124, x: 0.72, y: 0.62, duration: 20, click: true },
      ],
      calloutSide: 'left',
    },
  ];
}

function SingleWalkthroughBeat({
  spec,
  stepIndex,
  totalSteps,
}: {
  readonly spec: WalkthroughStepSpec;
  readonly stepIndex: number;
  readonly totalSteps: number;
}) {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const u = Math.min(width / 1920, height / 1080);

  const cardEnter = spring({
    frame: Math.max(0, frame - 6),
    fps,
    config: { damping: 16, stiffness: 175, mass: 0.75 },
  });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 8, durationInFrames],
    [1, 0.92],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  const padX = Math.round(56 * u);
  const topY = Math.round(74 * u);
  const bottomY = Math.round(32 * u);
  const availW = width - padX * 2;
  const availH = height - topY - bottomY;
  // Lock exact 16:9 stage box so neither 1080x700 nor 1920x1080 clips step UI edges at zoom 1
  const stageW = Math.min(availW, Math.round((availH * 16) / 9));
  const stageH = Math.round((stageW * 9) / 16);
  const stageLeft = Math.round((width - stageW) / 2);
  const stageTop = Math.round(topY + (availH - stageH) / 2);

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <RemotionAsciiBackdrop piece="earth" mode="dark" scrimOpacity={0.68} speed={0.7} />

      <DopaiMintHudBar
        mode="dark"
        activeTab={stepIndex === 2 ? 'Map' : stepIndex === 3 ? 'Trainer' : 'Demo'}
        rightLabel={`Live Walkthrough · Step ${stepIndex + 1} of ${totalSteps}`}
        scale={u}
      />

      {/* Exact 16:9 Browser Stage Frame holding @snapcn/screen-recording + @snapcn/cursor-track */}
      <div
        style={{
          position: 'absolute',
          top: stageTop,
          left: stageLeft,
          width: stageW,
          height: stageH,
        }}
      >
        <AndromedaPanel
          mode="dark"
          markerSize={Math.round(18 * u)}
          markerColor={PALETTE.cyan}
          style={{
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            backgroundColor: '#070a12',
          }}
        >
          <CursorTrack
            path={spec.cursor}
            color="#f3efe6"
            outlineColor="#090c14"
            ringColor={PALETTE.cyan}
            mode="dark"
          >
            <ScreenRecording
              src={spec.src}
              sourceAspect={16 / 9}
              fit="contain"
              backdropColor="#090c14"
              camera={spec.camera}
              entrance="none"
              mode="dark"
            />
          </CursorTrack>

          {/* Crisp 2-line mdxcn telemetry callout overlay anchored away from zoomed focal target */}
          <div
            style={{
              position: 'absolute',
              bottom: Math.round(24 * u),
              ...(spec.calloutSide === 'right'
                ? { right: Math.round(26 * u) }
                : { left: Math.round(26 * u) }),
              width: Math.round(620 * u),
              zIndex: 15,
              transform: `translateY(${interpolate(cardEnter, [0, 1], [24 * u, 0])}px)`,
              opacity: cardEnter,
              boxShadow: '0 18px 44px rgba(0, 0, 0, 0.72)',
            }}
          >
            <MdxcnFrame
              title={spec.badge}
              mode="dark"
              accentColor={PALETTE.scannerBright}
              surfaceColor="rgba(11, 16, 27, 0.95)"
              scale={u}
              titleAlign="left"
              bodyStyle={{
                padding: `${Math.round(18 * u)}px ${Math.round(20 * u)}px`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: Math.round(16 * u),
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontFamily: FONT_SANS,
                      fontSize: Math.round(19 * u),
                      fontWeight: 600,
                      lineHeight: 1.25,
                      color: PALETTE.inkPrimary,
                    }}
                  >
                    {spec.title}
                  </div>
                  <div
                    style={{
                      marginTop: Math.round(5 * u),
                      fontFamily: FONT_SANS,
                      fontSize: Math.round(13.5 * u),
                      lineHeight: 1.38,
                      color: PALETTE.inkMuted,
                    }}
                  >
                    {spec.subtitle}
                  </div>
                </div>

                <div
                  style={{
                    flexShrink: 0,
                    padding: `${Math.round(8 * u)}px ${Math.round(12 * u)}px`,
                    borderRadius: 4,
                    border: '1px solid rgba(69, 184, 214, 0.36)',
                    backgroundColor: 'rgba(16, 22, 34, 0.92)',
                    textAlign: 'right',
                  }}
                >
                  <div
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: Math.max(9, Math.round(10 * u)),
                      letterSpacing: '0.08em',
                      color: PALETTE.inkMuted,
                    }}
                  >
                    {spec.metricLabel}
                  </div>
                  <div
                    style={{
                      marginTop: Math.round(3 * u),
                      fontFamily: FONT_MONO,
                      fontSize: Math.max(11, Math.round(14 * u)),
                      fontWeight: 700,
                      fontVariantNumeric: 'tabular-nums',
                      color: PALETTE.cyan,
                    }}
                  >
                    {spec.metricValue}
                  </div>
                </div>
              </div>
            </MdxcnFrame>
          </div>
        </AndromedaPanel>
      </div>
    </AbsoluteFill>
  );
}

export function FeatureWalkthroughScene({ compact = false }: FeatureWalkthroughSceneProps) {
  const { durationInFrames } = useVideoConfig();
  const steps = buildSteps(compact);
  const perStep = Math.floor(durationInFrames / steps.length);

  return (
    <AbsoluteFill style={{ backgroundColor: PALETTE.obsidianBase }}>
      {steps.map((step, idx) => {
        const from = idx * perStep;
        const dur = idx === steps.length - 1 ? durationInFrames - from : perStep;
        return (
          <Sequence key={step.badge} from={from} durationInFrames={dur}>
            <SingleWalkthroughBeat
              spec={step}
              stepIndex={idx}
              totalSteps={steps.length}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
}
