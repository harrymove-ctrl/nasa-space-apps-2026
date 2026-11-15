import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlowProvider,
  applyEdgeChanges,
  applyNodeChanges,
  type EdgeChange,
  type NodeChange,
} from "@xyflow/react";
import {
  Activity,
  ArrowLeft,
  Award,
  Compass,
  Dna,
  FastForward,
  LayoutGrid,
  Pause,
  Play,
  Radiation,
  RefreshCw,
  RotateCcw,
  Shield,
  SkipForward,
  Sparkles,
  Wifi,
} from "lucide-react";
import { DebriefBanner } from "./components/DebriefBanner";
import { CadetTourBar } from "./components/CadetTourBar";
import { DonkiWeatherTab } from "./components/DonkiWeatherTab";
import { FlowCanvasWorkspace } from "./components/FlowCanvasWorkspace";
import {
  NodeRuntimeContext,
  type NodeRuntimeCallbacks,
} from "./components/FlowNode";
import { HabitatTopologyPanel } from "./components/HabitatTopologyPanel";
import { NodeFieldModal } from "./components/NodeFieldModal";
import { OsdrBioLabTab } from "./components/OsdrBioLabTab";
import type { EngineChip } from "./components/ReactorEngine";
import { ToolboxSidebar } from "./components/ToolboxSidebar";
import {
  BASELINE_PROVENANCE,
  MISSION_DRILLS,
  VERIFIED_DONKI_EVENTS,
  VERIFIED_OSDR_STUDIES,
} from "./data/nasaSnapshots";
import {
  FLOW_PRESETS,
  NODE_DEFINITIONS_BY_TYPE,
  createFlowNodeData,
} from "./data/nodeDefinitions";
import { fetchResilientNasaTelemetry } from "./services/nasaTelemetryService";
import { evaluateFlowGraph } from "./simulation/flowEvaluator";
import {
  createInitialHabitatState,
  stepHabitatSimulation,
} from "./simulation/habitatEngine";
import type { FlowEdge, FlowNode, FlowNodeFieldValue } from "./types/flow";
import type {
  DonkiStormEvent,
  HabitatState,
  OsdrStudyRecord,
  OutpostId,
  TelemetryProvenance,
} from "./types/mission";

type ActiveTab = "trainer" | "donki" | "osdr";
type MobileTrainerPane = "canvas" | "palette" | "hud";

interface DopaiMintHandoff {
  readonly embedded: boolean;
  readonly corridor: string | null;
  readonly flux: string | null;
  readonly kp: string | null;
  readonly waves: string | null;
  readonly returnUrl: string;
}

function parseDopaiMintHandoff(): DopaiMintHandoff {
  if (typeof window === "undefined") {
    return {
      embedded: false,
      corridor: null,
      flux: null,
      kp: null,
      waves: null,
      returnUrl: "https://dopaimint-production.up.railway.app",
    };
  }
  const params = new URLSearchParams(window.location.search);
  const defaultReturn = window.location.pathname.startsWith("/cradleflow")
    ? "/?skipPreloader=1"
    : "https://dopaimint-production.up.railway.app";
  return {
    embedded: params.get("embedded") === "1",
    corridor: params.get("corridor"),
    flux: params.get("flux"),
    kp: params.get("kp"),
    waves: params.get("waves"),
    returnUrl: params.get("returnUrl") || defaultReturn,
  };
}

