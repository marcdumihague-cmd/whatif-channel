#!/usr/bin/env bash
# Voice an episode end to end: acted takes, pick, cloned lines, lip-sync. ~1 hour for 70 lines on CPU.
#   nohup scripts/voice-chain.sh <name> > /tmp/voice-<name>.log 2>&1 &
# Then wait for "VOICE-DONE" (or "Traceback") in the log. Do not render stills while this runs: it starves the voice.
set -e
cd "$(dirname "$0")/.."
name=$1
if grep -q '"act"' "episodes/$name/script.json" && [ -d .venv-chatterbox ]; then
  .venv-qwen/bin/python tts/act.py "episodes/$name/script.json"
  .venv-chatterbox/bin/python tts/act.py "episodes/$name/script.json" pick
fi
.venv-qwen/bin/python tts/voice.py "episodes/$name/script.json"
.venv-qwen/bin/python tts/lipsync.py "$name"
echo VOICE-DONE
