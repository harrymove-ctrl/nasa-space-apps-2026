import { AbsoluteFill, Audio, Sequence, useVideoConfig } from 'remotion';
import { SnapCnUIProvider } from '@/lib/snap-cn-ui';
import { HelloZoom } from '@/components/snap-cn/hello-zoom';
import { SpecSweep } from '@/components/snap-cn/spec-sweep';
import { CardRail } from '@/components/snap-cn/card-rail';
import { ReelWall } from '@/components/snap-cn/reel-wall';
import { ChannelThread } from '@/components/snap-cn/channel-thread';
import {
  DOPAIMINT_SNAPCN_THEME,
  FONT_SANS,
  PALETTE,
  resolveAssetUrl,
} from './palette';
import {
  DopaiMintHudBar,
  MdxcnFrame,
  RemotionAsciiBackdrop,
} from './primitives';
import { CyberpunkTechIntro } from './scenes/CyberpunkTechIntro';
import { CarbonDiffScene } from './scenes/CarbonDiffScene';
import { FeatureWalkthroughScene } from './scenes/FeatureWalkthroughScene';
import { HypeReelScene } from './scenes/HypeReelScene';
import { WarmPaperPitchScene } from './scenes/WarmPaperPitchScene';

export interface DopaiMintVideoProps {
  readonly variant: 'nasa-hackathon' | 'full-launch';
}

export const NASA_HACKATHON_FRAMES = 855; // 28.50s @ 30fps (strictly <= 30.0s NASA cap)
export const FULL_LAUNCH_FRAMES = 2760; // 92.00s @ 30fps (unrushed 10-chapter product demo)

const REEL_WALL_VIDEOS = [
  '/video-assets/reels/reel-1.mp4',
  '/video-assets/reels/reel-2.mp4',
  '/video-assets/reels/reel-3.mp4',
  '/video-assets/reels/reel-4.mp4',
  '/video-assets/reels/reel-5.mp4',
  '/video-assets/reels/reel-6.mp4',
];

const CORRIDOR_CARDS = [
  {
    title: 'Live Corridor Readout',
    tag: 'MODIS + VIIRS · IEEE 738',
    note: 'Butte 230 kV 425 A safe limit & 65 min TTCE closure',
    image: '/video-assets/screens/step-1-observatory.jpg',
  },
  {
    title: '26-Year Burning Calendar',
    tag: '2000–2026 H3 DEDUP',
    note: 'Removes 38% duplicate multi-satellite fire ellipses',
    image: '/video-assets/screens/step-2-calendar.jpg',
  },
  {
    title: '5-Layer Provenance Graph',
    tag: 'FIRMS · EONET · GIBS · SAR',
    note: 'Every corridor claim linked to its sensor record',
    image: '/video-assets/screens/step-3-map.jpg',
  },
  {
    title: 'Phase 01 Grid Triage Drill',
    tag: '3-WAVE MISSION GAME',
    note: 'Interactive conductor rerouting under solar flares',
    image: '/video-assets/screens/step-4-triage.jpg',
  },
  {
    title: 'Phase 02 CradleFlow Canvas',
    tag: 'REACT FLOW AUTOMATION',
    note: 'Same-origin proton flux handoff seals storm shields',
    image: '/video-assets/screens/step-5-cradleflow.jpg',
  },
  {
    title: 'Archival Light Observatory',
    tag: 'DUAL THEME · ZERO LOGIN',
    note: 'Warm paper #f5f2ea and obsidian #090c14 web parity',
    image: '/video-assets/screens/step-6-light-paper.jpg',
  },
] as const;

const SPEC_SEGMENTS = [
  { text: '8 keyless NASA feeds', role: 'lead' as const },
  { role: 'icon' as const },
  { text: '1 live grid-to-habitat twin', role: 'accent' as const },
  { text: '· Zero login', role: 'muted' as const },
];

const THREAD_MESSAGES = [
  {
    author: 'Christina Koch',
    avatar: '/video-assets/people/avatars/christina_koch_sq.jpg',
    time: '09:41 UTC',
    text: 'VIIRS + MODIS dedup 38%.',
    opens: 0,
    at: 6,
  },
  {
    author: 'Reid Wiseman',
    avatar: '/video-assets/people/avatars/reid_wiseman_sq.jpg',
    time: '09:41 UTC',
    text: 'IEEE 738 safe limit: 425 A.',
    opens: 26,
    at: 48,
  },
  {
    author: 'Sunita Williams',
    avatar: '/video-assets/people/avatars/sunita_williams_sq.jpg',
    time: '09:42 UTC',
    text: 'Kp 6.3 -> CradleFlow live.',
    opens: 72,
    at: 94,
  },
  {
    author: 'Jessica Meir',
    avatar: '/video-assets/people/avatars/jessica_meir_sq.jpg',
    time: '09:42 UTC',
    text: '0.00 / 12 mSv (Grade S).',
    opens: 118,
    at: 140,
  },
  {
    author: 'Zena Cardman',
    avatar: '/video-assets/people/avatars/zena_cardman_sq.jpg',
    time: '09:43 UTC',
    text: '1,064 OSDR assays synced.',
    opens: 162,
    at: 182,
  },
];

