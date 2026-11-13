"""Mix an episode: voice + a generated ambient music bed + generated phone/knock sounds.

    .venv-qwen/bin/python tts/mix.py one-minute|dreams|watched|except

Reads video/public/<name>/voice.wav and timeline.json, writes video/public/<name>/mix.wav.
Every sound is synthesised here (no third-party audio, nothing to license). Cue times mirror the
animation (video/src/om, video/src/dr), so change both together.
"""
import json, sys
from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
name = sys.argv[1]
pub = ROOT / "video/public" / name
voice, SR = sf.read(pub / "voice.wav", dtype="float32")
L = json.loads((pub / "timeline.json").read_text())["lines"]
n = len(voice)
rng = np.random.default_rng(7)
first = lambda scene: next(i for i, l in enumerate(L) if l["scene"] == scene)
S = lambda i: L[i]["start"]
E = lambda i: L[i]["end"]
sec = lambda d: np.arange(int(d * SR)) / SR


def env(x, attack=0.005, release=0.1):
    t = np.arange(len(x)) / SR
    return x * np.minimum(1, t / max(attack, 1e-4)) * np.exp(-t / max(release, 1e-4))


def place(buf, clip, at, gain):
    i = int(at * SR)
    if i >= len(buf) or i + len(clip) <= 0:
        return
    clip = clip / (np.max(np.abs(clip)) or 1)  # gain is then the sound's peak level
    j = min(len(buf), i + len(clip))
    buf[max(0, i):j] += gain * clip[max(0, -i):j - i]


# ---------- sounds ----------
def click():
    return env(rng.normal(0, 1, int(0.03 * SR)) * 0.6 + np.sin(2 * np.pi * 1800 * sec(0.03)) * 0.4, 0.001, 0.008)

def knock():
    t = sec(0.18)
    return env(np.sin(2 * np.pi * 150 * t) + 0.4 * np.sin(2 * np.pi * 310 * t) + 0.3 * rng.normal(0, 1, len(t)), 0.001, 0.045)

def ringback(d=1.8):  # US ringback tone
    t = sec(d)
    return np.minimum(1, t / 0.02) * np.minimum(1, (d - t) / 0.05) * 0.5 * (np.sin(2 * np.pi * 440 * t) + np.sin(2 * np.pi * 480 * t))

def bell(d=1.4):  # old phone bell: two tones hammered at 20 Hz
    t = sec(d)
    hammer = 0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 20 * t))
    tone = np.sin(2 * np.pi * 1050 * t) + 0.7 * np.sin(2 * np.pi * 1380 * t) + 0.3 * np.sin(2 * np.pi * 2700 * t)
    return tone * hammer * np.minimum(1, (d - t) / 0.1) * 0.5

def rotary(digits=(3, 0, 7)):
    out = []
    for d in digits:
        out += [click(), np.zeros(int(0.07 * SR))] * (d or 10)
        out.append(np.zeros(int(0.35 * SR)))
    return np.concatenate(out)

def smash():
    t = sec(0.6)
    return env(rng.normal(0, 1, len(t)) * (0.6 + 0.4 * np.sin(2 * np.pi * 3100 * t)), 0.002, 0.12)

def whoosh(d=1.4):  # soft air: low-passed noise that swells and fades
    t = sec(d)
    x = np.cumsum(rng.normal(0, 1, len(t))); x -= np.convolve(x, np.ones(400) / 400, mode="same")
    return x * np.sin(np.pi * t / d) ** 2

def thump():  # a low, soft heartbeat-like knock
    t = sec(0.25)
    return env(np.sin(2 * np.pi * 70 * t) + 0.3 * np.sin(2 * np.pi * 110 * t), 0.004, 0.07)

def hum(d):  # a low engine drone: two sines with a slow wobble
    t = sec(d)
    x = np.sin(2 * np.pi * 82 * t + 0.4 * np.sin(2 * np.pi * 0.5 * t)) + 0.5 * np.sin(2 * np.pi * 164 * t)
    return x * np.minimum(1, t / 1.0) * np.minimum(1, (d - t) / 1.0)

def flyby(d):  # a plane passing: low-passed noise that swells and fades
    return whoosh(d)

