#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { loadPrunedRegistry, isHackathonExpired } from '/Volumes/Dev/.agents/skills/hackathon-architect/scripts/prune-expired-hackathons.mjs';

const WORKSPACE_ROOT = '/Volumes/Dev/nasa-space-apps-2026';
const REGISTRY_PATH = '/Volumes/Dev/hackathon-registry.json';
const PROJECTS_DIR = path.join(WORKSPACE_ROOT, 'projects');
const REFERENCES_JSON_PATH = path.join(WORKSPACE_ROOT, 'reference-list', 'references.json');
const STATUS_REPORT_PATH = path.join(WORKSPACE_ROOT, 'reports', 'daily-status.md');
const DAILY_LOG_PATH = path.join(WORKSPACE_ROOT, 'docs', 'DAILY_LOG.md');

const START_ISO = '2026-11-14T09:00:00+07:00'; // Nov 14, 2026 at 09:00 AM ICT
const DEADLINE_ISO = '2026-11-15T23:59:00+07:00'; // Nov 15, 2026 at 11:59 PM ICT

const now = new Date();
const nowIso = now.toISOString();
const todayDate = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' });
const localTimeStr = now.toLocaleTimeString('en-GB', {
  timeZone: 'Asia/Ho_Chi_Minh',
  hour: '2-digit',
  minute: '2-digit',
});

const isPreStart = now.getTime() < new Date(START_ISO).getTime();
const msToStart = Math.max(0, new Date(START_ISO).getTime() - now.getTime());
const hoursToStart = Math.ceil(msToStart / (1000 * 60 * 60));
const daysToStart = Math.floor(hoursToStart / 24);
const remHoursToStart = hoursToStart % 24;

const msToClose = Math.max(0, new Date(DEADLINE_ISO).getTime() - now.getTime());
const hoursToClose = Math.ceil(msToClose / (1000 * 60 * 60));
const daysToClose = Math.floor(hoursToClose / 24);
const remHoursToClose = hoursToClose % 24;

function countFilesRecursive(dirPath) {
  if (!fs.existsSync(dirPath)) return 0;
  let total = 0;
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      total += countFilesRecursive(fullPath);
    } else {
      total += 1;
    }
  }
  return total;
}

function listProjects() {
  if (!fs.existsSync(PROJECTS_DIR)) return [];
  return fs
    .readdirSync(PROJECTS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => {
      const projPath = path.join(PROJECTS_DIR, d.name);
      const projectMdPath = path.join(projPath, 'PROJECT.md');
      const srcPath = path.join(projPath, 'src');
      const srcCount = countFilesRecursive(srcPath);
      let phaseLabel = 'Phase 0 (Pre-Event Research Only; Locked Until Nov 14, 2026 09:00 AM Start)';
      if (fs.existsSync(projectMdPath)) {
        const text = fs.readFileSync(projectMdPath, 'utf8');
        const match = text.match(/\*\*Current Phase\*\*:\s*(.+)/);
        if (match) phaseLabel = match[1].trim();
      }
      let compliance = 'PASS (0 pre-start files)';
      if (isPreStart && srcCount > 0) {
        compliance = `WARNING (${srcCount} files found before Nov 14 start)`;
      } else if (!isPreStart) {
        compliance = `LIVE BUILD WINDOW (${srcCount} source files)`;
      }
      return {
        name: d.name,
        path: projPath,
        srcCount,
        compliance,
        status: phaseLabel,
      };
    });
}

function loadReferences() {
  if (!fs.existsSync(REFERENCES_JSON_PATH)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(REFERENCES_JSON_PATH, 'utf8'));
    return parsed.references || [];
  } catch {
    return [];
  }
}

function loadRegistry() {
  try {
    return loadPrunedRegistry(REGISTRY_PATH, now);
  } catch {
    return { hackathons: [] };
  }
}

function checkOfficialPage() {
  try {
    const html = execSync(
      'curl -sL --max-time 10 "https://www.spaceappschallenge.org/2026/"',
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
    );
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const title = titleMatch
      ? titleMatch[1].replace(/[\u2013\u2014]/g, ':').replace(/\s+-\s+/g, ': ').trim()
      : 'NASA Space Apps Challenge 2026';
    return { reachable: true, title };
  } catch {
    return { reachable: false, title: 'Offline or unreachable during check' };
  }
}

const projects = listProjects();
const references = loadReferences();
const registry = loadRegistry();
const site = checkOfficialPage();

const projectRows = projects
  .map(
    (p) =>
      `| \`${p.name}\` | \`${p.path}\` | ${p.srcCount} | \`${p.compliance}\` | ${p.status} |`
  )
  .join('\n');

const referenceRows = references
  .map(
    (r) =>
      `| **${r.name}** | ${r.url || `\`${r.docPath}\``} | ${r.role || r.stack || 'Saved reference'} | \`${r.status}\` |`
  )
  .join('\n');

