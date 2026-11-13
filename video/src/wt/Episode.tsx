// "What If You Could Do Everything You've Ever Watched on YouTube?" Shots are keyed by each line's
// `scene` and timed from public/watched/timeline.json; mouths follow public/watched/lips.json.
// Visual motif: a red progress bar over your head that fills while you use a skill and stops where
// you stopped watching. No platform logos are drawn: generic "watch history" UI only.
import React from "react";
import { AbsoluteFill, Audio, interpolate, staticFile } from "remotion";
import timeline from "../../public/watched/timeline.json";
import lips from "../../public/watched/lips.json";
import { P, useT, ease, pop, Camera, Bokeh, Glow, Backdrop, Shadow, Person, Head, YOU, THEO, extra, Chip, Counter, StatCard, Title, DotLine, Bubble, Mood, Look, Lip } from "../ll/kit";
import { Cessna, Label } from "../dr/Episode";

type Line = (typeof timeline.lines)[number] & { caption?: string };
const L: Line[] = timeline.lines as Line[];
export const DURATION = timeline.duration;
const S = (i: number) => L[i].start;
const E = (i: number) => L[i].end;
const D = (i: number) => E(i) - S(i);
const font = "'Inter Display', Inter, sans-serif";
const first = (scene: string) => L.findIndex((l) => l.scene === scene);
const at = (scene: string, k: number) => first(scene) + k;

const SHOTS: { name: string; a: number; b: number }[] = [];
L.forEach((l, i) => {
  const last = SHOTS[SHOTS.length - 1];
  if (last && last.name === l.scene) last.b = i; else SHOTS.push({ name: l.scene, a: i, b: i });
});
const shotStart = (k: number) => (k === 0 ? 0 : (E(SHOTS[k - 1].b) + S(SHOTS[k].a)) / 2);
const speaking = (t: number, who: string) => L.some((l) => l.who === who && t >= l.start && t <= l.end);
const say = (t: number, who: string): { talk: boolean; lip?: Lip } => {
  const on = speaking(t, who);
  const f = Math.round(t * 30);
  if (!on || !lips.shape[f]) return { talk: on };
  return { talk: on, lip: { o: Number(lips.open[f]) / 9, v: lips.shape[f] } };
};
type ShotProps = { t: number; t0: number; t1: number };
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ---------- cast ----------
const HUSTLER: Look = { skin: P.skin3, hair: "#D9D6D0", top: "#3F5F4A", topDark: "#2F4A38", hairStyle: "wild", glasses: true, mustache: "#D9D6D0" };
const RAY: Look = { skin: P.skin2, hair: "#2B211C", top: "#C9A14A", topDark: "#AA8638", hairStyle: "short", mustache: "#2B211C", tall: 1.05 };
const LANDLORD: Look = { skin: P.skin, hair: "#7A6A5A", top: "#8A8F9C", topDark: "#6F7480", hairStyle: "bun", glasses: true };

const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>{children}</svg>;

// ---------- the motif: a skill's progress bar over your head ----------
// fills from `a` for `secs` seconds of skill, up to `stop` (0..1); flashes red when it runs out.
const SkillBar: React.FC<{ t: number; a: number; x: number; y: number; label: string; stop: number; dur?: number; w?: number }> = ({ t, a, x, y, label, stop, dur = 3, w = 420 }) => {
  const p = pop(t, a - 0.2);
  if (p <= 0.001) return null;
  const k = Math.min(stop, interpolate(t, [a, a + dur], [0, stop], clamp));
  const out = k >= stop - 0.001 && t > a + dur;
  const flash = out ? 0.6 + 0.4 * Math.abs(Math.sin(t * 7)) : 1;
  return (
    <g transform={`translate(${x} ${y}) scale(${p})`}>
      <rect x={-w / 2 - 18} y={-58} width={w + 36} height={92} rx={22} fill="rgba(16,20,32,0.88)" />
      <text x={-w / 2} y={-22} fontFamily={font} fontWeight={800} fontSize={26} fill="#E8ECF4">{label}</text>
      <text x={w / 2} y={-22} textAnchor="end" fontFamily={font} fontWeight={900} fontSize={26} fill={out ? "#FF6B6B" : "#AEB6CC"}>{Math.round(k * 100)}%</text>
      <rect x={-w / 2} y={0} width={w} height={14} rx={7} fill="#3A4256" />
      <rect x={-w / 2} y={0} width={w * k} height={14} rx={7} fill="#FF3B3B" opacity={flash} />
      <circle cx={-w / 2 + w * k} cy={7} r={12} fill="#FF3B3B" opacity={flash} />
      {stop < 1 && <line x1={-w / 2 + w * stop} y1={-8} x2={-w / 2 + w * stop} y2={22} stroke="#FFFFFF" strokeWidth={3} strokeDasharray="4 3" opacity={0.7} />}
    </g>
  );
};

// a generic watch-history list: thumbnails, titles, red watched bars
type Vid = { title: string; pct: number; color: string; icon: string; dur: string };
const VIDS: Vid[] = [
  { title: "Juggling 5 knives for beginners", pct: 0.41, color: "#E9894E", icon: "knife", dur: "1:33" },
  { title: "Learn this song in 10 minutes", pct: 0.07, color: "#8E7BB8", icon: "guitar", dur: "9:58" },
  { title: "Backflip tutorial (easy!)", pct: 0.5, color: "#4DBE8A", icon: "flip", dur: "6:12" },
  { title: "How I make $5,000/month flipping furniture", pct: 0.62, color: "#B98A63", icon: "chair", dur: "18:40" },
  { title: "Best chess games of all time", pct: 1, color: "#3F5F4A", icon: "chess", dur: "24:10" },
  { title: "How to land a plane in an emergency", pct: 0.71, color: "#5E7A9A", icon: "plane", dur: "8:31" },
  { title: "Fix a leaking sink in 5 minutes", pct: 0.12, color: "#5BD3D0", icon: "wrench", dur: "5:02" },
  { title: "How to make money on YouTube", pct: 0.09, color: "#E25C5C", icon: "$", dur: "14:22" },
];
// tiny white icons drawn as shapes (no emoji fonts in the renderer)
const Icon: React.FC<{ k: string }> = ({ k }) => {
  switch (k) {
    case "knife": return <g stroke="none"><path d="M -30 10 L 20 -16 L 26 -8 L -24 18 Z" /><rect x={18} y={-22} width={20} height={12} rx={4} transform="rotate(-28 28 -16)" /></g>;
    case "guitar": return <g stroke="none"><circle cx={-10} cy={8} r={18} /><circle cx={6} cy={-6} r={12} /><rect x={8} y={-34} width={8} height={36} transform="rotate(40 12 -16)" /></g>;
    case "flip": return <g fill="none" strokeWidth={6} strokeLinecap="round"><path d="M -24 16 A 26 26 0 1 1 24 16" /><path d="M 24 16 l -10 -2 M 24 16 l 2 -10" /></g>;
    case "chair": return <g stroke="none"><rect x={-18} y={-26} width={8} height={52} /><rect x={-18} y={0} width={36} height={8} /><rect x={12} y={0} width={6} height={26} /></g>;
    case "chess": return <g stroke="none"><circle cx={0} cy={-16} r={9} /><path d="M -10 -8 L 10 -8 L 14 18 L -14 18 Z" /><rect x={-18} y={18} width={36} height={8} rx={3} /></g>;
    case "plane": return <g stroke="none"><path d="M -30 0 L 30 -4 L 34 0 L 30 4 Z" /><path d="M -4 0 L -18 -24 L -10 -24 L 10 0 L -10 24 L -18 24 Z" /><path d="M -26 0 L -32 -12 L -26 -12 L -20 0 Z" /></g>;
    case "wrench": return <g fill="none" strokeWidth={8} strokeLinecap="round"><path d="M -20 20 L 10 -10" /><circle cx={16} cy={-16} r={10} /></g>;
    default: return <text y={14} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={40} stroke="none">{k}</text>;
  }
};

