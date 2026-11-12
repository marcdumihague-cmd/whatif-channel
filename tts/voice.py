"""Voice an episode script: one WAV plus a timeline of when each line is spoken.

    .venv-qwen/bin/python tts/voice.py episodes/<name>/script.json

Every role is cloned from its reference clip in voices/ (Qwen3-TTS 1.7B Base, Apache-2.0), so a
character sounds like the same person on every line. A line may carry:
  "say":  a spelling for the voice when the caption text reads badly aloud
  "take": a ready-made recording to use instead of generating one
  "lang": the spoken language (default English; non-English lines skip the Whisper check)
  "caption": on-screen text when it differs from the spoken text
An optional "cast" maps speaker labels to voices, so several small parts can share one voice.
Each generated line is transcribed with Whisper and regenerated (up to 2 more tries) when the
words don't match the script, since nobody listens to the lines one by one.

Writes video/public/<name>/voice.wav and video/public/<name>/timeline.json.
"""
import difflib, json, re, sys
from pathlib import Path

import librosa
import numpy as np
import soundfile as sf
import torch
from faster_whisper import WhisperModel
from qwen_tts import Qwen3TTSModel

ROOT = Path(__file__).resolve().parent.parent
SR = 24000
GAP, SCENE_GAP, TAIL = 0.35, 0.7, 1.2  # seconds of silence: between lines, at a scene change, at the end
MATCH = 0.85  # minimum word similarity between script and transcript

script_path = Path(sys.argv[1])
script = json.loads(script_path.read_text())
GAP = script.get("pace", {}).get("gap", GAP)  # an episode can tighten the pauses
SCENE_GAP = script.get("pace", {}).get("scene_gap", SCENE_GAP)
out = ROOT / "video" / "public" / script_path.parent.name
out.mkdir(parents=True, exist_ok=True)

refs = json.loads((ROOT / "voices/voices.json").read_text())
tts = Qwen3TTSModel.from_pretrained("Qwen/Qwen3-TTS-12Hz-1.7B-Base", device_map="cpu", dtype=torch.float32)
cast = script.get("cast", {})  # speaker label -> voice in voices/ (default: the label itself)
voice_of = lambda who: cast.get(who, who)
prompts = {v: tts.create_voice_clone_prompt(ref_audio=str(ROOT / f"voices/{v}.wav"), ref_text=refs[v]["text"])
           for v in {voice_of(l["who"]) for l in script["lines"]}}
asr = WhisperModel("base.en", device="cpu", compute_type="int8")

NUM = {w: str(i) for i, w in enumerate("zero one two three four five six seven eight nine ten eleven twelve "
                                         "thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty".split())}
NUM |= {w: str(10 * i) for i, w in enumerate("thirty forty fifty sixty seventy eighty ninety".split(), 3)}
SCALE = {"hundred": 100, "thousand": 1000, "million": 1000000}


def words(s: str) -> list[str]:
    """Normalised words; number phrases ("a hundred and ten", "11,500 dollars") become digits.
    Whisper writes numbers as digits or words at random, and "$" for "dollars"."""
    s = s.lower().replace("-", " ").replace("$", "")
    toks = re.sub(r"(\d),(\d)", r"\1\2", s)
    toks = [w for w in re.sub(r"[^a-z0-9 ]", " ", toks).split() if w != "dollars"]
    out, total, cur, inside = [], 0, 0, False
    for i, w in enumerate(toks):
        nxt = toks[i + 1] if i + 1 < len(toks) else ""
        if w in NUM or w.isdigit():
            cur += int(NUM.get(w, w)); inside = True
        elif w in SCALE and (inside or out[-1:] == ["a"]):
            if not inside: out.pop()
            cur = max(cur, 1) * SCALE[w]
            if SCALE[w] > 100: total, cur = total + cur, 0
            inside = True
        elif w == "and" and inside and (nxt in NUM or nxt.isdigit()):
            continue
        else:
            if inside: out.append(str(total + cur)); total, cur, inside = 0, 0, False
            out.append(w)
    if inside: out.append(str(total + cur))
    return out


assert words("went up ten times") == words("went up 10 times")
assert words("we'd go to a hundred and ten.") == words("we'd go to $110.")
assert words("You get eleven thousand five hundred dollars.") == words("You get $11,500.")
assert words("up two thousand dollars") == words("up $2,000")


def heard(audio: np.ndarray) -> str:
    segs, _ = asr.transcribe(librosa.resample(audio, orig_sr=SR, target_sr=16000))
    return " ".join(s.text for s in segs)


def voice(line: dict) -> np.ndarray:
    if "take" in line:
        audio, sr = sf.read(ROOT / line["take"], dtype="float32")
        return audio if sr == SR else librosa.resample(audio, orig_sr=sr, target_sr=SR)
    best, best_score = None, -1.0
    for attempt in range(3):
        torch.manual_seed(attempt)
        lang = line.get("lang", "English")
        wavs, sr = tts.generate_voice_clone(text=line.get("say", line["text"]), language=lang, voice_clone_prompt=prompts[voice_of(line["who"])])
        assert sr == SR, sr
        audio = np.asarray(wavs[0], dtype=np.float32)
        if lang != "English":  # the Whisper check is English-only
            return audio
        got = heard(audio)
        score = difflib.SequenceMatcher(None, words(line["text"]), words(got)).ratio()
        if score > best_score:
            best, best_score = audio, score
        if score >= MATCH:
            break
        print(f"  retry ({score:.2f}): {line['text']!r} was heard as {got.strip()!r}")
    if best_score < MATCH:
        print(f"  WARNING kept best ({best_score:.2f}) for {line['text']!r}: listen to it")
    return best


chunks, timeline, t = [], [], 0.0
for i, line in enumerate(script["lines"]):
    if i:
        gap = SCENE_GAP if line["scene"] != script["lines"][i - 1]["scene"] else GAP
        chunks.append(np.zeros(int(gap * SR), dtype=np.float32))
        t += gap
    audio = voice(line)
    chunks.append(audio)
    timeline.append({**line, "start": round(t, 3), "end": round(t + len(audio) / SR, 3)})
    t += len(audio) / SR
    print(f"{i + 1}/{len(script['lines'])} {line['who']}: {line['text']}")

chunks.append(np.zeros(int(TAIL * SR), dtype=np.float32))
sf.write(out / "voice.wav", np.concatenate(chunks), SR)
(out / "timeline.json").write_text(json.dumps({"duration": round(t + TAIL, 3), "lines": timeline}, indent=1))

assert all(a["end"] <= b["start"] for a, b in zip(timeline, timeline[1:])), "lines overlap"
print(f"{len(timeline)} lines, {t + TAIL:.1f}s -> {out}")
