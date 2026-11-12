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
- **DO keep it 7-10 minutes.** Flops ran 13-19 min. (us, transcript study)
- **DO plant a detail early and pay it off late, and end on a selfless choice under a timer.** (us, transcript study)
- **DON'T gender "you".** "He's charging tax" about the viewer was rewritten to "The kid charges tax". (us, 2026-11-12)
- **DO check continuity rules you set**: "kids have no ghost until 18" clashed with "for the first
  time someone is standing behind you"; fixed so the window ghost comes back in the mirror. (us, 2026-11-12)
- **The user wants realistic, everyday, not sentimental ideas** (2026-11-12): things an average
  person actually wonders about (phones, money, stuff breaking, embarrassment), not dead relatives
  and lost dreams. (user)
- **DO write numbers as digits** in scripts; the voice reads them fine and Whisper checks them. (us)

## Voice

- **DON'T use Kokoro** (flat, not entertaining) or **Chatterbox** (word slips). (user / us)
- **DON'T voice lines with VoiceDesign alone**: it drifts into a different person between lines
  (similarity ~0.7). Clone every line from the role's reference clip (~0.81-0.88). (us)
- **The narrator is the user's "take 4"** (playful, knowing). (user)
- **Acted takes (`tts/act.py`) only work for some voices**: Mom, Theo and the customer matched their
  reference voices; Dad, the coach, the bus driver and the teacher drifted (0.58-0.78) and stayed
  cloned. Expect about 40% of acted lines to be kept. (us, 2026-11-12)
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

- **Nothing is ever still**: ambient loop + camera move in every shot. (user, from reference screenshots)
- **DO crossfade between shots** instead of hard cuts. (user asked for spotless, clean animation)
- **DO give the speaking character real mouth shapes** from `lips.json` (user asked for lip-sync).
- **DO check a contact sheet (a still every ~4 s) before every full render.** It caught: labels
  hidden behind captions, a sign overlapping a label, a ghost plane clipped by the camera, the
  countdown clock cut off by a zoom, a "PAY" button on an acceptance email. (us)
- **DON'T place text near the bottom 150 px**: captions sit there. (us)
- **Watch zooms**: a punch-in or push-in pushes top-edge text off screen. (us)
- **DO lay out the animation on an estimated timeline** (words / 2.6 per second) while the voice is
  still generating, then re-check stills on the real one. (us)
- **Characters with arms up ("cheer") hide their arms behind the head** in this kit; don't rely on
  that pose to read in a thumbnail. (us)
- **Thumbnail with pose "phone" or hand props**: check for a second right arm. (us, episode 3)

## Packaging

- **DO research before recommending a title, thumbnail, description or tags**, and say where each
  choice came from. (user rule, 2026-11-12; details in `CLAUDE.md`)
- **Thumbnails that win now**: 1-3 huge words with one yellow word, a red arrow, the power drawn
  as a glowing label over someone, one big emotional face. (us, `research/packaging-2026-11-12.md`)
- **Thumbnail text never repeats the title's words.** (yt-package rule)
- **DON'T give a Short almost the same title as its long video**: they compete in search. (us, 2026-11-12)
- **Remind the user to add tags**: both first uploads went up without any. (us, 2026-11-12)

## Tools and environment

- **Long jobs die when the session restarts.** After a restart, check background jobs really
  finished (file timestamp and duration), don't trust "exit 0" from a waiting loop. (us, 2026-11-12)
- **`pgrep -f <name>` matches its own shell**: a wait loop waited on itself forever. Wait on a log
  line or a PID instead. (us, 2026-11-12)
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
- **Whisper needs a 16 kHz numpy array**, not a file (PyAV metadata error). (us)
- **Don't `rm` relative globs after `cd`**: blocked as unsafe; use absolute paths. (us)
