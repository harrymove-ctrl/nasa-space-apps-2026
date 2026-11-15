import { useEffect, useState } from 'react';
import { EarthriseBackground } from './components/EarthriseBackground';
import { HeroSection } from './components/HeroSection';
import { KnowledgeMapBox } from './components/KnowledgeMapBox';
import { MinimalLandingSections } from './components/MinimalLandingSections';
import { MissionGameBox } from './components/MissionGameBox';
import { Navbar } from './components/Navbar';
import { PreloaderOverlay } from './components/PreloaderOverlay';
import { ProductTourOverlay } from './components/ProductTourOverlay';
import { useNasaTelemetry } from './data/useNasaTelemetry';

type ViewMode = 'landing' | 'map' | 'game';
type MissionStage = 'triage' | 'cradleflow';

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

export function App() {
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
    activeCorridor,
    selectedCorridorId,
    syncing,
    refresh,
    selectCorridor,
  } = useNasaTelemetry();

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
      <EarthriseBackground isDark={isDark} />

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

      <main className="relative z-10 flex flex-1 flex-col">
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
              activeCorridor={activeCorridor}
              selectedCorridorId={selectedCorridorId}
              onSelectCorridor={(id) => {
                void selectCorridor(id);
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
              onBack={() => switchView('landing')}
              stressLongValues={stressLongValues}
            />
          </div>
        ) : (
          <div className="lp-container py-10">
            <MissionGameBox
              bundle={bundle}
              activeCorridor={activeCorridor}
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

export default App;
