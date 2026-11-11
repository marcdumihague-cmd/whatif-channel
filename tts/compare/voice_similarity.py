"""Measure whether clips sound like the same speaker (cosine similarity of speaker embeddings).

    .venv-chatterbox/bin/python tts/compare/voice_similarity.py
"""
from itertools import combinations
from pathlib import Path

import librosa
import numpy as np
from chatterbox.models.voice_encoder import VoiceEncoder

OUT = Path(__file__).resolve().parent / "out"
ve = VoiceEncoder()
ve.load_state_dict(__import__("torch").load(
    __import__("huggingface_hub").hf_hub_download("ResembleAI/chatterbox", "ve.pt"), map_location="cpu"))
ve.eval()


def emb(name: str) -> np.ndarray:
    wav, _ = librosa.load(OUT / f"{name}.wav", sr=16000)
    e = ve.embeds_from_wavs([wav], sample_rate=16000)[0]
    return e / np.linalg.norm(e)


def mean_sim(names: list[str]) -> float:
    es = [emb(n) for n in names]
    return float(np.mean([a @ b for a, b in combinations(es, 2)]))


seed = [f"seed_{i}" for i in range(3)]
noseed = [f"noseed_{i}" for i in range(3)]
print(f"same narrator, fixed seed : {mean_sim(seed):.3f}")
print(f"same narrator, no seed    : {mean_sim(noseed):.3f}")
print(f"narrator vs other person  : {float(emb('seed_0') @ emb('other_person')):.3f}")
print(f"5 takes of the opening    : {mean_sim([f'take_{i}' for i in range(1, 6)]):.3f}")
if (OUT / "clone_0.wav").exists():
    clones = [f"clone_{i}" for i in range(3)]
    print(f"same narrator, cloned     : {mean_sim(clones):.3f}")
    print(f"cloned vs its reference   : {np.mean([emb(c) @ emb('take_4') for c in clones]):.3f}")
