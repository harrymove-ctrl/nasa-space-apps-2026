import React from "react";
import {
  AlertTriangle,
  BatteryCharging,
  Dna,
  Droplets,
  Gauge,
  Radiation,
  Shield,
  Sprout,
  Wind,
} from "lucide-react";
import { OUTPOST_PROFILES } from "../data/nasaSnapshots";
import type {
  DonkiStormEvent,
  HabitatState,
  MissionDrill,
  OsdrStudyRecord,
  OutpostId,
} from "../types/mission";
import { ReactorEngine, type EngineChip, type EngineState } from "./ReactorEngine";

interface HabitatTopologyPanelProps {
  readonly state: HabitatState;
  readonly drill: MissionDrill;
  readonly storm: DonkiStormEvent;
  readonly osdrStudy: OsdrStudyRecord;
  readonly activeChips: readonly EngineChip[];
  readonly graphStale?: boolean;
  readonly mobileVisible?: boolean;
  readonly onChangeOutpost: (outpostId: OutpostId) => void;
}

interface TelemetryBarProps {
  readonly label: string;
  readonly valueText: string;
  readonly pct: number;
  readonly color: string;
  readonly icon: React.ReactNode;
  readonly badge?: string;
}

const TelemetryBar: React.FC<TelemetryBarProps> = ({
  label,
  valueText,
  pct,
  color,
  icon,
  badge,
}) => {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2 text-[11px]">
        <span className="flex min-w-0 items-center gap-1.5 font-medium text-[#d8d6c3]">
          <span className="shrink-0">{icon}</span>
          <span className="truncate">{label}</span>
          {badge ? (
            <span className="mono shrink-0 border border-[rgba(93,255,154,0.45)] bg-[rgba(93,255,154,0.12)] px-1 text-[9px] font-bold text-[#5dff9a]">
              {badge}
            </span>
          ) : null}
        </span>
        <span className="mono shrink-0 font-bold text-[#fafae5]">{valueText}</span>
      </div>
      <div className="h-2 w-full bg-[rgba(250,250,229,0.1)]">
        <div
          className="h-full transition-all duration-300"
          style={{ width: `${clamped}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

export const HabitatTopologyPanel: React.FC<HabitatTopologyPanelProps> = ({
  state,
  drill,
  storm,
  osdrStudy,
  activeChips,
  graphStale = false,
  mobileVisible = false,
  onChangeOutpost,
}) => {
  const outpost = OUTPOST_PROFILES[state.outpostId];
  const progress = Math.min(1, state.elapsedHours / Math.max(1, state.durationHours));

  let engineState: EngineState = "idle";
  if (!graphStale && (state.failureReason || state.cumulativeDoseMsv > drill.maxSafeDoseMsv)) {
    engineState = "error";
  } else if (!graphStale && state.finished && state.grade !== "FAIL") {
    engineState = "done";
  } else if (
    (state.protonFluxPfu >= 50 || state.kpIndex >= 6) &&
    activeChips.length > 0
  ) {
    engineState = "forging";
  } else if (activeChips.length > 0) {
    engineState = "armed";
  }

  const staleCaption = graphStale
    ? activeChips.length > 0
      ? "GRAPH EDITED // RE-RUN"
      : "WIRES CLEARED // RE-RUN"
    : undefined;

  const dosePct = (state.cumulativeDoseMsv / Math.max(1, drill.maxSafeDoseMsv)) * 100;
  const doseColor =
    dosePct > 100 ? "#ff3b30" : dosePct > 75 ? "#fbbf24" : "#5dff9a";
  const o2PctNormalized = ((state.o2Pct - 16) / 6.5) * 100;
  const o2Color =
    state.o2Pct < drill.minSafeO2Pct
      ? "#ff3b30"
      : state.o2Pct < 20.0
        ? "#fbbf24"
        : "#1abc9c";

  // Build SVG Sparkline coordinates for incoming storm wave
  const curvePoints = drill.timelineCurve
    .map((val, idx) => {
      const x = (idx / Math.max(1, drill.timelineCurve.length - 1)) * 280;
      const y = 52 - val * 44;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const cursorX = progress * 280;

  return (
    <aside
      className={`${
        mobileVisible ? "flex" : "hidden lg:flex"
      } hud-panel h-full w-full min-w-0 flex-col space-y-3 overflow-y-auto p-3 lg:w-[280px] lg:shrink-0 xl:w-[348px]`}
      aria-label="CradleOS Outpost HUD"
    >
      {/* Outpost Header & Selector */}
      <div className="border-b border-[rgba(255,71,0,0.28)] pb-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="hud-panel-title text-[10px] tracking-[0.04em] xl:text-[11px] xl:tracking-[0.1em]">
            CRADLEOS // HABITAT HUD
          </span>
          <span className="mono shrink-0 whitespace-nowrap text-[10px] font-bold text-[#5dff9a]">
            SCORE {state.missionScore} ({state.grade})
          </span>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-1.5">
          {(["lunar-south", "mars-jezero"] as const).map((id) => {
            const p = OUTPOST_PROFILES[id];
            const selected = state.outpostId === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onChangeOutpost(id)}
                className={`border px-2 py-1.5 text-left transition ${
                  selected
                    ? "border-[#ff4700] bg-[rgba(255,71,0,0.16)]"
                    : "border-[rgba(250,250,229,0.16)] bg-[rgba(250,250,229,0.02)] hover:border-[rgba(250,250,229,0.35)]"
                }`}
              >
                <div className="mono text-[10px] font-bold text-[#ff4700]">
                  {id === "lunar-south" ? "MOON // 0.17G" : "MARS // 0.38G"}
                </div>
                <div className="truncate text-[11px] font-semibold text-[#fafae5]">
                  {p.name}
                </div>
              </button>
            );
          })}
        </div>

        <p className="mt-1.5 text-[11px] leading-snug text-[#9b9987]">
          {outpost.locationLabel} ({outpost.atmosphericShieldingGcm2} g/cm2 atm)
        </p>
      </div>

      {/* Reactor Shielding Ring Engine */}
      <div className="flex flex-col items-center border border-[rgba(255,71,0,0.22)] bg-[rgba(0,0,0,0.35)] py-3 px-2">
        <ReactorEngine
          state={engineState}
          chips={activeChips}
          size={138}
          corePctLabel={`${state.shieldingGcm2.toFixed(0)}g`}
          statusCaption={staleCaption}
        />
        <div className="mt-2 grid w-full grid-cols-3 gap-1.5 border-t border-[rgba(250,250,229,0.1)] pt-2 text-center">
          <div>
            <div className="mono text-[9px] text-[#8d8b7a]">SHIELDING</div>
            <div className="mono text-xs font-bold text-[#fafae5]">
              {state.shieldingGcm2} g/cm2
            </div>
          </div>
          <div>
            <div className="mono text-[9px] text-[#8d8b7a]">PROTON FLUX</div>
            <div className="mono text-xs font-bold text-[#ff4700]">
              {state.protonFluxPfu} pfu
            </div>
          </div>
          <div>
            <div className="mono text-[9px] text-[#8d8b7a]">KP INDEX</div>
            <div className="mono text-xs font-bold text-[#fbbf24]">
              Kp {state.kpIndex}
            </div>
          </div>
        </div>
      </div>

      {/* Life Support & Shield Bars */}
      <div className="space-y-2.5 border border-[rgba(250,250,229,0.12)] bg-[rgba(250,250,229,0.02)] p-2.5">
        <TelemetryBar
          label="Cumulative Crew Dose"
          valueText={`${state.cumulativeDoseMsv.toFixed(2)} / ${drill.maxSafeDoseMsv} mSv`}
          pct={dosePct}
          color={doseColor}
          icon={<Radiation size={13} className="text-[#ff4700]" />}
          badge={state.stormShelterSealed ? "SHELTERED" : undefined}
        />

        <TelemetryBar
          label={`OSDR Bio-Stress (${osdrStudy.osdId})`}
          valueText={`${state.bioStressIndex.toFixed(1)}%`}
          pct={state.bioStressIndex}
          color={state.bioStressIndex > 65 ? "#ff3b30" : "#c084fc"}
          icon={<Dna size={13} className="text-[#c084fc]" />}
          badge={state.bioCountermeasureActive ? "BIO-RX ON" : undefined}
        />

        <TelemetryBar
          label="Cabin O2 Partial"
          valueText={`${state.o2Pct.toFixed(2)}%`}
          pct={o2PctNormalized}
          color={o2Color}
          icon={<Wind size={13} className="text-[#1abc9c]" />}
          badge={state.scrubberBoostActive ? "BOOST" : undefined}
        />

        <TelemetryBar
          label="Water Closed Loop"
          valueText={`${state.waterPct.toFixed(1)}%`}
          pct={state.waterPct}
          color="#54a0ff"
          icon={<Droplets size={13} className="text-[#54a0ff]" />}
          badge={state.waterShieldingActive ? "WALL FILL" : undefined}
        />

        <TelemetryBar
          label={`Battery SOC (${state.powerNetKw >= 0 ? "+" : ""}${state.powerNetKw} kW)`}
          valueText={`${state.batteryPct.toFixed(1)}%`}
          pct={state.batteryPct}
          color={state.batteryPct < 25 ? "#ff3b30" : "#fbbf24"}
          icon={<BatteryCharging size={13} className="text-[#fbbf24]" />}
        />

        <TelemetryBar
          label="Hydroponics Crop Bay"
          valueText={`${state.hydroponicsYieldPct.toFixed(0)}%`}
          pct={state.hydroponicsYieldPct}
          color={state.hydroponicsMode === "OPTIMAL" ? "#5dff9a" : "#fbbf24"}
          icon={<Sprout size={13} className="text-[#5dff9a]" />}
          badge={state.hydroponicsMode}
        />
      </div>

      {/* DONKI Storm Timeline Sparkline */}
      <div className="border border-[rgba(250,250,229,0.12)] bg-[rgba(0,0,0,0.4)] p-2.5">
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="mono flex min-w-0 items-center gap-1.5 text-[10px] font-bold uppercase text-[#ff4700]">
            <Gauge size={12} className="shrink-0" />
            <span className="truncate">
              STORM ({storm.category} // {storm.xrayClass})
            </span>
          </span>
          <span className="mono shrink-0 whitespace-nowrap text-[10px] text-[#fafae5]">
            T+{state.elapsedHours.toFixed(1)} / {state.durationHours}h
          </span>
        </div>
        <svg
          viewBox="0 0 280 56"
          className="h-14 w-full overflow-visible bg-[rgba(255,71,0,0.05)]"
          aria-label="Storm intensity timeline"
        >
          <polyline
            fill="none"
            stroke="#ff4700"
            strokeWidth="2"
            points={curvePoints}
          />
          <line
            x1={cursorX}
            y1={0}
            x2={cursorX}
            y2={56}
            stroke="#5dff9a"
            strokeWidth="1.5"
            strokeDasharray="3 2"
          />
          <circle cx={cursorX} cy={52 - state.solarFlareScale * 44} r="3.5" fill="#5dff9a" />
        </svg>
        <div className="mt-1 flex justify-between text-[10px] text-[#9b9987]">
          <span>Ext: {state.externalDoseRateMsvHr.toFixed(2)} mSv/h</span>
          <span>Cab: {state.internalDoseRateMsvHr.toFixed(3)} mSv/h</span>
          <span>Sup: {state.powerSupplyKw} kW</span>
        </div>
      </div>

      {/* Active Alerts & Console Log */}
      <div className="space-y-1.5 border border-[rgba(250,250,229,0.12)] bg-[rgba(5,3,2,0.85)] p-2.5">
        <div className="mono flex items-center gap-1.5 text-[10px] font-bold uppercase text-[#ff4700]">
          <Shield size={12} />
          CRADLEOS MISSION FEED
        </div>
        {state.alerts.map((alert, i) => (
          <div
            key={i}
            className="mono flex items-start gap-1.5 border-l-2 border-[#ff4700] bg-[rgba(255,71,0,0.08)] px-2 py-1 text-[10px] text-[#fafae5]"
          >
            <AlertTriangle size={11} className="mt-0.5 shrink-0 text-[#ff4700]" />
            <span>{alert}</span>
          </div>
        ))}
        <div className="max-h-28 space-y-1 overflow-y-auto pt-1">
          {state.actionLog.map((entry, idx) => (
            <div
              key={idx}
              className="mono text-[10px] leading-tight text-[#8d8b7a]"
            >
              {entry}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
