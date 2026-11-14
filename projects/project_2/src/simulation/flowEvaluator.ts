import { VERIFIED_OSDR_STUDIES } from "../data/nasaSnapshots";
import type { FlowEdge, FlowEvalResult, FlowNode } from "../types/flow";
import type { ActiveActuatorCommands } from "../types/mission";

export interface SensorSnapshot {
  readonly protonFluxPfu: number;
  readonly kpIndex: number;
  readonly o2Pct: number;
  readonly batteryPct: number;
  readonly bioStressIndex: number;
  readonly activeOsdId: string;
}

export interface EvaluatedFlowBundle {
  readonly evalResult: FlowEvalResult;
  readonly commands: ActiveActuatorCommands;
  readonly shelterShieldGainGcm2: number;
  readonly coilPowerKw: number;
  readonly compiledChipIds: readonly string[];
}

function topologicalOrder(
  nodes: readonly FlowNode[],
  edges: readonly FlowEdge[]
): FlowNode[] {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const inDegree = new Map<string, number>();
  const outgoing = new Map<string, string[]>();

  for (const node of nodes) {
    inDegree.set(node.id, 0);
    outgoing.set(node.id, []);
  }

  for (const edge of edges) {
    if (!byId.has(edge.source) || !byId.has(edge.target)) continue;
    if (edge.source === edge.target) continue;
    outgoing.get(edge.source)?.push(edge.target);
    inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1);
  }

  const queue: string[] = [];
  for (const [id, deg] of inDegree.entries()) {
    if (deg === 0) queue.push(id);
  }

  const ordered: FlowNode[] = [];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const id = queue.shift();
    if (!id || visited.has(id)) continue;
    visited.add(id);
    const node = byId.get(id);
    if (node) ordered.push(node);

    for (const nextId of outgoing.get(id) ?? []) {
      const nextDeg = (inDegree.get(nextId) ?? 1) - 1;
      inDegree.set(nextId, nextDeg);
      if (nextDeg <= 0) {
        queue.push(nextId);
      }
    }
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      ordered.push(node);
    }
  }

  return ordered;
}

function readInputValue(
  nodeId: string,
  handleId: string,
  edges: readonly FlowEdge[],
  outputsByNode: ReadonlyMap<string, Record<string, boolean | number | string>>
): boolean | number | string | undefined {
  const incoming = edges.find(
    (e) => e.target === nodeId && (e.targetHandle ?? "in") === handleId
  );
  if (!incoming) return undefined;
  const sourceOut = outputsByNode.get(incoming.source);
  if (!sourceOut) return undefined;
  const srcHandle = incoming.sourceHandle;
  if (srcHandle && srcHandle in sourceOut) {
    return sourceOut[srcHandle];
  }
  const firstVal = Object.values(sourceOut)[0];
  return firstVal;
}

function toBoolean(val: unknown): boolean {
  if (typeof val === "boolean") return val;
  if (typeof val === "number") return val > 0;
  if (typeof val === "string") return val === "true" || Number(val) > 0;
  return false;
}

