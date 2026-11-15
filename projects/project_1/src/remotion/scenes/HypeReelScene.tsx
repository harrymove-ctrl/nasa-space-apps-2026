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
  DopaiMintHudBar,
  MdxcnFrame,
  RemotionAsciiBackdrop,
} from '../primitives';
import { SafeImg } from '../SafeImg';

interface HypeReactionItem {
  readonly id: string;
  readonly frameTitle: string;
  readonly name: string;
  readonly role: string;
  readonly comment: string;
  readonly avatar: string;
  readonly enterFrame: number;
  readonly side: 'left' | 'right';
  readonly yPct: number;
  readonly accent: string;
}

const REACTIONS: readonly HypeReactionItem[] = [
  {
    id: 'r1',
    frameTitle: 'ORBITAL OPS',
    name: 'Christina Koch',
    role: 'Artemis Mission Specialist',
    comment: 'VIIRS 375m + GOES-18 flux synced cleanly into shelter gates.',
    avatar: '/video-assets/people/avatars/christina_koch_sq.jpg',
    enterFrame: 34,
    side: 'left',
    yPct: 33,
    accent: PALETTE.cyan,
  },
  {
    id: 'r2',
    frameTitle: 'BOT CREW // 02',
    name: 'Grid Triage Unit',
    role: 'bot-avatars · Phase 02',
    comment: 'Same-origin CradleFlow handoff armed water-wall in 1 click.',
    avatar: '/video-assets/bots/work.png',
    enterFrame: 42,
    side: 'right',
    yPct: 34,
    accent: PALETTE.scannerGreen,
  },
  {
    id: 'r3',
    frameTitle: 'FLIGHT DIRECTOR',
    name: 'Reid Wiseman',
    role: 'Commander · Deep Space',
    comment: 'IEEE 738 safe ampacity + TTCE closure verified on live APIs.',
    avatar: '/video-assets/people/avatars/reid_wiseman_sq.jpg',
    enterFrame: 50,
    side: 'left',
    yPct: 63,
    accent: PALETTE.cyan,
  },
  {
    id: 'r4',
    frameTitle: 'OSDR BIO-LAB',
    name: 'Jessica Meir',
    role: 'Space Biology Lead',
    comment: '1,064 OSDR radiation studies linked · Crew dose 0.00 / 12 mSv.',
    avatar: '/video-assets/people/avatars/jessica_meir_sq.jpg',
    enterFrame: 58,
    side: 'right',
    yPct: 64,
    accent: PALETTE.coral,
  },
];

/**
 * Web-matched Hype Reel sequence (zero AI-slop glow, unclipped 432x768 mobile CradleFlow capture):
 * 0..24f: macro camera zoom on tabular JetBrains Mono counter racing upward
 * 24..36f: physics spring pull-back revealing full 9:16 unclipped mobile CradleFlow station card
 * 34..90f+: mdxcn reaction cards with real NASA adult portraits & bot-avatars spring in as views hit 999k
 */
