#!/usr/bin/env bash
# How big are the existing YouTube videos for a premise? Prints the top results by views for each query.
#   scripts/saturation.sh "what if you lived every day twice" "what if you were stuck in a time loop"
# Uses yt-dlp's search only (no login, no cookies). If YouTube answers 403 or "confirm you're not a bot",
# STOP: do not work around it (the user's rule). Wait, or use a web search for that query instead.
set -e
cd "$(dirname "$0")/.."
[ -x .venv-ytdlp/bin/yt-dlp ] || { uv venv -q .venv-ytdlp && VIRTUAL_ENV=.venv-ytdlp uv pip install -q yt-dlp; }
for q in "$@"; do
  echo "== $q"
  timeout 60 .venv-ytdlp/bin/yt-dlp --flat-playlist --print "%(view_count)s | %(channel)s | %(title)s" "ytsearch8:$q" 2>&1 | sort -rn | head -7
  sleep 20
done
