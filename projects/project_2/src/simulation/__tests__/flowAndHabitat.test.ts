import { describe, expect, it } from "vitest";
import { MISSION_DRILLS, VERIFIED_DONKI_EVENTS, VERIFIED_OSDR_STUDIES } from "../../data/nasaSnapshots";
import { FLOW_PRESETS, createFlowNodeData } from "../../data/nodeDefinitions";
import {
  fetchResilientNasaTelemetry,
  parseDonkiCmePayload,
  parseSwpcTelemetry,
  searchLiveOsdrStudies,
} from "../../services/nasaTelemetryService";
import type { FlowEdge, FlowNode } from "../../types/flow";
import { autoArrangeFlow } from "../../utils/layoutFlow";
import { createsCycle, isValidFlowConnection } from "../../utils/socketTypes";
import { evaluateFlowGraph } from "../flowEvaluator";
import {
  createInitialHabitatState,
  runFullDrillSimulation,
  stepHabitatSimulation,
} from "../habitatEngine";

function makeTestNode(
  id: string,
  type: string,
  fields?: Record<string, string | number>
): FlowNode {
  return {
    id,
    type: "cradleNode",
    position: { x: 0, y: 0 },
    data: createFlowNodeData(type, fields ? { fields } : undefined),
  };
}

describe("Frontier Flow Socket Compatibility & DAG Guards", () => {
  it("accepts valid typed connections and rejects mismatched socket types", () => {
    const proton = makeTestNode("n1", "donki-proton-sensor");
    const thresh = makeTestNode("n2", "threshold-compare");
    const shelter = makeTestNode("n3", "action-storm-shelter");
    const nodes = [proton, thresh, shelter];

    // Valid: storm -> metric
    expect(
      isValidFlowConnection(
        {
          source: "n1",
          sourceHandle: "flux",
          target: "n2",
          targetHandle: "value",
        },
        nodes,
        []
      )
    ).toBe(true);

    // Invalid: storm number directly into boolean signal actuator
    expect(
      isValidFlowConnection(
        {
          source: "n1",
          sourceHandle: "flux",
          target: "n3",
          targetHandle: "trigger",
        },
        nodes,
        []
      )
    ).toBe(false);

    // Invalid: self-loop
    expect(
      isValidFlowConnection(
        {
          source: "n2",
          sourceHandle: "triggered",
          target: "n2",
          targetHandle: "value",
        },
        nodes,
        []
      )
    ).toBe(false);
  });

  it("detects and blocks graph cycles cleanly", () => {
    const orGate = makeTestNode("g1", "gate-or");
    const notGate = makeTestNode("g2", "gate-not");
    const edges: FlowEdge[] = [
      {
        id: "e1",
        source: "g1",
        sourceHandle: "out",
        target: "g2",
        targetHandle: "in",
      },
    ];

    expect(createsCycle({ source: "g2", target: "g1" }, edges)).toBe(true);
    expect(
      isValidFlowConnection(
        { source: "g2", sourceHandle: "out", target: "g1", targetHandle: "a" },
        [orGate, notGate],
        edges
      )
    ).toBe(false);
  });

  it("auto-arranges nodes left-to-right via Dagre without collapsing coordinates", () => {
    const preset = FLOW_PRESETS[0];
    const arranged = autoArrangeFlow(preset.nodes, preset.edges);
    expect(arranged).toHaveLength(preset.nodes.length);
    const minX = Math.min(...arranged.map((n) => n.position.x));
    const maxX = Math.max(...arranged.map((n) => n.position.x));
    expect(maxX).toBeGreaterThan(minX + 100);
  });
});

