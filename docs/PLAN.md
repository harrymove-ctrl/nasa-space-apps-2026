# NASA Space Apps Challenge 2026: Plan & Submission Timeline

## Phase 0: Pre-Event Research & Registration (Completed Before Nov 14, 09:00 AM Local Time)

1. **Hard Fair-Play Rule**: Zero application code, UI assets, or project files inside `projects/project_1/src/` before **Saturday, November 14, 2026 at 09:00 AM local time**.
2. **Saved Concept & Reference Ready for Kickoff**:
   1. **Concept**: `TerraSpan` Physical Infrastructure Monitoring & Harmonized MODIS + VIIRS Burning Activity Calendar ([IDEA_INFRASTRUCTURE_TWIN.md](IDEA_INFRASTRUCTURE_TWIN.md)).
   2. **UX Reference**: **Ask the Grid** (`https://askthegrid.com/`) and **OpenInfraMap** (`https://openinframap.org/`), saved in [`../reference-list/references.json`](../reference-list/references.json).
   3. **Target Stack**: **Rust** (data harmonization, `IEEE 738` & `TTCE` simulators, digital twin) + **TS/Bun/Hono** (`BFF`) + **TanStack/Bun/React** (frontend + MapLibre GL + Burning Activity Calendar) + **PostgreSQL/PostGIS** + public zero-auth web deployment.

## Phase 1: 48-Hour Hackathon Build & Submit Window (Nov 14, 09:00 AM to Nov 15, 11:59 PM Local Time)

1. **Saturday, Nov 14 (Ingestion & Harmonization Core)**: Initialize `projects/project_1` once instructed: PostgreSQL + PostGIS schema, Rust NASA `FIRMS` (`MODIS` + `VIIRS J1/J2`) / `GIBS` / `ASF` / `POWER` / `EONET` / `CMR` workers, `2000 to 2026` `H3` Burning Activity Calendar aggregator, and Bun + Hono `BFF`.
2. **Saturday Evening to Sunday Morning (Frontend, Ask-the-Grid Copilot & Early Deploy)**: Build the TanStack + React + MapLibre GL corridor map, `2000 to 2026` Burning Activity Calendar + region/date picker, 4 instant judge presets, and `Ask the Grid` query bar; run `ui_ux_director` QA loops; deploy to a public zero-auth URL and submit the domain to **FortiGuard Web Filter Classification** (`https://www.fortiguard.com/faq/wfratingsubmit`, `Company Name: N/A`) early so judge firewalls do not block it.
3. **Sunday, Nov 15 by 18:00 ICT (Early Submit Gate)**: Freeze core features, capture `<= 10 MB` PNG architecture and UI screenshots for inline Project page embedding, produce the `<= 0:29` 5-beat video (`demo_video_director` / `ai-video-maker`) and optional 7-slide deck, fill all 8 Project Tab fields (including AI disclosure and exact NASA + ESA citations), test all links in an incognito browser, and click **`Submit for Judging`** early to verify the confirmation banner.
4. **Sunday, Nov 15 (`18:00 to 23:59 ICT`, Final Polish & Resave)**: Run final visual/data checks, update any polish commits or improved media, click `Save Progress` and **`Submit for Judging`** again before `23:59` local time (or any earlier Local Lead cutoff), and download the Letter-size PDF Participant Certificate.
