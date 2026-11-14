import dagre from "dagre";
import type { FlowEdge, FlowNode } from "../types/flow";

const DEFAULT_WIDTH = 228;
const DEFAULT_HEIGHT = 112;
const DIAMOND_SIZE = 128;

export function autoArrangeFlow(
  nodes: readonly FlowNode[],
  edges: readonly FlowEdge[]
): FlowNode[] {
  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({
    rankdir: "LR",
    nodesep: 52,
    ranksep: 96,
    marginx: 40,
    marginy: 40,
  });

  for (const node of nodes) {
    const isDiamond = Boolean(node.data.isDiamond);
    graph.setNode(node.id, {
      width: isDiamond ? DIAMOND_SIZE : DEFAULT_WIDTH,
      height: isDiamond ? DIAMOND_SIZE : DEFAULT_HEIGHT,
    });
  }

  for (const edge of edges) {
    if (edge.source && edge.target) {
      graph.setEdge(edge.source, edge.target);
    }
  }

  dagre.layout(graph);

  return nodes.map((node) => {
    const layout = graph.node(node.id);
    if (!layout) return node;
    const isDiamond = Boolean(node.data.isDiamond);
    const width = isDiamond ? DIAMOND_SIZE : DEFAULT_WIDTH;
    const height = isDiamond ? DIAMOND_SIZE : DEFAULT_HEIGHT;
    return {
      ...node,
      position: {
        x: Math.round(layout.x - width / 2),
        y: Math.round(layout.y - height / 2),
      },
    };
  });
}
