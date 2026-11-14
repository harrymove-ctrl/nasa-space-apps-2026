import type {
  FlowNode,
  FlowNodeData,
  FlowPreset,
  NodeCategory,
  NodeDefinition,
} from "../types/flow";

export const NODE_CATEGORY_LABELS: Record<NodeCategory, string> = {
  "sensor-trigger": "NASA & Habitat Sensors",
  "threshold-bio": "Thresholds & OSDR Bio",
  "logic-gate": "Logic Gates",
  "habitat-action": "Outpost Actuators",
};

export const NODE_DEFINITIONS: readonly NodeDefinition[] = [
  {
    type: "donki-proton-sensor",
    label: "DONKI Proton Flux",
    description:
      "Reads real-time or drill solar energetic proton flux (>=10 MeV in pfu) from GOES-18 / NASA DONKI.",
    color: "#ff4700",
    icon: "radiation",
    category: "sensor-trigger",
    chipLabel: "SEP-FLUX",
    sockets: [
      {
        id: "flux",
        type: "storm",
        position: "right",
        direction: "output",
        label: "Proton pfu",
      },
      {
        id: "stormAlert",
        type: "signal",
        position: "right",
        direction: "output",
        label: "Alert >= 50",
      },
    ],
  },
  {
    type: "donki-kp-sensor",
    label: "DONKI Kp Geomagnetic",
    description:
      "Tracks planetary geomagnetic storm index (Kp 0 to 9) from NASA DONKI / NOAA SWPC.",
    color: "#ff6b35",
    icon: "activity",
    category: "sensor-trigger",
    chipLabel: "KP-IDX",
    sockets: [
      {
        id: "kp",
        type: "storm",
        position: "right",
        direction: "output",
        label: "Kp Index",
      },
      {
        id: "geomagAlert",
        type: "signal",
        position: "right",
        direction: "output",
        label: "Alert >= 6",
      },
    ],
  },
  {
    type: "habitat-o2-sensor",
    label: "Habitat O2 Sensor",
    description:
      "Monitors cabin oxygen concentration (%) and emits a boolean alert if cabin air thins.",
    color: "#1abc9c",
    icon: "wind",
    category: "sensor-trigger",
    chipLabel: "O2-CABIN",
    sockets: [
      {
        id: "o2",
        type: "metric",
        position: "right",
        direction: "output",
        label: "O2 %",
      },
      {
        id: "lowO2",
        type: "signal",
        position: "right",
        direction: "output",
        label: "Low < 19.8%",
      },
    ],
  },
  {
    type: "battery-power-sensor",
    label: "Solar & Battery Sensor",
    description:
      "Measures habitat energy reserve (%) under solar flare and Martian dust attenuation.",
    color: "#f59e0b",
    icon: "battery",
    category: "sensor-trigger",
    chipLabel: "PWR-SOC",
    sockets: [
      {
        id: "battery",
        type: "metric",
        position: "right",
        direction: "output",
        label: "Battery %",
      },
      {
        id: "lowPower",
        type: "signal",
        position: "right",
        direction: "output",
        label: "Low < 50%",
      },
    ],
  },
  {
    type: "threshold-compare",
    label: "Threshold Gate",
    description:
      "Compares any incoming numeric sensor stream against a custom operator (>= or <=) and setpoint.",
    color: "#2dd4bf",
    icon: "sliders",
    category: "threshold-bio",
    chipLabel: "THRESH",
    defaultFields: {
      operator: ">=",
      threshold: 50,
    },
    fieldDefs: [
      {
        key: "operator",
        label: "Comparator",
        type: "select",
        options: [
          { label: "Greater or Equal (>=)", value: ">=" },
          { label: "Less or Equal (<=)", value: "<=" },
        ],
      },
      {
        key: "threshold",
        label: "Threshold Value",
        type: "number",
        min: 0,
        max: 2000,
        step: 1,
      },
    ],
    sockets: [
      {
        id: "value",
        type: "metric",
        position: "left",
        direction: "input",
        label: "Metric In",
      },
      {
        id: "triggered",
        type: "signal",
        position: "right",
        direction: "output",
        label: "Signal Out",
      },
    ],
  },
  {
    type: "osdr-bio-monitor",
    label: "NASA OSDR Bio Monitor",
    description:
      "Evaluates biological tissue stress using verified NASA OSDR radiobiology studies (OSD-73 through OSD-714).",
    color: "#c084fc",
    icon: "dna",
    category: "threshold-bio",
    chipLabel: "OSDR-BIO",
    defaultFields: {
      osdId: "OSD-109",
      stressLimit: 32,
    },
    fieldDefs: [
      {
        key: "osdId",
        label: "NASA OSDR Reference Study",
        type: "select",
        options: [
          { label: "OSD-109 // 56Fe Cardiomyocyte", value: "OSD-109" },
          { label: "OSD-117 // 1H Proton Baseline", value: "OSD-117" },
          { label: "OSD-73 // Human Bronchial HBEC3KT", value: "OSD-73" },
          { label: "OSD-340 // Mlh1 HSC Genome Risk", value: "OSD-340" },
          { label: "OSD-97 // Yeast Oxidative HZE", value: "OSD-97" },
          { label: "OSD-714 // Lunar 1/6g Centrifuge", value: "OSD-714" },
        ],
      },
      {
        key: "stressLimit",
        label: "Bio-Stress Trigger (%)",
        type: "number",
        min: 5,
        max: 100,
        step: 1,
      },
    ],
    sockets: [
      {
        id: "flux",
        type: "storm",
        position: "left",
        direction: "input",
        label: "Storm Flux",
      },
      {
        id: "bioRisk",
        type: "bio",
        position: "right",
        direction: "output",
        label: "Bio Stress %",
      },
      {
        id: "bioCritical",
        type: "signal",
        position: "right",
        direction: "output",
        label: "Critical Signal",
      },
    ],
  },
  {
    type: "gate-and",
    label: "AND",
    description: "Outputs true only when both input signals A and B are active.",
    color: "#f1c40f",
    icon: "git-merge",
    category: "logic-gate",
    isDiamond: true,
    chipLabel: "AND",
    sockets: [
      { id: "a", type: "signal", position: "left", direction: "input", label: "In A" },
      { id: "b", type: "signal", position: "top", direction: "input", label: "In B" },
      { id: "out", type: "signal", position: "right", direction: "output", label: "Out" },
    ],
  },
  {
    type: "gate-or",
    label: "OR",
    description: "Outputs true whenever either input signal A or B is active.",
    color: "#f1c40f",
    icon: "git-branch",
    category: "logic-gate",
    isDiamond: true,
    chipLabel: "OR",
    sockets: [
      { id: "a", type: "signal", position: "left", direction: "input", label: "In A" },
      { id: "b", type: "signal", position: "top", direction: "input", label: "In B" },
      { id: "out", type: "signal", position: "right", direction: "output", label: "Out" },
    ],
  },
  {
    type: "gate-not",
    label: "NOT",
    description: "Inverts a boolean automation signal (true becomes false, false becomes true).",
    color: "#f1c40f",
    icon: "ban",
    category: "logic-gate",
    isDiamond: true,
    chipLabel: "NOT",
    sockets: [
      { id: "in", type: "signal", position: "left", direction: "input", label: "In" },
      { id: "out", type: "signal", position: "right", direction: "output", label: "Out" },
    ],
  },
  {
    type: "action-storm-shelter",
    label: "Seal Storm Shelter",
    description:
      "Moves crew into the regolith/polyethylene shelter core (+15 to +80 g/cm2 shielding, -58% shelter dose penetration, +2.2 kW life support).",
    color: "#5dff9a",
    icon: "shield",
    category: "habitat-action",
    chipLabel: "SHELTER",
    defaultFields: {
      shieldGainGcm2: 38,
    },
    fieldDefs: [
      {
        key: "shieldGainGcm2",
        label: "Shelter Shielding (g/cm2)",
        type: "number",
        min: 15,
        max: 80,
        step: 5,
      },
    ],
    sockets: [
      {
        id: "trigger",
        type: "signal",
        position: "left",
        direction: "input",
        label: "Activate",
      },
    ],
  },
  {
    type: "action-water-shield",
    label: "Water-Wall Shield",
    description:
      "Pumps gray/potable water into perimeter wall bladders (+28 g/cm2 hydrogen-rich proton shield, 0.35%/hr circulation loss).",
    color: "#54a0ff",
    icon: "droplets",
    category: "habitat-action",
    chipLabel: "H2O-WALL",
    sockets: [
      {
        id: "trigger",
        type: "signal",
        position: "left",
        direction: "input",
        label: "Activate",
      },
    ],
  },
  {
    type: "action-divert-shield",
    label: "Active Magnetic Shield",
    description:
      "Energizes active deflector coils (+24 g/cm2 bonus attenuation, high 3.6 kW draw: gate behind storm threshold!).",
    color: "#38bdf8",
    icon: "zap",
    category: "habitat-action",
    chipLabel: "MAG-SHLD",
    defaultFields: {
      coilPowerKw: 3.6,
    },
    fieldDefs: [
      {
        key: "coilPowerKw",
        label: "Coil Draw (kW)",
        type: "number",
        min: 2,
        max: 7,
        step: 0.4,
      },
    ],
    sockets: [
      {
        id: "trigger",
        type: "signal",
        position: "left",
        direction: "input",
        label: "Activate",
      },
    ],
  },
  {
    type: "action-shed-hydroponics",
    label: "Shed Hydroponics Load",
    description:
      "Switches grow-bay LEDs to standby mode, saving 4.2 kW power during low-battery storms while pausing crop growth.",
    color: "#fbbf24",
    icon: "sprout",
    category: "habitat-action",
    chipLabel: "ECO-LOAD",
    sockets: [
      {
        id: "trigger",
        type: "signal",
        position: "left",
        direction: "input",
        label: "Activate",
      },
    ],
  },
  {
    type: "action-o2-scrubber",
    label: "Boost O2 Scrubber",
    description:
      "Runs high-rate Sabatier/electrolysis O2 recovery (+1.95% O2/hr, +1.8 kW power draw).",
    color: "#1abc9c",
    icon: "wind",
    category: "habitat-action",
    chipLabel: "O2-BOOST",
    sockets: [
      {
        id: "trigger",
        type: "signal",
        position: "left",
        direction: "input",
        label: "Activate",
      },
    ],
  },
  {
    type: "action-bio-countermeasure",
    label: "OSDR Bio-Countermeasure",
    description:
      "Administers NASA OSDR antioxidant/DNA-repair countermeasure & centrifuge schedule (-55% biological stress accumulation).",
    color: "#c084fc",
    icon: "heart-pulse",
    category: "habitat-action",
    chipLabel: "BIO-RX",
    sockets: [
      {
        id: "trigger",
        type: "signal",
        position: "left",
        direction: "input",
        label: "Activate",
      },
    ],
  },
];

