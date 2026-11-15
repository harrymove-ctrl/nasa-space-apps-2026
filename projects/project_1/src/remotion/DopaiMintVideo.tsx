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
import { CyberpunkTechIntro } from './scenes/CyberpunkTechIntro';
import { CarbonDiffScene } from './scenes/CarbonDiffScene';
import { HypeReelScene } from './scenes/HypeReelScene';
import { WarmPaperPitchScene } from './scenes/WarmPaperPitchScene';

export interface DopaiMintVideoProps {
  readonly variant: 'nasa-hackathon' | 'full-launch';
}

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
    title: 'Orbital Corridor Fusion',
    tag: 'FIRMS + EONET',
    note: 'Elliptic VIIRS and MODIS merge over active corridors',
    image: '/video-assets/screens/overview-hero.jpg',
  },
  {
    title: 'Hazard Triage Loop',
    tag: 'DONKI + IEEE 738',
    note: 'Real proton flux surge and wind ampacity limits',
    image: '/video-assets/screens/triage-game.jpg',
  },
  {
    title: 'CradleFlow Shelter',
    tag: 'PHASE 02 HANDOFF',
    note: 'Live telemetry seeds orbital habitat shielding',
    image: '/video-assets/screens/cradleflow-unified.jpg',
  },
  {
    title: 'Mission Knowledge Map',
    tag: 'OSDR-340 GRAPH',
    note: 'Orbital payload science wired to grid dispatch',
    image: '/video-assets/screens/knowledge-map.jpg',
  },
] as const;