function SpecSweepStage({ compact }: { readonly compact: boolean }) {
  const { width, height } = useVideoConfig();
  const u = Math.min(width / 1920, height / 1080);

  return (
    <AbsoluteFill style={{ backgroundColor: PALETTE.obsidianBase }}>
      <RemotionAsciiBackdrop piece="earthrise" mode="dark" scrimOpacity={0.62} speed={0.85} />
      <DopaiMintHudBar
        mode="dark"
        activeTab="Demo"
        rightLabel="System Thesis · 8 Keyless Streams → 1 Twin"
        scale={u}
      />
      <SpecSweep
        segments={SPEC_SEGMENTS}
        accentColor={PALETTE.cyan}
        iconRimColor={PALETTE.scannerBright}
        fontFamily={FONT_SANS}
        fontSize={compact ? 84 : 78}
        fontWeight={600}
        theme={{ background: 'transparent' }}
        mode="dark"
      />
    </AbsoluteFill>
  );
}

function ChannelThreadStage() {
  const { width, height } = useVideoConfig();
  const u = Math.min(width / 1920, height / 1080);
  const padX = Math.round(92 * u);

  return (
    <AbsoluteFill style={{ backgroundColor: PALETTE.obsidianBase }}>
      <RemotionAsciiBackdrop piece="aurora" mode="dark" scrimOpacity={0.68} speed={0.75} />
      <DopaiMintHudBar
        mode="dark"
        activeTab="Trainer"
        rightLabel="Crew & Grid Ops Transcript · Live Handoff"
        scale={u}
      />
      <div
        style={{
          position: 'absolute',
          top: Math.round(86 * u),
          left: padX,
          right: padX,
          bottom: Math.round(46 * u),
        }}
      >
        <MdxcnFrame
          title="MISSION & GRID OPS TRANSCRIPT // #EARTH-TO-ORBIT"
          mode="dark"
          accentColor={PALETTE.cyan}
          surfaceColor="rgba(11, 16, 27, 0.94)"
          scale={u}
          style={{ width: '100%', height: '100%' }}
          bodyStyle={{
            width: '100%',
            height: '100%',
            padding: 0,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              transform: 'scale(0.86)',
              transformOrigin: 'center center',
            }}
          >
            <ChannelThread
              messages={THREAD_MESSAGES}
              fontFamily={FONT_SANS}
              theme={{ background: 'transparent' }}
              mode="dark"
            />
          </div>
        </MdxcnFrame>
      </div>
    </AbsoluteFill>
  );
}