export const NODE_DEFINITIONS_BY_TYPE: ReadonlyMap<string, NodeDefinition> = new Map(
  NODE_DEFINITIONS.map((def) => [def.type, def])
);

export function createFlowNodeData(
  type: string,
  overrides?: Partial<FlowNodeData>
): FlowNodeData {
  const def = NODE_DEFINITIONS_BY_TYPE.get(type);
  if (!def) {
    throw new Error(`Unknown CradleFlow node type: ${type}`);
  }
  return {
    label: overrides?.label ?? def.label,
    type: def.type,
    category: def.category,
    color: def.color,
    icon: def.icon,
    sockets: def.sockets,
    fields: { ...(def.defaultFields ?? {}), ...(overrides?.fields ?? {}) },
    isDiamond: def.isDiamond,
  };
}

function makeNode(
  id: string,
  type: string,
  x: number,
  y: number,
  fields?: Record<string, string | number>
): FlowNode {
  return {
    id,
    type: "cradleNode",
    position: { x, y },
    data: createFlowNodeData(type, fields ? { fields } : undefined),
  };
}

export const FLOW_PRESETS: readonly FlowPreset[] = [
  {
    id: "preset-storm-standard",
    name: "Standard Storm Protocol",
    badge: "RECOMMENDED",
    summary:
      "Links NASA DONKI Proton Flux >= 45 pfu to Storm Shelter + Water-Wall Shield, OSDR Bio Monitor to Bio-Countermeasure, and Low Battery to Hydroponics Load Shedding.",
    nodes: [
      makeNode("n-proton", "donki-proton-sensor", 40, 60),
      makeNode("n-thresh-flux", "threshold-compare", 320, 48, {
        operator: ">=",
        threshold: 45,
      }),
      makeNode("n-shelter", "action-storm-shelter", 620, 20, {
        shieldGainGcm2: 40,
      }),
      makeNode("n-water", "action-water-shield", 620, 148),
      makeNode("n-osdr", "osdr-bio-monitor", 320, 205, {
        osdId: "OSD-340",
        stressLimit: 28,
      }),
      makeNode("n-biorx", "action-bio-countermeasure", 620, 278),
      makeNode("n-batt", "battery-power-sensor", 40, 345),
      makeNode("n-thresh-batt", "threshold-compare", 320, 355, {
        operator: "<=",
        threshold: 55,
      }),
      makeNode("n-shed", "action-shed-hydroponics", 620, 392),
    ],
    edges: [
      {
        id: "e-p-tf",
        source: "n-proton",
        sourceHandle: "flux",
        target: "n-thresh-flux",
        targetHandle: "value",
      },
      {
        id: "e-tf-sh",
        source: "n-thresh-flux",
        sourceHandle: "triggered",
        target: "n-shelter",
        targetHandle: "trigger",
      },
      {
        id: "e-tf-wa",
        source: "n-thresh-flux",
        sourceHandle: "triggered",
        target: "n-water",
        targetHandle: "trigger",
      },
      {
        id: "e-p-os",
        source: "n-proton",
        sourceHandle: "flux",
        target: "n-osdr",
        targetHandle: "flux",
      },
      {
        id: "e-os-rx",
        source: "n-osdr",
        sourceHandle: "bioCritical",
        target: "n-biorx",
        targetHandle: "trigger",
      },
      {
        id: "e-b-tb",
        source: "n-batt",
        sourceHandle: "battery",
        target: "n-thresh-batt",
        targetHandle: "value",
      },
      {
        id: "e-tb-sd",
        source: "n-thresh-batt",
        sourceHandle: "triggered",
        target: "n-shed",
        targetHandle: "trigger",
      },
    ],
  },
  {
    id: "preset-dual-gate-pro",
    name: "Dual-Gate OSDR + O2 Protocol",
    badge: "S-RANK GRAPH",
    summary:
      "Combines DONKI Proton Alert OR Kp Geomagnetic Alert through an OR gate, adds Active Magnetic Shielding, Bio-Countermeasure, and automated O2 Scrubber boost.",
    nodes: [
      makeNode("n-proton", "donki-proton-sensor", 30, 40),
      makeNode("n-kp", "donki-kp-sensor", 30, 175),
      makeNode("n-or", "gate-or", 315, 95),
      makeNode("n-shelter", "action-storm-shelter", 550, 20, {
        shieldGainGcm2: 45,
      }),
      makeNode("n-mag", "action-divert-shield", 550, 145, {
        coilPowerKw: 3.6,
      }),
      makeNode("n-osdr", "osdr-bio-monitor", 290, 240, {
        osdId: "OSD-109",
        stressLimit: 24,
      }),
      makeNode("n-biorx", "action-bio-countermeasure", 550, 270),
      makeNode("n-o2", "habitat-o2-sensor", 30, 345),
      makeNode("n-o2-boost", "action-o2-scrubber", 550, 385),
      makeNode("n-batt", "battery-power-sensor", 30, 465),
      makeNode("n-shed", "action-shed-hydroponics", 550, 495),
    ],
    edges: [
      {
        id: "e-p-or",
        source: "n-proton",
        sourceHandle: "stormAlert",
        target: "n-or",
        targetHandle: "a",
      },
      {
        id: "e-k-or",
        source: "n-kp",
        sourceHandle: "geomagAlert",
        target: "n-or",
        targetHandle: "b",
      },
      {
        id: "e-or-sh",
        source: "n-or",
        sourceHandle: "out",
        target: "n-shelter",
        targetHandle: "trigger",
      },
      {
        id: "e-or-mag",
        source: "n-or",
        sourceHandle: "out",
        target: "n-mag",
        targetHandle: "trigger",
      },
      {
        id: "e-p-osdr",
        source: "n-proton",
        sourceHandle: "flux",
        target: "n-osdr",
        targetHandle: "flux",
      },
      {
        id: "e-osdr-rx",
        source: "n-osdr",
        sourceHandle: "bioCritical",
        target: "n-biorx",
        targetHandle: "trigger",
      },
      {
        id: "e-o2-boost",
        source: "n-o2",
        sourceHandle: "lowO2",
        target: "n-o2-boost",
        targetHandle: "trigger",
      },
      {
        id: "e-batt-shed",
        source: "n-batt",
        sourceHandle: "lowPower",
        target: "n-shed",
        targetHandle: "trigger",
      },
    ],
  },
  {
    id: "preset-sandbox-unwired",
    name: "Junior Cadet Challenge (Unwired)",
    badge: "BUILD IT",
    summary:
      "Nodes are staged on the canvas with zero automation wires connected. Run once to see storm vulnerability, then wire your own defense graph!",
    nodes: [
      makeNode("n-proton", "donki-proton-sensor", 50, 60),
      makeNode("n-thresh", "threshold-compare", 320, 65, {
        operator: ">=",
        threshold: 50,
      }),
      makeNode("n-shelter", "action-storm-shelter", 610, 55, {
        shieldGainGcm2: 40,
      }),
      makeNode("n-osdr", "osdr-bio-monitor", 320, 215, {
        osdId: "OSD-73",
        stressLimit: 30,
      }),
      makeNode("n-biorx", "action-bio-countermeasure", 610, 225),
      makeNode("n-o2", "habitat-o2-sensor", 50, 315),
      makeNode("n-o2-boost", "action-o2-scrubber", 610, 345),
    ],
    edges: [],
  },
];
