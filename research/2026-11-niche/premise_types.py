"""Median views-over-channel-median by premise type, length and numbers in the title.

    python3 research/2026-11-niche/premise_types.py
"""
import json, re, statistics as st, subprocess, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
swipe = HERE.parent.parent / ".claude/skills/yt-viral/swipe.py"
rows = {x["url"]: x for x in json.loads((HERE / "videos.json").read_text())}
ranked = json.loads(subprocess.run([sys.executable, str(swipe), str(HERE / "videos.json"), "--min", "0", "--json"],
                                   capture_output=True, text=True, check=True).stdout)["outliers"]


def cat(t: str) -> str:
    t = t.lower()
    if re.search(r"crush|girlfriend|soulmate|loves you|only guy|girls only|rizz|ex\b", t): return "romance / crush"
    if re.search(r"everyone|everything|every human|nobody|8 billion|all humans|humans never|everyone else", t) and "you" in t: return "world changes around you"
    if re.search(r"everyone|everything|every human|humans|earth|sun|civilization|vegan", t): return "world changes (no you)"
    if re.search(r"last (guy|girl|person)|only person left|alone|trapped|locked|stuck", t): return "you, alone / trapped"
    if re.search(r"you (could|had|have|were|used|woke|got|owned|swapped|gained|saved)|your ", t): return "you get a power / situation"
    return "other"


groups: dict[str, list[float]] = {}
for x in ranked:
    d = rows[x["url"]].get("duration") or 0
    if 180 <= d <= 1500:
        groups.setdefault(cat(x["title"]), []).append(x["multiple"])
print(f"{'premise type':28} {'videos':>6} {'median x':>9} {'share >=3x':>10}")
for k, v in sorted(groups.items(), key=lambda kv: -st.median(kv[1])):
    print(f"{k:28} {len(v):>6} {st.median(v):>9.2f} {sum(m >= 3 for m in v) / len(v):>10.0%}")
num = [x["multiple"] for x in ranked if re.search(r"\d", x["title"])]
non = [x["multiple"] for x in ranked if not re.search(r"\d", x["title"])]
print(f"\nnumber in title: median {st.median(num):.2f}x (n={len(num)}) vs none {st.median(non):.2f}x (n={len(non)})")
for lo, hi in [(3, 7), (7, 9), (9, 11), (11, 25)]:
    m = [x["multiple"] for x in ranked if lo <= (rows[x["url"]].get("duration") or 0) / 60 < hi]
    print(f"length {lo}-{hi} min: median {st.median(m):.2f}x (n={len(m)})")
