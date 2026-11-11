"""Test title-level versions of the viral-notes rules on a larger sample, within each channel.

    python3 research/2026-11-niche-v2/test_title_features.py

Each video's score is log(views / its channel's median views), so a big channel can't skew a
result. For every feature, "lift" is how many times more views the videos with it get than the
videos without it, inside the same channels. "p" comes from a permutation test that shuffles the
feature labels within each channel 5,000 times: the share of shuffles with a gap at least as big.
"""
import json, math, random, re, statistics as st
from collections import defaultdict
from pathlib import Path

HERE = Path(__file__).resolve().parent
rows = [r for r in json.loads((HERE / "videos.json").read_text()) if r["duration"] >= 180 and r["views"] > 0]
by_ch = defaultdict(list)
for r in rows:
    by_ch[r["channel"]].append(r)
by_ch = {c: v for c, v in by_ch.items() if len(v) >= 8}
for vids in by_ch.values():
    med = st.median(v["views"] for v in vids)
    for v in vids:
        v["score"] = math.log(v["views"] / med)
vids = [v for vs in by_ch.values() for v in vs]
whatif = [v for v in vids if "what if" in v["title"].lower()]

FEATURES = {
    "money in the title": r"\b(rich|money|\$|million|billion|dollars?|stocks?|market|lottery|cash|bank|crypto|bitcoin|invest|wealth)",
    "people / relationship": r"\b(mom|dad|mother|father|sister|brother|son|daughter|family|friends?|crush|girlfriend|boyfriend|wife|husband|love|baby|grandma|grandpa|parents?)\b",
    "time limit / deadline": r"\b\d+\s*(days?|hours?|weeks?|years?|minutes?|seconds?)\b|\b(24 hours|for a day|for a week|one day)\b",
    "power for YOU": r"^what if you(r)? (could|had|have|were|got|became|woke|gained|can|used|saw|see)\b",
    "world changes": r"^what if (everyone|everything|nobody|no one|the world|humans|earth|every)",
    "'except you'": r"except (you|me)",
    "number in title": r"\d",
    "superlative / extreme (10x, 500 IQ, only, last)": r"\d+x\b|\biq\b|\bonly\b|\blast\b|strongest|smartest|fastest",
    "memories / reborn / time travel": r"memor|reborn|past|time travel|younger|childhood|kindergarten",
}


def test(pool, pattern, n=5000, seed=1):
    rx = re.compile(pattern, re.I)
    groups = defaultdict(list)
    for v in pool:
        groups[v["channel"]].append((v["score"], bool(rx.search(v["title"]))))
    def gap(gs):
        a = [s for g in gs.values() for s, f in g if f]
        b = [s for g in gs.values() for s, f in g if not f]
        return (st.mean(a) - st.mean(b)) if a and b else 0.0, len(a)
    obs, k = gap(groups)
    rnd = random.Random(seed)
    hits = 0
    for _ in range(n):
        sh = {}
        for c, g in groups.items():
            flags = [f for _, f in g]
            rnd.shuffle(flags)
            sh[c] = [(s, f) for (s, _), f in zip(g, flags)]
        if abs(gap(sh)[0]) >= abs(obs):
            hits += 1
    return obs, k, hits / n


for name, pool in [("all long videos", vids), ("only 'what if' titles", whatif)]:
    print(f"\n== {name}: {len(pool)} videos, {len({v['channel'] for v in pool})} channels")
    print(f"{'feature':48} {'videos':>6} {'lift':>6} {'p':>6}")
    for f, pat in FEATURES.items():
        g, k, p = test(pool, pat)
        print(f"{f:48} {k:>6} {math.exp(g):>5.2f}x {p:>6.3f}")
