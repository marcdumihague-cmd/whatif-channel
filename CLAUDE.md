# What If channel

A YouTube channel of "What if...?" videos, made by Claude. Each video takes a made-up scenario
("What if you woke up 10 times stronger?"), explains it, and walks through what would most likely
happen, scene by scene. Visual style: simple, flat, colored animations.

Format: second-person story ("you" are the main character), about 8 to 10 minutes, 16:9, with a
narrator plus short lines from a small recurring cast, and real facts woven in. Full style rules:
`youtube/voice.md`.

Read this file and `youtube/episodes.md` at the start of every session. They are the project
memory: update `youtube/episodes.md` whenever an episode changes status, and update this file when
a decision about the channel changes.

## Production pipeline (working, proven on `episodes/test-scene`)

Setup once per session: `./scripts/setup.sh` (Python venv, Kokoro voice model, faster-whisper,
Remotion). The session must run in the `whatif-channel` cloud environment, which allows the
Hugging Face hosts the models download from.

1. Script: `/yt-script`, saved as `episodes/<name>/script.json`: `voices` (role -> Kokoro voice),
   `facts` (each with a source), and `lines` (`scene`, `who`, `text`, optional `say` = spelling
   for the voice when the caption text reads badly aloud).
2. Voice: `.venv/bin/python tts/voice.py episodes/<name>/script.json` -> `video/public/<name>/`
   `voice.wav` + `timeline.json` (start/end of every line). Kokoro-82M via kokoro-onnx,
   Apache-2.0, OK for a monetized channel.
3. Check the voice: transcribe `voice.wav` with faster-whisper (`base.en`, pass a 16 kHz array,
   set `HF_HUB_DISABLE_XET=1`) and compare to the script. Claude cannot listen, so this is the
   pronunciation check. Interjections ("Huh.") come out wrong; rewrite them as words.
4. Visuals: Remotion in `video/` (React + SVG, flat colors, 1920x1080, 30 fps). Scenes are timed
   from `timeline.json`. Render stills to check layout before a full render:
   `REMOTION_CHROME=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell npx remotion still|render src/index.ts <Composition> out/...`
5. Packaging: `/yt-package` (title + thumbnail), `/yt-seo` (description), `/yt-chapters`, `/yt-shorts`.

Not decided yet: background music and sound effects (no source yet), premium voices.

Voices tried: narrator `am_michael`, you `am_puck`, roommate `af_bella`. VoiceStudio was
reviewed and not used: its default OmniVoice weights are non-commercial (CC-BY-NC) and it needs a
desktop/GPU.

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
