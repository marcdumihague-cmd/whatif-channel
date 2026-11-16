// v2 kit (episode 9 on): jointed, shaded characters; multi-plane camera with depth blur; light and grain.
// Everything is drawn in a 1920x1080 world; shots are framings of that world (x, y, zoom), so close-ups stay sharp.
import React from "react";
import { AbsoluteFill, Easing, interpolate, staticFile } from "remotion";
import { ease, pop, Lip, Mouth } from "../ll/kit";

export const font = "'Inter Display', Inter, sans-serif";
export const clampO = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 3.7) * 43758.5453; return x - Math.floor(x); };
export { rnd };
// k < 0 darkens toward black, k > 0 lightens toward white
export const shade = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16), to = k < 0 ? 0 : 255, a = Math.abs(k);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round(v + (to - v) * a));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
};
export const keys = (t: number, k: [number, number][], easing = Easing.inOut(Easing.cubic)) =>
  k.length === 1 ? k[0][1] : interpolate(t, k.map((x) => x[0]), k.map((x) => x[1]), { ...clampO, easing });

// ---------- camera ----------
export type Cam = { x: number; y: number; z: number };
const CamCtx = React.createContext<Cam>({ x: 960, y: 540, z: 1 });
// a slow move from one framing to another over the shot
export const move = (t: number, t0: number, t1: number, a: Cam, b: Cam): Cam => {
  const k = ease(t, t0, Math.max(t1, t0 + 0.1));
  return { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), z: lerp(a.z, b.z, k) };
};
// keep the framing inside the 1920x1080 world so no edge ever shows
const fit = (c: Cam): Cam => {
  const z = Math.max(1, c.z), hw = 960 / z, hh = 540 / z;
  return { z, x: Math.min(1920 - hw, Math.max(hw, c.x)), y: Math.min(1080 - hh, Math.max(hh, c.y)) };
};
export const World: React.FC<{ cam: Cam; shake?: number; t?: number; children: React.ReactNode }> = ({ cam, shake = 0, t = 0, children }) => {
  const c = fit(cam);
  const sx = shake ? Math.sin(t * 91) * 10 * shake : 0, sy = shake ? Math.cos(t * 77) * 7 * shake : 0;
  return <CamCtx.Provider value={c}><AbsoluteFill style={{ overflow: "hidden", transform: `translate(${sx}px, ${sy}px)` }}>{children}</AbsoluteFill></CamCtx.Provider>;
};
// d = depth: 1 is the subject plane, < 1 is farther (moves and zooms less), > 1 is foreground. blur = px of blur per unit of zoom.
export const Layer: React.FC<{ d?: number; blur?: number; children: React.ReactNode }> = ({ d = 1, blur = 0, children }) => {
  const c = React.useContext(CamCtx);
  const z = 1 + (c.z - 1) * d, x = 960 + (c.x - 960) * d, y = 540 + (c.y - 540) * d;
  const b = blur * (0.4 + (c.z - 1));
  return (
    <AbsoluteFill style={{ transform: `translate(${960 - x * z}px, ${540 - y * z}px) scale(${z})`, transformOrigin: "0 0", filter: b > 0.3 ? `blur(${b.toFixed(1)}px)` : undefined }}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute", overflow: "visible" }}>{children}</svg>
    </AbsoluteFill>
  );
};