export function DopaiMintVideo({ variant }: DopaiMintVideoProps) {
  const { width, height } = useVideoConfig();
  const u = Math.min(width / 1920, height / 1080);

  const compact = variant === 'nasa-hackathon';

  // Exact timeline slices tuned to audio drop & hit cues:
  // nasa-hackathon: 855 frames = 28.50s @ 30fps (strictly <= 30s NASA cap)
  // full-launch:    1620 frames = 54.00s @ 30fps
  const timings = compact
    ? {
        intro: { from: 0, dur: 115 },
        hello: { from: 115, dur: 75 },
        spec: { from: 190, dur: 75 },
        carbon: { from: 265, dur: 100 },
        rail: { from: 365, dur: 100 },
        wall: { from: 465, dur: 70 },
        hype: { from: 535, dur: 90 },
        thread: { from: 625, dur: 110 },
        pitch: { from: 735, dur: 120 },
      }
    : {
        intro: { from: 0, dur: 165 },
        hello: { from: 165, dur: 75 },
        spec: { from: 240, dur: 80 },
        carbon: { from: 320, dur: 175 },
        rail: { from: 495, dur: 150 },
        wall: { from: 645, dur: 140 },
        hype: { from: 785, dur: 110 },
        thread: { from: 895, dur: 170 },
        pitch: { from: 1065, dur: 555 },
      };

  const audioTrack = compact
    ? '/audio/dopaimint-hackathon-28s.mp3'
    : '/audio/dopaimint-launch-1080p.mp3';

  const specSegments = [
    { text: '8 NASA feeds', role: 'lead' as const },
    { role: 'icon' as const },
    { text: '1 unified habitat twin', role: 'accent' as const },
    { text: '· Zero login', role: 'muted' as const },
  ];

  const threadMessages = [
    {
      author: 'Christina Koch',
      avatar: '/video-assets/people/avatars/christina_koch_sq.jpg',
      time: '09:41 UTC',
      text: 'VIIRS + MODIS locked Alpha.',
      at: 4,
    },
    {
      author: 'Reid Wiseman',
      avatar: '/video-assets/people/avatars/reid_wiseman_sq.jpg',
      time: '09:41 UTC',
      text: 'DONKI 185 pfu · IEEE 738.',
      at: compact ? 24 : 34,
    },
    {
      author: 'Sunita Williams',
      avatar: '/video-assets/people/avatars/sunita_williams_sq.jpg',
      time: '09:42 UTC',
      text: 'Kp handed to CradleFlow.',
      at: compact ? 48 : 68,
    },
    {
      author: 'Jessica Meir',
      avatar: '/video-assets/people/avatars/jessica_meir_sq.jpg',
      time: '09:42 UTC',
      text: 'Shield sealed · Grade S.',
      at: compact ? 74 : 102,
    },
    ...(compact
      ? []
      : [
          {
            author: 'Zena Cardman',
            avatar: '/video-assets/people/avatars/zena_cardman_sq.jpg',
            time: '09:43 UTC',
            text: 'OSDR-340 bio payload live.',
            at: 134,
          },
        ]),
  ];

  return (
    <SnapCnUIProvider theme={DOPAIMINT_SNAPCN_THEME} mode="dark">
      <AbsoluteFill style={{ backgroundColor: PALETTE.obsidianBase }}>
        {/* Mastered -16 LUFS soundtrack (early hook, tension build, reveal payoff, runtime synced) */}
        <Audio src={resolveAssetUrl(audioTrack)} volume={0.92} />

        {/* 1. Cyberpunk Tech Intro + Bot Avatar Hook */}
        <Sequence from={timings.intro.from} durationInFrames={timings.intro.dur}>
          <CyberpunkTechIntro compact={compact} showGameBotHook />
        </Sequence>

        {/* 2. @snapcn Hello Zoom: Words flicker in, type on, camera dives through letters */}
        <Sequence from={timings.hello.from} durationInFrames={timings.hello.dur}>
          <HelloZoom
            words={['NASA', 'ORBIT', 'SHELTER']}
            lead="Powered by "
            rest="DopaiMint"
            nextWord="SHIP"
            fontFamily={FONT_SANS}
            fontWeight={800}
            inkColor={PALETTE.obsidianBase}
            paperColor={PALETTE.inkPrimary}
            mode="dark"
          />
        </Sequence>

        {/* 3. @snapcn Spec Sweep: Sliding spec + charging icon sweep */}
        <Sequence from={timings.spec.from} durationInFrames={timings.spec.dur}>
          <AbsoluteFill
            style={{
              backgroundColor: PALETTE.obsidianBase,
              backgroundImage: `radial-gradient(circle at 50% 50%, rgba(69, 184, 214, 0.22) 0%, rgba(93, 255, 154, 0.08) 42%, transparent 72%)`,
            }}
          >
            <SpecSweep
              segments={specSegments}
              accentColor={PALETTE.cyan}
              iconRimColor={PALETTE.scannerBright}
              fontFamily={FONT_SANS}
              fontSize={76}
              fontWeight={700}
              mode="dark"
            />
          </AbsoluteFill>
        </Sequence>

        {/* 4. Carbon Model Hackathon Story (Headline, Versions Diff, Code Diff, Step-by-Step Features) */}
        <Sequence from={timings.carbon.from} durationInFrames={timings.carbon.dur}>
          <CarbonDiffScene extended={!compact} />
        </Sequence>

        {/* 5. @snapcn Card Rail: Tilted perspective cards flicked sideways */}
        <Sequence from={timings.rail.from} durationInFrames={timings.rail.dur}>
          <CardRail
            heading="CORRIDOR ENGINE · 4 STATIONS"
            cards={CORRIDOR_CARDS}
            from={8}
            flicks={3}
            every={compact ? 24 : 36}
            offset={Math.round(310 * u)}
            backdrop={PALETTE.obsidianBase}
            fontFamily={FONT_SANS}
            mode="dark"
          />
        </Sequence>

        {/* 6. @snapcn Reel Wall: Curved 3D rotating reel showcase */}
        <Sequence from={timings.wall.from} durationInFrames={timings.wall.dur}>
          <ReelWall
            videos={REEL_WALL_VIDEOS}
            background={PALETTE.obsidianBase}
            cardColor={PALETTE.obsidianCard}
            speed={compact ? 1.35 : 1}
          />
        </Sequence>

        {/* 7. Frame-Measured 3s Hype Reel (close-up racing counter -> cut out -> spring avatars -> 999k) */}
        <Sequence from={timings.hype.from} durationInFrames={timings.hype.dur}>
          <HypeReelScene />
        </Sequence>

        {/* 8. @snapcn Channel Thread: NASA Ops & Crew Comms Transcript */}
        <Sequence from={timings.thread.from} durationInFrames={timings.thread.dur}>
          <AbsoluteFill style={{ backgroundColor: PALETTE.obsidianBase }}>
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: 'scale(0.88)',
                transformOrigin: 'center center',
              }}
            >
              <ChannelThread
                messages={threadMessages}
                fontFamily={FONT_SANS}
                mode="dark"
              />
            </div>
          </AbsoluteFill>
        </Sequence>

        {/* 9. Zero-Caption Warm Archival Paper Demo-Day Pitch (Problem, Numbers, Ask) */}
        <Sequence from={timings.pitch.from} durationInFrames={timings.pitch.dur}>
          <WarmPaperPitchScene />
        </Sequence>
      </AbsoluteFill>
    </SnapCnUIProvider>
  );
}
