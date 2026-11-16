# Lessons: do this, don't do that

Every lesson learned while making the channel, from the user's feedback and from our own mistakes.
**Read this before starting any work. Add to it the same day something is learned**, however
small: one line, the date, and where it came from (user = the user said so; us = we found out).
Rules the user gave are not up for debate; lessons we found ourselves can be revised with evidence.

## Writing

- **DON'T tag facts with "That's real", "Real fact:" or "by the way, that's true".** Name the source
  in the sentence: "A 2018 Cornell study found...", "One study found...", "Researchers found...".
  (user, 2026-11-12; rule in `voice.md`)
- **DO keep "you" unnamed.** The one flop that named its hero also stated its premise last. (us, transcript study)
- **DO pick a premise about people close to you** (a parent, a crush, your own body). Same template,
  money/odds premises flopped at 0.1x. The premise decides; structure is table stakes. (us, transcript study)
- **DO check the premise isn't already made**: saturated premises flop. (us, transcript study)
- **Search the premise's closest *wording family* too, not just its exact title**: the title search
  for "do everything you watched on YouTube" found nothing, but vidIQ outliers found Jeremy Bearimy's
  "Learn Anything Instantly" (672K views, 1 week old). Differentiate clearly or pick another idea. (us, 2026-11-12)
- **DO keep it 7-10 minutes.** Flops ran 13-19 min. (us, transcript study)
- **DO plant a detail early and pay it off late, and end on a selfless choice under a timer.** (us, transcript study)
- **DON'T gender "you".** "He's charging tax" about the viewer was rewritten to "The kid charges tax". (us, 2026-11-12)
- **DO check continuity rules you set**: "kids have no ghost until 18" clashed with "for the first
  time someone is standing behind you"; fixed so the window ghost comes back in the mirror. (us, 2026-11-12)
- **The user wants realistic, everyday, not sentimental ideas** (2026-11-12): things an average
  person actually wonders about (phones, money, stuff breaking, embarrassment), not dead relatives
  and lost dreams. (user)
