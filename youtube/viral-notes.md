# What makes a "what if" story video break out

Research for the channel (2026-11-11). Read before writing any script; `/yt-script` should apply
these on top of `voice.md`.

## Data

- 298 recent videos from 16 "what if" story channels (public listings, `/yt-viral` + `swipe.py`;
  data and scripts in `research/2026-11-niche/`),
  ranked by views over each channel's own median.
- Premise type barely predicts success: every category's median is ~1x its channel, and about a
  quarter to a third of each category breaks out (3x+). Numbers in titles made no difference.
  Length 7-11 min is normal; nothing in the data says longer is better.
- Same title, very different results: "What If Nobody Could Lie Except You?" got 534k (Stick Saga)
  and 2.6k (Suddenly You). Execution decides, not the idea.
- Within one channel, Otherwise's emotional story "Reborn With All Your Memories" did 15.6x while its
  pure-money premise "Predict the Market" did 0.1x and "Everyone Else Had Zero EQ" 0.09x. (A
  pattern in titles, not proof of cause.)
- Transcripts could not be downloaded (YouTube blocks this cloud machine). The structure lessons
  below come from the full Otherwise "Reborn" transcript the user pasted. More hit transcripts pasted
  by the user would make these notes stronger.

## Tested on a bigger sample (2,505 videos, 90 channels)

`research/2026-11-niche-v2/`: title features compared within each channel, with a permutation test.
Among the 1,126 "what if" titles (65 channels):

| Title feature | Lift | p | Verdict |
|---|---|---|---|
| Extreme or unique framing (10x, 500 IQ, only, last, strongest) | 1.78x | <0.001 | **Strong, new rule (0)** |
| A person or relationship (mom, crush, friend, family...) | 1.55x | 0.018 | **Supports rule 9** |
| "...except you" | 1.76x | 0.08 | Leans positive (1.93x, p=0.03 on all videos) |
| Money in the title | 0.62x | 0.08 | **Leans toward rule 4**, not proven (only 32 titles) |
| Memories / reborn | 1.34x | 0.19 | No clear effect |
| World changes around you | 1.06x | 0.89 | No effect |
| A number in the title | 0.95x | 0.59 | No effect |
| A time limit ("for 30 days") | 0.78x | 0.33 | **Against putting deadlines in titles** (0.70x, p=0.03 on all videos) |

18 tests were run, so a single p near 0.03 could be luck; only the extreme-framing result is
solid at any threshold. Titles are a proxy: the structural rules were then tested on transcripts.

## Tested on 12 transcripts (7 hits, 5 flops)

`research/transcript-study-2026-11.md`. The headline: **the same script template produced 25x and 0.1x
on the same channel** (Jeremy Bearimy's Crush vs Odds; Otherwise's Reborn vs Predict the Market, even
with the same side characters). Structure is table stakes; **the premise's pull on a person decides**.
Abstract or money premises flopped with a perfect template; a saturated premise flopped too.

## The rules

**Choosing the idea (this decides more than the script):**

A. **The premise must pull on a person**: a crush, a parent, a grandparent, a best friend, your own
   body. Not odds, markets, or a world of strangers. (Transcripts: same template, 25x vs 0.1x.)
A2. **The user's rule (2026-11-13): money, girls, views or survival** in every video, ideally as
   the premise. Our title data leaned against money *as the whole point* (0.62x, not proven); the
   answer is money as a fantasy the viewer wants (getting rich, spending it) tied to a person, not
   markets or odds. The user clarified: not a money-only premise, but most videos should have "you"
   exploiting the situation to make large amounts of money.
B. **Never a saturated premise.** Search it first; if a big version exists, skip it ("everyone
   disappeared" already has 4.2M; the late copy did 0.13x).

**Writing it (table stakes: every hit has these, and so do the best flops):**

0. **Frame the premise as extreme or unique**: 10x, 500 IQ, the only one, the last one. (Tested,
   strongest effect in the data.)

1. **Something happens in the first 5 seconds**, never a summary or "imagine...": a demonstration of
   the power (catch a fly), an in-medias-res moment (dangled over a stairwell), or an emotional moment
   with a mystery ("one call in particular"). The premise is clear by ~0:45. Keep "you" unnamed.
1b. **A flash-forward promise in the first minute**: "By the end of the year... and one day you'll
   have to choose." (2 of the 3 most recent hits.)
2. **One big open loop that stays open until the climax.** A secret ("line three") the viewer is
   reminded of every couple of minutes and only gets at ~80% of the runtime.
3. **A goal and a deadline from minute one.** "You" want something specific, and there's a date and
   time it will be too late. Everything fun happens on the way to it. (Untested in the story; keep
   deadlines out of the title, where they did worse.)
4. **Money is a means, never the point.** Exploits fund or enable the real goal. (Money titles did
   0.62x: leans this way, not proven.)
5. **Exploits use real, checkable details**: real companies, prices, dates, laws, studies. The
   viewer should think "that would actually work". Invented numbers feel weightless.
6. **Plant odd actions that the climax explains.** (A CPR class at 12, a defibrillator at 13.) The
   reveal makes the viewer re-see the whole video.
7. **A sceptic who comes round** (Uncle Rick) and **a running-gag sidekick** (Rocky's "Bro, what are we
   buying?") give the comedy a spine.
8. **A beat every 10-20 seconds**, fast time jumps marked by dates or ages, and a real fact roughly
   every minute, said flat and tied straight back to "you".
8b. **Show the cost of the power at ~60-70%** (headaches, losing yourself, nobody knowing you).
9. **The climax is a selfless choice under a timer**: the power used for someone else, at a cost to
   you (5 of 7 hits: the World Cup, the girl you like, your secret). It's about a person, not winning.
   (Titles about a person did 1.55x.)
10. **End on callbacks and a sequel tease** (a black car, a thread to the stars), then one question
   to the viewer.
11. **7 to 10 minutes.** Hits ran 7-10 min; flops include 13 and 19 min, one with a hit's structure at
   2.3x the length.

## How "What If You Were the Last Liar on Earth?" (v1) scores against these

Weak on 1 (summary hook), 2 (the party-lie loop closes at 5:00), 3 (no goal until ~6:00), 4 (money is
most of the story), 5 (invented numbers), 6 (no planted reveal), 7 (no sceptic) and 9 (low stakes: one
comedy set). Strong on 8 and 10, and the core idea (the most meaningful use of the power is a kind lie)
is right.
