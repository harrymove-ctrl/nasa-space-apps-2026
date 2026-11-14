---
name: nasa-space-apps-2026
description: >-
  Manage pre-event NASA open-data research and 48-hour hackathon execution (November 14 to 15, 2026)
  for NASA Space Apps Challenge 2026 at /Volumes/Dev/nasa-space-apps-2026. Enforces the official
  no-pre-start-work eligibility rule (zero project code or assets before November 14, 2026 at 09:00 AM
  local time), tracks registration and Local vs Universal Event selection, catalogues NASA Earthdata,
  MODIS, VIIRS, SAR/NISAR, and planetary datasets, and runs twice-daily status checks alongside
  /Volumes/Dev/hackathon-registry.json.
---

# NASA Space Apps Challenge 2026 Skill (`nasa-space-apps-2026`)

Use this skill whenever researching NASA open datasets, selecting a 2026 challenge brief, running twice-daily hackathon status checks, or building `projects/project_1` during the November 14 to 15, 2026 event window at `/Volumes/Dev/nasa-space-apps-2026`.

## 1. Hard Pre-Start Eligibility Rule (Never Violate)

1. **Event Window**: Saturday, November 14, 2026 at 09:00 AM local time (`2026-11-14T09:00:00+07:00`) through Sunday, November 15, 2026 at 11:59 PM local time (`2026-11-15T23:59:00+07:00`).
2. **Pre-Event Lock (Before November 14, 2026 at 09:00 AM)**: Never create source files, UI components, or submission assets inside `projects/project_1` before the hackathon officially starts. Restrict pre-event work strictly to `docs/RESEARCH.md`, dataset endpoint inspection, challenge selection, and registration check-ins.
3. **Registration Window**: Registration remains open on `https://www.spaceappschallenge.org/2026/` until the hackathon closes on November 15, 2026 (Local Event or virtual Universal Event).
4. **Awards Focus**: Competing for global recognition and the 10 NASA Global Award Categories (Best Use of Science, Best Use of Data, Best Use of Technology, Galactic Impact, Best Mission Concept, Most Inspirational, Best Use of Storytelling, Global Connection, Art & Technology, Local Impact) using verified NASA and Space Agency Partner open datasets.

## 2. Twice-Daily Status Check & Non-Destructive Preservation

1. Run `node /Volumes/Dev/nasa-space-apps-2026/scripts/daily-check.mjs` during the morning and afternoon daily status checks (`Asia/Ho_Chi_Minh`).
2. Render the 5-column `Active Hackathons on /Volumes/Dev` table sorted by `Days Remaining` ascending (`Hackathon | Workspace Path | Deadline | Days Remaining | Status`).
3. Verify `projects/project_1/src/` contains `0` files while in the pre-Nov-14 research phase, and preserve all project directories untouched when there is no new operator instruction.
