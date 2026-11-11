"""Qwen3-TTS VoiceDesign (Apache-2.0) sample for the voice comparison: each voice is described in words.

    .venv-qwen/bin/python tts/compare/qwen_sample.py
"""
import json
from pathlib import Path

import numpy as np
import soundfile as sf
import torch
from qwen_tts import Qwen3TTSModel

HERE = Path(__file__).resolve().parent
CAST = {
    "narrator": "A warm, confident male storyteller in his thirties with a slightly mischievous, playful tone, like a YouTube story narrator.",
    "you": "A young man in his early twenties with a light, expressive voice.",
    "roommate": "A young woman in her twenties with a bright, energetic voice.",
}

model = Qwen3TTSModel.from_pretrained("Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign", device_map="cpu", dtype=torch.float32)
parts, sr = [], 24000
for line in json.loads((HERE / "lines.json").read_text()):
    wavs, sr = model.generate_voice_design(text=line["text"], language="English",
                                           instruct=f"{CAST[line['who']]} Emotion: {line['mood']}.")
    parts += [np.asarray(wavs[0], dtype=np.float32), np.zeros(int(0.6 * sr), dtype=np.float32)]
sf.write(HERE / "out/3_qwen3.wav", np.concatenate(parts), sr)
print("qwen done")
