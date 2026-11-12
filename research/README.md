# Research

Everything gathered for the channel. Conclusions live in `youtube/viral-notes.md` (writing),
`youtube/motion.md` (animation) and `CLAUDE.md` (pipeline decisions); this folder is the evidence.

| Path | What |
|---|---|
| `2026-11-niche/` | First niche scan: 298 videos from 16 "what if" channels, outlier ranking, premise types, the competitor searches for our premise, transcript picks |
| `2026-11-niche-v2/` | Bigger test: 2,505 videos from 90 channels, the 11 raw searches, and the within-channel permutation tests of the rules |
| `transcript-study-2026-11.md` | 7 hits vs 5 flops, transcripts via vidIQ: beat timings, structure, what separates them |
| `reference-otherwise-reborn.md` | Beat-by-beat breakdown of a 15.6x hit (Otherwise, "Reborn") and notes on the user's style screenshots |
| `hook-and-title-tests.md` | Every hook, Short first line and title scored for the last-liar episode |
| `voice-tests.md` | Voice engine comparison, the 5 opening takes, speaker-similarity numbers, pronunciation lessons |
| `fact-checks.md` | Each fact in the last-liar and dreams scripts with its verdict and sources |
| `packaging-2026-11-12.md` | Title/thumbnail/tag research for the dreams episode: keyword volumes, "what if you could see" outliers, winning thumbnail patterns, title scores, our channel's stats |
| `voice-takes-dreams.md` | Acted-take results: speaker similarity and word match for every take, which were kept |

## Not stored here, on purpose

- **Other channels' transcripts and screenshots.** This repo is public, and they're the creators'
  copyrighted work, so only our own analysis of them is kept. If the repo is made private, the
  pasted Otherwise transcript and the 4 screenshots can be added.
- **Transcripts of the 12 picked videos** (`2026-11-niche/transcript-picks.txt`): YouTube blocks
  transcript downloads from the cloud machine ("confirm you're not a bot"). Getting around that
  check is off limits. Instead the user runs `scripts/get_transcripts.py` on their own computer
  (public captions, no login) and sends the folder back in the chat; it is not committed while the
  repo is public.
- **Audio and video files** (voice samples, renders): too large and regenerable from the repo.