export function DopaiMintVideo({ variant }: DopaiMintVideoProps) {
  const { width, height } = useVideoConfig();
  const u = Math.min(width / 1920, height / 1080);

  if (variant === 'nasa-hackathon') {
    // Official 28.50s (855 frames @ 30fps) NASA Space Apps Field 3 Cut:
    // 5 clean, un-crammed beats matching DopaiMint web UI/UX 100%
    return (
      <SnapCnUIProvider theme={DOPAIMINT_SNAPCN_THEME} mode="dark">
        <AbsoluteFill style={{ backgroundColor: PALETTE.obsidianBase }}>
          <Audio src={resolveAssetUrl('/audio/dopaimint-hackathon-28s.mp3')} volume={0.96} />

          {/* Beat 1 (0.0s–5.0s, 150f): Cinematic Tech Intro + Scanner + Bot-Avatars Hook */}
          <Sequence from={0} durationInFrames={150}>
            <CyberpunkTechIntro compact showGameBotHook />
          </Sequence>

          {/* Beat 2 (5.0s–8.0s, 90f): @snapcn/spec-sweep over ascii.rest */}
          <Sequence from={150} durationInFrames={90}>
            <SpecSweepStage compact />
          </Sequence>

          {/* Beat 3 (8.0s–17.0s, 270f): Live Step-by-Step Recorded Product Walkthrough */}
          <Sequence from={240} durationInFrames={270}>
            <FeatureWalkthroughScene compact />
          </Sequence>

          {/* Beat 4 (17.0s–21.0s, 120f): Unclipped Mobile CradleFlow Hype Reel -> 999k */}
          <Sequence from={510} durationInFrames={120}>
            <HypeReelScene />
          </Sequence>

          {/* Beat 5 (21.0s–28.5s, 225f): Zero-Caption Warm Paper Executive Folio */}
          <Sequence from={630} durationInFrames={225}>
            <WarmPaperPitchScene compactSummary />
          </Sequence>
        </AbsoluteFill>
      </SnapCnUIProvider>
    );
  }

  // Flagship Unrushed Full Product Demo (2760 frames = 92.00s @ 30fps):
  // Every scene runs at its natural human-readable @snapcn & walkthrough cadence!
  return (
    <SnapCnUIProvider theme={DOPAIMINT_SNAPCN_THEME} mode="dark">
      <AbsoluteFill style={{ backgroundColor: PALETTE.obsidianBase }}>
        <Audio src={resolveAssetUrl('/audio/dopaimint-launch-1080p.mp3')} volume={0.96} />

        {/* 1. (0.0s–7.0s, 210f) Cinematic Tech Intro + Azimuth Scanner + Bot-Avatars Hook */}
        <Sequence from={0} durationInFrames={210}>
          <CyberpunkTechIntro compact={false} showGameBotHook />
        </Sequence>

        {/* 2. (7.0s–9.8s, 84f) @snapcn/hello-zoom in DopaiMint obsidian & warm archival paper */}
        <Sequence from={210} durationInFrames={84}>
          <HelloZoom
            words={['MODIS', 'VIIRS', 'DONKI', 'GOES', 'OSDR', 'IEEE']}
            lead="Fuse"
            rest="DopaiMint"
            nextWord="8 → 1"
            fontFamily={FONT_SANS}
            fontWeight={700}
            inkColor={PALETTE.obsidianBase}
            paperColor={PALETTE.warmPaper}
            mode="dark"
          />
        </Sequence>

        {/* 3. (9.8s–13.0s, 96f) @snapcn/spec-sweep over ascii.rest */}
        <Sequence from={294} durationInFrames={96}>
          <SpecSweepStage compact={false} />
        </Sequence>

        {/* 4. (13.0s–22.0s, 270f) Carbon Model Hackathon Story: Shipping Log + Versions + Code Diff */}
        <Sequence from={390} durationInFrames={270}>
          <CarbonDiffScene extended />
        </Sequence>

        {/* 5. (22.0s–45.0s, 690f) Step-by-Step Recorded Live Walkthrough (@snapcn/screen-recording + cursor-track) */}
        <Sequence from={660} durationInFrames={690}>
          <FeatureWalkthroughScene compact={false} />
        </Sequence>

        {/* 6. (45.0s–51.5s, 195f) @snapcn/card-rail: 3 natural perspective flicks */}
        <Sequence from={1350} durationInFrames={195}>
          <AbsoluteFill style={{ backgroundColor: PALETTE.obsidianBase }}>
            <CardRail
              heading="ORBIT TO OUTPOST · 6 LIVE STATIONS"
              cards={CORRIDOR_CARDS}
              from={10}
              flicks={3}
              every={44}
              offset={227}
              backdrop={`${PALETTE.obsidianBase}|#101622`}
              fontFamily={FONT_SANS}
              mode="dark"
            />
            <DopaiMintHudBar
              mode="dark"
              activeTab="Plates"
              rightLabel="Station Rail · 6 Interactive Views"
              scale={u}
            />
          </AbsoluteFill>
        </Sequence>

        {/* 7. (51.5s–57.0s, 165f) @snapcn/reel-wall: Unclipped 432x768 Portrait Mobile Reels */}
        <Sequence from={1545} durationInFrames={165}>
          <AbsoluteFill style={{ backgroundColor: PALETTE.obsidianBase }}>
            <ReelWall
              videos={REEL_WALL_VIDEOS}
              background={PALETTE.obsidianBase}
              cardColor={PALETTE.obsidianCard}
              speed={1}
            />
            <DopaiMintHudBar
              mode="dark"
              activeTab="Overview"
              rightLabel="Curved Mobile Reel Wall · Zero Edge Clipping"
              scale={u}
            />
          </AbsoluteFill>
        </Sequence>

        {/* 8. (57.0s–61.0s, 120f) Web-Matched Hype Reel (Macro Counter -> Mobile Card -> 999k) */}
        <Sequence from={1710} durationInFrames={120}>
          <HypeReelScene />
        </Sequence>

        {/* 9. (61.0s–68.0s, 210f) @snapcn/channel-thread with NASA Astronaut Portraits & Typing Dots */}
        <Sequence from={1830} durationInFrames={210}>
          <ChannelThreadStage />
        </Sequence>

        {/* 10. (68.0s–92.0s, 720f) Zero-Caption Warm Paper Demo-Day Pitch (Problem, Numbers, Ask) */}
        <Sequence from={2040} durationInFrames={720}>
          <WarmPaperPitchScene compactSummary={false} />
        </Sequence>
      </AbsoluteFill>
    </SnapCnUIProvider>
  );
}
