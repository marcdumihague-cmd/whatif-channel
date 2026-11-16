# v2 kit reference (video/src/v2/kit.tsx) and how episode 9 used it

Read with `video/src/tw/Episode.tsx` and `video/src/tw/sets.tsx` open: they are the worked example. Everything
is drawn in a **1920x1080 world**; a shot is a framing of that world. 30 fps. `t` is always seconds.

## 1. Coordinates and sizes (memorise these)

- Floor line of an indoor set: y ~770-780. People stand with feet at **y = 985**.
- `Person` at scale `s = 1` is ~530 px tall. **Head centre = feetY - 452 * s** (533 for a standing person at
  985). Head is ~170 px wide. Shoulders at feetY - 352 * s, hips at feetY - 212 * s.
- Two people talking: x = 760 and x = 1180 (two-shot camera `C(960, 520, 1.5)`).
- Close-up on a face: `C(personX, headCentreY - 10, 2.4 to 2.8)`. Medium: z 1.5-2.0. Wide: `C(960, 540, 1)`.
- Sitting (`pose("sit")`): put the person at **y = seatGround + 114 * s** with `shadow={false}` (the legs
  fold forward, the ankles end 114 above the feet point). Bench/couch seat top is ~100-190 above the ground.
- Behind a desk: `Person` at y = 1094 with `pose("write")`, then `<Desk x y={990}>` drawn **after** the person.
- In bed: `Person` with `cut={-205}` (hides everything below the hips) and the blanket rect drawn after.
- Screen zones that are taken: captions y 880-1000 (centre), take badge top-left (0-250 x 0-150), money
  counter top-right (1560-1880 x 40-120), chip at left 250, top 62. Keep labels and key props out of them;
  nothing important below y ~780 in world space for wide shots.

## 2. Camera

```tsx
type Cam = { x: number; y: number; z: number };           // centre of the framing and zoom
const C = (x, y, z) => ({ x, y, z });
// hard cuts between framings; each framing drifts (default: a 7% push-in) so nothing is ever still
const cam = cuts(t, [[0, WIDE, C(960, 520, 1.15)], [S(a + 1) - 0.1, C(1180, 520, 2.5)], [S(a + 2) - 0.1, C(760, 520, 2.5)]], t1);
<Frame t={t} cam={cam} take={1}> ...set... </Frame>
```

- `cuts(t, segs, end)`: each segment is `[startTime, fromCam, toCam?]`. Cut ~0.1 s before a line starts.
- `World` clamps the framing so the world's edge never shows (at zoom z, x stays within 960/z of the edges).
  A person at x < 400 can't be centred in a close-up: place people between x = 400 and 1520.
- `shake` (0-1) on `Frame` for an impact, for under a second.
- `Layer d` = depth: 1 subject plane, 0.4-0.6 far (moves and zooms less), 1.2-1.3 foreground. `blur` = px of
  blur per unit of zoom (far 1.5-2.2, foreground 3-5).
  - **Far layers must extend ~200 px below the floor line** (walls h = 1000, lockers, counters), or a black
    gap shows in close-ups.
  - **Anything that must be read goes in the subject layer** (labels in a far layer blur).

## 3. A set (copy the shape of `Hallway` in tw/sets.tsx)

```tsx
export const Place: React.FC<SetProps> = ({ t, children, far, fg }) => (
  <>
    <Layer d={0.6} blur={2}>      {/* wall gradient h=1000, windows, the place's defining objects, sign, light */}
      <Grad id="plW" x={-200} y={0} w={2320} h={1000} from="#..." to="#..." />
      <Shafts x={...} y={...} w={...} h={700} t={t} />  <Bloom x y r color o />   {far}
    </Layer>
    <Layer>                         {/* floor gradient from y=770, floor lines, props, then the people */}
      <Grad id="plF" x={-200} y={770} w={2320} h={330} from="#..." to="#..." />
      {children}
    </Layer>
    <Layer d={1.25} blur={4}><Dust t={t} n={14} />{fg}</Layer>
  </>
);
```

