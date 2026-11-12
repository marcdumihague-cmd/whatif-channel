// Soft-flat kit: no outlines, muted colours, glows, ambient motion. See youtube/motion.md.
import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const P = {
  ink: "#1F2433", night: "#1E2638", nightHi: "#2C3852", dusk: "#3A4766", beige: "#EADFD2", beigeHi: "#F4ECE2",
  peach: "#F2D2BD", wood: "#B98A63", woodDark: "#8E6646", cream: "#FBF6EF", white: "#FFFFFF",
  teal: "#3E9C97", tealDark: "#2F7C78", orange: "#E9894E", orangeDark: "#C96E37", gold: "#F2B640",
  red: "#E25C5C", green: "#4DBE8A", sky: "#A8CFE0", grey: "#9AA3B5", lilac: "#B9A7D6",
  skin: "#EBB896", skin2: "#C98E6A", skin3: "#8D5B42", hair: "#2E2522",
};

// ---------- time helpers ----------
export const useT = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return { t: frame / fps, frame, fps };
};
export const ease = (t: number, a: number, b: number, from = 0, to = 1) =>
  interpolate(t, [a, b], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
export const pop = (t: number, at: number, fps = 30) =>
  t < at ? 0 : spring({ frame: (t - at) * fps, fps, config: { damping: 12, stiffness: 170 } });
export const wobble = (t: number, speed = 1, amt = 1) => Math.sin(t * speed * 2.1) * amt;

// ---------- camera ----------
// Slow push-in over the shot, optional punch-ins (time -> extra zoom) and a focus point.
export const Camera: React.FC<{
  t: number; t0: number; t1: number; from?: number; to?: number; fx?: number; fy?: number;
  punch?: number[]; shake?: number[]; children: React.ReactNode;
}> = ({ t, t0, t1, from = 1, to = 1.07, fx = 960, fy = 540, punch = [], shake = [], children }) => {
  let z = interpolate(t, [t0, Math.max(t1, t0 + 0.1)], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  for (const p of punch) z += 0.12 * pop(t, p) * Math.exp(-Math.max(0, t - p - 0.6) * 1.5);
  let sx = 0, sy = 0;
  for (const s of shake) if (t > s && t < s + 0.5) { const k = 1 - (t - s) / 0.5; sx += Math.sin(t * 95) * 14 * k; sy += Math.cos(t * 80) * 8 * k; }
  return (
    <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px) scale(${z})`, transformOrigin: `${fx}px ${fy}px` }}>
      {children}
    </AbsoluteFill>
  );
};

// ---------- ambient layers (inside an <svg viewBox="0 0 1920 1080">) ----------
const rnd = (i: number) => { const x = Math.sin(i * 127.1) * 43758.5453; return x - Math.floor(x); };

export const Rain: React.FC<{ t: number; x?: number; y?: number; w?: number; h?: number; n?: number; color?: string; speed?: number }> =
  ({ t, x = 0, y = 0, w = 1920, h = 1080, n = 70, color = "#C8D6F0", speed = 1 }) => (
    <g opacity={0.45}>
      {Array.from({ length: n }, (_, i) => {
        const yy = y + ((rnd(i) * h + t * 900 * speed * (0.7 + rnd(i + 9) * 0.6)) % h);
        const xx = x + rnd(i + 3) * w;
        return <line key={i} x1={xx} y1={yy} x2={xx - 6} y2={yy + 26} stroke={color} strokeWidth={2.5} strokeLinecap="round" />;
      })}
    </g>
  );

export const Bokeh: React.FC<{ t: number; n?: number; color?: string; opacity?: number }> = ({ t, n = 18, color = "#FFFFFF", opacity = 0.25 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const r = 8 + rnd(i) * 26;
      const cx = (rnd(i + 1) * 1920 + t * (8 + rnd(i + 2) * 14)) % 1960 - 20;
      const cy = rnd(i + 4) * 1080 + Math.sin(t * 0.5 + i) * 18;
      return <circle key={i} cx={cx} cy={cy} r={r} fill={color} opacity={opacity * (0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 0.8 + i * 1.7)))} />;
    })}
  </g>
);

export const Glow: React.FC<{ cx: number; cy: number; r: number; color: string; opacity?: number; id: string }> = ({ cx, cy, r, color, opacity = 0.5, id }) => (
  <g>
    <defs>
      <radialGradient id={id}>
        <stop offset="0%" stopColor={color} stopOpacity={opacity} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </radialGradient>
    </defs>
    <circle cx={cx} cy={cy} r={r} fill={`url(#${id})`} />
  </g>
);

// Full-screen soft background: flat colour with a radial light and vignette.
export const Backdrop: React.FC<{ base: string; light: string; cx?: number; cy?: number; children?: React.ReactNode }> = ({ base, light, cx = 50, cy = 45, children }) => (
  <AbsoluteFill style={{ background: `radial-gradient(circle at ${cx}% ${cy}%, ${light} 0%, ${base} 70%)` }}>
    <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>{children}</svg>
  </AbsoluteFill>
);

export const Shadow: React.FC<{ cx: number; cy: number; rx: number; o?: number }> = ({ cx, cy, rx, o = 0.16 }) => (
  <ellipse cx={cx} cy={cy} rx={rx} ry={rx * 0.14} fill="#000" opacity={o} />
);

// ---------- characters ----------
export type Mood = "neutral" | "smug" | "shocked" | "happy" | "sad" | "nervous" | "deadpan" | "sleepy" | "angry";
export type Look = { skin: string; hair: string; top: string; topDark: string; hairStyle?: "short" | "curly" | "bun" | "bald" | "long" | "wild"; glasses?: boolean; tall?: number; mustache?: string;
  acc?: Acc[] };
export type Acc = "pilot" | "helmet" | "headphones" | "beret" | "mailcap" | "hairnet" | "bowtie" | "tutu" | "sequins" | "partyhat";
export const YOU: Look = { skin: P.skin, hair: P.hair, top: P.teal, topDark: P.tealDark, hairStyle: "short" };
export const THEO: Look = { skin: P.skin2, hair: "#3B2B20", top: P.orange, topDark: P.orangeDark, hairStyle: "curly", glasses: true, tall: 1.06 };
export const extra = (i: number): Look => {
  const tops = [["#7D8BB8", "#66739E"], ["#C66B7A", "#A85563"], ["#6FA36B", "#588A55"], ["#8E7BB8", "#7564A0"], ["#C9A14A", "#AA8638"]];
  const skins = [P.skin, P.skin2, P.skin3];
  const styles: Look["hairStyle"][] = ["short", "bun", "bald", "long", "curly"];
  return { skin: skins[i % 3], hair: i % 4 === 2 ? "#6B6B6B" : P.hair, top: tops[i % 5][0], topDark: tops[i % 5][1], hairStyle: styles[i % 5] };
};

// Eyes, lids and brows per mood: lid = how much of the eye is covered (0 open .. 1 closed).
const FACE: Record<Mood, { lid: number; brow: number; tilt: number; eye: number; mouth: string }> = {
  neutral: { lid: 0.15, brow: 0, tilt: 0, eye: 1, mouth: "flat" },
  smug: { lid: 0.55, brow: -2, tilt: 10, eye: 1, mouth: "smirk" },
  shocked: { lid: 0, brow: -14, tilt: 0, eye: 1.35, mouth: "o" },
  happy: { lid: 0.25, brow: -6, tilt: 0, eye: 1, mouth: "smile" },
  sad: { lid: 0.4, brow: -4, tilt: -16, eye: 1, mouth: "frown" },
  nervous: { lid: 0.1, brow: -8, tilt: -10, eye: 1.1, mouth: "wobble" },
  deadpan: { lid: 0.6, brow: 2, tilt: 0, eye: 1, mouth: "flat" },
  sleepy: { lid: 1, brow: 3, tilt: 0, eye: 1, mouth: "flat" },
  angry: { lid: 0.3, brow: 6, tilt: 18, eye: 1, mouth: "frown" },
};

export type Lip = { o: number; v: string }; // o: 0..1 open, v: X M F O E A (see tts/lipsync.py)

// A mouth shape for the sound being spoken; the opening follows the voice's loudness.
const Viseme: React.FC<{ lip: Lip; color: string }> = ({ lip, color }) => {
  const o = lip.o;
  switch (lip.v) {
    case "M": return <path d="M -15 35 Q 0 39 15 35" stroke={color} strokeWidth={7} fill="none" strokeLinecap="round" />;
    case "F": return <g><ellipse cx={0} cy={36} rx={13} ry={3 + o * 6} fill={color} /><rect x={-11} y={30} width={22} height={6} rx={2} fill={P.white} /></g>;
    case "O": return <g><ellipse cx={0} cy={36} rx={8 + o * 3} ry={6 + o * 9} fill={color} /><ellipse cx={0} cy={36 + (6 + o * 9) * 0.45} rx={5} ry={2.5 + o * 2} fill="#C2555E" /></g>;
    case "E": return <g><ellipse cx={0} cy={35} rx={18} ry={2.5 + o * 8} fill={color} />{o > 0.3 && <rect x={-13} y={33 - (2.5 + o * 8)} width={26} height={4} rx={2} fill={P.white} />}</g>;
    default: return <g><ellipse cx={0} cy={36} rx={14} ry={3 + o * 13} fill={color} />{o > 0.35 && <rect x={-10} y={36 - (3 + o * 13)} width={20} height={4.5} rx={2} fill={P.white} />}<ellipse cx={0} cy={36 + (3 + o * 13) * 0.55} rx={7} ry={2 + o * 3} fill="#C2555E" /></g>;
  }
};

const Mouth: React.FC<{ kind: string; talk: number; color: string; lip?: Lip }> = ({ kind, talk, color, lip }) => {
  if (lip && lip.v !== "X") return <Viseme lip={lip} color={color} />;
  if (!lip && talk > 0.05) return <ellipse cx={0} cy={34} rx={13} ry={4 + talk * 11} fill={color} />;
  switch (kind) {
    case "smile": return <path d="M -18 30 Q 0 46 18 30" stroke={color} strokeWidth={6} fill="none" strokeLinecap="round" />;
    case "smirk": return <path d="M -14 36 Q 6 40 18 28" stroke={color} strokeWidth={6} fill="none" strokeLinecap="round" />;
    case "o": return <ellipse cx={0} cy={36} rx={10} ry={14} fill={color} />;
    case "frown": return <path d="M -16 40 Q 0 28 16 40" stroke={color} strokeWidth={6} fill="none" strokeLinecap="round" />;
    case "wobble": return <path d="M -20 36 q 5 -6 10 0 q 5 6 10 0 q 5 -6 10 0 q 5 6 10 0" stroke={color} strokeWidth={5} fill="none" strokeLinecap="round" />;
    default: return <line x1={-14} y1={36} x2={14} y2={36} stroke={color} strokeWidth={6} strokeLinecap="round" />;
  }
};

const Hair: React.FC<{ style: Look["hairStyle"]; color: string }> = ({ style, color }) => {
  switch (style) {
    case "curly":
      return <g fill={color}>{[-52, -26, 0, 26, 52].map((x, i) => <circle key={x} cx={x} cy={-58 + (i % 2) * 8} r={30} />)}<circle cx={-66} cy={-24} r={20} /><circle cx={66} cy={-24} r={20} /></g>;
    case "bun":
      return <g fill={color}><path d="M -72 -6 Q -76 -78 0 -80 Q 76 -78 72 -6 Q 50 -46 0 -46 Q -50 -46 -72 -6 Z" /><circle cx={0} cy={-92} r={26} /></g>;
    case "long":
      return <path d="M -74 70 Q -90 -80 0 -82 Q 90 -80 74 70 L 54 70 Q 62 -20 30 -40 Q 0 -30 -30 -40 Q -62 -20 -54 70 Z" fill={color} />;
    case "bald":
      return <g fill={color}><ellipse cx={-62} cy={-18} rx={14} ry={26} /><ellipse cx={62} cy={-18} rx={14} ry={26} /></g>;
    case "wild":
      return <g fill={color}>{[-80, -55, -28, 0, 28, 55, 80].map((x, i) => <circle key={x} cx={x} cy={-54 + Math.abs(x) * 0.35 + (i % 2) * 10} r={30 + (i % 3) * 6} />)}<circle cx={-86} cy={0} r={24} /><circle cx={86} cy={0} r={24} /></g>;
    default:
      return <path d="M -72 -10 Q -78 -80 -10 -82 Q 70 -86 74 -12 Q 52 -44 18 -40 Q -20 -56 -40 -34 Q -58 -40 -72 -10 Z" fill={color} />;
  }
};

export const Head: React.FC<{ look: Look; mood: Mood; t: number; talk?: boolean; lookX?: number; lip?: Lip; wink?: boolean }> = ({ look, mood, t, talk = false, lookX = 0, lip, wink = false }) => {
  const f = FACE[mood];
  const blink = mood !== "sleepy" && (t % 3.1 < 0.11 || (t + 1.3) % 7.3 < 0.1);
  const lid = blink ? 1 : f.lid;
  const flap = talk ? Math.max(0, Math.sin(t * 22) * 0.5 + Math.sin(t * 13.7) * 0.5) : 0;
  const eyeR = 12 * f.eye;
  const Eye = ({ x, side }: { x: number; side: number }) => (
    <g transform={`translate(${x} -6)`}>
      <ellipse rx={eyeR} ry={eyeR * 1.25} fill={P.white} />
      <circle cx={lookX * 5} cy={2} r={eyeR * 0.62} fill={P.ink} />
      <circle cx={lookX * 5 - 3} cy={-2} r={2.5} fill={P.white} />
      {/* eyelid: skin rectangle sliding down, tilted with the mood */}
      <rect x={-eyeR - 3} y={-eyeR * 1.25 - 4} width={eyeR * 2 + 6} height={(eyeR * 2.5 + 8) * (wink && side === 1 ? 1 : lid)} fill={look.skin}
        transform={`rotate(${f.tilt * side})`} />
      <rect x={-16} y={-eyeR * 1.25 - 18 + f.brow} width={32} height={7} rx={3.5} fill={look.hair === "#6B6B6B" ? "#555" : look.hair}
        transform={`rotate(${f.tilt * side} 0 ${-eyeR * 1.25 - 14})`} />
    </g>
  );
  return (
    <g>
      <ellipse cx={-68} cy={6} rx={12} ry={17} fill={look.skin} />
      <ellipse cx={68} cy={6} rx={12} ry={17} fill={look.skin} />
      <circle r={72} fill={look.skin} />
      <path d="M 30 -60 A 72 72 0 0 1 30 62 A 80 80 0 0 0 30 -60 Z" fill="#000" opacity={0.06} />
      <Hair style={look.hairStyle} color={look.hair} />
      {look.acc?.includes("hairnet") && <path d="M -74 -14 Q -76 -84 0 -86 Q 76 -84 74 -14 Z" fill="#FFFFFF" opacity={0.35} stroke="#FFFFFF" strokeWidth={2} strokeDasharray="4 6" />}
      {look.acc?.includes("pilot") && <g><path d="M -78 -40 Q -70 -98 0 -102 Q 70 -98 78 -40 Z" fill="#1F2A4A" /><rect x={-86} y={-46} width={172} height={16} rx={8} fill="#141B33" /><path d="M -22 -74 l 22 -10 l 22 10 l -22 8 Z" fill={P.gold} /></g>}
      {look.acc?.includes("mailcap") && <g><path d="M -74 -38 Q -68 -96 0 -98 Q 68 -96 74 -38 Z" fill="#3B5BA9" /><path d="M -10 -40 Q 60 -44 100 -30 Q 60 -26 -10 -30 Z" fill="#2E4785" /></g>}
      {look.acc?.includes("beret") && <g transform="rotate(-14)"><ellipse cx={-6} cy={-70} rx={78} ry={26} fill="#C2384A" /><circle cx={-6} cy={-96} r={8} fill="#C2384A" /></g>}
      {look.acc?.includes("partyhat") && <g><path d="M -10 -70 L 22 -170 L 54 -70 Z" fill="#5BD3D0" /><circle cx={22} cy={-172} r={10} fill={P.gold} /></g>}
      {look.acc?.includes("headphones") && <g fill="none" stroke="#2B2B36" strokeWidth={12}><path d="M -76 0 Q -80 -96 0 -98 Q 80 -96 76 0" /></g>}
      {look.acc?.includes("headphones") && <g fill="#2B2B36"><rect x={-96} y={-18} width={30} height={46} rx={12} /><rect x={66} y={-18} width={30} height={46} rx={12} /></g>}
      <Eye x={-26} side={-1} />
      <Eye x={26} side={1} />
      {look.glasses && (
        <g fill="none" stroke={P.ink} strokeWidth={4} opacity={0.85}>
          <circle cx={-26} cy={-6} r={22} /><circle cx={26} cy={-6} r={22} /><line x1={-4} y1={-8} x2={4} y2={-8} />
        </g>
      )}
      <ellipse cx={-44} cy={20} rx={11} ry={6} fill="#E8846F" opacity={0.35} />
      <ellipse cx={44} cy={20} rx={11} ry={6} fill="#E8846F" opacity={0.35} />
      <Mouth kind={f.mouth} talk={flap} color={P.ink} lip={lip} />
      {look.mustache && <path d="M -34 28 Q -16 14 0 22 Q 16 14 34 28 Q 18 34 0 28 Q -18 34 -34 28 Z" fill={look.mustache} />}
      {look.acc?.includes("helmet") && <g><path d="M -86 20 Q -92 -96 0 -98 Q 92 -96 86 20 L 60 20 Q 60 -30 0 -32 Q -60 -30 -60 20 Z" fill="#E2463E" /><path d="M -60 -30 Q 0 -44 60 -30" stroke={P.white} strokeWidth={8} fill="none" /></g>}
    </g>
  );
};

export type Pose = "stand" | "wave" | "phone" | "point" | "shrug" | "cheer" | "hold" | "sit";
// A person standing on (x, y) = feet. scale 1 is about 470 px tall.
export const Person: React.FC<{
  x: number; y: number; look: Look; mood: Mood; t: number; s?: number; talk?: boolean; pose?: Pose;
  flip?: boolean; lookX?: number; holding?: React.ReactNode; sweat?: boolean;
  lip?: Lip; wink?: boolean; noLegs?: boolean;
}> = ({ x, y, look, mood, t, s = 1, talk = false, pose = "stand", flip = false, lookX = 0, holding, sweat = false, lip, wink, noLegs = false }) => {
  const tall = look.tall ?? 1;
  const breathe = Math.sin(t * 2.4 + x) * 3;
  const bob = talk ? Math.sin(t * 9) * 2 : 0;
  const armL = { stand: -6, wave: -150, phone: -6, point: -6, shrug: -60, cheer: -160, hold: -6, sit: -20 }[pose];
  const armR = { stand: 6, wave: 6, phone: 200 + Math.sin(t * 3) * 2, point: 85, shrug: 60, cheer: 160, hold: 40, sit: 20 }[pose];
  const legs = pose !== "sit" && !noLegs;
  const Arm = ({ side, deg }: { side: number; deg: number }) => (
    <g transform={`translate(${side * 62} -250) rotate(${deg})`}>
      <rect x={-17} y={0} width={34} height={150} rx={17} fill={look.topDark} />
      <circle cx={0} cy={150} r={20} fill={look.skin} />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s * tall})`}>
      <Shadow cx={0} cy={0} rx={95} />
      {legs && (
        <g fill={P.ink} opacity={0.9}>
          <rect x={-44} y={-120} width={36} height={120} rx={16} />
          <rect x={8} y={-120} width={36} height={120} rx={16} />
        </g>
      )}
      {legs && <g>{[-26, 26].map((sx) => <g key={sx}><ellipse cx={sx + 6} cy={-8} rx={30} ry={14} fill="#2B2B36" /><rect x={sx - 22} y={-6} width={56} height={6} rx={3} fill="#E4E9F0" /></g>)}</g>}
      <g transform={`translate(0 ${breathe * 0.3 + bob})`}>
        <Arm side={-1} deg={armL} />
        <rect x={-75} y={-280 + breathe * 0.2} width={150} height={175} rx={58} fill={look.top} />
        <path d={`M -34 ${-276 + breathe * 0.2} Q 0 ${-238 + breathe * 0.2} 34 ${-276 + breathe * 0.2}`} stroke={look.topDark} strokeWidth={10} fill="none" strokeLinecap="round" />
        <rect x={20} y={-270} width={45} height={150} rx={22} fill={look.topDark} opacity={0.35} />
        {look.acc?.includes("sequins") && Array.from({ length: 18 }, (_, i) => <circle key={i} cx={-55 + (i * 37) % 110} cy={-265 + (i * 53) % 150} r={5} fill={P.white} opacity={0.5 + 0.5 * Math.sin(t * 9 + i * 1.3)} />)}
        {look.acc?.includes("bowtie") && <g fill="#1A1A22"><path d="M 0 -262 L -30 -278 L -30 -246 Z" /><path d="M 0 -262 L 30 -278 L 30 -246 Z" /><circle cy={-262} r={8} /></g>}
        {look.acc?.includes("tutu") && <path d="M -110 -120 Q 0 -150 110 -120 Q 90 -80 60 -95 Q 30 -70 0 -92 Q -30 -70 -60 -95 Q -90 -80 -110 -120 Z" fill="#F4A6C8" />}
        <Arm side={1} deg={armR} />
        <g transform={`translate(0 ${-355 + breathe * 0.5}) scale(${flip ? -1 : 1} 1)`}>
          <Head look={look} mood={mood} t={t} talk={talk} lookX={flip ? -lookX : lookX} lip={lip} wink={wink} />
          {sweat && <path d="M 84 -40 q 12 22 0 32 q -12 -10 0 -32 Z" fill="#8FD3FF" opacity={0.6 + Math.sin(t * 4) * 0.3} />}
        </g>
        {holding && <g transform={`translate(${62 + Math.sin((armR * Math.PI) / 180) * -150} ${-250 + Math.cos((armR * Math.PI) / 180) * 150})`}>{holding}</g>}
      </g>
    </g>
  );
};

// ---------- pop-ups ----------
export const Chip: React.FC<{ t: number; at: number; text: string; x?: number; y?: number }> = ({ t, at, text, x = 60, y = 50 }) => {
  const p = pop(t, at);
  if (p <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translateX(${(1 - p) * -40}px)`, opacity: Math.min(1, p),
      background: "rgba(25,30,45,0.85)", color: "#fff", borderRadius: 40, padding: "12px 30px 12px 26px", fontFamily: "'Inter Display', Inter, sans-serif",
      fontWeight: 900, fontSize: 34, letterSpacing: 2, display: "flex", alignItems: "center", gap: 14 }}>
      <span style={{ width: 14, height: 14, borderRadius: 7, background: "#5BD3D0", display: "inline-block" }} />{text}
    </div>
  );
};

