import { useCallback, useEffect, useState } from 'react';
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
  const [syncing, setSyncing] = useState(false);

  const refresh = useCallback(async () => {
    setSyncing(true);
    try {
      const next = await fetchLiveNasaBundle();
      setBundle(next);
    } catch {
      // Keep verified baseline snapshot when offline
    } finally {
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const selectCorridor = useCallback(
    async (corridorId: string) => {
      setSelectedCorridorId(corridorId);
      const preset = CORRIDOR_PRESETS.find((c) => c.id === corridorId);
      if (!preset) return;
      try {
        const { reading } = await fetchCorridorPower(preset);
        setBundle((prev) => ({
          ...prev,
          powerByCorridor: {
            ...prev.powerByCorridor,
            [corridorId]: reading,
          },
        }));
      } catch {
        // Keep verified fallback POWER reading for the chosen corridor
      }
    },
    []
  );

  const activeCorridor =
    CORRIDOR_PRESETS.find((c) => c.id === selectedCorridorId) ?? CORRIDOR_PRESETS[0];

  return {
    bundle,
    activeCorridor,
    selectedCorridorId,
    syncing,
    refresh,
    selectCorridor,
  };
}
