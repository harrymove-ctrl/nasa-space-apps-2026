import type { Edge, Node } from "@xyflow/react";

export type SocketType =
  | "storm"
  | "metric"
  | "signal"
  | "bio"
  | "module"
  | "any";

export type SocketPosition = "left" | "right" | "top" | "bottom";
export type SocketDirection = "input" | "output";

export type NodeCategory =
  | "sensor-trigger"
  | "threshold-bio"
  | "logic-gate"
  | "habitat-action";

export interface SocketDefinition {
  readonly id: string;
  readonly type: SocketType;
  readonly position: SocketPosition;
  readonly direction: SocketDirection;
  readonly label: string;
}

export interface NodeFieldOption {
  readonly label: string;
  readonly value: string;
}

export interface NodeFieldDefinition {
  readonly key: string;
  readonly label: string;
  readonly type: "number" | "select" | "text";
  readonly min?: number;
  readonly max?: number;
  readonly step?: number;
  readonly options?: readonly NodeFieldOption[];
  readonly placeholder?: string;
}

export interface NodeDefinition {
  readonly type: string;
  readonly label: string;
  readonly description: string;
  readonly color: string;
  readonly icon: string;
  readonly category: NodeCategory;
  readonly isDiamond?: boolean;
  readonly sockets: readonly SocketDefinition[];
  readonly defaultFields?: Record<string, string | number>;
  readonly fieldDefs?: readonly NodeFieldDefinition[];
  readonly chipLabel: string;
}

export type FlowNodeFieldValue = string | number;

export interface FlowNodeData extends Record<string, unknown> {
  readonly label: string;
  readonly type: string;
  readonly category: NodeCategory;
  readonly color: string;
  readonly icon: string;
  readonly sockets: readonly SocketDefinition[];
  readonly fields: Record<string, FlowNodeFieldValue>;
  readonly isDiamond?: boolean;
  readonly runtimeActive?: boolean;
  readonly runtimeOutputLabel?: string;
}

export type FlowNode = Node<FlowNodeData>;
export type FlowEdge = Edge;

export interface FlowPreset {
  readonly id: string;
  readonly name: string;
  readonly badge: string;
  readonly summary: string;
  readonly nodes: readonly FlowNode[];
  readonly edges: readonly FlowEdge[];
}

export interface FlowEvalResult {
  readonly nodeOutputs: ReadonlyMap<string, Record<string, boolean | number | string>>;
  readonly activeNodeIds: ReadonlySet<string>;
  readonly activeEdgeIds: ReadonlySet<string>;
  readonly nodeReadouts: ReadonlyMap<string, string>;
}