export const Counter: React.FC<{ label: string; value: string; x: number; y: number; color?: string; bump?: number }> = ({ label, value, x, y, color = "#FF6B6B", bump = 0 }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `scale(${1 + bump * 0.18})`, transformOrigin: "right top",
    background: "rgba(25,30,45,0.85)", borderRadius: 22, padding: "10px 24px", fontFamily: "'Inter Display', Inter, sans-serif", textAlign: "right" }}>
    <div style={{ color: "#AEB6CC", fontSize: 20, fontWeight: 800, letterSpacing: 3 }}>{label}</div>
    <div style={{ color, fontSize: 46, fontWeight: 900, fontVariantNumeric: "tabular-nums" }}>{value}</div>
  </div>
);

// A thought/memory bubble: a circle with a mini scene inside, trailing dots from (fromX, fromY).
export const Bubble: React.FC<{ t: number; at: number; until?: number; cx: number; cy: number; r: number; fromX?: number; fromY?: number; bg?: string; id: string; children?: React.ReactNode }> =
  ({ t, at, until = 1e9, cx, cy, r, fromX, fromY, bg = P.night, id, children }) => {
    const p = pop(t, at) * (1 - ease(t, until, until + 0.3));
    if (p <= 0.001) return null;
    const dots = fromX !== undefined && fromY !== undefined ? [0.25, 0.5, 0.75].map((k, i) => ({
      x: fromX + (cx - fromX) * k, y: fromY + (cy - fromY) * k, r: 8 + i * 5, d: i * 0.08 })) : [];
    return (
      <g>
        {dots.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={d.r * pop(t, at + d.d)} fill={P.cream} opacity={0.9} />)}
        <g transform={`translate(${cx} ${cy}) scale(${p})`}>
          <circle r={r + 10} fill={P.cream} opacity={0.95} />
          <clipPath id={id}><circle r={r} /></clipPath>
          <g clipPath={`url(#${id})`}>
            <circle r={r} fill={bg} />
            <g transform={`translate(${-r} ${-r})`}>{children}</g>
          </g>
        </g>
      </g>
    );
  };

