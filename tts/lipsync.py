"""Per-frame mouth data from the voiceover, so characters' mouths move with the real audio.

    .venv-qwen/bin/python tts/lipsync.py <name>

Reads video/public/<name>/voice.wav + timeline.json, writes video/public/<name>/lips.json:
  "open":  one digit per video frame (0 closed .. 9 wide), from the loudness of the voice
  "shape": one letter per frame, from the sound being spoken (Whisper word timings, letters spread
           across each word): X rest, M closed (m b p), F teeth on lip (f v), O round (o u w q),
           E wide (e i y), A open (everything else)
Frames outside any line are X/0. The animation gives these to whichever character is speaking.
"""
import json, sys
from pathlib import Path

import librosa
import numpy as np
import soundfile as sf
from faster_whisper import WhisperModel

FPS = 30
ROOT = Path(__file__).resolve().parent.parent
pub = ROOT / "video/public" / sys.argv[1]
audio, sr = sf.read(pub / "voice.wav", dtype="float32")
L = json.loads((pub / "timeline.json").read_text())["lines"]
n = int(len(audio) / sr * FPS) + 1
open_ = np.zeros(n)
shape = ["X"] * n

# loudness per frame (40 ms window), in dB
win = int(0.04 * sr)
centres = (np.arange(n) / FPS * sr).astype(int)
rms = np.array([np.sqrt(np.mean(audio[max(0, c - win // 2):c + win // 2] ** 2) + 1e-12) for c in centres])
db = 20 * np.log10(rms)

SHAPE = {**{c: "M" for c in "mbp"}, **{c: "F" for c in "fv"}, **{c: "O" for c in "ouwq"}, **{c: "E" for c in "eiy"}}
asr = WhisperModel("base.en", device="cpu", compute_type="int8")
for l in L:
    a, b = int(l["start"] * FPS), min(n, int(l["end"] * FPS) + 1)
    seg = db[a:b]
    if len(seg) == 0:
        continue
    top, floor = np.percentile(seg, 95), np.percentile(seg, 95) - 30
    level = np.clip((seg - floor) / (top - floor), 0, 1) ** 1.3
    # fast attack, ~70 ms release, so the mouth snaps open and eases shut
    out, prev = np.zeros_like(level), 0.0
    for k, v in enumerate(level):
        prev = v if v > prev else prev * 0.55 + v * 0.45
        out[k] = prev
    open_[a:b] = out
    if l.get("lang", "English") != "English":
        for f in range(a, b):
            shape[f] = "A" if open_[f] > 0.12 else "X"
        continue
    clip = librosa.resample(audio[int(l["start"] * sr):int(l["end"] * sr)], orig_sr=sr, target_sr=16000)
    segs, _ = asr.transcribe(clip, word_timestamps=True)
    for s in segs:
        for w in s.words or []:
            letters = [c for c in w.word.lower() if c.isalpha()] or ["a"]
            f0, f1 = a + int(w.start * FPS), a + max(int(w.end * FPS), int(w.start * FPS) + 1)
            for f in range(max(a, f0), min(b, f1)):
                c = letters[min(len(letters) - 1, int((f - f0) / max(1, f1 - f0) * len(letters)))]
                shape[f] = SHAPE.get(c, "A")
    for f in range(a, b):
        if open_[f] < 0.12:
            shape[f] = "M" if shape[f] == "M" else "X"
        elif shape[f] == "X":
            shape[f] = "A"

data = {"fps": FPS, "open": "".join(str(min(9, int(v * 10))) for v in open_), "shape": "".join(shape)}
assert len(data["open"]) == len(data["shape"]) == n
(pub / "lips.json").write_text(json.dumps(data))
talking = sum(1 for c in data["shape"] if c != "X")
print(f"lips.json: {n} frames, mouth moving in {talking} ({talking / n:.0%}); shapes", {k: data['shape'].count(k) for k in 'XMFOEA'})
