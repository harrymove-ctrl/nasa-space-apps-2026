import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { FONT_MONO, FONT_SANS, PALETTE, resolveAssetUrl } from '../palette';

interface HypeReaction {
  readonly id: string;
  readonly name: string;
  readonly handle: string;
  readonly comment: string;
  readonly avatar: string;
  readonly enterFrame: number;
  readonly side: 'left' | 'right';
  readonly yPct: number;
  readonly accent: string;
}

const REACTIONS: readonly HypeReaction[] = [
  {
    id: 'r1',
    name: 'Christina K.',
    handle: '@orbital_ops',
    comment: '185 pfu proton surge locked automatically',
    avatar: '/video-assets/people/avatars/christina_koch_sq.jpg',
    enterFrame: 34,
    side: 'left',
    yPct: 24,
    accent: PALETTE.cyan,
  },
  {
    id: 'r2',
    name: 'Bot Engineer',
    handle: '@bot_avatars',
    comment: 'Phase 02 CradleFlow shelter sealed!',
    avatar: '/video-assets/bots/work.png',
    enterFrame: 42,
    side: 'right',
    yPct: 28,
    accent: PALETTE.scannerBright,
  },
  {
    id: 'r3',
    name: 'Reid W.',
    handle: '@flight_dir',
    comment: 'IEEE 738 derating + OSDR-340 pass',
    avatar: '/video-assets/people/avatars/reid_wiseman_sq.jpg',
    enterFrame: 50,
    side: 'left',
    yPct: 58,
    accent: PALETTE.sky,
  },
  {
    id: 'r4',
    name: 'Jessica M.',
    handle: '@biolab_lead',
    comment: 'Zero login gates · Grade S certified',
    avatar: '/video-assets/people/avatars/jessica_meir_sq.jpg',
    enterFrame: 58,
    side: 'right',
    yPct: 62,
    accent: PALETTE.coral,
  },
];

/**
 * 3-second viral Hype Reel sequence measured to frame timing:
 * 0..24f: tight camera close-up racing up the view counter
 * 24..34f: snap zoom out revealing full 9:16 video card under its headline
 * 34..90f: NASA portraits + bot reactions spring radially as views hit 999k
 */