// ---------- light, atmosphere ----------
export const Vignette: React.FC<{ o?: number }> = ({ o = 0.5 }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 48%, rgba(6,8,20,${o}) 100%)` }} />
);
export const Grain: React.FC<{ t: number; o?: number }> = ({ t, o = 0.1 }) => {
  const f = Math.floor(t * 30);
  return <AbsoluteFill style={{ backgroundImage: `url(${staticFile("v2/grain.png")})`, backgroundPosition: `${(f * 173) % 512}px ${(f * 311) % 512}px`, mixBlendMode: "overlay", opacity: o }} />;
};
// soft beams from a window or a spotlight (screen-blended)
export const Shafts: React.FC<{ x: number; y: number; w: number; h: number; skew?: number; color?: string; o?: number; n?: number; t?: number }> = ({ x, y, w, h, skew = 260, color = "#FFE9B8", o = 0.22, n = 3, t = 0 }) => (
  <g style={{ mixBlendMode: "screen" }}>
    <defs><linearGradient id={`sh${x}${y}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={color} stopOpacity={o} /><stop offset="1" stopColor={color} stopOpacity={0} /></linearGradient></defs>
    {Array.from({ length: n }, (_, i) => {
      const a = x + (w / n) * i + (w / n) * 0.15, b = a + (w / n) * 0.6, k = 1 + 0.08 * Math.sin(t * 0.6 + i);
      return <polygon key={i} points={`${a},${y} ${b},${y} ${b + skew * k + 60},${y + h} ${a + skew * k - 60},${y + h}`} fill={`url(#sh${x}${y})`} />;
    })}
  </g>
);
export const Bloom: React.FC<{ x: number; y: number; r: number; color: string; o?: number }> = ({ x, y, r, color, o = 0.6 }) => {
  const id = `bl${Math.round(x)}_${Math.round(y)}_${Math.round(r)}`;
  return (
    <g style={{ mixBlendMode: "screen" }}>
      <defs><radialGradient id={id}><stop offset="0" stopColor={color} stopOpacity={o} /><stop offset="1" stopColor={color} stopOpacity={0} /></radialGradient></defs>
      <circle cx={x} cy={y} r={r} fill={`url(#${id})`} />
    </g>
  );
};
export const Dust: React.FC<{ t: number; n?: number; color?: string; o?: number }> = ({ t, n = 26, color = "#FFF4D6", o = 0.5 }) => (
  <g style={{ mixBlendMode: "screen" }}>
    {Array.from({ length: n }, (_, i) => {
      const x = (rnd(i) * 1920 + t * (6 + rnd(i + 9) * 14)) % 1920, y = (rnd(i + 40) * 1080 - t * (3 + rnd(i + 5) * 9) + 1080 * 4) % 1080;
      return <circle key={i} cx={x} cy={y} r={2 + rnd(i + 70) * 5} fill={color} opacity={o * (0.3 + 0.7 * Math.abs(Math.sin(t * 0.7 + i)))} />;
    })}
  </g>
);
// linear gradient rect helper
export const Grad: React.FC<{ id: string; x: number; y: number; w: number; h: number; from: string; to: string; horizontal?: boolean; rx?: number; o?: number }> = ({ id, x, y, w, h, from, to, horizontal, rx = 0, o = 1 }) => (
  <g opacity={o}>
    <defs><linearGradient id={id} x1="0" y1="0" x2={horizontal ? "1" : "0"} y2={horizontal ? "0" : "1"}><stop offset="0" stopColor={from} /><stop offset="1" stopColor={to} /></linearGradient></defs>
    <rect x={x} y={y} width={w} height={h} rx={rx} fill={`url(#${id})`} />
  </g>
);
export const GroundShadow: React.FC<{ x: number; y: number; rx: number; ry?: number; o?: number }> = ({ x, y, rx, ry = rx * 0.16, o = 0.32 }) => {
  const id = `gs${Math.round(x)}_${Math.round(y)}_${Math.round(rx)}`;
  return (
    <g>
      <defs><radialGradient id={id}><stop offset="0" stopColor="#0A0E1E" stopOpacity={o} /><stop offset="0.6" stopColor="#0A0E1E" stopOpacity={o * 0.5} /><stop offset="1" stopColor="#0A0E1E" stopOpacity={0} /></radialGradient></defs>
      <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={`url(#${id})`} />
    </g>
  );
};

// ---------- characters ----------
export type Mood = "neutral" | "happy" | "laugh" | "smug" | "shocked" | "sad" | "nervous" | "deadpan" | "angry" | "worried" | "love" | "cry" | "determined" | "sleepy";
const FACE: Record<Mood, { lid: number; brow: number; tilt: number; eye: number; mouth: string; arc?: boolean }> = {
  neutral: { lid: 0.12, brow: 0, tilt: 0, eye: 1, mouth: "flat" },
  happy: { lid: 0.18, brow: -5, tilt: 0, eye: 1, mouth: "smile" },
  laugh: { lid: 1, brow: -8, tilt: 0, eye: 1, mouth: "o", arc: true },
  smug: { lid: 0.5, brow: -2, tilt: 10, eye: 1, mouth: "smirk" },
  shocked: { lid: 0, brow: -16, tilt: 0, eye: 1.28, mouth: "o" },
  sad: { lid: 0.38, brow: -4, tilt: -18, eye: 1, mouth: "frown" },
  nervous: { lid: 0.06, brow: -9, tilt: -12, eye: 1.1, mouth: "wobble" },
  deadpan: { lid: 0.55, brow: 3, tilt: 0, eye: 1, mouth: "flat" },
  angry: { lid: 0.28, brow: 7, tilt: 20, eye: 1, mouth: "frown" },
  worried: { lid: 0.1, brow: -10, tilt: -20, eye: 1.12, mouth: "frown" },
  love: { lid: 0.3, brow: -8, tilt: -6, eye: 1.1, mouth: "smile" },
  cry: { lid: 0.45, brow: -6, tilt: -22, eye: 1, mouth: "wobble" },
  determined: { lid: 0.3, brow: 5, tilt: 14, eye: 1, mouth: "flat" },
  sleepy: { lid: 0.85, brow: 3, tilt: 0, eye: 1, mouth: "flat" },
};
export type HairStyle = "messy" | "curly" | "long" | "bob" | "slick" | "bald" | "pony" | "buzz";
export type Outfit = "hoodie" | "tee" | "jacket" | "suit" | "blouse" | "apron" | "coat";
export type Look = {
  skin: string; hair: string; hairStyle: HairStyle; top: string; outfit: Outfit; pants: string; shoes: string; iris: string;
  glasses?: boolean; beard?: string; tall?: number; lashes?: boolean; under?: string; freckles?: boolean;
};
export type Pose = { aL: number; eL: number; aR: number; eR: number; lean: number; head: number; turn: number; hL: number; kL: number; hR: number; kR: number; y: number };
const BASE: Pose = { aL: 8, eL: 8, aR: 8, eR: 8, lean: 0, head: 0, turn: 0, hL: -4, kL: 0, hR: 4, kR: 0, y: 0 };
export const POSE: Record<string, Partial<Pose>> = {
  stand: {},
  hips: { aL: 42, eL: -83, aR: 42, eR: -83 },
  wave: { aR: 150, eR: 28 },
  point: { aR: 96, eR: 0 },
  pointL: { aL: 96, eL: 0 },
  cheer: { aL: 158, eL: 14, aR: 158, eR: 14, y: -18 },
  shrug: { aL: 28, eL: 86, aR: 28, eR: 86, head: 6 },
  think: { aR: 30, eR: -161, head: -6 },
  phone: { aR: 100, eR: 116, head: 5 },
  hold: { aR: 25, eR: 70 },
  holdUp: { aR: 132, eR: 20 },
  holdBoth: { aL: 20, eL: -126, aR: 20, eR: -126 }, // both hands meet in front of the chest
  facepalm: { aR: 160, eR: 80, head: -12 },
  slump: { aL: 4, eL: 2, aR: 4, eR: 2, lean: 5, head: -14 },
  sit: { hL: 74, kL: -74, hR: 62, kR: -62, aL: 14, eL: -40, aR: 14, eR: -40 },
  write: { aR: 14, eR: -70, head: -10, hL: 74, kL: -74, hR: 62, kR: -62 },
  reach: { aR: 78, eR: 8, lean: 6 },
  hug: { aL: 60, eL: -70, aR: 60, eR: -70 },
};
export const pose = (...p: (Partial<Pose> | string)[]): Pose => Object.assign({}, BASE, ...p.map((x) => (typeof x === "string" ? POSE[x] : x)));
export const mixPose = (a: Pose, b: Pose, k: number): Pose => Object.fromEntries((Object.keys(a) as (keyof Pose)[]).map((n) => [n, lerp(a[n], b[n], k)])) as Pose;
// keyframed poses: [[time, pose], ...] with a quick ease into each one (0.28 s)
export const poseAt = (t: number, ks: [number, Pose][]): Pose => {
  let p = ks[0][1];
  for (let i = 1; i < ks.length; i++) if (t > ks[i][0]) p = mixPose(p, ks[i][1], interpolate(t, [ks[i][0], ks[i][0] + 0.28], [0, 1], { ...clampO, easing: Easing.out(Easing.back(1.6)) }));
  return p;
};
export const walk = (t: number, speed = 1): Partial<Pose> => {
  const f = t * 7.2 * speed, s = Math.sin(f);
  return { hL: 26 * s, hR: -26 * s, kL: -Math.max(0, -Math.cos(f)) * 34, kR: -Math.max(0, Math.cos(f)) * 34, aL: 20 * s, aR: 20 * s, eL: 14, eR: 14, y: -Math.abs(Math.cos(f)) * 7, lean: 3 };
};

