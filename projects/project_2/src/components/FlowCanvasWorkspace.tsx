import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  addEdge,
  useReactFlow,
  type Connection,
  type EdgeChange,
  type NodeChange,
  type NodeTypes,
} from "@xyflow/react";
import { LayoutGrid, Map as MapIcon, RotateCcw, Sparkles, Unplug } from "lucide-react";
import { FLOW_PRESETS } from "../data/nodeDefinitions";
import type { FlowEdge, FlowNode } from "../types/flow";
import { autoArrangeFlow } from "../utils/layoutFlow";
import {
  deriveFlowEdgePresentation,
  isValidFlowConnection,
} from "../utils/socketTypes";
import { FlowNodeComponent } from "./FlowNode";

interface FlowCanvasWorkspaceProps {
  readonly nodes: readonly FlowNode[];
  readonly edges: readonly FlowEdge[];
  readonly activeEdgeIds: ReadonlySet<string>;
  readonly activePresetId: string;
  readonly briefingHint: string;
  readonly mobileVisible?: boolean;
  readonly onNodesChange: (changes: NodeChange<FlowNode>[]) => void;
  readonly onEdgesChange: (changes: EdgeChange<FlowEdge>[]) => void;
  readonly onEdgesUpdate: (nextEdges: FlowEdge[]) => void;
  readonly onNodesReplace: (nextNodes: FlowNode[]) => void;
  readonly onSpawnNodeAt: (nodeType: string, x: number, y: number) => void;
  readonly onLoadPreset: (presetId: string) => void;
}

const nodeTypes: NodeTypes = {
  cradleNode: FlowNodeComponent,
};

