"""ElevenLabs sample for the voice comparison. The session's network proxy adds the API key.

    python3 tts/compare/eleven.py
"""
import io, json, urllib.request, wave
from pathlib import Path

HERE = Path(__file__).resolve().parent
API = "https://api.elevenlabs.io"
# Premade library voices; change after listening.
VOICES = {"narrator": "pNInz6obpgDQGcFmaJgB", "you": "TxGEqnHWrfWFTfGW9XAq", "roommate": "21m00Tcm4TlvDq8ikWAM"}
TAGS = {"stunned, quiet disbelief": "[stunned]", "alarmed, shouting from another room": "[shouting]",
        "panicked, fake casual, lying badly": "[nervous laugh]", "playful, building suspense": "[playful]"}


def say(text: str, voice: str) -> bytes:
    req = urllib.request.Request(
        f"{API}/v1/text-to-speech/{voice}?output_format=pcm_24000",
        data=json.dumps({"text": text, "model_id": "eleven_v3"}).encode(),
        headers={"Content-Type": "application/json", "xi-api-key": "proxy-injected"},
    )
    with urllib.request.urlopen(req, timeout=120) as r:
        return r.read()


pcm = b""
for line in json.loads((HERE / "lines.json").read_text()):
    pcm += say(f"{TAGS[line['mood']]} {line['text']}", VOICES[line["who"]]) + b"\0\0" * int(0.6 * 24000)
with wave.open(str(HERE / "out/4_elevenlabs.wav"), "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(24000); w.writeframes(pcm)
print("elevenlabs done")
