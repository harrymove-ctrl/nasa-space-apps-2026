import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import App from "../App";
import { NodeFieldModal } from "../components/NodeFieldModal";
import { createFlowNodeData } from "../data/nodeDefinitions";
import type { FlowNode } from "../types/flow";

beforeAll(() => {
  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver = ResizeObserverMock;
});

describe("CradleFlow App Integration UI", () => {
  it("renders immediately without login gate, steps simulation, adds nodes, injects DONKI storms, and runs OSDR quiz", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn(() => Promise.reject(new Error("Offline unit render"))) as unknown as typeof fetch;

    try {
      render(<App />);
      await waitFor(() => {
        expect(screen.getByText(/CRADLEFLOW \/\/ JUNIOR ASTRONAUT TRAINER/i)).toBeInTheDocument();
      });
      expect(screen.getByText(/FRONTIER FLOW \/\/ AUTOMATION CANVAS/i)).toBeInTheDocument();
      expect(screen.getByText(/CRADLEOS \/\/ HABITAT HUD/i)).toBeInTheDocument();
      expect(screen.getByText(/9 blocks, 7 wires/i)).toBeInTheDocument();

      // Quick-add a logic gate from the Flow Palette toolbox
      fireEvent.click(screen.getByRole("button", { name: /Add AND to canvas/i }));
      expect(screen.getByText(/10 blocks, 7 wires/i)).toBeInTheDocument();

      // Step simulation forward 0.5h via button
      fireEvent.click(screen.getByRole("button", { name: /\+0\.5h/i }));
      expect(screen.getByText(/T\+0\.5 \/ 24h/i)).toBeInTheDocument();

      // Switch to DONKI Storms tab and inject storm
      fireEvent.click(screen.getByRole("button", { name: /DONKI Storms/i }));
      expect(screen.getByText(/NASA DONKI & NOAA SWPC SPACE WEATHER ARCHIVE/i)).toBeInTheDocument();
      const injectButtons = screen.getAllByRole("button", { name: /Inject Storm/i });
      fireEvent.click(injectButtons[0]);
      expect(screen.getByText(/FRONTIER FLOW \/\/ AUTOMATION CANVAS/i)).toBeInTheDocument();
      expect(screen.getByText(/T\+0\.0 \/ 24h/i)).toBeInTheDocument();

      // Switch to OSDR Bio-Lab tab and verify quiz interaction
      fireEvent.click(screen.getByRole("button", { name: /OSDR Bio-Lab/i }));
      expect(screen.getByText(/NASA OSDR RADIOBIOLOGY & COUNTERMEASURE LAB/i)).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: /1 GeV\/n high-LET Iron/i }));
      expect(screen.getByText(/CADET BIO SCORE: 1\/3/i)).toBeInTheDocument();
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("edits node threshold parameters cleanly via NodeFieldModal", () => {
    const sampleNode: FlowNode = {
      id: "n-thresh-test",
      type: "cradleNode",
      position: { x: 0, y: 0 },
      data: createFlowNodeData("threshold-compare", {
        fields: { operator: ">=", threshold: 50 },
      }),
    };
    const onSave = vi.fn();
    const onClose = vi.fn();

    render(
      <NodeFieldModal node={sampleNode} onClose={onClose} onSave={onSave} />
    );

    expect(screen.getByText(/NODE PARAMETER CALIBRATION/i)).toBeInTheDocument();
    const input = screen.getByLabelText(/Threshold Value/i);
    fireEvent.change(input, { target: { value: "85" } });
    fireEvent.click(screen.getByRole("button", { name: /Apply Parameters/i }));

    expect(onSave).toHaveBeenCalledWith("n-thresh-test", {
      operator: ">=",
      threshold: 85,
    });
    expect(onClose).toHaveBeenCalled();
  });

  it("allows clearing and enforces min/max bounds inside NodeFieldModal", () => {
    const shelterNode: FlowNode = {
      id: "n-shelter-test",
      type: "cradleNode",
      position: { x: 0, y: 0 },
      data: createFlowNodeData("action-storm-shelter", {
        fields: { shieldGainGcm2: 40 },
      }),
    };
    const onSave = vi.fn();
    const onClose = vi.fn();

    render(
      <NodeFieldModal node={shelterNode} onClose={onClose} onSave={onSave} />
    );

    const input = screen.getByLabelText(/Shelter Shielding/i) as HTMLInputElement;
    // Clearing input stays empty while typing (does not snap to 0 mid-edit)
    fireEvent.change(input, { target: { value: "" } });
    expect(input.value).toBe("");

    // Entering above max (80) clamps cleanly to 80 on Apply
    fireEvent.change(input, { target: { value: "250" } });
    fireEvent.click(screen.getByRole("button", { name: /Apply Parameters/i }));

    expect(onSave).toHaveBeenCalledWith("n-shelter-test", {
      shieldGainGcm2: 80,
    });
    expect(onClose).toHaveBeenCalled();
  });

  it("switches mobile trainer panes, preset dropdown, and debrief modal cleanly", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn(() => Promise.reject(new Error("Offline unit render"))) as unknown as typeof fetch;

    try {
      render(<App />);
      await waitFor(() => {
        expect(screen.getByText(/CRADLEFLOW \/\/ JUNIOR ASTRONAUT TRAINER/i)).toBeInTheDocument();
      });

      const canvasTab = screen.getByRole("tab", { name: /Canvas/i });
      const paletteTab = screen.getByRole("tab", { name: /Palette/i });
      const hudTab = screen.getByRole("tab", { name: /HUD/i });

      expect(canvasTab).toHaveAttribute("aria-selected", "true");
      expect(paletteTab).toHaveAttribute("aria-selected", "false");
      expect(hudTab).toHaveAttribute("aria-selected", "false");

      fireEvent.click(paletteTab);
      expect(paletteTab).toHaveAttribute("aria-selected", "true");
      expect(canvasTab).toHaveAttribute("aria-selected", "false");

      fireEvent.click(hudTab);
      expect(hudTab).toHaveAttribute("aria-selected", "true");
      expect(paletteTab).toHaveAttribute("aria-selected", "false");

      // Preset select updates flow graph cleanly
      const presetSelect = screen.getByLabelText(/Select Flow Preset/i) as HTMLSelectElement;
      fireEvent.change(presetSelect, { target: { value: "preset-dual-gate-pro" } });
      expect(screen.getByText(/11 blocks, 8 wires/i)).toBeInTheDocument();

      // Debrief modal opens cleanly in-progress before completion and closes cleanly
      fireEvent.click(screen.getByRole("button", { name: /Debrief/i }));
      expect(screen.getByRole("dialog", { name: /Junior Astronaut Mission Debrief/i })).toBeInTheDocument();
      expect(screen.getByText(/DRILL IN PROGRESS \(T\+0\.0\/24h\)/i)).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: /Close debrief/i }));
      expect(screen.queryByRole("dialog", { name: /Junior Astronaut Mission Debrief/i })).not.toBeInTheDocument();

      // Clear Wires -> Unwired mode -> Reset Graph restores Standard Storm Protocol wires
      fireEvent.click(screen.getByRole("button", { name: /Clear Wires/i }));
      expect(screen.getByText(/UNWIRED MODE:/i)).toBeInTheDocument();
      expect(screen.getByText(/11 blocks, 0 wires/i)).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: /Reset Graph/i }));
      expect(screen.getByText(/9 blocks, 7 wires/i)).toBeInTheDocument();
      expect(screen.queryByText(/UNWIRED MODE:/i)).not.toBeInTheDocument();

      // Guided cadet tour opens, steps to OSDR Bio-Lab, and closes cleanly
      fireEvent.click(screen.getByTestId("cadet-tour-toggle"));
      expect(screen.getByTestId("cadet-tour-bar")).toBeInTheDocument();
      expect(screen.getByText(/01 \/ Select Storm & Outpost/i)).toBeInTheDocument();
      fireEvent.click(screen.getByTestId("cadet-tour-next"));
      fireEvent.click(screen.getByTestId("cadet-tour-next"));
      fireEvent.click(screen.getByTestId("cadet-tour-next"));
      expect(screen.getByText(/04 \/ Live DONKI & OSDR Bio-Lab/i)).toBeInTheDocument();
      expect(screen.getByText(/NASA OSDR RADIOBIOLOGY & COUNTERMEASURE LAB/i)).toBeInTheDocument();
      fireEvent.click(screen.getByTestId("cadet-tour-close"));
      expect(screen.queryByTestId("cadet-tour-bar")).not.toBeInTheDocument();
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("renders DopaiMint telemetry handoff banner when launched with corridor query context", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn(() => Promise.reject(new Error("Offline unit render"))) as unknown as typeof fetch;
    window.history.replaceState({}, "", "/?corridor=Butte%20230%20kV&flux=1.8&kp=4&waves=3/3");

    try {
      render(<App />);
      await waitFor(() => {
        expect(screen.getByTestId("dopaimint-handoff-banner")).toBeInTheDocument();
      });
      const bannerText = screen.getByTestId("dopaimint-handoff-banner").textContent ?? "";
      expect(bannerText).toContain("SYNCED FROM DOPAIMINT");
      expect(bannerText).toContain("Butte 230 kV");
      expect(bannerText).toContain("GOES-18 1.8 pfu");
      expect(bannerText).toContain("3/3");
      expect(screen.getByTestId("back-to-dopaimint")).toBeInTheDocument();
    } finally {
      window.history.replaceState({}, "", "/");
      globalThis.fetch = originalFetch;
    }
  });
});
