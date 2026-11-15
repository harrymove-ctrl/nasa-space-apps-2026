import { useRef, useState } from 'react';
import { Player, type PlayerRef } from '@remotion/player';
import { MotionConfig } from 'motion/react';
import { ArrowUpRight, Check, Copy, Film, Presentation } from 'lucide-react';
import {
  DopaiMintVideo,
  FULL_LAUNCH_FRAMES,
  NASA_HACKATHON_FRAMES,
} from '@/remotion/DopaiMintVideo';
import { Graph, GraphBody } from '@/registry/default/graph-frame/graph-frame';
import { GraphSpec } from '@/registry/default/graph-spec/graph-spec';

function FullLaunchView() {
  return <DopaiMintVideo variant="full-launch" />;
}

function NasaCutView() {
  return <DopaiMintVideo variant="nasa-hackathon" />;
}

type DemoTabId = 'launch-1080p' | 'nasa-1080p' | 'nasa-compact' | 'mp4-stream';

const DEMO_TABS = [
  {
    id: 'launch-1080p' as const,
    label: 'Full Product Demo · 1:32 (1080p)',
    shortLabel: '1:32 Full Demo',
    width: 1920,
    height: 1080,
    frames: FULL_LAUNCH_FRAMES,
    component: FullLaunchView,
    mp4Href: '/submission/dopaimint-cyberpunk-1080p.mp4',
    summary:
      'Unrushed 92.0s 10-chapter walkthrough matching the live DopaiMint web UI, step-by-step cursor recording, NASA crew thread, and warm paper Demo Day pitch.',
  },
  {
    id: 'nasa-1080p' as const,
    label: 'NASA <=30s Cut · 28.5s (1080p)',
    shortLabel: '28.5s NASA 1080p',
    width: 1920,
    height: 1080,
    frames: NASA_HACKATHON_FRAMES,
    component: NasaCutView,
    mp4Href: '/submission/dopaimint-demo-1080p-28s.mp4',
    summary:
      'Official 28.50s 5-beat submission cut engineered specifically for the NASA Space Apps <= 30s demonstration cap with directed voiceover and -16 LUFS launch score.',
  },
  {
    id: 'nasa-compact' as const,
    label: 'NASA 1080x700 · 28.5s',
    shortLabel: '28.5s 1080x700',
    width: 1080,
    height: 700,
    frames: NASA_HACKATHON_FRAMES,
    component: NasaCutView,
    mp4Href: '/submission/dopaimint-demo-28s.mp4',
    summary:
      'Compact 1080x700 30fps widescreen frame matching the submission studio card layout at 28.50s.',
  },
  {
    id: 'mp4-stream' as const,
    label: 'Rendered MP4 Stream',
    shortLabel: 'MP4 Stream',
    width: 1920,
    height: 1080,
    frames: FULL_LAUNCH_FRAMES,
    component: FullLaunchView,
    mp4Href: '/submission/dopaimint-cyberpunk-1080p.mp4',
    summary:
      'Direct HTTP 206 byte-range H.264 + AAC stereo MP4 served from DopaiMint with zero login or third-party gate.',
  },
] as const;

const FULL_DEMO_CHAPTERS = [
  { label: '00:00 Tech Hook + Bot', frame: 0 },
  { label: '00:07 Hello Zoom', frame: 210 },
  { label: '00:10 Spec Sweep', frame: 294 },
  { label: '00:13 Carbon Code Diff', frame: 390 },
  { label: '00:22 Live Web Walkthrough', frame: 660 },
  { label: '00:45 Card Rail', frame: 1350 },
  { label: '00:52 Reel Wall', frame: 1545 },
  { label: '00:57 Hype 999k', frame: 1710 },
  { label: '01:01 NASA Crew Thread', frame: 1830 },
  { label: '01:08 Warm Paper Pitch', frame: 2040 },
] as const;