# ---------- music bed: slow warm chords (Am F C G), sine pads with a gentle swell ----------
def pad(total):
    chords = [[220.0, 261.63, 329.63], [174.61, 220.0, 261.63], [261.63, 329.63, 392.0], [196.0, 246.94, 293.66]]
    bar = 6.0
    out = np.zeros(total, dtype=np.float32)
    t_all = np.arange(total) / SR
    for k in range(int(total / SR / bar) + 1):
        a, b = int(k * bar * SR), min(total, int((k + 1) * bar * SR + 1.5 * SR))
        if a >= total:
            break
        t = t_all[a:b] - k * bar
        shape = np.minimum(1, t / 1.5) * np.minimum(1, np.maximum(0, (bar + 1.5 - t) / 1.5))
        notes = chords[k % 4]
        x = sum(np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t + 0.3) for f in notes)
        x += 0.6 * np.sin(2 * np.pi * notes[0] / 2 * t)  # bass
        out[a:b] += (x * shape / 4).astype(np.float32)
    lfo = 0.85 + 0.15 * np.sin(2 * np.pi * 0.05 * t_all)
    return out * lfo


sfx = np.zeros(n, dtype=np.float32)
quiets = []  # (start, end) where the music drops low
if name == "one-minute":
    co = first("cold_open")
    gp = co + 2
    place(sfx, rotary(), 0.3, 0.25)
    place(sfx, ringback(), 3.2, 0.12)
    place(sfx, click(), S(gp) - 0.5, 0.5)
    place(sfx, click(), E(gp + 2) + 0.05, 0.7)
    # calls: pick-up click at the start, hang-up click at the end (same windows as the animation)
    calls = {
        "einstein": (S(first("einstein") + 1) - 0.5, E(first("einstein") + 4) + 0.2),
        "trader": (S(first("trader") + 1) - 0.4, E(first("trader") + 2) + 0.2),
        "sarah": (S(first("sarah") + 1) - 0.4, E(first("sarah") + 1) + 0.2),
        "harold": (S(first("harold") + 1) - 0.4, E(first("harold") + 4) + 0.2),
        "eddie": (S(first("eddie") + 1) - 0.4, E(first("eddie") + 3) + 0.2),
        "theo_call": (S(first("theo_call")) + 1, E(first("theo_call") + 1)),
    }
    for a, b in calls.values():
        place(sfx, click(), a, 0.5)
        place(sfx, click(), b, 0.6)
    g = first("grandma") + 4
    for i in range(3):
        place(sfx, knock(), S(g) + 0.6 + i * 0.45, 0.55)
    place(sfx, smash(), S(first("sarah") + 2) + 0.8, 0.35)
    lt = first("letter") + 2
    for i in range(3):
        place(sfx, knock(), S(lt) + 0.8 + i * 0.5, 0.55)
    bk = first("bookend")
    place(sfx, bell(), S(bk) + 0.2, 0.18)
    place(sfx, bell(), S(bk) + 2.2, 0.18)
    place(sfx, click(), S(bk + 1) - 0.2, 0.5)
    for i in range(3):
        place(sfx, knock(), S(bk + 1) + 2 + i * 0.55, 0.4)
    place(sfx, click(), S(bk + 2) + 0.3, 0.7)

    quiets = [(S(bk) - 0.5, E(bk + 2) + 1.0), (S(lt) - 0.2, E(lt + 1))]
elif name == "dreams":  # cues mirror video/src/dr/Episode.tsx
    at = lambda scene, k=0: first(scene) + k
    # soft, low sounds only (user rule: nothing high-pitched; see youtube/motion.md)
    place(sfx, whoosh(1.6), S(0) + 1.4, 0.2)  # Mom's ghost fades in
    place(sfx, flyby(4.0), S(at("dinner")), 0.3)
    place(sfx, whoosh(2.0), S(at("detective", 6)) + 0.6, 0.25)  # the motorbike jump
    c = at("choice")
    for x in np.arange(S(c + 1), S(c + 6) + 0.6, 1.0):
        place(sfx, thump(), x, 0.12)  # the countdown, a soft heartbeat
    place(sfx, thump(), S(c + 6) + 0.6, 0.4)  # the button
    place(sfx, whoosh(), S(c + 5) + (E(c + 5) - S(c + 5)) * 0.55, 0.16)
    place(sfx, flyby(6.0), S(at("flight")), 0.15)  # the small plane, distant
    place(sfx, whoosh(2.5), S(at("flight", 4)) + 2.0, 0.22)  # the ghost merges
    place(sfx, whoosh(), S(at("theo", 2)) - 0.2, 0.18)
    place(sfx, whoosh(2.0), S(at("tease")) + (E(at("tease")) - S(at("tease"))) * 0.5, 0.18)
    sc = at("sceptic")
    quiets = [(S(sc + 7) - 0.3, E(sc + 8) + 0.5), (S(c + 5), S(c + 6) + 1.0)]
