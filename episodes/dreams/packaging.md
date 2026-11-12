# Packaging: What If You Could See the Dreams Your Parents Gave Up?

Research done 2026-11-12 with vidIQ (40 of 85 credits), before choosing anything. Chapters come from the final timeline (7:06).

## The research

**1. Search demand for the format (vidIQ keyword research).** "what if you could see" is a big,
low-competition search: ~108,000 searches a month, competition 36/100. Its variants are among the
most-searched what-if phrases: "...how long everyone has left?" ~143k, "...who has a crush on you?"
~151k (up 9,269%), "...everyone's future wealth" ~85k. So the title should **start with
"What If You Could See"**. Nobody searches for our exact premise yet ("what if you could see your
parents" has one long-tail at ~6k), so the title carries the format, not the topic.

**2. What is breaking out in this format right now (vidIQ outliers, title contains every word of
"what if you could see", last weeks).**

| Video | Channel size | Breakout |
|---|---|---|
| What If You Could See Who Misses You? | 6.2K subs | 70x, 220K views |
| What If You Could See Through Walls? | 4K | 64x |
| What If You Could See a Timer Above Everyone's Head? | 5.8K | 40x |
| What IF You Could See Everyone's Soulmate? | 5K | 37x, 258K views |
| What If You Could See the 4th Dimension? | 834 | 30x |
| What If You Could See Your Future Wife? | 9.1K | 5x, 251K views |

What they share: short titles (37-52 characters); the power aims at **people close to you** (who
misses you, soulmate, future wife, a timer over everyone); small channels break out, so the premise
does the work, not the subscriber count.

**3. Their thumbnails (looked at 6).** 1-3 huge words, white with one yellow word and a dark outline
("MY EX.", "MATCH", "MOM?!", "SEE THE 4TH DIMENSION?"); a **red arrow** to the thing; the power drawn
as a **glowing label over someone** (a timer "2 DAYS", name tags, heights); one big emotional face
(crying, smirking).

**4. Title/thumbnail changes that doubled views in what-if animation (vidIQ wins, last 3 months).**
"What If Humans Had a Tail?" -> "What If Humans NEVER Lost Their Tails?" = 67x views per hour. The
thumbnails that won switched from showing the power to showing **its consequence** in 2-3 words
("CAN'T HIDE IT", "CAN'T HIT ME." with a "DODGE: 100%" status tag).

**5. Title scores** (vidIQ score_title, our channel; title.py lint):

| Title | vidIQ | title.py | Chars |
|---|---|---|---|
| **What If You Could See the Dreams Your Parents Gave Up?** | **98** | 84 | 54 |
| What If You Could See Who Your Parents Almost Became? | 97 | - | 52 |
| What If You Could See Your Parents' Lost Dreams? | 96 | 84 | 48 |
| What If You Could See the Dreams Your Parents Gave Up for You? (the idea's wording) | - | 66 | 62, cut on desktop |

**6. Our own channel.** 2 videos so far: the One Minute video (22 views, 1 like) and its teaser Short
(3 views), both on day one. Too early to learn from; neither has tags yet.

## What to post

**Title:** What If You Could See the Dreams Your Parents Gave Up?
(Highest vidIQ score; starts with the searched phrase; 54 characters, so it isn't cut on desktop.
Backup for a later A/B test: "What If You Could See Who Your Parents Almost Became?")

**Thumbnail:** `video/out/dreams-thumb.png` (render: `npx remotion still src/index.ts DreamsThumb out/dreams-thumb.png`).
"PILOT MOM?!" (2 words, yellow accent word, none of the title's words), a red arrow to Mom's glowing
pilot ghost, a red **2 DAYS LEFT** status tag over the ghost, you in tears in the foreground, Mom
smiling with no idea. Every element is one of the winning patterns above; checked at feed size.

**Description:** see below. **Tags:** see below (tags barely affect ranking; YouTube says they
mostly help with misspellings, so the title and the first two lines of the description matter more).

**Description** (the first 2 lines show in search; they repeat the searched phrase):

> What if you could see the dreams your parents gave up for you? Behind every grown-up floats a ghost of the person they almost became. Your mom's is a pilot, and it disappears in 30 days.
> Then you find out why your dad's ghost is invisible.
>
> CHAPTERS
> 0:00 The Ghost Behind Mom
> 0:25 How the Ghosts Work
> 1:04 Everyone Is Haunted
> 2:02 Dad's Invisible Ghost
> 2:39 Dream Detective
> 3:45 You Were the Price
> 4:29 "I'm 47"
> 5:02 One Minute, Two Dreams
> 5:32 Cessna 172
> 5:55 What Dad Dreamed Of
> 6:25 Theo's Ghost
>
> REAL FACTS IN THIS VIDEO
> 76% of people's biggest regret is not becoming their ideal self: Davidai & Gilovich (2018), Emotion (Cornell).
> Vera Wang designed her first dress at 40.
> Learning to fly costs about $6,000-$20,000+: AOPA.
> Raising a child to 17 costs about $310,605: Brookings Institution (2022).
> Parents' sleep takes up to 6 years to recover after the first child: Richter et al. (2019), Sleep.
> There is no maximum age for a US private pilot certificate: FAA rules (via AOPA).
> Grandma Moses started painting at 78.
>
> If you could see the dream your parents gave up for you, would you want to know? Tell us in the comments.
>
> This story is fiction. Every character is made up.

**Tags** (vidIQ monthly searches / competition, where known):
what if you could see (108K / 36), what if, what if scenarios, what if animation, what if story,
heart touching story (51K / 40, rising 47%), emotional story (180K / 44), family love (12.8K / 47),
parents sacrifice (4.3K / 40), mother sacrifice (4.5K / 60), what if you could see everyone's dream,
parents dreams, mom pilot, animated story.

## Shorts (hooks scored with hookscore.py)

| # | Moment | First line | Hook score |
|---|---|---|---|
| 1 | Cold open | There's a ghost behind your mom. The pilot she never became. And you have 30 days before it disappears forever. | 64 |
| 2 | Dad's invisible ghost | Your dad's ghost is invisible, and you're sure his dream is already dead. You're wrong about why. | 55 |
| 3 | The choice | You have 60 seconds and 15,000 dollars. Your dream, or your mom's. You can only save one. | 52 |

Short #2 spoils the twist; post it a week after the main video. Short titles must differ from the
main title (the One Minute Short used nearly the same title, so the two compete in search).

TikTok / Instagram: not connected to vidIQ, so there's no data from them yet. Connect them in vidIQ
to research hashtags and captions per platform before posting there.
