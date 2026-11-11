"""Design every voice in voices/voices.json that has no reference clip yet (Qwen3 VoiceDesign).

    .venv-qwen/bin/python tts/design_voices.py

Each entry needs "design" (a description of the voice) and "text" (what the clip says). The clip
is saved as voices/<name>.wav and then cloned for every line by tts/voice.py. Delete a clip and run
this again to redesign that voice.
"""
import json
from pathlib import Path

import numpy as np
import soundfile as sf
import torch
from qwen_tts import Qwen3TTSModel

VOICES = Path(__file__).resolve().parent.parent / "voices"
todo = {k: v for k, v in json.loads((VOICES / "voices.json").read_text()).items() if not (VOICES / f"{k}.wav").exists()}
if todo:
    model = Qwen3TTSModel.from_pretrained("Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign", device_map="cpu", dtype=torch.float32)
    for name, v in todo.items():
        torch.manual_seed(7)
        wavs, sr = model.generate_voice_design(text=v["text"], language="English", instruct=v["design"])
        sf.write(VOICES / f"{name}.wav", np.asarray(wavs[0], dtype=np.float32), sr)
        print("designed", name)
print("voices ready:", sorted(p.stem for p in VOICES.glob("*.wav")))
