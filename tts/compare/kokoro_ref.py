"""Kokoro baseline for the voice comparison, plus one reference clip per role for voice cloning.

    .venv/bin/python tts/compare/kokoro_ref.py
"""
import json
from pathlib import Path

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

HERE = Path(__file__).resolve().parent
OUT = HERE / "out"
OUT.mkdir(exist_ok=True)
VOICES = {"narrator": "am_michael", "you": "am_puck", "roommate": "af_bella"}
REF_TEXT = "I honestly thought it was going to be a normal Tuesday, but then everything in this house started breaking at once."

tts = Kokoro(str(HERE.parent / "models/kokoro-v1.0.onnx"), str(HERE.parent / "models/voices-v1.0.bin"))
for who, voice in VOICES.items():
    audio, rate = tts.create(REF_TEXT, voice=voice, lang="en-us")
    sf.write(OUT / f"ref_{who}.wav", audio, rate)

lines = json.loads((HERE / "lines.json").read_text())
parts = []
for line in lines:
    audio, rate = tts.create(line["text"], voice=VOICES[line["who"]], lang="en-us")
    parts += [audio, np.zeros(int(0.6 * rate), dtype=np.float32)]
sf.write(OUT / "1_kokoro.wav", np.concatenate(parts), rate)
print("kokoro done")
