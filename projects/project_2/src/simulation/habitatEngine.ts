import {
  MISSION_DRILLS,
  OUTPOST_PROFILES,
  VERIFIED_DONKI_EVENTS,
  VERIFIED_OSDR_STUDIES,
} from "../data/nasaSnapshots";
import type { FlowEdge, FlowNode } from "../types/flow";
import type {
  DonkiStormEvent,
  HabitatState,
  MissionDrill,
  MissionGrade,
  OsdrStudyRecord,
  OutpostId,
} from "../types/mission";
import { evaluateFlowGraph, type EvaluatedFlowBundle } from "./flowEvaluator";

export interface StepResult {
  readonly nextState: HabitatState;
  readonly flowEvaluation: EvaluatedFlowBundle;
}

const BATTERY_CAPACITY_KWH = 52;

export function interpolateStormIntensity(
  curve: readonly number[],
  progressFraction: number
): number {
  if (curve.length === 0) return 0.1;
  const clamped = Math.max(0, Math.min(1, progressFraction));
  const scaled = clamped * (curve.length - 1);
  const low = Math.floor(scaled);
  const high = Math.min(curve.length - 1, low + 1);
  const t = scaled - low;
  return curve[low] * (1 - t) + curve[high] * t;
}

export function createInitialHabitatState(
  drillId: string,
  outpostOverride?: OutpostId
): HabitatState {
  const drill =
    MISSION_DRILLS.find((d) => d.id === drillId) ?? MISSION_DRILLS[0];
  const outpostId = outpostOverride ?? drill.defaultOutpost;
  const outpost = OUTPOST_PROFILES[outpostId];
  const baseShielding = 12 + outpost.atmosphericShieldingGcm2;
  const initialSupply = Number(
    (outpost.solarPeakKw * outpost.dustAttenuationBaseline * 0.92).toFixed(2)
  );
  const initialDemand = Number(outpost.basePowerDemandKw.toFixed(2));

  return {
    elapsedHours: 0,
    durationHours: drill.durationHours,
    outpostId,
    drillId: drill.id,
    running: false,
    finished: false,
    o2Pct: 20.8,
    waterPct: 92.0,
    batteryPct: 86.0,
    powerSupplyKw: initialSupply,
    powerDemandKw: initialDemand,
    powerNetKw: Number((initialSupply - initialDemand).toFixed(2)),
    shieldingGcm2: baseShielding,
    stormShelterSealed: false,
    scrubberBoostActive: false,
    hydroponicsMode: "OPTIMAL",
    hydroponicsYieldPct: 56.0,
    bioCountermeasureActive: false,
    waterShieldingActive: false,
    protonFluxPfu: 1.4,
    kpIndex: 1.5,
    solarFlareScale: 0.1,
    externalDoseRateMsvHr: 0.08,
    internalDoseRateMsvHr: 0.05,
    cumulativeDoseMsv: 0.0,
    bioStressIndex: 6.0,
    alerts: ["HABITAT NOMINAL // WIRE FLOW AUTOMATION & PRESS RUN"],
    actionLog: [
      `T+00.0h // Outpost ${outpost.name} initialized (${drill.title}).`,
    ],
    missionScore: 100,
    grade: "S",
    failureReason: null,
  };
}

export function computeMissionGrade(score: number, failed: boolean): MissionGrade {
  if (failed || score < 55) return "FAIL";
  if (score >= 90) return "S";
  if (score >= 80) return "A";
  if (score >= 68) return "B";
  return "C";
}

