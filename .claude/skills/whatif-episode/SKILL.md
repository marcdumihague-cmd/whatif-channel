---
name: whatif-episode
description: >-
  Make a complete "What If" channel episode end to end, the way episode 9
  ("What If You Lived Every Day Twice?") was made: pick the idea, write and
  fact-check the script, voice it, build the animation on the v2 graphics
  kit, mix, check stills, render, make the thumbnail, the packaging and the
  vertical teaser, log lessons, commit and deliver. Use for "make a video",
  "create another video", "start a new episode", "make a teaser", or "give
  me everything to upload".
---

# whatif-episode: one episode, start to finish

This is the exact process used for episode 9. Follow the steps in order. Every step says what to run,
what "done" looks like, and the mistakes already made once (so they are not made again).
Reference for the animation code: `kit-reference.md` in this folder. Worked example to copy from:
`video/src/tw/` (episode 9), `episodes/twice/`, `research/*twice*`, `research/retention-hook-2026-11-16.md`.

## 0. Rules that never bend

1. **Never upload anything.** The user publishes. Deliver files and text only.
2. **Never get around YouTube's bot check**, never use the user's cookies or login. A 403 or "confirm
   you're not a bot" means stop that search.
3. **The repo is public**: never commit other creators' transcripts, screenshots or thumbnails, or the
   user's personal details (email, name).
4. **No high-pitched sounds** in the mix. **Never say "That's real"**: name the source in the sentence.
5. **Real public figures** appear only as references to their public work and checkable facts, never as
   characters who speak or act.
6. **Don't recreate another channel's characters or look.** Our cast and kit are our own.
7. **Force pushes and history rewrites need the user's OK.**
8. **Log every lesson** (user feedback or our own mistake, however small) in `youtube/lessons.md` the same
   day, then commit and push.
9. **Research before packaging**, say where each choice came from, save it in `research/` the same day.
10. **Claude cannot hear audio or watch motion.** Say so, and ask the user to listen to flagged lines and
    the mix, and to watch the video once.

## 1. Start of session (5 minutes)

1. Read `CLAUDE.md`, `youtube/episodes.md`, `youtube/lessons.md` (all of it), `youtube/viral-notes.md`,
   `youtube/voice.md`, `youtube/motion.md`, `research/README.md`.
2. `./scripts/setup.sh` if `.venv-qwen` or `video/node_modules` is missing. The session must run in the
   `whatif-channel` cloud environment (it allows the Hugging Face hosts).
3. `df -h /`: at least 3 GB free before any render. To free space: `rm -rf /tmp/remotion-webpack-bundle-*`,
   `uv cache clean`, old `video/out/*-chunks`, old scratch folders.
4. If the user gave feedback in their message, write it into `youtube/lessons.md` first, commit, push.
5. Create a task list (research + idea, script, graphics, voice/mix/render/packaging).

## 2. Pick the idea (rules A, A2, B in `youtube/viral-notes.md`)

1. Candidates: the backlog in `youtube/episodes.md`, plus new ones. A good premise:
   - pulls on a person (crush, parent, best friend, your own body), not markets or strangers;
   - has an extreme or unique framing (twice, 10x, the only one): our strongest tested title feature (1.78x);
   - lets "you" make a large amount of money by exploiting it, and touches money, girls, views or survival;
   - has built-in wish fulfilment.
2. Check the "Already taken" list in `youtube/episodes.md`.
3. Saturation search: `scripts/saturation.sh "what if <premise wording 1>" "<wording 2>" ...` (2-3 wordings
   per idea). Read it like this:
   - several videos above ~300K with the same framing: saturated, skip;
   - a related family with 300-400K views but nothing for our exact framing: **ideal** (proven demand, open
     framing). Episode 9: "time loop" 416K/372K/368K, "live every day twice" none;
   - nothing anywhere: unproven, only with a strong reason.
   If the search returns 403, stop; do one `WebSearch` for the exact title in quotes instead.
4. vidIQ (`vidiq_keyword_research`, `vidiq_score_title`) only if `vidiq_balance` shows credits; a video's
   research costs 20-45 of 150 a month.
5. Save the table (premise, biggest existing videos, verdict) in `research/` and add it to
   `research/README.md`. Pick one idea yourself and go on; do not stop to ask.

## 3. Write the script

File: `episodes/<name>/script.json` (`<name>` = one short lowercase word). Shape (copy `episodes/twice/script.json`):

```json
{"title": "...", "pace": {"gap": 0.25, "scene_gap": 0.45},
 "cast": {"NARRATOR": "narrator", "YOU": "you", "THEO": "theo", "MOM": "mom", "AVA": "roommate", "HOST": "man", "OWNER": "older"},
 "facts": [{"claim": "...", "source": "..."}],
 "lines": [{"scene": "cold_open", "who": "NARRATOR", "text": "...", "say": "optional spelling", "act": "optional emotion"}]}
```

