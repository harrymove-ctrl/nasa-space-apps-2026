# NASA Space Apps Challenge 2026: Builder & Agent Rules

This workspace (`/Volumes/Dev/nasa-space-apps-2026`) hosts pre-event dataset research (`docs/RESEARCH.md`) and competition projects (`projects/project_1`, `projects/project_2`) for the **NASA Space Apps Challenge 2026** (`https://www.spaceappschallenge.org/2026/`).

Read `docs/COMPETITION.md`, `docs/RESEARCH.md`, and `docs/PLAN.md` first in every session.

## 1. Hard Pre-Start Eligibility Gate (Zero Project Work Before November 14, 2026)

1. **Official Start Window**: Saturday, November 14, 2026 at 09:00 AM local time through Sunday, November 15, 2026 at 11:59 PM local time (`2026-11-14T09:00:00+07:00` to `2026-11-15T23:59:00+07:00` in `Asia/Ho_Chi_Minh`).
2. **No Project Code or Assets Before Hackathon Starts**: Official NASA Space Apps rules instruct participants not to begin project work (application code, UI mockups, 3D scenes, or submission media) before the hackathon officially opens on November 14, 2026.
3. **Allowed Pre-Event Scope (Before November 14, 2026 at 09:00 AM)**: Only challenge brief study, NASA Earthdata and Space Agency Partner dataset exploration, participation mode selection (Local Event vs virtual Universal Event), registration tracking, and research notes inside `docs/RESEARCH.md` are permitted. Keep `projects/project_1/src/` completely empty (`0` source files) until November 14, 2026 at 09:00 AM local time.

## 2. Three Checkpoints (Apply Every Time, Out Loud, in One or Two Lines)

1. **Before a plan**: "Is this the right approach?" Verify whether the current timestamp is still in the pre-start research window or inside the November 14 to 15 build window, and name the simplest architecture grounded in real NASA open datasets.
2. **When an error repeats (same error twice)**: "Am I digging in the wrong place?" Stop patching, re-read the NASA Earthdata or Space Agency Partner API documentation, write down the hypothesis, and test data ingestion in isolation.
3. **Before saying "done"**: "What did I miss?" Verify open-data citations, confirm zero pre-event code violations, run the exit test, check `docs/SUBMISSION.md`, and list anything unverified by name.

## 3. Global Antigravity & Superpowers Skills Wired into This Workspace

1. **Workspace Skill**: `/Volumes/Dev/nasa-space-apps-2026/.agents/skills/nasa-space-apps-2026/SKILL.md`
2. **Hackathon Orchestrator**: `/Users/harryphan/.gemini/config/skills/hackathon-architect/SKILL.md` (`hackathon_director`)
3. **Superpowers Default Engineering Layer**: `using-superpowers`, `brainstorming`, `writing-plans`, `executing-plans`, `test-driven-development`, `systematic-debugging`, `verification-before-completion`, `subagent-driven-development`, `dispatching-parallel-agents`, `requesting-code-review`, `receiving-code-review`, `using-git-worktrees`, `finishing-a-development-branch`
4. **UI/UX, 3D Geospatial & Adversarial QA**: `/Users/harryphan/.gemini/config/skills/ui-ux-qa/SKILL.md` (`ui_ux_director`), `react-bits-pro`, `fun-isometric`, `diorama`, `interface-bts`
5. **Demo Video**: `/Users/harryphan/.gemini/config/skills/demo-video-director/SKILL.md` (`demo_video_director`)
6. **Product & Delivery**: `synthesis-design-coach`, `cmk-delivery-pipeline`, `superset-orchestrate`, `use-railway`

## 4. Conventions

1. **Location Rule**: Lives strictly on `/Volumes/Dev/nasa-space-apps-2026`.
2. **Writing Style**: Strictly 100% English. Never use em-dashes, en-dashes, spaced hyphens, Markdown horizontal rules, or unordered dash bullets in prose, READMEs, project descriptions, or commit messages.
3. **GitHub Identity**: Always verify `gh auth status` is active as `harrymove-ctrl` (`harry.phan@commandoss.com`) before any Git or GitHub action.
4. **Twice-Daily Status Check**: Monitored twice daily (morning and afternoon in `Asia/Ho_Chi_Minh`) via `node /Volumes/Dev/nasa-space-apps-2026/scripts/daily-check.mjs`. Leave `projects/project_1` untouched whenever there is no new operator instruction.