describe("Flow Graph Topological Evaluation", () => {
  it("computes AND / OR / NOT gates and OSDR thresholds accurately", () => {
    const nodes: FlowNode[] = [
      makeTestNode("p", "donki-proton-sensor"),
      makeTestNode("k", "donki-kp-sensor"),
      makeTestNode("and1", "gate-and"),
      makeTestNode("not1", "gate-not"),
      makeTestNode("sh", "action-storm-shelter"),
      makeTestNode("shed", "action-shed-hydroponics"),
    ];
    const edges: FlowEdge[] = [
      { id: "e1", source: "p", sourceHandle: "stormAlert", target: "and1", targetHandle: "a" },
      { id: "e2", source: "k", sourceHandle: "geomagAlert", target: "and1", targetHandle: "b" },
      { id: "e3", source: "and1", sourceHandle: "out", target: "sh", targetHandle: "trigger" },
      { id: "e4", source: "and1", sourceHandle: "out", target: "not1", targetHandle: "in" },
      { id: "e5", source: "not1", sourceHandle: "out", target: "shed", targetHandle: "trigger" },
    ];

    // Storm strong on both sensors => AND fires Shelter, NOT suppresses Shed
    const stormEval = evaluateFlowGraph(nodes, edges, {
      protonFluxPfu: 120,
      kpIndex: 7.2,
      o2Pct: 20.5,
      batteryPct: 80,
      bioStressIndex: 25,
      activeOsdId: "OSD-109",
    });
    expect(stormEval.commands.sealStormShelter).toBe(true);
    expect(stormEval.commands.shedHydroponicsLoad).toBe(false);
    expect(stormEval.evalResult.activeEdgeIds.has("e3")).toBe(true);

    // Quiet baseline => AND false, NOT true -> Shed engages
    const quietEval = evaluateFlowGraph(nodes, edges, {
      protonFluxPfu: 1.5,
      kpIndex: 2.0,
      o2Pct: 20.8,
      batteryPct: 85,
      bioStressIndex: 8,
      activeOsdId: "OSD-109",
    });
    expect(quietEval.commands.sealStormShelter).toBe(false);
    expect(quietEval.commands.shedHydroponicsLoad).toBe(true);
  });

  it("amplifies bio-risk when NASA OSDR HZE study OSD-340 is selected", () => {
    const osdrFe = makeTestNode("bio-fe", "osdr-bio-monitor", {
      osdId: "OSD-340",
      stressLimit: 25,
    });
    const osdrLunar = makeTestNode("bio-ln", "osdr-bio-monitor", {
      osdId: "OSD-714",
      stressLimit: 25,
    });
    const rx = makeTestNode("rx", "action-bio-countermeasure");

    const feEval = evaluateFlowGraph(
      [osdrFe, rx],
      [{ id: "e1", source: "bio-fe", sourceHandle: "bioCritical", target: "rx", targetHandle: "trigger" }],
      {
        protonFluxPfu: 95,
        kpIndex: 6.5,
        o2Pct: 20.6,
        batteryPct: 82,
        bioStressIndex: 18,
        activeOsdId: "OSD-340",
      }
    );

    const lunarEval = evaluateFlowGraph(
      [osdrLunar, rx],
      [{ id: "e1", source: "bio-ln", sourceHandle: "bioCritical", target: "rx", targetHandle: "trigger" }],
      {
        protonFluxPfu: 95,
        kpIndex: 6.5,
        o2Pct: 20.6,
        batteryPct: 82,
        bioStressIndex: 18,
        activeOsdId: "OSD-714",
      }
    );

    const feRisk = Number(feEval.evalResult.nodeOutputs.get("bio-fe")?.bioRisk ?? 0);
    const lunarRisk = Number(lunarEval.evalResult.nodeOutputs.get("bio-ln")?.bioRisk ?? 0);
    expect(feRisk).toBeGreaterThan(lunarRisk);
    expect(feEval.commands.activateBioCountermeasure).toBe(true);
  });
});

