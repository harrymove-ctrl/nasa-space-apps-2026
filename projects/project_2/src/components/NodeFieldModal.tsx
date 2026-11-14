import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { NODE_DEFINITIONS_BY_TYPE } from "../data/nodeDefinitions";
import type { FlowNode, FlowNodeFieldValue } from "../types/flow";

interface NodeFieldModalProps {
  readonly node: FlowNode | null;
  readonly onClose: () => void;
  readonly onSave: (nodeId: string, fields: Record<string, FlowNodeFieldValue>) => void;
}

export const NodeFieldModal: React.FC<NodeFieldModalProps> = ({
  node,
  onClose,
  onSave,
}) => {
  const [draft, setDraft] = useState<Record<string, string>>({});

  useEffect(() => {
    if (node) {
      const initial: Record<string, string> = {};
      for (const [k, v] of Object.entries(node.data.fields ?? {})) {
        initial[k] = String(v);
      }
      setDraft(initial);
    }
  }, [node]);

  if (!node) return null;
  const def = NODE_DEFINITIONS_BY_TYPE.get(node.data.type);
  const fieldDefs = def?.fieldDefs ?? [];

  const handleApply = () => {
    const normalized: Record<string, FlowNodeFieldValue> = {};
    for (const field of fieldDefs) {
      const raw = draft[field.key] ?? "";
      if (field.type === "number") {
        const parsed = Number(raw);
        const fallback = Number(
          node.data.fields?.[field.key] ?? def?.defaultFields?.[field.key] ?? 0
        );
        let num = Number.isFinite(parsed) && raw.trim() !== "" ? parsed : fallback;
        if (field.min !== undefined) num = Math.max(field.min, num);
        if (field.max !== undefined) num = Math.min(field.max, num);
        normalized[field.key] = num;
      } else {
        normalized[field.key] = raw;
      }
    }
    onSave(node.id, normalized);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Configure ${node.data.label}`}
      onClick={onClose}
    >
      <div
        className="hud-panel max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between gap-2 border-b border-[rgba(255,71,0,0.28)] pb-2">
          <div className="min-w-0">
            <div className="hud-panel-title">NODE PARAMETER CALIBRATION</div>
            <div className="mt-0.5 truncate text-sm font-bold text-[#fafae5]">
              {node.data.label}
            </div>
          </div>
          <button
            type="button"
            className="hud-btn shrink-0"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={14} />
          </button>
        </div>

        <p className="mb-4 text-xs leading-relaxed text-[#b9b8a7]">
          {def?.description}
        </p>

        <div className="flex flex-col gap-3">
          {fieldDefs.map((field) => {
            const value = draft[field.key] ?? "";
            return (
              <label key={field.key} className="flex flex-col gap-1">
                <span className="mono text-[11px] font-semibold uppercase tracking-wider text-[#fafae5]">
                  {field.label}
                  {field.type === "number" &&
                  (field.min !== undefined || field.max !== undefined) ? (
                    <span className="ml-2 text-[10px] font-normal text-[#8d8b7a]">
                      [{field.min ?? ""}..{field.max ?? ""}]
                    </span>
                  ) : null}
                </span>
                {field.type === "select" ? (
                  <select
                    className="mono border border-[rgba(250,250,229,0.28)] bg-[#0b0605] px-2.5 py-2 text-xs text-[#fafae5] outline-none focus:border-[#ff4700]"
                    value={value}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        [field.key]: e.target.value,
                      }))
                    }
                  >
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    className="mono border border-[rgba(250,250,229,0.28)] bg-[#0b0605] px-2.5 py-2 text-xs text-[#fafae5] outline-none focus:border-[#ff4700]"
                    value={value}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        [field.key]: e.target.value,
                      }))
                    }
                  />
                )}
              </label>
            );
          })}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className="hud-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="hud-btn hud-btn--primary"
            onClick={handleApply}
          >
            Apply Parameters
          </button>
        </div>
      </div>
    </div>
  );
};
