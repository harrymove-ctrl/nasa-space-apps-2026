import { ArrowRight } from 'lucide-react';
import type { MouseEventHandler } from 'react';
import { cn } from '@/lib/utils';
import './discover-button.css';

export interface DiscoverButtonProps {
  label?: string;
  href?: string;
  onClick?: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
  className?: string;
}

export function DiscoverButton({
  label = 'Inspect Live Twin',
  href,
  onClick,
  className,
}: DiscoverButtonProps) {
  const buttonFace = (
    <>
      <span className="obsidian-discover-button__fill" aria-hidden="true" />
      <span className="obsidian-discover-button__icon" aria-hidden="true">
        <ArrowRight size={19} strokeWidth={2.2} />
      </span>
      <span className="obsidian-discover-button__text">{label}</span>
    </>
  );

  if (href) {
    return (
      <a
        className={cn('obsidian-discover-button', className)}
        href={href}
        onClick={onClick as MouseEventHandler<HTMLAnchorElement>}
      >
        {buttonFace}
      </a>
    );
  }

  return (
    <button
      className={cn('obsidian-discover-button', className)}
      type="button"
      onClick={onClick as MouseEventHandler<HTMLButtonElement>}
    >
      {buttonFace}
    </button>
  );
}

export default DiscoverButton;
