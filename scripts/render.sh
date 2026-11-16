#!/usr/bin/env bash
# Resumable render of a full episode: 4 silent chunks (a finished chunk is skipped on a re-run), joined,
# re-encoded smaller with the mix added.
#   nohup scripts/render.sh <name> <Composition> > /tmp/render-<name>.log 2>&1 &     e.g. scripts/render.sh twice Twice
# Wait for "RENDER-DONE". The chunks stay in video/out/<name>-chunks until you delete them: keep them until
# the final file has been checked (a one-shot fix can then be re-rendered and spliced).
# Needs ~3 GB free (v2 episodes: chunks ~640 MB, final ~250 MB, ~50 min for 5.5 min of video).
set -e
cd "$(dirname "$0")/../video"
name=$1; comp=$2
export REMOTION_CHROME=${REMOTION_CHROME:-/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell}
free=$(df -m --output=avail . | tail -1)
[ "$free" -gt 3000 ] || { echo "only ${free} MB free: clear space first (rm -rf /tmp/remotion-webpack-bundle-*, uv cache clean)"; exit 1; }
grep -q '"estimated"' "public/$name/timeline.json" && { echo "timeline is still estimated: run the voice first"; exit 1; }
N=$(node -e "const t=require('./public/$name/timeline.json');console.log(Math.ceil(t.duration*30))")
C=out/$name-chunks; mkdir -p $C
STEP=$(( (N + 3) / 4 )); : > $C/list.txt
for k in 0 1 2 3; do
  A=$(( k * STEP )); B=$(( (k + 1) * STEP - 1 )); [ $B -ge $N ] && B=$(( N - 1 ))
  F=$C/part$k.mp4
  if [ ! -f $F.done ]; then
    npx remotion render src/index.ts "$comp" $F --frames=$A-$B --muted --concurrency 4 > /dev/null 2>&1
    touch $F.done
  fi
  echo "file 'part$k.mp4'" >> $C/list.txt
  echo "chunk $k done ($A-$B)"
  rm -rf /tmp/remotion-webpack-bundle-*
done
ffmpeg -v error -y -f concat -safe 0 -i $C/list.txt -i "public/$name/mix.wav" -c:v libx264 -preset medium -crf 21 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart "out/$name.mp4"
ffprobe -v error -show_entries format=duration -of csv=p=0 "out/$name.mp4"
echo RENDER-DONE