const HairBack: React.FC<{ look: Look }> = ({ look }) => {
  const c = look.hair;
  switch (look.hairStyle) {
    case "long": return <path d="M -90 -14 C -100 -104 100 -104 90 -14 C 100 64 96 124 72 158 L -72 158 C -96 124 -100 64 -90 -14 Z" fill={shade(c, -0.18)} />;
    case "pony": return <g fill={shade(c, -0.18)}><path d="M -86 -14 C -96 -100 96 -100 86 -14 C 90 30 84 60 70 76 L -70 76 C -84 60 -90 30 -86 -14 Z" /><path d="M 60 -70 C 130 -80 150 0 120 70 C 112 30 96 0 66 -20 Z" /></g>;
    case "bob": return <path d="M -92 -14 C -100 -104 100 -104 92 -14 C 98 30 96 60 84 84 L -84 84 C -96 60 -98 30 -92 -14 Z" fill={shade(c, -0.18)} />;
    case "curly": return <g fill={shade(c, -0.2)}>{[-70, -40, 0, 40, 70].map((x, i) => <circle key={x} cx={x} cy={-60 + Math.abs(x) * 0.25} r={38 + (i % 2) * 5} />)}</g>;
    default: return null;
  }
};
const HairFront: React.FC<{ look: Look; t: number }> = ({ look, t }) => {
  const c = look.hair, hi = shade(c, 0.28), sway = Math.sin(t * 1.7) * 1.2;
  switch (look.hairStyle) {
    case "messy": return (
      <g transform={`rotate(${sway * 0.5} 0 -60)`}>
        <path d="M -82 -8 C -90 -84 -40 -104 4 -102 C 58 -102 92 -66 82 -6 C 76 -34 62 -48 46 -52 C 38 -38 20 -42 10 -56 C 0 -38 -22 -38 -30 -54 C -44 -38 -62 -36 -82 -8 Z" fill={c} />
        <path d="M -30 -100 C -20 -122 6 -118 2 -100 M 14 -101 C 30 -120 50 -108 40 -94" stroke={c} strokeWidth={12} strokeLinecap="round" fill="none" />
        <path d="M -48 -82 Q -10 -98 36 -86" stroke={hi} strokeWidth={8} strokeLinecap="round" fill="none" opacity={0.5} />
      </g>);
    case "curly": return (
      <g>
        {[-62, -34, -4, 26, 56].map((x, i) => <circle key={x} cx={x} cy={-66 + (i % 2) * 9} r={30} fill={c} />)}
        <circle cx={-78} cy={-30} r={22} fill={c} /><circle cx={78} cy={-30} r={22} fill={c} />
        {[-50, -14, 22, 52].map((x, i) => <path key={x} d={`M ${x - 10} ${-80 + (i % 2) * 8} q 10 -12 20 0`} stroke={hi} strokeWidth={6} strokeLinecap="round" fill="none" opacity={0.45} />)}
      </g>);
    case "long": case "pony": return (
      <g>
        <path d="M -86 0 C -90 -78 -32 -104 10 -102 C 62 -100 92 -62 86 -2 C 74 -40 42 -64 8 -68 C -28 -42 -66 -34 -86 0 Z" fill={c} />
        <path d="M -52 -78 Q -6 -100 44 -82" stroke={hi} strokeWidth={9} strokeLinecap="round" fill="none" opacity={0.5} />
        {look.hairStyle === "long" && <g fill={c}><path d={`M -88 -6 C -98 40 -96 100 ${-80 + sway} 150 C -66 100 -70 40 -72 -4 Z`} /><path d={`M 88 -6 C 98 40 96 100 ${80 + sway} 150 C 66 100 70 40 72 -4 Z`} /></g>}
      </g>);
    case "bob": return (
      <g>
        <path d="M -88 6 C -94 -80 -34 -104 6 -102 C 60 -100 94 -64 88 6 C 80 -30 50 -58 12 -62 C -30 -60 -70 -40 -88 6 Z" fill={c} />
        <path d="M -90 0 C -96 30 -92 60 -80 84 C -72 60 -74 30 -74 0 Z M 90 0 C 96 30 92 60 80 84 C 72 60 74 30 74 0 Z" fill={c} />
        <path d="M -50 -80 Q -4 -100 46 -82" stroke={hi} strokeWidth={9} strokeLinecap="round" fill="none" opacity={0.5} />
      </g>);
    case "slick": return (
      <g>
        <path d="M -80 -16 C -86 -86 -30 -102 6 -100 C 58 -100 88 -66 80 -18 C 62 -56 20 -72 -30 -64 C -56 -58 -70 -40 -80 -16 Z" fill={c} />
        <path d="M -40 -84 Q 4 -98 50 -78" stroke={hi} strokeWidth={7} strokeLinecap="round" fill="none" opacity={0.5} />
      </g>);
    case "buzz": return <path d="M -80 -20 C -84 -84 -30 -98 4 -98 C 56 -98 86 -64 80 -20 C 60 -58 -56 -58 -80 -20 Z" fill={c} opacity={0.85} />;
    case "bald": return <g fill={c}><ellipse cx={-76} cy={-14} rx={12} ry={26} /><ellipse cx={76} cy={-14} rx={12} ry={26} /></g>;
  }
};

