import { useEffect, useState } from 'react';
import { EarthriseBackground, type LiveAsciiPiece } from './components/EarthriseBackground';
import { HeroSection } from './components/HeroSection';
import { KnowledgeMapBox } from './components/KnowledgeMapBox';
import { MinimalLandingSections } from './components/MinimalLandingSections';
import { MissionGameBox } from './components/MissionGameBox';
import { Navbar } from './components/Navbar';
import { PreloaderOverlay } from './components/PreloaderOverlay';
import { ProductTourOverlay } from './components/ProductTourOverlay';
import { SubmissionStudio, type StudioMode } from './components/SubmissionStudio';
import { useNasaTelemetry } from './data/useNasaTelemetry';

type ViewMode = 'landing' | 'map' | 'game';
type MissionStage = 'triage' | 'cradleflow';

function parseStudioRoute(): { mode: StudioMode; plateIndex: number; slideIndex: number } | null {
  if (typeof window === 'undefined') return null;
  const { pathname, search } = window.location;
  const params = new URLSearchParams(search);
  const rawSlide = Number(params.get('slide') || '1');
  const slideIndex = Number.isFinite(rawSlide) && rawSlide >= 1 && rawSlide <= 7 ? rawSlide : 1;
  const present = params.get('present');
  if (present === 'plate' || present === 'deck' || present === 'video' || present === 'slides') {
    const rawPlate = Number(params.get('plate') || '1');
    const plateIndex = Number.isFinite(rawPlate) && rawPlate >= 1 && rawPlate <= 5 ? rawPlate : 1;
    return { mode: present, plateIndex, slideIndex };
  }
  if (pathname.startsWith('/submission') || params.get('view') === 'showcase') {
    return { mode: 'showcase', plateIndex: 1, slideIndex };
  }
  return null;
}

function StudioShell({
  mode,
  plateIndex,
  slideIndex,
}: {
  mode: StudioMode;
  plateIndex: number;
  slideIndex: number;
}) {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return <SubmissionStudio mode={mode} plateIndex={plateIndex} initialSlide={slideIndex} />;
}

function parseUrlFlags() {
  if (typeof window === 'undefined') {
    return {
      skipPreloader: false,
      holdMode: false,
      initialView: 'landing' as ViewMode,
      initialStage: 'triage' as MissionStage,
      initialTour: false,
      debug: false,
      theme: null as 'light' | 'dark' | null,
    };
  }
  const params = new URLSearchParams(window.location.search);
  const viewParam = params.get('view');
  const initialView: ViewMode =
    viewParam === 'map' ? 'map' : viewParam === 'game' ? 'game' : 'landing';
  const initialStage: MissionStage =
    params.get('stage') === 'cradleflow' ? 'cradleflow' : 'triage';
  const themeParam = params.get('theme');
  const theme: 'light' | 'dark' | null =
    themeParam === 'light' ? 'light' : themeParam === 'dark' ? 'dark' : null;
  const initialTour = params.get('tour') === '1';

  return {
    skipPreloader: params.get('skipPreloader') === '1' || initialView !== 'landing' || initialTour,
    holdMode: params.get('hold') === '1',
    initialView,
    initialStage,
    initialTour,
    debug: params.get('debug') === '1',
    theme,
  };
}

