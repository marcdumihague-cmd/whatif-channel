# Third-party skills

Copied unmodified into `.claude/skills/` so every Claude Code session on this repo has them, with
nothing to install. To update one, re-copy from its repo and change the commit here.

| Skills | Source | Commit | Licence |
|--------|--------|--------|---------|
| `yt-*` (11) | https://github.com/Jakeschincariol/youtube-agent-skill | a2feb2104981a375ffd4f87ee04f4f5344ac43c6 | MIT, `youtube-agent-skill/LICENSE` |
| `ponytail*` (6) + `.claude/rules/ponytail.md` (its AGENTS.md) | https://github.com/DietrichGebert/ponytail | 96608e078b2d5ea607c5c3b8b5a54d1c1fba6846 | MIT, `ponytail/LICENSE` |
| `headroom` | https://github.com/headroomlabs-ai/headroom | 3c66c91eea3ad8cf77d7d66abe484cee876271eb | Apache-2.0, `headroom/LICENSE` + `headroom/NOTICE` |

Not included: Ponytail's hooks and cost band (they need the full plugin install:
`/plugin marketplace add DietrichGebert/ponytail` then `/plugin install ponytail@ponytail`), and
the Headroom CLI itself (see `scripts/install-headroom.sh`).