Voices available: see `voices/voices.json` (narrator, you, theo, roommate = Ava, mom, dad, man, older,
woman2, grandpa, grandma, max). Numbers as digits. `say` spells out anything the voice would misread
("0.506127" -> "zero point five oh six one two seven").

### Structure (about 70 lines, 750-1,000 words, 5-7 minutes; never boring beats length)

| Scene | What it must do |
|---|---|
| `cold_open` (0:00-0:25) | **Line 1 is the stake, under 2 seconds**: "Your crush just said no." Never a time or place. Line 2-4: the striking situation, one short character line, then the contradiction ("And you're smiling. Because today doesn't count."). Show the premise working. Plant nothing here except the image the twist will reuse. |
| `promise` (1 line) | "Starting today, you ... In 30 days you'll [money], [views], and face [the one thing]." Says **what**, never **how**. |
| `rules` | 1-2 lines of rules, then show them. **Open loop 2 starts here**: one odd line from a side character that makes no sense yet, flagged once by the narrator ("Strange thing to say. Remember it."). |
| fun scenes (2-3) | Wish fulfilment using the premise. A small payoff every 30-45 s. |
| money ladder (2-3 scenes) | "You" exploit the premise with real, checkable details and YouTube-culture references (pack openings, storage-unit auctions). An amount on screen climbs: e.g. $2,800 -> $11,800 -> $41,000. One attempt **fails**, and a real fact explains why (this becomes the story's rule, needed by the climax). |
| `cost` (~55%) | The premise costs you something with a person. 3 lines. End with a reminder of open loop 2 ("That's what you think."). |
| plant scene (~60%) | A warm scene with the crush where she says a small, odd, checkable fact. It looks like a detour. The climax needs it. |
| `offer` | The big-money chance with a clear plan the viewer believes will work. |
| climax, attempt 1 | The plan's first half goes as expected, then something happens to a person you love. |
| climax, attempt 2 | **A selfless choice under a timer** that breaks the plan (cause and effect, on screen). The viewer cannot predict the payoff. Then the question whose answer is the planted fact. One narrator line of silence-before ("A Tuesday that never happened."), the answer in 1 word, the win in 2 lines. |
| `twist` (last 25 s) | Open loop 2 closes: a reveal that changes how the whole video looks, in 6-7 short lines of dialogue, ending on a line that could be a sequel. |
| `endcard` (1 line) | "If you ..., what would you do ...?" Nothing after it. |

### Hard rules for the script

- The last third has **no recap and no explaining**; lines get shorter.
- No gag more than 2-3 times, and it must change each time.
- A real fact about every minute, said flat, source named in the sentence or on a card.
- "You" is never named. Dialogue lines are 2-8 words.
- Mark 3-5 lines with `"act"` (e.g. "panicked whisper", "excited, shouting"). Expect about 1 in 4 to be
  kept; a line of 2 words often fails the check ("Your what?" scored 0.40): prefer acting lines of 4+ words.

### Fact-check (before the voice)

One `WebSearch` per fact. Put each fact with its verdict and sources in `research/fact-checks.md`, and in
`script.json` `facts`. Wrong or unsourced: cut it or reword it as the story's own rule. Keep the URLs: every
reply that used a web search ends with a Sources list of markdown links.

### Self-check before moving on

Read the lines against this list: first sentence under 2 s and is the stake; premise clear by ~0:20; promise
spoils nothing; open loop 2 is planted, reminded twice, closed in the last 25 s; the money amount climbs at
least 3 times; the climax plan fails first; the planted fact is said on screen at least once before it is
needed; ends on the question.

## 4. Start the voice, then build while it runs

```bash
python3 scripts/estimate-timeline.py <name>
nohup scripts/voice-chain.sh <name> > $SCRATCH/voice-<name>.log 2>&1 &
```

- The voice takes ~1 hour for 70 lines **if nothing else uses the CPU**. Rendering stills while it runs
  slowed it to 3 lines in 15 minutes. While it runs: write code, docs, mix cues, thumbnail, research. Render
  at most 1-2 single test stills.
- Wait with a background loop, max timeout: `until grep -qE "VOICE-DONE|Traceback" <log>; do sleep 30; done`.
- When done: `tr '\r' '\n' < <log> | grep WARNING`. Every WARNING line goes to the user ("please listen to ...").
- The chain rewrites `script.json` (adds `take` fields) and `video/public/<name>/timeline.json` + `lips.json`:
  commit them (a stop hook requires a clean tree). `*.wav` files are gitignored.

## 5. Build the animation (v2 kit)

Read `kit-reference.md` now. Files to create: `video/src/<xx>/sets.tsx`, `Episode.tsx`, `Thumb.tsx`
(`<xx>` = 2 letters), registered in `video/src/Root.tsx` like `Twice`, `TwiceThumb`.

Order of work:

1. **Decide the motif**: one visual device that shows the premise at a glance, graded into the picture and
   shown by a badge (episode 9: TAKE 1 drained blue with a dashed frame, TAKE 2 warm, a clapper top-left, a
   rewind at midnight). Use it in the thumbnail.
2. **List the shots per line** before writing code: for every line, where / who / what happens / which
   framing (wide, two-shot, close-up) / which label. A cut every 2-5 seconds. New place = wide first.
3. **Sets** (`sets.tsx`): one component per place, each with a far layer, the subject plane (children), and
   a foreground layer. Every place gets its defining objects, a light source, and something moving.
   Reuse episode 9's sets when the place matches (cafeteria, bedroom, hallway, classroom, card shop, living
   room, kitchen, storage units, aquarium, TV studio, hospital, street, backstage).
