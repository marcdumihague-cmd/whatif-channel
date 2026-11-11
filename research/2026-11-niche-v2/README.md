# Niche research v2: testing the rules (November 2026)

- `videos.json`: 2,505 long videos (3 min+, Shorts excluded) from 90 "what if" channels, found with
  11 YouTube searches (`ytsearch100`) and collected from public channel listings, 2026-11-11.
- `test_title_features.py`: compares title features within each channel (log views over the
  channel median) with a 5,000-shuffle permutation test. `results.txt` is its output.
- Conclusions are in `youtube/viral-notes.md` ("Tested on a bigger sample").
