"""Chatterbox (MIT) sample for the voice comparison. Clones each role from its Kokoro reference clip.

    .venv-chatterbox/bin/python tts/compare/chatterbox_sample.py
"""
import json
from pathlib import Path

import torch
import torchaudio
from chatterbox.tts import ChatterboxTTS

HERE = Path(__file__).resolve().parent
# exaggeration: 0.5 is neutral, higher is more dramatic. Lower cfg_weight slows and loosens delivery.
ACTING = {"playful, building suspense": (0.6, 0.5), "stunned, quiet disbelief": (0.7, 0.4),
          "alarmed, shouting from another room": (1.0, 0.3), "panicked, fake casual, lying badly": (0.9, 0.3)}

model = ChatterboxTTS.from_pretrained(device="cpu")
parts = []
for line in json.loads((HERE / "lines.json").read_text()):
    ex, cfg = ACTING[line["mood"]]
    wav = model.generate(line["text"], audio_prompt_path=str(HERE / f"out/ref_{line['who']}.wav"), exaggeration=ex, cfg_weight=cfg)
    parts += [wav, torch.zeros(1, int(0.6 * model.sr))]
torchaudio.save(str(HERE / "out/2_chatterbox.wav"), torch.cat(parts, dim=1), model.sr)
print("chatterbox done")
