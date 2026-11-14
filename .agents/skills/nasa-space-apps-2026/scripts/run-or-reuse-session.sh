#!/usr/bin/env bash
# Persistent Carbon Plan & Anti-Slop UI/UX session runner for NASA Space Apps Challenge 2026.

set -euo pipefail

SIDECAR_NAME="nasa-space-apps-carbon-ui-3h"
INTERVAL_SEC="9900"
SESSION_TITLE="NASA Space Apps 3h Carbon Plan & UI/UX Polisher"
MODEL="gemini-4-carbon-high"
REPO_ROOT="/Volumes/Dev/nasa-space-apps-2026"
AGENTAPI_BIN="/Users/harryphan/.gemini/antigravity/bin/agentapi"
DEADLINE_EPOCH="1794761940"

FORCE_RUN=0
DRY_RUN=0
ARGS=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --sidecar=*)
      SIDECAR_NAME="${1#*=}"
      shift
      ;;
    --sidecar)
      SIDECAR_NAME="${2:-nasa-space-apps-carbon-ui-3h}"
      shift 2
      ;;
    --interval-sec=*)
      INTERVAL_SEC="${1#*=}"
      shift
      ;;
    --interval-sec)
      INTERVAL_SEC="${2:-9900}"
      shift 2
      ;;
    --title=*)
      SESSION_TITLE="${1#*=}"
      shift
      ;;
    --title)
      SESSION_TITLE="${2:-NASA Space Apps 3h Carbon Plan & UI/UX Polisher}"
      shift 2
      ;;
    --model=*)
      MODEL="${1#*=}"
      shift
      ;;
    --model)
      MODEL="${2:-gemini-4-carbon-high}"
      shift 2
      ;;
    --force)
      FORCE_RUN=1
      shift
      ;;
    --dry-run)
      DRY_RUN=1
      shift
      ;;
    -h|--help)
      echo "Usage: $0 [--sidecar=<id>] [--interval-sec=<n>] [--title=<title>] [--model=<id>] [--force] [--dry-run] -- <prompt>"
      exit 0
      ;;
    --)
      shift
      ARGS+=("$*")
      break
      ;;
    *)
      ARGS+=("$1")
      shift
      ;;
  esac
done

PROMPT="${ARGS[*]:-}"
if [[ -z "$PROMPT" ]]; then
  echo "Usage: $0 [--sidecar=<id>] [--interval-sec=<n>] [--title=<title>] [--model=<id>] [--force] [--dry-run] -- <prompt>" >&2
  exit 2
fi

SIDECAR_DATA_DIR="${HOME}/.gemini/antigravity/sidecar_data/${SIDECAR_NAME}"
SIDECAR_EVENTS_DIR="${SIDECAR_DATA_DIR}/events"
ACTIVE_CONV_FILE="${SIDECAR_DATA_DIR}/active_conversation_id.txt"
LAST_RUN_FILE="${SIDECAR_DATA_DIR}/last_run_epoch.txt"

mkdir -p "$SIDECAR_DATA_DIR"

NOW_EPOCH="$(TZ=Asia/Ho_Chi_Minh date +%s)"
if [[ "$FORCE_RUN" != "1" ]] && (( NOW_EPOCH > DEADLINE_EPOCH )); then
  echo "COMPLETED: NASA Space Apps Challenge 2026 submission window closed on 2026-11-15 23:59:00 Asia/Ho_Chi_Minh."
  exit 0
fi

LAST_RUN_EPOCH=0
if [[ -f "$LAST_RUN_FILE" ]]; then
  LAST_RUN_EPOCH="$(tr -d '[:space:]' < "$LAST_RUN_FILE" || echo 0)"
fi
if ! [[ "$LAST_RUN_EPOCH" =~ ^[0-9]+$ ]]; then
  LAST_RUN_EPOCH=0
fi
ELAPSED=$(( NOW_EPOCH - LAST_RUN_EPOCH ))

if [[ "$FORCE_RUN" != "1" ]] && (( ELAPSED < INTERVAL_SEC )); then
  echo "[run-or-reuse-session] Skipping duplicate trigger for ${SIDECAR_NAME} (elapsed=${ELAPSED}s < ${INTERVAL_SEC}s)."
  exit 0
fi

resolve_active_conversation_id() {
  local cid=""
  if [[ -f "$ACTIVE_CONV_FILE" ]]; then
    cid="$(tr -d '[:space:]' < "$ACTIVE_CONV_FILE")"
  fi
  if [[ -z "$cid" && -d "$SIDECAR_EVENTS_DIR" ]]; then
    local latest_event
    latest_event="$(ls -1t "${SIDECAR_EVENTS_DIR}"/*.json 2>/dev/null | head -n 1 || true)"
    if [[ -n "$latest_event" ]]; then
      cid="$(jq -r '.payload.newConversation.conversationId // .payload.sendMessage.recipientId // empty' "$latest_event" 2>/dev/null || true)"
    fi
  fi
  if [[ -n "$cid" ]]; then
    local transcript_file="${HOME}/.gemini/antigravity/brain/${cid}/.system_generated/logs/transcript.jsonl"
    if [[ -f "$transcript_file" ]] && (( $(wc -l < "$transcript_file" | tr -d '[:space:]') >= 3500 )); then
      return 1
    fi
    if "$AGENTAPI_BIN" get-conversation-metadata "$cid" >/dev/null 2>&1; then
      echo "$cid"
      return 0
    fi
  fi
  return 1
}

if [[ "$DRY_RUN" == "1" ]]; then
  ACTIVE_CID="$(resolve_active_conversation_id || true)"
  echo "[dry-run] Ready for ${SIDECAR_NAME}: --model=${MODEL}, interval=${INTERVAL_SEC}s, active_cid=${ACTIVE_CID:-none}, repo=${REPO_ROOT}."
  exit 0
fi

printf '%s\n' "$NOW_EPOCH" > "$LAST_RUN_FILE"

if ACTIVE_CID="$(resolve_active_conversation_id)"; then
  printf '%s\n' "$ACTIVE_CID" > "$ACTIVE_CONV_FILE"
  exec "$AGENTAPI_BIN" send-message --title="$SESSION_TITLE" "$ACTIVE_CID" "$PROMPT"
else
  cd "$REPO_ROOT"
  OUT="$("$AGENTAPI_BIN" new-conversation --model="$MODEL" --title="$SESSION_TITLE" -- "$PROMPT" 2>/dev/null || "$AGENTAPI_BIN" new-conversation --model=pro --title="$SESSION_TITLE" -- "$PROMPT")"
  echo "$OUT"
  NEW_CID="$(echo "$OUT" | jq -r '.response.newConversation.conversationId // .conversationId // empty' 2>/dev/null || true)"
  if [[ -n "$NEW_CID" ]]; then
    printf '%s\n' "$NEW_CID" > "$ACTIVE_CONV_FILE"
  fi
fi
