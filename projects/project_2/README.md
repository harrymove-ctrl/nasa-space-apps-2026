# CradleFlow: Junior Astronaut Mission Trainer

CradleFlow merges the tactical habitat command interface of **CradleOS**, the low-code node automation canvas of **Frontier Flow**, and the rotating core telemetry engine of **EasyAssemblies** into a browser mission trainer for the NASA Space Apps Challenge 2026 challenge: *Build a Junior Astronaut Mission Trainer*.

## Core Capabilities

1. **Frontier Flow Outpost Automation**: Drag, connect, and tune typed logic blocks (`DONKI Proton Flux`, `DONKI Kp Geomagnetic`, `Habitat O2 Sensor`, `Solar & Battery Sensor`, `Threshold Gate`, `NASA OSDR Bio Monitor`, `AND`/`OR`/`NOT` gates, and six outpost actuators) with automatic socket compatibility and cycle prevention.
2. **CradleOS Lunar and Martian Habitat Simulation**: Compare **Shackleton Ridge Hab-01 (Lunar South Pole, 0.166 g, 0 g/cm2 atmosphere)** against **Jezero Hab-04 Outpost (Mars, 0.376 g, 18 g/cm2 CO2 atmosphere)** across real 24-hour storm profiles tracking crew cumulative mSv dose, O2 percentage, water recovery, battery state of charge, hydroponics yield, and biological tissue stress.
3. **Real NASA DONKI, NOAA SWPC, and NASA OSDR Data**: Boots instantaneously with bundled verified space-weather events (`2026-10-10` Kp-7.0 geomagnetic storm, `AR 13664` G5 superstorm benchmark, live `GOES-18` X-ray and proton baseline) and six verified NASA OSDR radiobiology datasets (`OSD-73`, `OSD-97`, `OSD-109`, `OSD-117`, `OSD-340`, `OSD-714`), with zero-key live sync to NOAA SWPC and NASA OSDR APIs.
4. **Immediate Zero-Login Playability**: Opens straight into the interactive trainer with zero wallet, login, or API key gates.

## Local Verification Commands

```bash
bun install
bun run typecheck
bun run test
bun run build
bun run dev
```
