# Voice engine tests (2026-11-11)

All engines read the same 4 lines (`tts/compare/lines.json`). Claude cannot listen, so every sample
was checked with Whisper (`base.en`) for words, and with a speaker-embedding model (Chatterbox's
voice encoder, cosine similarity) for "is it the same person". The user judged the sound.

## Engines

| Engine | Licence | Speed on this CPU | Whisper check | User verdict |
|---|---|---|---|---|
| Kokoro-82M (kokoro-onnx) | Apache-2.0 | 4 lines in seconds | correct | "not very good and not really entertaining" |
| Chatterbox | MIT (adds an inaudible Perth watermark) | ~1.5 min | 2 slips ("straight *to*", an extra "What?") | not chosen |
| Qwen3-TTS 1.7B VoiceDesign | Apache-2.0 | ~2 min | word-perfect | **best**, except the delivery of "It's 7:02 a.m." |
| ElevenLabs v3 | paid | n/a | n/a | not tested: the user's API key was rejected (401) |
| VoiceStudio (app) | AGPL app; default OmniVoice weights CC-BY-NC | n/a | n/a | rejected: non-commercial weights, needs a desktop/GPU |

## Five takes of the opening line (Qwen3 VoiceDesign)

1 calm "It's 7:02 a.m." · 2 sleepy "seven-oh-two in the morning" · 3 dramatic "Seven. Oh. Two. A.M." ·
**4 playful, knowing "It's 7:02 a.m." (chosen by the user; now `voices/narrator.wav`)** ·
5 "two minutes past seven".

## Does a voice stay the same person? (speaker similarity, higher = more alike)

| Comparison | Similarity |
|---|---|
| Same narrator description, different lines, VoiceDesign, fixed seed | 0.725 |
| Same narrator description, different lines, VoiceDesign, no seed | 0.654 |
| Narrator vs a different person (baseline) | 0.716 |
| 5 takes of the same line | 0.789 |
| **Design once, then clone every line (Base model)** | **0.813** |
| **Cloned lines vs their reference clip** | **0.878** |

Conclusion: VoiceDesign alone drifts as much as switching to another person, so every channel voice
is designed once and cloned for every line (`tts/voice.py`).

## Pronunciation lessons

- Interjections fail: "Huh." came out as "Hi" / "Who?"; rewrite them as words ("Wait. What?").
- Whisper writes numbers as digits or words at random; `tts/voice.py` compares number phrases as
  digits so "a hundred and ten" matches "$110".
- Qwen3 reads digits well ("7:02 a.m.", "30 to 45"), so scripts use digits.

Scripts: `tts/compare/` (Kokoro, Chatterbox, Qwen3, ElevenLabs samples; `qwen_tests.py`,
`qwen_clone_test.py`, `voice_similarity.py`).