const History: React.FC<{ t: number; a: number; x: number; y: number; hi?: number; rows?: number[]; s?: number }> = ({ t, a, x, y, hi = -1, rows = [0, 1, 2, 3, 4, 5, 6, 7], s = 1 }) => {
  const p = pop(t, a);
  if (p <= 0.001) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${p * s})`}>
      <rect x={-20} y={-80} width={860} height={rows.length * 104 + 100} rx={30} fill="#F7F8FB" />
      <text x={20} y={-28} fontFamily={font} fontWeight={900} fontSize={36} fill={P.ink}>Watch history</text>
      <circle cx={790} cy={-40} r={14} fill="#D0D5E0" /><circle cx={750} cy={-40} r={14} fill="#D0D5E0" />
      {rows.map((r, i) => {
        const v = VIDS[r];
        const q = pop(t, a + 0.15 + i * 0.08);
        const on = hi === r;
        return (
          <g key={r} transform={`translate(${(1 - q) * 60} ${i * 104})`} opacity={Math.min(1, q)}>
            {on && <rect x={-10} y={-6} width={840} height={98} rx={16} fill="#FFE9A8" />}
            <rect x={0} y={0} width={150} height={86} rx={10} fill={v.color} />
            <g transform="translate(75 43)" fill={P.white} stroke={P.white}><Icon k={v.icon} /></g>
            <rect x={112} y={64} width={34} height={18} rx={4} fill="rgba(0,0,0,0.7)" /><text x={129} y={78} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={12} fill={P.white}>{v.dur}</text>
            <rect x={0} y={80} width={150} height={6} fill="#C9CED8" /><rect x={0} y={80} width={150 * v.pct} height={6} fill="#FF3B3B" />
            <text x={176} y={36} fontFamily={font} fontWeight={800} fontSize={28} fill={P.ink}>{v.title}</text>
            <text x={176} y={72} fontFamily={font} fontWeight={700} fontSize={24} fill={v.pct < 1 ? "#E25C5C" : P.green}>{v.pct < 1 ? `Stopped at ${Math.round(v.pct * 100)}%` : "Watched to the end"}</text>
          </g>
        );
      })}
    </g>
  );
};

// ---------- detailed sets ----------
export const Kitchen: React.FC<{ t: number; water?: number }> = ({ t, water = 0 }) => (
  <Backdrop base="#E8D9C4" light="#FFF4E2" cx={45} cy={30}>
    {/* backsplash tiles */}
    {Array.from({ length: 13 }, (_, c) => Array.from({ length: 4 }, (_, r) => <rect key={`${c}-${r}`} x={c * 150 + (r % 2) * 75 - 75} y={430 + r * 60} width={146} height={56} rx={4} fill={(c + r) % 3 ? "#F3ECE2" : "#E9E0D3"} />))}
    {/* upper cabinets */}
    {[0, 1, 2, 3].map((i) => <g key={i}><rect x={640 + i * 230} y={90} width={220} height={260} rx={10} fill="#7FA6A3" /><rect x={650 + i * 230} y={100} width={200} height={240} rx={8} fill="#8DB3AF" /><rect x={835 + i * 230 - 200 + (i % 2 ? 0 : 160)} y={290} width={10} height={40} rx={5} fill="#E8D9C4" /></g>)}
    {/* window with blinds and a plant */}
    <rect x={150} y={110} width={380} height={300} rx={10} fill="#BFE3F6" />
    {[0, 1].map((i) => <ellipse key={i} cx={((t * 10 + i * 230) % 520) + 100} cy={190 + i * 70} rx={70} ry={20} fill={P.white} opacity={0.85} />)}
    {Array.from({ length: 7 }, (_, i) => <rect key={i} x={150} y={110 + i * 18} width={380} height={10} fill="#F4ECE2" opacity={0.9} />)}
    <rect x={150} y={110} width={380} height={300} rx={10} fill="none" stroke={P.cream} strokeWidth={16} />
    <rect x={130} y={405} width={420} height={18} rx={6} fill={P.cream} />
    <path d="M 440 405 Q 430 340 470 320 Q 460 360 480 330 Q 490 370 470 405 Z" fill="#4DBE8A" /><rect x={440} y={380} width={50} height={28} rx={6} fill="#C96E37" />
    {/* fridge with magnets */}
    <rect x={1620} y={160} width={250} height={720} rx={22} fill="#E4E9F0" /><rect x={1620} y={420} width={250} height={8} fill="#C9D2DE" />
    <rect x={1640} y={300} width={12} height={90} rx={6} fill="#AEB6CC" /><rect x={1640} y={460} width={12} height={110} rx={6} fill="#AEB6CC" />
    {[["#E25C5C", 1720, 220], ["#F2B640", 1790, 260], ["#5BD3D0", 1760, 330]].map(([c, x, y], i) => <circle key={i} cx={x as number} cy={y as number} r={14} fill={c as string} />)}
    <rect x={1700} y={240} width={70} height={90} rx={4} fill={P.white} transform="rotate(-5 1735 285)" />
    {/* wall clock */}
    <circle cx={1450} cy={200} r={58} fill={P.white} /><circle cx={1450} cy={200} r={58} fill="none" stroke="#5E7A9A" strokeWidth={8} />
    <line x1={1450} y1={200} x2={1450} y2={160} stroke={P.ink} strokeWidth={6} strokeLinecap="round" /><line x1={1450} y1={200} x2={1450 + Math.cos(t * 0.6) * 42} y2={200 + Math.sin(t * 0.6) * 42} stroke={P.red} strokeWidth={3} />
    {/* counter with knife block, cutting board, sink */}
    <rect y={660} width={1600} height={40} fill="#D8CFC2" /><rect y={700} width={1600} height={180} fill="#9C7A5A" />
    {Array.from({ length: 6 }, (_, i) => <g key={i}><rect x={20 + i * 265} y={715} width={250} height={150} rx={8} fill="#A9875F" /><rect x={130 + i * 265} y={780} width={30} height={8} rx={4} fill="#E8D9C4" /></g>)}
    <rect x={1120} y={600} width={70} height={64} rx={8} fill="#6B4E36" />{[0, 1, 2].map((i) => <rect key={i} x={1130 + i * 18} y={560} width={8} height={44} rx={3} fill="#C9D2DE" />)}
    <rect x={1240} y={640} width={200} height={22} rx={6} fill="#C99D74" />
    <path d="M 300 660 Q 300 600 360 600" stroke="#AEB6CC" strokeWidth={14} fill="none" /><rect x={240} y={652} width={180} height={14} rx={6} fill="#AEB6CC" />
    <rect y={880} width={1920} height={200} fill="#B9A58C" />{Array.from({ length: 12 }, (_, i) => <rect key={i} x={i * 170} y={880} width={4} height={200} fill="#A8937A" />)}
    {/* pendant lamps */}
    {[760, 1180].map((x) => <g key={x}><line x1={x} y1={0} x2={x} y2={70} stroke="#3A3036" strokeWidth={4} /><path d={`M ${x - 50} 70 L ${x + 50} 70 L ${x + 30} 110 L ${x - 30} 110 Z`} fill="#F2B640" /><Glow cx={x} cy={140} r={300} color="#FFD98A" opacity={0.22} id={`pl${x}`} /></g>)}
    {water > 0 && <g opacity={0.85}>
      <path d={`M 0 ${1080 - water} ${Array.from({ length: 21 }, (_, i) => `Q ${i * 96 + 48} ${1080 - water + Math.sin(t * 3 + i) * 12} ${(i + 1) * 96} ${1080 - water}`).join(" ")} L 1920 1080 L 0 1080 Z`} fill="#5FA8D3" />
      {Array.from({ length: 8 }, (_, i) => <ellipse key={i} cx={(i * 260 + t * 30) % 1920} cy={1080 - water + 20} rx={40} ry={6} fill={P.white} opacity={0.4} />)}
    </g>}
    <Bokeh t={t} n={10} opacity={0.12} color="#FFE9C4" />
  </Backdrop>
);

const Backyard: React.FC<{ t: number }> = ({ t }) => (
  <Backdrop base="#8FC3E6" light="#E3F3FB" cx={60} cy={20}>
    {[0, 1, 2].map((i) => <g key={i} transform={`translate(${((i * 700 - t * 18) % 2400 + 2400) % 2400 - 200} ${120 + i * 60})`}><ellipse rx={130} ry={34} fill={P.white} /><ellipse cx={-50} cy={-24} rx={60} ry={34} fill={P.white} /><ellipse cx={45} cy={-28} rx={70} ry={38} fill={P.white} /></g>)}
    {/* house wall, door and window */}
    <rect x={1300} y={260} width={620} height={560} fill="#E8D9C4" />{Array.from({ length: 14 }, (_, i) => <rect key={i} x={1300} y={270 + i * 40} width={620} height={4} fill="#D8C9B2" />)}
    <rect x={1420} y={480} width={160} height={340} rx={8} fill="#8E6646" /><circle cx={1555} cy={660} r={9} fill={P.gold} />
    <rect x={1660} y={400} width={200} height={170} rx={6} fill="#BFE3F6" /><rect x={1660} y={400} width={200} height={170} rx={6} fill="none" stroke={P.cream} strokeWidth={12} />
    {/* fence */}
    {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M ${i * 96} 820 L ${i * 96} 540 L ${i * 96 + 42} 510 L ${i * 96 + 84} 540 L ${i * 96 + 84} 820 Z`} fill={i % 2 ? "#C99D74" : "#D2A97E"} />)}
    <rect y={600} width={1300} height={16} fill="#A97E58" /><rect y={740} width={1300} height={16} fill="#A97E58" />
    {/* tree */}
    <rect x={380} y={420} width={50} height={400} fill="#7A563A" />
    {[[400, 360, 170], [300, 420, 120], [510, 420, 130], [400, 470, 140]].map(([x, y, r], i) => <circle key={i} cx={x + Math.sin(t + i) * 4} cy={y} r={r} fill={i % 2 ? "#5FA862" : "#6DB46F"} />)}
    <rect y={800} width={1920} height={280} fill="#7BBF7A" />
    {Array.from({ length: 90 }, (_, i) => <path key={i} d={`M ${(i * 23) % 1920} ${830 + (i * 37) % 230} l 4 -18 l 4 18`} stroke="#5FA862" strokeWidth={3} fill="none" />)}
  </Backdrop>
);

const Garage: React.FC<{ t: number }> = ({ t }) => (
  <Backdrop base="#3E3A4A" light="#6A6080" cx={50} cy={25}>
    {/* pegboard with tools */}
    <rect x={140} y={120} width={720} height={380} rx={10} fill="#B98A63" />
    {Array.from({ length: 18 }, (_, c) => Array.from({ length: 9 }, (_, r) => <circle key={`${c}-${r}`} cx={170 + c * 38} cy={145 + r * 40} r={4} fill="#8E6646" />))}
    <path d="M 220 170 l 0 160 M 200 170 l 40 0" stroke="#5E7A9A" strokeWidth={16} strokeLinecap="round" />
    <path d="M 320 180 l 60 150" stroke="#C9D2DE" strokeWidth={12} strokeLinecap="round" /><rect x={300} y={160} width={50} height={40} rx={6} fill={P.red} />
    <circle cx={520} cy={250} r={70} fill="none" stroke="#2B2B36" strokeWidth={14} /><rect x={640} y={170} width={30} height={150} rx={8} fill={P.gold} /><rect x={720} y={190} width={90} height={22} rx={6} fill="#5E7A9A" />
    {/* shelves with paint cans */}
    {[0, 1].map((r) => <g key={r}><rect x={1100} y={200 + r * 170} width={680} height={16} fill="#8E6646" />{[0, 1, 2, 3, 4].map((i) => <g key={i}><rect x={1130 + i * 130} y={130 + r * 170} width={90} height={70} rx={8} fill={["#E25C5C", "#5BD3D0", "#F2B640", "#8E7BB8", "#4DBE8A"][(i + r) % 5]} /><rect x={1130 + i * 130} y={130 + r * 170} width={90} height={14} fill="rgba(0,0,0,0.15)" /></g>)}</g>)}
    {/* hanging bulb */}
    <line x1={960} y1={0} x2={960} y2={110 + Math.sin(t * 1.2) * 3} stroke="#2B2B36" strokeWidth={4} /><circle cx={960 + Math.sin(t * 1.2) * 2} cy={125} r={22} fill="#FFE9A8" />
    <Glow cx={960} cy={160} r={520} color="#FFE2A8" opacity={0.35} id="gbulb" />
    <rect y={860} width={1920} height={220} fill="#2E2B36" /><path d="M 0 860 L 1920 860" stroke="#4A4458" strokeWidth={6} />
    {/* workbench */}
    <rect x={1060} y={640} width={720} height={36} rx={8} fill="#8E6646" /><rect x={1090} y={676} width={30} height={190} fill="#6A4A30" /><rect x={1720} y={676} width={30} height={190} fill="#6A4A30" />
    {/* sawdust */}
    {Array.from({ length: 30 }, (_, i) => <circle key={i} cx={(i * 131 + t * 12) % 1920} cy={300 + ((i * 89 + t * 20) % 560)} r={2.5} fill="#FFE2A8" opacity={0.4} />)}
  </Backdrop>
);

