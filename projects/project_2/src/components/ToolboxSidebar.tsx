import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import {
  NODE_CATEGORY_LABELS,
  NODE_DEFINITIONS,
} from "../data/nodeDefinitions";
import type { NodeCategory } from "../types/flow";
import { renderNodeIcon } from "./FlowNode";

interface ToolboxSidebarProps {
  readonly onQuickAddNode: (nodeType: string) => void;
  readonly mobileVisible?: boolean;
}

const CATEGORY_ORDER: readonly NodeCategory[] = [
  "sensor-trigger",
  "threshold-bio",
  "logic-gate",
  "habitat-action",
];

export const ToolboxSidebar: React.FC<ToolboxSidebarProps> = ({
  onQuickAddNode,
  mobileVisible = false,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [query, setQuery] = useState("");

  const filteredByCategory = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CATEGORY_ORDER.map((category) => {
      const items = NODE_DEFINITIONS.filter((d) => {
        if (d.category !== category) return false;
        if (!q) return true;
        return (
          d.label.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q)
        );
      });
      return { category, items };
    });
  }, [query]);

  const asideVisibility = collapsed
    ? mobileVisible
      ? "flex lg:hidden"
      : "hidden"
    : mobileVisible
      ? "flex"
      : "hidden lg:flex";

  return (
    <>
      {collapsed ? (
        <div className="hud-panel hidden h-full w-10 shrink-0 flex-col items-center justify-between py-3 lg:flex">
          <button
            type="button"
            className="hud-btn p-1.5"
            title="Expand Logic Block Toolbox"
            aria-label="Expand Toolbox"
            onClick={() => setCollapsed(false)}
          >
            <ChevronRight size={14} />
          </button>
          <span
            className="mono text-[10px] font-bold tracking-[0.2em] text-[#45b8d6]"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            FRONTIER FLOW PALETTE
          </span>
          <span />
        </div>
      ) : null}

      <aside
        className={`${asideVisibility} hud-panel h-full w-full min-w-0 flex-col overflow-hidden lg:w-52 lg:shrink-0 xl:w-64`}
        aria-label="Frontier Flow Node Toolbox"
      >
        <div className="flex items-center justify-between border-b border-dashed border-[rgba(148,163,184,0.22)] px-3 py-2.5">
          <div className="min-w-0">
            <div className="hud-panel-title">FLOW PALETTE</div>
            <div className="text-[11px] text-[#94a3b8]">
              Drag to canvas or click +
            </div>
          </div>
          <button
            type="button"
            className="hud-btn hidden px-1.5 py-1 lg:inline-flex"
            title="Collapse Toolbox"
            aria-label="Collapse Toolbox"
            onClick={() => setCollapsed(true)}
          >
            <ChevronLeft size={14} />
          </button>
        </div>

      <div className="border-b border-dashed border-[rgba(148,163,184,0.16)] p-2">
        <div className="flex items-center gap-1.5 rounded border border-[rgba(148,163,184,0.24)] bg-[#090c14] px-2 py-1.5">
          <Search size={12} className="text-[#94a3b8]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter sensors, gates..."
            className="mono w-full bg-transparent text-[11px] text-[#f3efe6] outline-none placeholder:text-[#64748b]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2.5 space-y-3">
        {filteredByCategory.map(({ category, items }) =>
          items.length === 0 ? null : (
            <section key={category} className="space-y-1.5">
              <div className="mono text-[10px] font-bold uppercase tracking-wider text-[#45b8d6]">
                {NODE_CATEGORY_LABELS[category]}
              </div>
              <div className="space-y-1.5">
                {items.map((def) => (
                  <div
                    key={def.type}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("application/reactflow", def.type);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    className="group flex cursor-grab items-center justify-between gap-2 rounded border border-[rgba(148,163,184,0.18)] bg-[rgba(16,22,34,0.65)] px-2.5 py-2 transition hover:border-[#45b8d6] hover:bg-[rgba(69,184,214,0.09)] active:cursor-grabbing"
                    style={{ borderLeft: `3px solid ${def.color}` }}
                    title={def.description}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      {renderNodeIcon(def.icon, def.color)}
                      <div className="min-w-0">
                        <div className="mono truncate text-[11px] font-semibold text-[#f3efe6]">
                          {def.label}
                        </div>
                        <div className="truncate text-[10px] text-[#94a3b8]">
                          {def.sockets.length} sockets
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="hud-btn px-1.5 py-1 opacity-80 group-hover:opacity-100"
                      onClick={() => onQuickAddNode(def.type)}
                      aria-label={`Add ${def.label} to canvas`}
                      title="Add block to canvas"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )
        )}
      </div>
      </aside>
    </>
  );
};