export function HypeReelScene() {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const u = Math.min(width / 1920, height / 1080);

  // Camera scale: tight close-up on top-right counter badge -> snap pull back to 1.0
  const zoomOut = spring({
    frame: Math.max(0, frame - 24),
    fps,
    config: { damping: 16, stiffness: 220, mass: 0.72 },
  });
  const camScale = frame < 24 ? 2.95 : interpolate(zoomOut, [0, 1], [2.95, 1]);
  const camOffsetY = frame < 24 ? 190 * u : interpolate(zoomOut, [0, 1], [190 * u, 0]);
  const camOffsetX = frame < 24 ? -120 * u : interpolate(zoomOut, [0, 1], [-120 * u, 0]);

  // accelerating view count racing up to 999k cleanly at frame 76
  const countFraction = interpolate(frame, [0, 76], [0, 1], { extrapolateRight: 'clamp' });
  const viewsNum = Math.min(999, Math.max(14, Math.round(14 + Math.pow(countFraction, 1.32) * 985)));
  const hitCap = viewsNum >= 999;

  const captionOpacity = interpolate(frame, [26, 36], [0, 1], { extrapolateRight: 'clamp' });

  const cardW = Math.round(420 * u);
  const cardH = Math.round(700 * u);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: PALETTE.obsidianBase,
        backgroundImage:
          'radial-gradient(circle at 50% 48%, rgba(69, 184, 214, 0.16) 0%, rgba(9, 12, 20, 0.98) 68%)',
        overflow: 'hidden',
        fontFamily: FONT_SANS,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Orbiting Social Reactions springing in around the card */}
      {REACTIONS.map((item) => {
        const s = spring({
          frame: Math.max(0, frame - item.enterFrame),
          fps,
          config: { damping: 12, stiffness: 190, mass: 0.7 },
        });
        const cardHalf = cardW / 2 + 28 * u;
        const slideFromCenter = item.side === 'left' ? -cardHalf : cardHalf;
        const boxW = Math.round(440 * u);
        return (
          <div
            key={item.id}
            style={{
              position: 'absolute',
              top: `${item.yPct}%`,
              left: item.side === 'left' ? `calc(50% + ${slideFromCenter - boxW}px)` : `calc(50% + ${slideFromCenter}px)`,
              width: boxW,
              display: 'flex',
              alignItems: 'center',
              gap: Math.round(14 * u),
              padding: `${Math.round(14 * u)}px ${Math.round(18 * u)}px`,
              borderRadius: Math.round(12 * u),
              border: `1px solid ${item.accent}55`,
              backgroundColor: 'rgba(16, 22, 34, 0.94)',
              boxShadow: `0 ${16 * u}px ${36 * u}px rgba(0, 0, 0, 0.55)`,
              transform: `scale(${interpolate(s, [0, 1], [0.65, 1])}) translateY(${interpolate(s, [0, 1], [16 * u, 0])}px)`,
              opacity: s,
            }}
          >
            <img
              src={resolveAssetUrl(item.avatar)}
              alt={item.name}
              style={{
                width: Math.round(54 * u),
                height: Math.round(54 * u),
                borderRadius: '50%',
                objectFit: 'cover',
                border: `2px solid ${item.accent}`,
                backgroundColor: PALETTE.obsidianBase,
                flexShrink: 0,
              }}
            />
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: Math.round(8 * u) }}>
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: Math.round(18 * u),
                    color: PALETTE.inkPrimary,
                  }}
                >
                  {item.name}
                </span>
                <span
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: Math.round(13 * u),
                    color: PALETTE.inkMuted,
                  }}
                >
                  {item.handle}
                </span>
              </div>
              <div
                style={{
                  marginTop: Math.round(4 * u),
                  fontSize: Math.round(16 * u),
                  color: PALETTE.inkSecondary,
                  lineHeight: 1.25,
                }}
              >
                {item.comment}
              </div>
            </div>
          </div>
        );
      })}

      {/* Central Hype Camera Rig (zoomed on badge -> pulls back to full vertical reel card) */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transform: `translate(${camOffsetX}px, ${camOffsetY}px) scale(${camScale})`,
        }}
      >
        <div
          style={{
            marginBottom: Math.round(18 * u),
            opacity: captionOpacity,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: Math.round(15 * u),
              letterSpacing: '0.16em',
              color: PALETTE.cyan,
            }}
          >
            LIVE FIELD TELEMETRY CLIP
          </div>
          <div
            style={{
              marginTop: Math.round(4 * u),
              fontSize: Math.round(30 * u),
              fontWeight: 800,
              color: PALETTE.inkPrimary,
            }}
          >
            Earth Corridors → CradleFlow Habitat
          </div>
        </div>

        {/* Glowing 9:16 Vertical Card */}
        <div
          style={{
            position: 'relative',
            width: cardW,
            height: cardH,
            borderRadius: Math.round(22 * u),
            overflow: 'hidden',
            border: `2px solid ${hitCap ? PALETTE.scannerBright : PALETTE.cyan}`,
            boxShadow: `0 0 ${48 * u}px ${hitCap ? 'rgba(93, 255, 154, 0.35)' : 'rgba(69, 184, 214, 0.32)'}, 0 ${28 * u}px ${70 * u}px rgba(0, 0, 0, 0.72)`,
            backgroundColor: PALETTE.obsidianCard,
          }}
        >
          <img
            src={resolveAssetUrl('/video-assets/screens/cradleflow-live.jpg')}
            alt="CradleFlow live mission execution"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: '50% 42%',
            }}
          />

          {/* Top-right Animated Viral Counter Pill (camera zoom anchor at start) */}
          <div
            style={{
              position: 'absolute',
              top: Math.round(24 * u),
              right: Math.round(24 * u),
              padding: `${Math.round(10 * u)}px ${Math.round(18 * u)}px`,
              borderRadius: Math.round(999),
              backgroundColor: 'rgba(9, 12, 20, 0.9)',
              border: `1.5px solid ${hitCap ? PALETTE.scannerBright : PALETTE.cyan}`,
              display: 'flex',
              alignItems: 'center',
              gap: Math.round(10 * u),
              fontFamily: FONT_MONO,
              boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
            }}
          >
            <span
              style={{
                width: Math.round(10 * u),
                height: Math.round(10 * u),
                borderRadius: '50%',
                backgroundColor: hitCap ? PALETTE.scannerBright : PALETTE.coral,
              }}
            />
            <span
              style={{
                fontSize: Math.round(28 * u),
                fontWeight: 800,
                fontVariantNumeric: 'tabular-nums',
                color: PALETTE.inkPrimary,
              }}
            >
              {viewsNum}k
            </span>
            <span
              style={{
                fontSize: Math.round(13 * u),
                color: PALETTE.inkMuted,
              }}
            >
              VIEWS
            </span>
          </div>

          {/* Card bottom bar inside vertical showcase */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              padding: `${Math.round(28 * u)}px ${Math.round(22 * u)}px ${Math.round(22 * u)}px`,
              background:
                'linear-gradient(180deg, rgba(9,12,20,0) 0%, rgba(9,12,20,0.88) 45%, rgba(9,12,20,0.98) 100%)',
            }}
          >
            <div
              style={{
                fontFamily: FONT_MONO,
                fontSize: Math.round(13 * u),
                color: PALETTE.scannerBright,
                letterSpacing: '0.12em',
              }}
            >
              @DOPAIMINT · ZERO-AUTH DRILL
            </div>
            <div
              style={{
                marginTop: Math.round(6 * u),
                fontSize: Math.round(22 * u),
                fontWeight: 700,
                color: PALETTE.inkPrimary,
              }}
            >
              185 pfu proton surge deflected cleanly under 25 mSv.
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}