export const FlowCanvasWorkspace: React.FC<FlowCanvasWorkspaceProps> = ({
  nodes,
  edges,
  activeEdgeIds,
  activePresetId,
  briefingHint,
  mobileVisible = true,
  onNodesChange,
  onEdgesChange,
  onEdgesUpdate,
  onNodesReplace,
  onSpawnNodeAt,
  onLoadPreset,
}) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const { screenToFlowPosition, fitView } = useReactFlow();
  const [showMiniMap, setShowMiniMap] = useState(false);
  const prevPresetRef = useRef(activePresetId);

  useEffect(() => {
    if (prevPresetRef.current !== activePresetId) {
      prevPresetRef.current = activePresetId;
      if (activePresetId !== "custom") {
        const timer = window.setTimeout(() => {
          fitView({ padding: 0.16, duration: 200 });
        }, 40);
        return () => window.clearTimeout(timer);
      }
    }
    return undefined;
  }, [activePresetId, fitView]);

  const nodesById = useMemo(
    () => new Map(nodes.map((n) => [n.id, n])),
    [nodes]
  );

  const styledEdges = useMemo(
    () =>
      edges.map((edge) => ({
        ...edge,
        ...deriveFlowEdgePresentation(edge, nodesById, activeEdgeIds),
      })),
    [edges, nodesById, activeEdgeIds]
  );

  const checkValidConnection = useCallback(
    (connection: Connection | FlowEdge) =>
      isValidFlowConnection(connection as Connection, nodes, edges),
    [nodes, edges]
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      if (!isValidFlowConnection(connection, nodes, edges)) return;
      const newEdge: FlowEdge = {
        ...connection,
        id: `e-${connection.source}-${connection.sourceHandle}-${connection.target}-${connection.targetHandle}-${Date.now()}`,
      };
      onEdgesUpdate(addEdge(newEdge, edges as FlowEdge[]));
    },
    [nodes, edges, onEdgesUpdate]
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const nodeType = event.dataTransfer.getData("application/reactflow");
      if (!nodeType) return;
      const pos = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      onSpawnNodeAt(nodeType, Math.round(pos.x), Math.round(pos.y));
    },
    [screenToFlowPosition, onSpawnNodeAt]
  );

  const handleAutoLayout = useCallback(() => {
    const arranged = autoArrangeFlow(nodes, edges);
    onNodesReplace(arranged);
    setTimeout(() => {
      fitView({ padding: 0.18, duration: 240 });
    }, 30);
  }, [nodes, edges, onNodesReplace, fitView]);

  const handleClearWires = useCallback(() => {
    onEdgesUpdate([]);
  }, [onEdgesUpdate]);

  return (
    <div
      className={`${
        mobileVisible ? "flex" : "hidden lg:flex"
      } hud-panel relative h-full min-w-0 flex-1 flex-col overflow-hidden`}
    >
      {/* Top Flow Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-1 border-b border-[rgba(255,71,0,0.28)] bg-[rgba(10,6,5,0.96)] px-2 py-1 sm:gap-1.5 sm:px-2.5 sm:py-1.5">
        <div className="flex w-full min-w-0 items-center justify-between gap-1.5 xl:w-auto">
          <div className="flex min-w-0 items-center gap-1.5">
            <Sparkles size={13} className="shrink-0 text-[#ff4700]" />
            <span className="hud-panel-title truncate">
              FRONTIER FLOW // AUTOMATION CANVAS
            </span>
          </div>
          <span className="mono shrink-0 text-[10px] text-[#8d8b7a] 2xl:hidden">
            {nodes.length}b / {edges.length}w
          </span>
          <span className="mono hidden text-[10px] text-[#8d8b7a] 2xl:inline">
            | {nodes.length} blocks, {edges.length} wires
          </span>
        </div>

        <div className="flex w-full flex-wrap items-center gap-1 sm:flex-nowrap sm:justify-between xl:w-auto xl:flex-wrap xl:justify-start">
          <select
            aria-label="Select Flow Preset"
            value={activePresetId}
            onChange={(e) => {
              if (e.target.value !== "custom") onLoadPreset(e.target.value);
            }}
            className="mono w-full min-w-0 border border-[rgba(255,71,0,0.4)] bg-[#060302] px-2 py-0.5 text-[10px] font-semibold text-[#fafae5] outline-none focus:border-[#ff4700] sm:w-auto sm:min-w-[180px] sm:py-1 xl:hidden"
          >
            {activePresetId === "custom" ? (
              <option value="custom">
                Custom Graph ({nodes.length}b / {edges.length}w)
              </option>
            ) : null}
            {FLOW_PRESETS.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name}
              </option>
            ))}
          </select>

          {FLOW_PRESETS.map((preset) => {
            const active = preset.id === activePresetId;
            return (
              <button
                key={preset.id}
                type="button"
                className={`hud-btn hidden px-2 py-1 text-[10px] xl:inline-flex ${
                  active ? "hud-btn--primary" : ""
                }`}
                onClick={() => onLoadPreset(preset.id)}
                title={preset.summary}
              >
                {preset.name}
              </button>
            );
          })}

          <div className="grid w-full grid-cols-4 gap-1 sm:flex sm:w-auto sm:shrink-0 sm:flex-wrap">
            <button
              type="button"
              className="hud-btn justify-center px-1.5 py-0.5 text-[10px] sm:justify-start sm:px-2 sm:py-1"
              onClick={handleAutoLayout}
              aria-label="Auto-Arrange"
              title="Auto-arrange flow graph using Dagre layout"
            >
              <LayoutGrid size={12} />
              <span className="xl:hidden">Layout</span>
              <span className="hidden xl:inline">Auto-Arrange</span>
            </button>

            <button
              type="button"
              className="hud-btn justify-center px-1.5 py-0.5 text-[10px] sm:justify-start sm:px-2 sm:py-1"
              onClick={handleClearWires}
              aria-label="Clear Wires"
              title="Clear all wires to test manual wiring"
            >
              <Unplug size={12} />
              <span className="xl:hidden">Unwire</span>
              <span className="hidden xl:inline">Clear Wires</span>
            </button>

            <button
              type="button"
              className="hud-btn justify-center px-1.5 py-0.5 text-[10px] sm:justify-start sm:px-2 sm:py-1"
              onClick={() => {
                onLoadPreset("preset-storm-standard");
                window.setTimeout(() => {
                  fitView({ padding: 0.16, duration: 200 });
                }, 40);
              }}
              aria-label="Reset Graph"
              title="Restore Recommended Protocol"
            >
              <RotateCcw size={12} />
              <span className="xl:hidden">Reset</span>
              <span className="hidden xl:inline">Reset Graph</span>
            </button>

            <button
              type="button"
              className={`hud-btn justify-center px-1.5 py-0.5 text-[10px] sm:justify-start sm:px-2 sm:py-1 ${
                showMiniMap ? "hud-btn--primary" : ""
              }`}
              onClick={() => setShowMiniMap((prev) => !prev)}
              aria-label="Toggle MiniMap"
              title="Toggle graph overview MiniMap"
              aria-pressed={showMiniMap}
            >
              <MapIcon size={12} />
              <span className="xl:hidden">Map</span>
              <span className="hidden xl:inline">MiniMap</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cadet Tip Strip */}
      <div className="short-vp-hide flex items-center justify-between gap-2 border-b border-[rgba(250,250,229,0.08)] bg-[rgba(255,71,0,0.07)] px-2 py-0.5 text-[10px] leading-tight sm:px-2.5 sm:py-1 sm:text-[11px] sm:leading-normal">
        <div className="line-clamp-1 min-w-0 flex-1 text-[#fafae5] sm:line-clamp-2 xl:line-clamp-none">
          <span className="mono mr-2 font-bold text-[#ff4700]">CADET WIRING BRIEF:</span>
          {briefingHint}
        </div>
        <div className="mono hidden shrink-0 items-center gap-2.5 text-[10px] text-[#9b9987] xl:flex">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 bg-[#ff4700]" />
            STORM
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 bg-[#1abc9c]" />
            METRIC
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 bg-[#c084fc]" />
            OSDR BIO
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 bg-[#fafae5]" />
            SIGNAL
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 bg-[#5dff9a]" />
            LIVE FIRE
          </span>
        </div>
      </div>

      {/* ReactFlow Canvas */}
      <div
        ref={wrapperRef}
        className="relative min-h-0 flex-1"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <ReactFlow
          className="ff-canvas"
          nodes={nodes as FlowNode[]}
          edges={styledEdges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={handleConnect}
          isValidConnection={checkValidConnection}
          connectionRadius={30}
          onEdgeClick={(_, edge) => {
            onEdgesUpdate(edges.filter((e) => e.id !== edge.id));
          }}
          fitView
          fitViewOptions={{ padding: 0.16 }}
          minZoom={0.18}
          maxZoom={2}
          deleteKeyCode={["Backspace", "Delete"]}
        >
          <Background color="rgba(255, 71, 0, 0.18)" gap={24} size={1} />
          <Controls showInteractive={false} />
          {showMiniMap ? (
            <MiniMap
              pannable
              zoomable
              style={{
                width: 128,
                height: 86,
                marginBottom: 24,
                backgroundColor: "rgba(9, 5, 4, 0.92)",
                border: "1px solid rgba(255, 71, 0, 0.4)",
              }}
              nodeColor={(node) => {
                const d = (node as FlowNode).data;
                return d?.color ?? "#ff4700";
              }}
            />
          ) : null}
        </ReactFlow>

        {edges.length === 0 ? (
          <div
            className={`short-vp-hide pointer-events-none absolute bottom-6 left-12 border border-[#ff4700] bg-[rgba(12,6,5,0.92)] px-2.5 py-1 text-[10px] text-[#fafae5] sm:bottom-3 sm:left-14 sm:px-3 sm:py-1.5 sm:text-[11px] ${
              showMiniMap
                ? "max-w-[calc(100%-204px)]"
                : "max-w-[calc(100%-60px)] sm:max-w-[calc(100%-175px)]"
            }`}
          >
            <span className="mono font-bold text-[#ff4700]">UNWIRED MODE:</span>{" "}
            Drag from a right/bottom square output socket to a matching input socket, or select a protocol above. Click any wire to delete it.
          </div>
        ) : (
          <div
            className={`short-vp-hide pointer-events-none absolute bottom-6 left-12 border border-[rgba(250,250,229,0.18)] bg-[rgba(10,6,5,0.85)] px-2 py-1 text-[9.5px] text-[#9b9987] sm:bottom-3 sm:left-14 sm:px-2.5 sm:text-[10px] ${
              showMiniMap
                ? "hidden max-w-[calc(100%-204px)] sm:block"
                : "max-w-[calc(100%-60px)] sm:max-w-[calc(100%-175px)]"
            }`}
          >
            Tip: Click a wire to disconnect it, or click a parameter pill on Threshold / OSDR Bio nodes to recalibrate.
          </div>
        )}
      </div>
    </div>
  );
};