describe("Habitat Physics Engine: Automated Survival vs Unwired Vulnerability", () => {
  it("passes Drill 01 (Lunar Oct 2026 Kp-7.0) with Standard Storm Protocol and suffers severe radiation/failure when unwired", () => {
    const standard = FLOW_PRESETS.find((p) => p.id === "preset-storm-standard")!;
    const unwired = FLOW_PRESETS.find((p) => p.id === "preset-sandbox-unwired")!;

    const survived = runFullDrillSimulation(
      "drill-lunar-oct2026",
      standard.nodes,
      standard.edges
    );
    const failed = runFullDrillSimulation(
      "drill-lunar-oct2026",
      unwired.nodes,
      unwired.edges
    );

    expect(survived.finished).toBe(true);
    expect(survived.failureReason).toBeNull();
    expect(survived.cumulativeDoseMsv).toBeLessThan(MISSION_DRILLS[0].maxSafeDoseMsv);
    expect(["S", "A"]).toContain(survived.grade);

    expect(failed.cumulativeDoseMsv).toBeGreaterThan(survived.cumulativeDoseMsv * 3);
    expect(failed.missionScore).toBeLessThan(survived.missionScore);
  });

  it("models Mars AR 13664 G5 superstorm survival with Dual-Gate OSDR Protocol", () => {
    const dualGate = FLOW_PRESETS.find((p) => p.id === "preset-dual-gate-pro")!;
    const unwired = FLOW_PRESETS.find((p) => p.id === "preset-sandbox-unwired")!;

    const marsSurvived = runFullDrillSimulation(
      "drill-mars-superstorm",
      dualGate.nodes,
      dualGate.edges
    );
    const marsUnwired = runFullDrillSimulation(
      "drill-mars-superstorm",
      unwired.nodes,
      unwired.edges
    );

    expect(marsSurvived.failureReason).toBeNull();
    expect(["S", "A", "B"]).toContain(marsSurvived.grade);
    expect(marsUnwired.grade).toBe("FAIL");
  });

  it("differentiates Lunar vacuum (0 g/cm2 atm) vs Martian CO2 column (18 g/cm2 atm)", () => {
    const lunarInit = createInitialHabitatState("drill-lunar-oct2026", "lunar-south");
    const marsInit = createInitialHabitatState("drill-lunar-oct2026", "mars-jezero");
    expect(marsInit.shieldingGcm2).toBe(lunarInit.shieldingGcm2 + 18);
    expect(lunarInit.powerSupplyKw).toBeGreaterThan(marsInit.powerSupplyKw);
  });
});