// A white card that springs in with a title and big stat.
export const StatCard: React.FC<{ t: number; at: number; until?: number; x: number; y: number; w: number; title: string; big: string; sub?: string; color?: string }> =
  ({ t, at, until = 1e9, x, y, w, title, big, sub, color = P.orange }) => {
    const p = pop(t, at) * (1 - ease(t, until, until + 0.3));
    if (p <= 0.001) return null;
    return (
      <div style={{ position: "absolute", left: x, top: y, width: w, transform: `translateY(${(1 - p) * 60}px) scale(${0.8 + 0.2 * p})`, opacity: Math.min(1, p),
        background: P.cream, borderRadius: 28, padding: "28px 36px", boxShadow: "0 18px 40px rgba(0,0,0,0.25)", fontFamily: "'Inter Display', Inter, sans-serif" }}>
        <div style={{ color: "#7C8296", fontSize: 26, fontWeight: 800, letterSpacing: 3 }}>{title}</div>
        <div style={{ color, fontSize: 110, fontWeight: 900, lineHeight: 1.05 }}>{big}</div>
        {sub && <div style={{ color: P.ink, fontSize: 30, fontWeight: 700 }}>{sub}</div>}
      </div>
    );
  };

export const Title: React.FC<{ t: number; at: number; words: string[]; accent: string[]; size?: number; y?: number }> = ({ t, at, words, accent, size = 96, y = 0 }) => (
  <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "center", alignItems: "center", alignContent: "center", flexWrap: "wrap", padding: "0 180px", transform: `translateY(${y}px)`,
    fontFamily: "'Inter Display', Inter, sans-serif", fontWeight: 900, fontSize: size, lineHeight: 1.15, textAlign: "center", textTransform: "uppercase" }}>
    {words.map((w, i) => {
      const p = pop(t, at + i * 0.07);
      return <span key={i} style={{ display: "inline-block", margin: "0 0.18em", opacity: Math.min(1, p), transform: `translateY(${(1 - p) * 30}px)`,
        color: accent.includes(w.replace(/[^\w$,]/g, "")) ? P.gold : P.white }}>{w}</span>;
    })}
  </div>
);

// Dotted line that ripples (title cards).
export const DotLine: React.FC<{ t: number; y: number; level?: number }> = ({ t, y, level = 1 }) => (
  <g>
    {Array.from({ length: 48 }, (_, i) => (
      <circle key={i} cx={20 + i * 39.6} cy={y + Math.sin(t * 4 + i * 0.45) * 8 * level} r={5} fill="#5BD3D0" opacity={0.55 + 0.35 * Math.sin(t * 3 + i)} />
    ))}
  </g>
);
