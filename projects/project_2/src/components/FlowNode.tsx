import React, { createContext, useContext } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import {
  Activity,
  Ban,
  BatteryCharging,
  Dna,
  Droplets,
  GitBranch,
  GitMerge,
  HeartPulse,
  Radiation,
  Settings2,
  Shield,
  SlidersHorizontal,
  Sprout,
  Trash2,
  Wind,
  Zap,
} from "lucide-react";
import type { FlowNode, SocketPosition } from "../types/flow";
import { getSocketColor } from "../utils/socketTypes";

export interface NodeRuntimeCallbacks {
  readonly activeNodeIds: ReadonlySet<string>;
  readonly nodeReadouts: ReadonlyMap<string, string>;
  readonly onEditNode: (nodeId: string) => void;
  readonly onDeleteNode: (nodeId: string) => void;
}

export const NodeRuntimeContext = createContext<NodeRuntimeCallbacks>({
  activeNodeIds: new Set<string>(),
  nodeReadouts: new Map<string, string>(),
  onEditNode: () => {},
  onDeleteNode: () => {},
});

function toReactFlowPosition(pos: SocketPosition): Position {
  if (pos === "left") return Position.Left;
  if (pos === "right") return Position.Right;
  if (pos === "top") return Position.Top;
  return Position.Bottom;
}

export function renderNodeIcon(iconName: string, color: string): React.ReactNode {
  const props = { size: 13, strokeWidth: 2.2, style: { color, flexShrink: 0 } };
  switch (iconName) {
    case "radiation":
      return <Radiation {...props} />;
    case "activity":
      return <Activity {...props} />;
    case "wind":
      return <Wind {...props} />;
    case "battery":
      return <BatteryCharging {...props} />;
    case "sliders":
      return <SlidersHorizontal {...props} />;
    case "dna":
      return <Dna {...props} />;
    case "git-merge":
      return <GitMerge {...props} />;
    case "git-branch":
      return <GitBranch {...props} />;
    case "ban":
      return <Ban {...props} />;
    case "shield":
      return <Shield {...props} />;
    case "droplets":
      return <Droplets {...props} />;
    case "zap":
      return <Zap {...props} />;
    case "sprout":
      return <Sprout {...props} />;
    case "heart-pulse":
      return <HeartPulse {...props} />;
    default:
      return <Activity {...props} />;
  }
}

