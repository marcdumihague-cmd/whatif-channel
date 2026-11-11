# What If channel

A YouTube channel of "What if...?" videos, made by Claude. Each video takes a made-up scenario
("What if you woke up 10 times stronger?"), explains it, and walks through what would most likely
happen, scene by scene. Visual style: simple, flat, colored animations.

Format: second-person story ("you" are the main character), about 8 to 10 minutes, 16:9, with a
narrator plus short lines from a small recurring cast, and real facts woven in. Full style rules:
`youtube/voice.md` (writing), `youtube/viral-notes.md` (what makes these videos break out: read
before writing any script) and `youtube/motion.md` (animation: nothing is ever still).

Read this file and `youtube/episodes.md` at the start of every session. They are the project
memory: update `youtube/episodes.md` whenever an episode changes status, and update this file when
a decision about the channel changes.

## Production pipeline (working, proven on `episodes/test-scene`)

Setup once per session: `./scripts/setup.sh` (Python 3.12 venv `.venv-qwen` with Qwen3-TTS and
faster-whisper, model download, Remotion). The session must run in the `whatif-channel` cloud
environment, which allows the Hugging Face hosts the models download from.

1. Script: `/yt-script`, saved as `episodes/<name>/script.json`: `facts` (each with a source) and
   `lines` (`scene`, `who` = a role in `voices/`, `text`, optional `say` = spelling for the voice,
   optional `take` = a ready-made recording to use as-is). Write numbers as digits ("30 to 45").
2. Voice: `.venv-qwen/bin/python tts/voice.py episodes/<name>/script.json` -> `video/public/<name>/`
   `voice.wav` + `timeline.json`. About 30 s per line on CPU, so run it in the background.
   It transcribes every line with Whisper and regenerates mismatches (Claude cannot listen; a
   `WARNING` line means the user should listen to that line).
3. Visuals: Remotion in `video/` (React + SVG, 1920x1080, 30 fps), outlined cartoon style;
   reusable character and helpers in `video/src/cartoon.tsx`. Scenes are timed from
   `timeline.json`. Render stills to check layout before a full render:
   `REMOTION_CHROME=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell npx remotion still|render src/index.ts <Composition> out/...`
4. Sound: `.venv-qwen/bin/python tts/mix.py <name>` mixes voice + a generated music bed + generated
   phone/knock effects into `mix.wav` (all synthesised, nothing to license; cues mirror the shots).
5. Thumbnail: a `<Name>Thumb` still composition (1280x720), checked at feed size.
6. Packaging: `/yt-package` (title + thumbnail), `/yt-seo` (description), `/yt-chapters`, `/yt-shorts`.

### Voices (decided)

Qwen3-TTS (Apache-2.0, OK for a monetized channel). Each role was designed once with the
VoiceDesign model (description in `voices/voices.json`) and every line is then cloned from
`voices/<role>.wav` with the Base model. Reason: VoiceDesign alone drifts between lines (speaker
similarity ~0.7, the same as a different person); cloning measures ~0.81 between lines.
Narrator = the user's chosen "take 4" (playful, knowing). New character: design a reference clip
with VoiceDesign (see `tts/compare/qwen_clone_test.py`), save it in `voices/`, add it to
`voices/voices.json`.

Rejected: Kokoro (flat, user found it not entertaining), Chatterbox (word slips), VoiceStudio
(default OmniVoice weights are non-commercial, needs a desktop/GPU). ElevenLabs: the user's API key
was rejected (401); untested. Comparison scripts: `tts/compare/`.

Music: generated ambient pad from `tts/mix.py` (first used on episode 3; the user hasn't heard it yet).

Nothing is ever uploaded by Claude. The user publishes.

## Voice profile

The yt-* skills look for `~/.claude/youtube/voice.md`. In this repo, use `youtube/voice.md`
instead (it is the channel's voice). It is a draft until the user approves it.

## Skills in this repo (`.claude/skills/`)

- `yt-*`: YouTube workflow skills (script, package, seo, chapters, shorts, edit, retention,
  comment, plan, viral, audit). From Jakeschincariol/youtube-agent-skill.
- `ponytail*`: lazy-senior-dev coding mode, plus `/ponytail-review`, `/ponytail-audit`,
  `/ponytail-debt`. From DietrichGebert/ponytail.
- `headroom`: how to add Headroom context compression to code that calls an LLM. From
  headroomlabs-ai/headroom. To wrap Claude Code itself on a local machine, see
  `scripts/install-headroom.sh`.

Sources, versions and licences: `third_party/README.md`.

## Coding rules

Ponytail mode is on for all code in this repo:

@.claude/rules/ponytail.md