// a refinished wooden chair
const Chair: React.FC<{ x: number; y: number; s?: number; color?: string; tag?: string }> = ({ x, y, s = 1, color = "#C98A4E", tag }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <Shadow cx={0} cy={0} rx={70} />
    <rect x={-60} y={-260} width={16} height={260} rx={6} fill={color} /><rect x={44} y={-260} width={16} height={260} rx={6} fill={color} />
    {[0, 1, 2].map((i) => <rect key={i} x={-60} y={-250 + i * 34} width={120} height={14} rx={6} fill={color} />)}
    <rect x={-70} y={-130} width={140} height={22} rx={8} fill={color} /><rect x={-70} y={-130} width={140} height={6} rx={3} fill="#FFFFFF" opacity={0.3} />
    <rect x={-56} y={-110} width={12} height={110} rx={5} fill={color} /><rect x={44} y={-110} width={12} height={110} rx={5} fill={color} />
    {tag && <g transform="translate(40 -200) rotate(8)"><rect x={-40} y={-18} width={80} height={36} rx={6} fill={P.cream} /><text y={8} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={20} fill={P.ink}>{tag}</text></g>}
  </g>
);

// park chess: board seen from above, with sliding pieces
const Board: React.FC<{ t: number; x: number; y: number; size: number; moving?: boolean }> = ({ t, x, y, size, moving = true }) => {
  const c = size / 8;
  const pieces: [number, number, string][] = [[0, 0, "#2B2B36"], [3, 0, "#2B2B36"], [4, 0, "#2B2B36"], [6, 1, "#2B2B36"], [2, 1, "#2B2B36"], [5, 2, "#2B2B36"], [3, 6, P.white], [4, 7, P.white], [1, 6, P.white], [6, 6, P.white], [2, 5, P.white], [5, 4, P.white]];
  return (
    <g transform={`translate(${x - size / 2} ${y - size / 2})`}>
      <rect x={-14} y={-14} width={size + 28} height={size + 28} rx={10} fill="#6B4E36" />
      {Array.from({ length: 64 }, (_, i) => <rect key={i} x={(i % 8) * c} y={Math.floor(i / 8) * c} width={c} height={c} fill={(i + Math.floor(i / 8)) % 2 ? "#8E6646" : "#EBD9B8"} />)}
      {pieces.map(([px, py, col], i) => {
        const k = moving ? ((t * 0.9 + i * 0.37) % 4) / 4 : 0;
        const dx = moving && i % 3 === 0 ? Math.round(Math.sin(i + Math.floor(t * 0.9 + i * 0.37)) * 2) * c * ease(k, 0, 0.15) : 0;
        return <g key={i} transform={`translate(${px * c + c / 2 + dx} ${py * c + c / 2})`}><circle r={c * 0.36} fill={col} stroke={col === P.white ? "#C9CED8" : "#11131A"} strokeWidth={3} /><circle r={c * 0.16} fill={col === P.white ? "#E4E9F0" : "#3A3F4D"} /></g>;
      })}
    </g>
  );
};

const Park: React.FC<{ t: number }> = ({ t }) => (
  <Backdrop base="#9CCB8E" light="#E6F4D8" cx={50} cy={10}>
    <rect width={1920} height={380} fill="#BFE3F6" />
    {[0, 1].map((i) => <ellipse key={i} cx={((t * 14 + i * 900) % 2200) - 140} cy={110 + i * 60} rx={120} ry={30} fill={P.white} opacity={0.9} />)}
    {/* city skyline behind the trees */}
    {Array.from({ length: 12 }, (_, i) => <rect key={i} x={i * 170} y={160 + (i * 53) % 120} width={150} height={260} fill={["#B8C4D4", "#A3B0C4", "#C9D2DE"][i % 3]} />)}
    {[180, 620, 1300, 1760].map((x, i) => <g key={x}><rect x={x - 18} y={260} width={36} height={220} fill="#7A563A" /><circle cx={x + Math.sin(t + i) * 4} cy={230} r={120} fill={i % 2 ? "#5FA862" : "#6DB46F"} /><circle cx={x - 70} cy={290} r={80} fill="#5FA862" /><circle cx={x + 70} cy={290} r={80} fill="#6DB46F" /></g>)}
    <rect y={460} width={1920} height={620} fill="#C9C2B4" />{Array.from({ length: 20 }, (_, i) => <rect key={i} x={i * 100} y={460} width={3} height={620} fill="#B8B0A1" />)}
    {/* lamp posts */}
    {[420, 1500].map((x) => <g key={x}><rect x={x - 6} y={240} width={12} height={240} fill="#2B2B36" /><circle cx={x} cy={236} r={20} fill="#FFE9A8" /></g>)}
    {/* pigeons */}
    {[0, 1, 2].map((i) => { const x = ((i * 520 + t * (20 + i * 8)) % 2100) - 90; return <g key={i} transform={`translate(${x} ${980 - i * 18}) scale(${i % 2 ? -1 : 1} 1)`}><ellipse rx={26} ry={16} fill="#9AA3B5" /><circle cx={22} cy={-12 + Math.abs(Math.sin(t * 6 + i)) * 4} r={10} fill="#8A93A5" /><path d="M 30 -12 l 8 3 l -8 3 Z" fill={P.gold} /></g>; })}
    <Bokeh t={t} n={10} opacity={0.12} />
  </Backdrop>
);

const ChessTable: React.FC<{ t: number; x?: number }> = ({ t, x = 960 }) => (
  <g>
    <rect x={x - 300} y={690} width={600} height={40} rx={10} fill="#8A8F9C" /><rect x={x - 30} y={730} width={60} height={160} fill="#6F7480" />
    {/* the board in perspective */}
    <path d={`M ${x - 170} 696 L ${x + 170} 696 L ${x + 200} 640 L ${x - 200} 640 Z`} fill="#6B4E36" />
    {Array.from({ length: 16 }, (_, i) => { const c = i % 8, r = Math.floor(i / 8); const y0 = 640 + r * 28, w0 = 400 - r * 30, w1 = 400 - (r + 1) * 30; return <path key={i} d={`M ${x - w0 / 2 + c * w0 / 8} ${y0} L ${x - w0 / 2 + (c + 1) * w0 / 8} ${y0} L ${x - w1 / 2 + (c + 1) * w1 / 8 - 0} ${y0 + 28} L ${x - w1 / 2 + c * w1 / 8} ${y0 + 28} Z`} fill={(c + r) % 2 ? "#EBD9B8" : "#8E6646"} />; })}
    {[[-120, P.white], [-40, "#2B2B36"], [60, P.white], [130, "#2B2B36"]].map(([dx, c], i) => <g key={i}><ellipse cx={x + (dx as number)} cy={668} rx={12} ry={5} fill={c as string} /><rect x={x + (dx as number) - 7} y={630 + (i % 2) * 6} width={14} height={36} rx={6} fill={c as string} /><circle cx={x + (dx as number)} cy={628 + (i % 2) * 6} r={9} fill={c as string} /></g>)}
    {/* chess clock */}
    <g transform={`translate(${x + 240} 650)`}><rect x={-60} y={-40} width={120} height={46} rx={8} fill="#2B2B36" /><rect x={-50} y={-32} width={46} height={28} rx={4} fill="#E8F0E4" /><rect x={4} y={-32} width={46} height={28} rx={4} fill="#E8F0E4" />
      <text x={-27} y={-12} textAnchor="middle" fontFamily="monospace" fontWeight={700} fontSize={16} fill={P.ink}>{`2:${String(59 - Math.floor(t * 3) % 60).padStart(2, "0")}`}</text><text x={27} y={-12} textAnchor="middle" fontFamily="monospace" fontWeight={700} fontSize={16} fill={P.ink}>0:41</text>
      <rect x={-40} y={-52 + (Math.floor(t * 1.5) % 2) * 6} width={24} height={12} rx={4} fill={P.red} /><rect x={16} y={-52 + ((Math.floor(t * 1.5) + 1) % 2) * 6} width={24} height={12} rx={4} fill={P.red} /></g>
  </g>
);

const Airfield: React.FC<{ t: number }> = ({ t }) => (
  <Backdrop base="#8FC3E6" light="#EAF6FC" cx={70} cy={20}>
    <Glow cx={1650} cy={150} r={300} color="#FFE9A8" opacity={0.7} id="afsun" /><circle cx={1650} cy={150} r={60} fill="#FFE9A8" />
    {[0, 1].map((i) => <ellipse key={i} cx={((t * 16 + i * 1000) % 2300) - 160} cy={140 + i * 80} rx={140} ry={34} fill={P.white} opacity={0.9} />)}
    {/* hangar */}
    <path d="M 1100 760 L 1100 420 Q 1450 300 1800 420 L 1800 760 Z" fill="#AEB6CC" /><rect x={1200} y={500} width={500} height={260} fill="#5E6A80" />
    {Array.from({ length: 9 }, (_, i) => <rect key={i} x={1200 + i * 56} y={500} width={4} height={260} fill="#4A5468" />)}
    <text x={1450} y={470} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={34} fill="#3A4256">RAY'S SKY TOURS</text>
    {/* windsock */}
    <rect x={300} y={420} width={8} height={340} fill="#5A5F6C" />
    <path d={`M 308 430 L ${450 + Math.sin(t * 2) * 10} ${440 + Math.sin(t * 3) * 8} L ${450 + Math.sin(t * 2) * 10} ${476 + Math.sin(t * 3) * 8} L 308 466 Z`} fill="#F2702E" />
    {[0, 1].map((i) => <rect key={i} x={340 + i * 50} y={432 + i * 4} width={24} height={32} fill={P.white} opacity={0.85} />)}
    <rect y={760} width={1920} height={320} fill="#7BBF7A" /><path d="M 0 860 L 1920 820 L 1920 960 L 0 1000 Z" fill="#6A6F7C" />
    {Array.from({ length: 10 }, (_, i) => <rect key={i} x={i * 200 + 40} y={905 - i * 4} width={110} height={10} fill={P.white} opacity={0.85} />)}
  </Backdrop>
);

