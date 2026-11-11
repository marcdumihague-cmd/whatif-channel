"""Design each voice once (VoiceDesign), then speak every line by cloning it (Base). Tests consistency.

    .venv-qwen/bin/python tts/compare/qwen_clone_test.py
"""
import gc, json
from pathlib import Path

import numpy as np
import soundfile as sf
import torch
from qwen_tts import Qwen3TTSModel

HERE = Path(__file__).resolve().parent
OUT = HERE / "out"
REF_TEXT = "Okay, so this is going to sound completely ridiculous, but I promise you every single word of it is true."
CAST = {
    "you": "A young man in his early twenties with a light, expressive voice. Emotion: animated, storytelling to a friend.",
    "roommate": "A young woman in her twenties with a bright, energetic voice. Emotion: animated, storytelling to a friend.",
}
refs = {"narrator": (OUT / "take_4.wav", "It's 7:02 a.m. Your alarm goes off, so you smack the snooze button.")}

design = Qwen3TTSModel.from_pretrained("Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign", device_map="cpu", dtype=torch.float32)
for who, desc in CAST.items():
    torch.manual_seed(7)
    wavs, sr = design.generate_voice_design(text=REF_TEXT, language="English", instruct=desc)
    sf.write(OUT / f"voice_{who}.wav", np.asarray(wavs[0], dtype=np.float32), sr)
    refs[who] = (OUT / f"voice_{who}.wav", REF_TEXT)
del design; gc.collect()

base = Qwen3TTSModel.from_pretrained("Qwen/Qwen3-TTS-12Hz-1.7B-Base", device_map="cpu", dtype=torch.float32)
prompts = {who: base.create_voice_clone_prompt(ref_audio=str(p), ref_text=t) for who, (p, t) in refs.items()}


def say(text: str, who: str) -> tuple[np.ndarray, int]:
    wavs, sr = base.generate_voice_clone(text=text, language="English", voice_clone_prompt=prompts[who])
    return np.asarray(wavs[0], dtype=np.float32), sr


for i, line in enumerate(["Your hand goes straight through the nightstand.",
                          "Here's the thing. Most adults squeeze with about thirty kilograms of force.",
                          "And that's when it gets weird."]):
    a, sr = say(line, "narrator")
    sf.write(OUT / f"clone_{i}.wav", a, sr)

parts = []
for line in json.loads((HERE / "lines.json").read_text()):
    a, sr = say(line["text"].replace("seven oh two A.M.", "7:02 a.m."), line["who"])
    parts += [a, np.zeros(int(0.6 * sr), dtype=np.float32)]
sf.write(OUT / "5_qwen_clone.wav", np.concatenate(parts), sr)
print("clone test done")
