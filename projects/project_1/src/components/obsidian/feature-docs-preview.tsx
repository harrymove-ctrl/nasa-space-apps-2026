import {
  Check,
  Code2,
  Columns2,
  Copy,
  Heading,
  Layers,
  Rows2,
  Terminal,
  ZoomIn,
} from 'lucide-react';
import { useState, type CSSProperties } from 'react';
import {
  NASA_GALLERY_SLIDES,
  PARALLAX_SLIDER_PROPS_SPEC,
  type SpaceGalleryPlate,
} from '../../data/terraspanData';
import { ParallaxSlider, type ParallaxSliderOrientation } from './parallax-slider';

const CLI_INSTALL_COMMAND =
  'npx shadcn@latest add "https://www.obsidianui.dev/r/parallax-slider.json"';

const DEPENDENCIES_LIST = ['clsx', 'lucide-react', 'tailwind-merge'];

const USAGE_SNIPPET = `import { ParallaxSlider } from '@/components/obsidian/parallax-slider';

export function NasaPlateStrip() {
  return (
    <ParallaxSlider
      eyebrow="NASA OBSERVATORY"
      title="Calibrated Orbital Plates"
      description="Drag or press arrow keys to drift across plates."
      orientation="portrait"
      parallax={0.2}
      zoom={1}
      slides={[
        {
          title: 'Terra + Suomi NPP Thermal Contour Pass',
          image: '/nasa-gallery/earthrise-orbital-pass.webp',
          focus: '50% 45%',
          href: '#telemetry',
        },
        {
          title: 'NISAR + Sentinel Transmission Phase Swath',
          image: '/nasa-gallery/sar-interferometry-corridor.webp',
          focus: '52% 48%',
          href: '#corridors',
        },
      ]}
    />
  );
}`;

const CSS_OVERRIDE_SNIPPET = `.obsidian-parallax-slider {
  --obsidian-parallax-background: #080c14;
  --obsidian-parallax-foreground: #f3efe6;
  --obsidian-parallax-slide-width: 320px;
  --obsidian-parallax-slide-height: 569px;
  --obsidian-parallax-gap: 32px;
  --obsidian-parallax-radius: 4px;
  --obsidian-parallax-fade: 0px;
}`;

