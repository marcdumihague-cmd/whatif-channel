# Third-party skills

Copied unmodified into `.claude/skills/` so every Claude Code session on this repo has them, with
nothing to install. To update one, re-copy from its repo and change the commit here.

| Skills | Source | Commit | Licence |
|--------|--------|--------|---------|
| `yt-*` (11) | https://github.com/Jakeschincariol/youtube-agent-skill | a2feb2104981a375ffd4f87ee04f4f5344ac43c6 | MIT, `youtube-agent-skill/LICENSE` |
| `ponytail*` (6) + `.claude/rules/ponytail.md` (its AGENTS.md) | https://github.com/DietrichGebert/ponytail | 96608e078b2d5ea607c5c3b8b5a54d1c1fba6846 | MIT, `ponytail/LICENSE` |
| `headroom` | https://github.com/headroomlabs-ai/headroom | 3c66c91eea3ad8cf77d7d66abe484cee876271eb | Apache-2.0, `headroom/LICENSE` + `headroom/NOTICE` |
| `graphify` (`SKILL.md` = its `graphify/skill.md`, `references/` = its `graphify/skills/claude/references/`) | https://github.com/safishamsi/graphify | 480b61ed91cbc08177dc2c60caa9ffd6c9b95749 (v0.9.111) | Apache-2.0 (older parts MIT), `graphify/LICENSE` + `graphify/LICENSE-MIT` + `graphify/NOTICE` |
| `caveman`, `ultracave`, `megacave` (each skill's `SKILL.md`) | https://github.com/JuliusBrussee/caveman | 9b243662ff98d392bc0a95b865a554583d71be75 (v4.1.0) | Apache-2.0 (MIT before 3.0.0), `caveman/LICENSE` + `caveman/LICENSE-MIT` + `caveman/NOTICE` + `caveman/LICENSING.md` |

Not included: Ponytail's hooks and cost band (they need the full plugin install:
`/plugin marketplace add DietrichGebert/ponytail` then `/plugin install ponytail@ponytail`), and
the Headroom CLI itself (see `scripts/install-headroom.sh`).
Graphify's Python tool is not included either: the skill installs it on first use
(`uv tool install graphifyy` or `pip install graphifyy`), and writes its results to `graphify-out/`
(gitignored here). Its optional hooks and `CLAUDE.md` section (`graphify claude install`) are not set up.
Caveman's other 19 skills, its hooks (always-on mode, mode tracking), CLI, proxy and `caveman-compress` are
not included: only the reply-style skill and its two aliases (`/caveman ultra`, `/caveman wenyan`).
Full install: `/plugin marketplace add JuliusBrussee/caveman` then `/plugin install caveman@caveman`.
