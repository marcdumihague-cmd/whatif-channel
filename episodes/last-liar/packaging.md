# Packaging: What If You Were the Last Liar on Earth?

Made with the repo's yt-* skills on the draft script (nothing produced yet). Re-run `/yt-chapters`
on the real voice timeline once the episode is voiced: the timestamps below are estimates.

## Title + thumbnail (`/yt-package`, `title.py`)

| Rank | Title | Score | Note |
|---|---|---|---|
| 1 | **What If You Were the Last Liar on Earth?** | 98 | 40 chars, nothing cut on mobile. No competitor uses this wording. "Last ___ on Earth" was a 28x outlier in the niche data. The only flag (no number) is covered by the thumbnail. |
| 2 | What If 8 Billion People Believed Every Word You Said? | 100 | Fresh angle, but 54 chars: mobile shows "What If 8 Billion People Believed..." |
| 3 | What If You Were the Last Liar on Earth? ($1M in 6 Weeks) | 100 | Use only if the thumbnail can't carry the number; the parenthetical is cut on mobile. |

**Thumbnail brief** (different words from the title, max 3 words):
- Text: **$1,000,000** in bold yellow, top right.
- Our main character, close-up, smug: half-closed eyelids, side glance, tiny smirk, holding a fan of cash.
- Behind him, a crowd of small silhouettes, every one with a little check mark over its head (they believe him).
- Dark navy gradient background, warm glow on the face, so it holds contrast at feed size.

## Description + search (`/yt-seo`)

> What if you woke up as the last liar on Earth? Nobody else can lie, bluff or even say "I'm fine", and everyone believes every word you say.
> Here's how you'd make $1,000,000 in 6 weeks (poker, negotiating, and a TV show nobody can lie on), and the one lie that almost breaks a bank.
>
> CHAPTERS
> 0:00 The Last Liar on Earth
> 0:14 Your First Lie
> 1:00 Why Everyone Believes You
> 1:35 The Fake Sick Day
> 2:23 Beating Everyone at Poker
> 3:30 The Secret Number Trick
> 4:52 The Show Nobody Can Lie On
> 6:12 One Lie Breaks a Bank
> 7:50 A World Without "You Look Great"
> 8:25 Theo's Last Show
> 9:24 One Year Later
>
> SOURCES
> Lie detection accuracy: Bond & DePaulo (2006), Personality and Social Psychology Review.
> Lies per day: Serota, Levine & Boster (2010), Human Communication Research.
> Anchoring: Galinsky & Mussweiler (2001), Journal of Personality and Social Psychology.
> Silicon Valley Bank run: California DFPI, March 10, 2023.
> Everyday lies told for others: DePaulo et al. (1996), Journal of Personality and Social Psychology.
>
> This story is fiction. Harbor Bank, "Just Asking" and every character are made up.

**Tags** (disambiguation only): what if, what if nobody could lie, nobody could lie except you,
last liar on earth, only person who can lie, what if you could lie, animated story, what if
scenario, hypothetical.

**The three queries this should win**, and their words are in the title or the first two lines:
1. "what if nobody could lie except you" (nobody, lie, except you ✓; this is how the two existing videos are titled)
2. "what if you were the only person who could lie" (what if you were, lie ✓)
3. "last liar on earth" (title ✓)

## Chapters (`/yt-chapters`, `chapters.py`)

Boundaries from `chapters.py` on an estimated timeline (2.3 words/s, measured in the test scene),
retitled; "Theo's Last Show" and "A World Without..." added by hand at section starts. Valid:
starts at 0:00, 11 chapters, all at least 10 s. Estimated runtime: **10.1 min**.

## Shorts (`/yt-shorts`)

| # | Span (est.) | New first line | Hook score | On-screen text (first 2 s) | Loop point |
|---|---|---|---|---|---|
| 1 | 0:14-0:55 coffee shop | You're the last liar on Earth. Watch what one sentence gets you before 8 a.m. | 69 | FREE COFFEE? | Ends on "She believes you. Instantly." The opening line answers why. |
| 2 | 2:23-3:10 poker | Nobody can bluff anymore except you, so you go all in with the worst hand in poker and win $2,000. | 55 | 7 + 2 = WIN? | Ends on the chips sliding over. Loops to "go all in". |
| 3 | 6:12-7:05 bank run | Why you should never tell a joke at a party when you're the last liar on Earth. | 55 | ONE JOKE | Ends on "The line goes home." Loops to "never tell a joke". |
| 4 | 3:30-4:20 car salesman | This salesman can't lie. He just told you his real lowest price, and you're about to cut it by $2,000. | 44 | HIS REAL PRICE | Ends on "Seventeen it is." |
| 5 | 4:52-5:40 Just Asking | What happens when you ask a pop star who really wrote their songs, and they can't lie? | 43 | WHO'S GARY? | Ends on "silence is an answer too." |

Vertical framing: every Short uses one centered character, so cropping the 16:9 frame loses only
background. Pop-up bubbles must be placed inside the middle third so they survive the crop.

## Niche research (`/yt-viral`, `swipe.py`)

Collected 298 recent videos from 16 "what if" story channels (public listings via yt-dlp,
2026-11-11), ranked by multiple over each channel's own median:

- Top outliers: "Can 2 People Really Restart Humanity?" 204x (5.3M), "What If Your Reaction Time
  Was 10x Faster?" 52x (4.7M), "What If You Were the Last Girl/Guy on Earth?" 28x (~730k each),
  "What IF You Could See Who Has a Crush on You?" 25x (1.8M), "What If You Were Reborn With All
  Your Memories?" (Otherwise) 16x (787k).
- **The one structural thing they share:** "What If You..." plus one personal ability or one
  extreme situation, usually with a number (10x, 500 IQ, 30 days) or a social stake (a crush, a
  secret). 69 of the outliers use The Question formula. (That's a judgement about the titles, not
  a claim about why the videos worked.)
- **Our premise is proven but taken:** "What If Nobody Could Lie... Except You?" has 529k (Stick
  Saga) and 141k (What If Hero). A recap of the film *The Invention of Lying* (same idea) has 456k.
  So: different title wording, and our own angle (money exploits with real numbers, the bank run,
  Theo), with no plot points from the film.
- Length: the niche's median video is 12.1 min; the top 40 by views median 16.2 min. Ours is ~10.
