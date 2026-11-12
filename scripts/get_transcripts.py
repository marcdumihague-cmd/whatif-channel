#!/usr/bin/env python3
"""Download the public English captions of the 12 study videos as plain text.

Run this on YOUR OWN computer (YouTube blocks caption downloads from cloud machines):

    pip install yt-dlp
    python get_transcripts.py

It writes a `transcripts/` folder next to this file: one .txt per video plus `index.txt`.
No login, no cookies, nothing is uploaded anywhere. It only reads captions that anyone can open
with "Show transcript" on YouTube. Send the folder back (zip it and attach it in the chat).
"""
import re
import sys
import tempfile
import time
from pathlib import Path

# (hit/flop, video id, what it is) — the picks in research/2026-11-niche/transcript-picks.txt
PICKS = [
    ("hit", "MroF1XmHOZw", "Ifverse: What If Your Reaction Time Was 10x Faster? (52x, 4.7M)"),
    ("hit", "aV7_cA_xVXI", "Jeremy Bearimy: What IF You Could See Who Has a Crush on You? (25x, 1.8M)"),
    ("hit", "XbXiFizyGko", "Awaken: What if You're The Last Guy on Earth? (28x, 719k)"),
    ("hit", "297D7Xesn8Q", "Otherwise: What If You Were Reborn With All Your Memories? (16x, 787k)"),
    ("hit", "4kHPfx6Gy00", "Ifverse: What If You Had 500 IQ? (16x, 1.4M)"),
    ("hit", "UMkVmEO-88I", "Stick Saga: What If Nobody Could Lie... Except You? (534k)"),
    ("hit", "ophchxHFuno", "What If Hero: What If Nobody Could Lie Except You? (142k)"),
    ("flop", "L0fOb92g-M8", "Otherwise: What If You Could Predict the Market? (0.1x, 4.9k)"),
    ("flop", "saFiC2g6sGw", "Otherwise: What If Everyone Else Had Zero EQ? (0.09x, 4.5k)"),
    ("flop", "HjPm0ftIpt0", "Suddenly You: What If Nobody Could Lie... Except You? (0.1x, 2.6k)"),
    ("flop", "qtJ89rfVizU", "Jeremy Bearimy: What If You Could See the Odds of ANYTHING? (0.1x, 7k)"),
    ("flop", "i8dSzXMh4m0", "Ifverse: What If Everyone Disappeared Except You? (0.13x, 12k)"),
]

TS = re.compile(r"^(\d+:)?\d{2}:\d{2}[.,]\d{3}\s+-->\s+((\d+:)?\d{2}:\d{2}[.,]\d{3})")


def vtt_to_text(vtt: str) -> str:
    """Plain text with a [m:ss] stamp every ~15 s. Auto-captions repeat each line as it scrolls,
    so a line is kept only if it isn't the same as the previous one."""
    out, last, stamp_at, now = [], "", -15.0, 0.0
    for raw in vtt.splitlines():
        m = TS.match(raw.strip())
        if m:
            h, mm, ss = (["0"] + m.group(0).split(" ")[0].replace(",", ".").split(":"))[-3:]
            now = int(h) * 3600 + int(mm) * 60 + float(ss)
            continue
        line = re.sub(r"<[^>]+>", "", raw).strip()  # drop word-timing tags like <00:00:01.234><c>
        if not line or line == "WEBVTT" or line.startswith(("Kind:", "Language:", "NOTE")) or line == last:
            continue
        if now - stamp_at >= 15:
            out.append(f"\n[{int(now // 60)}:{int(now % 60):02d}]")
            stamp_at = now
        out.append(line)
        last = line
    return " ".join(out).replace(" \n", "\n").strip() + "\n"


def main() -> None:
    try:
        import yt_dlp
    except ImportError:
        sys.exit("yt-dlp is missing. Install it first:  pip install yt-dlp")
    out_dir = Path(__file__).resolve().parent / "transcripts"
    out_dir.mkdir(exist_ok=True)
    done, failed = [], []
    for n, (kind, vid, label) in enumerate(PICKS, 1):
        print(f"[{n}/{len(PICKS)}] {label}")
        with tempfile.TemporaryDirectory() as tmp:
            opts = {"skip_download": True, "writesubtitles": True, "writeautomaticsub": True,
                    "subtitleslangs": ["en", "en-orig", "en-US"], "subtitlesformat": "vtt",
                    "outtmpl": f"{tmp}/%(id)s.%(ext)s", "quiet": True, "no_warnings": True}
            try:
                with yt_dlp.YoutubeDL(opts) as ydl:
                    info = ydl.extract_info(f"https://www.youtube.com/watch?v={vid}", download=True)
                vtts = sorted(Path(tmp).glob("*.vtt"), key=lambda p: (".en." not in p.name, p.name))
                if not vtts:
                    raise RuntimeError("no English captions on this video")
                text = vtt_to_text(vtts[0].read_text(encoding="utf-8", errors="replace"))
                header = (f"# {info.get('title')}\n# channel: {info.get('channel')} | views: {info.get('view_count')} | "
                          f"length: {info.get('duration')} s | {kind.upper()} | https://youtu.be/{vid}\n\n")
                (out_dir / f"{kind}_{vid}.txt").write_text(header + text, encoding="utf-8")
                done.append(f"{kind}\t{vid}\t{len(text.split())} words\t{label}")
                print(f"    ok, {len(text.split())} words")
            except Exception as e:  # one bad video must not stop the rest
                failed.append(f"{kind}\t{vid}\t{e}")
                print(f"    FAILED: {e}")
        time.sleep(3)  # be polite to YouTube
    (out_dir / "index.txt").write_text("OK\n" + "\n".join(done) + "\n\nFAILED\n" + "\n".join(failed) + "\n", encoding="utf-8")
    print(f"\n{len(done)} saved, {len(failed)} failed -> {out_dir}")
    if failed:
        print("If the errors mention a JavaScript runtime, install Deno (https://deno.com) and run this again.")


if __name__ == "__main__":
    main()
