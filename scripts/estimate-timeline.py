"""Write an ESTIMATED timeline so scenes can be built before the voice exists.

    python3 scripts/estimate-timeline.py <name>

A line lasts words / 2.6 + 0.3 s; gaps come from the script's "pace" (default 0.3 s, 0.55 s between scenes).
The file is marked "estimated": true, which makes the Episode component skip the audio. tts/voice.py
overwrites it with the real timeline (and tts/lipsync.py overwrites lips.json).
"""
import json, sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent
name = sys.argv[1]
script = json.loads((root / f"episodes/{name}/script.json").read_text())
gap, scene_gap = script.get("pace", {}).get("gap", 0.3), script.get("pace", {}).get("scene_gap", 0.55)
t, out = 0.0, []
for i, l in enumerate(script["lines"]):
    if i:
        t += scene_gap if l["scene"] != script["lines"][i - 1]["scene"] else gap
    d = len(l["text"].split()) / 2.6 + 0.3
    out.append({"scene": l["scene"], "who": l["who"], "text": l["text"], "start": round(t, 2), "end": round(t + d, 2)})
    t += d
pub = root / f"video/public/{name}"
pub.mkdir(parents=True, exist_ok=True)
tl = pub / "timeline.json"
if tl.exists() and "estimated" not in json.loads(tl.read_text()):
    sys.exit("timeline.json is the real voice timeline: not overwriting it")
(pub / "timeline.json").write_text(json.dumps({"duration": round(t + 0.6, 2), "estimated": True, "lines": out}, indent=1))
if not (pub / "lips.json").exists():
    (pub / "lips.json").write_text(json.dumps({"fps": 30, "open": "", "shape": ""}))
assert out and out[-1]["end"] > out[0]["start"]
print(f"{len(out)} lines, about {t:.0f} s (estimated)")