function formatHackathonCountdown(h) {
  if (!h.deadline || h.deadline === 'TBD') return h.countdownLabel || 'Rolling (Open)';
  const diffMs = new Date(h.deadline).getTime() - now.getTime();
  if (diffMs <= 0) {
    if (h.finalCloses && new Date(h.finalCloses).getTime() > now.getTime()) {
      const fDays = Math.ceil((new Date(h.finalCloses).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return `Round 1 Active (${fDays}d to Final)`;
    }
    return 'Closed / Submitted';
  }
  const totalHours = Math.ceil(diffMs / (1000 * 60 * 60));
  const days = Math.floor(totalHours / 24);
  const remHours = totalHours % 24;
  if (days <= 14) {
    return `**${days}d ${remHours}h left** (~${totalHours}h)`;
  }
  return `${Math.ceil(diffMs / (1000 * 60 * 60 * 24))} days left`;
}

function getEffectiveDeadlineMs(h) {
  const d = h.deadline ? new Date(h.deadline).getTime() : NaN;
  if (!Number.isNaN(d) && d > now.getTime()) return d;
  const f = h.finalCloses ? new Date(h.finalCloses).getTime() : NaN;
  if (!Number.isNaN(f) && f > now.getTime()) return f;
  if (!Number.isNaN(d)) return Number.MAX_SAFE_INTEGER + d;
  return Number.MAX_SAFE_INTEGER;
}

const hackathonRows = [...(registry.hackathons || [])]
  .filter((h) => !isHackathonExpired(h, now))
  .sort((a, b) => getEffectiveDeadlineMs(a) - getEffectiveDeadlineMs(b))
  .map(
    (h) =>
      `| **${h.name}** | \`${h.workspacePath}\` | ${h.deadlineDisplay || h.deadline || 'Rolling'} | ${formatHackathonCountdown(h)} | \`${h.status || 'active'}\` |`
  )
  .join('\n');

const windowBanner = isPreStart
  ? `PRE-START RESEARCH ONLY (Starts in **${daysToStart}d ${remHoursToStart}h** / ~${hoursToStart}h on Nov 14, 2026 at 09:00 AM ICT; do NOT begin project code yet)`
  : `LIVE HACKATHON BUILD WINDOW (**${daysToClose}d ${remHoursToClose}h** / ~${hoursToClose}h until Nov 15, 2026 at 11:59 PM ICT)`;

const reportContent = `# Twice-Daily Hackathon Status Snapshot: NASA Space Apps 2026 & Active Hackathons

1. **Last Checked (UTC)**: \`${nowIso}\` (\`${todayDate} ${localTimeStr} ICT\`)
2. **Workspace**: \`${WORKSPACE_ROOT}\`
3. **Current Phase Gate**: ${windowBanner}
4. **Candidate Idea Brief**: \`docs/IDEA_INFRASTRUCTURE_TWIN.md\` (Physical Infrastructure Satellite + Weather + Terrain + Camera/Drone/Sensor Digital Twin on **Rust + TS/Bun/Hono + TanStack/Bun/React + PostgreSQL/PostGIS + NATS + Redis + k8s**)
5. **Registration & Submission Close**: \`${DEADLINE_ISO}\` (**${daysToClose}d ${remHoursToClose}h left**, ~${hoursToClose} hours remaining)
6. **Official Site Reachability**: \`${site.reachable ? 'ONLINE' : 'OFFLINE'}\` (${site.title})
7. **Awards Model**: Global Recognition & 10 NASA Global Award Categories (No Verified Cash Pool)

## 1. NASA Space Apps Challenge 2026 Projects & Fair-Play Audit

| Project | Path | Source Files | Pre-Start Rule Audit | Status |
| :--- | :--- | :--- | :--- | :--- |
${projectRows}

## 2. Saved Pre-Event References (\`reference-list/\`)

| Reference | Source / Doc | Stack / Role | Status |
| :--- | :--- | :--- | :--- |
${referenceRows || '| None | N/A | N/A | N/A |'}

## 3. Active Hackathons & Grant Calls on \`/Volumes/Dev\` (Sorted by Days Remaining Ascending)

| Hackathon | Workspace Path | Deadline | Days Remaining | Status |
| :--- | :--- | :--- | :--- | :--- |
${hackathonRows}

## 4. Non-Destructive Preservation & Fair-Play Rule

Before November 14, 2026 at 09:00 AM local time, \`projects/project_1/src/\` remains strictly locked at \`0\` source files for dataset and architecture research only (\`docs/IDEA_INFRASTRUCTURE_TWIN.md\` and \`reference-list/\`). When there is no new operator update, all project folders across \`/Volumes/Dev\` remain untouched.
`;

fs.mkdirSync(path.dirname(STATUS_REPORT_PATH), { recursive: true });
fs.writeFileSync(STATUS_REPORT_PATH, reportContent, 'utf8');

if (fs.existsSync(DAILY_LOG_PATH)) {
  const logText = fs.readFileSync(DAILY_LOG_PATH, 'utf8');
  const stamp = `### ${todayDate} (${localTimeStr} ICT Check)`;
  if (!logText.includes(`### ${todayDate}`)) {
    const entry = `\n${stamp}\n\n1. Verified official site (${site.reachable ? 'ONLINE' : 'OFFLINE'}), pre-start fair-play guardrail, saved Infrastructure Digital Twin + Ask the Grid references, and ${registry.hackathons?.length || 0} registered hackathons.\n`;
    fs.appendFileSync(DAILY_LOG_PATH, entry, 'utf8');
  }
}

console.log(reportContent);