export function FeatureDocsPreview() {
  const [orientation, setOrientation] = useState<ParallaxSliderOrientation>('portrait');
  const [parallaxOn, setParallaxOn] = useState(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showSliderHeading, setShowSliderHeading] = useState(false);
  const [wheelEnabled, setWheelEnabled] = useState(false);
  const [darkBand, setDarkBand] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [activeDocTab, setActiveDocTab] = useState<'code' | 'css' | 'install' | 'props'>('code');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedPlate, setSelectedPlate] = useState<SpaceGalleryPlate>(NASA_GALLERY_SLIDES[0]);

  const effectiveZoom =
    zoomLevel === 1 ? (orientation === 'landscape' ? 1.3 : 1) : zoomLevel;

  const copyText = (key: string, text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey(null), 1600);
  };

  const customBandStyle: CSSProperties = darkBand
    ? ({
        '--obsidian-parallax-background': '#090d16',
        '--obsidian-parallax-foreground': '#f3efe6',
        '--obsidian-parallax-radius': '4px',
        '--obsidian-parallax-gap': '24px',
        '--obsidian-parallax-fade': '0px',
      } as CSSProperties)
    : ({
        '--obsidian-parallax-fade': '16px',
      } as CSSProperties);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--at-border-subtle)] bg-[var(--at-surface-card)] px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <div
            role="group"
            aria-label="Frame orientation"
            className="inline-flex rounded-lg border border-[var(--at-border-subtle)] bg-[var(--at-surface-base)] p-1"
          >
            <button
              type="button"
              onClick={() => setOrientation('portrait')}
              data-testid="parallax-mode-portrait"
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                orientation === 'portrait'
                  ? 'bg-[var(--at-text-primary)] text-[var(--at-surface-base)]'
                  : 'text-[var(--at-text-muted)] hover:text-[var(--at-text-primary)]'
              }`}
            >
              <Rows2 className="size-3.5" />
              Portrait 9:16
            </button>
            <button
              type="button"
              onClick={() => setOrientation('landscape')}
              data-testid="parallax-mode-landscape"
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                orientation === 'landscape'
                  ? 'bg-[var(--at-text-primary)] text-[var(--at-surface-base)]'
                  : 'text-[var(--at-text-muted)] hover:text-[var(--at-text-primary)]'
              }`}
            >
              <Columns2 className="size-3.5" />
              Landscape 16:9
            </button>
          </div>

          <button
            type="button"
            onClick={() => setParallaxOn((prev) => !prev)}
            className="cursor-pointer rounded-lg border border-[var(--at-border-subtle)] px-3 py-1.5 font-mono text-xs text-[var(--at-text-secondary)] hover:border-[var(--at-border-bright)]"
          >
            parallax={parallaxOn ? '0.2' : '0'}
          </button>

          <button
            type="button"
            onClick={() =>
              setZoomLevel((prev) => (prev === 1 ? 1.3 : prev === 1.3 ? 1.55 : 1))
            }
            data-testid="parallax-zoom-btn"
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--at-border-subtle)] px-3 py-1.5 font-mono text-xs text-[var(--at-text-secondary)] hover:border-[var(--at-border-bright)]"
          >
            <ZoomIn className="size-3.5 text-[var(--at-signal-cyan)]" />
            zoom={effectiveZoom}
          </button>

          <button
            type="button"
            onClick={() => setWheelEnabled((prev) => !prev)}
            className="cursor-pointer rounded-lg border border-[var(--at-border-subtle)] px-3 py-1.5 font-mono text-xs text-[var(--at-text-secondary)] hover:border-[var(--at-border-bright)]"
          >
            wheel={wheelEnabled ? 'on' : 'off'}
          </button>

          <button
            type="button"
            onClick={() => setShowSliderHeading((prev) => !prev)}
            data-testid="parallax-heading-toggle"
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--at-border-subtle)] px-3 py-1.5 font-mono text-xs text-[var(--at-text-secondary)] hover:border-[var(--at-border-bright)]"
          >
            <Heading className="size-3.5" />
            header={showSliderHeading ? 'on' : 'off'}
          </button>

          <button
            type="button"
            onClick={() => setDarkBand((prev) => !prev)}
            className="cursor-pointer rounded-lg border border-[var(--at-border-subtle)] px-3 py-1.5 font-mono text-xs text-[var(--at-text-secondary)] hover:border-[var(--at-border-bright)]"
          >
            band={darkBand ? 'ink-plate' : 'inherit'}
          </button>
        </div>

        <button
          type="button"
          onClick={() => setInspectorOpen((prev) => !prev)}
          data-testid="parallax-toggle-inspector"
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--at-border-bright)] bg-[var(--at-surface-elevated)] px-3.5 py-1.5 text-xs font-semibold text-[var(--at-text-primary)] hover:border-[var(--at-border-focus)]"
        >
          <Code2 className="size-3.5" />
          {inspectorOpen ? 'Hide Component Spec' : 'Component Code & Props'}
        </button>
      </div>

      <div
        className="overflow-hidden rounded-2xl border border-[var(--at-border-subtle)] transition-colors"
        style={customBandStyle}
      >
        <ParallaxSlider
          slides={[...NASA_GALLERY_SLIDES]}
          orientation={orientation}
          eyebrow={showSliderHeading ? 'HALFTONE PLATE ARCHIVE' : undefined}
          title={showSliderHeading ? 'NASA Mission & Space Survey' : undefined}
          description={
            showSliderHeading
              ? 'Drag horizontally, scroll, or step with keyboard arrows to inspect sensor plates.'
              : undefined
          }
          parallax={parallaxOn ? 0.2 : 0}
          zoom={effectiveZoom}
          scrollOnWheel={wheelEnabled}
          label="NASA Orbital and Deep Space Survey Plates"
          onSelectSlide={(slide) => {
            const match = NASA_GALLERY_SLIDES.find((p) => p.title === slide.title);
            if (match) setSelectedPlate(match);
          }}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[var(--at-border-subtle)] bg-[var(--at-surface-card)] px-4 py-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded bg-[var(--at-surface-elevated)] px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--at-signal-cyan)]">
            {selectedPlate.missionTag}
          </span>
          <span className="font-semibold text-[var(--at-text-primary)]">{selectedPlate.title}</span>
          <span className="text-[var(--at-text-muted)]">{selectedPlate.telemetryNote}</span>
        </div>
        <span className="font-mono text-[11px] text-[var(--at-text-dim)]">
          {selectedPlate.instrument} · focus {selectedPlate.focus}
        </span>
      </div>

      {inspectorOpen && (
        <div
          data-testid="parallax-spec-drawer"
          className="space-y-4 rounded-2xl border border-[var(--at-border-bright)] bg-[var(--at-surface-card)] p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--at-border-subtle)] pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <Terminal className="size-4 text-[var(--at-signal-cyan)]" />
              <code className="font-mono text-xs text-[var(--at-text-primary)]">
                {CLI_INSTALL_COMMAND}
              </code>
              <button
                type="button"
                onClick={() => copyText('cli', CLI_INSTALL_COMMAND)}
                className="inline-flex cursor-pointer items-center gap-1 rounded border border-[var(--at-border-subtle)] px-2 py-1 text-[11px] text-[var(--at-text-muted)] hover:text-[var(--at-text-primary)]"
              >
                {copiedKey === 'cli' ? <Check className="size-3" /> : <Copy className="size-3" />}
                {copiedKey === 'cli' ? 'Copied' : 'Copy'}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1 rounded-lg border border-[var(--at-border-subtle)] bg-[var(--at-surface-base)] p-1">
              {(
                [
                  ['code', 'Usage TSX'],
                  ['css', 'CSS Vars'],
                  ['install', 'Manual Install'],
                  ['props', 'Props Table'],
                ] as const
              ).map(([tab, title]) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveDocTab(tab)}
                  className={`cursor-pointer rounded-md px-3 py-1 text-xs font-medium ${
                    activeDocTab === tab
                      ? 'bg-[var(--at-surface-elevated)] text-[var(--at-text-primary)]'
                      : 'text-[var(--at-text-muted)]'
                  }`}
                >
                  {title}
                </button>
              ))}
            </div>
          </div>

          {activeDocTab === 'code' && (
            <div className="relative">
              <button
                type="button"
                onClick={() => copyText('usage', USAGE_SNIPPET)}
                className="absolute right-3 top-3 inline-flex cursor-pointer items-center gap-1 rounded border border-[var(--at-border-subtle)] bg-[var(--at-surface-base)] px-2.5 py-1 text-[11px] text-[var(--at-text-muted)]"
              >
                {copiedKey === 'usage' ? <Check className="size-3" /> : <Copy className="size-3" />}
                {copiedKey === 'usage' ? 'Copied' : 'Copy'}
              </button>
              <pre className="overflow-x-auto rounded-xl border border-[var(--at-border-subtle)] bg-[var(--at-surface-base)] p-4 font-mono text-xs leading-relaxed text-[var(--at-text-secondary)]">
                <code>{USAGE_SNIPPET}</code>
              </pre>
            </div>
          )}

          {activeDocTab === 'css' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-[var(--at-text-muted)]">
                <Layers className="size-3.5 text-[var(--at-signal-cyan)]" />
                <span>
                  Override CSS variables directly on <code>.obsidian-parallax-slider</code> or any parent wrapper.
                </span>
              </div>
              <pre className="overflow-x-auto rounded-xl border border-[var(--at-border-subtle)] bg-[var(--at-surface-base)] p-4 font-mono text-xs leading-relaxed text-[var(--at-text-secondary)]">
                <code>{CSS_OVERRIDE_SNIPPET}</code>
              </pre>
            </div>
          )}

          {activeDocTab === 'install' && (
            <div className="space-y-3 rounded-xl border border-[var(--at-border-subtle)] bg-[var(--at-surface-base)] p-4 text-xs text-[var(--at-text-secondary)]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-[var(--at-text-primary)]">
                  Step 1 · Registry Source Files & Dependencies
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {DEPENDENCIES_LIST.map((dep) => (
                    <span
                      key={dep}
                      className="rounded border border-[var(--at-border-subtle)] bg-[var(--at-surface-card)] px-2 py-0.5 font-mono text-[11px] text-[var(--at-signal-cyan)]"
                    >
                      {dep}
                    </span>
                  ))}
                </div>
              </div>
              <p className="leading-relaxed text-[var(--at-text-muted)]">
                Copy <code>src/components/obsidian/parallax-slider.tsx</code> and{' '}
                <code>src/components/obsidian/parallax-slider.css</code> alongside{' '}
                <code>src/lib/utils.ts</code>. Supports keyboard Left/Right navigation, reduced motion mode, pointer momentum inertia, and scrollOnWheel locking.
              </p>
            </div>
          )}

          {activeDocTab === 'props' && (
            <div className="overflow-x-auto rounded-xl border border-[var(--at-border-subtle)]">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[var(--at-border-subtle)] bg-[var(--at-surface-base)] font-mono uppercase tracking-[0.06em] text-[var(--at-text-dim)]">
                  <tr>
                    <th className="px-4 py-2.5">Prop</th>
                    <th className="px-4 py-2.5">Type</th>
                    <th className="px-4 py-2.5">Default</th>
                    <th className="px-4 py-2.5">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--at-border-subtle)]">
                  {PARALLAX_SLIDER_PROPS_SPEC.map((row) => (
                    <tr key={row.prop}>
                      <td className="px-4 py-2.5 font-mono font-semibold text-[var(--at-text-primary)]">
                        {row.prop}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-[var(--at-signal-cyan)]">
                        {row.type}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-[var(--at-text-muted)]">
                        {row.defaultValue}
                      </td>
                      <td className="px-4 py-2.5 text-[var(--at-text-secondary)]">
                        {row.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