export const Head: React.FC<{ look: Look; mood: Mood; t: number; turn?: number; lookX?: number; lookY?: number; lip?: Lip; talk?: boolean; blink?: boolean; lightDir?: number; seed?: number; tear?: boolean; sweat?: boolean }> =
  ({ look, mood, t, turn = 0, lookX = 0, lookY = 0, lip, talk = false, blink = true, lightDir = -1, seed = 0, tear = false, sweat = false }) => {
  const id = React.useId().replace(/:/g, "");
  const f = FACE[mood];
  const tb = t + seed * 1.7;
  const blinking = blink && (tb % 3.3 < 0.12 || (tb + 1.1) % 7.9 < 0.1);
  const lid = blinking ? 1 : f.lid;
  const flap = talk && !lip ? Math.max(0, Math.sin(t * 22) * 0.5 + Math.sin(t * 13.7) * 0.5) : 0;
  const tx = turn * 16;
  // small saccades so eyes never sit perfectly still
  const dart = Math.floor(tb * 0.9) % 4 === 0 ? (rnd(Math.floor(tb * 0.9) + seed) - 0.5) * 0.5 : 0;
  const skinD = shade(look.skin, -0.16), brow = shade(look.hair, look.hairStyle === "bald" ? -0.1 : -0.25);
  const Eye = ({ side }: { side: number }) => {
    const far = Math.sign(turn) === side ? 1 - Math.abs(turn) * 0.22 : 1;
    const rx = 15.5 * f.eye * far, ry = 19 * f.eye;
    const px = (lookX + dart + turn * 0.4) * 6, py = lookY * 5 + 1.5;
    const lidY = -ry + ry * 2 * lid;
    return (
      <g transform={`translate(${side * 31 + tx} -6)`}>
        {f.arc || lid >= 0.98 ? (
          <path d={f.arc ? `M ${-rx} 4 Q 0 ${-ry * 0.9} ${rx} 4` : `M ${-rx} 2 Q 0 10 ${rx} 2`} stroke="#1B1E2B" strokeWidth={5.5} strokeLinecap="round" fill="none" />
        ) : (
          <g>
            <clipPath id={`e${id}${side}`}><ellipse rx={rx} ry={ry} /></clipPath>
            <ellipse rx={rx} ry={ry} fill="#FFFFFF" />
            <g clipPath={`url(#e${id}${side})`}>
              <ellipse cx={0} cy={-ry} rx={rx * 1.2} ry={ry * 0.7} fill="#C9D3E6" opacity={0.55} />
              <circle cx={px} cy={py} r={10.5 * f.eye} fill={look.iris} />
              <circle cx={px} cy={py} r={10.5 * f.eye} fill="none" stroke={shade(look.iris, -0.45)} strokeWidth={2.5} />
              <circle cx={px} cy={py} r={5.6 * f.eye} fill="#12141F" />
              <circle cx={px - 4} cy={py - 5} r={3.6} fill="#FFFFFF" />
              <circle cx={px + 4.5} cy={py + 4.5} r={1.7} fill="#FFFFFF" opacity={0.8} />
              {mood === "love" && <path d={`M ${px} ${py + 5} l -7 -7 a 4 4 0 0 1 7 -4 a 4 4 0 0 1 7 4 Z`} fill="#FF5C7A" />}
              <rect x={-rx - 2} y={-ry - 2} width={rx * 2 + 4} height={Math.max(0, lidY + ry + 2)} fill={look.skin} transform={`rotate(${-f.tilt * side * 0.8})`} />
            </g>
            <path d={`M ${-rx} ${Math.max(-ry * 0.55, lidY - 3)} Q 0 ${lidY - ry * 0.55 * (1 - lid)} ${rx} ${Math.max(-ry * 0.55, lidY - 3)}`} stroke="#1B1E2B" strokeWidth={look.lashes ? 6 : 4.5} strokeLinecap="round" fill="none" transform={`rotate(${-f.tilt * side * 0.8})`} />
            {look.lashes && <path d={`M ${side * rx} ${Math.max(-ry * 0.55, lidY - 3)} l ${side * 7} -6`} stroke="#1B1E2B" strokeWidth={4} strokeLinecap="round" />}
          </g>
        )}
        <path d={`M ${-17} 0 Q 0 ${-7} ${17} 0`} stroke={brow} strokeWidth={7.5} strokeLinecap="round" fill="none"
          transform={`translate(0 ${-ry - 13 + f.brow}) rotate(${-f.tilt * side})`} />
      </g>
    );
  };
  return (
    <g>
      <ellipse cx={-77} cy={8} rx={13} ry={19} fill={look.skin} /><ellipse cx={-77} cy={9} rx={6} ry={10} fill={skinD} opacity={0.6} />
      <ellipse cx={77} cy={8} rx={13} ry={19} fill={look.skin} /><ellipse cx={77} cy={9} rx={6} ry={10} fill={skinD} opacity={0.6} />
      <path d="M -78 -12 C -78 -72 -40 -90 0 -90 C 40 -90 78 -72 78 -12 C 78 40 46 82 0 82 C -46 82 -78 40 -78 -12 Z" fill={look.skin} />
      {/* form shadow on the side away from the light, soft light on the other */}
      <g transform={`scale(${-lightDir} 1)`}>
        <path d="M 34 -84 C 82 -62 86 30 30 78 C 56 40 60 -40 34 -84 Z" fill="#1A1030" opacity={0.13} />
      </g>
      {look.beard && <path d="M -74 14 C -66 96 66 96 74 14 C 56 44 30 50 0 50 C -30 50 -56 44 -74 14 Z" fill={look.beard} />}
      <ellipse cx={-46 + tx} cy={24} rx={13} ry={7} fill="#F0796B" opacity={0.3} />
      <ellipse cx={46 + tx} cy={24} rx={13} ry={7} fill="#F0796B" opacity={0.3} />
      {look.freckles && [-52, -44, -38, 38, 44, 52].map((x, i) => <circle key={x} cx={x + tx} cy={18 + (i % 2) * 5} r={1.8} fill={skinD} />)}
      <Eye side={-1} /><Eye side={1} />
      <path d={`M ${tx * 1.25 - 1} 8 q ${6 + turn * 4} 9 -3 13`} stroke={skinD} strokeWidth={4.5} strokeLinecap="round" fill="none" />
      {look.glasses && (
        <g fill="rgba(255,255,255,0.12)" stroke="#20222E" strokeWidth={5}>
          <rect x={-56 + tx} y={-30} width={48} height={46} rx={16} /><rect x={8 + tx} y={-30} width={48} height={46} rx={16} /><path d={`M ${-8 + tx} -10 q 8 -6 16 0`} fill="none" />
        </g>
      )}
      <g transform={`translate(${tx * 0.85} 8)`}><Mouth kind={f.mouth} talk={flap} color="#3A1E24" lip={lip} /></g>
      <HairFront look={look} t={t} />
      {tear && <path d={`M ${-34 + tx} 16 q -8 ${18 + (t * 30) % 22} 0 ${26 + (t * 30) % 22} q 8 -8 0 -26 Z`} fill="#9FD6FF" opacity={0.85} />}
      {sweat && <path d="M 62 -70 q 12 22 0 32 q -12 -10 0 -32 Z" fill="#9FD6FF" opacity={0.6 + Math.sin(t * 4) * 0.3} />}
    </g>
  );
};

