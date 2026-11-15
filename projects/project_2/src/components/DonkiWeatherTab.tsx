import React from "react";
import {
  Activity,
  ExternalLink,
  Play,
  Radiation,
  RefreshCw,
  Satellite,
} from "lucide-react";
import type { DonkiStormEvent, TelemetryProvenance } from "../types/mission";

interface DonkiWeatherTabProps {
  readonly events: readonly DonkiStormEvent[];
  readonly activeStormId: string;
  readonly provenance: TelemetryProvenance;
  readonly syncing: boolean;
  readonly onRefreshTelemetry: (includeDonkiApi: boolean) => void;
  readonly onInjectStorm: (stormId: string) => void;
}

export const DonkiWeatherTab: React.FC<DonkiWeatherTabProps> = ({
  events,
  activeStormId,
  provenance,
  syncing,
  onRefreshTelemetry,
  onInjectStorm,
}) => {
  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto p-3 sm:gap-4 sm:p-4">
      <div className="hud-panel flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4">
        <div className="min-w-0 space-y-1">
          <div className="hud-panel-title flex items-center gap-2">
            <Satellite size={14} className="shrink-0" />
            <span>NASA DONKI & NOAA SWPC SPACE WEATHER ARCHIVE</span>
          </div>
          <p className="max-w-3xl text-xs text-[#c7c5b2]">
            Select any verified NASA DONKI geomagnetic storm (GST), coronal mass ejection (CME), or live GOES-18 X-ray/proton observation below and inject its real physical intensity directly into the Junior Astronaut simulator.
          </p>
          <div className="mono break-words text-[11px] text-[#9b9987]">
            PROVENANCE: <span className="text-[#5dff9a]">{provenance.source}</span> | GOES-18 &gt;=10 MeV: {provenance.goesProton10Mev} pfu | X-RAY: {provenance.goesXrayClass} | Kp: {provenance.swpcKp}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="hud-btn"
            disabled={syncing}
            onClick={() => onRefreshTelemetry(false)}
          >
            <RefreshCw size={13} className={syncing ? "animate-spin" : ""} />
            Sync Keyless NOAA + OSDR
          </button>
          <button
            type="button"
            className="hud-btn hud-btn--primary"
            disabled={syncing}
            onClick={() => onRefreshTelemetry(true)}
          >
            <Activity size={13} />
            Pull Live NASA DONKI CME
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {events.map((ev) => {
          const isSelected = ev.id === activeStormId;
          return (
            <article
              key={ev.id}
              className={`hud-panel flex flex-col justify-between p-4 ${
                isSelected ? "border-[#5dff9a]" : ""
              }`}
            >
              <div>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-1.5">
                  <span className="mono border border-[#ee6b47] bg-[rgba(238,107,71,0.14)] px-2 py-0.5 text-[10px] font-bold text-[#ee6b47]">
                    {ev.category} // {ev.xrayClass}
                  </span>
                  <span className="mono text-[10px] text-[#94a3b8]">
                    {ev.startTime.slice(0, 16)}Z
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[#f3efe6]">{ev.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[#cbd5e1]">
                  {ev.summary}
                </p>

                <div className="mt-3 grid grid-cols-3 gap-2 border-y border-dashed border-[rgba(148,163,184,0.18)] py-2">
                  <div>
                    <div className="mono text-[9px] text-[#94a3b8]">PEAK PROTON</div>
                    <div className="mono text-xs font-bold text-[#ee6b47]">
                      {ev.protonFluxPfu} pfu
                    </div>
                  </div>
                  <div>
                    <div className="mono text-[9px] text-[#94a3b8]">KP INDEX</div>
                    <div className="mono text-xs font-bold text-[#fbbf24]">
                      Kp {ev.kpIndex}
                    </div>
                  </div>
                  <div>
                    <div className="mono text-[9px] text-[#94a3b8]">CME SPEED</div>
                    <div className="mono text-xs font-bold text-[#f3efe6]">
                      {ev.speedKmS} km/s
                    </div>
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap gap-1">
                  {ev.linkedInstruments.map((inst) => (
                    <span
                      key={inst}
                      className="mono border border-[rgba(250,250,229,0.16)] px-1.5 py-0.5 text-[9.5px] text-[#9b9987]"
                    >
                      {inst}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-2">
                <a
                  href={ev.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mono inline-flex items-center gap-1 text-[10px] text-[#54a0ff] hover:underline"
                >
                  NASA Record <ExternalLink size={11} />
                </a>

                <button
                  type="button"
                  onClick={() => onInjectStorm(ev.id)}
                  className={`hud-btn ${
                    isSelected ? "hud-btn--good" : "hud-btn--primary"
                  }`}
                >
                  {isSelected ? <Radiation size={12} /> : <Play size={12} />}
                  {isSelected ? "Active in Trainer" : "Inject Storm"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