function toNumber(val: unknown, fallback = 0): number {
  if (typeof val === "number" && Number.isFinite(val)) return val;
  if (typeof val === "boolean") return val ? 1 : 0;
  if (typeof val === "string") {
    const parsed = Number(val);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

export function evaluateFlowGraph(
  nodes: readonly FlowNode[],
  edges: readonly FlowEdge[],
  sensors: SensorSnapshot
): EvaluatedFlowBundle {
  const ordered = topologicalOrder(nodes, edges);
  const outputsByNode = new Map<
    string,
    Record<string, boolean | number | string>
  >();
  const activeNodeIds = new Set<string>();
  const activeEdgeIds = new Set<string>();
  const nodeReadouts = new Map<string, string>();

  let sealStormShelter = false;
  let divertPowerToShielding = false;
  let shedHydroponicsLoad = false;
  let boostO2Scrubber = false;
  let activateBioCountermeasure = false;
  let flushWaterShieldWall = false;
  let shelterShieldGainGcm2 = 0;
  let coilPowerKw = 3.6;
  const compiledChipIds: string[] = [];

  for (const node of ordered) {
    const type = node.data.type;
    const fields = node.data.fields ?? {};

    if (type === "donki-proton-sensor") {
      const flux = Number(sensors.protonFluxPfu.toFixed(1));
      const alert = flux >= 50;
      outputsByNode.set(node.id, { flux, stormAlert: alert });
      nodeReadouts.set(node.id, `${flux} pfu`);
      if (alert) activeNodeIds.add(node.id);
    } else if (type === "donki-kp-sensor") {
      const kp = Number(sensors.kpIndex.toFixed(2));
      const alert = kp >= 6;
      outputsByNode.set(node.id, { kp, geomagAlert: alert });
      nodeReadouts.set(node.id, `Kp ${kp}`);
      if (alert) activeNodeIds.add(node.id);
    } else if (type === "habitat-o2-sensor") {
      const o2 = Number(sensors.o2Pct.toFixed(2));
      const lowO2 = o2 < 19.8;
      outputsByNode.set(node.id, { o2, lowO2 });
      nodeReadouts.set(node.id, `${o2}% O2`);
      if (lowO2) activeNodeIds.add(node.id);
    } else if (type === "battery-power-sensor") {
      const battery = Number(sensors.batteryPct.toFixed(1));
      const lowPower = battery < 50;
      outputsByNode.set(node.id, { battery, lowPower });
      nodeReadouts.set(node.id, `${battery}% SOC`);
      if (lowPower) activeNodeIds.add(node.id);
    } else if (type === "threshold-compare") {
      const incomingRaw = readInputValue(node.id, "value", edges, outputsByNode);
      const val = toNumber(incomingRaw, NaN);
      const operator = String(fields.operator ?? ">=");
      const threshold = toNumber(fields.threshold, 50);
      const hasInput = !Number.isNaN(val);
      const triggered =
        hasInput && (operator === "<=" ? val <= threshold : val >= threshold);
      outputsByNode.set(node.id, { triggered });
      nodeReadouts.set(
        node.id,
        hasInput
          ? `${val.toFixed(1)} ${operator} ${threshold} : ${triggered ? "ON" : "OFF"}`
          : "NO INPUT"
      );
      if (triggered) activeNodeIds.add(node.id);
    } else if (type === "osdr-bio-monitor") {
      const selectedOsd = String(fields.osdId ?? sensors.activeOsdId ?? "OSD-109");
      const study =
        VERIFIED_OSDR_STUDIES.find((s) => s.osdId === selectedOsd) ??
        VERIFIED_OSDR_STUDIES[0];
      const stressLimit = toNumber(fields.stressLimit, 32);
      const incomingFlux = readInputValue(node.id, "flux", edges, outputsByNode);
      const effectiveFlux =
        incomingFlux !== undefined
          ? toNumber(incomingFlux, sensors.protonFluxPfu)
          : sensors.protonFluxPfu;
      const estimatedStress = Number(
        Math.min(
          100,
          sensors.bioStressIndex * 0.72 +
            (effectiveFlux / 25) * study.stressMultiplier * 4.5
        ).toFixed(1)
      );
      const bioCritical = estimatedStress >= stressLimit;
      outputsByNode.set(node.id, {
        bioRisk: estimatedStress,
        bioCritical,
      });
      nodeReadouts.set(
        node.id,
        `${study.osdId} // ${estimatedStress}%${bioCritical ? " CRIT" : ""}`
      );
      if (bioCritical) activeNodeIds.add(node.id);
    } else if (type === "gate-and") {
      const a = toBoolean(readInputValue(node.id, "a", edges, outputsByNode));
      const b = toBoolean(readInputValue(node.id, "b", edges, outputsByNode));
      const out = a && b;
      outputsByNode.set(node.id, { out });
      nodeReadouts.set(node.id, out ? "TRUE" : "FALSE");
      if (out) activeNodeIds.add(node.id);
    } else if (type === "gate-or") {
      const a = toBoolean(readInputValue(node.id, "a", edges, outputsByNode));
      const b = toBoolean(readInputValue(node.id, "b", edges, outputsByNode));
      const out = a || b;
      outputsByNode.set(node.id, { out });
      nodeReadouts.set(node.id, out ? "TRUE" : "FALSE");
      if (out) activeNodeIds.add(node.id);
    } else if (type === "gate-not") {
      const raw = readInputValue(node.id, "in", edges, outputsByNode);
      const out = raw !== undefined ? !toBoolean(raw) : false;
      outputsByNode.set(node.id, { out });
      nodeReadouts.set(node.id, out ? "TRUE" : "FALSE");
      if (out) activeNodeIds.add(node.id);
    } else if (type.startsWith("action-")) {
      const trigRaw = readInputValue(node.id, "trigger", edges, outputsByNode);
      const active = toBoolean(trigRaw);
      outputsByNode.set(node.id, { active });
      nodeReadouts.set(node.id, active ? "ENGAGED" : "STANDBY");
      if (active) {
        activeNodeIds.add(node.id);
        compiledChipIds.push(node.id);
      }

      if (type === "action-storm-shelter" && active) {
        sealStormShelter = true;
        const clampedGain = Math.min(
          80,
          Math.max(15, toNumber(fields.shieldGainGcm2, 38))
        );
        shelterShieldGainGcm2 = Math.max(shelterShieldGainGcm2, clampedGain);
      } else if (type === "action-water-shield" && active) {
        flushWaterShieldWall = true;
      } else if (type === "action-divert-shield" && active) {
        divertPowerToShielding = true;
        coilPowerKw = Math.min(7, Math.max(2, toNumber(fields.coilPowerKw, 3.6)));
      } else if (type === "action-shed-hydroponics" && active) {
        shedHydroponicsLoad = true;
      } else if (type === "action-o2-scrubber" && active) {
        boostO2Scrubber = true;
      } else if (type === "action-bio-countermeasure" && active) {
        activateBioCountermeasure = true;
      }
    }
  }

  for (const edge of edges) {
    const srcOut = outputsByNode.get(edge.source);
    if (!srcOut) continue;
    const rawVal = edge.sourceHandle ? srcOut[edge.sourceHandle] : undefined;
    if (typeof rawVal === "boolean") {
      if (rawVal) activeEdgeIds.add(edge.id);
    } else if (typeof rawVal === "number") {
      if (activeNodeIds.has(edge.target) || activeNodeIds.has(edge.source)) {
        activeEdgeIds.add(edge.id);
      }
    }
  }

  return {
    evalResult: {
      nodeOutputs: outputsByNode,
      activeNodeIds,
      activeEdgeIds,
      nodeReadouts,
    },
    commands: {
      sealStormShelter,
      divertPowerToShielding,
      shedHydroponicsLoad,
      boostO2Scrubber,
      activateBioCountermeasure,
      flushWaterShieldWall,
      telemetryTag: compiledChipIds.length > 0 ? compiledChipIds.join(",") : null,
    },
    shelterShieldGainGcm2,
    coilPowerKw,
    compiledChipIds,
  };
}