// A person with feet at (x, y). s = 1 is about 530 px tall. `hold` is drawn in the right hand, `holdL` in the left.
export const Person: React.FC<{
  x: number; y: number; look: Look; mood?: Mood; t: number; s?: number; p?: Pose; flip?: boolean; lookX?: number; lookY?: number;
  lip?: Lip; talk?: boolean; hold?: React.ReactNode; holdL?: React.ReactNode; lightDir?: number; rim?: string; shadow?: boolean; seed?: number;
  tear?: boolean; sweat?: boolean; blink?: boolean; behind?: React.ReactNode; cut?: number; // cut: hide everything below this y (seated behind a desk)
}> = ({ x, y, look, mood = "neutral", t, s = 1, p = pose(), flip = false, lookX = 0, lookY = 0, lip, talk = false, hold, holdL, lightDir = -1, rim, shadow = true, seed = 0, tear, sweat, blink, behind, cut }) => {
  const id = React.useId().replace(/:/g, "");
  const ld = lightDir * (flip ? -1 : 1);
  const breathe = Math.sin(t * 2.3 + seed * 2) * 1;
  const gest = talk ? Math.sin(t * 6.3 + seed) * 7 : 0; // small hand movement while speaking
  const topD = shade(look.top, -0.13), topL = shade(look.top, 0.14), pantsD = shade(look.pants, -0.16), skinD = shade(look.skin, -0.1);
  const sleeveFore = look.outfit === "tee" || look.outfit === "apron" ? look.skin : look.top;
  const rad = (d: number) => (d * Math.PI) / 180;
  const arm = (side: number, a: number, e: number) => {
    const S = { x: side * 66, y: -352 };
    const E = { x: S.x + side * 80 * Math.sin(rad(a)), y: S.y + 80 * Math.cos(rad(a)) };
    const H = { x: E.x + side * 96 * Math.sin(rad(a + e)), y: E.y + 96 * Math.cos(rad(a + e)) };
    return { S, E, H };
  };
  const leg = (side: number, h: number, k: number) => {
    const S = { x: side * 25, y: -212 };
    const K = { x: S.x + 104 * Math.sin(rad(h)), y: S.y + 104 * Math.cos(rad(h)) };
    const A = { x: K.x + 98 * Math.sin(rad(h + k)), y: K.y + 98 * Math.cos(rad(h + k)) };
    return { S, K, A };
  };
  const AL = arm(-1, p.aL, p.eL + gest * 0.6), AR = arm(1, p.aR, p.eR - gest);
  const LL = leg(-1, p.hL, p.kL), LR = leg(1, p.hR, p.kR);
  const Limb = ({ a, b, w, c, d }: { a: { x: number; y: number }; b: { x: number; y: number }; w: number; c: string; d: string }) => (
    <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={ld * (a.x + b.x) > 60 ? d : c} strokeWidth={w} strokeLinecap="round" />
  );
  const Arm = ({ A, held }: { A: ReturnType<typeof arm>; held?: React.ReactNode }) => (
    <g>
      <Limb a={A.S} b={A.E} w={38} c={look.top} d={topD} />
      <Limb a={A.E} b={A.H} w={33} c={sleeveFore} d={sleeveFore === look.skin ? skinD : topD} />
      {held && <g transform={`translate(${A.H.x} ${A.H.y})`}>{held}</g>}
      <circle cx={A.H.x} cy={A.H.y} r={21} fill={look.skin} />
    </g>
  );
  const Shoe = ({ A }: { A: { x: number; y: number } }) => (
    <g transform={`translate(${A.x} ${A.y})`}>
      <path d="M -20 -16 C -22 -30 10 -30 18 -18 C 40 -14 46 -4 44 6 L -22 6 Z" fill={look.shoes} />
      <rect x={-24} y={3} width={70} height={9} rx={4.5} fill="#F2F4F8" /><path d="M 2 -18 l 12 6 M -4 -12 l 12 6" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" opacity={0.7} />
    </g>
  );
  const body = (
    <g transform={`translate(0 ${p.y})`}>
      {/* legs */}
      <Limb a={LL.S} b={LL.K} w={44} c={look.pants} d={pantsD} /><Limb a={LL.K} b={LL.A} w={38} c={look.pants} d={pantsD} /><Shoe A={LL.A} />
      <Limb a={LR.S} b={LR.K} w={44} c={look.pants} d={pantsD} /><Limb a={LR.K} b={LR.A} w={38} c={look.pants} d={pantsD} /><Shoe A={LR.A} />
      <g transform={`rotate(${p.lean} 0 -212)`}>
        <path d="M -58 -240 L 58 -240 L 54 -196 C 30 -184 -30 -184 -54 -196 Z" fill={look.pants} />
        {behind}
        <g transform={`translate(0 ${-452}) rotate(${p.head})`}><HairBack look={look} /></g>
        {(look.outfit === "hoodie") && <ellipse cx={0} cy={-366} rx={66} ry={30} fill={topD} />}
        <rect x={-16} y={-392} width={32} height={34} fill={skinD} />
        {/* torso */}
        <g transform={`translate(0 ${-breathe})`}>
          <path d="M -72 -338 C -72 -368 -40 -374 0 -374 C 40 -374 72 -368 72 -338 L 60 -226 C 60 -208 -60 -208 -60 -226 Z" fill={look.top} />
          <g transform={`scale(${-ld} 1)`}>
            <path d="M 26 -372 C 60 -370 72 -358 72 -338 L 60 -226 C 60 -214 40 -210 22 -209 C 34 -260 36 -320 26 -372 Z" fill={topD} />
            <path d="M -66 -346 C -62 -366 -44 -370 -30 -371 C -46 -360 -54 -330 -56 -250 L -61 -250 Z" fill={topL} opacity={0.7} />
          </g>
          {look.outfit === "hoodie" && <g>
            <path d="M -30 -372 Q 0 -338 30 -372" stroke={topD} strokeWidth={9} fill="none" strokeLinecap="round" />
            <path d="M -36 -272 L 36 -272 L 46 -228 L -46 -228 Z" fill={topD} opacity={0.55} />
            <line x1={-13} y1={-356} x2={-15 + Math.sin(t * 2) * 1.5} y2={-312} stroke="#F2F4F8" strokeWidth={4} strokeLinecap="round" /><line x1={13} y1={-356} x2={15 + Math.sin(t * 2 + 1) * 1.5} y2={-316} stroke="#F2F4F8" strokeWidth={4} strokeLinecap="round" />
          </g>}
          {look.outfit === "tee" && <path d="M -26 -374 Q 0 -352 26 -374" stroke={topD} strokeWidth={8} fill={look.skin} strokeLinecap="round" />}
          {look.outfit === "jacket" && <g>
            <path d="M -24 -374 L 24 -374 L 18 -212 L -18 -212 Z" fill={look.under ?? "#F2F4F8"} />
            <path d="M -24 -374 L -18 -212 M 24 -374 L 18 -212" stroke={topD} strokeWidth={5} />
          </g>}
          {look.outfit === "coat" && <g>
            <path d="M -20 -374 L 20 -374 L 0 -330 Z" fill={look.under ?? "#9FC3D8"} />
            <line x1={0} y1={-330} x2={0} y2={-212} stroke={topD} strokeWidth={4} />{[-300, -270, -240].map((yy) => <circle key={yy} cx={8} cy={yy} r={4} fill={topD} />)}
          </g>}
          {look.outfit === "suit" && <g>
            <path d="M -22 -374 L 22 -374 L 0 -318 Z" fill="#F7F8FB" />
            <path d="M -6 -366 L 6 -366 L 9 -310 L 0 -296 L -9 -310 Z" fill={look.under ?? "#D7434F"} />
            <path d="M -22 -374 L 0 -318 L -30 -338 Z M 22 -374 L 0 -318 L 30 -338 Z" fill={topD} />
            <path d="M 34 -320 l 14 0" stroke="#F7F8FB" strokeWidth={5} strokeLinecap="round" />
          </g>}
          {look.outfit === "blouse" && <g>
            <path d="M -24 -374 L 0 -340 L 24 -374 Z" fill={look.skin} />
            <path d="M -24 -374 L 0 -340 L 24 -374" stroke={topD} strokeWidth={7} fill="none" strokeLinejoin="round" />
          </g>}
          {look.outfit === "apron" && <g>
            <path d="M -34 -346 L 34 -346 L 48 -212 L -48 -212 Z" fill={look.under ?? "#3D4A66"} />
            <path d="M -34 -346 L -20 -374 M 34 -346 L 20 -374" stroke={look.under ?? "#3D4A66"} strokeWidth={7} />
            <rect x={-22} y={-300} width={44} height={30} rx={6} fill="#000" opacity={0.15} />
          </g>}
          <ellipse cx={0} cy={-370} rx={30} ry={9} fill="#1A1030" opacity={0.18} />
        </g>
        <Arm A={AL} held={holdL} />
        <Arm A={AR} held={hold} />
        <g transform={`translate(0 ${-452 - breathe * 1.6}) rotate(${p.head}) scale(${flip ? -1 : 1} 1)`}>
          <Head look={look} mood={mood} t={t} turn={(flip ? -1 : 1) * p.turn} lookX={(flip ? -1 : 1) * lookX} lookY={lookY} lip={lip} talk={talk} lightDir={lightDir} seed={seed} tear={tear} sweat={sweat} blink={blink} />
        </g>
      </g>
    </g>
  );
  return (
    <g>
      {shadow && <GroundShadow x={x} y={y + 4} rx={120 * s} o={0.34} />}
      <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s * (look.tall ?? 1)})`}>
        {cut !== undefined ? <g><clipPath id={`c${id}`}><rect x={-400} y={-900} width={800} height={900 + cut} /></clipPath><g clipPath={`url(#c${id})`}>{body}</g></g> : body}
        {rim && <g style={{ mixBlendMode: "screen" }} opacity={0.5}><path d={`M ${ld * -70} -340 C ${ld * -72} -366 ${ld * -44} -372 ${ld * -30} -373`} stroke={rim} strokeWidth={6} fill="none" strokeLinecap="round" transform={`translate(0 ${p.y})`} /></g>}
      </g>
    </g>
  );
};

