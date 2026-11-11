#!/usr/bin/env bash
# Install everything the video pipeline needs. Safe to run again.
set -euo pipefail
cd "$(dirname "$0")/.."

[ -d .venv ] || python3 -m venv .venv
.venv/bin/pip install -q kokoro-onnx soundfile faster-whisper

mkdir -p tts/models
for f in kokoro-v1.0.onnx voices-v1.0.bin; do
  [ -s "tts/models/$f" ] || curl -sSfL -o "tts/models/$f" \
    "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/$f"
done

(cd video && npm install --no-audit --no-fund --silent)
echo "setup done"