Checklist per set: a sign or object that names the place; 3+ real props; one light source with `Bloom` or
`Shafts`; something moving (dust, steam, blinking light, fish, spotlight sweep); a floor with lines or a rug.
Every `Grad`/`clipPath` id must be unique in the frame. Draw wide: x from -200 to 2120.

Sets that already exist (reuse them): `Cafeteria` (+`LunchTable`, `Crowd`), `Bedroom` (clock, day, night),
`Hallway`, `Classroom` (+`Desk`, `TestPaper`), `CardShop` (+`Counter`, `Pack`, `RareCard`), `LivingRoom`
(tv content, +`Couch`), `Kitchen`, `Storage` (doors 4-9 with `open(i)` 0-1 and `inside(i)`, +`Arcade`),
`Aquarium` (+`Octopus`, `Bench`), `Studio` (screen content, `cheer`, `dim`, +`Podium`, `Envelope`),
`Hospital` (clock hours), `Street` (traffic light, +`Truck`, `Car`), `Backstage`. Props: `Flowers`, `PhoneUp`,
`Clapper`, `T` (text helper: `<T x y s={size} w={weight} c={color} a="start|middle|end">`).

## 4. Characters

```tsx
<Person x={760} y={985} look={YOU} mood="smug" t={t} p={pose("shrug", { turn: 0.6 })} lookX={0.7}
        {...say(t, "YOU")} seed={1} hold={<Flowers />} />
```

- **Looks**: `YOU, THEO, AVA, MOM, HOST, OWNER, TEACHER, PRINCIPAL`, `extra(i)` for background people. A new
  character = a new `Look` object (`skin, hair, hairStyle, top, outfit, pants, shoes, iris`, optional
  `glasses, beard, lashes, freckles, under, tall`). Hair: messy, curly, long, bob, slick, bald, pony, buzz.
  Outfits: hoodie, tee, jacket, suit, blouse, apron, coat. Keep the main cast's looks identical across episodes.
- **Moods**: neutral, happy, laugh, smug, shocked, sad, nervous, deadpan, angry, worried, love, cry,
  determined, sleepy. Change the mood on almost every line with
  `at<Mood>(t, [[0, "happy"], [S(a + 3), "shocked"]])`.
- **Poses** (`pose("name", { overrides })`): stand, hips, wave, point, pointL, cheer, shrug, think, phone,
  hold, holdUp, holdBoth, facepalm, slump, sit, write, reach, hug. Angles are degrees: `aR/eR` = right
  shoulder / elbow, `aL/eL` left, `hL/kL/hR/kR` hips and knees, `lean`, `head` (tilt), `turn` (-1..1), `y` (jump).
  `walk(t, speed)` returns a walk cycle to spread into `pose(walk(t), {...})`. `poseAt(t, [[time, pose], ...])`
  springs from pose to pose (use it for anyone on screen for more than one line).
- **Facing**: a person on the left looking right: no `flip`, `turn: 0.5`, `lookX={0.7}`. A person on the right
  looking left: `flip`, `lookX={0.7}` (with `flip`, positive `lookX` looks the way the body faces).
  Episode 9 passed `turn: -0.5` for flipped people, which turns the head slightly the wrong way: for new
  episodes use **`turn: +0.5` with `flip`** and confirm on a close-up still.
- **Talking**: `{...say(t, "ROLE")}` gives `talk` + `lip` from `lips.json`; hands gesture automatically.
- `hold` (right hand) / `holdL` (left hand): any SVG drawn at the hand. `behind`: drawn behind the torso
  (a backpack). `sweat`, `tear`, `cut` (hide below a y, relative to the feet), `shadow={false}`, `s`, `seed`
  (give every person a different seed so blinks differ), `lightDir` (-1 light from the left, 1 from the right).