// ---------- the cast ----------
const base = { pants: "#2E3550", shoes: "#2A2D3C", iris: "#6B4A2E" };
export const YOU: Look = { ...base, skin: "#F0BE9C", hair: "#3A2A24", hairStyle: "messy", top: "#2FA39B", outfit: "hoodie", iris: "#4E7A4A" };
export const THEO: Look = { ...base, skin: "#C98B62", hair: "#2A1D17", hairStyle: "curly", top: "#F08A3C", outfit: "jacket", under: "#FFE7C2", glasses: true, tall: 1.05, pants: "#3B4A3F" };
export const AVA: Look = { ...base, skin: "#E2A27A", hair: "#7B2F1C", hairStyle: "long", top: "#7C5CD6", outfit: "jacket", under: "#F6E7FF", lashes: true, iris: "#3F8F86", freckles: true, pants: "#2B2F45", shoes: "#F2F4F8" };
export const MOM: Look = { ...base, skin: "#F0BE9C", hair: "#5B3524", hairStyle: "bob", top: "#D8607A", outfit: "blouse", lashes: true, tall: 1.06, pants: "#3A4868" };
export const HOST: Look = { ...base, skin: "#B9774F", hair: "#17131A", hairStyle: "slick", top: "#20264A", outfit: "suit", under: "#F2B640", tall: 1.08, pants: "#20264A", shoes: "#15161F" };
export const OWNER: Look = { ...base, skin: "#E9B694", hair: "#8C8F99", hairStyle: "bald", beard: "#8C8F99", top: "#7A8C6B", outfit: "apron", under: "#3D4A66", tall: 1.04, glasses: true };
export const TEACHER: Look = { ...base, skin: "#8A5A40", hair: "#1D1614", hairStyle: "pony", top: "#3F7FB8", outfit: "coat", under: "#F2F4F8", lashes: true, tall: 1.06, glasses: true };
export const PRINCIPAL: Look = { ...base, skin: "#EBC0A4", hair: "#6D6F78", hairStyle: "bald", top: "#5A5F6E", outfit: "suit", under: "#3FA66B", tall: 1.07 };
export const extra = (i: number): Look => {
  const tops = ["#5E78C9", "#D9607A", "#5FA86A", "#9A76CC", "#E0A53C", "#4BA7B8", "#C96A4A"];
  const skins = ["#F0BE9C", "#C98B62", "#8A5A40", "#E2A27A", "#F6D2B4"];
  const hairs = ["#2A1D17", "#3A2A24", "#B8863C", "#17131A", "#7B2F1C", "#5B3524"];
  const styles: HairStyle[] = ["messy", "long", "curly", "bob", "buzz", "pony", "slick"];
  const outfits: Outfit[] = ["tee", "hoodie", "jacket", "tee", "hoodie"];
  return { ...base, skin: skins[i % 5], hair: hairs[(i * 5 + 1) % 6], hairStyle: styles[(i * 3 + 2) % 7], top: tops[i % 7], outfit: outfits[i % 5], under: "#F2F4F8", lashes: [1, 3, 5].includes((i * 3 + 2) % 7), pants: ["#2E3550", "#3B3F4F", "#4A3F3A"][i % 3], iris: ["#6B4A2E", "#3F6F8F", "#4E7A4A"][i % 3] };
};

