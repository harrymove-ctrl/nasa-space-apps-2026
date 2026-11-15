import { ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import { NASA_GALLERY_SLIDES, type SpaceGalleryPlate } from '../../data/terraspanData';
import { ParallaxSlider } from './parallax-slider';

export function FeatureDocsPreview() {
  const [selectedPlate, setSelectedPlate] = useState<SpaceGalleryPlate>(NASA_GALLERY_SLIDES[0]);

  return (
    <div className="space-y-4">
      <div
        data-testid="active-plate-telemetry"
        className="flex flex-col justify-between gap-3 rounded-xl border border-[var(--at-border-subtle)] bg-[var(--at-surface-card)] px-4 py-3 text-xs sm:flex-row sm:items-center"
      >
        <div className="min-w-0 space-y-0.5">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--at-signal-cyan)]">
            <span>{selectedPlate.missionTag}</span>
            <span className="text-[var(--at-text-dim)]">{selectedPlate.instrument}</span>
          </div>
          <div className="text-sm font-medium text-[var(--at-text-primary)]">
            {selectedPlate.title}
          </div>
          <p className="text-xs text-[var(--at-text-muted)]">
            {selectedPlate.telemetryNote}
          </p>
        </div>

        {selectedPlate.href ? (
          <a
            href={selectedPlate.href}
            className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg border border-[var(--at-border-base)] bg-[var(--at-surface-base)] px-3 py-1.5 font-mono text-[11px] font-medium text-[var(--at-text-primary)] transition-colors hover:border-[var(--at-border-focus)] sm:self-center"
          >
            Inspect Sector
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </a>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--at-border-subtle)] bg-[var(--at-surface-card)] py-5">
        <ParallaxSlider
          slides={[...NASA_GALLERY_SLIDES]}
          orientation="landscape"
          parallax={0.2}
          zoom={1.22}
          scrollOnWheel={false}
          showCaptions={false}
          label="NASA Orbital and Deep Space Survey Plates"
          onSelectSlide={(slide) => {
            const matched = NASA_GALLERY_SLIDES.find((item) => item.title === slide.title);
            if (matched) setSelectedPlate(matched);
          }}
        />
      </div>
    </div>
  );
}
