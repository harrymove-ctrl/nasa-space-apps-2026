import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';

export interface SplitShowcaseItem {
  id?: string;
  title?: React.ReactNode;
  tag?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  href?: string;
  target?: string;
  rel?: string;
  className?: string;
  onClick?: () => void;
  ariaLabel?: string;
}

export interface SplitShowcaseProps {
  items: [SplitShowcaseItem, SplitShowcaseItem];
  className?: string;
  compact?: boolean;
}

export function SplitShowcase({ items, className, compact = false }: SplitShowcaseProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const reduceMotion = useReducedMotion();

  const activeIndex = hoveredIndex ?? focusedIndex;
  const isAnyActive = activeIndex !== null;
  const [leftItem, rightItem] = items;

  const getSpringProps = (index: number) => {
    const isActive = activeIndex === index;
    const shift = index === 0 ? -12 : 12;
    if (reduceMotion) return {};
    return {
      animate: {
        x: isActive ? shift : 0,
        scale: isActive ? 0.985 : 1,
      },
      transition: {
        type: 'spring' as const,
        stiffness: 350,
        damping: 24,
      },
    };
  };

  const renderCardContent = (item: SplitShowcaseItem) => (
    <>
      <div className={cn('flex flex-col items-center justify-center text-center', compact ? 'gap-2' : 'gap-3')}>
        {item.icon && <div className="shrink-0">{item.icon}</div>}
        {item.title}
        {item.description && (
          <p className={cn('text-[var(--at-text-muted)]', compact ? 'max-w-xs text-xs' : 'max-w-sm text-sm leading-relaxed')}>
            {item.description}
          </p>
        )}
      </div>
      {item.tag && (
        <span
          className={cn(
            'relative font-mono font-semibold uppercase text-[var(--at-text-dim)]',
            compact ? 'top-0 text-[10px] tracking-[0.12em]' : 'top-1 text-[11px] tracking-[0.16em]'
          )}
        >
          {item.tag}
        </span>
      )}
    </>
  );

  return (
    <div className={cn('relative grid w-full grid-cols-1 gap-0 overflow-visible sm:grid-cols-2', className)}>
      <div className="relative min-w-0">
        <motion.div
          {...getSpringProps(0)}
          className={cn(
            'flex h-full select-none flex-col items-center justify-center text-[var(--at-text-primary)] no-underline',
            compact ? 'min-h-[8rem] gap-3 p-5' : 'min-h-[13.5rem] gap-5 p-7 sm:p-9',
            'bg-[var(--at-surface-card)] transition-[border-radius,box-shadow,border-color] duration-300',
            activeIndex === 0
              ? 'z-10 rounded-[28px] border border-[var(--at-border-bright)] shadow-2xl shadow-black/20'
              : 'rounded-t-[28px] rounded-b-none border border-[var(--at-border-subtle)] border-b-0 sm:rounded-l-[28px] sm:rounded-r-none sm:border-r-0 sm:border-b',
            leftItem.className
          )}
          onMouseEnter={() => setHoveredIndex(0)}
          onMouseLeave={() => setHoveredIndex(null)}
          onFocus={() => setFocusedIndex(0)}
          onBlur={() => setFocusedIndex(null)}
        >
          {leftItem.href ? (
            <a
              href={leftItem.href}
              target={leftItem.target}
              rel={leftItem.rel}
              aria-label={leftItem.ariaLabel}
              className="flex h-full w-full flex-col items-center justify-center gap-4 focus-visible:outline-none"
              onClick={leftItem.onClick}
            >
              {renderCardContent(leftItem)}
            </a>
          ) : leftItem.onClick ? (
            <button
              type="button"
              aria-label={leftItem.ariaLabel}
              className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-4 focus-visible:outline-none"
              onClick={leftItem.onClick}
            >
              {renderCardContent(leftItem)}
            </button>
          ) : (
            renderCardContent(leftItem)
          )}
        </motion.div>
      </div>

      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute left-1/2 z-10 hidden w-0 -translate-x-1/2 border-l-2 border-dotted border-[var(--at-border-bright)] transition-opacity duration-200 sm:block',
          compact ? 'inset-y-4' : 'inset-y-8',
          isAnyActive ? 'opacity-0' : 'opacity-100'
        )}
      />
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute top-1/2 z-10 block h-0 -translate-y-1/2 border-t-2 border-dotted border-[var(--at-border-bright)] transition-opacity duration-200 sm:hidden',
          compact ? 'inset-x-4' : 'inset-x-8',
          isAnyActive ? 'opacity-0' : 'opacity-100'
        )}
      />

      <div className="relative min-w-0">
        <motion.div
          {...getSpringProps(1)}
          className={cn(
            'flex h-full select-none flex-col items-center justify-center text-[var(--at-text-primary)] no-underline',
            compact ? 'min-h-[8rem] gap-3 p-5' : 'min-h-[13.5rem] gap-5 p-7 sm:p-9',
            'bg-[var(--at-surface-card)] transition-[border-radius,box-shadow,border-color] duration-300',
            activeIndex === 1
              ? 'z-10 rounded-[28px] border border-[var(--at-border-bright)] shadow-2xl shadow-black/20'
              : 'rounded-b-[28px] rounded-t-none border border-[var(--at-border-subtle)] border-t-0 sm:rounded-r-[28px] sm:rounded-l-none sm:border-l-0 sm:border-t',
            rightItem.className
          )}
          onMouseEnter={() => setHoveredIndex(1)}
          onMouseLeave={() => setHoveredIndex(null)}
          onFocus={() => setFocusedIndex(1)}
          onBlur={() => setFocusedIndex(null)}
        >
          {rightItem.href ? (
            <a
              href={rightItem.href}
              target={rightItem.target}
              rel={rightItem.rel}
              aria-label={rightItem.ariaLabel}
              className="flex h-full w-full flex-col items-center justify-center gap-4 focus-visible:outline-none"
              onClick={rightItem.onClick}
            >
              {renderCardContent(rightItem)}
            </a>
          ) : rightItem.onClick ? (
            <button
              type="button"
              aria-label={rightItem.ariaLabel}
              className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-4 focus-visible:outline-none"
              onClick={rightItem.onClick}
            >
              {renderCardContent(rightItem)}
            </button>
          ) : (
            renderCardContent(rightItem)
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default SplitShowcase;
