import type { Connection } from "@xyflow/react";
import type {
  FlowEdge,
  FlowNode,
  SocketDefinition,
  SocketDirection,
  SocketPosition,
  SocketType,
} from "../types/flow";

const SOCKET_COLORS: Record<SocketType, string> = {
  signal: "#f3efe6",
  metric: "#45b8d6",
  storm: "#ee6b47",
  bio: "#38bdf8",
  module: "#54a0ff",
  any: "#94a3b8",
};

const SOCKET_COMPATIBILITY: Record<SocketType, readonly SocketType[]> = {
  signal: ["signal", "any"],
  metric: ["metric", "storm", "bio", "any"],
  storm: ["storm", "metric", "any"],
  bio: ["bio", "metric", "any"],
  module: ["module", "any"],
  any: ["signal", "metric", "storm", "bio", "module", "any"],
};

export function getSocketColor(type: SocketType): string {
  return SOCKET_COLORS[type] ?? "#6b6b5e";
}

export function canConnectSocketTypes(
  sourceType: SocketType,
  targetType: SocketType
): boolean {
  if (sourceType === "any" || targetType === "any") {
    return true;
  }
  return SOCKET_COMPATIBILITY[sourceType]?.includes(targetType) ?? false;
}

export function getSocketDefinition(
  node: FlowNode | undefined,
  handleId: string | null | undefined,
  direction?: SocketDirection
): SocketDefinition | undefined {
  if (!node || !handleId) return undefined;
  return node.data.sockets.find(
    (s) => s.id === handleId && (direction === undefined || s.direction === direction)
  );
}

export function getHandlePosition(position: SocketPosition): SocketPosition {
  return position;
}

export function createsCycle(
  connection: Pick<Connection, "source" | "target">,
  edges: readonly FlowEdge[]
): boolean {
  const { source, target } = connection;
  if (!source || !target) return false;
  if (source === target) return true;

  const adjacency = new Map<string, string[]>();
  for (const edge of edges) {
    const list = adjacency.get(edge.source) ?? [];
    list.push(edge.target);
    adjacency.set(edge.source, list);
  }

  const visited = new Set<string>();
  const stack: string[] = [target];
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;
    if (current === source) return true;
    if (visited.has(current)) continue;
    visited.add(current);
    const next = adjacency.get(current);
    if (next) {
      for (const n of next) {
        if (!visited.has(n)) stack.push(n);
      }
    }
  }
  return false;
}

export function isValidFlowConnection(
  connection: Connection,
  nodes: readonly FlowNode[],
  edges: readonly FlowEdge[]
): boolean {
  const { source, target, sourceHandle, targetHandle } = connection;
  if (!source || !target || source === target) return false;

  const nodesById = new Map(nodes.map((n) => [n.id, n]));
  const sourceNode = nodesById.get(source);
  const targetNode = nodesById.get(target);
  const sourceSocket = getSocketDefinition(sourceNode, sourceHandle, "output");
  const targetSocket = getSocketDefinition(targetNode, targetHandle, "input");

  if (!sourceSocket || !targetSocket) return false;
  if (!canConnectSocketTypes(sourceSocket.type, targetSocket.type)) return false;

  const duplicate = edges.some(
    (e) =>
      e.source === source &&
      e.target === target &&
      (e.sourceHandle ?? null) === (sourceHandle ?? null) &&
      (e.targetHandle ?? null) === (targetHandle ?? null)
  );
  if (duplicate) return false;

  const targetHandleTaken = edges.some(
    (e) =>
      e.target === target &&
      (e.targetHandle ?? null) === (targetHandle ?? null)
  );
  if (targetHandleTaken) return false;

  return !createsCycle(connection, edges);
}

export function deriveFlowEdgePresentation(
  edge: FlowEdge,
  nodesById: ReadonlyMap<string, FlowNode>,
  activeEdgeIds?: ReadonlySet<string>
): Pick<FlowEdge, "animated" | "style"> {
  const sourceNode = nodesById.get(edge.source);
  const sourceSocket = getSocketDefinition(sourceNode, edge.sourceHandle, "output");
  const baseColor = sourceSocket ? getSocketColor(sourceSocket.type) : "#6b6b5e";
  const isActive = activeEdgeIds?.has(edge.id) ?? false;

  return {
    animated: isActive || sourceSocket?.type === "signal" || sourceSocket?.type === "storm",
    style: {
      stroke: isActive ? "#5dff9a" : baseColor,
      strokeWidth: isActive ? 3 : 2,
      opacity: isActive ? 1 : 0.78,
    },
  };
}
