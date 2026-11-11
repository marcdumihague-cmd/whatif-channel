"""Voice an episode script with Kokoro: one WAV plus a timeline of when each line is spoken.

    .venv/bin/python tts/voice.py episodes/<name>/script.json

Lines may carry "say": a spelling for the voice when the caption text reads badly aloud.
Writes video/public/<name>/voice.wav and video/public/<name>/timeline.json.
"""
import json, sys
from pathlib import Path

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = Path(__file__).resolve().parent.parent
GAP = 0.35            # seconds of silence between lines
SCENE_GAP = 0.7       # longer pause when the scene changes

script_path = Path(sys.argv[1])
script = json.loads(script_path.read_text())
out = ROOT / "video" / "public" / script_path.parent.name
out.mkdir(parents=True, exist_ok=True)

tts = Kokoro(str(ROOT / "tts/models/kokoro-v1.0.onnx"), str(ROOT / "tts/models/voices-v1.0.bin"))
chunks, timeline, t, rate = [], [], 0.0, None
for i, line in enumerate(script["lines"]):
    if i:
        gap = SCENE_GAP if line["scene"] != script["lines"][i - 1]["scene"] else GAP
        chunks.append(np.zeros(int(gap * rate), dtype=np.float32))
        t += gap
    audio, rate = tts.create(line.get("say", line["text"]), voice=script["voices"][line["who"]], speed=1.0, lang="en-us")
    chunks.append(audio.astype(np.float32))
    timeline.append({**line, "start": round(t, 3), "end": round(t + len(audio) / rate, 3)})
    t += len(audio) / rate

tail = 1.2  # let the last scene breathe
chunks.append(np.zeros(int(tail * rate), dtype=np.float32))
sf.write(out / "voice.wav", np.concatenate(chunks), rate)
(out / "timeline.json").write_text(json.dumps({"duration": round(t + tail, 3), "lines": timeline}, indent=1))

assert all(a["end"] <= b["start"] for a, b in zip(timeline, timeline[1:])), "lines overlap"
print(f"{len(timeline)} lines, {t + tail:.1f}s -> {out}")