4. **Scenes** (`Episode.tsx`): one component per `scene` name, keyed in the `shots` record. Inside, split by
   line times (`S(i)`, `E(i)`, `F(i, fraction)`) and cut the camera with `cuts()`.
5. `npx tsc --noEmit -p .` in `video/` after every edit round. It must print nothing.
6. One early test still of a new character or look before writing scenes on top of it.

Clarity rules (the user's): a viewer with the sound off must know where we are, who is there and what
happens in every shot. Label anything new the first time (a `Tag`). Show the action, not just the result.

## 6. Mix cues

Add a branch `elif name == "<name>":` in `tts/mix.py` (copy the `twice` branch) and add the name to the usage
line. Only `whoosh`, `thump`, `hum`, `flyby`, `knock() * 0.5`: soft and low. Cues mirror the shots (a rewind
whoosh, a clapper knock, a heartbeat under the final question that speeds up, a swell when the win lands).
`quiets` = list of (start, end) where the music drops: the saddest beat and the seconds before the answer.

After the voice is done:

```bash
.venv-qwen/bin/python tts/mix.py <name>
.venv-qwen/bin/python scripts/hf-check.py <name>     # must say ok (under -40 dB)
```

## 7. Check stills on the real timeline (3 rounds is normal)

```bash
cd video
export REMOTION_CHROME=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
node sheet.mjs <Comp> 4.7 $SCRATCH/sheet 0.4            # one still every 4.7 s from 0.4 s
node sheet.mjs <Comp> 0.4,9.8,47.4 $SCRATCH/recheck      # or exact seconds
rm -rf /tmp/remotion-webpack-bundle-*                    # after EVERY sheet/still run (200 MB each)
cd .. && .venv-qwen/bin/python scripts/grid.py $SCRATCH/sheet $SCRATCH/grid 12
```

Read every grid image. For each still ask: where / who / what is happening? Then look for exactly these
(all happened on episode 9):

- a black band between wall and floor in close-ups (a far layer that stops at the floor line);
- a label or prop under the captions (below y ~780), under the take badge (top-left) or the money counter
  (top-right), or cut off by a close-up;
- a label in a far layer (it blurs when the camera zooms);
- a head cut off: a close-up must aim at `feetY - 452 * scale`;
- a floating torso behind a podium or desk (draw the prop after the person, don't clip the person);
- a slammed phrase longer than ~20 characters;
- a reveal shot that doesn't show the thing revealed (the twist's thought bubble was out of frame);
- tiles with only a title (a card that pops in later is fine: check a later second);
- two people overlapping in a close-up; a character entering from the wrong side.

Fix, `tsc`, re-render only the changed seconds, look again. Also render the thumbnail:
`npx remotion still src/index.ts <Comp>Thumb $SCRATCH/thumb.png` and look at it: both faces, the motif, the
2 words and the arrow must all be inside the frame.

## 8. Render

```bash
nohup scripts/render.sh <name> <Comp> > $SCRATCH/render-<name>.log 2>&1 &
until grep -qE "RENDER-DONE|rror" $SCRATCH/render-<name>.log; do sleep 30; done
```

- ~50 minutes for 5.5 minutes of v2 video. Write the packaging while it runs.
- If it stops for disk space: free space, run the same command again (finished chunks are skipped).
- **Check the final file**: pull frames at the hook, a money beat, the payoff and the twist
  (`ffmpeg -ss <t> -i out/<name>.mp4 -frames:v 1 -vf scale=768:-1 x.jpg`) and look at them.
- A fix to one shot after the render: re-render just those frames
  (`npx remotion render src/index.ts <Comp> out/fix.mp4 --frames=A-B --muted`) and splice with ffmpeg
  `trim`/`concat` (see lessons, 2026-11-16), or delete that chunk's `.done` and re-run `render.sh`.
- Only then `rm -rf video/out/<name>-chunks`. Copy the thumbnail to `video/out/<name>-thumb.png`.

## 9. Packaging (`episodes/<name>/packaging.md`, copy the layout of `episodes/twice/packaging.md`)

1. **Title**: score 4-5 candidates with
   `python3 .claude/skills/yt-package/title.py --title "<t>" --thumb "<thumbnail words>"`.
   Pattern that scores 98-100: the searched question + a figure in brackets, under 60 characters
   ("What If You Lived Every Day Twice? ($1M)"). The thumbnail words must share **no word** with the title
   (the checker prints `x duplicate` when they do). Save the table in `research/packaging-<date>-<name>.md`.
2. **Thumbnail** (1280x720): big faces, a red arrow, 1-2 huge words with one in yellow, the motif, a
   before/after when the premise has one.
3. **Description**: 2 hook lines (the premise, then the promise), `CHAPTERS` from the real timeline (first
   line of each scene minus 0.2 s, first chapter 0:00, titles of 2-5 words that tease), `REAL NUMBERS IN THIS
   VIDEO` with sources, the end question, "This story is fiction. Every character is made up."
   Chapter times: `python3 -c "import json;t=json.load(open('video/public/<name>/timeline.json'));s=set()` ...
   (print each scene's first `start`).
4. **Tags**: 10, the searched phrase family first, then `what if, what if animation, what if story, animated story`.
5. **Upload timing**: `research/upload-timing-2026-11-13.md` (Thursday or Sunday, 12-2 PM ET).
6. **What to watch in the analytics**: the first 30 s, the payoff window, the twist window, with timestamps.
7. Say plainly what research was not possible (e.g. no vidIQ credits, so no search-volume number).

## 10. Teaser (vertical, one file for Shorts, TikTok and Reels)

Copy `video/src/tw/Teaser.tsx`. Structure: the episode's own cold open + the promise (it was written to hook
in 2 seconds), a jump to the hardest question of the climax, cut **before the answer**, then an end card with a
spoken call to action.

1. `episodes/<name>-teaser/script.json`: one narrator line, e.g. "30 seconds. 1 million dollars. And no
   second try. Watch the full video on my YouTube channel." Then
   `.venv-qwen/bin/python tts/voice.py episodes/<name>-teaser/script.json`.
2. No "link below" / "link in bio" inside the video (that wording goes in each platform's caption), so one
   file works everywhere. Under 60 seconds. The title question stays on screen at the top; `Captions` under
   the picture; first piece cropped in (scale 0.7), later pieces full width (0.5625).
3. Render: `npx remotion render src/index.ts <Comp>Teaser out/<name>-teaser.mp4 --concurrency 4 --crf 20`,
   cover: `npx remotion still ... out/<name>-teaser-cover.png --frame=24`. Check 8-9 frames across it.
4. Packaging section: Shorts title scored with `title.py` (under ~40 characters, different from the long
   title, the teaser's first line works: "My Crush Said No (Take 1) #shorts"), Shorts description, TikTok
   caption, Instagram caption (hook line + "link in bio" + the question + 4-5 hashtags). Remind the user to set
   "Related video" on the Short and to post the long video first.

## 11. Finish

1. `youtube/episodes.md`: the row's status (`in production` -> `rendered`), length, file names, re-render
   names; strike the idea in the backlog.
2. `youtube/lessons.md`: every new do/don't from this episode.
3. `CLAUDE.md` / `youtube/motion.md` / `youtube/viral-notes.md` if a channel decision changed.
4. Commit and push (never the mp4/wav files; they are gitignored):
   `git add -A . && git -c user.name="Claude" -c user.email="noreply@anthropic.com" commit -m "..." && git push -q origin main`,
   with the attribution trailer the session gives. `git status --short` must be empty.
5. Send the files with `SendUserFile` (video + thumbnail, later teaser + cover), and a push notification
   when the user is away.
6. The final message, in this order: what was made (title, length); what changed for the user's requests;
   **what to check before posting** (flagged voice lines with timestamps, the whole mix, motion; known flaws
   left in); packaging summary with where each choice came from; what was not possible; Sources (markdown
   links for every web-searched fact).

## Time budget (episode 9, for planning and for telling the user)

Research + idea 20 min; script + fact-check 20 min; voice ~70 min (in the background); kit/sets/scenes 2-3 h
of writing; still checks 3 rounds x 10 min; render 50 min; packaging 15 min; teaser 25 min.