// cockpit view on the approach: k = 0 far .. 1 touchdown
const Cockpit: React.FC<{ t: number; k: number; alt: number; stalled?: boolean }> = ({ t, k, alt, stalled = false }) => {
  const shake = stalled ? Math.sin(t * 40) * 3 : Math.sin(t * 7) * 1.2;
  const horizon = 430 + (stalled ? Math.sin(t * 3) * 16 : 0);
  const near = 900, far = horizon + 6;
  const w0 = 30 + k * 300, w1 = 200 + k * 1600; // runway width far, near
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#8FC3E6 0%, #DCEFF8 40%, #7BBF7A 41%, #5FA862 100%)", transform: `translate(${shake}px, ${shake * 0.6}px)` }}>
      <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
        <rect y={horizon} width={1920} height={1080 - horizon} fill="#7BBF7A" />
        {Array.from({ length: 8 }, (_, i) => <rect key={i} x={((i * 300 - t * 40 * (1 + k)) % 2200 + 2200) % 2200 - 140} y={horizon + 20 + i * 40} width={180 + i * 20} height={20 + i * 6} rx={6} fill={i % 2 ? "#6DB46F" : "#5FA862"} />)}
        <path d={`M ${960 - w0 / 2} ${far} L ${960 + w0 / 2} ${far} L ${960 + w1 / 2} ${near} L ${960 - w1 / 2} ${near} Z`} fill="#4A4F5C" />
        {Array.from({ length: 7 }, (_, i) => { const a = ((i / 7 + t * 0.15 * (0.4 + k)) % 1); const y = far + (near - far) * a * a; const w = 4 + a * 26; return <rect key={i} x={960 - w / 2} y={y} width={w} height={6 + a * 40} fill={P.white} opacity={0.9} />; })}
        {/* windshield frame and dash */}
        <path d="M 0 0 L 1920 0 L 1920 120 Q 960 60 0 120 Z" fill="#2B3448" /><rect x={0} y={0} width={110} height={1080} fill="#2B3448" /><rect x={1810} y={0} width={110} height={1080} fill="#2B3448" />
        <path d="M 0 720 Q 960 660 1920 720 L 1920 1080 L 0 1080 Z" fill="#232B3C" />
        {/* instruments */}
        {[["AIRSPEED", 70 + (1 - k) * 15], ["ATTITUDE", 0], ["ALTITUDE", alt]].map(([lab, v], i) => (
          <g key={i} transform={`translate(${620 + i * 340} 860)`}>
            <circle r={110} fill="#141A28" /><circle r={100} fill="none" stroke="#3A4256" strokeWidth={6} />
            {i === 1 ? <g><clipPath id="att"><circle r={92} /></clipPath><g clipPath="url(#att)" transform={`rotate(${stalled ? Math.sin(t * 3) * 12 : Math.sin(t) * 3})`}><rect x={-100} y={-100} width={200} height={100} fill="#5E9AD1" /><rect x={-100} y={0} width={200} height={100} fill="#8E6646" /><line x1={-100} y1={0} x2={100} y2={0} stroke={P.white} strokeWidth={3} /></g><path d="M -50 6 L -14 6 L 0 18 L 14 6 L 50 6" stroke={P.gold} strokeWidth={6} fill="none" /></g>
              : <g>{Array.from({ length: 12 }, (_, j) => <line key={j} x1={0} y1={-90} x2={0} y2={-74} stroke={P.white} strokeWidth={3} transform={`rotate(${j * 30})`} />)}
                <line x1={0} y1={0} x2={0} y2={-80} stroke="#FFC870" strokeWidth={6} strokeLinecap="round" transform={`rotate(${i === 0 ? (v as number) * 2.6 : ((v as number) / 1000) * 360})`} /><circle r={10} fill="#FFC870" />
                <text y={50} textAnchor="middle" fontFamily="monospace" fontWeight={700} fontSize={28} fill={P.white}>{i === 0 ? `${Math.round(v as number)} kt` : `${Math.round(v as number)} ft`}</text></g>}
            <text y={140} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={20} fill="#AEB6CC">{lab}</text>
          </g>
        ))}
        {/* yoke */}
        <g transform={`translate(960 ${1040 - (stalled ? 0 : k * 30)})`}><rect x={-14} y={-60} width={28} height={140} fill="#141A28" /><path d="M -170 -60 Q -170 -110 -120 -110 L 120 -110 Q 170 -110 170 -60 L 150 -40 L 110 -80 L -110 -80 L -150 -40 Z" fill="#141A28" /></g>
      </svg>
    </AbsoluteFill>
  );
};

const Hallway: React.FC<{ t: number }> = ({ t }) => (
  <Backdrop base="#C9B9A4" light="#F2E6D6" cx={50} cy={20}>
    {Array.from({ length: 24 }, (_, i) => <rect key={i} x={i * 80} y={0} width={40} height={860} fill="#BFAE98" opacity={0.5} />)}
    <rect x={760} y={220} width={400} height={640} rx={8} fill="#7A563A" /><rect x={790} y={250} width={340} height={260} rx={6} fill="#8E6646" /><rect x={790} y={540} width={340} height={290} rx={6} fill="#8E6646" />
    <circle cx={1110} cy={560} r={14} fill={P.gold} /><text x={960} y={200} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={44} fill="#6A5A48">4B</text>
    <rect x={1300} y={360} width={200} height={140} rx={8} fill={P.cream} /><text x={1400} y={420} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={30} fill={P.red}>RENT DUE</text><text x={1400} y={462} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={26} fill={P.ink}>THE 1ST</text>
    <rect y={860} width={1920} height={220} fill="#8E6646" /><rect x={600} y={880} width={720} height={60} rx={10} fill="#C66B7A" opacity={0.7} />
    <Glow cx={960} cy={60} r={420} color="#FFE9A8" opacity={0.3} id="hall" />
    <Bokeh t={t} n={8} opacity={0.1} />
  </Backdrop>
);

export const Bedroom: React.FC<{ t: number; night?: boolean }> = ({ t, night = true }) => (
  <Backdrop base={night ? "#1E2638" : "#C9D6E6"} light={night ? "#3A4766" : "#F2F6FA"} cx={40} cy={30}>
    <rect x={1300} y={150} width={420} height={360} rx={10} fill={night ? "#141A28" : "#BFE3F6"} />
    {night && Array.from({ length: 14 }, (_, i) => <circle key={i} cx={1320 + (i * 71) % 380} cy={170 + (i * 97) % 320} r={2.5} fill={P.white} opacity={0.3 + 0.6 * Math.abs(Math.sin(t + i))} />)}
    {night && <circle cx={1620} cy={240} r={40} fill="#F4ECD0" />}
    <rect x={1300} y={150} width={420} height={360} rx={10} fill="none" stroke="#3C4866" strokeWidth={18} />
    {/* posters, shelf, bed */}
    <rect x={180} y={160} width={200} height={260} rx={6} fill="#E25C5C" opacity={0.6} /><rect x={420} y={200} width={170} height={220} rx={6} fill="#5BD3D0" opacity={0.6} />
    <rect x={700} y={330} width={420} height={14} fill="#8E6646" />{[0, 1, 2, 3, 4].map((i) => <rect key={i} x={720 + i * 40} y={260 + (i % 2) * 14} width={30} height={70 - (i % 2) * 14} fill={["#E9894E", "#8E7BB8", "#4DBE8A", "#F2B640", "#5E7A9A"][i]} />)}
    <rect y={860} width={1920} height={220} fill={night ? "#18202F" : "#A9B5C6"} />
    <rect x={200} y={640} width={700} height={160} rx={30} fill="#5E7A9A" /><rect x={200} y={600} width={160} height={90} rx={30} fill="#E4E9F0" /><rect x={340} y={630} width={560} height={80} rx={20} fill="#8E7BB8" />
    <Bokeh t={t} n={10} opacity={0.1} />
  </Backdrop>
);

// a phone in a hand-held frame
export const Phone: React.FC<{ x: number; y: number; s?: number; children?: React.ReactNode; rec?: boolean; t: number }> = ({ x, y, s = 1, children, rec, t }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-170} y={-320} width={340} height={640} rx={44} fill="#141A28" /><rect x={-154} y={-300} width={308} height={600} rx={30} fill="#2C3852" />
    <clipPath id={`ph${x}`}><rect x={-154} y={-300} width={308} height={600} rx={30} /></clipPath>
    <g clipPath={`url(#ph${x})`}>{children}</g>
    {rec && <g><circle cx={-110} cy={-260} r={10} fill={Math.sin(t * 6) > 0 ? "#FF3B3B" : "#7A2A2A"} /><text x={-92} y={-252} fontFamily={font} fontWeight={800} fontSize={22} fill={P.white}>REC</text></g>}
    <rect x={-40} y={-312} width={80} height={10} rx={5} fill="#2B2B36" />
  </g>
);

const card = (t: number, a: number, until: number, title: string, big: string, sub: string, color = P.orange, x = 1100, y = 140, w = 700) => (
  <StatCard t={t} at={a} until={until} x={x} y={y} w={w} title={title} big={big} sub={sub} color={color} />
);

