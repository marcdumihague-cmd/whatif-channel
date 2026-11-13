# Packaging: What If You Could Do Anything You've Watched on YouTube?

Research: `research/packaging-2026-11-12-watched.md` (this video) and `research/packaging-2026-11-12.md`
(the format and thumbnail patterns, reused). Chapters come from the final timeline (6:50).

## Title

**What If You Could Do Anything You've Watched on YouTube?**
vidIQ score 98 (best of 3 tested), title.py 84, 56 characters (not cut on desktop). Starts with
"What If You Could", a phrase whose searches grew 160% (259K a month). The idea's own wording
("...Everything You've Ever Watched...") was 63 characters and scored 52.

## Thumbnail

`video/out/watched-thumb.png` (render: `npx remotion still src/index.ts WatchedThumb out/watched-thumb.png`).
Text **ONLY 71%** (2 words, the number in yellow, none of the title's words). You in the cockpit,
terrified, with a red progress bar over your head stuck at 71% on "HOW TO LAND A PLANE", a red arrow
to where it stops, the runway coming up, Uncle Ray out cold, Theo screaming. Built from the winning
patterns: a status bar over the hero (Jeremy Bearimy's "Level Up" 5.1x uses stat bars too), a red
arrow, 1-2 huge words, a big face. Nothing in common with the closest competitor's thumbnail (a
book and a fight). Checked at feed size (320 px).

## Description

> What if you could do anything you've ever watched on YouTube? Every tutorial, every chess game, every "how I make $5,000 a month" video. But only up to the exact second you stopped watching.
> You have 30 days to pay rent with half skills. And one video from 3 a.m.: How to land a plane in an emergency. 71% watched.
>
> CHAPTERS
> 0:00 The Knives
> 0:34 How It Works
> 1:24 Rent Is Due
> 1:40 2 Million Views, $0
> 1:58 11 Chairs Nobody Wants
> 2:34 Beating the Chess Hustlers
> 3:35 Half Skills Are Dangerous
> 4:05 Uncle Ray's Plane
> 4:31 Mayday
> 5:49 The 1st
> 6:16 Theo's History
>
> REAL FACTS IN THIS VIDEO
> People watch over 1 billion hours of YouTube a day: YouTube (2017).
> Viewers watch less than a quarter of a video on average: Retention Rabbit benchmark of 10,000+ videos (2025).
> Magnus Carlsen has been world number 1 since 2011; his 2882 peak (2014) is the highest rating ever: FIDE.
> Park chess hustlers play for about $5-$20 a game: ChessBase, Chess.com.
> Magnus Carlsen played the hustlers in Washington Square Park in 2016: Stabroek News.
> The average water damage insurance claim is about $15,400: Insurance Information Institute.
> In 2022 a passenger with no flying experience landed a plane in Florida, talked down by a controller who was a flight instructor: AOPA, CBS News.
>
> Which video would you finish first? Tell us in the comments.
>
> This story is fiction. Every character is made up.

## Tags (vidIQ monthly searches / competition)

what if you could (259K / 54, +160%), what if you could learn anything instantly (44.7K / 41),
what if stories (99.6K / 41), what if you (967K / 42), what if, what if animation, what if scenario,
learn any skill, youtube tutorials, chess hustler, magnus carlsen, flipping furniture, passenger lands plane,
animated story.

Tags matter much less than the title and the first two lines of the description.

## Shorts (hooks scored with hookscore.py)

| # | Moment | First line | Hook score |
|---|---|---|---|
| 1 | Cold open: the knives | You're juggling 5 knives, and you've never juggled before. In 3 seconds you'll find out why that's a problem. | 75 |
| 2 | The backflip | Your backflip video gets 2 million views, and you make exactly 0 dollars. Here's why. | 57 |
| 3 | Chess in the park | You watched 400 hours of chess videos. Now you can beat every hustler in the park, and it pays your rent. | 48 |
| 4 | The landing (spoils the climax: post a week later) | The pilot just passed out, and the only training you have is 71 percent of a YouTube video. | 41 |

Give each Short its own title, not the long video's (they compete in search otherwise).

## Teaser (vertical, 1080x1920)

Two versions (same video, different last line, because TikTok and Instagram don't allow links in captions):

| File | For | Ends with |
|---|---|---|
| `video/out/watched-teaser.mp4` (56 s) | YouTube Shorts | "...The link is below." / LINK BELOW |
| `video/out/watched-teaser-tiktok-instagram.mp4` (57 s) | TikTok, Instagram Reels | "...The link is in my bio." / LINK IN MY BIO |
| `video/out/watched-teaser-cover.png` | the cover on all three | the title question over the knife-juggling shot |

Content: the cold open (the knives) and the promise, then a jump to the plane setup ("How to land a plane in an
emergency. 71 percent watched." / "You fell asleep again. The end was the best part." / "Remember that."), then the
call to action: WHAT HAPPENS AT 71%? with the progress bar stuck at 71%. Re-render:
`npx remotion render src/index.ts WatchedTeaser out/watched-teaser.mp4` and `WatchedTeaserBio`.

Research (vidIQ, 10 credits; `research/packaging-2026-11-12-watched.md`): breakout what-if Reels and TikToks right now
(24x to 776x their creators' median) all put the "What if..." question on screen in the first second, use a
one-line hook caption plus 3-6 hashtags (#whatif #superpowers #animation #storytime come up most), and end by
asking viewers to comment or vote. The YouTube Shorts search returned nothing comparable (mostly gacha and music
clips), so the Shorts title follows our own lint: a concrete number, different from the long video's title.

### YouTube Shorts

- **Title:** You Only Watched 71% of How to Land a Plane 😳  (title.py 94; doesn't repeat the long title, so the two don't compete in search)
- **Description:**
  > The pilot just passed out. Your only training: 71% of a YouTube video. Full video: [link to the long video]
  > #shorts #whatif #animation
- **Related video:** in the YouTube app or Studio, set this Short's *Related video* to the long video. It puts a tappable link on the Short, which works better than a link in the description.
- **Cover:** the first frame (the title question). Choose it in the app when uploading.

### TikTok

- **Caption:**
  > You've never juggled before. In 3 seconds you'll find out why that's a problem 🔪 What if you could do anything you've ever watched on YouTube... but only up to the second you stopped? Full video on my YouTube, link in bio. Which video would YOU finish first? #whatif #superpowers #animation #storytime #youtube
- **Cover:** pick the first frame (the title question) in TikTok's cover picker.
- **Bio:** put the long video's YouTube link in your bio before posting.

### Instagram Reels

- **Caption:**
  > What if you could do anything you've ever watched on YouTube... but only up to the second you stopped watching? ✈️ 71% of a "how to land a plane" video is about to be a problem. Full video on my YouTube, link in bio. Which video would you finish first? 👇 #whatif #animation #superpowers #whatwouldyoudo #storytime
- **Cover:** upload `video/out/watched-teaser-cover.png` as the Reel cover.
- **Bio:** the long video's YouTube link.