export function DemoShowcaseSection() {
  const [activeTabId, setActiveTabId] = useState<DemoTabId>('launch-1080p');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const playerRef = useRef<PlayerRef>(null);

  const activeTab = DEMO_TABS.find((t) => t.id === activeTabId) ?? DEMO_TABS[0];

  const handleCopyUrl = (key: string, relativePath: string) => {
    if (typeof window === 'undefined') return;
    const origin =
      window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'https://dopaimint-production.up.railway.app'
        : window.location.origin;
    const fullUrl = `${origin}${relativePath}`;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(fullUrl)
        .then(() => {
          setCopiedKey(key);
          window.setTimeout(() => {
            setCopiedKey((prev) => (prev === key ? null : prev));
          }, 1800);
        })
        .catch(() => {});
    }
  };

  return (
    <section
      className="lp-section scroll-mt-20 border-t border-[var(--at-border-subtle)]"
      id="demo"
      data-testid="demo-showcase-section"
    >
      <MotionConfig reducedMotion="always">
        <div className="lp-container space-y-6">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--at-signal-cyan)]">
                LIVE PRODUCT DEMO &amp; SUBMISSION STUDIO
              </span>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--at-text-primary)] sm:text-4xl">
                Interactive Web Demo Matched 1:1 to DopaiMint Observatory
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <a
                href="/demo"
                data-testid="open-fullscreen-demo-link"
                className="lp-btn lp-btn--outline inline-flex items-center gap-1.5"
              >
                <Film className="size-4" aria-hidden="true" />
                Fullscreen Studio
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </a>
              <a
                href="/slides"
                data-testid="open-fullscreen-slides-link"
                className="lp-btn lp-btn--outline inline-flex items-center gap-1.5"
              >
                <Presentation className="size-4" aria-hidden="true" />
                7-Slide Deck
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Product demo cuts">
            {DEMO_TABS.map((tab) => {
              const isSelected = tab.id === activeTab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  data-testid={`demo-tab-${tab.id}`}
                  onClick={() => setActiveTabId(tab.id)}
                  className={`graph-frame cursor-pointer px-3 py-1.5 font-mono text-xs transition-colors ${
                    isSelected
                      ? 'mdxcn-surface-card font-semibold text-[var(--at-signal-cyan)]'
                      : 'mdxcn-surface-base text-[var(--at-text-muted)] hover:text-[var(--at-text-primary)]'
                  }`}
                >
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.shortLabel}</span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1.65fr_1fr]">
            <Graph title={`PRODUCT DEMO // ${activeTab.shortLabel.toUpperCase()}`} className="mdxcn-surface-card">
              <GraphBody className="space-y-4 p-3 sm:p-5">
                <div className="overflow-hidden rounded border border-[var(--at-border-subtle)] bg-[#090c14]">
                  {activeTab.id === 'mp4-stream' ? (
                    <video
                      key="mp4-stream-video"
                      controls
                      playsInline
                      preload="metadata"
                      poster="/video-assets/screens/step-1-observatory.jpg"
                      src="/submission/dopaimint-cyberpunk-1080p.mp4"
                      data-testid="demo-mp4-video"
                      className="block aspect-video w-full bg-[#090c14]"
                    />
                  ) : (
                    <Player
                      key={activeTab.id}
                      ref={playerRef}
                      component={activeTab.component}
                      compositionWidth={activeTab.width}
                      compositionHeight={activeTab.height}
                      durationInFrames={activeTab.frames}
                      fps={30}
                      controls
                      loop
                      clickToPlay
                      acknowledgeRemotionLicense
                      style={{
                        width: '100%',
                        aspectRatio: `${activeTab.width} / ${activeTab.height}`,
                      }}
                    />
                  )}
                </div>

                <p className="font-sans text-xs leading-relaxed text-[var(--at-text-muted)]">
                  {activeTab.summary}
                </p>

                {activeTab.id === 'launch-1080p' ? (
                  <div className="space-y-2 border-t border-dashed border-[var(--graph-frame)] pt-3">
                    <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--at-text-dim)]">
                      Jump to Scene Chapter (30 fps)
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {FULL_DEMO_CHAPTERS.map((chap) => (
                        <button
                          key={chap.label}
                          type="button"
                          onClick={() => {
                            playerRef.current?.seekTo(chap.frame);
                          }}
                          className="cursor-pointer rounded border border-[var(--at-border-subtle)] bg-[var(--at-surface-base)] px-2 py-1 font-mono text-[11px] text-[var(--at-text-secondary)] transition-colors hover:border-[var(--at-border-bright)] hover:text-[var(--at-signal-cyan)]"
                        >
                          {chap.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </GraphBody>
            </Graph>

            <div className="space-y-5">
              <GraphSpec
                title="DIRECT PUBLIC ARTIFACTS"
                className="mdxcn-surface-card"
                rows={[
                  {
                    label: 'full demo',
                    value: '1920x1080 · 1:32 (92.00s)',
                    note: 'Complete 10-chapter web walkthrough with step-by-step cursor tracks.',
                    accent: true,
                  },
                  {
                    label: 'nasa <=30s',
                    value: '1920x1080 & 1080x700 · 28.50s',
                    note: 'Strict <= 30.0s NASA Space Apps Field 3 demonstration cut.',
                  },
                  {
                    label: 'slide deck',
                    value: '7 Slides Interactive + PDF',
                    note: 'Exact 7-page 1920x1080 PDF plus live browser deck at /slides.',
                  },
                  {
                    label: 'audio mix',
                    value: 'Directed VO + Score (-16 LUFS)',
                    note: 'Sidechain-ducked narration, progressive launch synth, tactile UI SFX.',
                  },
                ]}
              />

              <Graph title="ZERO-LOGIN SUBMISSION LINKS" className="mdxcn-surface-card">
                <GraphBody className="space-y-2.5 p-4 font-mono text-xs">
                  {[
                    {
                      key: 'nasa-hd',
                      title: 'NASA <=30s HD MP4 (28.5s)',
                      href: '/submission/dopaimint-demo-1080p-28s.mp4',
                    },
                    {
                      key: 'launch-hd',
                      title: 'Full 1:32 Product Demo MP4',
                      href: '/submission/dopaimint-cyberpunk-1080p.mp4',
                    },
                    {
                      key: 'pdf-deck',
                      title: '7-Slide Presentation PDF',
                      href: '/submission/dopaimint-deck-7slides.pdf',
                    },
                    {
                      key: 'submission-hub',
                      title: 'Unified Submission Hub',
                      href: '/submission/',
                    },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between gap-2 rounded border border-[var(--at-border-subtle)] bg-[var(--at-surface-base)] px-3 py-2"
                    >
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-w-0 truncate text-[var(--at-text-primary)] hover:text-[var(--at-signal-cyan)] hover:underline"
                      >
                        {item.title}
                      </a>
                      <button
                        type="button"
                        onClick={() => handleCopyUrl(item.key, item.href)}
                        className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded border border-[var(--at-border-subtle)] px-2 py-1 text-[11px] text-[var(--at-text-muted)] hover:border-[var(--at-border-bright)] hover:text-[var(--at-text-primary)]"
                      >
                        {copiedKey === item.key ? (
                          <>
                            <Check className="size-3 text-[var(--at-signal-cyan)]" aria-hidden="true" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="size-3" aria-hidden="true" />
                            <span>Copy URL</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </GraphBody>
              </Graph>
            </div>
          </div>
        </div>
      </MotionConfig>
    </section>
  );
}
