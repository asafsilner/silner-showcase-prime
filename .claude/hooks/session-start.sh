#!/bin/bash
set -euo pipefail

# Only run in Claude Code on the web (remote sessions)
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# JS dependencies (vite/eslint/vitest)
npm install --no-audit --no-fund

# Graphify: code knowledge-graph CLI + Claude Code skill
python3 -m pip install --quiet graphifyy