- **DO weave in what the average viewer has seen on YouTube** (money-making videos, famous creators
  like Magnus Carlsen's chess, viral-but-$0 moments); real people only as references, never as
  speaking characters. (user, 2026-11-13; rule in `voice.md`)
- **DO end every video on "what would you do?"**, and **DON'T spoil in the promise**: say what will
  happen, not how ("you'll save a whole city"). (user, 2026-11-13; rules in `voice.md`)
- **DON'T repeat the same gag or fact**: 2-3 times at most, changed each time. Episode 6 said "Theo
  floats 2 feet" countless times. (user, 2026-11-13)
- **DO less explaining, more action; length matters less than boredom.** Make situations viewers
  would love to be in, most of the time. (user, 2026-11-13)
- **DO put money, girls, views or survival in every video**, ideally as the premise. (user, 2026-11-13)
- **Money, girls, views and survival are ingredients, not the whole video**: mix them with other
  beats so the story doesn't become only about them. (user, 2026-11-13)
- **DO show "you" exploiting the situation to make big money in most videos**, even when the premise
  isn't about money. Not a money-only premise. (user, 2026-11-13)
- **DO search the exact title before writing, not only at packaging**: "What If You Could See Who
  Secretly Hates You?" already has one 238K hit and 6+ copies with the same title under 400 views.
  Keep the searched phrase and add our own hook ("I Made $50,000"). (us, 2026-11-13)
- **DO write numbers as digits** in scripts; the voice reads them fine and Whisper checks them. (us)

## Voice

- **DON'T use Kokoro** (flat, not entertaining) or **Chatterbox** (word slips). (user / us)
- **DON'T voice lines with VoiceDesign alone**: it drifts into a different person between lines
  (similarity ~0.7). Clone every line from the role's reference clip (~0.81-0.88). (us)
- **The narrator is the user's "take 4"** (playful, knowing). (user)
- **Acted takes (`tts/act.py`) only work for some voices**: Mom, Theo and the customer matched their
  reference voices; Dad, the coach, the bus driver and the teacher drifted (0.58-0.78) and stayed
  cloned. Expect about 40% of acted lines to be kept. (us, 2026-11-12)
- **Acted takes kept only 3 of 22 on episode 6** (8 of 29 on episode 5, 12 of 28 on episode 4): the
  2-3 hour cost buys little. Mark only the 5-8 lines where emotion matters most. (us, 2026-11-13) Episode 7 kept 1 of 5. (us, 2026-11-13)
- **Whisper false alarms**: "4:59" is written "4.59"; "sequins" is heard as "sequence"; numbers come
  as digits or words at random (the normaliser handles those). Check a WARNING line by transcribing
  it before re-voicing. (us)
- **DO re-voice only the lines that changed**: pass the unchanged lines as `take` slices cut from the
  existing `voice.wav` (temporary script copy in a folder named after the episode). 4 lines took
  minutes instead of 1.5 hours. (us, 2026-11-12)
- **We can't listen to audio**: Always ask the user to
  listen to the mix and any WARNING line. (us)

## Sound

- **DON'T use high-pitched, piercing or buzzy sounds**: no alarms, square-wave engines, glassy
  chimes, sparkles, beeps or "ka-ching". Soft and low only (whooshes, thumps, low-passed noise).
  `tts/mix.py` low-passes every effect at 2 kHz. (user, 2026-11-12; rule in `motion.md`)
- **DO measure it**: after a mix, check music+effects above 3 kHz (mix minus voice, high-passed);
  aim for below -40 dB. (us, 2026-11-12)

## Animation

- **DO keep the detailed look from episode 5**: textured sets with real props, shoes and collars, one
  visual motif tied to the premise. (user, 2026-11-13; rule in `motion.md`)
- **DO make every shot impossible to misunderstand**: defining objects for each place (a plane needs
  seats and a control panel), an establishing view, the action shown not implied, new things
  labelled, and a "where / who / what" line written for every contact-sheet still. (user, 2026-11-13;
  rule in `motion.md`)
- **Nothing is ever still**: ambient loop + camera move in every shot. (user, from reference screenshots)
- **DO crossfade between shots** instead of hard cuts. (user asked for spotless, clean animation)
- **DO give the speaking character real mouth shapes** from `lips.json` (user asked for lip-sync).
- **DO check a contact sheet (a still every ~4 s) before every full render.** It caught: labels
  hidden behind captions, a sign overlapping a label, a ghost plane clipped by the camera, the
  countdown clock cut off by a zoom, a "PAY" button on an acceptance email. (us)
- **Episode 7's contact sheet caught**: a label on top of a chalkboard, a label behind a hate tag, a
  meter label cut off by a punch-in, a giant check covering both faces, a sign behind the crush's tag,
  the end title on top of the silhouettes. Check every label against what's *behind* it too. (us, 2026-11-13)
- **DON'T place text near the bottom 150 px**: captions sit there. (us)
- **Watch zooms**: a punch-in or push-in pushes top-edge text off screen. (us)
- **DO lay out the animation on an estimated timeline** (words / 2.6 per second) while the voice is
  still generating, then re-check stills on the real one. (us)
- **No emoji in SVG text**: the render browser has no emoji font, so they'd show as boxes. Draw
  icons with shapes. (us, 2026-11-12)
- **Seated characters need a seat drawn**: pose "sit" has no legs and floats otherwise. (us, 2026-11-12)
- **Characters with arms up ("cheer") hide their arms behind the head** in this kit; don't rely on
  that pose to read in a thumbnail. (us)
- **A number over someone's head needs a scale the first time**: the tag reads as a score until a
  0-100 bar with "LIKES YOU" / "PUSH YOU IN A POOL" defines it; your own head has no tag. (us, 2026-11-13)
- **Thumbnail with pose "phone" or hand props**: check for a second right arm. (us, episode 3)

## Packaging

- **DO research before recommending a title, thumbnail, description or tags**, and say where each
  choice came from. (user rule, 2026-11-12; details in `CLAUDE.md`)
- **Thumbnails that win now**: 1-3 huge words with one yellow word, a red arrow, the power drawn
  as a glowing label over someone, one big emotional face. (us, `research/packaging-2026-11-12.md`)
- **Thumbnail text never repeats the title's words.** (yt-package rule)
- **DON'T give a Short almost the same title as its long video**: they compete in search. (us, 2026-11-12)
- **TikTok and Instagram don't allow links in captions**: make a "link in my bio" version of every
  teaser alongside the YouTube one ("link below"), and tell the user to put the link in their bio. (us, 2026-11-13)
- **Chunked render of a 5-minute episode took about 10 minutes** when nothing else was running (stills or voice in parallel slow it a lot). (us, 2026-11-13)
- **A teaser cropped tight (0.75) cuts off people at the edges of a wide shot**: the 0% kid vanished. Use the full width (0.5625) for crowd shots. (us, 2026-11-14)
- **Remind the user to add tags**: both first uploads went up without any. (us, 2026-11-12)

## Tools and environment

- **`voice.py` saves every finished line** (`episodes/<name>/lines/`, keyed by voice + text), so a
  container restart resumes instead of losing an hour (a restart killed it at line 68 of 81). Make
  any long job resumable the same way. (us, 2026-11-12)
- **Long jobs die when the session restarts.** After a restart, check background jobs really
  finished (file timestamp and duration), don't trust "exit 0" from a waiting loop. (us, 2026-11-12)
- **`pgrep -f <name>` matches its own shell**: a wait loop waited on itself forever. Wait on a log
  line or a PID instead. (us, 2026-11-12)
- **The PID printed by `$!` after `nohup ... &` can be a wrapper shell, not the job**: a wait loop
  watched the wrong process. Check the real PID with `ps aux | grep <script>` before waiting on it. (us, 2026-11-13)
- **`Path.relative_to(ROOT)` needs an absolute path**: call `.resolve()` first. (us, `act.py` crash)
- **Rewriting git history drops commit signatures**: after `filter-branch`, re-sign with
  `git rebase --root --exec "git commit --amend --no-edit"`. A force push needs the user's OK. (us)
- **This session can't change GitHub repo settings** (visibility etc.): the user does it. (us)
- **DON'T get around YouTube's bot check** and never use the user's cookies or login. Transcripts
  come from vidIQ (5 credits each) or the user's own computer. (user / classifier)
- **vidIQ credits are limited** (150 per month): one video's research is ~20-45. Read `research/`
  first and only re-run what's stale. (us)
- **The repo is public**: never commit other creators' transcripts, screenshots or thumbnails, or
  the user's personal details. (user, 2026-11-12)
- **Remotion leaves a ~200 MB bundle in `/tmp` per `sheet.mjs` / `still` run**: they filled the disk
  mid-episode. Delete `/tmp/remotion-webpack-bundle-*` after contact sheets; `uv cache clean` freed 11.7 GB. (us, 2026-11-13)
- **Don't render stills while the voice is generating**: both share the CPU and voice.py slowed from
  ~30 s to ~2 min a line. (us, 2026-11-13)
- **Whisper needs a 16 kHz numpy array**, not a file (PyAV metadata error). (us)
- **Don't `rm` relative globs after `cd`**: blocked as unsafe; use absolute paths. (us)
- **`sheet.mjs` and `remotion still` need `REMOTION_CHROME` set** every time; without it Remotion tries
  to download Chrome and fails (no network to remotion.media). `sheet.mjs` takes a step in seconds, not a
  frame list: for single frames use `remotion still --frame=N`. (us, 2026-11-15)
- **Episode 8's contact sheet caught props over captions**: a check/sign placed low (y 880) sat under the
  caption box. Keep big props above y ~780 when captions are on. (us, 2026-11-15)
- **A background wait can hit its time limit** before a ~1 h voice run ends: give it the max timeout
  (3,600,000 ms) or re-arm it, and don't assume it finished. (us, 2026-11-15)
- **Graphics must go up several notches from episode 9 on** ("a whole different level"): the user asked to
  improve everything visual, not polish the old look. (user, 2026-11-16)
- **Viewers leave near the payoff**: the user sees the drop in the analytics. Don't signal that the story
  is wrapping up, don't slow down before the climax, and keep a second question open through it. (user, 2026-11-16)
- **The hook must catch attention within 2 seconds**: "the beginning is everything". The first frame and
  first words carry the most striking moment, not setup ("Gym class, 10:14 a.m." was setup). (user, 2026-11-16)
- **Rendering stills starves the voice badly**: with a contact sheet running, voice.py did 3 lines in 15
  minutes. Write code and docs while the voice runs; render only one or two test stills. (us, 2026-11-16)
- **Build a new look on one test still first**: the v2 character rig was judged on a 7-character line-up
  before any scene was written; that caught inverted brows, hair drawn over the body and wrong arm poses
  in one pass. (us, 2026-11-16)
- **Close-up framing**: a head sits at `feetY - 452 * scale`; aim the camera there, not at a guessed y. (us, 2026-11-16)
- **Thumbnail text must not reuse a title word**: "DAY 1 AGAIN" failed title.py's pairing check against
  "...Every Day Twice"; "FAIL / REDO" passes. (us, 2026-11-16)
- **Far layers must extend below the floor line**: a far layer zooms less than the subject plane, so a wall
  that stops at the floor leaves a black gap in close-ups. Draw walls, lockers and counters ~200 px past the
  floor line; the floor covers the rest. (us, 2026-11-16)
- **Labels in a far layer blur in close-ups**: anything that must be read goes in the subject layer. (us, 2026-11-16)
- **Someone standing behind a prop (podium, desk)**: draw the prop after the person; don't clip the person,
  or the torso floats. (us, 2026-11-16)
- **A slammed phrase must fit between the take badge and the money counter**: keep it under ~20 characters
  or drop it when the caption already says it. (us, 2026-11-16)
- **Check a thumbnail's framing, not just its idea**: the first v2 thumbnail was so tight that the bubble,
  the flowers and the girl fell out of frame. Zoom 1.3 with characters at 1.15 worked. (us, 2026-11-16)
- **A 2-word acted line can fail the voice check** ("Your what?" scored 0.40): Whisper has little to go on.
  Flag it for the user to listen to. (us, 2026-11-16)
- **The v2 look renders slower and bigger**: 5:33 took ~50 minutes in 4 chunks, and film grain made the
  chunks ~640 MB. Keep 3 GB free before a render; re-encode the joined file with `-crf 21` (245 MB). (us, 2026-11-16)
- **Keep the render chunks until the final file has been checked**: one shot needed a fix after the chunks
  were deleted, so the fix had to be spliced in with a full re-encode. (us, 2026-11-16)
- **Check the final file's frames at the key story moments** (hook, payoff, twist), not only the contact
  sheet: the twist's thought bubble was cut off by a close-up. A reveal shot must show the thing revealed. (us, 2026-11-16)
- **Old scratch folders fill the disk**: a 1.3 GB copy of the skill repos from the first session was still
  in the temp folder. Clear scratch copies once their content is in the repo. (us, 2026-11-16)
- **One teaser file for all platforms**: end on "full video on my YouTube channel" (spoken and on screen) with
  no "link below" / "link in bio" in the video; put the link wording in each platform's caption instead. (user, 2026-11-16)
- **Teaser structure that fits the new hook rule**: the episode's own cold open is the teaser's opening (it
  was written to land in 2 seconds), then the promise, then the hardest question of the climax, cut before
  the answer. (us, 2026-11-16)
