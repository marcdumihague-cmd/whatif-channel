"""Acted takes for lines marked "act" in a script: generate, then keep the best one in the right voice.

    .venv-qwen/bin/python tts/act.py episodes/<name>/script.json            # step 1: takes + Whisper
    .venv-chatterbox/bin/python tts/act.py episodes/<name>/script.json pick # step 2: voice match, write "take"

Cloned lines (tts/voice.py) keep a character's voice but can't be directed. For an "act" line this
generates 3 takes with Qwen3 VoiceDesign from the role's description in voices/voices.json plus the
line's emotion, checks every take's words with Whisper, then (step 2) measures how close each take
sounds to the role's reference clip. The best take that says the right words and scores at least
MIN_SIM becomes the line's "take", which tts/voice.py then uses as-is. No take good enough: the line is
cloned as usual, so a character never changes voice.
"""
import json, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TAKES, MIN_SIM, MIN_WORDS = 3, 0.80, 0.85  # clone-vs-reference measures ~0.88, another person ~0.72

script_path = Path(sys.argv[1])
script = json.loads(script_path.read_text())
voices = json.loads((ROOT / "voices/voices.json").read_text())
cast = script.get("cast", {})
take_dir = script_path.parent / "takes"
take_dir.mkdir(exist_ok=True)
acted = [(i, l) for i, l in enumerate(script["lines"]) if "act" in l]
report_path = take_dir / "report.json"


def design_of(who: str) -> str:
    d = voices[cast.get(who, who)]["design"]
    return d.split(" Emotion:")[0]  # replace the reference clip's emotion with the line's


if len(sys.argv) < 3:  # ---------- step 1 ----------
    import re, numpy as np, soundfile as sf, torch, librosa
    from faster_whisper import WhisperModel
    from qwen_tts import Qwen3TTSModel
    src = (ROOT / "tts/voice.py").read_text()
    exec(src[src.index("NUM = {"):src.index("def heard")])  # the same word normaliser as voice.py
    import difflib
    design = Qwen3TTSModel.from_pretrained("Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign", device_map="cpu", dtype=torch.float32)
    asr = WhisperModel("base.en", device="cpu", compute_type="int8")
    report = {}
    for i, l in acted:
        for k in range(TAKES):
            torch.manual_seed(100 + k)
            wavs, sr = design.generate_voice_design(text=l.get("say", l["text"]), language="English",
                                                    instruct=f"{design_of(l['who'])} Emotion: {l['act']}.")
            a = np.asarray(wavs[0], dtype=np.float32)
            path = take_dir / f"{i:03d}_{k}.wav"
            sf.write(path, a, sr)
            heard = " ".join(s.text for s in asr.transcribe(librosa.resample(a, orig_sr=sr, target_sr=16000))[0])
            score = difflib.SequenceMatcher(None, words(l["text"]), words(heard)).ratio()
            report[path.name] = {"line": i, "words": round(score, 3), "heard": heard.strip()}
            print(f"{i:3d}.{k} words {score:.2f} | {l['who']}: {l['text'][:50]} | heard: {heard.strip()[:50]}")
    report_path.write_text(json.dumps(report, indent=1))
else:  # ---------- step 2: voice match (needs the Chatterbox venv for its speaker encoder) ----------
    import numpy as np, librosa, torch
    from huggingface_hub import hf_hub_download
    from chatterbox.models.voice_encoder import VoiceEncoder
    ve = VoiceEncoder()
    ve.load_state_dict(torch.load(hf_hub_download("ResembleAI/chatterbox", "ve.pt"), map_location="cpu"))
    ve.eval()
    def emb(p):
        e = ve.embeds_from_wavs([librosa.load(p, sr=16000)[0]], sample_rate=16000)[0]
        return e / np.linalg.norm(e)
    report = json.loads(report_path.read_text())
    refs = {}
    kept = 0
    for i, l in acted:
        role = cast.get(l["who"], l["who"])
        refs.setdefault(role, emb(ROOT / f"voices/{role}.wav"))
        best = None
        for k in range(TAKES):
            name = f"{i:03d}_{k}.wav"
            sim = float(emb(take_dir / name) @ refs[role])
            report[name]["sim"] = round(sim, 3)
            ok = sim >= MIN_SIM and report[name]["words"] >= MIN_WORDS
            if ok and (best is None or sim > best[1]):
                best = (name, sim)
        l.pop("take", None)
        if best:
            l["take"] = str((take_dir / best[0]).relative_to(ROOT))
            kept += 1
        sims = " ".join(f"{report[f'{i:03d}_{k}.wav']['sim']:.2f}/{report[f'{i:03d}_{k}.wav']['words']:.2f}" for k in range(TAKES))
        print(f"{i:3d} {l['who']:<8} sim/words {sims} -> {best[0] if best else 'clone'}")
    report_path.write_text(json.dumps(report, indent=1))
    script_path.write_text(json.dumps(script, indent=1))
    print(f"{kept}/{len(acted)} acted lines use a take; the rest are cloned")
