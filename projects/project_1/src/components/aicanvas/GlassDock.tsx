import { Flame, Mountain, Orbit, Radio, Waves } from 'lucide-react';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react';
import { useRef, useState } from 'react';
import type { CorridorPreset } from '../../data/nasaLiveClient';

const ICON_BY_INDEX = [Flame, Waves, Mountain, Radio, Orbit] as const;

function DockCorridorButton({
  preset,
  index,
  active,
  mouseX,
  onSelect,
}: {
  preset: CorridorPreset;
  index: number;
  active: boolean;
  mouseX: MotionValue<number>;
  onSelect: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [hovered, setHovered] = useState(false);
  const reduce = useReducedMotion();

  const distance = useTransform(mouseX, (val) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect || val === Infinity) return 180;
    return val - (rect.left + rect.width / 2);
  });

  const widthRaw = useTransform(distance, [-140, 0, 140], [48, 66, 48]);
  const width = useSpring(widthRaw, { stiffness: 320, damping: 24, mass: 0.45 });
  const Icon = ICON_BY_INDEX[index % ICON_BY_INDEX.length];

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      data-testid={`dock-corridor-${preset.id}`}
      aria-label={`Select corridor ${preset.label}`}
      aria-pressed={active}
      style={reduce ? undefined : { width }}
      className={`relative flex h-12 shrink-0 cursor-pointer items-center justify-center rounded-xl border transition-colors ${
        active
          ? 'border-[var(--at-signal-fire)] bg-[var(--at-signal-fire)]/18 text-[var(--at-text-primary)]'
          : 'border-[var(--at-border-subtle)] bg-[var(--at-surface-elevated)]/80 text-[var(--at-text-muted)] hover:border-[var(--at-border-bright)] hover:text-[var(--at-text-primary)]'
      }`}
    >
      <Icon className="size-4.5" />
      <AnimatePresence>
        {(hovered || active) && (
          <motion.span
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 2 }}
            transition={{ duration: 0.14 }}
            className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-[var(--at-border-bright)] bg-[var(--at-surface-elevated)] px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.06em] text-[var(--at-text-primary)] shadow-md"
          >
            {preset.label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

export function GlassDock({
  presets,
  selectedId,
  onSelect,
}: {
  presets: readonly CorridorPreset[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const mouseX = useMotionValue(Infinity);

  return (
    <div
      onMouseMove={(e) => mouseX.set(e.clientX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      role="toolbar"
      aria-label="Corridor selector dock"
      className="inline-flex max-w-full flex-wrap items-center gap-2.5 rounded-2xl border border-[var(--at-border-bright)] bg-[var(--at-surface-card)]/90 px-3 py-2.5 backdrop-blur-md"
    >
      {presets.map((preset, index) => (
        <DockCorridorButton
          key={preset.id}
          preset={preset}
          index={index}
          active={preset.id === selectedId}
          mouseX={mouseX}
          onSelect={() => onSelect(preset.id)}
        />
      ))}
    </div>
  );
}

export default GlassDock;
