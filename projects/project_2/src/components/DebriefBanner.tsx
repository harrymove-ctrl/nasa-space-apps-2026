import React from "react";
import { Award, RotateCcw, ShieldAlert, X } from "lucide-react";
import type { HabitatState, MissionDrill } from "../types/mission";

interface DebriefBannerProps {
  readonly open: boolean;
  readonly state: HabitatState;
  readonly drill: MissionDrill;
  readonly onClose: () => void;
  readonly onReset: () => void;
  readonly onNextDrill: () => void;
}

export const DebriefBanner: React.FC<DebriefBannerProps> = ({
  open,
  state,
  drill,
  onClose,
  onReset,
  onNextDrill,
}) => {
  if (!open) return null;
  const passed = state.grade !== "FAIL" && !state.failureReason;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Junior Astronaut Mission Debrief"
      onClick={onClose}
    >
      <div
        className="hud-panel max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-y-auto p-4 sm:p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2 border-b border-[rgba(255,71,0,0.3)] pb-3">
          <div className="flex min-w-0 items-center gap-2.5">
            {passed ? (
              <Award size={26} className="shrink-0 text-[#5dff9a]" />
            ) : (
              <ShieldAlert size={26} className="shrink-0 text-[#ff3b30]" />
            )}
            <div className="min-w-0">
              <div className="hud-panel-title">
                CRADLEFLOW // JUNIOR ASTRONAUT MISSION DEBRIEF
              </div>
              <h2 className="text-base font-bold text-[#fafae5] sm:text-lg">
                {state.failureReason
                  ? `MISSION FAILED // ${drill.title}`
                  : !state.finished
                    ? `DRILL IN PROGRESS (T+${state.elapsedHours.toFixed(1)}/${drill.durationHours}h) // PROJECTED ${state.grade}`
                    : passed
                      ? `CERTIFIED GRADE ${state.grade} // ${drill.title}`
                      : `MISSION FAILED // ${drill.title}`}
              </h2>
            </div>
          </div>

          <button type="button" className="hud-btn shrink-0" onClick={onClose} aria-label="Close debrief">
            <X size={14} />
          </button>
        </div>

        {state.failureReason ? (
          <div className="mt-3 border border-[#ff3b30] bg-[rgba(255,59,48,0.14)] p-3 text-xs text-[#ffb4ae]">
            <span className="mono font-bold text-[#ff3b30]">ROOT CAUSE: </span>
            {state.failureReason}
          </div>
        ) : !state.finished ? (
          <div className="mt-3 border border-[rgba(255,71,0,0.45)] bg-[rgba(255,71,0,0.1)] p-3 text-xs text-[#f6e8df]">
            Drill is at T+{state.elapsedHours.toFixed(1)}h of the {drill.durationHours}-hour storm window. Run the drill to T+{drill.durationHours}.0h for final mission certification.
          </div>
        ) : (
          <div className="mt-3 border border-[#5dff9a] bg-[rgba(93,255,154,0.1)] p-3 text-xs text-[#d6f9e3]">
            Your Frontier Flow logic maintained safe crew dose, cabin oxygen, closed-loop water, and NASA OSDR biological stability across the entire {drill.durationHours}-hour storm window.
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          <div className="border border-[rgba(250,250,229,0.14)] bg-[rgba(0,0,0,0.45)] p-2.5">
            <div className="mono text-[10px] text-[#8d8b7a]">FINAL SCORE</div>
            <div className="mono text-lg font-bold text-[#fafae5]">
              {state.missionScore} / 100
            </div>
          </div>
          <div className="border border-[rgba(250,250,229,0.14)] bg-[rgba(0,0,0,0.45)] p-2.5">
            <div className="mono text-[10px] text-[#8d8b7a]">CREW DOSE</div>
            <div className="mono text-lg font-bold text-[#ff4700]">
              {state.cumulativeDoseMsv.toFixed(2)} mSv
            </div>
          </div>
          <div className="border border-[rgba(250,250,229,0.14)] bg-[rgba(0,0,0,0.45)] p-2.5">
            <div className="mono text-[10px] text-[#8d8b7a]">CABIN O2</div>
            <div className="mono text-lg font-bold text-[#1abc9c]">
              {state.o2Pct.toFixed(1)}%
            </div>
          </div>
          <div className="border border-[rgba(250,250,229,0.14)] bg-[rgba(0,0,0,0.45)] p-2.5">
            <div className="mono text-[10px] text-[#8d8b7a]">OSDR BIO-STRESS</div>
            <div className="mono text-lg font-bold text-[#38bdf8]">
              {state.bioStressIndex.toFixed(1)}%
            </div>
          </div>
          <div className="border border-[rgba(250,250,229,0.14)] bg-[rgba(0,0,0,0.45)] p-2.5">
            <div className="mono text-[10px] text-[#8d8b7a]">HYDROPONICS</div>
            <div className="mono text-lg font-bold text-[#5dff9a]">
              {state.hydroponicsYieldPct.toFixed(0)}%
            </div>
          </div>
          <div className="border border-[rgba(250,250,229,0.14)] bg-[rgba(0,0,0,0.45)] p-2.5">
            <div className="mono text-[10px] text-[#8d8b7a]">WATER RESERVE</div>
            <div className="mono text-lg font-bold text-[#54a0ff]">
              {state.waterPct.toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button type="button" className="hud-btn" onClick={onReset}>
            <RotateCcw size={13} />
            Re-Run Drill
          </button>
          <button
            type="button"
            className="hud-btn hud-btn--primary"
            onClick={onNextDrill}
          >
            Load Next Mission Drill
          </button>
        </div>
      </div>
    </div>
  );
};
