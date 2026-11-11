"""Two Qwen3 VoiceDesign tests: 5 takes of the opening line, and whether a fixed seed keeps a voice stable.

    .venv-qwen/bin/python tts/compare/qwen_tests.py
"""
from pathlib import Path

import numpy as np
import soundfile as sf
import torch
from qwen_tts import Qwen3TTSModel

OUT = Path(__file__).resolve().parent / "out"
NARRATOR = "A warm, confident male storyteller in his thirties with a slightly mischievous, playful tone, like a YouTube story narrator."
YOU = "A young man in his early twenties with a light, expressive voice."

model = Qwen3TTSModel.from_pretrained("Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign", device_map="cpu", dtype=torch.float32)


def say(text: str, instruct: str, seed: int | None, name: str) -> None:
    if seed is not None:
        torch.manual_seed(seed)
    wavs, sr = model.generate_voice_design(text=text, language="English", instruct=instruct)
    sf.write(OUT / f"{name}.wav", np.asarray(wavs[0], dtype=np.float32), sr)


# 1) five takes of the opening line
TAKES = [
    ("It's 7:02 a.m.", "Emotion: calm and matter-of-fact, like the start of an ordinary day."),
    ("It's seven-oh-two in the morning.", "Emotion: sleepy and relaxed, slow pace."),
    ("Seven. Oh. Two. A.M.", "Emotion: dramatic, slow, each word its own beat, like a movie trailer."),
    ("It's 7:02 a.m.", "Emotion: playful and knowing, a little smile in the voice, as if you know something is about to go wrong."),
    ("It's two minutes past seven.", "Emotion: playful, building suspense."),
]
for i, (text, mood) in enumerate(TAKES, 1):
    say(f"{text} Your alarm goes off, so you smack the snooze button.", f"{NARRATOR} {mood}", 7, f"take_{i}")

# 2) consistency: same narrator description on different lines, with and without a fixed seed
LINES = ["Your hand goes straight through the nightstand.", "Here's the thing. Most adults squeeze with about thirty kilograms of force.",
         "And that's when it gets weird."]
for i, line in enumerate(LINES):
    say(line, NARRATOR, 7, f"seed_{i}")
    say(line, NARRATOR, None, f"noseed_{i}")
say(LINES[0], YOU, 7, "other_person")
print("qwen tests done")