- A crowd: `<Crowd t n x0 x1 y s phones cheer mood seed />`.

## 5. Text on screen

- `Captions` (screen space, in `Episode`): word-by-word, automatic.
- `Tag` (world space, inside the set): a pill label. `<Tag t at={time} until={time} x y text bg fg size rot />`.
  Width is about `text.length * size * 0.6`: check it fits the framing it appears in.
- `Slam` (screen space, after `Frame`): a huge phrase that slams in. Max ~20 characters. `y` from the top,
  `x` shifts it sideways. Don't repeat what the caption already says in the same second.
- `Card` (screen space, in tw/Episode.tsx): fact cards and emails; `VideoCard` for a generic video player
  (no real logos). A fact card shows the number big and the source small.
- `Chip` (screen space): time and place, top-left next to the badge.
- `Money` (screen space): the running total, driven by `money(t)` = `keys(t, [[time, value], ...])`.

## 6. The episode file's skeleton (copy tw/Episode.tsx, then replace the scenes)

Keep these helpers as they are: `S, E, F, first, say, at, cuts, C, WIDE, Frame, Flash, Card, Chip, Dark`
(dark gradient background for rule/plan/number cards), the `shots` record, `SHOTS`, `shotStart`, and the
`Episode` component (it picks the scene by time, adds `Money`, `Captions`, and the `Audio` unless the timeline
is estimated). Replace: the motif pieces (`TakeHud`, `Rewind`, the `take` grading inside `Frame`), `money`,
`COLORS` (caption colour per role), and every scene component.

A scene component:

```tsx
const Rules: React.FC<ShotProps> = ({ t, t1 }) => {
  const a = first("rules");                       // index of the scene's first line
  if (t < S(a + 1) - 0.12) return <Dark t={t}> ...a rules card... </Dark>;
  const cam = cuts(t, [[0, C(960, 520, 1.5)], [S(a + 3) - 0.1, C(1180, 520, 2.5)]], t1);
  return (
    <AbsoluteFill>
      <Frame t={t} cam={cam} take={2}>
        <Hallway t={t}>
          <Person ... /> <Person ... flip />
          <Tag t={t} at={S(a + 6) + 0.9} x={1180} y={230} text="REMEMBER THIS" />
        </Hallway>
      </Frame>
      <TakeHud t={t} take={2} from={0} />
    </AbsoluteFill>
  );
};
```

Rules of thumb: find lines by text when an index would be fragile
(`L.findIndex((l) => l.text.startsWith("Pack 31"))`); time things inside a long line with `F(i, 0.4)`;
animate entrances with `pop(t, at)` (spring 0 -> 1) and `ease(t, a, b)`; a location change inside a scene is
just an `if (t < ...) return ...` branch.

## 7. Thumbnail and teaser

- `Thumb.tsx`: draw at 1920x1080 inside a `div` scaled 0.66667; use `World` with a fixed `cam` (z ~1.3,
  people at s ~1.15), `blink={false}`, big text as HTML with `WebkitTextStroke`. For a split thumbnail use two
  `AbsoluteFill`s with `clipPath: polygon(...)` and a white divider line.
- `Teaser.tsx`: `<Sequence from={-Math.round(et0 * FPS)}><Episode captions={false} /></Sequence>` inside a
  scaled, clipped `div` plays a piece of the episode with its own sound; `Captions` under it with `y`.

## 8. Commands

```bash
cd video && npx tsc --noEmit -p .                                   # must print nothing
export REMOTION_CHROME=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
npx remotion still src/index.ts <Comp> out.jpg --frame=<n> --image-format=jpeg   # one frame (frame = seconds * 30)
node sheet.mjs <Comp> <everySec | s1,s2,s3> <outDir> [fromSec] [toSec]            # contact sheet at 40% size
rm -rf /tmp/remotion-webpack-bundle-*                                # after every still/sheet/render
```

`remotion still` does not overwrite an existing file silently in all cases: delete the old file or use a new name.
