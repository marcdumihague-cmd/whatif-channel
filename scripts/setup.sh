#!/usr/bin/env bash
# Install everything the video pipeline needs. Safe to run again.
set -euo pipefail
cd "$(dirname "$0")/.."

command -v uv >/dev/null || pip install -q --user uv
export PATH="$HOME/.local/bin:$PATH"

# Voices (Qwen3-TTS) + pronunciation check (faster-whisper). Qwen needs Python 3.12.
[ -d .venv-qwen ] || uv venv -q -p 3.12 .venv-qwen
VIRTUAL_ENV=.venv-qwen uv pip install -q qwen-tts faster-whisper
# Download the voice model ahead of the first episode (about 4 GB).
.venv-qwen/bin/python -c "from huggingface_hub import snapshot_download as d; d('Qwen/Qwen3-TTS-12Hz-1.7B-Base'); d('Systran/faster-whisper-base.en')"

(cd video && npm install --no-audit --no-fund --silent)
echo "setup done"
