# Niche research, November 2026

The data behind `youtube/viral-notes.md`.

- `videos.json`: 298 recent videos from 16 "what if" story channels (channel, title, views, URL,
  duration), collected 2026-11-11 from public YouTube listings with `yt-dlp --flat-playlist`.
- `outliers.txt`: every video at 2x+ its own channel's median (`/yt-viral`, `swipe.py --min 2.0`).
- `premise_types.py` / `premise_types.txt`: medians by premise type, title numbers and length.
- `searches/`: the raw YouTube searches, including the 4 competitor searches for our premise
  ("what if nobody could lie...") and the channel list.
- `transcript-picks.txt`: the 7 hits and 5 flops chosen for transcript study. YouTube blocked
  transcript downloads from the cloud machine, so only the Otherwise "Reborn" transcript (pasted by
  the user) was studied. Paste more and add them here.

Re-run the ranking: `python3 .claude/skills/yt-viral/swipe.py research/2026-11-niche/videos.json --min 2.0`