// ---------- on-screen text ----------
// Word-by-word captions: the line is split into short chunks, the spoken word is highlighted.
// shortcut: word times are spread by letter count across the line (no forced alignment); upgrade if words drift on long lines.
export const Captions: React.FC<{ t: number; lines: { who: string; text: string; start: number; end: number }[]; colors: Record<string, string>; y?: number }> = ({ t, lines, colors, y = 880 }) => {
  const line = lines.find((l) => t >= l.start - 0.05 && t <= l.end + 0.12);
  if (!line) return null;
  const words = line.text.split(" ");
  const total = words.reduce((s, w) => s + w.length + 1.5, 0);
  let acc = 0;
  const times = words.map((w) => { const a = line.start + ((line.end - line.start) * acc) / total; acc += w.length + 1.5; return a; });
  let cur = 0;
  for (let i = 0; i < words.length; i++) if (t >= times[i]) cur = i;
  // chunks of up to 5 words, broken after punctuation when possible
  const chunks: number[][] = [[]];
  words.forEach((w, i) => {
    const c = chunks[chunks.length - 1];
    c.push(i);
    if (i < words.length - 1 && (c.length >= 5 || (c.length >= 3 && /[.,?!:]$/.test(w)))) chunks.push([]);
  });
  const chunk = chunks.find((c) => c.includes(cur)) ?? chunks[0];
  const color = colors[line.who] ?? "#FFFFFF";
  return (
    <div style={{ position: "absolute", left: 120, right: 120, top: y, textAlign: "center", fontFamily: font, fontWeight: 900, fontSize: 68, lineHeight: 1.1, letterSpacing: -0.5 }}>
      {chunk.map((i) => {
        const on = i === cur, k = on ? pop(t, times[i]) : 1;
        return (
          <span key={i} style={{ display: "inline-block", margin: "0 0.14em", color: on ? "#FFE14A" : i < cur ? color : "rgba(255,255,255,0.92)", transform: `scale(${on ? 0.9 + 0.2 * k : 1}) translateY(${on ? -4 * k : 0}px)`,
            WebkitTextStroke: "14px #0B0E1A", paintOrder: "stroke fill", textShadow: "0 8px 0 #0B0E1A, 0 0 30px rgba(0,0,0,0.6)" }}>{words[i]}</span>
        );
      })}
    </div>
  );
};