export const FlowNodeComponent: React.FC<NodeProps<FlowNode>> = ({
  id,
  data,
  selected,
}) => {
  const ctx = useContext(NodeRuntimeContext);
  const isActive = ctx.activeNodeIds.has(id);
  const readout = ctx.nodeReadouts.get(id) ?? "READY";
  const fieldEntries = Object.entries(data.fields ?? {});

  if (data.isDiamond) {
    const leftSocket = data.sockets.find((s) => s.position === "left");
    const topSocket = data.sockets.find((s) => s.position === "top");
    const rightSocket = data.sockets.find((s) => s.position === "right");

    return (
      <div
        className={`ff-node--diamond ${selected ? "ff-node--selected" : ""} ${
          isActive ? "ff-node--active" : ""
        }`}
        data-testid={`flow-node-${id}`}
      >
        {leftSocket ? (
          <>
            <Handle
              id={leftSocket.id}
              type={leftSocket.direction === "input" ? "target" : "source"}
              position={Position.Left}
              className="ff-node__handle"
              style={{ backgroundColor: getSocketColor(leftSocket.type) }}
              title={`${leftSocket.label} (${leftSocket.type})`}
            />
            <span
              className="pointer-events-none absolute -left-3 top-[33%] z-10 bg-[rgba(10,6,5,0.88)] px-0.5 text-[8px] font-bold uppercase tracking-wider text-[#b7b4a2]"
            >
              {leftSocket.id === "a" ? "A" : "IN"}
            </span>
          </>
        ) : null}
        {topSocket ? (
          <>
            <Handle
              id={topSocket.id}
              type={topSocket.direction === "input" ? "target" : "source"}
              position={Position.Top}
              className="ff-node__handle"
              style={{ backgroundColor: getSocketColor(topSocket.type) }}
              title={`${topSocket.label} (${topSocket.type})`}
            />
            <span className="pointer-events-none absolute left-[57%] -top-2 z-10 bg-[rgba(10,6,5,0.88)] px-0.5 text-[8px] font-bold uppercase tracking-wider text-[#b7b4a2]">
              {topSocket.id === "b" ? "B" : topSocket.label}
            </span>
          </>
        ) : null}
        {rightSocket ? (
          <>
            <Handle
              id={rightSocket.id}
              type={rightSocket.direction === "input" ? "target" : "source"}
              position={Position.Right}
              className="ff-node__handle"
              style={{ backgroundColor: getSocketColor(rightSocket.type) }}
              title={`${rightSocket.label} (${rightSocket.type})`}
            />
            <span
              className="pointer-events-none absolute -right-5 top-[33%] z-10 bg-[rgba(10,6,5,0.88)] px-0.5 text-[8px] font-bold uppercase tracking-wider text-[#5dff9a]"
            >
              OUT
            </span>
          </>
        ) : null}

        <div className="ff-node--diamond-shape">
          <div className="ff-node--diamond-inner">
            {renderNodeIcon(data.icon, data.color)}
            <span className="text-[11px] font-bold tracking-wider uppercase">
              {data.label}
            </span>
            <span
              className="text-[9px] font-bold"
              style={{ color: isActive ? "#5dff9a" : "#8d8b7a" }}
            >
              {readout}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="ff-node__icon-btn nodrag"
          style={{
            position: "absolute",
            right: 2,
            bottom: 2,
            background: "rgba(10,6,5,0.92)",
          }}
          title="Delete gate"
          aria-label={`Delete ${data.label}`}
          onClick={(e) => {
            e.stopPropagation();
            ctx.onDeleteNode(id);
          }}
        >
          <Trash2 size={11} />
        </button>
      </div>
    );
  }

  const inputSockets = data.sockets.filter((s) => s.direction === "input");
  const outputSockets = data.sockets.filter((s) => s.direction === "output");

  return (
    <div
      className={`ff-node ${selected ? "ff-node--selected" : ""} ${
        isActive ? "ff-node--active" : ""
      }`}
      data-testid={`flow-node-${id}`}
    >
      <div
        className="ff-node__header"
        style={{ borderLeft: `3px solid ${data.color}` }}
      >
        <div className="ff-node__header-left">
          {renderNodeIcon(data.icon, data.color)}
          <span className="ff-node__title" title={data.label}>
            {data.label}
          </span>
        </div>
        <div className="ff-node__actions nodrag">
          {fieldEntries.length > 0 ? (
            <button
              type="button"
              className="ff-node__icon-btn"
              title="Edit node parameters"
              aria-label={`Configure ${data.label}`}
              onClick={(e) => {
                e.stopPropagation();
                ctx.onEditNode(id);
              }}
            >
              <Settings2 size={11} />
            </button>
          ) : null}
          <button
            type="button"
            className="ff-node__icon-btn"
            title="Remove node"
            aria-label={`Delete ${data.label}`}
            onClick={(e) => {
              e.stopPropagation();
              ctx.onDeleteNode(id);
            }}
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>

      <div className="ff-node__body">
        <div className="ff-node__sockets">
          <div className="ff-node__socket-col">
            {inputSockets.map((socket) => (
              <div key={socket.id} className="ff-node__socket-row">
                <Handle
                  id={socket.id}
                  type="target"
                  position={toReactFlowPosition(socket.position)}
                  className="ff-node__handle"
                  style={{
                    backgroundColor: getSocketColor(socket.type),
                    left: -15,
                  }}
                  title={`${socket.label} (${socket.type})`}
                />
                <span className="ff-node__socket-label">{socket.label}</span>
              </div>
            ))}
          </div>

          <div className="ff-node__socket-col">
            {outputSockets.map((socket) => (
              <div
                key={socket.id}
                className="ff-node__socket-row ff-node__socket-row--right"
              >
                <span className="ff-node__socket-label">{socket.label}</span>
                <Handle
                  id={socket.id}
                  type="source"
                  position={toReactFlowPosition(socket.position)}
                  className="ff-node__handle"
                  style={{
                    backgroundColor: getSocketColor(socket.type),
                    right: socket.position === "right" ? -15 : undefined,
                  }}
                  title={`${socket.label} (${socket.type})`}
                />
              </div>
            ))}
          </div>
        </div>

        {fieldEntries.length > 0 ? (
          <div
            className="ff-node__field-summary nodrag cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              ctx.onEditNode(id);
            }}
            title="Click to tune parameters"
          >
            {fieldEntries.map(([key, val]) => (
              <span key={key} className="ff-node__field-pill">
                {key}: {String(val)}
              </span>
            ))}
          </div>
        ) : null}

        <div
          className={`ff-node__runtime ${
            isActive ? "ff-node__runtime--active" : ""
          }`}
        >
          <span>STATE</span>
          <span>{readout}</span>
        </div>
      </div>
    </div>
  );
};