describe("Resilient NASA DONKI + NOAA SWPC + OSDR Data Layer", () => {
  it("parses GOES-18 protons, X-ray flares, Kp index, and DONKI CME responses accurately", () => {
    const parsedSwpc = parseSwpcTelemetry(
      [
        { time_tag: "2026-11-14T08:10:00Z", flux: 0.2407, energy: ">=10 MeV" },
        { time_tag: "2026-11-14T08:10:00Z", flux: 0.2288, energy: ">=100 MeV" },
      ],
      [{ time_tag: "2026-11-14T08:17:00Z", max_class: "C4.4" }],
      [{ time_tag: "2026-11-14T03:00:00", Kp: 1.33 }]
    );
    expect(parsedSwpc.goesProton10Mev).toBe(0.2407);
    expect(parsedSwpc.goesProton100Mev).toBe(0.2288);
    expect(parsedSwpc.goesXrayClass).toBe("C4.4");
    expect(parsedSwpc.swpcKp).toBe(1.33);

    const parsedDonki = parseDonkiCmePayload([
      {
        activityID: "2026-11-12T04:00:00-CME-001",
        startTime: "2026-11-12T04:00Z",
        cmeAnalyses: [{ speed: 920 }],
        note: "Fast partial halo CME",
      },
    ]);
    expect(parsedDonki).toHaveLength(1);
    expect(parsedDonki[0].speedKmS).toBe(920);
    expect(parsedDonki[0].xrayClass).toBe("M5.0");
  });

  it("falls back gracefully to bundled verified NASA snapshots when network fails", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (() => Promise.reject(new Error("Offline test mode"))) as typeof fetch;
    try {
      const res = await fetchResilientNasaTelemetry({
        includeDonkiApi: true,
        timeoutMs: 100,
      });
      expect(res.provenance.source).toBe("VERIFIED_SNAPSHOT");
      expect(res.events.length).toBe(VERIFIED_DONKI_EVENTS.length);
      expect(res.studies.length).toBe(VERIFIED_OSDR_STUDIES.length);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("updates live GOES-18 summary dynamically on SWPC sync and tags cached OSDR fallback honestly", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("integral-protons-1-day.json")) {
        return new Response(
          JSON.stringify([
            { time_tag: "2026-11-14T15:20:00Z", flux: 1.85, energy: ">=10 MeV" },
            { time_tag: "2026-11-14T15:20:00Z", flux: 0.31, energy: ">=100 MeV" },
          ]),
          { status: 200 }
        );
      }
      if (url.includes("xray-flares-latest.json")) {
        return new Response(
          JSON.stringify([{ time_tag: "2026-11-14T15:18:00Z", max_class: "M1.2" }]),
          { status: 200 }
        );
      }
      if (url.includes("noaa-planetary-k-index.json")) {
        return new Response(
          JSON.stringify([{ time_tag: "2026-11-14T15:00:00", Kp: 3.67 }]),
          { status: 200 }
        );
      }
      return new Response("Blocked", { status: 403 });
    }) as typeof fetch;

    try {
      const res = await fetchResilientNasaTelemetry({
        includeDonkiApi: false,
        timeoutMs: 1000,
      });
      expect(res.provenance.source).toBe("LIVE_NOAA_SWPC");
      const swpcCard = res.events.find(
        (e) => e.id === "2026-11-14T06:06:00-FLR-SWPC"
      )!;
      expect(swpcCard.xrayClass).toBe("M1.2");
      expect(swpcCard.protonFluxPfu).toBe(1.85);
      expect(swpcCard.kpIndex).toBe(3.67);
      expect(swpcCard.summary).toContain("M1.2");
      expect(swpcCard.summary).toContain("1.85 pfu");
      expect(swpcCard.summary).not.toContain("0.2407");

      const osdrFallback = await searchLiveOsdrStudies("cardiomyocyte");
      expect(osdrFallback.source).toBe("cached");
      expect(osdrFallback.titles.length).toBeGreaterThan(0);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

describe("Regression Guards: Calibration Bounds, Gust Modeling & Always-On Exploit", () => {
  it("respects Storm Shelter shieldGainGcm2 = 20 g/cm2 without clamping up to 38", () => {
    const proton = makeTestNode("p", "donki-proton-sensor");
    const thresh = makeTestNode("t", "threshold-compare", {
      operator: ">=",
      threshold: 10,
    });
    const shelter = makeTestNode("s", "action-storm-shelter", {
      shieldGainGcm2: 20,
    });
    const edges: FlowEdge[] = [
      { id: "e1", source: "p", sourceHandle: "flux", target: "t", targetHandle: "value" },
      { id: "e2", source: "t", sourceHandle: "triggered", target: "s", targetHandle: "trigger" },
    ];
    const evalOut = evaluateFlowGraph([proton, thresh, shelter], edges, {
      protonFluxPfu: 80,
      kpIndex: 4,
      o2Pct: 20.8,
      batteryPct: 80,
      bioStressIndex: 10,
      activeOsdId: "OSD-73",
    });
    expect(evalOut.commands.sealStormShelter).toBe(true);
    expect(evalOut.shelterShieldGainGcm2).toBe(20);

    const step = stepHabitatSimulation(
      createInitialHabitatState("drill-lunar-oct2026", "lunar-south"),
      MISSION_DRILLS[0],
      VERIFIED_DONKI_EVENTS[0],
      VERIFIED_OSDR_STUDIES[0],
      [proton, thresh, shelter],
      edges,
      0.5
    );
    expect(step.nextState.shieldingGcm2).toBe(32);
  });

  it("rejects Always-On (threshold=0) exploit and fails unwired graphs on Drill 03", () => {
    const standard = FLOW_PRESETS.find((p) => p.id === "preset-storm-standard")!;
    const unwired = FLOW_PRESETS.find((p) => p.id === "preset-sandbox-unwired")!;

    const drill03Pass = runFullDrillSimulation(
      "drill-live-baseline",
      standard.nodes,
      standard.edges,
      "lunar-south"
    );
    const drill03UnwiredLunar = runFullDrillSimulation(
      "drill-live-baseline",
      unwired.nodes,
      unwired.edges,
      "lunar-south"
    );
    const drill03UnwiredMars = runFullDrillSimulation(
      "drill-live-baseline",
      unwired.nodes,
      unwired.edges,
      "mars-jezero"
    );

    expect(drill03Pass.failureReason).toBeNull();
    expect(drill03UnwiredLunar.grade).toBe("FAIL");
    expect(drill03UnwiredMars.grade).toBe("FAIL");

    const alwaysOnNodes = structuredClone(standard.nodes).map((n) => {
      if (n.data.fields?.threshold !== undefined) {
        return {
          ...n,
          data: { ...n.data, fields: { ...n.data.fields, threshold: 0 } },
        };
      }
      return n;
    });

    for (const drill of MISSION_DRILLS) {
      const exploitRun = runFullDrillSimulation(
        drill.id,
        alwaysOnNodes,
        standard.edges
      );
      expect(exploitRun.grade).toBe("FAIL");
      expect(exploitRun.failureReason).toBeTruthy();
    }
  });
});