// ---------- shots ----------
const shots: Record<string, React.FC<ShotProps>> = {
  cold_open: ({ t, t0, t1 }) => {
    const stop = S(1) + 1.2; // the knives drop
    const juggling = t < stop;
    return (
      <Camera t={t} t0={t0} t1={t1} from={1.08} to={1.0} fx={760} fy={520} punch={[stop, S(2) + 0.1]} shake={[stop]}>
        <Kitchen t={t} />
        <Svg>
          <Person x={760} y={1000} look={YOU} mood={t > stop ? "shocked" : t > S(0) + 2 ? "happy" : "nervous"} t={t} {...say(t, "YOU")} pose={juggling ? "cheer" : "shrug"} sweat={!juggling} />
          {juggling && Array.from({ length: 5 }, (_, i) => {
            const ph = t * 3.2 + i * (Math.PI * 2 / 5);
            const kx = 760 + Math.cos(ph) * 170, ky = 360 - Math.abs(Math.sin(ph)) * 260;
            return <g key={i} transform={`translate(${kx} ${ky}) rotate(${t * 520 + i * 70})`}><rect x={-10} y={-56} width={20} height={70} rx={4} fill="#DDE3EC" /><rect x={-12} y={14} width={24} height={44} rx={6} fill="#3A2A1E" /></g>;
          })}
          {!juggling && [[-260, 0], [-120, 1], [40, 2], [180, 3], [300, 4]].map(([dx, i]) => {
            const fall = ease(t, stop, stop + 0.45);
            return <g key={i} transform={`translate(${760 + dx} ${300 + fall * (630 - 300)}) rotate(${180 + (i - 2) * 12})`}><rect x={-10} y={-56} width={20} height={70} rx={4} fill="#DDE3EC" /><rect x={-12} y={14} width={24} height={44} rx={6} fill="#3A2A1E" /></g>;
          })}
          {t > S(2) - 0.4 && <Person x={1380} y={1000} look={THEO} mood="shocked" t={t} {...say(t, "THEO")} flip lookX={-1} pose="point" />}
          <SkillBar t={t} a={S(0) + 0.6} x={760} y={180} label="Juggling 5 knives · stops at 0:38" stop={0.41} dur={stop - S(0) - 0.6} w={520} />
        </Svg>
        {t > S(4) && <History t={t} a={S(4) + D(4) * 0.4} x={1060} y={180} rows={[0, 5]} hi={0} s={0.9} />}
        {t < S(1) + 0.2 && <Chip t={t} at={t0 + 0.2} text="7:02 A.M." />}
      </Camera>
    );
  },

  promise: ({ t, t0, t1 }) => {
    const items = [
      { k: 0.08, x: 300, txt: "CHESS", c: "#9FE3C0" }, { k: 0.3, x: 720, txt: "11 CHAIRS", c: "#E9B47A" },
      { k: 0.52, x: 1160, txt: "FLOOD", c: "#7FC4EE" }, { k: 0.72, x: 1600, txt: "A PLANE", c: P.gold },
    ];
    return (
      <Camera t={t} t0={t0} t1={t1}>
        <Backdrop base={P.night} light={P.nightHi}><Bokeh t={t} /></Backdrop>
        <Svg>
          {items.map((it, i) => {
            const p = pop(t, S(at("promise", 0)) + D(at("promise", 0)) * it.k);
            return p > 0 ? <g key={i} transform={`translate(${it.x} 480) scale(${p}) rotate(${Math.sin(t * 2 + i) * 3})`}>
              <Glow cx={0} cy={0} r={260} color={it.c} opacity={0.3} id={`pr${i}`} />
              <circle r={170} fill="#F7E3B8" /><circle r={156} fill="#2C3852" />
              {i === 0 && <Board t={t} x={0} y={-10} size={170} />}
              {i === 1 && <g transform="translate(0 110) scale(0.55)"><Chair x={-70} y={0} /><Chair x={70} y={0} color="#B97A42" /></g>}
              {i === 2 && <g>{[0, 1, 2].map((j) => <path key={j} d={`M -120 ${20 + j * 34} q 30 -20 60 0 t 60 0 t 60 0 t 60 0`} stroke="#7FC4EE" strokeWidth={10} fill="none" transform={`translate(${Math.sin(t * 2 + j) * 10} 0)`} />)}</g>}
              {i === 3 && <g transform="scale(0.55)"><Cessna x={0} y={0} t={t} /></g>}
              <text y={230} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={42} fill={it.c}>{it.txt}</text>
            </g> : null;
          })}
          {t > S(at("promise", 0)) + D(at("promise", 0)) * 0.9 && <Label t={t} at={S(at("promise", 0)) + D(at("promise", 0)) * 0.92} x={1600} y={760} text="ALMOST." size={44} bg={P.red} color={P.white} rot={-6} />}
        </Svg>
      </Camera>
    );
  },

  rules: ({ t, t0, t1 }) => {
    const a = first("rules");
    const factCard = t >= S(a + 2) - 0.15 && t < S(a + 3) - 0.15;
    const demos = t >= S(a + 3) - 0.15 && t < S(a + 5) - 0.15;
    const plane = t >= S(a + 5) - 0.15;
    return (
      <Camera t={t} t0={t0} t1={t1} from={1.0} to={1.06} punch={[S(a + 3) + 0.2, S(a + 7) + 0.2]}>
        <Bedroom t={t} night={false} />
        <Svg>
          {!demos && !factCard && <History t={t} a={t0 + 0.3} x={480} y={110} hi={plane ? 5 : -1} s={0.78} />}
          {!demos && !factCard && <Person x={1600} y={1000} look={YOU} mood={plane ? "nervous" : "happy"} t={t} lookX={-1} flip />}
          {plane && t > S(a + 6) - 0.2 && <Person x={1300} y={1000} look={THEO} mood="smug" t={t} {...say(t, "THEO")} flip lookX={-1} pose="point" />}
          {demos && <>
            {/* guitar: 40 seconds, then nothing */}
            <g><Person x={520} y={1000} look={YOU} mood={t > S(a + 4) + 1.4 ? "shocked" : "happy"} t={t} pose="hold" holding={<g transform="rotate(-30)"><ellipse cx={-30} cy={30} rx={60} ry={48} fill="#C96E37" /><circle cx={-30} cy={30} r={16} fill="#3A2A1E" /><rect x={20} y={-110} width={16} height={150} fill="#6B4E36" /></g>} />
              <SkillBar t={t} a={S(a + 4) - 0.2} x={520} y={220} label="Guitar · first 40 seconds" stop={0.07} dur={1.4} w={440} /></g>
            {/* backflip: the jump, not the landing */}
            {(() => { const k = ((t - S(a + 4)) % 2.2) / 2.2; const up = Math.sin(Math.min(1, k * 1.6) * Math.PI) * 260; const rot = Math.min(180, k * 1.6 * 200); return <g transform={`translate(1400 ${1000 - up}) rotate(${-rot} 0 -240)`}><Person x={0} y={0} look={YOU} mood="shocked" t={t} pose="cheer" s={0.9} /></g>; })()}
            <SkillBar t={t} a={S(a + 4) + 1.4} x={1400} y={220} label="Backflip · the jump, not the landing" stop={0.5} dur={1} w={520} />
          </>}
        </Svg>
        {factCard && card(t, S(a + 2) + 0.2, E(a + 2) + 0.2, "HOURS OF YOUTUBE WATCHED A DAY (2017)", "1 BILLION", "according to YouTube", P.red, 140, 140, 760)}
        {factCard && card(t, S(a + 2) + D(a + 2) * 0.55, E(a + 2) + 0.2, "STUDY OF 10,000+ VIDEOS", "< 25%", "of each video is watched, on average", "#5E7A9A", 1020, 520, 760)}
        <Chip t={t} at={t0 + 0.2} text="DAY 1" />
      </Camera>
    );
  },

  goal: ({ t, t0, t1 }) => {
    const a = first("goal");
    return (
      <Camera t={t} t0={t0} t1={t1} from={1.0} to={1.1} fx={1150} punch={[S(a + 1) + 0.3]}>
        <Hallway t={t} />
        <Svg>
          <Person x={1240} y={1000} look={LANDLORD} mood="angry" t={t} {...say(t, "LANDLORD")} flip lookX={-1} pose="point" />
          <Person x={620} y={1000} look={YOU} mood="nervous" t={t} lookX={1} sweat={t > S(a + 1)} />
          <Label t={t} at={S(a) + D(a) * 0.3} until={S(a + 1)} x={620} y={560} text="FIRED ON MONDAY" size={34} bg={P.red} color={P.white} rot={-4} />
        </Svg>
        {card(t, S(a) + D(a) * 0.55, S(a + 1) - 0.1, "RENT", "$1,400", "due on the 1st · you have $210", P.red, 120, 120, 640)}
      </Camera>
    );
  },

  half: ({ t, t0, t1 }) => {
    const a = first("half");
    const jump = S(a + 1) + 0.2;
    const k = ease(t, jump, jump + 1.2);
    const up = Math.sin(Math.min(1, k) * Math.PI) * 330;
    const rot = Math.min(200, k * 260);
    const crashed = t > jump + 1.2;
    const views = Math.round(interpolate(t, [S(a + 2) - 0.5, E(a + 2)], [0, 2000000], clamp));
    return (
      <Camera t={t} t0={t0} t1={t1} from={1.0} to={1.08} fx={900} punch={[jump + 1.2, S(a + 3) + 0.4]} shake={[jump + 1.2]}>
        <Backyard t={t} />
        <Svg>
          {!crashed ? <g transform={`translate(760 ${1000 - up}) rotate(${-rot} 0 -240)`}><Person x={0} y={0} look={YOU} mood={k > 0.4 ? "shocked" : "happy"} t={t} pose="cheer" /></g>
            : <g transform="translate(760 990) rotate(-90)"><Person x={0} y={0} look={YOU} mood="sleepy" t={t} /></g>}
          {crashed && [0, 1, 2].map((i) => <g key={i} transform={`translate(${700 + Math.cos(t * 4 + i * 2) * 60} ${760 + Math.sin(t * 4 + i * 2) * 20})`}><path d="M 0 -14 L 4 -4 L 14 -4 L 6 3 L 9 14 L 0 7 L -9 14 L -6 3 L -14 -4 L -4 -4 Z" fill={P.gold} /></g>)}
          <SkillBar t={t} a={jump - 0.3} x={760} y={150} label="Backflip tutorial · 50%" stop={0.5} dur={0.8} w={460} />
          <Person x={1450} y={1000} look={THEO} mood={t > S(a + 2) - 0.2 ? "happy" : "neutral"} t={t} {...say(t, "THEO")} flip pose="phone" holding={<rect x={-26} y={-44} width={52} height={88} rx={8} fill="#141A28" />} />
          {t > S(a + 2) - 0.3 && <Phone x={1560} y={560} s={0.55} t={t}><rect x={-154} y={-300} width={308} height={600} fill="#7BBF7A" /><g transform="translate(0 240) scale(0.5) rotate(-90)"><Person x={0} y={0} look={YOU} mood="sleepy" t={t} /></g>
            <rect x={-150} y={170} width={300} height={120} fill="rgba(0,0,0,0.55)" /><text x={0} y={220} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={34} fill={P.white}>{views.toLocaleString("en-US")}</text><text x={0} y={262} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={24} fill="#AEB6CC">views</text></Phone>}
          {t > S(a + 3) && <g transform={`translate(1500 820) scale(${pop(t, S(a + 3) + D(a + 3) * 0.6)})`}><rect x={-180} y={-44} width={360} height={88} rx={44} fill="#3A4256" /><text y={14} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={36} fill={P.white}>EARNED: $0.00</text></g>}
        </Svg>
        <Chip t={t} at={t0 + 0.2} text="DAY 2" />
      </Camera>
    );
  },

  flip: ({ t, t0, t1 }) => {
    const a = first("flip");
    const shopping = t < S(a + 3) - 0.15;
    const n = Math.round(interpolate(t, [S(a + 3), E(a + 3)], [1, 11], clamp));
    return (
      <Camera t={t} t0={t0} t1={t1} from={1.02} to={1.1} fx={960} fy={600} punch={[S(a + 2) + D(a + 2) * 0.5, S(a + 5) + 0.2]}>
        <Garage t={t} />
        <Svg>
          {shopping && <>
            <History t={t} a={S(a) + 0.4} x={120} y={180} rows={[3]} hi={3} s={0.95} />
            <g transform={`translate(1350 860)`}><Chair x={0} y={0} s={1.3} color={t > S(a + 1) + D(a + 1) * 0.5 ? "#C98A4E" : "#8A8070"} tag={t > S(a + 1) + D(a + 1) * 0.3 ? "$15" : undefined} />
              {t > S(a + 1) + D(a + 1) * 0.4 && t < E(a + 1) && [0, 1, 2, 3].map((i) => <circle key={i} cx={Math.sin(t * 9 + i) * 60} cy={-200 + i * 40} r={6} fill="#FFE2A8" opacity={0.7} />)}</g>
            <Person x={950} y={1000} look={YOU} mood="happy" t={t} lookX={1} pose="hold" holding={<rect x={-20} y={-14} width={60} height={28} rx={6} fill="#C9A14A" />} />
            <SkillBar t={t} a={S(a + 1)} x={950} y={440} label="Flipping furniture · 62%" stop={0.62} dur={D(a + 1) + D(a + 2) * 0.4} w={460} />
          </>}
          {!shopping && <>
            {Array.from({ length: n }, (_, i) => <Chair key={i} x={300 + (i % 6) * 240} y={i < 6 ? 980 : 760} s={i < 6 ? 0.95 : 0.8} color={["#C98A4E", "#B97A42", "#D29A5E", "#A86E3A"][i % 4]} />)}
            <Person x={1500} y={1000} look={THEO} mood={t > S(a + 4) ? "happy" : "neutral"} t={t} {...say(t, "THEO")} flip pose={t > S(a + 4) && t < E(a + 4) ? "point" : "stand"} />
            {t > S(a + 4) - 0.3 && <Person x={420} y={1000} look={YOU} mood={t > S(a + 5) ? "angry" : "nervous"} t={t} {...say(t, "YOU")} lookX={1} pose={t > S(a + 5) && t < E(a + 5) ? "shrug" : "stand"} />}
            <Label t={t} at={S(a + 3) + D(a + 3) * 0.6} until={S(a + 4)} x={960} y={300} text="SOLD: 0" size={60} bg={P.red} color={P.white} rot={-5} />
          </>}
        </Svg>
        <Chip t={t} at={S(a + 3) + 0.2} text="DAY 6" />
      </Camera>
    );
  },

  chess: ({ t, t0, t1 }) => {
    const a = first("chess");
    const fact = t < S(a + 3) - 0.15;
    const win = Math.min(9, Math.max(0, Math.floor(interpolate(t, [S(a + 6), E(a + 7)], [0, 9], clamp))));
    if (fact) return (
      <Camera t={t} t0={t0} t1={S(a + 3)} from={1.0} to={1.08} punch={[S(a + 1) + 0.3]}>
        <Bedroom t={t} night={false} />
        <Svg>
          <History t={t} a={S(a) + 0.4} x={120} y={200} rows={[4]} hi={4} s={0.95} />
          <Board t={t} x={600} y={720} size={300} />
          <Person x={1500} y={1000} look={YOU} mood="smug" t={t} flip lookX={-1} pose="hold" holding={<g><rect x={-30} y={-20} width={60} height={50} rx={8} fill={P.white} /><rect x={-24} y={-26} width={48} height={10} rx={4} fill="#8E6646" /></g>} />
          <Label t={t} at={S(a + 2) + 0.3} x={1500} y={330} text="400 HOURS · 100%" size={36} bg={P.green} color={P.white} />
        </Svg>
        {card(t, S(a + 1) + 0.2, E(a + 1) + 0.2, "MAGNUS CARLSEN · FIDE", "2882", "the highest rating in chess history (2014)", "#3F5F4A", 960, 420, 760)}
      </Camera>
    );
    return (
      <Camera t={t} t0={S(a + 3) - 0.3} t1={t1} from={1.06} to={1.0} fx={960} fy={620} punch={[S(a + 5) + 0.4, S(a + 9) + 0.2]}>
        <Park t={t} />
        <Svg>
          {[560, 1360].map((x) => <g key={x}><rect x={x - 70} y={880} width={140} height={24} rx={10} fill="#5E6A80" /><rect x={x - 12} y={904} width={24} height={96} fill="#4A5468" /><Shadow cx={x} cy={1000} rx={80} /></g>)}
          <Person x={1360} y={1000} look={HUSTLER} mood={t > S(a + 5) ? (t > S(a + 8) ? "shocked" : "angry") : "smug"} t={t} {...say(t, "HUSTLER")} flip lookX={-1} pose={t > E(a + 11) - 0.5 ? "shrug" : "sit"} />
          <Person x={560} y={1000} look={YOU} mood={t > S(a + 5) ? "smug" : "neutral"} t={t} {...say(t, "YOU")} lookX={1} pose="sit" />
          <g transform="translate(0 70)"><ChessTable t={t} /></g>
          <SkillBar t={t} a={S(a + 4) + 0.2} x={560} y={340} label="Chess · watched to the end" stop={1} dur={1.2} w={440} />
          {t > S(a + 6) && <g transform={`translate(960 160) scale(${pop(t, S(a + 6))})`}><rect x={-230} y={-50} width={460} height={100} rx={50} fill="rgba(16,20,32,0.85)" />
            {Array.from({ length: 9 }, (_, i) => <circle key={i} cx={-176 + i * 44} cy={0} r={16} fill={i < win ? P.green : "#3A4256"} />)}</g>}
          {t > S(a + 10) - 0.2 && t < S(a + 11) - 0.2 && <Bubble t={t} at={S(a + 10)} until={E(a + 10)} cx={960} cy={360} r={190} id="wsp" bg="#3F5F4A">
            <Board t={t} x={190} y={180} size={200} /><text x={190} y={340} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={24} fill={P.cream}>NEW YORK · 2016</text>
          </Bubble>}
          {t > S(a + 12) - 0.2 && <Label t={t} at={S(a + 12) + 0.2} x={1360} y={340} text="MANAGER: 25%" size={34} bg={P.gold} />}
        </Svg>
        {t > S(a + 3) && t < S(a + 4) && card(t, S(a + 3) + 0.2, E(a + 3), "PARK CHESS", "$5–$20", "a game, blitz, against the hustlers", P.green, 120, 120, 640)}
        <Chip t={t} at={S(a + 3) + 0.2} text={t > S(a + 11) ? "DAY 15" : "DAY 8"} />
      </Camera>
    );
  },

  cost: ({ t, t0, t1 }) => {
    const a = first("cost");
    const burst = S(a + 1) + D(a + 1) * 0.75;
    const water = interpolate(t, [burst, E(a + 3)], [0, 260], clamp);
    return (
      <Camera t={t} t0={t0} t1={t1} from={1.0} to={1.08} fx={700} punch={[burst, S(a + 5) + 0.2]} shake={[burst]}>
        <Kitchen t={t} water={water} />
        <Svg>
          {t > burst && Array.from({ length: 14 }, (_, i) => { const k = ((t * 1.6 + i / 14) % 1); return <circle key={i} cx={330 + Math.cos(i) * k * 220} cy={600 - Math.sin(k * Math.PI) * 220 + k * 60} r={10 - k * 6} fill="#5FA8D3" opacity={1 - k} />; })}
          <Person x={620} y={1000} look={YOU} mood={t > burst ? "shocked" : "happy"} t={t} {...say(t, "YOU")} lookX={-1} pose={t > burst ? "shrug" : "hold"} holding={t > burst ? undefined : <rect x={-8} y={-50} width={16} height={90} rx={6} fill="#AEB6CC" transform="rotate(30)" />} sweat={t > burst} />
          <SkillBar t={t} a={S(a + 1) + 0.3} x={620} y={230} label="Fix a leaking sink · 12%" stop={0.12} dur={D(a + 1) * 0.6} w={460} />
          {t > S(a + 4) - 0.3 && <Person x={1300} y={1000} look={THEO} mood="nervous" t={t} {...say(t, "THEO")} flip lookX={-1} pose="phone" holding={<rect x={-26} y={-44} width={52} height={88} rx={8} fill="#141A28" />} />}
          <Label t={t} at={S(a + 3) + 0.3} until={S(a + 4)} x={1150} y={430} text="PLUMBER: $860" size={44} bg={P.red} color={P.white} />
        </Svg>
        {t > S(a + 2) - 0.15 && t < S(a + 3) && card(t, S(a + 2) + 0.2, E(a + 2) + 0.2, "INSURANCE INFORMATION INSTITUTE", "$15,400", "the average water damage claim", "#3F87C4", 960, 360, 760)}
        <Chip t={t} at={S(a + 1) + 0.2} text={t > S(a + 6) ? "DAY 20" : "DAY 17"} />
      </Camera>
    );
  },

  uncle: ({ t, t0, t1 }) => {
    const a = first("uncle");
    const field = t >= S(a + 2) - 0.15;
    if (!field) return (
      <Camera t={t} t0={t0} t1={S(a + 2)} from={1.0} to={1.1} fx={1100} punch={[S(a) + 0.3]}>
        <Garage t={t} />
        <Svg>
          {Array.from({ length: 11 }, (_, i) => <Chair key={i} x={300 + (i % 6) * 240} y={i < 6 ? 980 : 760} s={i < 6 ? 0.95 : 0.8} color={["#C98A4E", "#B97A42", "#D29A5E", "#A86E3A"][i % 4]} />)}
          <Person x={1500} y={1000} look={THEO} mood="happy" t={t} {...say(t, "THEO")} flip pose="cheer" />
          <Bubble t={t} at={S(a + 1) + 0.3} cx={1250} cy={330} r={190} fromX={1480} fromY={560} id="ray" bg="#5E7A9A"><g transform="translate(190 250) scale(0.5)"><Cessna x={0} y={0} t={t} /></g></Bubble>
        </Svg>
      </Camera>
    );
    return (
      <Camera t={t} t0={S(a + 2) - 0.3} t1={t1} from={1.0} to={1.08} fx={900}>
        <Airfield t={t} />
        <Svg>
          <Cessna x={1000} y={700} s={1.2} t={0} />
          <Person x={1500} y={1000} look={RAY} mood="happy" t={t} {...say(t, "UNCLE RAY")} flip lookX={-1} pose="wave" />
          <Person x={480} y={1000} look={YOU} mood={t > S(a + 3) ? "nervous" : "happy"} t={t} lookX={1} />
          <Person x={260} y={1000} look={THEO} mood="happy" t={t} lookX={1} />
          {t > S(a + 3) && <History t={t} a={S(a + 3) + 0.2} x={560} y={150} rows={[5]} hi={5} s={0.9} />}
          {t > S(a + 4) && <Label t={t} at={S(a + 4) + 0.3} x={960} y={500} text="WHAT COULD GO WRONG?" size={44} />}
        </Svg>
      </Camera>
    );
  },

  flight: ({ t, t0, t1 }) => {
    const a = first("flight");
    const inside = t < S(a + 9) - 0.15; // in the cabin until the approach
    if (inside) {
      const slumped = t > S(a + 2);
      return (
        <Camera t={t} t0={t0} t1={S(a + 9)} from={1.02} to={1.12} fx={960} fy={560} punch={[S(a + 2) + 0.2, S(a + 3) + 0.2, S(a + 7) + 0.4]} shake={[S(a + 2)]}>
          <Backdrop base="#2B3448" light="#4A5A80" cx={50} cy={30}>
            {/* windshield: sky and the ground far below */}
            <path d="M 300 110 Q 960 40 1620 110 L 1680 380 Q 960 340 240 380 Z" fill="#8FC3E6" />
            <path d="M 270 310 Q 960 280 1650 310 L 1680 380 Q 960 340 240 380 Z" fill="#7BBF7A" />
            {[0, 1, 2].map((i) => <ellipse key={i} cx={((t * 30 + i * 500) % 1500) + 260} cy={160 + i * 40} rx={110} ry={26} fill={P.white} opacity={0.9} />)}
            <rect x={160} y={390} width={1600} height={110} rx={20} fill="#1E2638" />
            {[0, 1, 2, 3, 4, 5].map((i) => <g key={i} transform={`translate(${360 + i * 240} 445)`}><circle r={44} fill="#141A28" /><line x1={0} y1={0} x2={Math.cos(t * (i + 1) * 0.7) * 32} y2={Math.sin(t * (i + 1) * 0.7) * 32} stroke={P.white} strokeWidth={4} /></g>)}
          </Backdrop>
          <Svg>
            <g transform={`translate(1380 ${1060 + (slumped ? 60 : 0)}) rotate(${slumped ? -22 : 0} 0 -350)`}><Person x={0} y={0} look={{ ...RAY, acc: ["headphones"] }} mood={slumped ? "sleepy" : t > S(a + 1) ? "nervous" : "happy"} t={t} {...say(t, "UNCLE RAY")} flip lookX={-1} s={1.1} /></g>
            <Person x={560} y={1060} look={{ ...YOU, acc: ["headphones"] }} mood={t > S(a + 7) ? "deadpan" : t > S(a + 2) ? "shocked" : "happy"} t={t} {...say(t, "YOU")} s={1.1} lookX={1} pose={t > S(a + 4) ? "phone" : "stand"} holding={t > S(a + 4) ? <rect x={-14} y={-40} width={28} height={70} rx={8} fill="#141A28" /> : undefined} />
            {t > S(a + 3) - 0.3 && <Bubble t={t} at={S(a + 3) - 0.2} until={E(a + 3) + 0.2} cx={960} cy={300} r={150} id="theoback" bg="#3A4256"><g transform="translate(150 380) scale(0.6)"><Person x={0} y={0} look={THEO} mood="shocked" t={t} {...say(t, "THEO")} pose="cheer" /></g></Bubble>}
            {t > S(a + 5) - 0.3 && t < S(a + 8) && <Bubble t={t} at={S(a + 5) - 0.2} until={E(a + 7)} cx={1000} cy={260} r={150} id="tower" bg="#5E7A9A"><g transform="translate(150 200)"><rect x={-24} y={-20} width={48} height={170} fill="#C9D2DE" /><path d="M -80 -20 L 80 -20 L 60 -100 L -60 -100 Z" fill="#3F5F8A" /><rect x={-56} y={-90} width={112} height={50} fill="#8FC3E6" /></g></Bubble>}
            {t > S(a + 8) - 0.15 && t < S(a + 9) && <Bubble t={t} at={S(a + 8)} until={E(a + 8)} cx={960} cy={300} r={170} id="fl22" bg="#2B3448"><g transform="translate(170 240) scale(0.5)"><Cessna x={0} y={0} t={t} /></g><text x={170} y={320} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={26} fill={P.cream}>FLORIDA · 2022</text></Bubble>}
            <SkillBar t={t} a={S(a + 4) + 0.2} x={760} y={220} label="Land a plane in an emergency" stop={0.71} dur={30} w={520} />
          </Svg>
          {t > S(a + 3) - 0.3 && t < S(a + 9) && <div style={{ position: "absolute", top: 120, right: 160, fontFamily: font, fontWeight: 900, fontSize: 40, color: "#FFC870", background: "rgba(16,20,32,0.8)", borderRadius: 18, padding: "8px 20px" }}>MAYDAY</div>}
          <Chip t={t} at={t0 + 0.2} text="DAY 29 · 3,000 FT" />
        </Camera>
      );
    }
    // the approach
    const k = interpolate(t, [S(a + 9), E(a + 12) + 1.2], [0.15, 1], clamp);
    const alt = interpolate(t, [S(a + 9), S(a + 9) + D(a + 9) * 0.6, E(a + 9), S(a + 13) + D(a + 13) * 0.5], [500, 300, 100, 0], clamp);
    const stalled = t > S(a + 10) && t < S(a + 12) + 0.6;
    const landed = t > S(a + 13) + D(a + 13) * 0.55;
    return (
      <AbsoluteFill>
        <Cockpit t={t} k={landed ? 1 : k} alt={alt} stalled={stalled} />
        <Svg>
          <SkillBar t={t} a={S(a + 9)} x={960} y={190} label="Land a plane · you fell asleep here" stop={0.71} dur={D(a + 9) + 0.4} w={600} />
          {t > S(a + 11) - 0.2 && t < E(a + 12) + 0.5 && <Bubble t={t} at={S(a + 11) - 0.2} until={E(a + 12) + 0.4} cx={1560} cy={420} r={170} id="theoend" bg="#3A4256"><g transform="translate(170 420) scale(0.62)"><Person x={0} y={0} look={THEO} mood="shocked" t={t} {...say(t, "THEO")} pose="point" /></g></Bubble>}
          {t > S(a + 12) && t < S(a + 13) + 0.6 && ["POWER: IDLE", "PULL BACK SLOWLY", "NOSE UP", "LET IT FLOAT"].map((s, i) => <Label key={i} t={t} at={S(a + 12) + D(a + 12) * (i * 0.17)} x={420} y={300 + i * 90} text={s} size={34} bg={P.gold} />)}
          {landed && <g transform={`translate(960 420) scale(${pop(t, S(a + 13) + D(a + 13) * 0.55)})`}><rect x={-260} y={-60} width={520} height={120} rx={60} fill={P.green} /><text y={20} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={60} fill={P.white}>TOUCHDOWN</text></g>}
        </Svg>
      </AbsoluteFill>
    );
  },

  payoff: ({ t, t0, t1 }) => {
    const a = first("payoff");
    const door = t >= S(a + 2) - 0.15;
    if (!door) return (
      <Camera t={t} t0={t0} t1={S(a + 2)} from={1.0} to={1.08} punch={[S(a + 1) + 0.2]}>
        <Airfield t={t} />
        <Svg>
          <Cessna x={1000} y={700} s={1.2} t={0} />
          <Person x={1450} y={1000} look={RAY} mood="happy" t={t} {...say(t, "UNCLE RAY")} flip lookX={-1} pose="hold" holding={<g><rect x={-50} y={-30} width={100} height={60} rx={6} fill="#6FD38F" /><circle r={16} fill="none" stroke="#1E5A3A" strokeWidth={4} /></g>} />
          <Person x={560} y={1000} look={YOU} mood="happy" t={t} lookX={1} pose="cheer" />
          <Person x={330} y={1000} look={THEO} mood="happy" t={t} lookX={1} pose="wave" />
          <Label t={t} at={S(a) + D(a) * 0.4} x={1450} y={330} text="LOW BLOOD SUGAR" size={32} />
          <Label t={t} at={S(a + 1) + 0.2} x={1100} y={460} text="+$1,500" size={56} bg={P.green} color={P.white} rot={-5} />
        </Svg>
      </Camera>
    );
    return (
      <Camera t={t} t0={S(a + 2) - 0.3} t1={t1} from={1.0} to={1.08} fx={1000} punch={[S(a + 3) + 0.3]}>
        <Hallway t={t} />
        <Svg>
          <Person x={1240} y={1000} look={LANDLORD} mood={t > S(a + 3) ? "shocked" : "neutral"} t={t} {...say(t, "LANDLORD")} flip lookX={-1} pose="hold" holding={<rect x={-40} y={-26} width={80} height={52} rx={6} fill={P.cream} />} />
          <Person x={620} y={1000} look={YOU} mood="smug" t={t} lookX={1} />
          {t > S(a + 4) - 0.2 && <Person x={380} y={1000} look={THEO} mood="happy" t={t} lookX={1} />}
          <Label t={t} at={S(a + 2) + D(a + 2) * 0.4} x={960} y={160} text="PAID · ON THE 1ST" size={44} bg={P.green} color={P.white} />
          {t > S(a + 4) && <g transform={`translate(960 440) scale(${pop(t, S(a + 4) + 0.3)})`}><rect x={-330} y={-60} width={660} height={120} rx={24} fill="rgba(16,20,32,0.85)" /><text x={-160} y={18} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={42} fill="#7FE3DD">THE HANDS</text><text y={18} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={42} fill={P.white}>+</text><text x={160} y={18} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={42} fill="#FFB37A">THE ENDING</text></g>}
        </Svg>
        <Chip t={t} at={S(a + 2) + 0.2} text="DAY 30" />
      </Camera>
    );
  },

  theo: ({ t, t0, t1 }) => {
    const a = first("theo");
    return (
      <Camera t={t} t0={t0} t1={t1} from={1.0} to={1.1} fx={1150} punch={[S(a + 2) + 0.2, S(a + 3) + 0.3]}>
        <Bedroom t={t} />
        <Svg>
          <Person x={1300} y={1000} look={THEO} mood={t > S(a + 2) ? "nervous" : "happy"} t={t} {...say(t, "THEO")} flip lookX={-1} pose={t < E(a) ? "cheer" : "stand"} sweat={t > S(a + 2)} />
          <Person x={600} y={1000} look={YOU} mood={t > S(a + 2) ? "angry" : "smug"} t={t} {...say(t, "YOU")} lookX={1} />
          {t > S(a + 1) - 0.2 && t < S(a + 2) + 0.5 && <g transform={`translate(560 140) scale(${pop(t, S(a + 1))})`}>
            <rect x={-20} y={-80} width={860} height={330} rx={30} fill="#F7F8FB" /><text x={20} y={-28} fontFamily={font} fontWeight={900} fontSize={36} fill={P.ink}>Theo's watch history</text>
            {[["Satisfying soap cutting #412", "#C9A0FF", 1], ["How to tell your best friend you scratched his car", "#E25C5C", 0.03]].map(([title, c, pct], i) => (
              <g key={i} transform={`translate(0 ${i * 120})`} opacity={i === 1 ? ease(t, S(a + 1) + D(a + 1) * 0.55, S(a + 1) + D(a + 1) * 0.6) : 1}>
                <rect width={150} height={86} rx={10} fill={c as string} /><rect y={80} width={150} height={6} fill="#C9CED8" /><rect y={80} width={150 * (pct as number)} height={6} fill="#FF3B3B" />
                <text x={176} y={36} fontFamily={font} fontWeight={800} fontSize={i ? 24 : 28} fill={P.ink}>{title}</text><text x={176} y={72} fontFamily={font} fontWeight={700} fontSize={24} fill={i ? P.red : "#7C8296"}>{i ? "Stopped at 3%" : "1,200 hours"}</text>
              </g>))}
          </g>}
          {t > S(a + 2) && <g transform={`translate(1600 440) scale(${pop(t, S(a + 2) + 0.2)})`}><rect x={-120} y={-70} width={240} height={140} rx={16} fill="#5E7A9A" /><path d="M -90 30 L 60 -40" stroke={P.white} strokeWidth={8} strokeLinecap="round" /><text y={110} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={30} fill={P.red}>YOUR CAR</text></g>}
        </Svg>
      </Camera>
    );
  },

  tease: ({ t, t0, t1 }) => {
    const a = first("tease");
    const knock = S(a + 2);
    return (
      <Camera t={t} t0={t0} t1={t1} from={1.0} to={1.3} fx={900} fy={520} shake={[knock + 0.3, knock + 0.9]}>
        <Bedroom t={t} />
        <Svg>
          <Person x={700} y={1000} look={YOU} mood={t > S(a + 1) ? "shocked" : "sleepy"} t={t} lookX={1} pose="phone" holding={<rect x={-26} y={-44} width={52} height={88} rx={8} fill="#141A28" />} />
          <Glow cx={980} cy={420} r={300} color="#9FC8FF" opacity={0.4} id="phglow" />
          <Phone x={1160} y={440} s={0.75} t={t}>
            <rect x={-154} y={-300} width={308} height={600} fill="#F7F8FB" />
            <text x={-130} y={-230} fontFamily={font} fontWeight={900} fontSize={28} fill={P.ink}>New in history</text>
            {t > S(a) + D(a) * 0.5 && <g><rect x={-130} y={-190} width={260} height={150} rx={12} fill="#C2384A" /><path d="M -16 -150 h 32 v 34 h 34 v 32 h -34 v 34 h -32 v -34 h -34 v -32 h 34 Z" fill={P.white} />
              <rect x={-130} y={-46} width={260} height={8} fill="#C9CED8" /><rect x={-130} y={-46} width={260 * 0.04} height={8} fill="#FF3B3B" />
              <text x={-130} y={10} fontFamily={font} fontWeight={800} fontSize={26} fill={P.ink}>How to perform</text><text x={-130} y={44} fontFamily={font} fontWeight={800} fontSize={26} fill={P.ink}>surgery</text>
              <text x={-130} y={86} fontFamily={font} fontWeight={700} fontSize={22} fill={P.red}>4% watched</text></g>}
          </Phone>
          {t > knock && [0, 1, 2].map((i) => { const k = ease(t, knock + i * 0.35, knock + i * 0.35 + 0.6); return <text key={i} x={300 + i * 30} y={300 - i * 60} fontFamily={font} fontWeight={900} fontSize={60} fill={P.white} opacity={1 - k}>KNOCK</text>; })}
        </Svg>
      </Camera>
    );
  },

  endcard: ({ t, t0, t1 }) => (
    <Camera t={t} t0={t0} t1={t1} from={1} to={1.05}>
      <Backdrop base="#11162A" light="#26305A"><Bokeh t={t} /><DotLine t={t} y={900} /></Backdrop>
      <Svg><History t={t} a={t0 + 0.2} x={540} y={120} rows={[1, 2, 5]} s={0.95} /></Svg>
      <Title t={t} at={t0 + 0.6} words={"WHICH VIDEO WOULD YOU FINISH FIRST?".split(" ")} accent={["FINISH", "FIRST?"]} size={86} y={300} />
    </Camera>
  ),
};

