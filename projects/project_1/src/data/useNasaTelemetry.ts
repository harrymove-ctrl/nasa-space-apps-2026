import { useCallback, useEffect, useRef, useState } from 'react';
import {
  fetchLiveAsfSar,
  fetchLiveFirmsHotspots,
  getInitialFirmsSnapshot,
  getInitialSarSnapshot,
  type AsfSarBundle,
  type FirmsBundle,
} from './nasaExtendedClient';
import {
  CORRIDOR_PRESETS,
  fetchCorridorPower,
  fetchLiveNasaBundle,
  getInitialTelemetryBundle,
  type NasaTelemetryBundle,
} from './nasaLiveClient';

export function useNasaTelemetry() {
  const [bundle, setBundle] = useState<NasaTelemetryBundle>(() => getInitialTelemetryBundle());
  const [selectedCorridorId, setSelectedCorridorId] = useState<string>(CORRIDOR_PRESETS[0].id);
  const selectedCorridorRef = useRef<string>(CORRIDOR_PRESETS[0].id);
  selectedCorridorRef.current = selectedCorridorId;
  const [firms, setFirms] = useState<FirmsBundle>(() => getInitialFirmsSnapshot(CORRIDOR_PRESETS[0]));
  const [sar, setSar] = useState<AsfSarBundle>(() => getInitialSarSnapshot(CORRIDOR_PRESETS[0]));
  const [syncing, setSyncing] = useState(false);
  const [lastSyncMs, setLastSyncMs] = useState<number>(0);
  const [syncCount, setSyncCount] = useState<number>(0);

  const activeCorridor =
    CORRIDOR_PRESETS.find((c) => c.id === selectedCorridorId) ?? CORRIDOR_PRESETS[0];

  const syncCorridorLayers = useCallback(async (corridorId: string) => {
    const preset = CORRIDOR_PRESETS.find((c) => c.id === corridorId) ?? CORRIDOR_PRESETS[0];
    const [nextFirms, nextSar] = await Promise.all([
      fetchLiveFirmsHotspots(preset),
      fetchLiveAsfSar(preset),
    ]);
    setFirms(nextFirms);
    setSar(nextSar);
  }, []);

  const refresh = useCallback(async () => {
    const started = typeof performance !== 'undefined' ? performance.now() : Date.now();
    setSyncing(true);
    try {
      const [nextBundle] = await Promise.all([
        fetchLiveNasaBundle(),
        syncCorridorLayers(selectedCorridorRef.current),
      ]);
      setBundle(nextBundle);
      const elapsed = Math.round(
        (typeof performance !== 'undefined' ? performance.now() : Date.now()) - started
      );
      setLastSyncMs(elapsed);
      setSyncCount((c) => c + 1);
    } catch {
      // Keep verified baseline snapshot when offline
    } finally {
      setSyncing(false);
    }
  }, [syncCorridorLayers]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const selectCorridor = useCallback(
    async (corridorId: string) => {
      setSelectedCorridorId(corridorId);
      const preset = CORRIDOR_PRESETS.find((c) => c.id === corridorId);
      if (!preset) return;
      setFirms(getInitialFirmsSnapshot(preset));
      setSar(getInitialSarSnapshot(preset));
      try {
        const [{ reading }] = await Promise.all([
          fetchCorridorPower(preset),
          syncCorridorLayers(corridorId),
        ]);
        setBundle((prev) => ({
          ...prev,
          powerByCorridor: {
            ...prev.powerByCorridor,
            [corridorId]: reading,
          },
        }));
      } catch {
        // Keep verified fallback reading for the chosen corridor
      }
    },
    [syncCorridorLayers]
  );

  return {
    bundle,
    firms,
    sar,
    activeCorridor,
    selectedCorridorId,
    syncing,
    lastSyncMs,
    syncCount,
    refresh,
    selectCorridor,
  };
}
