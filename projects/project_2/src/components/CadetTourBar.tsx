import React, { useState } from "react";
import { ArrowLeft, ArrowRight, Compass, Radiation, X } from "lucide-react";

type TrainerTab = "trainer" | "donki" | "osdr";

interface CadetTourStep {
  code: string;
  title: string;
  summary: string;
  tab: TrainerTab;
}

const CADET_TOUR_STEPS: readonly CadetTourStep[] = [
  {
    code: "01 / Select Storm & Outpost",
    title: "Choose Drill Scenario and Lunar or Mars Habitat",
    summary:
      "Use the header Drill selector and Moon / Mars outpost toggle in the Habitat HUD to configure baseline shielding and storm flux.",
    tab: "trainer",
  },
  {
    code: "02 / Wire Sensor-to-Shield Logic",
    title: "Connect DONKI Flux and OSDR Monitors to Actuators",
    summary:
      "Load or wire [DONKI Proton Flux] into Threshold Gate and [NASA OSDR Bio Monitor] to trigger [Seal Storm Shelter], [Water-Wall Shield], and [OSDR Bio-Countermeasure].",
    tab: "trainer",
  },
  {
    code: "03 / Run 24h Storm & Inspect Dose",
    title: "Step Simulation Across 24 Hours",
    summary:
      "Click Run Drill or +0.5h in the transport bar to monitor cumulative crew dose in mSv, Reactor Engine chip status, and final cadet grade.",
    tab: "trainer",
  },
  {
    code: "04 / Live DONKI & OSDR Bio-Lab",
    title: "Query NASA OSDR Studies & Complete Bio Check",
    summary:
      "Search live NASA OSDR radiobiology studies here, bind any study profile to your bio monitor block, or inspect recent NASA DONKI CME storms.",
    tab: "osdr",
  },
];

interface CadetTourBarProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onSetTab: (tab: TrainerTab) => void;
}

export const CadetTourBar: React.FC<CadetTourBarProps> = ({
  open,
  onClose,
  onSetTab,
}) => {
  const [stepIndex, setStepIndex] = useState(0);

  if (!open) return null;

  const step = CADET_TOUR_STEPS[stepIndex];
  const isLast = stepIndex === CADET_TOUR_STEPS.length - 1;

  const goToStep = (nextIndex: number) => {
    const clamped = Math.max(0, Math.min(CADET_TOUR_STEPS.length - 1, nextIndex));
    setStepIndex(clamped);
    onSetTab(CADET_TOUR_STEPS[clamped].tab);
  };

  return (
    <div
      data-testid="cadet-tour-bar"
      role="region"
      aria-label="CradleFlow Guided Cadet Tour"
      className="border-b border-dashed border-[#45b8d6] bg-[#0c111d] px-3 py-2 text-[#f3efe6] lg:px-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="mono flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
            <span className="inline-flex items-center gap-1 text-[#45b8d6]">
              <Compass size={12} />
              {step.code}
            </span>
            <span className="text-[#ee6b47]">{step.title}</span>
          </div>
          <p className="text-[11px] leading-snug text-[#cbd5e1]">{step.summary}</p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-1.5">
          {isLast ? (
            <button
              type="button"
              onClick={() => onSetTab("donki")}
              className="hud-btn border-[#ee6b47] text-[#ee6b47] px-2 py-1 text-[10px]"
            >
              <Radiation size={12} />
              Open DONKI Storms
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => goToStep(stepIndex - 1)}
            disabled={stepIndex === 0}
            className="hud-btn px-2 py-1 text-[10px] disabled:opacity-40"
          >
            <ArrowLeft size={12} />
            Prev
          </button>
          <button
            type="button"
            data-testid="cadet-tour-next"
            onClick={() => {
              if (isLast) onClose();
              else goToStep(stepIndex + 1);
            }}
            className="hud-btn border-[#38bdf8] bg-[rgba(56,189,248,0.16)] text-[#38bdf8] px-2.5 py-1 text-[10px]"
          >
            {isLast ? "Finish" : "Next"}
            {!isLast ? <ArrowRight size={12} /> : null}
          </button>
          <button
            type="button"
            data-testid="cadet-tour-close"
            onClick={onClose}
            aria-label="Close cadet tour"
            className="hud-btn px-1.5 py-1 text-[10px]"
          >
            <X size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};