// ---------- overlays ----------
const moneyAt = (t: number) => {
  const k: [number, number][] = [
    [S(first("goal")), 210], [S(at("flip", 5)), 210], [E(at("flip", 6)), 40], [S(at("chess", 6)), 40], [S(at("chess", 11)), 900],
    [S(at("cost", 3)), 900], [E(at("cost", 3)), 40], [S(at("payoff", 1)), 40], [E(at("payoff", 1)), 1540], [S(at("payoff", 2)) + 1, 1540], [S(at("payoff", 2)) + 2.5, 140],
  ];
  return Math.round(interpolate(t, k.map((x) => x[0]), k.map((x) => x[1]), clamp));
};
const dayAt = (t: number) => {
  const k: [number, number][] = [[first("half"), 2], [at("flip", 3), 6], [at("chess", 3), 8], [at("chess", 11), 15], [at("cost", 1), 17], [at("cost", 6), 20], [first("flight"), 29], [at("payoff", 2), 30]];
  let d = 1;
  for (const [i, n] of k) if (t >= S(i) - 0.2) d = n;
  return d;
};
const HUD: React.FC<{ t: number; shot: string }> = ({ t, shot }) => {
  if (!["goal", "half", "flip", "chess", "cost", "uncle", "payoff"].includes(shot)) return null;
  if (t < S(first("goal")) + D(first("goal")) * 0.8) return null;
  const m = moneyAt(t);
  return (
    <>
      <Counter label="DAY" value={`${dayAt(t)} / 30`} x={1640} y={40} color="#9FE3FF" />
      <Counter label="MONEY · RENT $1,400" value={`$${m.toLocaleString("en-US")}`} x={1500} y={170} color={m >= 1400 ? "#6FD38F" : m < 100 ? "#FF6B6B" : "#9FE3C0"} />
    </>
  );
};

