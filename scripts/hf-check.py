"""Check that the mix has no high-pitched sound (the user's rule): energy above 3 kHz in everything except the voice.

    .venv-qwen/bin/python scripts/hf-check.py <name>

Passes under -40 dB (episodes measure about -77 to -82 dB). Exits 1 on a fail.
"""
import sys
from pathlib import Path
import numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt

pub = Path(__file__).resolve().parent.parent / "video/public" / sys.argv[1]
m, sr = sf.read(pub / "mix.wav"); a, _ = sf.read(pub / "voice.wav")
m = m.mean(1) if m.ndim > 1 else m; a = a.mean(1) if a.ndim > 1 else a
n = min(len(m), len(a)); m, a = m[:n], a[:n]
k = np.dot(m, a) / np.dot(a, a)  # the voice's gain inside the mix
rest = m / k - a                 # music + effects only
h = sosfilt(butter(4, 3000, "hp", fs=sr, output="sos"), rest)
db = 20 * np.log10(np.sqrt(np.mean(h ** 2)) + 1e-12)
print(f"music + effects above 3 kHz: {db:.1f} dB ({'ok' if db < -40 else 'TOO BRIGHT'})")
sys.exit(0 if db < -40 else 1)