export function stepHabitatSimulation(
  prev: HabitatState,
  drill: MissionDrill,
  storm: DonkiStormEvent,
  osdrStudy: OsdrStudyRecord,
  nodes: readonly FlowNode[],
  edges: readonly FlowEdge[],
  dtHours = 0.5
): StepResult {
  const nextElapsed = Math.min(
    drill.durationHours,
    Number((prev.elapsedHours + dtHours).toFixed(2))
  );
  const outpost = OUTPOST_PROFILES[prev.outpostId];
  const progress = nextElapsed / Math.max(1, drill.durationHours);
  const intensity = interpolateStormIntensity(drill.timelineCurve, progress);

  const effectivePeakFlux = Math.max(storm.protonFluxPfu, drill.gustPeakPfu ?? 0);
  const protonFluxPfu = Number(
    Math.max(0.24, effectivePeakFlux * intensity + 1.2).toFixed(1)
  );
  const kpIndex = Number(
    Math.min(9.0, Math.max(1.0, 1.2 + (storm.kpIndex - 1.2) * intensity)).toFixed(2)
  );

  const flowEvaluation = evaluateFlowGraph(nodes, edges, {
    protonFluxPfu,
    kpIndex,
    o2Pct: prev.o2Pct,
    batteryPct: prev.batteryPct,
    bioStressIndex: prev.bioStressIndex,
    activeOsdId: osdrStudy.osdId,
  });

  const { commands, shelterShieldGainGcm2, coilPowerKw } = flowEvaluation;

  // Power calculations (Mars dust + Lunar CME safe-mode solar derating)
  const stormDustPenalty =
    outpost.id === "mars-jezero"
      ? Math.max(0.54, outpost.dustAttenuationBaseline - intensity * 0.26)
      : Math.max(0.58, 1.0 - intensity * 0.38);
  const solarSupplyKw = Number(
    (outpost.solarPeakKw * stormDustPenalty).toFixed(2)
  );

  const baseDemand = outpost.basePowerDemandKw;
  const hydroSavings = commands.shedHydroponicsLoad ? 4.2 : 0;
  const shelterDraw = commands.sealStormShelter ? 2.2 : 0;
  const scrubberDraw = commands.boostO2Scrubber ? 1.8 : 0;
  const coilDraw = commands.divertPowerToShielding ? coilPowerKw : 0;
  const bioDraw = commands.activateBioCountermeasure ? 0.9 : 0;

  const totalDemandKw = Number(
    Math.max(
      2.5,
      baseDemand - hydroSavings + shelterDraw + scrubberDraw + coilDraw + bioDraw
    ).toFixed(2)
  );
  const netKw = Number((solarSupplyKw - totalDemandKw).toFixed(2));
  const nextBatteryPct = Number(
    Math.max(
      0,
      Math.min(
        100,
        prev.batteryPct + ((netKw * dtHours) / BATTERY_CAPACITY_KWH) * 100
      )
    ).toFixed(2)
  );
  const brownout = nextBatteryPct <= 1.0 && netKw < 0;

  const effectiveShelter = commands.sealStormShelter && !brownout;
  const effectiveCoil = commands.divertPowerToShielding && !brownout;
  const effectiveScrubberBoost = commands.boostO2Scrubber && !brownout;
  const effectiveWaterShield = commands.flushWaterShieldWall && prev.waterPct > 12;
  const effectiveBioRx = commands.activateBioCountermeasure && !brownout;

  const totalShielding = Number(
    (
      12 +
      outpost.atmosphericShieldingGcm2 +
      (effectiveShelter ? shelterShieldGainGcm2 : 0) +
      (effectiveWaterShield ? 28 : 0) +
      (effectiveCoil ? 24 : 0)
    ).toFixed(1)
  );

  // Radiation dose rate calculation grounded in storm doseRateMsvHr + shielding column density
  const effectiveDosePeak = Math.max(
    storm.doseRateMsvHr,
    drill.gustDoseRateMsvHr ?? 0
  );
  const externalDoseRate = Number(
    (
      (outpost.id === "lunar-south" ? 0.06 : 0.11) +
      effectiveDosePeak * intensity * (outpost.id === "lunar-south" ? 1.0 : 0.94)
    ).toFixed(3)
  );
  const shieldingAttenuation =
    Math.exp(-totalShielding / 38) * (effectiveShelter ? 0.42 : 1.0);
  const internalDoseRate = Number(
    Math.max(0.015, externalDoseRate * shieldingAttenuation).toFixed(3)
  );
  const nextCumulativeDose = Number(
    (prev.cumulativeDoseMsv + internalDoseRate * dtHours).toFixed(3)
  );

  // Oxygen & Water loops
  const baselineScrubber = brownout ? 0.35 : 1.38;
  const hydroO2Bonus = commands.shedHydroponicsLoad || brownout ? 0 : 0.16;
  const boostO2 = effectiveScrubberBoost ? 1.95 : 0;
  const shelterBreathPenalty = effectiveShelter ? 0.17 : 0;
  const o2DeltaPerHour =
    baselineScrubber +
    hydroO2Bonus +
    boostO2 -
    outpost.baseO2UsePerHour -
    shelterBreathPenalty;
  const nextO2Pct = Number(
    Math.max(15.0, Math.min(22.5, prev.o2Pct + o2DeltaPerHour * dtHours)).toFixed(2)
  );

  const waterLossPerHour =
    0.09 +
    (effectiveWaterShield ? 0.34 : 0) +
    (effectiveScrubberBoost ? 0.12 : 0) +
    (effectiveBioRx ? 0.08 : 0);
  const nextWaterPct = Number(
    Math.max(0, Math.min(100, prev.waterPct - waterLossPerHour * dtHours)).toFixed(2)
  );

  // OSDR Biological Stress Index (0..100)
  const bioGainPerHour =
    internalDoseRate *
    7.6 *
    osdrStudy.stressMultiplier *
    (effectiveBioRx ? 0.4 : 1.0);
  const naturalRepairPerHour =
    (24 / Math.max(6, osdrStudy.bioHalfLifeHours)) * (effectiveBioRx ? 1.85 : 0.72);
  const nextBioStress = Number(
    Math.max(
      2,
      Math.min(
        100,
        prev.bioStressIndex + (bioGainPerHour - naturalRepairPerHour) * dtHours
      )
    ).toFixed(1)
  );

  // Hydroponics crop health (sealing crew inside shelter slows manual crop tending)
  const hydroMode: HabitatState["hydroponicsMode"] = brownout
    ? "OFFLINE"
    : commands.shedHydroponicsLoad
      ? "CONSERVE"
      : "OPTIMAL";
  const hydroDelta =
    hydroMode === "OPTIMAL"
      ? effectiveShelter
        ? 0.32
        : 2.5
      : hydroMode === "CONSERVE"
        ? 0.08
        : -3.6;
  const nextHydroYield = Number(
    Math.max(0, Math.min(100, prev.hydroponicsYieldPct + hydroDelta * dtHours)).toFixed(1)
  );

  // Check failures (mid-run hard breaches + end-of-shift safety gate checks)
  let failureReason: string | null = prev.failureReason;
  if (!failureReason) {
    if (nextO2Pct <= 17.5) {
      failureReason = "HYPOXIA BREACH // Cabin O2 dropped below 17.5%";
    } else if (nextWaterPct <= 10.0) {
      failureReason = "WATER DEPLETION // Closed-loop reserve fell below 10%";
    } else if (nextCumulativeDose > drill.maxSafeDoseMsv * 1.65) {
      failureReason = `RADIATION EXCEEDANCE // Crew absorbed ${nextCumulativeDose.toFixed(1)} mSv (limit ${drill.maxSafeDoseMsv} mSv)`;
    } else if (nextBioStress >= 98) {
      failureReason = `OSDR BIO-STRESS OVERLOAD // ${osdrStudy.osdId} tissue limit breached`;
    } else if (nextElapsed >= drill.durationHours) {
      if (nextCumulativeDose > drill.maxSafeDoseMsv) {
        failureReason = `DOSE LIMIT EXCEEDED // Final crew dose ${nextCumulativeDose.toFixed(1)} mSv exceeded ${drill.maxSafeDoseMsv} mSv target`;
      } else if (nextO2Pct < drill.minSafeO2Pct) {
        failureReason = `O2 SAFETY FLOOR BREACHED // Final cabin O2 ${nextO2Pct.toFixed(1)}% below ${drill.minSafeO2Pct}% target`;
      } else if (nextWaterPct < drill.minSafeWaterPct) {
        failureReason = `WATER SAFETY FLOOR BREACHED // Reserve ${nextWaterPct.toFixed(1)}% below ${drill.minSafeWaterPct}% target`;
      } else if (
        drill.minSafeHydroPct !== undefined &&
        nextHydroYield < drill.minSafeHydroPct
      ) {
        failureReason = `HYDROPONICS TARGET MISSED // Yield ${nextHydroYield.toFixed(0)}% below ${drill.minSafeHydroPct}% (avoid over-sealing during quiet hours)`;
      }
    }
  }

  // Alerts
  const alerts: string[] = [];
  if (protonFluxPfu >= 50) {
    alerts.push(`DONKI SEP ALERT // ${protonFluxPfu} pfu >=10 MeV incoming`);
  }
  if (kpIndex >= 6.0) {
    alerts.push(`GEOMAGNETIC G2+ // Kp ${kpIndex} storm coupling`);
  }
  if (brownout) {
    alerts.push("POWER BROWNOUT // Battery depleted, active shielding dropped");
  }
  if (nextCumulativeDose > drill.maxSafeDoseMsv) {
    alerts.push(
      `DOSE WARNING // Cumulative ${nextCumulativeDose.toFixed(1)} mSv over target ${drill.maxSafeDoseMsv} mSv`
    );
  }
  if (nextO2Pct < drill.minSafeO2Pct) {
    alerts.push(`LOW O2 // ${nextO2Pct}% below safe target ${drill.minSafeO2Pct}%`);
  }
  if (alerts.length === 0) {
    alerts.push("AUTOMATION HOLDING // ALL LIFE-SUPPORT METRICS IN SAFE BAND");
  }

  // Score calculation (0..100)
  const dosePenalty = Math.max(
    0,
    (nextCumulativeDose / Math.max(1, drill.maxSafeDoseMsv) - 0.65) * 42
  );
  const o2Penalty =
    nextO2Pct < drill.minSafeO2Pct ? (drill.minSafeO2Pct - nextO2Pct) * 14 : 0;
  const bioPenalty = Math.max(0, (nextBioStress - 38) * 0.55);
  const hydroBonus = nextHydroYield >= 70 ? 6 : 0;
  const batteryPenalty = nextBatteryPct < 20 ? (20 - nextBatteryPct) * 0.8 : 0;

  const rawScore = failureReason
    ? Math.min(48, 60 - dosePenalty)
    : Math.max(
        0,
        Math.min(
          100,
          96 + hydroBonus - dosePenalty - o2Penalty - bioPenalty - batteryPenalty
        )
      );
  const missionScore = Number(rawScore.toFixed(0));
  const finished = Boolean(failureReason) || nextElapsed >= drill.durationHours;
  const grade = computeMissionGrade(missionScore, Boolean(failureReason));

  // Concise transition logs
  const newLogs = [...prev.actionLog];
  const tag = `T+${nextElapsed.toFixed(1)}h`;
  if (effectiveShelter !== prev.stormShelterSealed) {
    newLogs.unshift(
      `${tag} // Storm Shelter ${effectiveShelter ? "SEALED" : "UNSEALED"} (${totalShielding} g/cm2)`
    );
  }
  if (effectiveWaterShield !== prev.waterShieldingActive) {
    newLogs.unshift(
      `${tag} // Water-Wall Bladder ${effectiveWaterShield ? "FILLED" : "DRAINED"}`
    );
  }
  if (effectiveBioRx !== prev.bioCountermeasureActive) {
    newLogs.unshift(
      `${tag} // ${osdrStudy.osdId} Bio-Countermeasure ${effectiveBioRx ? "ACTIVE" : "OFF"}`
    );
  }
  if (hydroMode !== prev.hydroponicsMode) {
    newLogs.unshift(`${tag} // Hydroponics Bay -> ${hydroMode}`);
  }
  if (failureReason && !prev.failureReason) {
    newLogs.unshift(`${tag} // CRITICAL FAILURE: ${failureReason}`);
  }

  return {
    nextState: {
      elapsedHours: nextElapsed,
      durationHours: drill.durationHours,
      outpostId: prev.outpostId,
      drillId: prev.drillId,
      running: finished ? false : prev.running,
      finished,
      o2Pct: nextO2Pct,
      waterPct: nextWaterPct,
      batteryPct: nextBatteryPct,
      powerSupplyKw: solarSupplyKw,
      powerDemandKw: totalDemandKw,
      powerNetKw: netKw,
      shieldingGcm2: totalShielding,
      stormShelterSealed: effectiveShelter,
      scrubberBoostActive: effectiveScrubberBoost,
      hydroponicsMode: hydroMode,
      hydroponicsYieldPct: nextHydroYield,
      bioCountermeasureActive: effectiveBioRx,
      waterShieldingActive: effectiveWaterShield,
      protonFluxPfu,
      kpIndex,
      solarFlareScale: intensity,
      externalDoseRateMsvHr: externalDoseRate,
      internalDoseRateMsvHr: internalDoseRate,
      cumulativeDoseMsv: nextCumulativeDose,
      bioStressIndex: nextBioStress,
      alerts,
      actionLog: newLogs.slice(0, 18),
      missionScore,
      grade,
      failureReason,
    },
    flowEvaluation,
  };
}

export function runFullDrillSimulation(
  drillId: string,
  nodes: readonly FlowNode[],
  edges: readonly FlowEdge[],
  outpostOverride?: OutpostId,
  stormOverride?: DonkiStormEvent
): HabitatState {
  const drill =
    MISSION_DRILLS.find((d) => d.id === drillId) ?? MISSION_DRILLS[0];
  const storm =
    stormOverride ??
    VERIFIED_DONKI_EVENTS.find((e) => e.id === drill.linkedStormId) ??
    VERIFIED_DONKI_EVENTS[0];
  const osdrStudy =
    VERIFIED_OSDR_STUDIES.find((s) => s.osdId === drill.linkedOsdId) ??
    VERIFIED_OSDR_STUDIES[0];

  let state: HabitatState = {
    ...createInitialHabitatState(drill.id, outpostOverride),
    running: true,
  };

  let guard = 0;
  while (!state.finished && guard < 120) {
    state = stepHabitatSimulation(
      state,
      drill,
      storm,
      osdrStudy,
      nodes,
      edges,
      0.5
    ).nextState;
    guard += 1;
  }
  return state;
}