const SPEAKER_COLOR: Record<string, string> = { NARRATOR: "#FFFFFF", YOU: "#7FE3DD", THEO: "#FFB37A", HUSTLER: "#B9E3A8", "UNCLE RAY": "#FFE08A", TOWER: "#B3D4FF", LANDLORD: "#E2C6FF" };
const Captions: React.FC<{ t: number }> = ({ t }) => {
  const line = L.find((l) => t >= l.start && t <= l.end + 0.15);
  if (!line || line.scene === "endcard") return null;
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 46 }}>
      <div style={{ maxWidth: 1500, background: "rgba(16,20,32,0.72)", borderRadius: 18, padding: "12px 28px", fontFamily: font,
        fontWeight: 800, fontSize: 46, lineHeight: 1.25, textAlign: "center", color: SPEAKER_COLOR[line.who] ?? "#F4D58D" }}>
        {line.caption ?? line.text}
      </div>
    </AbsoluteFill>
  );
};

const XF = 0.4;
export const Episode: React.FC<{ captions?: boolean }> = ({ captions = true }) => {
  const { t } = useT();
  let k = 0;
  while (k + 1 < SHOTS.length && t >= shotStart(k + 1)) k++;
  const shot = SHOTS[k];
  const Shot = shots[shot.name];
  const t0 = shotStart(k), t1 = k + 1 < SHOTS.length ? shotStart(k + 1) : DURATION;
  const Prev = k > 0 && t < t0 + XF ? shots[SHOTS[k - 1].name] : null;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {Prev && <AbsoluteFill><Prev t={t} t0={shotStart(k - 1)} t1={t0} /></AbsoluteFill>}
      <AbsoluteFill style={{ opacity: Prev ? ease(t, t0, t0 + XF) : 1 }}><Shot t={t} t0={t0} t1={t1} /></AbsoluteFill>
      <HUD t={t} shot={shot.name} />
      {captions && <Captions t={t} />}
      {!("estimated" in timeline) && <Audio src={staticFile("watched/mix.wav")} />}
    </AbsoluteFill>
  );
};
