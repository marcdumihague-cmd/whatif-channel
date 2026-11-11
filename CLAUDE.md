# What If channel

A YouTube channel of "What if...?" videos, made by Claude. Each video takes a made-up scenario
("What if you woke up 10 times stronger?"), explains it, and walks through what would most likely
happen, scene by scene. Visual style: simple, flat, colored animations.

Read this file and `youtube/episodes.md` at the start of every session. They are the project
memory: update `youtube/episodes.md` whenever an episode changes status, and update this file when
a decision about the channel changes.

## Planned production pipeline

Nothing is built yet. Agreed direction, to be set up when the first episode is made:

1. Script: `/yt-script` (hooks scored with `.claude/skills/yt-script/hookscore.py`).
2. Voiceover: text-to-speech (default: Piper, free and local; can switch to a premium voice).
3. Visuals: Remotion (React), flat-color shapes and a simple character.
4. Captions: Whisper (open-source, e.g. faster-whisper) for word-level timing.
5. Final render and audio mix: FFmpeg.
6. Packaging: `/yt-package` (title + thumbnail), `/yt-seo` (description), `/yt-chapters`, `/yt-shorts`.

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
