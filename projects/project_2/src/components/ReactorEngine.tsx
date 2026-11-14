import React, { useMemo } from "react";

export type EngineState = "idle" | "armed" | "forging" | "done" | "error";

export interface EngineChip {
  readonly id: string;
  readonly category: string;
  readonly label: string;
  readonly color: string;
}

interface ReactorEngineProps {
  readonly state: EngineState;
  readonly chips?: readonly EngineChip[];
  readonly size?: number;
  readonly corePctLabel?: string;
  readonly statusCaption?: string;
  readonly className?: string;
}

const TICK_COUNT = 24;

export const ReactorEngine: React.FC<ReactorEngineProps> = ({
  state,
  chips = [],
  size = 136,
  corePctLabel = "0 g",
  statusCaption,
  className = "",
}) => {
  const radius = size / 2;

  const chipPositions = useMemo(() => {
    const orbitRadius = radius - 6;
    const capped = chips.slice(0, 10);
    return capped.map((chip, idx) => {
      const angle = (idx / Math.max(1, capped.length)) * Math.PI * 2 - Math.PI / 2;
      return {
        chip,
        left: radius + Math.cos(angle) * orbitRadius,
        top: radius + Math.sin(angle) * orbitRadius,
      };
    });
  }, [chips, radius]);

  const caption =
    statusCaption ??
    (state === "error"
      ? "SHIELD BREACH"
      : state === "forging"
        ? "STORM DEFLECTION ACTIVE"
        : state === "done"
          ? "MISSION CERTIFIED"
          : state === "armed"
            ? `${chips.length} PROTOCOL CHIPS ARMED`
            : "NO CHIPS WIRED");

  return (
    <div
      className={`engine engine--${state} ${className}`}
      style={{ ["--ring-radius" as string]: `${radius}px` }}
      aria-label={`Reactor Shield Core: ${caption}`}
    >
      <div
        className="engine__rings"
        style={{ width: size, height: size }}
      >
        <div className="engine__outerRing" />
        <div className="engine__midRing" />
        <div className="engine__innerRing" />

        <div className="engine__ticks">
          {Array.from({ length: TICK_COUNT }).map((_, i) => (
            <span
              key={i}
              className="engine__tick"
              style={{
                transform: `rotate(${(i * 360) / TICK_COUNT}deg)`,
              }}
            />
          ))}
        </div>

        <div className="engine__core">
          <span className="engine__corePct">{corePctLabel}</span>
        </div>

        <div className="engine__chipNodes">
          {chipPositions.map(({ chip, left, top }) => (
            <div
              key={chip.id}
              className="engine__chipNode"
              style={{
                left,
                top,
                ["--chip-color" as string]: chip.color,
              }}
              title={`${chip.category}: ${chip.label}`}
            >
              <div className="engine__chipDot" />
              <span className="engine__chipLabel">{chip.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="engine__stateLabel">{caption}</div>
    </div>
  );
};
