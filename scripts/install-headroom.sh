#!/usr/bin/env bash
# Install the Headroom CLI and wrap Claude Code with it, on your own computer.
# Undo with: headroom unwrap claude
set -euo pipefail

command -v uv >/dev/null || { echo "uv is required: https://docs.astral.sh/uv/getting-started/installation/"; exit 1; }
uv tool install --python 3.13 "headroom-ai[all]"
headroom wrap claude
echo "Done. Start Claude Code as usual; Headroom now compresses what it reads."
