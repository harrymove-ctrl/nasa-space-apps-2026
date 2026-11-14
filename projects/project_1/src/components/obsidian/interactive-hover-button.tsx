import { ArrowRight } from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';

export function InteractiveHoverButton({
  children,
  className,
  href,
  target,
  rel,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string;
  target?: string;
  rel?: string;
}) {
  const body = (
    <>
      <div className="flex items-center gap-2.5">
        <div className="h-2 w-2 rounded-full bg-[var(--at-signal-fire)] transition-all duration-300 group-hover:scale-[100]" />
        <span className="inline-block transition-all duration-300 group-hover:translate-x-10 group-hover:opacity-0">
          {children}
        </span>
      </div>
      <div className="absolute inset-0 z-10 flex translate-x-10 items-center justify-center gap-2 text-[#f7f4ec] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
        <span>{children}</span>
        <ArrowRight className="size-4" />
      </div>
    </>
  );

  const classes = cn(
    'group relative inline-flex w-auto cursor-pointer items-center justify-center overflow-hidden rounded-full border border-[var(--at-border-bright)] bg-[var(--at-surface-card)] px-6 py-3 text-center text-sm font-semibold text-[var(--at-text-primary)]',
    className
  );

  if (href) {
    return (
      <a href={href} target={target} rel={rel} className={classes}>
        {body}
      </a>
    );
  }

  return (
    <button type="button" className={classes} {...props}>
      {body}
    </button>
  );
}

export default InteractiveHoverButton;