// a pill label that pops in (world space, inside a Layer)
export const Tag: React.FC<{ t: number; at: number; until?: number; x: number; y: number; text: string; bg?: string; fg?: string; size?: number; rot?: number }> = ({ t, at, until = 1e9, x, y, text, bg = "#FFE14A", fg = "#0B0E1A", size = 44, rot = -2 }) => {
  if (t < at || t > until) return null;
  const k = pop(t, at), w = text.length * size * 0.6 + size * 1.2;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${k})`}>
      <rect x={-w / 2 + 5} y={-size * 0.8 + 7} width={w} height={size * 1.6} rx={size * 0.5} fill="#0B0E1A" opacity={0.45} />
      <rect x={-w / 2} y={-size * 0.8} width={w} height={size * 1.6} rx={size * 0.5} fill={bg} stroke="#0B0E1A" strokeWidth={5} />
      <text x={0} y={size * 0.34} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={size} fill={fg}>{text}</text>
    </g>
  );
};
// huge kinetic words (screen space)
export const Slam: React.FC<{ t: number; at: number; until?: number; text: string; color?: string; size?: number; y?: number; x?: number; rot?: number }> = ({ t, at, until = 1e9, text, color = "#FFFFFF", size = 200, y = 120, x = 0, rot = -3 }) => {
  if (t < at || t > until) return null;
  const k = pop(t, at), out = ease(t, until - 0.15, until);
  return (
    <div style={{ position: "absolute", left: x, right: -x, top: y, textAlign: "center", fontFamily: font, fontWeight: 900, fontSize: size, lineHeight: 0.95, color, letterSpacing: -4,
      transform: `rotate(${rot}deg) scale(${(2.2 - 1.2 * Math.min(1, k)) * (1 - out * 0.3)})`, opacity: Math.min(1, k * 1.5) * (1 - out), WebkitTextStroke: `${size * 0.12}px #0B0E1A`, paintOrder: "stroke fill", textShadow: `0 ${size * 0.06}px 0 #0B0E1A` }}>{text}</div>
  );
};