function parseHandoffNumber(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function seedStateWithHandoff(
  base: HabitatState,
  handoff: DopaiMintHandoff
): HabitatState {
  const handoffFlux = parseHandoffNumber(handoff.flux);
  const handoffKp = parseHandoffNumber(handoff.kp);
  if (!handoff.corridor && handoffFlux === null && handoffKp === null) {
    return base;
  }
  const nextFlux = handoffFlux ?? base.protonFluxPfu;
  const nextKp = handoffKp ?? base.kpIndex;
  const elevated = nextFlux >= 50 || nextKp >= 5;
  return {
    ...base,
    protonFluxPfu: nextFlux,
    kpIndex: nextKp,
    alerts: elevated
      ? [
          `DOPAIMINT CORRIDOR ALERT (${handoff.corridor ?? "ACTIVE"}) // ${nextFlux} PFU · KP ${nextKp} · PRESS RUN DRILL`,
        ]
      : base.alerts,
    actionLog: [
      ...base.actionLog,
      `T+00.0h // Telemetry seeded from DopaiMint (${handoff.corridor ?? "Orbital Link"}: ${nextFlux} pfu, Kp ${nextKp}).`,
    ],
  };
}

export function App() {
  const handoff = useMemo(parseDopaiMintHandoff, []);
  const defaultPreset = FLOW_PRESETS[0];
  const [activeTab, setActiveTab] = useState<ActiveTab>("trainer");
  const [mobilePane, setMobilePane] = useState<MobileTrainerPane>("canvas");
  const [activePresetId, setActivePresetId] = useState<string>(defaultPreset.id);
  const [nodes, setNodes] = useState<FlowNode[]>(() => [...defaultPreset.nodes]);
  const [edges, setEdges] = useState<FlowEdge[]>(() => [...defaultPreset.edges]);

  const [events, setEvents] = useState<readonly DonkiStormEvent[]>(VERIFIED_DONKI_EVENTS);
  const [studies, setStudies] = useState<readonly OsdrStudyRecord[]>(VERIFIED_OSDR_STUDIES);
  const [provenance, setProvenance] = useState<TelemetryProvenance>(BASELINE_PROVENANCE);
  const [syncing, setSyncing] = useState(false);

  const [drillId, setDrillId] = useState<string>(MISSION_DRILLS[0].id);
  const [customStormId, setCustomStormId] = useState<string | null>(null);
  const [customOsdId, setCustomOsdId] = useState<string | null>(null);
  const [speedMultiplier, setSpeedMultiplier] = useState<1 | 3>(1);

  const [habitatState, setHabitatState] = useState<HabitatState>(() =>
    seedStateWithHandoff(createInitialHabitatState(MISSION_DRILLS[0].id), handoff)
  );
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [debriefOpen, setDebriefOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(
    () => typeof window !== "undefined" && new URLSearchParams(window.location.search).get("tour") === "1"
  );
  const [graphStale, setGraphStale] = useState(false);

  const prevFinishedRef = useRef(false);

  const activeDrill = useMemo(
    () => MISSION_DRILLS.find((d) => d.id === drillId) ?? MISSION_DRILLS[0],
    [drillId]
  );

  const activeStorm = useMemo(() => {
    const id = customStormId ?? activeDrill.linkedStormId;
    return events.find((e) => e.id === id) ?? events[0];
  }, [events, customStormId, activeDrill.linkedStormId]);

  const handoffFloor = useMemo(() => {
    if (customStormId !== null) return null;
    const minFluxPfu = parseHandoffNumber(handoff.flux);
    const minKpIndex = parseHandoffNumber(handoff.kp);
    if (minFluxPfu === null && minKpIndex === null) return null;
    return { minFluxPfu, minKpIndex };
  }, [customStormId, handoff.flux, handoff.kp]);

  const activeOsdrStudy = useMemo(() => {
    const id = customOsdId ?? activeDrill.linkedOsdId;
    return studies.find((s) => s.osdId === id) ?? studies[0];
  }, [studies, customOsdId, activeDrill.linkedOsdId]);

  // Live evaluation snapshot whenever nodes/edges/telemetry state changes
  const liveEval = useMemo(
    () =>
      evaluateFlowGraph(nodes, edges, {
        protonFluxPfu: habitatState.protonFluxPfu,
        kpIndex: habitatState.kpIndex,
        o2Pct: habitatState.o2Pct,
        batteryPct: habitatState.batteryPct,
        bioStressIndex: habitatState.bioStressIndex,
        activeOsdId: activeOsdrStudy.osdId,
      }),
    [nodes, edges, habitatState, activeOsdrStudy.osdId]
  );

  // Build Reactor Engine orbiting chips from wired actuator/sensor nodes
  const activeChips: EngineChip[] = useMemo(() => {
    const wiredNodeIds = new Set<string>();
    for (const edge of edges) {
      wiredNodeIds.add(edge.source);
      wiredNodeIds.add(edge.target);
    }
    return nodes
      .filter((n) => wiredNodeIds.has(n.id))
      .slice(0, 10)
      .map((n) => {
        const def = NODE_DEFINITIONS_BY_TYPE.get(n.data.type);
        const isFiring = liveEval.evalResult.activeNodeIds.has(n.id);
        return {
          id: n.id,
          category: n.data.category,
          label: def?.chipLabel ?? n.data.label.slice(0, 8),
          color: isFiring ? "#5dff9a" : n.data.color,
        };
      });
  }, [nodes, edges, liveEval.evalResult.activeNodeIds]);

  // Silent initial sync with keyless NOAA SWPC + OSDR
  useEffect(() => {
    let active = true;
    fetchResilientNasaTelemetry({ includeDonkiApi: false, timeoutMs: 4500 }).then(
      (res) => {
        if (!active) return;
        setProvenance(res.provenance);
        setEvents(res.events);
        setStudies(res.studies);
      }
    );
    return () => {
      active = false;
    };
  }, []);

  // Auto-open debrief when a run transitions to finished
  useEffect(() => {
    if (habitatState.finished && !prevFinishedRef.current) {
      setDebriefOpen(true);
    }
    prevFinishedRef.current = habitatState.finished;
  }, [habitatState.finished]);

  // Simulation loop interval
  useEffect(() => {
    if (!habitatState.running || habitatState.finished) return;
    const delayMs = speedMultiplier === 3 ? 160 : 420;
    const timer = window.setInterval(() => {
      setHabitatState((prev) => {
        if (!prev.running || prev.finished) return prev;
        return stepHabitatSimulation(
          prev,
          activeDrill,
          activeStorm,
          activeOsdrStudy,
          nodes,
          edges,
          0.5,
          handoffFloor
        ).nextState;
      });
    }, delayMs);
    return () => window.clearInterval(timer);
  }, [
    habitatState.running,
    habitatState.finished,
    speedMultiplier,
    activeDrill,
    activeStorm,
    activeOsdrStudy,
    nodes,
    edges,
    handoffFloor,
  ]);

  const handleRefreshTelemetry = useCallback(async (includeDonkiApi: boolean) => {
    setSyncing(true);
    const res = await fetchResilientNasaTelemetry({
      includeDonkiApi,
      timeoutMs: 6500,
    });
    setProvenance(res.provenance);
    setEvents(res.events);
    setStudies(res.studies);
    setSyncing(false);
  }, []);

  const handleSelectDrill = useCallback(
    (nextDrillId: string) => {
      const target =
        MISSION_DRILLS.find((d) => d.id === nextDrillId) ?? MISSION_DRILLS[0];
      setDrillId(target.id);
      setCustomStormId(null);
      setCustomOsdId(null);
      setDebriefOpen(false);
      setGraphStale(false);
      prevFinishedRef.current = false;
      setHabitatState(
        seedStateWithHandoff(
          createInitialHabitatState(target.id, target.defaultOutpost),
          handoff
        )
      );
    },
    [handoff]
  );

  const handleChangeOutpost = useCallback(
    (outpostId: OutpostId) => {
      setDebriefOpen(false);
      setGraphStale(false);
      prevFinishedRef.current = false;
      setHabitatState(
        seedStateWithHandoff(
          createInitialHabitatState(activeDrill.id, outpostId),
          handoff
        )
      );
    },
    [activeDrill.id, handoff]
  );

  const handleResetDrill = useCallback(() => {
    setDebriefOpen(false);
    setGraphStale(false);
    prevFinishedRef.current = false;
    setHabitatState((prev) =>
      seedStateWithHandoff(
        createInitialHabitatState(activeDrill.id, prev.outpostId),
        handoff
      )
    );
  }, [activeDrill.id, handoff]);

  const handleStepOnce = useCallback(() => {
    setGraphStale(false);
    setHabitatState((prev) => {
      if (prev.finished) return prev;
      return stepHabitatSimulation(
        prev,
        activeDrill,
        activeStorm,
        activeOsdrStudy,
        nodes,
        edges,
        0.5,
        handoffFloor
      ).nextState;
    });
  }, [activeDrill, activeStorm, activeOsdrStudy, nodes, edges, handoffFloor]);

  const handleLoadPreset = useCallback(
    (presetId: string) => {
      const preset = FLOW_PRESETS.find((p) => p.id === presetId);
      if (!preset) return;
      setActivePresetId(preset.id);
      setNodes(preset.nodes.map((n) => ({ ...n, data: { ...n.data, fields: { ...n.data.fields } } })));
      setEdges(preset.edges.map((e) => ({ ...e })));
      if (habitatState.finished) setGraphStale(true);
    },
    [habitatState.finished]
  );

  const handleNodesChange = useCallback(
    (changes: NodeChange<FlowNode>[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
      const removedIds = changes
        .filter((c) => c.type === "remove")
        .map((c) => c.id);
      if (removedIds.length > 0) {
        const removedSet = new Set(removedIds);
        setEdges((eds) =>
          eds.filter(
            (e) => !removedSet.has(e.source) && !removedSet.has(e.target)
          )
        );
        setActivePresetId("custom");
        if (habitatState.finished) setGraphStale(true);
      }
    },
    [habitatState.finished]
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange<FlowEdge>[]) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));
      if (changes.some((c) => c.type === "remove")) {
        setActivePresetId("custom");
        if (habitatState.finished) setGraphStale(true);
      }
    },
    [habitatState.finished]
  );

  const handleSpawnNodeAt = useCallback(
    (nodeType: string, x: number, y: number) => {
      const id = `n-${nodeType}-${Date.now().toString(36)}`;
      const newNode: FlowNode = {
        id,
        type: "cradleNode",
        position: { x, y },
        data: createFlowNodeData(nodeType),
      };
      setNodes((nds) => [...nds, newNode]);
      setActivePresetId("custom");
      if (habitatState.finished) setGraphStale(true);
    },
    [habitatState.finished]
  );

  const handleQuickAddNode = useCallback(
    (nodeType: string) => {
      const offset = (nodes.length % 6) * 28;
      handleSpawnNodeAt(nodeType, 180 + offset, 90 + offset);
    },
    [nodes.length, handleSpawnNodeAt]
  );

  const handleSaveNodeFields = useCallback(
    (nodeId: string, fields: Record<string, FlowNodeFieldValue>) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId
            ? {
                ...n,
                data: {
                  ...n.data,
                  fields,
                },
              }
            : n
        )
      );
      setActivePresetId("custom");
      if (habitatState.finished) setGraphStale(true);
    },
    [habitatState.finished]
  );

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) =>
        eds.filter((e) => e.source !== nodeId && e.target !== nodeId)
      );
      setActivePresetId("custom");
      if (habitatState.finished) setGraphStale(true);
    },
    [habitatState.finished]
  );

  const handleInjectStorm = useCallback(
    (stormId: string) => {
      setCustomStormId(stormId);
      setActiveTab("trainer");
      setMobilePane("canvas");
      setDebriefOpen(false);
      setGraphStale(false);
      prevFinishedRef.current = false;
      setHabitatState((prev) =>
        createInitialHabitatState(activeDrill.id, prev.outpostId)
      );
    },
    [activeDrill.id]
  );

  const handleSelectStudy = useCallback(
    (osdId: string) => {
      setCustomOsdId(osdId);
      setNodes((nds) =>
        nds.map((n) =>
          n.data.type === "osdr-bio-monitor"
            ? {
                ...n,
                data: {
                  ...n.data,
                  fields: { ...n.data.fields, osdId },
                },
              }
            : n
        )
      );
      setActiveTab("trainer");
      setMobilePane("canvas");
      setDebriefOpen(false);
      setGraphStale(false);
      prevFinishedRef.current = false;
      setHabitatState((prev) =>
        seedStateWithHandoff(
          createInitialHabitatState(activeDrill.id, prev.outpostId),
          handoff
        )
      );
    },
    [activeDrill.id, handoff]
  );

  const handleNextDrill = useCallback(() => {
    const idx = MISSION_DRILLS.findIndex((d) => d.id === activeDrill.id);
    const next = MISSION_DRILLS[(idx + 1) % MISSION_DRILLS.length];
    handleSelectDrill(next.id);
  }, [activeDrill.id, handleSelectDrill]);

  const editingNode = useMemo(
    () => nodes.find((n) => n.id === editingNodeId) ?? null,
    [nodes, editingNodeId]
  );

  const runtimeCallbacks: NodeRuntimeCallbacks = useMemo(
    () => ({
      activeNodeIds: liveEval.evalResult.activeNodeIds,
      nodeReadouts: liveEval.evalResult.nodeReadouts,
      onEditNode: (id) => setEditingNodeId(id),
      onDeleteNode: handleDeleteNode,
    }),
    [
      liveEval.evalResult.activeNodeIds,
      liveEval.evalResult.nodeReadouts,
      handleDeleteNode,
    ]
  );

  return (
    <ReactFlowProvider>
      <NodeRuntimeContext.Provider value={runtimeCallbacks}>
        <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-[#090c14] text-[#f3efe6]">
          {/* Top CradleOS Command Header */}
          <header
            className={`flex flex-wrap items-center justify-between gap-1 border-b border-dashed border-[rgba(148,163,184,0.24)] bg-[#0b101b] ${
              handoff.embedded
                ? "px-2 py-1 sm:px-2.5 sm:py-1"
                : "px-2 py-1 sm:gap-1.5 sm:px-2.5 sm:py-1.5 lg:gap-2 lg:px-3 lg:py-2"
            }`}
          >
            <div className="flex w-full min-w-0 flex-wrap items-center gap-1 sm:gap-1.5 lg:w-auto lg:gap-2.5">
              <div className="flex w-full min-w-0 items-center gap-1.5 rounded border border-[rgba(69,184,214,0.45)] bg-[rgba(69,184,214,0.1)] px-2 py-0.5 sm:w-auto sm:gap-2 sm:py-1 lg:px-2.5">
                <Radiation size={14} className="shrink-0 text-[#45b8d6]" />
                <div className="min-w-0">
                  <div className="mono truncate text-[10.5px] font-bold tracking-wider text-[#f3efe6] lg:text-xs lg:tracking-widest">
                    CRADLEFLOW // JUNIOR ASTRONAUT TRAINER
                  </div>
                  {!handoff.embedded ? (
                    <div className="mono short-vp-hide hidden truncate text-[9px] tracking-wider text-[#45b8d6] sm:block">
                      CRADLEOS x FRONTIER FLOW // NASA DONKI + OSDR
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Navigation Tabs */}
              <nav
                className="grid w-full grid-cols-2 gap-1 sm:flex sm:w-auto sm:flex-wrap sm:items-center"
                aria-label="Workspace Views"
              >
                <button
                  type="button"
                  className={`hud-btn justify-center px-2 py-0.5 text-[10px] sm:justify-start sm:py-1 sm:text-[10.5px] lg:px-2.5 lg:py-1.5 lg:text-[11px] ${
                    activeTab === "trainer" ? "hud-btn--primary" : ""
                  }`}
                  onClick={() => setActiveTab("trainer")}
                >
                  <Activity size={13} className="shrink-0" />
                  <span className="truncate">Mission Trainer</span>
                </button>
                <button
                  type="button"
                  className={`hud-btn justify-center px-2 py-0.5 text-[10px] sm:justify-start sm:py-1 sm:text-[10.5px] lg:px-2.5 lg:py-1.5 lg:text-[11px] ${
                    activeTab === "donki" ? "hud-btn--primary" : ""
                  }`}
                  onClick={() => setActiveTab("donki")}
                >
                  <Radiation size={13} className="shrink-0" />
                  <span className="truncate">DONKI Storms ({events.length})</span>
                </button>
                <button
                  type="button"
                  className={`hud-btn justify-center px-2 py-0.5 text-[10px] sm:justify-start sm:py-1 sm:text-[10.5px] lg:px-2.5 lg:py-1.5 lg:text-[11px] ${
                    activeTab === "osdr" ? "hud-btn--primary" : ""
                  }`}
                  onClick={() => setActiveTab("osdr")}
                >
                  <Dna size={13} className="shrink-0" />
                  <span className="truncate">OSDR Bio-Lab ({studies.length})</span>
                </button>
                <button
                  type="button"
                  className={`hud-btn justify-center px-2 py-0.5 text-[10px] sm:justify-start sm:py-1 sm:text-[10.5px] lg:px-2.5 lg:py-1.5 lg:text-[11px] ${
                    habitatState.finished ? "hud-btn--good" : ""
                  }`}
                  onClick={() => setDebriefOpen(true)}
                >
                  <Award size={13} className="shrink-0" />
                  <span className="truncate">Debrief ({habitatState.grade})</span>
                </button>
                <button
                  type="button"
                  data-testid="cadet-tour-toggle"
                  className={`hud-btn justify-center px-2 py-0.5 text-[10px] sm:justify-start sm:py-1 sm:text-[10.5px] lg:px-2.5 lg:py-1.5 lg:text-[11px] ${
                    tourOpen ? "border-[#38bdf8] text-[#38bdf8]" : ""
                  }`}
                  onClick={() => setTourOpen((prev) => !prev)}
                >
                  <Compass size={13} className="shrink-0" />
                  <span className="truncate">Tour</span>
                </button>
                {!handoff.embedded ? (
                  <a
                    href={handoff.returnUrl}
                    data-testid="back-to-dopaimint"
                    className="hud-btn justify-center px-2 py-0.5 text-[10px] text-[#38bdf8] sm:justify-start sm:py-1 sm:text-[10.5px] lg:px-2.5 lg:py-1.5 lg:text-[11px]"
                  >
                    <ArrowLeft size={13} className="shrink-0" />
                    <span className="truncate">Earth Twin</span>
                  </a>
                ) : null}
              </nav>
            </div>

            {/* Right Sim & Provenance Controls */}
            <div className="flex w-full min-w-0 flex-wrap items-center gap-1 lg:w-auto lg:gap-1.5">
              <select
                aria-label="Select Mission Drill"
                value={activeDrill.id}
                onChange={(e) => handleSelectDrill(e.target.value)}
                className="mono w-full min-w-0 max-w-full rounded border border-[rgba(148,163,184,0.28)] bg-[#090c14] px-2 py-0.5 text-[10.5px] font-semibold text-[#f3efe6] outline-none focus:border-[#45b8d6] sm:w-auto sm:py-1 sm:text-[11px] lg:py-1.5"
              >
                {MISSION_DRILLS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title}
                  </option>
                ))}
              </select>

              <div className="flex w-full flex-wrap items-center gap-1 sm:w-auto lg:gap-1.5">
                <button
                  type="button"
                  className="hud-btn hud-btn--primary flex-1 justify-center px-2 py-0.5 text-[10px] sm:flex-none sm:py-1 sm:text-[11px] lg:px-2.5 lg:py-1.5"
                  onClick={() => {
                    setGraphStale(false);
                    if (habitatState.finished) {
                      const fresh = seedStateWithHandoff(
                        createInitialHabitatState(
                          activeDrill.id,
                          habitatState.outpostId
                        ),
                        handoff
                      );
                      prevFinishedRef.current = false;
                      setDebriefOpen(false);
                      setHabitatState({ ...fresh, running: true });
                    } else {
                      setHabitatState((prev) => ({
                        ...prev,
                        running: !prev.running,
                      }));
                    }
                  }}
                >
                  {habitatState.running ? <Pause size={13} /> : <Play size={13} />}
                  {habitatState.running
                    ? "Pause"
                    : habitatState.finished
                      ? "Re-Run"
                      : "Run Drill"}
                </button>

                <button
                  type="button"
                  className="hud-btn px-2 py-0.5 text-[10px] sm:py-1 sm:text-[11px] lg:px-2.5 lg:py-1.5"
                  onClick={handleStepOnce}
                  disabled={habitatState.finished}
                  title="Advance simulation 0.5 hour"
                >
                  <SkipForward size={13} />
                  +0.5h
                </button>

                <button
                  type="button"
                  className={`hud-btn px-2 py-0.5 text-[10px] sm:py-1 sm:text-[11px] lg:px-2.5 lg:py-1.5 ${
                    speedMultiplier === 3 ? "hud-btn--good" : ""
                  }`}
                  onClick={() =>
                    setSpeedMultiplier((s) => (s === 1 ? 3 : 1))
                  }
                  title="Toggle simulation playback speed"
                >
                  <FastForward size={13} />
                  {speedMultiplier}x
                </button>

                <button
                  type="button"
                  className="hud-btn px-2 py-0.5 text-[10px] sm:py-1 sm:text-[11px] lg:px-2.5 lg:py-1.5"
                  onClick={handleResetDrill}
                  title="Reset current drill to T+0.0h"
                >
                  <RotateCcw size={13} />
                  Reset
                </button>

                <button
                  type="button"
                  className="hud-btn px-2 py-0.5 text-[10px] sm:py-1 sm:text-[11px] lg:px-2.5 lg:py-1.5"
                  disabled={syncing}
                  onClick={() => handleRefreshTelemetry(false)}
                  aria-label="Sync NASA and NOAA Telemetry"
                  title={provenance.note}
                >
                  {syncing ? (
                    <RefreshCw size={13} className="animate-spin text-[#5dff9a]" />
                  ) : (
                    <Wifi size={13} className="text-[#5dff9a]" />
                  )}
                  <span className="hidden sm:inline">
                    {provenance.source === "LIVE_NOAA_OSDR"
                      ? "LIVE NOAA+OSDR"
                      : provenance.source === "LIVE_NOAA_SWPC"
                        ? "LIVE NOAA SWPC"
                        : provenance.source === "LIVE_NASA_DONKI"
                          ? "LIVE NASA DONKI"
                          : "VERIFIED NASA CACHE"}
                  </span>
                </button>
              </div>
            </div>
          </header>

          {handoff.corridor ? (
            <div
              data-testid="dopaimint-handoff-banner"
              className="mono flex flex-wrap items-center justify-between gap-2 border-b border-dashed border-[rgba(69,184,214,0.28)] bg-[#0c111d] px-2.5 py-1 text-[10.5px] text-[#cbd5e1]"
            >
              <span className="truncate">
                <strong className="text-[#45b8d6]">SYNCED FROM DOPAIMINT //</strong>{" "}
                <span className="text-[#f3efe6]">{handoff.corridor}</span>
                {" · "}
                <span className="text-[#ee6b47]">
                  GOES-18 {handoff.flux ?? provenance.goesProton10Mev} pfu
                </span>
                {" · "}
                <span>Kp {handoff.kp ?? provenance.swpcKp}</span>
                {" · "}
                <span className="text-[#5dff9a]">
                  Phase 01 Triage {handoff.waves ?? "Verified"}
                </span>
              </span>
              {!habitatState.running && habitatState.elapsedHours === 0 ? (
                <span className="hidden shrink-0 text-[10px] text-[#45b8d6] sm:inline">
                  Wired logic ready · Press Run Drill to step T+0.0h to T+{habitatState.durationHours}h
                </span>
              ) : null}
            </div>
          ) : null}

          <CadetTourBar
            open={tourOpen}
            onClose={() => setTourOpen(false)}
            onSetTab={(tab) => setActiveTab(tab)}
          />

          {/* Main Workspace Body */}
          <main className="relative flex min-h-0 flex-1 overflow-hidden">
            {activeTab === "trainer" ? (
              <div className="flex h-full w-full min-w-0 flex-col gap-1 p-1 sm:gap-1.5 sm:p-1.5 lg:flex-row lg:gap-2 lg:p-2">
                {/* Mobile (< lg) Sub-View Switcher + Compact Telemetry Ticker */}
                <div className="flex shrink-0 flex-col gap-1 lg:hidden">
                  <div
                    className="grid grid-cols-3 gap-1"
                    role="tablist"
                    aria-label="Trainer Mobile Panels"
                  >
                    <button
                      type="button"
                      role="tab"
                      aria-selected={mobilePane === "canvas"}
                      onClick={() => setMobilePane("canvas")}
                      className={`hud-btn justify-center px-1.5 py-0.5 text-[10px] sm:py-1 ${
                        mobilePane === "canvas" ? "hud-btn--primary" : ""
                      }`}
                    >
                      <Sparkles size={12} className="shrink-0" />
                      <span className="truncate">Canvas ({nodes.length})</span>
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={mobilePane === "palette"}
                      onClick={() => setMobilePane("palette")}
                      className={`hud-btn justify-center px-1.5 py-0.5 text-[10px] sm:py-1 ${
                        mobilePane === "palette" ? "hud-btn--primary" : ""
                      }`}
                    >
                      <LayoutGrid size={12} className="shrink-0" />
                      <span className="truncate">Palette</span>
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={mobilePane === "hud"}
                      onClick={() => setMobilePane("hud")}
                      className={`hud-btn justify-center px-1.5 py-0.5 text-[10px] sm:py-1 ${
                        mobilePane === "hud"
                          ? "hud-btn--primary"
                          : habitatState.failureReason ||
                              habitatState.cumulativeDoseMsv > activeDrill.maxSafeDoseMsv
                            ? "border-[#ff3b30] text-[#ff3b30]"
                            : ""
                      }`}
                    >
                      <Shield size={12} className="shrink-0" />
                      <span className="truncate">HUD ({habitatState.grade})</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setMobilePane("hud")}
                    className="mono short-vp-hide flex w-full items-center justify-between gap-2 rounded border border-[rgba(148,163,184,0.22)] bg-[#0b101b] px-2 py-0.5 text-[10px] text-[#cbd5e1]"
                    title="Open Habitat HUD"
                  >
                    <span className="truncate">
                      <span className="font-bold text-[#45b8d6]">
                        T+{habitatState.elapsedHours.toFixed(1)}/{habitatState.durationHours}h
                      </span>
                      {" | "}
                      {habitatState.protonFluxPfu}pfu
                    </span>
                    <span className="shrink-0">
                      Dose{" "}
                      <strong
                        className={
                          habitatState.cumulativeDoseMsv > activeDrill.maxSafeDoseMsv
                            ? "text-[#ff3b30]"
                            : "text-[#5dff9a]"
                        }
                      >
                        {habitatState.cumulativeDoseMsv.toFixed(1)}
                      </strong>
                      {" | "}
                      O2 <strong className="text-[#1abc9c]">{habitatState.o2Pct.toFixed(0)}%</strong>
                      {" | "}
                      Bat <strong className="text-[#fbbf24]">{habitatState.batteryPct.toFixed(0)}%</strong>
                    </span>
                  </button>
                </div>

                <ToolboxSidebar
                  onQuickAddNode={handleQuickAddNode}
                  mobileVisible={mobilePane === "palette"}
                />

                <FlowCanvasWorkspace
                  nodes={nodes}
                  edges={edges}
                  activeEdgeIds={liveEval.evalResult.activeEdgeIds}
                  activePresetId={activePresetId}
                  briefingHint={activeDrill.recommendedWiringHint}
                  mobileVisible={mobilePane === "canvas"}
                  onNodesChange={handleNodesChange}
                  onEdgesChange={handleEdgesChange}
                  onEdgesUpdate={(nextEdges) => {
                    setEdges(nextEdges);
                    setActivePresetId("custom");
                    if (habitatState.finished) setGraphStale(true);
                  }}
                  onNodesReplace={(nextNodes) => {
                    setNodes(nextNodes);
                    if (habitatState.finished) setGraphStale(true);
                  }}
                  onSpawnNodeAt={handleSpawnNodeAt}
                  onLoadPreset={handleLoadPreset}
                />

                <HabitatTopologyPanel
                  state={habitatState}
                  drill={activeDrill}
                  storm={activeStorm}
                  osdrStudy={activeOsdrStudy}
                  activeChips={activeChips}
                  graphStale={graphStale}
                  mobileVisible={mobilePane === "hud"}
                  onChangeOutpost={handleChangeOutpost}
                />
              </div>
            ) : activeTab === "donki" ? (
              <div className="h-full w-full overflow-hidden">
                <DonkiWeatherTab
                  events={events}
                  activeStormId={activeStorm.id}
                  provenance={provenance}
                  syncing={syncing}
                  onRefreshTelemetry={handleRefreshTelemetry}
                  onInjectStorm={handleInjectStorm}
                />
              </div>
            ) : (
              <div className="h-full w-full overflow-hidden">
                <OsdrBioLabTab
                  studies={studies}
                  activeOsdId={activeOsdrStudy.osdId}
                  onSelectStudy={handleSelectStudy}
                />
              </div>
            )}
          </main>

          {/* Parameter Editor & Debrief Modals */}
          <NodeFieldModal
            node={editingNode}
            onClose={() => setEditingNodeId(null)}
            onSave={handleSaveNodeFields}
          />

          <DebriefBanner
            open={debriefOpen}
            state={habitatState}
            drill={activeDrill}
            onClose={() => setDebriefOpen(false)}
            onReset={handleResetDrill}
            onNextDrill={handleNextDrill}
          />
        </div>
      </NodeRuntimeContext.Provider>
    </ReactFlowProvider>
  );
}

export default App;