function ObservatoryApp() {
  const [flags] = useState(parseUrlFlags);
  const [showPreloader, setShowPreloader] = useState(!flags.skipPreloader);
  const [view, setView] = useState<ViewMode>(flags.initialView);
  const [missionStage, setMissionStage] = useState<MissionStage>(flags.initialStage);
  const [tourOpen, setTourOpen] = useState(flags.initialTour);
  const [stressLongValues, setStressLongValues] = useState(false);
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (flags.theme === 'light') return false;
    if (flags.theme === 'dark') return true;
    if (typeof document === 'undefined') return true;
    return document.documentElement.classList.contains('dark');
  });

  const {
    bundle,
    firms,
    sar,
    activeCorridor,
    selectedCorridorId,
    syncing,
    lastSyncMs,
    refresh,
    selectCorridor,
  } = useNasaTelemetry();

  const activeBgPiece: LiveAsciiPiece =
    view === 'map'
      ? 'radar'
      : view === 'game'
        ? missionStage === 'cradleflow'
          ? 'solar-system'
          : 'aurora'
        : 'earthrise';

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) root.classList.add('dark');
    else root.classList.remove('dark');
  }, [isDark]);

  const switchView = (nextView: ViewMode, stage: MissionStage = 'triage') => {
    setView(nextView);
    if (nextView === 'game') {
      setMissionStage(stage);
    }
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (nextView === 'landing') {
        url.searchParams.delete('view');
        url.searchParams.delete('stage');
      } else {
        url.searchParams.set('view', nextView);
        if (nextView === 'game' && stage === 'cradleflow') {
          url.searchParams.set('stage', 'cradleflow');
        } else {
          url.searchParams.delete('stage');
        }
        url.hash = '';
      }
      window.history.replaceState({}, '', url.toString());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNavigateSection = (hash: string) => {
    const targetId = hash.replace(/^#/, '');
    const nextHash = targetId && targetId !== 'top' ? `#${targetId}` : '';
    const applyScroll = () => {
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('view');
        url.searchParams.delete('stage');
        url.hash = nextHash;
        window.history.replaceState({}, '', url.toString());
      }
      if (!targetId || targetId === 'top') window.scrollTo({ top: 0, behavior: 'smooth' });
      else document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
    };
    if (view !== 'landing') {
      setView('landing');
      window.setTimeout(applyScroll, 75);
      return;
    }
    applyScroll();
  };

  return (
    <div className="relative isolate flex min-h-screen flex-col">
      <EarthriseBackground isDark={isDark} piece={activeBgPiece} />

      {showPreloader && (
        <PreloaderOverlay
          holdMode={flags.holdMode}
          onComplete={() => setShowPreloader(false)}
        />
      )}

      <Navbar
        view={view}
        isDark={isDark}
        liveSourceCount={bundle.liveSourceCount}
        totalSourceCount={bundle.totalSourceCount}
        syncing={syncing}
        onRefreshTelemetry={() => {
          void refresh();
        }}
        onToggleTheme={() => setIsDark((prev) => !prev)}
        onToggleView={() => switchView(view === 'landing' ? 'map' : 'landing')}
        onOpenMissionGame={() => switchView('game')}
        onStartTour={() => setTourOpen(true)}
        onNavigateSection={handleNavigateSection}
      />

      <main className={`relative z-10 flex flex-1 flex-col ${tourOpen ? 'pb-52' : ''}`}>
        {view === 'landing' ? (
          <>
            <HeroSection
              bundle={bundle}
              activeCorridor={activeCorridor}
              onOpenKnowledgeMap={() => switchView('map')}
              onOpenMissionGame={() => switchView('game')}
            />
            <MinimalLandingSections
              bundle={bundle}
              firms={firms}
              sar={sar}
              activeCorridor={activeCorridor}
              selectedCorridorId={selectedCorridorId}
              onSelectCorridor={(id) => {
                void selectCorridor(id);
              }}
              syncing={syncing}
              lastSyncMs={lastSyncMs}
              onRefreshTelemetry={() => {
                void refresh();
              }}
              onOpenKnowledgeMap={() => switchView('map')}
              onOpenMissionGame={() => switchView('game', 'triage')}
              onOpenCradleFlow={() => switchView('game', 'cradleflow')}
              onStartTour={() => setTourOpen(true)}
              stressLongValues={stressLongValues}
            />
          </>
        ) : view === 'map' ? (
          <div className="lp-container py-10">
            <KnowledgeMapBox
              bundle={bundle}
              firms={firms}
              sar={sar}
              activeCorridor={activeCorridor}
              selectedCorridorId={selectedCorridorId}
              onSelectCorridor={(id) => {
                void selectCorridor(id);
              }}
              syncing={syncing}
              lastSyncMs={lastSyncMs}
              onRefreshTelemetry={() => {
                void refresh();
              }}
              onBack={() => switchView('landing')}
              stressLongValues={stressLongValues}
            />
          </div>
        ) : (
          <div className="lp-container py-10">
            <MissionGameBox
              bundle={bundle}
              firms={firms}
              sar={sar}
              activeCorridor={activeCorridor}
              selectedCorridorId={selectedCorridorId}
              onSelectCorridor={(id) => {
                void selectCorridor(id);
              }}
              syncing={syncing}
              lastSyncMs={lastSyncMs}
              onRefreshTelemetry={() => {
                void refresh();
              }}
              stage={missionStage}
              onStageChange={(nextStage) => switchView('game', nextStage)}
              onBack={() => switchView('landing')}
              onOpenKnowledgeMap={() => switchView('map')}
              stressLongValues={stressLongValues}
            />
          </div>
        )}
      </main>

      <ProductTourOverlay
        open={tourOpen}
        onClose={() => setTourOpen(false)}
        onSwitchView={switchView}
        onNavigateSection={handleNavigateSection}
        onOpenCradleFlow={() => switchView('game', 'cradleflow')}
      />

      {flags.debug && (
        <div
          className="fixed bottom-3 right-3 z-50 flex flex-wrap items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px]"
          style={{
            borderColor: 'var(--at-border-bright)',
            background: 'var(--at-surface-floating)',
            color: 'var(--at-text-primary)',
          }}
        >
          <span className="font-mono uppercase text-[var(--at-action-active-text)]">QA</span>
          <button
            type="button"
            onClick={() => switchView('landing')}
            className="cursor-pointer rounded border px-1.5 py-0.5"
            style={{ borderColor: 'var(--at-border-subtle)' }}
          >
            Landing
          </button>
          <button
            type="button"
            onClick={() => switchView('map')}
            className="cursor-pointer rounded border px-1.5 py-0.5"
            style={{ borderColor: 'var(--at-border-subtle)' }}
          >
            Map
          </button>
          <button
            type="button"
            onClick={() => switchView('game')}
            className="cursor-pointer rounded border px-1.5 py-0.5"
            style={{ borderColor: 'var(--at-border-subtle)' }}
          >
            Game
          </button>
          <button
            type="button"
            onClick={() => setStressLongValues((prev) => !prev)}
            className="cursor-pointer rounded border px-1.5 py-0.5"
            style={{ borderColor: 'var(--at-border-subtle)' }}
          >
            {stressLongValues ? 'Normal Text' : 'Stress Text'}
          </button>
          <button
            type="button"
            onClick={() => setShowPreloader(true)}
            className="cursor-pointer rounded border px-1.5 py-0.5"
            style={{ borderColor: 'var(--at-border-subtle)' }}
          >
            Preloader
          </button>
        </div>
      )}
    </div>
  );
}

export function App() {
  const [studioRoute] = useState(parseStudioRoute);
  if (studioRoute) {
    return (
      <StudioShell
        mode={studioRoute.mode}
        plateIndex={studioRoute.plateIndex}
        slideIndex={studioRoute.slideIndex}
      />
    );
  }
  return <ObservatoryApp />;
}

export default App;
