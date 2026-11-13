# Motion and visual vocabulary

From reference screenshots the user picked (an established "what if" story channel). Use the
techniques, never their character design or exact look: our cast is our own.

The rule: **nothing is ever fully still.** Every shot has at least one ambient loop and one camera
move, and every beat of narration gets a visual response.

## Every shot

- **Ambient loop** in the background: rain streaks on a window, blinking city lights, floating
  dust or soft light specks (bokeh), a ticking clock, a heart-monitor line, a spinning mobile.
- **Camera**: slow push-in or pan for the whole shot (a few percent), plus quick punch-in zooms on
  reactions and jokes.
- **Soft lighting**: radial glow or vignette behind the subject, a light source that glows.

## Characters

- Faces are simple shapes; emotion comes from eyelids, brows and eye shapes (half-closed lids =
  tired or smug, wide = shocked, side glance = guilty). Change expression on almost every line.
- Blink every few seconds; small idle motion (breathing, a head bob) so no one is frozen.

## Explaining things (the "pop-up" layer)

- **Thought / memory bubbles**: circles pop out of the head (spring scale-in) with a trail of
  small dots, each holding a mini animated scene. Use for memories, plans, "imagine this".
- **Chips**: a pill label in a corner for time and place, slid in at each time jump
  (e.g. `1999 · AGE 0`). Matches the "time stamps as scene changes" rule in `voice.md`.
- **Insets**: framed photos or screens that pop in beside the main action.
- **Data cards** (bar chart like the test scene's grip-strength card): only for a real number that
  matters, one or two per episode at most.

## Title card

Bold uppercase, the key words in an accent colour, on a dark gradient, with an animated dotted
line (it can pulse with the narrator's voice).

## Open decision

Art style: the test scene uses "cartoon with outlines" (the user's earlier pick). The references
use a softer flat look (muted palette, no outlines, glows, bokeh). Ask the user before the first
episode which to keep; the motion rules above apply to both.

## Sound effects (the user's rule, 2026-11-12)

No high-pitched, piercing or buzzy sounds: no alarms or sirens, no square-wave engines, no glassy
high chimes or sparkles, no beeps or "ka-ching" bells. The user found them disturbing. Keep effects
soft and low: filtered whooshes, low thumps, gentle low hums, low-passed noise for planes and wind.
Everything above ~2 kHz in an effect is cut (`tts/mix.py` low-passes every effect).

## Detail level (the user's rule, 2026-11-13)

Graphics should be "a little more detailed" than the first episodes, and every episode from now on
keeps that level:

- **Textured sets with real props**: tiles, cabinets with handles, a fridge with magnets, a pegboard
  with tools, shelves of paint cans, a clock that ticks, plants, a windsock that moves. Never a flat
  wall with one window.
- **Character details**: shoes and collars (in the kit), props in hand, and a seat drawn under anyone sitting.
- **One recurring visual motif tied to the premise**, readable at a glance (episode 5: a red progress
  bar over your head that stops where you stopped watching). Use it in the thumbnail too.
- **Generic UI only**: watch-history lists, phones and screens are drawn without real logos.
