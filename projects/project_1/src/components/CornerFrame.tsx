import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CornerMarkersProps {
  size?: number;
  offset?: number;
  width?: number;
}

export function CornerMarkers({ size, offset, width = 1 }: CornerMarkersProps) {
  const baseStyle: CSSProperties = {
    width: size ? `${size}px` : 'var(--andromeda-marker-size, 12px)',
    height: size ? `${size}px` : 'var(--andromeda-marker-size, 12px)',
    borderStyle: 'solid',
    borderColor: 'var(--at-border-bright)',
    borderWidth: 0,
  };
  const off = offset !== undefined ? `${offset}px` : 'var(--andromeda-marker-offset, 0px)';
  const r = 'var(--andromeda-radius-frame, 4px)';

  return (
    <div aria-hidden="true" className="contents">
      <span
        className="absolute pointer-events-none z-10"
        style={{
          ...baseStyle,
          borderTopWidth: `${width}px`,
          borderLeftWidth: `${width}px`,
          borderTopLeftRadius: r,
          top: off,
          left: off,
        }}
      />
      <span
        className="absolute pointer-events-none z-10"
        style={{
          ...baseStyle,
          borderTopWidth: `${width}px`,
          borderRightWidth: `${width}px`,
          borderTopRightRadius: r,
          top: off,
          right: off,
        }}
      />
      <span
        className="absolute pointer-events-none z-10"
        style={{
          ...baseStyle,
          borderBottomWidth: `${width}px`,
          borderLeftWidth: `${width}px`,
          borderBottomLeftRadius: r,
          bottom: off,
          left: off,
        }}
      />
      <span
        className="absolute pointer-events-none z-10"
        style={{
          ...baseStyle,
          borderBottomWidth: `${width}px`,
          borderRightWidth: `${width}px`,
          borderBottomRightRadius: r,
          bottom: off,
          right: off,
        }}
      />
    </div>
  );
}

interface CornerCardProps {
  children: ReactNode;
  className?: string;
  markerSize?: number;
  markerOffset?: number;
  style?: CSSProperties;
}

export function CornerCard({ children, className, markerSize = 14, markerOffset = 0, style }: CornerCardProps) {
  return (
    <div className={cn('lp-card relative', className)} style={style}>
      <CornerMarkers size={markerSize} offset={markerOffset} />
      {children}
    </div>
  );
}

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: 'left' | 'split';
  action?: ReactNode;
}

export function SectionHeading({ eyebrow, title, description, align = 'split', action }: SectionHeadingProps) {
  return (
    <header className="andromeda-section-heading" data-align={align}>
      <div className="flex flex-col gap-3 min-w-0">
        <span className="andromeda-section-heading-eyebrow">{eyebrow}</span>
        <h2 className="andromeda-section-heading-title">{title}</h2>
      </div>
      {(description || action) && (
        <div className="flex flex-col items-start gap-5 min-w-0">
          {description && <p className="andromeda-section-heading-description">{description}</p>}
          {action}
        </div>
      )}
    </header>
  );
}