export function HypeReelScene() {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const u = Math.min(width / 1920, height / 1080);

  // Exact 9:16 portrait dimensions matching portrait-cradleflow.jpg (432x768) so zero pixels crop horizontally!
  const cardH = Math.round(736 * u);
  const cardW = Math.round((cardH * 9) / 16); // 414 * u -> exact 9:16!

  // Macro close-up on top-right tabular counter -> snap spring pull-out at frame 24
  const pullBack = spring({
    frame: Math.max(0, frame - 24),
    fps,
    config: { damping: 16, stiffness: 210, mass: 0.74 },
  });
  const camScale = frame < 24 ? 2.65 : interpolate(pullBack, [0, 1], [2.65, 1]);
  const camX = frame < 24 ? -Math.round(108 * u) : interpolate(pullBack, [0, 1], [-108 * u, 0]);
  const camY = frame < 24 ? Math.round(210 * u) : interpolate(pullBack, [0, 1], [210 * u, 0]);

  // Tabular view counter accelerates smoothly and locks at 999k on frame 74
  const countProgress = interpolate(frame, [0, 74], [0, 1], { extrapolateRight: 'clamp' });
  const viewsK = Math.min(999, Math.max(18, Math.round(18 + Math.pow(countProgress, 1.28) * 981)));
  const locked999 = viewsK >= 999;

  const headerReveal = interpolate(frame, [26, 36], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const reactionW = Math.round(426 * u);
  const gapFromCard = Math.round(48 * u);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: PALETTE.obsidianBase,
        fontFamily: FONT_SANS,
        color: PALETTE.inkPrimary,
        overflow: 'hidden',
      }}
    >
      <RemotionAsciiBackdrop piece="solar-system" mode="dark" scrimOpacity={0.66} speed={0.85} />

      <DopaiMintHudBar
        mode="dark"
        activeTab="Trainer"
        rightLabel="Mobile Responsive Dispatch · Zero Clipping"
        scale={u}
      />

      {/* Symmetrical mdxcn reaction cards springing in around the 9:16 portrait station card */}
      {REACTIONS.map((item) => {
        const sp = spring({
          frame: Math.max(0, frame - item.enterFrame),
          fps,
          config: { damping: 14, stiffness: 185, mass: 0.72 },
        });
        const leftPx =
          item.side === 'left'
            ? Math.round(width / 2 - cardW / 2 - gapFromCard - reactionW)
            : Math.round(width / 2 + cardW / 2 + gapFromCard);

        return (
          <div
            key={item.id}
            style={{
              position: 'absolute',
              top: `${item.yPct}%`,
              left: leftPx,
              width: reactionW,
              transform: `translateY(${interpolate(sp, [0, 1], [20 * u, 0])}px) scale(${interpolate(sp, [0, 1], [0.84, 1])})`,
              opacity: sp,
              zIndex: 12,
            }}
          >
            <MdxcnFrame
              title={item.frameTitle}
              mode="dark"
              accentColor={item.accent}
              surfaceColor="rgba(11, 16, 27, 0.95)"
              scale={u}
              titleAlign="left"
              bodyStyle={{
                padding: `${Math.round(16 * u)}px ${Math.round(16 * u)}px`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: Math.round(12 * u) }}>
                <SafeImg
                  src={resolveAssetUrl(item.avatar)}
                  alt={item.name}
                  style={{
                    width: Math.round(46 * u),
                    height: Math.round(46 * u),
                    borderRadius: 4,
                    objectFit: 'cover',
                    border: `1px solid ${item.accent}`,
                    backgroundColor: PALETTE.obsidianBase,
                    flexShrink: 0,
                  }}
                />
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: Math.round(8 * u) }}>
                    <span
                      style={{
                        fontFamily: FONT_SANS,
                        fontSize: Math.round(15.5 * u),
                        fontWeight: 600,
                        color: PALETTE.inkPrimary,
                      }}
                    >
                      {item.name}
                    </span>
                    <span
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: Math.max(9, Math.round(10.5 * u)),
                        color: PALETTE.inkMuted,
                      }}
                    >
                      {item.role}
                    </span>
                  </div>
                  <div
                    style={{
                      marginTop: Math.round(4 * u),
                      fontFamily: FONT_SANS,
                      fontSize: Math.round(13.5 * u),
                      lineHeight: 1.32,
                      color: PALETTE.inkSecondary,
                    }}
                  >
                    {item.comment}
                  </div>
                </div>
              </div>
            </MdxcnFrame>
          </div>
        );
      })}

      {/* Central Camera Rig: Macro Counter -> Full Unclipped 9:16 Mobile CradleFlow Card */}
      <div
        style={{
          position: 'absolute',
          top: Math.round(62 * u),
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `translate(${camX}px, ${camY}px) scale(${camScale})`,
          zIndex: 10,
        }}
      >
        {/* Crisp Andromeda sentence-case caption above the card */}
        <div
          style={{
            marginBottom: Math.round(14 * u),
            textAlign: 'center',
            opacity: headerReveal,
          }}
        >
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: Math.max(10, Math.round(11.5 * u)),
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: PALETTE.cyan,
            }}
          >
            FIELD DISPATCH REEL · MOBILE STATION VIEW
          </div>
          <div
            style={{
              marginTop: Math.round(4 * u),
              fontSize: Math.round(23 * u),
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: PALETTE.inkPrimary,
            }}
          >
            Earth corridor telemetry synced live to CradleFlow
          </div>
        </div>

        {/* Exact 9:16 AndromedaPanel housing genuine 432x768 portrait-cradleflow.jpg (zero cropped edges!) */}
        <AndromedaPanel
          mode="dark"
          markerSize={Math.round(16 * u)}
          markerColor={locked999 ? PALETTE.scannerBright : PALETTE.cyan}
          style={{
            width: cardW,
            height: cardH,
            overflow: 'hidden',
            backgroundColor: PALETTE.obsidianCard,
            border: `1px solid ${locked999 ? 'rgba(93, 255, 154, 0.52)' : 'rgba(69, 184, 214, 0.42)'}`,
            boxShadow: '0 24px 56px rgba(0, 0, 0, 0.7)',
          }}
        >
          <SafeImg
            src={resolveAssetUrl('/video-assets/screens/portrait-cradleflow.jpg')}
            alt="DopaiMint and CradleFlow mobile responsive handoff"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              backgroundColor: PALETTE.obsidianBase,
            }}
          />

          {/* Top-right Andromeda 4px-radius Tabular Counter Badge (initial macro focal point) */}
          <div
            style={{
              position: 'absolute',
              top: Math.round(12 * u),
              right: Math.round(12 * u),
              padding: `${Math.round(7 * u)}px ${Math.round(13 * u)}px`,
              borderRadius: 4,
              backgroundColor: 'rgba(9, 12, 20, 0.94)',
              border: `1px solid ${locked999 ? PALETTE.scannerBright : PALETTE.cyan}`,
              display: 'flex',
              alignItems: 'center',
              gap: Math.round(8 * u),
              fontFamily: FONT_MONO,
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.6)',
            }}
          >
            <span
              style={{
                width: Math.max(6, Math.round(8 * u)),
                height: Math.max(6, Math.round(8 * u)),
                borderRadius: '50%',
                backgroundColor: locked999 ? PALETTE.scannerBright : PALETTE.coral,
              }}
            />
            <span
              style={{
                fontSize: Math.round(22 * u),
                fontWeight: 700,
                fontVariantNumeric: 'tabular-nums',
                color: PALETTE.inkPrimary,
              }}
            >
              {viewsK}k
            </span>
            <span
              style={{
                fontSize: Math.max(9, Math.round(10.5 * u)),
                letterSpacing: '0.08em',
                color: locked999 ? PALETTE.scannerBright : PALETTE.inkMuted,
              }}
            >
              {locked999 ? 'PEAK' : 'LIVE'}
            </span>
          </div>
        </AndromedaPanel>
      </div>
    </AbsoluteFill>
  );
}
