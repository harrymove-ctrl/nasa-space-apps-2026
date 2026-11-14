import { Menu, Moon, RefreshCw, Sun, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface NavbarProps {
  view: 'landing' | 'map' | 'game';
  isDark: boolean;
  liveSourceCount: number;
  totalSourceCount: number;
  syncing: boolean;
  onRefreshTelemetry: () => void;
  onToggleTheme: () => void;
  onToggleView: () => void;
  onOpenMissionGame: () => void;
  onNavigateSection: (hash: string) => void;
}

const NAV_LINKS = [
  { label: 'Plates', href: '#gallery' },
  { label: 'Telemetry', href: '#telemetry' },
  { label: 'Map', href: '#corridors' },
  { label: 'Trainer', href: '#trainer' },
] as const;

export function Navbar({
  view,
  isDark,
  liveSourceCount,
  totalSourceCount,
  syncing,
  onRefreshTelemetry,
  onToggleTheme,
  onToggleView,
  onOpenMissionGame,
  onNavigateSection,
}: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const mobileActionsRef = useRef<HTMLLIElement>(null);
  const isWideRef = useRef(true);
  const lastWidthRef = useRef(0);

  useEffect(() => {
    const headerEl = headerRef.current;
    const rowEl = rowRef.current;
    const menuEl = menuRef.current;
    const mobileActionsEl = mobileActionsRef.current;
    if (!headerEl || !rowEl || !menuEl) return;

    let rafId = 0;

    const syncLayout = (width: number) => {
      const wasOpen = (() => {
        try {
          return menuEl.matches(':popover-open');
        } catch {
          return false;
        }
      })();
      if (wasOpen && 'hidePopover' in menuEl) {
        (menuEl as HTMLUListElement & { hidePopover: () => void }).hidePopover();
      }
      headerEl.classList.add('is-measuring');
      headerEl.classList.remove('is-wide');
      menuEl.removeAttribute('popover');
      if (mobileActionsEl) mobileActionsEl.setAttribute('hidden', '');

      const fits = rowEl.scrollWidth <= rowEl.clientWidth;

      headerEl.classList.remove('is-measuring');
      if (fits) {
        headerEl.classList.add('is-wide');
        menuEl.removeAttribute('popover');
        if (mobileActionsEl) mobileActionsEl.setAttribute('hidden', '');
      } else {
        headerEl.classList.remove('is-wide');
        menuEl.setAttribute('popover', 'auto');
        if (mobileActionsEl) mobileActionsEl.removeAttribute('hidden');
      }
      isWideRef.current = fits;
      lastWidthRef.current = width;
    };

    syncLayout(headerEl.clientWidth);

    const observer = new ResizeObserver((entries) => {
      const width = Math.round(entries[0]?.contentRect.width ?? headerEl.clientWidth);
      if (width === lastWidthRef.current) return;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => syncLayout(width));
    });
    observer.observe(headerEl);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => syncLayout(headerEl.clientWidth)).catch(() => {});
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const el = menuRef.current;
    if (!el) return;
    const handleToggle = (ev: Event) => {
      const toggleEvent = ev as ToggleEvent;
      setMenuOpen(toggleEvent.newState === 'open');
    };
    el.addEventListener('toggle', handleToggle);
    return () => el.removeEventListener('toggle', handleToggle);
  }, []);

  const closePopoverIfOpen = () => {
    const el = menuRef.current as (HTMLUListElement & { hidePopover?: () => void }) | null;
    if (el && el.hasAttribute('popover')) {
      try {
        if (el.matches(':popover-open')) el.hidePopover?.();
      } catch {
        el.hidePopover?.();
      }
    }
  };

  const viewCtaLabel = view === 'landing' ? 'Full Map' : 'Overview';

  return (
    <header ref={headerRef} className="andromeda-navbar is-wide">
      <div className="lp-container andromeda-navbar-container">
        <div ref={rowRef} className="andromeda-navbar-row">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              closePopoverIfOpen();
              onNavigateSection('#top');
            }}
            className="andromeda-navbar-brand lp-brand flex items-center gap-2.5 text-[15px] font-semibold tracking-tight"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeOpacity="0.4" />
              <circle cx="12" cy="12" r="4" stroke="var(--at-signal-cyan)" strokeWidth="1.5" />
              <circle cx="16.5" cy="7.5" r="2" fill="var(--at-signal-fire)" />
            </svg>
            <span>TERRASPAN</span>
          </a>

          <ul id="terraspan-nav-menu" ref={menuRef} className="site-nav mobile-nav-popover">
            {NAV_LINKS.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    closePopoverIfOpen();
                    onNavigateSection(item.href);
                  }}
                  className="nav-link inline-flex items-center px-3 py-1.5 text-[13px] font-medium transition-colors"
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li ref={mobileActionsRef} hidden className="mobile-nav-actions">
              <button
                type="button"
                onClick={() => {
                  closePopoverIfOpen();
                  onToggleView();
                }}
                className="lp-btn lp-btn--outline w-full justify-center"
              >
                {viewCtaLabel}
              </button>
              <button
                type="button"
                onClick={() => {
                  closePopoverIfOpen();
                  onOpenMissionGame();
                }}
                className="lp-btn lp-btn--primary w-full justify-center"
              >
                Mission Drill
              </button>
            </li>
          </ul>

          <div className="andromeda-navbar-actions flex items-center gap-2.5">
            <button
              type="button"
              onClick={onRefreshTelemetry}
              aria-label="Refresh NASA telemetry feeds"
              title="Refresh NASA telemetry feeds"
              className="hidden h-9 items-center gap-2 rounded-lg border border-[var(--at-border-subtle)] px-2.5 font-mono text-[11px] text-[var(--at-text-muted)] transition-colors hover:border-[var(--at-border-bright)] hover:text-[var(--at-text-primary)] sm:inline-flex cursor-pointer"
            >
              <RefreshCw className={`size-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>
                {liveSourceCount}/{totalSourceCount} NASA Live
              </span>
            </button>

            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
              data-testid="theme-toggle"
              className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-[var(--at-border-subtle)] transition-colors hover:border-[var(--at-border-bright)]"
              style={{
                background: 'var(--at-surface-raised)',
                color: 'var(--at-text-primary)',
              }}
            >
              {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>

            <button
              type="button"
              onClick={onToggleView}
              className="lp-btn lp-btn--outline nav-desktop-only"
              data-testid="nav-toggle-view"
            >
              {viewCtaLabel}
            </button>

            <button
              type="button"
              popoverTarget="terraspan-nav-menu"
              aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={menuOpen}
              className="nav-menu-trigger inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-[var(--at-border-subtle)]"
              style={{
                background: 'var(--at-surface-raised)',
                color: 'var(--at-text-primary)',
              }}
            >
              {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
