# Episodes

Status: idea -> scripted -> voiced -> rendered -> packaged -> published (by the user).

| # | Title | Status | Notes |
|---|-------|--------|-------|
| 0 | Test scene (cold open of #1) | rendered | 33 s, `episodes/test-scene`. Pipeline test; waiting on the user's feedback on voices and style. |
| 1 | What if you woke up 10 times stronger? | idea | Pilot. Title "What If You Woke Up 10x Stronger?" lints 100/100 in title.py. |
| 2 | What If You Were the Last Liar on Earth? | rendered | `episodes/last-liar/`. 8:09, rendered to `video/out/last-liar.mp4` (not in git; re-render with `npx remotion render src/index.ts LastLiar`). Waiting for the user's feedback; no music yet. Title, description, chapters, Shorts: `packaging.md`. |
| 3 | What If You Could Call Anyone Who Died for 60 Seconds? | published by the user | `episodes/one-minute/`. 6:26, `video/out/one-minute.mp4` + `one-minute-thumbnail.png` (not in git; re-render `OneMinute` / `OneMinuteThumb`). Generated music + sound effects. Title, description, chapters, Shorts in `packaging.md`. Vertical teaser `video/out/one-minute-teaser.mp4` (61 s, cut after the rules) made for TikTok/Reels/Shorts. |
| 4 | What If You Could See the Dreams Your Parents Gave Up? | rendered | `episodes/dreams/`. 7:03, `video/out/dreams.mp4` + `dreams-thumb.png` (not in git; re-render `Dreams` / `DreamsThumb`). First episode with lip-sync (`tts/lipsync.py`), acted takes (`tts/act.py`, 12 of 28 kept), ghost costumes and crossfades. Research-backed title, thumbnail, description, tags, chapters, Shorts in `packaging.md`. |

| 5 | What If You Could Do Anything You've Watched on YouTube? | rendered | `episodes/watched/`. 6:50, `video/out/watched.mp4` + `watched-thumb.png` (not in git; re-render `Watched` / `WatchedThumb`). Idea #22. Chess hustlers + Magnus Carlsen, furniture flipping, a plane landing; a red progress bar over your head is the visual motif. Research-backed packaging in `packaging.md`. |
## Ideas backlog

Checked 2026-11-11: no existing "what if" video found in YouTube's top results for 2-3 wordings of
each (not a guarantee that none exists anywhere).

1. ~~What If You Could Call Anyone Who Died, for One Minute?~~ (made: episode 3)
2. What If You Could Talk to Your Dad When He Was Your Age?
3. What If You Inherited Your Grandpa's Memories?
4. What If You Could Pause Your Parents' Aging?
5. What If Your Teacher Was You From the Future?
6. What If Your Grandparents Woke Up 60 Years Younger?
7. What If Everyone Forgot Your Grandma Except You?
8. What If Your Mom Got a Notification Every Time You Lied?
9. What If You Were the Only Person Who Could Still Cry?
10. What If Ads Stopped Working on You?

Second batch, checked 2026-11-12 the same way:

11. What If You Switched Places With Your Dad When He Was Your Age?
12. What If You Had to Live One Day as Every Person You Ever Hurt?
13. What If Your Camera Showed Everyone 50 Years Older?
14. What If You Could Fix Your Dad's Worst Day?
15. What If Someone Paid You $1,000,000 to Never Talk to Your Best Friend Again?
16. What If Your Grandparents' Love Letters Started Arriving in Your Mailbox?
17. What If Your Mom Sent You a Bill for Raising You?
18. What If Every Hug Gave You 1 Day of Someone's Memories?
19. What If Your Grandpa's Diary Predicted Your Whole Life?
20. ~~What If You Could See the Dreams Your Parents Gave Up for You?~~ (made: episode 4)

Third batch, 2026-11-12 (the user asked for realistic, not sentimental; checks in
`research/idea-checks-2026-11-12b.md`):

21. What If You Could See the Day Everything You Own Will Break?
22. ~~What If You Could Do Everything You've Ever Watched on YouTube?~~ (made: episode 5)
23. What If You Had to Say Everything You Type Out Loud?
24. What If Autocorrect Worked on Your Voice?
25. What If Your Phone Charged You $1 for Every Minute You Scroll?

Already taken (found on YouTube, don't use): promises that can't be broken, borrowing time, shadow
ahead of you, 100 words a day, undo one sentence/mistake, expiration dates, aging 10x slower, paid
when someone thinks of you, trading memories, lucky while others get unlucky, a 500 IQ sister, last
person who can dream, only one who can read, music disappearing, replaying memories, hearing inner
voices, trading years of life, nobody can say no, compliments come true, dog lives as long as you,
$100 per good deed, seeing everyone's future, feeling what others feel, parents' lies coming true,
only one who sees colour, paid per step, everyone's search history / salary / bank balance / screen time, real price of everything, rating everyone, texts from tomorrow, a body battery percentage, excuses coming true, grandma is a spy, buying back time, seeing who comes to your funeral, $1 when
someone says your name, your dog texting you, best friend is a time traveller, meeting your parents as
kids, a house that talks, waking up in the future, a parent aging backwards or getting younger daily.