elif name == "watched":  # cues mirror video/src/wt/Episode.tsx; soft and low only
    at = lambda scene, k=0: first(scene) + k
    D = lambda i: E(i) - S(i)
    for i in range(5):
        place(sfx, thump(), S(1) + 1.25 + i * 0.07, 0.35)  # the knives drop into the counter
    h = first("half")
    place(sfx, whoosh(1.0), S(h + 1) + 0.2, 0.2)
    place(sfx, thump(), S(h + 1) + 1.4, 0.6)  # the landing that isn't
    c = first("chess")
    for x in np.arange(S(c + 4), E(c + 7), 0.67):
        place(sfx, thump() * 0.5, x, 0.12)  # chess clock taps
    co = first("cost")
    burst = S(co + 1) + D(co + 1) * 0.75
    place(sfx, whoosh(4.0), burst, 0.3)  # the pipe lets go
    f = first("flight")
    land = S(f + 13) + D(f + 13) * 0.55
    place(sfx, hum(land - S(f) + 1.0), S(f), 0.1)  # the engine, low and steady
    place(sfx, thump(), S(f + 2), 0.35)  # Ray slumps
    place(sfx, thump(), land, 0.6)
    place(sfx, whoosh(2.0), land, 0.25)
    k = at("tease", 2)
    for i in range(3):
        place(sfx, knock(), S(k) + 0.3 + i * 0.35, 0.45)
    quiets = [(S(f + 10), land + 0.5)]
elif name == "except":  # cues mirror video/src/ex/Episode.tsx; soft and low only
    at = lambda scene, k=0: first(scene) + k
    D = lambda i: E(i) - S(i)
    place(sfx, whoosh(1.6), S(0) + 0.8, 0.22)  # Theo lifts off
    im = first("immune")
    place(sfx, thump(), S(im + 2) + D(im + 2) * 0.35, 0.5)  # the high five
    place(sfx, thump(), S(im + 2) + D(im + 2) * 0.35 + 0.25, 0.45)  # Theo drops
    lo = first("lonely")
    for i in range(6):
        place(sfx, whoosh(0.6), S(lo + 1) + D(lo + 1) * 0.25 + i * 0.08, 0.1)  # the class teleports away
    mx = first("max")
    place(sfx, hum(E(at("climax", 4)) - S(mx) + 0.5), S(mx) + 0.6, 0.08)  # mind control: a low drone
    cl = first("climax")
    grab = S(cl + 4) + D(cl + 4) * 0.35
    place(sfx, thump(), grab, 0.6)
    place(sfx, whoosh(2.5), grab + 0.1, 0.25)  # the power switches off for everyone
    pf = first("payoff")
    place(sfx, whoosh(1.0), S(pf + 4) + D(pf + 4) * 0.3, 0.2)  # Theo trips and floats
    tz = first("tease")
    place(sfx, thump() * 0.6, S(tz) + 0.4, 0.3)  # the phone buzzes
    quiets = [(S(cl + 4), grab + 1.0)]
from scipy.signal import butter, sosfilt
sfx = sosfilt(butter(4, 2000, fs=SR, output="sos"), sfx).astype(np.float32)  # cut everything above ~2 kHz
music = pad(n)
# duck the music under speech, and drop it out for the quiet climax moments
speech = np.zeros(n, dtype=np.float32)
for l in L:
    speech[int(l["start"] * SR):int(l["end"] * SR)] = 1
kernel = np.ones(int(0.25 * SR)) / int(0.25 * SR)
speech = np.convolve(speech, kernel, mode="same")
level = 0.10 - 0.05 * speech
for quiet in quiets:
    a, b = int(quiet[0] * SR), int(quiet[1] * SR)
    level[a:b] *= 0.35
mix = voice + music * level + sfx
peak = np.max(np.abs(mix))
mix = mix / peak * 0.95 if peak > 0.95 else mix
assert np.isfinite(mix).all()
sf.write(pub / "mix.wav", mix.astype(np.float32), SR)
print(f"mix.wav {n / SR:.1f}s, peak {peak:.2f}")
