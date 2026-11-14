// "What If You Could Stop Time for 10 Seconds a Day?" Shots are keyed by each line's `scene` and timed
// from public/stoptime/timeline.json; mouths follow public/stoptime/lips.json.
// Motif: when time stops, a ripple goes out, the world turns blue-grey and still, "you" stay in full colour,
// and the stopwatch (top right) counts down today's 10 seconds. Clarity rule: youtube/motion.md.
import React from "react";
import { AbsoluteFill, Audio, interpolate, staticFile } from "remotion";
import timeline from "../../public/stoptime/timeline.json";
import lips from "../../public/stoptime/lips.json";
import { P, useT, ease, pop, Camera, Bokeh, Glow, Backdrop, Person, YOU, THEO, extra, Chip, StatCard, Title, DotLine, Look, Lip } from "../ll/kit";
import { Label } from "../dr/Episode";
import { Bedroom, Kitchen, Phone } from "../wt/Episode";

type Line = (typeof timeline.lines)[number] & { caption?: string };
const L: Line[] = timeline.lines as Line[];
export const DURATION = timeline.duration;
const S = (i: number) => L[i].start;
const E = (i: number) => L[i].end;
const D = (i: number) => E(i) - S(i);
const font = "'Inter Display', Inter, sans-serif";
const first = (scene: string) => L.findIndex((l) => l.scene === scene);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const beatOf = (t: number, a: number, n: number) => { let b = 0; for (let k = 0; k < n; k++) if (t >= S(a + k) - 0.15) b = k; return b; };
// piecewise-linear value over [time, value] keys
const keys = (t: number, k: [number, number][]) => interpolate(t, k.map((x) => x[0]), k.map((x) => x[1]), clamp);

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
const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>{children}</svg>;

// ---------- cast ----------
const MOM: Look = { skin: P.skin, hair: "#5A3A2A", top: "#C66B7A", topDark: "#A85563", hairStyle: "long" };
const DAD: Look = { skin: P.skin, hair: "#2B211C", top: "#5E7A9A", topDark: "#4A6280", hairStyle: "short", mustache: "#2B211C", tall: 1.05 };
const AVA: Look = { skin: P.skin2, hair: "#7A3A1E", top: "#E25C7A", topDark: "#C2465F", hairStyle: "long" };
const BRAD: Look = { skin: P.skin, hair: "#C9A050", top: "#C0413A", topDark: "#A0342E", hairStyle: "short", tall: 1.08 };
const COACH: Look = { skin: P.skin3, hair: "#1E1A18", top: "#3F5F8A", topDark: "#2F4A6E", hairStyle: "bald", tall: 1.05 };
const HOST: Look = { skin: P.skin2, hair: "#1E1A18", top: "#1F2433", topDark: "#141820", hairStyle: "short", tall: 1.06, acc: ["bowtie"] };
const KID: Look = { skin: P.skin, hair: "#6B4E36", top: "#F2B640", topDark: "#D9A030", hairStyle: "curly" };

// ---------- the motif ----------
const ICE = "#7FB8FF";
// the world while time is stopped: drained of colour, a little blue
export const Frozen: React.FC<{ on: number; children: React.ReactNode }> = ({ on, children }) => (
  <AbsoluteFill style={{ filter: on > 0.01 ? `saturate(${1 - 0.8 * on}) brightness(${1 - 0.1 * on})` : undefined }}>
    {children}
    <AbsoluteFill style={{ background: "#4A78C8", opacity: 0.16 * on, mixBlendMode: "multiply" }} />
  </AbsoluteFill>
);
// the ring that goes out the moment time stops
const Ripple: React.FC<{ t: number; at: number; x?: number; y?: number }> = ({ t, at: a, x = 960, y = 540 }) => {
  const k = ease(t, a, a + 0.9);
  if (t < a || k >= 1) return null;
  return <g>{[0, 0.15].map((d, i) => <circle key={i} cx={x} cy={y} r={60 + Math.max(0, k - d) * 1500} fill="none" stroke={ICE} strokeWidth={14 * (1 - k)} opacity={1 - k} />)}</g>;
};
// how frozen the world is: 0 -> 1 at `a`, back to 0 at `b`
const frz = (t: number, a: number, b: number) => Math.min(ease(t, a, a + 0.3), 1 - ease(t, b, b + 0.3));
// the stopwatch in the corner: today's seconds left
const Watch: React.FC<{ v: number; on?: boolean; x?: number; y?: number; s?: number }> = ({ v, on = false, x = 1440, y = 30, s = 1 }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `scale(${s})`, transformOrigin: "left top", display: "flex", alignItems: "center", gap: 16,
    background: "rgba(14,19,32,0.88)", borderRadius: 26, padding: "12px 24px 12px 14px", border: `4px solid ${on ? ICE : "#3A4256"}` }}>
    <svg width={76} height={76} viewBox="-40 -44 80 84">
      <rect x={-8} y={-44} width={16} height={10} rx={3} fill="#C9D2DE" /><circle r={34} fill="#1F2433" stroke="#C9D2DE" strokeWidth={5} />
      <path d={`M 0 0 L 0 -30 A 30 30 0 ${v > 5 ? 1 : 0} 1 ${30 * Math.sin((v / 10) * 2 * Math.PI)} ${-30 * Math.cos((v / 10) * 2 * Math.PI)} Z`} fill={v < 3.5 ? "#FF6B6B" : ICE} />
    </svg>
    <div style={{ fontFamily: font, textAlign: "right" }}>
      <div style={{ color: "#AEB6CC", fontSize: 18, fontWeight: 800, letterSpacing: 3 }}>TIME STOP LEFT TODAY</div>
      <div style={{ color: v < 3.5 ? "#FF6B6B" : ICE, fontSize: 50, fontWeight: 900, fontVariantNumeric: "tabular-nums" }}>{v.toFixed(1)} s</div>
    </div>
  </div>
);
// the frozen fly / falling object hint: dashed motion line ending at a held position
const Held: React.FC<{ x: number; y: number; dx: number; dy: number }> = ({ x, y, dx, dy }) => (
  <line x1={x - dx} y1={y - dy} x2={x} y2={y} stroke={ICE} strokeWidth={5} strokeDasharray="10 10" opacity={0.8} />
);

// ---------- props ----------
export const Ball: React.FC<{ x: number; y: number; r?: number; c?: string }> = ({ x, y, r = 46, c = "#E25C5C" }) => (
  <g><circle cx={x} cy={y} r={r} fill={c} /><path d={`M ${x - r} ${y} Q ${x} ${y - r * 0.5} ${x + r} ${y}`} stroke="#A83A3A" strokeWidth={5} fill="none" /><circle cx={x - r * 0.35} cy={y - r * 0.35} r={r * 0.2} fill={P.white} opacity={0.4} /></g>
);
const PhoneSmall: React.FC<{ x: number; y: number; rot?: number; c?: string; s?: number }> = ({ x, y, rot = 0, c = "#2B2B36", s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}><rect x={-18} y={-32} width={36} height={64} rx={7} fill={c} /><rect x={-14} y={-26} width={28} height={50} rx={4} fill="#9FC8FF" /></g>
);
const Pizza: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}><path d="M -40 -20 L 40 -20 L 0 60 Z" fill="#F2B640" /><rect x={-44} y={-30} width={88} height={16} rx={8} fill="#C98E56" />{[[-14, 0], [12, 4], [0, 28]].map(([a, b], i) => <circle key={i} cx={a} cy={b} r={7} fill="#C0413A" />)}</g>
);
const Card: React.FC<{ x: number; y: number; rot?: number; s?: number }> = ({ x, y, rot = 0, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}><rect x={-30} y={-42} width={60} height={84} rx={7} fill={P.white} stroke="#AEB6CC" strokeWidth={2} /><text y={14} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={34} fill={P.red}>A</text><path d="M -18 26 q 8 -8 16 0 t 16 0" stroke="#3F5F8A" strokeWidth={3} fill="none" /></g>
);
const Bottle: React.FC<{ x: number; y: number; card?: boolean; s?: number }> = ({ x, y, card = false, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}><rect x={-34} y={-150} width={68} height={150} rx={20} fill="#BFE3F6" opacity={0.75} /><rect x={-16} y={-180} width={32} height={34} rx={6} fill="#3F7FA8" />
    {card && <Card x={0} y={-70} rot={-8} s={0.8} />}<rect x={-34} y={-110} width={68} height={40} fill="#3F7FA8" opacity={0.6} /></g>
);
const Bus: React.FC<{ x: number; y?: number }> = ({ x, y = 1000 }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-420} y={-400} width={840} height={350} rx={40} fill="#3E9C97" /><rect x={-420} y={-130} width={840} height={30} fill="#2F7C78" />
    {Array.from({ length: 5 }, (_, i) => <rect key={i} x={-380 + i * 150} y={-360} width={120} height={140} rx={10} fill="#BFE3F6" />)}
    <rect x={-420} y={-400} width={840} height={36} rx={18} fill="#2F7C78" /><rect x={-150} y={-396} width={300} height={28} rx={6} fill="#1F2433" /><text y={-374} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={22} fill="#FFC844">42 DOWNTOWN</text>
    <circle cx={-420} cy={-90} r={18} fill="#FFE6B0" /><Glow cx={-420} cy={-90} r={120} color="#FFE6B0" opacity={0.6} id={`hl${Math.round(x)}`} />
    {[-260, 260].map((wx) => <g key={wx}><circle cx={wx} cy={-40} r={56} fill="#2B2B36" /><circle cx={wx} cy={-40} r={22} fill="#8A8F9C" /></g>)}
  </g>
);

// ---------- sets ----------
export const Gym: React.FC<{ t: number }> = ({ t }) => (
  <Backdrop base="#C98E56" light="#F0C690" cx={50} cy={25}>
    {Array.from({ length: 6 }, (_, r) => <rect key={r} x={0} y={140 + r * 50} width={1920} height={40} fill={r % 2 ? "#8E6646" : "#7A563A"} />)}
    <rect x={560} y={50} width={800} height={80} rx={14} fill="#C0413A" /><text x={960} y={106} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={48} fill={P.white}>NORTHVIEW GYM</text>
    <rect x={1660} y={130} width={14} height={300} fill="#5A5F6C" /><rect x={1560} y={150} width={200} height={130} rx={8} fill={P.white} opacity={0.9} /><circle cx={1660} cy={300} r={46} fill="none" stroke={P.red} strokeWidth={8} />
    <rect x={80} y={300} width={240} height={140} rx={10} fill="#1F2433" /><text x={200} y={360} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={34} fill="#FFC844">HOME 3</text><text x={200} y={410} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={34} fill="#FFC844">AWAY 2</text>
    <rect y={440} width={1920} height={640} fill="#D9A46A" /><line x1={960} y1={440} x2={960} y2={1080} stroke={P.white} strokeWidth={8} opacity={0.8} /><ellipse cx={960} cy={760} rx={360} ry={90} fill="none" stroke={P.white} strokeWidth={8} opacity={0.8} />
    {[200, 1720].map((x) => <g key={x}>{[0, 1, 2].map((i) => <Ball key={i} x={x + i * 50 - 50} y={1010} r={26} c={i % 2 ? "#E9894E" : "#E25C5C"} />)}</g>)}
    <Bokeh t={t} n={8} opacity={0.1} />
  </Backdrop>
);
const Stairs: React.FC<{ t: number }> = ({ t }) => (
  <Backdrop base="#D9D2C4" light="#F6F1E6" cx={50} cy={20}>
    <rect x={0} y={0} width={1920} height={1080} fill="#CFC7B8" />
    {/* three floors of stairwell: railings and landings */}
    {[0, 1, 2].map((f) => <g key={f}><rect x={260} y={240 + f * 260} width={1400} height={22} fill="#8A93A5" />{Array.from({ length: 15 }, (_, i) => <rect key={i} x={280 + i * 92} y={140 + f * 260} width={8} height={100} fill="#8A93A5" />)}<rect x={260} y={130 + f * 260} width={1400} height={14} rx={7} fill="#5A5F6C" />
      <text x={1700} y={200 + f * 260} fontFamily={font} fontWeight={900} fontSize={40} fill="#5A5F6C">{3 - f}F</text></g>)}
    <rect y={900} width={1920} height={180} fill="#B8B0A1" />
    <rect x={60} y={300} width={140} height={60} rx={8} fill="#2E8B57" /><text x={130} y={342} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={30} fill={P.white}>EXIT</text>
    <Bokeh t={t} n={6} opacity={0.1} />
  </Backdrop>
);
const Park: React.FC<{ t: number; fountain?: boolean }> = ({ t, fountain = false }) => (
  <Backdrop base="#9CCB8E" light="#E6F4D8" cx={50} cy={20}>
    {[0, 1].map((i) => <ellipse key={i} cx={((t * 14 + i * 900) % 2200) - 140} cy={100 + i * 60} rx={130} ry={32} fill={P.white} opacity={0.9} />)}
    {Array.from({ length: 7 }, (_, i) => <rect key={i} x={i * 290 - 40} y={260 + (i % 3) * 40} width={240} height={420} fill={["#B8C4D4", "#A3B0C4", "#C9D2DE"][i % 3]} />)}
    {[160, 1760].map((x) => <g key={x}><rect x={x - 20} y={420} width={40} height={360} fill="#7A563A" /><circle cx={x} cy={400} r={140} fill="#6DB46F" /></g>)}
    <rect y={780} width={1920} height={300} fill="#C9C2B4" />
    {fountain && <g><ellipse cx={960} cy={860} rx={420} ry={80} fill="#8A93A5" /><ellipse cx={960} cy={850} rx={390} ry={64} fill="#7FB8E6" /><rect x={930} y={640} width={60} height={210} fill="#AEB6CC" /><ellipse cx={960} cy={640} rx={130} ry={26} fill="#AEB6CC" />
      {Array.from({ length: 8 }, (_, i) => { const k = ((t * 0.8 + i / 8) % 1); return <circle key={i} cx={960 + Math.cos(i * 0.8) * 120 * k} cy={620 - Math.sin(k * Math.PI) * 120} r={9} fill="#BFE3F6" opacity={1 - k} />; })}
      {Array.from({ length: 14 }, (_, i) => <circle key={i} cx={680 + (i * 43) % 560} cy={845 + (i * 17) % 30} r={8} fill="#F2B640" />)}
      <text x={960} y={960} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={30} fill="#5A5F6C">CITY PARK FOUNTAIN</text></g>}
  </Backdrop>
);
const Street: React.FC<{ t: number }> = ({ t }) => (
  <Backdrop base="#E9A07A" light="#FFE0B0" cx={50} cy={10}>
    {Array.from({ length: 8 }, (_, i) => <g key={i}><rect x={i * 250 - 30} y={250 + (i % 3) * 50} width={230} height={520} fill={["#8E6E7A", "#7A6A8A", "#9A7A7A"][i % 3]} />
      {Array.from({ length: 6 }, (_, k) => <rect key={k} x={i * 250 + (k % 2) * 100} y={300 + (i % 3) * 50 + Math.floor(k / 2) * 110} width={70} height={70} fill="#F4D58D" opacity={0.8} />)}</g>)}
    <rect y={700} width={1920} height={80} fill="#AEB6CC" /><rect y={700} width={1920} height={12} fill="#C9D2DE" />
    <rect y={780} width={1920} height={300} fill="#5A5F6C" />{Array.from({ length: 8 }, (_, i) => <rect key={i} x={i * 260} y={920} width={150} height={14} fill={P.white} opacity={0.8} />)}
    <g transform="translate(1600 700)"><rect x={-6} y={-260} width={12} height={260} fill="#2B2B36" /><rect x={-80} y={-260} width={160} height={50} rx={8} fill="#2E8B57" /><text y={-226} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={24} fill={P.white}>MAIN ST</text></g>
    <text x={960} y={760} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={28} fill="#5A5F6C">SIDEWALK</text>
    <Bokeh t={t} n={8} opacity={0.12} color="#FFE6B0" />
  </Backdrop>
);
const Stadium: React.FC<{ t: number; clock: string; phones?: number; fireworks?: boolean }> = ({ t, clock, phones = 1, fireworks = false }) => (
  <Backdrop base="#141A33" light="#3A4A80" cx={50} cy={20}>
    {fireworks && Array.from({ length: 5 }, (_, i) => { const k = ((t * 0.5 + i / 5) % 1); return <g key={i}>{Array.from({ length: 12 }, (_, j) => <circle key={j} cx={300 + i * 330 + Math.cos(j * 0.52) * 160 * k} cy={200 + (i % 2) * 80 + Math.sin(j * 0.52) * 160 * k} r={8 * (1 - k) + 2} fill={["#FFC844", "#FF6B9A", "#7FB8FF", "#4DE08A", "#FF8A4A"][i]} opacity={1 - k} />)}</g>; })}
    {/* stands: rows of fans, each with a phone light */}
    {Array.from({ length: 6 }, (_, r) => <g key={r}><rect x={0} y={330 + r * 70} width={1920} height={66} fill={r % 2 ? "#20284A" : "#252E55"} />
      {Array.from({ length: 30 }, (_, i) => <g key={i}><circle cx={20 + i * 65 + (r % 2) * 30} cy={350 + r * 70} r={16} fill={["#3A4766", "#4A5A80", "#2C3852"][(i + r) % 3]} />
        {(i * 7 + r * 3) % 10 < phones * 10 && <circle cx={34 + i * 65 + (r % 2) * 30} cy={336 + r * 70} r={5} fill="#FFF4C0" opacity={0.6 + 0.4 * Math.sin(t * 3 + i + r)} />}</g>)}</g>)}
    {/* the giant clock */}
    <rect x={710} y={70} width={500} height={150} rx={18} fill="#0A0E1A" stroke="#FFC844" strokeWidth={6} /><text x={960} y={175} textAnchor="middle" fontFamily="'Courier New', monospace" fontWeight={900} fontSize={96} fill="#FFC844">{clock}</text>
    <text x={960} y={250} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={30} fill={P.cream}>NEW YEAR'S LIVE · $1,000,000 CHALLENGE</text>
    {/* the stage */}
    <rect y={760} width={1920} height={320} fill="#2B2B36" /><rect x={260} y={740} width={1400} height={40} rx={10} fill="#5A5F6C" />
    {[400, 960, 1520].map((x) => <Glow key={x} cx={x} cy={760} r={300} color="#FFE6B0" opacity={0.2} id={`stg${x}`} />)}
  </Backdrop>
);
const Exterior: React.FC<{ t: number }> = ({ t }) => (
  <Backdrop base="#141A33" light="#3A4A80" cx={50} cy={10}>
    {Array.from({ length: 30 }, (_, i) => <circle key={i} cx={(i * 131) % 1920} cy={60 + (i * 53) % 240} r={2.5} fill={P.white} opacity={0.3 + 0.6 * Math.abs(Math.sin(t + i))} />)}
    <path d="M 160 800 L 160 380 Q 960 200 1760 380 L 1760 800 Z" fill="#3A4256" /><rect x={160} y={480} width={1600} height={20} fill="#FFC844" opacity={0.6} />
    <text x={960} y={440} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={60} fill={P.cream}>CITY STADIUM</text>
    {[560, 960, 1360].map((x) => <rect key={x} x={x - 90} y={560} width={180} height={240} rx={8} fill="#F4D58D" opacity={0.85} />)}
    <rect y={800} width={1920} height={280} fill="#5A5F6C" />
    {[60, 1860].map((x) => <g key={x}><rect x={x - 8} y={380} width={16} height={420} fill="#2B2B36" /><circle cx={x} cy={370} r={26} fill="#FFE6B0" /><Glow cx={x} cy={370} r={140} color="#FFE6B0" opacity={0.5} id={`lmp${x}`} /></g>)}
  </Backdrop>
);

// ---------- shots ----------
const shots: Record<string, React.FC<ShotProps>> = {
  cold_open: ({ t, t0, t1 }) => {
    const a = first("cold_open");
    const b = beatOf(t, a, 7);
    const go = S(a + 5);
    const f = frz(t, S(a), go);
    const turn = ease(t, S(a + 4) + D(a + 4) * 0.4, S(a + 4) + D(a + 4) * 0.9);
    const side = ease(t, S(a + 4), S(a + 4) + D(a + 4) * 0.35);
    // the ball: frozen in front of your face, turned around, then flies back at Brad after time restarts
    const fly = ease(t, go, go + 0.6);
    const bx = interpolate(fly, [0, 1], [interpolate(turn, [0, 1], [700, 760]), 1380]);
    const by = interpolate(fly, [0, 1], [610, 560]);
    const hit = t > go + 0.6;
    const v = keys(t, [[S(a), 10], [S(a + 3) + D(a + 3) * 0.6, 7.2], [go, 5.9]]);
    const yx = 620 - side * 200;
    return (
      <Camera t={t} t0={t0} t1={t1} from={b === 0 ? 1.25 : 1.0} to={b === 0 ? 1.3 : 1.06} fx={700} fy={600} punch={[go + 0.6]} shake={[go + 0.6]}>
        <Frozen on={f}>
          <Gym t={f > 0.5 ? 0 : t} />
          <Svg>
            <Person x={1400} y={1000} look={BRAD} mood={hit ? "shocked" : "smug"} t={f > 0.5 ? 0 : t} flip lookX={-1} pose={hit ? "shrug" : "point"} />
            <Person x={1720} y={1000} look={COACH} mood="shocked" t={f > 0.5 ? 0 : t} flip pose="hold" holding={<rect x={-10} y={-40} width={20} height={40} rx={6} fill="#C9D2DE" />} />
            <Person x={260} y={1000} look={THEO} mood={b === 6 ? "shocked" : "happy"} t={f > 0.5 ? 0 : t} {...say(t, "THEO")} lookX={1} />
            {/* the fly */}
            <g transform={`translate(${1420 + (f > 0.5 ? 0 : Math.sin(t * 9) * 30)} ${380 + (f > 0.5 ? 0 : Math.cos(t * 11) * 20)})`}><ellipse rx={12} ry={8} fill="#2B2B36" /><ellipse cx={-6} cy={-10} rx={10} ry={6} fill={P.white} opacity={0.7} /><ellipse cx={6} cy={-10} rx={10} ry={6} fill={P.white} opacity={0.7} /></g>
          </Svg>
        </Frozen>
        <Svg>
          {/* you stay in colour */}
          <Person x={yx} y={1000} look={YOU} mood={b >= 5 ? "smug" : b >= 2 ? "nervous" : "shocked"} t={t} {...say(t, "YOU")} lookX={b === 4 ? 1 : 0} pose={b === 4 && turn > 0 ? "hold" : "stand"} sweat={b <= 2} />
          {!hit && <Ball x={bx} y={by} />}
          {!hit && f > 0.5 && b <= 1 && <Held x={700} y={610} dx={-300} dy={-30} />}
          {hit && <Ball x={1380 + (t - go - 0.6) * 300} y={560 + (t - go - 0.6) * 400} />}
          <Ripple t={t} at={S(a) + 0.05} x={700} y={600} />
          {b === 0 && <Label t={t} at={S(a) + D(a) * 0.5} x={700} y={460} text="4 INCHES" size={34} bg={ICE} />}
          {b === 1 && <Label t={t} at={S(a + 1) + D(a + 1) * 0.15} x={960} y={200} text="EVERYTHING IS FROZEN" size={48} bg={ICE} />}
          {b === 1 && <Label t={t} at={S(a + 1) + D(a + 1) * 0.75} x={1420} y={320} text="EVEN THE FLY" size={28} />}
          {b === 4 && <path d={`M 700 610 Q 1000 ${520} 1380 560`} stroke="#FFC844" strokeWidth={8} strokeDasharray="14 12" fill="none" opacity={turn} />}
          {b === 5 && <Label t={t} at={go + 0.1} x={960} y={200} text="TIME STARTS AGAIN" size={44} bg="#FFC844" />}
        </Svg>
        {b >= 3 && <Watch v={v} on={f > 0.5} />}
        {b <= 2 && <Chip t={t} at={t0 + 0.2} text="GYM CLASS · 10:14 A.M." />}
      </Camera>
    );
  },

  promise: ({ t, t0, t1 }) => {
    const a = first("promise");
    const items = [{ k: 0.35, x: 360, txt: "GO VIRAL", c: "#FF6B6B" }, { k: 0.5, x: 960, txt: "$1,000,000", c: "#4DE08A" }, { k: 0.72, x: 1560, txt: "WHAT 10 SECONDS ARE WORTH", c: ICE }];
    return (
      <Camera t={t} t0={t0} t1={t1}>
        <Backdrop base={P.night} light={P.nightHi}><Bokeh t={t} /></Backdrop>
        <Svg>
          {items.map((it, i) => {
            const p = pop(t, S(a) + D(a) * it.k);
            return p > 0 ? <g key={i} transform={`translate(${it.x} 480) scale(${p})`}>
              <Glow cx={0} cy={0} r={260} color={it.c} opacity={0.3} id={`pr${i}`} /><circle r={190} fill="#F7E3B8" /><circle r={176} fill="#2C3852" />
              {i === 0 && <g><rect x={-110} y={-80} width={220} height={140} rx={16} fill="#141A28" /><path d="M -20 -30 L 30 -5 L -20 20 Z" fill={P.white} /><text y={110} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={34} fill="#FF6B6B">90M VIEWS?</text></g>}
              {i === 1 && <g>{[0, 1, 2, 3, 4].map((k) => <g key={k} transform={`translate(${(k % 2) * 10 - 5} ${60 - k * 22})`}><rect x={-80} y={-12} width={160} height={20} rx={4} fill="#5FA862" stroke="#3F7A42" strokeWidth={2} /></g>)}</g>}
              {i === 2 && <g><rect x={-14} y={-130} width={28} height={20} rx={4} fill="#C9D2DE" /><circle r={100} fill="#1F2433" stroke="#C9D2DE" strokeWidth={10} /><path d="M 0 0 L 0 -86 A 86 86 0 1 1 -50 -70 Z" fill={ICE} /></g>}
              <text y={250} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={36} fill={it.c}>{it.txt}</text>
            </g> : null;
          })}
          <Label t={t} at={S(a) + 0.2} x={960} y={130} text="10 SECONDS A DAY" size={48} bg={ICE} />
        </Svg>
      </Camera>
    );
  },

  rules: ({ t, t0, t1 }) => {
    const a = first("rules");
    const b = beatOf(t, a, 5);
    if (b === 0) {
      const split = ease(t, S(a) + D(a) * 0.3, S(a) + D(a) * 0.5);
      return (
        <Camera t={t} t0={t0} t1={S(a + 1)} from={1.0} to={1.05}>
          <Backdrop base="#1E2638" light="#3A4766"><Bokeh t={t} n={12} opacity={0.15} /></Backdrop>
          <Svg>
            {/* 10 seconds as one block, then broken into pieces */}
            {Array.from({ length: 10 }, (_, i) => <g key={i}><rect x={260 + i * 110 + split * [0, 0, 30, 30, 30, 60, 60, 60, 60, 90][i]} y={420} width={100} height={120} rx={14} fill={ICE} opacity={0.9} />
              <text x={310 + i * 110 + split * [0, 0, 30, 30, 30, 60, 60, 60, 60, 90][i]} y={500} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={44} fill="#1F2433">1s</text></g>)}
            <Label t={t} at={S(a) + D(a) * 0.1} x={820} y={330} text="10 SECONDS A DAY · TOTAL" size={44} bg={ICE} />
            <Label t={t} at={S(a) + D(a) * 0.45} x={820} y={650} text="ALL AT ONCE OR IN PIECES" size={36} />
            {/* midnight refill */}
            <g transform="translate(1600 480)" opacity={ease(t, S(a) + D(a) * 0.7, S(a) + D(a) * 0.8)}><circle r={150} fill={P.cream} stroke="#3F5F8A" strokeWidth={14} />{Array.from({ length: 12 }, (_, i) => <rect key={i} x={-4} y={-140} width={8} height={22} fill="#3F5F8A" transform={`rotate(${i * 30})`} />)}
              <line x1={0} y1={0} x2={0} y2={-110} stroke={P.ink} strokeWidth={12} strokeLinecap="round" /><line x1={0} y1={0} x2={0} y2={-80} stroke={P.ink} strokeWidth={16} strokeLinecap="round" />
              <Label t={t} at={S(a) + D(a) * 0.78} x={0} y={230} text="MIDNIGHT: REFILL" size={36} bg="#FFC844" /></g>
          </Svg>
        </Camera>
      );
    }
    if (b === 1) {
      const lift = ease(t, S(a + 1) + D(a + 1) * 0.2, S(a + 1) + D(a + 1) * 0.5);
      return (
        <Camera t={t} t0={S(a + 1) - 0.3} t1={S(a + 2)} from={1.0} to={1.05}>
          <Frozen on={1}>
            <Kitchen t={0} />
            <Svg><rect x={1140} y={700} width={140} height={110} rx={10} fill="#F4F6FA" /><circle cx={1210} cy={690} r={30} fill="#E25C5C" /><Label t={t} at={S(a + 1) + D(a + 1) * 0.6} x={1210} y={600} text="NOT TOUCHED: FROZEN" size={28} bg={ICE} /></Svg>
          </Frozen>
          <Svg>
            <Person x={700} y={1000} look={YOU} mood="smug" t={t} lookX={1} pose="hold" holding={<g transform={`translate(0 ${-lift * 40})`}><rect x={-26} y={-50} width={52} height={60} rx={8} fill="#F2B640" /><rect x={-26} y={-30} width={52} height={14} fill="#C0413A" /></g>} />
            <Label t={t} at={S(a + 1) + 0.2} x={760} y={480} text="TOUCHED: MOVES" size={32} bg="#4DE08A" />
          </Svg>
          <Watch v={9} on />
        </Camera>
      );
    }
    if (b === 2) {
      const run = ease(t, S(a + 2) + 0.3, S(a + 2) + D(a + 2) * 0.45);
      return (
        <Camera t={t} t0={S(a + 2) - 0.3} t1={S(a + 3)} from={1.0} to={1.04}>
          <Backdrop base="#C9775A" light="#F0A080" cx={50} cy={20}>
            <rect y={0} width={1920} height={360} fill="#2C3852" />{Array.from({ length: 60 }, (_, i) => <circle key={i} cx={(i * 37) % 1920} cy={240 + (i % 4) * 30} r={12} fill={["#3A4766", "#4A5A80"][i % 2]} />)}
            {[0, 1, 2, 3].map((i) => <rect key={i} x={0} y={460 + i * 120} width={1920} height={6} fill={P.white} opacity={0.8} />)}
          </Backdrop>
          <Svg>
            <rect x={1700} y={440} width={10} height={380} fill={P.white} /><text x={1720} y={430} fontFamily={font} fontWeight={900} fontSize={28} fill={P.white}>FINISH · 100 M</text>
            <g transform={`translate(${200 + run * 1440} 0)`}><Person x={0} y={820} look={{ skin: P.skin3, hair: "#1E1A18", top: "#F2B640", topDark: "#2E8B57", hairStyle: "short", tall: 1.1 }} mood="happy" t={t * 3} s={0.8} />
              {[1, 2, 3].map((k) => <rect key={k} x={-200 - k * 60} y={560 + k * 30} width={140} height={8} rx={4} fill={P.white} opacity={0.6 * run * (1 - run)} />)}</g>
            {/* light: a beam that crosses the screen in no time */}
            <line x1={0} y1={960} x2={1920 * ease(t, S(a + 2) + D(a + 2) * 0.6, S(a + 2) + D(a + 2) * 0.62)} y2={960} stroke="#FFF4C0" strokeWidth={10} opacity={t > S(a + 2) + D(a + 2) * 0.6 ? 1 : 0} />
          </Svg>
          <StatCard t={t} at={S(a + 2) + D(a + 2) * 0.3} until={S(a + 2) + D(a + 2) * 0.58} x={180} y={70} w={760} title="USAIN BOLT · BERLIN 2009" big="9.58 s" sub="100 meters. World record." color="#2E8B57" />
          <StatCard t={t} at={S(a + 2) + D(a + 2) * 0.6} x={980} y={70} w={760} title="LIGHT IN 10 SECONDS" big="3,000,000 km" sub="about 75 times around the Earth" color="#3F5F8A" />
        </Camera>
      );
    }
    const grab = S(a + 3) + D(a + 3) * 0.5;
    const f = frz(t, S(a + 3) + 0.2, grab + 0.4);
    return (
      <Camera t={t} t0={S(a + 3) - 0.3} t1={t1} from={1.0} to={1.08} fx={1100} punch={[S(a + 4)]}>
        <Frozen on={f}>
          <Kitchen t={f > 0.5 ? 0 : t} />
          <Svg>
            <Person x={1150} y={1000} look={DAD} mood={b === 4 ? "shocked" : "happy"} t={f > 0.5 ? 0 : t} flip lookX={-1} pose="hold" holding={t < grab ? <Pizza x={0} y={0} s={0.8} /> : undefined} />
            <Person x={1500} y={1000} look={MOM} mood={b === 4 ? "shocked" : "neutral"} t={f > 0.5 ? 0 : t} {...say(t, "MOM")} flip lookX={-1} />
          </Svg>
        </Frozen>
        <Svg>
          <Person x={interpolate(t, [S(a + 3), grab, grab + 0.4], [600, 980, 600], clamp)} y={1000} look={YOU} mood="smug" t={t} lookX={1} pose={t > grab ? "hold" : "stand"} holding={t > grab ? <Pizza x={0} y={0} s={0.8} /> : undefined} />
          <Ripple t={t} at={S(a + 3) + 0.2} x={800} y={600} />
          {b === 4 && <Label t={t} at={S(a + 4) + 0.3} x={1150} y={330} text="EMPTY HAND" size={32} bg="#FFC844" />}
        </Svg>
        <Watch v={keys(t, [[S(a + 3), 10], [grab + 0.4, 9]])} on={f > 0.5} />
      </Camera>
    );
  },

  school: ({ t, t0, t1 }) => {
    const a = first("school");
    const b = beatOf(t, a, 6);
    if (b <= 1) {
      const panels: [string, string][] = [["0.5 s", "CATCH YOUR PHONE"], ["2 s", "FINISH THE TEST"], ["1 s", "FIRST IN LINE"]];
      return (
        <Camera t={t} t0={t0} t1={S(a + 2)} from={1.0} to={1.04}>
          <Backdrop base="#2C3852" light="#4A5A80"><Bokeh t={t} n={10} opacity={0.15} /></Backdrop>
          <Svg>
            {panels.map(([s, w], i) => {
              const p = pop(t, S(a + 1) + D(a + 1) * (0.05 + i * 0.3));
              return <g key={i} transform={`translate(${380 + i * 580} 560) scale(${p})`}>
                <rect x={-250} y={-320} width={500} height={560} rx={30} fill={["#5E7A9A", "#2F5545", "#E9894E"][i]} /><rect x={-250} y={-320} width={500} height={560} rx={30} fill="none" stroke={P.cream} strokeWidth={10} />
                {i === 0 && <g><g transform="translate(-40 200) scale(0.7)"><Person x={0} y={0} look={YOU} mood="smug" t={t} pose="hold" holding={<PhoneSmall x={0} y={0} />} /></g><Held x={20} y={40} dx={0} dy={-60} /></g>}
                {i === 1 && <g><rect x={-150} y={-120} width={300} height={220} rx={10} fill={P.white} />{[0, 1, 2, 3].map((k) => <g key={k}><rect x={-120} y={-90 + k * 48} width={170} height={12} rx={6} fill="#AEB6CC" /><path d={`M 80 ${-86 + k * 48} l 12 14 l 24 -26`} stroke="#4DBE8A" strokeWidth={8} fill="none" /></g>)}</g>}
                {i === 2 && <g>{[0, 1, 2, 3].map((k) => <g key={k} transform={`translate(${-120 + k * 80} 200) scale(0.45)`}><Person x={0} y={0} look={k === 0 ? YOU : extra(k)} mood={k === 0 ? "happy" : "deadpan"} t={t} /></g>)}<rect x={-200} y={-140} width={400} height={70} rx={10} fill={P.cream} /><text y={-92} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={34} fill={P.ink}>LUNCH</text></g>}
                <text y={-250} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={34} fill={P.white}>{w}</text>
                <g transform="translate(0 -190)"><rect x={-70} y={-30} width={140} height={56} rx={16} fill="rgba(14,19,32,0.85)" /><text y={10} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={34} fill={ICE}>{s}</text></g>
              </g>;
            })}
          </Svg>
          <Chip t={t} at={t0 + 0.2} text="WEDNESDAY" />
        </Camera>
      );
    }
    const stop = S(a + 2) + D(a + 2) * 0.6;
    const back = S(a + 3) + D(a + 3) * 0.6;
    const f = frz(t, stop, back);
    const fall = t < stop ? interpolate(t, [S(a + 2) + D(a + 2) * 0.3, stop], [330, 560], clamp) : 560;
    const caught = t > back - 0.2;
    return (
      <Camera t={t} t0={S(a + 2) - 0.3} t1={t1} from={1.0} to={1.06} fx={1000} fy={460}>
        <Frozen on={f}>
          <Stairs t={f > 0.5 ? 0 : t} />
          <Svg>
            <Person x={1250} y={370} look={AVA} mood={b >= 4 ? "shocked" : b >= 2 && t > S(a + 2) + D(a + 2) * 0.3 ? "shocked" : "happy"} t={f > 0.5 ? 0 : t} {...say(t, "AVA")} s={0.6} flip lookX={-1} pose={caught ? "hold" : "stand"} holding={caught ? <PhoneSmall x={0} y={0} c="#E25C7A" /> : undefined} />
            {!caught && t > S(a + 2) + D(a + 2) * 0.3 && <PhoneSmall x={1300} y={fall} rot={t * 400} c="#E25C7A" s={1.4} />}
          </Svg>
        </Frozen>
        <Svg>
          <Person x={interpolate(t, [stop, back - 0.3], [700, 1180], clamp)} y={interpolate(t, [stop, back - 0.3], [890, 370], clamp)} look={YOU} mood={b >= 5 ? "smug" : "happy"} t={t} {...say(t, "YOU")} s={interpolate(t, [stop, back - 0.3], [0.8, 0.6], clamp)} lookX={1} />
          <Ripple t={t} at={stop} x={1300} y={560} />
          {b === 2 && <Label t={t} at={S(a + 2) + 0.4} x={1250} y={140} text="AVA" size={34} bg="#E25C7A" color={P.white} />}
          {b === 2 && t > stop && <Label t={t} at={stop + 0.1} x={1520} y={600} text="3 FLOORS DOWN" size={28} bg={ICE} />}
          {b === 3 && <Label t={t} at={S(a + 3) + 0.2} x={960} y={140} text="0.8 SECONDS" size={44} bg={ICE} />}
        </Svg>
        <Watch v={keys(t, [[stop, 10], [back, 9.2]])} on={f > 0.5} />
      </Camera>
    );
  },

  idea: ({ t, t0, t1 }) => {
    const a = first("idea");
    const b = beatOf(t, a, 4);
    if (b <= 2) return (
      <Camera t={t} t0={t0} t1={S(a + 3)} from={1.0} to={1.12} fx={1180} fy={460}>
        <Bedroom t={t} />
        <Svg>
          <Person x={640} y={900} look={YOU} mood={b === 2 ? "smug" : "neutral"} t={t} pose="phone" lookX={1} holding={<rect x={-26} y={-44} width={52} height={88} rx={8} fill="#141A28" />} />
          <Glow cx={1240} cy={480} r={320} color="#9FC8FF" opacity={0.4} id="vidglow" />
          <Phone x={1240} y={480} s={0.85} t={t}>
            <rect x={-154} y={-300} width={308} height={600} fill="#141A28" />
            <rect x={-154} y={-230} width={308} height={180} fill="#3A4256" />
            <Card x={-40} y={-140} rot={-10} s={0.9} /><g transform="translate(50 -130)"><rect x={-20} y={-50} width={40} height={50} rx={8} fill="#2B2B36" /><path d="M -34 0 L 34 0" stroke="#2B2B36" strokeWidth={8} /></g>
            <text x={-138} y={-10} fontFamily={font} fontWeight={900} fontSize={22} fill={P.white}>Magic that looks real</text>
            <text x={-138} y={20} fontFamily={font} fontWeight={700} fontSize={18} fill="#AEB6CC">48M views</text>
            {b >= 1 && ["HOW?!", "HOW DID HE DO THAT", "edited", "HOW?"].map((c, i) => <g key={i} transform={`translate(0 ${70 + i * 50}) scale(${pop(t, S(a + 1) + i * 0.3)})`}><rect x={-138} y={-20} width={276} height={40} rx={10} fill="#2C3852" /><text x={-124} y={8} fontFamily={font} fontWeight={800} fontSize={20} fill={P.white}>{c}</text></g>)}
          </Phone>
          {b === 0 && <Label t={t} at={S(a) + D(a) * 0.6} x={1240} y={90} text="MAGIC MADE WITH EDITING" size={30} />}
          {b === 2 && <Label t={t} at={S(a + 2) + 0.2} x={640} y={330} text="NO EDITING NEEDED" size={36} bg={ICE} />}
        </Svg>
        {b === 0 && <Chip t={t} at={t0 + 0.2} text="THAT NIGHT" />}
      </Camera>
    );
    return (
      <Camera t={t} t0={S(a + 3) - 0.3} t1={t1} from={1.0} to={1.06}>
        <Bedroom t={t} night={false} />
        <Svg>
          <Person x={760} y={1000} look={YOU} mood="smug" t={t} lookX={1} />
          <Person x={1200} y={1000} look={THEO} mood="happy" t={t} {...say(t, "THEO")} flip lookX={-1} pose="hold" holding={<g><rect x={-40} y={-30} width={80} height={56} rx={10} fill="#2B2B36" /><circle cx={0} cy={-2} r={18} fill="#5A5F6C" /><circle cx={0} cy={-2} r={10} fill="#9FC8FF" /></g>} />
          <Label t={t} at={S(a + 3) + D(a + 3) * 0.6} x={980} y={330} text="50 / 50" size={56} bg="#FFC844" />
          <Label t={t} at={S(a + 3) + 0.3} x={1200} y={460} text="THEO: CAMERA" size={28} />
        </Svg>
      </Camera>
    );
  },

  viral: ({ t, t0, t1 }) => {
    const a = first("viral");
    const b = beatOf(t, a, 5);
    if (b === 0) {
      const stop = S(a) + D(a) * 0.45;
      const f = frz(t, stop, stop + 0.9);
      const done = t > stop + 0.5;
      return (
        <Camera t={t} t0={t0} t1={S(a + 1)} from={1.0} to={1.08} fx={1100}>
          <Frozen on={f}>
            <Park t={f > 0.5 ? 0 : t} />
            <Svg>
              <Person x={1250} y={1000} look={extra(1)} mood={done ? "shocked" : "happy"} t={f > 0.5 ? 0 : t} flip lookX={-1} pose="hold" holding={done ? <Bottle x={0} y={40} card s={0.6} /> : <Card x={0} y={0} />} />
              <g transform="translate(1420 900)"><path d="M -60 0 L 60 0 L 50 -110 L -50 -110 Z" fill="#8E6646" /><path d="M -40 -110 Q 0 -160 40 -110" stroke="#6B4E36" strokeWidth={10} fill="none" /><text y={-40} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={20} fill={P.cream}>HER BAG</text></g>
              <Person x={1650} y={1000} look={THEO} mood="happy" t={f > 0.5 ? 0 : t} flip pose="hold" holding={<rect x={-40} y={-30} width={80} height={56} rx={10} fill="#2B2B36" />} />
            </Svg>
          </Frozen>
          <Svg>
            <Person x={interpolate(t, [stop, stop + 0.3, stop + 0.6], [800, 1300, 800], clamp)} y={1000} look={YOU} mood="smug" t={t} lookX={1} />
            <Ripple t={t} at={stop} x={1250} y={600} />
            {done && <Label t={t} at={stop + 0.6} x={1250} y={330} text="HER CARD, IN A SEALED BOTTLE" size={30} bg="#FFC844" />}
          </Svg>
          <Watch v={keys(t, [[stop, 10], [stop + 0.9, 8.6]])} on={f > 0.5} />
          <Chip t={t} at={t0 + 0.2} text="VIDEO 1" />
        </Camera>
      );
    }
    if (b === 1) {
      const views = Math.round(interpolate(t, [S(a + 1), S(a + 1) + D(a + 1) * 0.4], [0, 3000000], clamp));
      return (
        <Camera t={t} t0={S(a + 1) - 0.3} t1={S(a + 2)} from={1.0} to={1.06}>
          <Bedroom t={t} />
          <Svg>
            <Phone x={960} y={520} s={1.1} t={t}>
              <rect x={-154} y={-300} width={308} height={600} fill="#141A28" />
              <rect x={-154} y={-260} width={308} height={170} fill="#3A4256" /><Bottle x={0} y={-100} card s={0.7} />
              <text x={-138} y={-50} fontFamily={font} fontWeight={900} fontSize={22} fill={P.white}>Her card. Sealed bottle.</text>
              <text x={-138} y={-10} fontFamily={font} fontWeight={900} fontSize={36} fill="#FF6B6B">{views.toLocaleString("en-US")}</text><text x={-138} y={16} fontFamily={font} fontWeight={700} fontSize={18} fill="#AEB6CC">views · 24 hours</text>
              {["fake", "edited", "HOW"].map((c, i) => <g key={i} transform={`translate(0 ${70 + i * 56}) scale(${pop(t, S(a + 1) + D(a + 1) * (0.5 + i * 0.12))})`}><rect x={-138} y={-22} width={276} height={44} rx={10} fill="#2C3852" /><text x={-124} y={8} fontFamily={font} fontWeight={800} fontSize={22} fill={P.white}>{c}</text></g>)}
            </Phone>
            <Label t={t} at={S(a + 1) + D(a + 1) * 0.55} x={1450} y={560} text="TOP COMMENT: FAKE" size={30} bg="#FF6B6B" color={P.white} />
          </Svg>
        </Camera>
      );
    }
    if (b <= 3) {
      const stop = S(a + 2) + D(a + 2) * 0.6;
      const f = frz(t, stop, stop + 1.0);
      const k = ease(t, stop, stop + 0.9);
      return (
        <Camera t={t} t0={S(a + 2) - 0.3} t1={S(a + 4)} from={1.0} to={1.06}>
          <Frozen on={f}>
            <Park t={f > 0.5 ? 0 : t} fountain />
            <Svg>
              {[300, 520, 1450].map((x, i) => <Person key={x} x={x} y={1000} look={extra(i + 2)} mood={t > stop + 1 ? "shocked" : "neutral"} t={f > 0.5 ? 0 : t} s={0.85} flip={x > 960} />)}
              <Person x={1700} y={1000} look={THEO} mood={b === 3 ? "happy" : "neutral"} t={f > 0.5 ? 0 : t} {...say(t, "THEO")} flip pose={b === 3 ? "cheer" : "hold"} holding={<rect x={-40} y={-30} width={80} height={56} rx={10} fill="#2B2B36" />} />
              {/* the stranger's hat */}
              <Person x={1250} y={1000} look={extra(4)} mood={t > stop + 1 ? "shocked" : "neutral"} t={f > 0.5 ? 0 : t} s={0.85} flip pose="hold" holding={<g><ellipse cx={0} cy={0} rx={60} ry={16} fill="#2B2B36" /><path d="M -40 0 L -36 -50 L 36 -50 L 40 0 Z" fill="#2B2B36" />{t > stop && Array.from({ length: 8 }, (_, i) => <circle key={i} cx={-30 + (i * 9) % 60} cy={-10 - (i % 3) * 8} r={8} fill="#F2B640" opacity={k} />)}</g>} />
            </Svg>
          </Frozen>
          <Svg>
            {t > stop && t < stop + 1 && Array.from({ length: 10 }, (_, i) => <circle key={i} cx={interpolate(k, [0, 1], [700 + i * 50, 1250])} cy={interpolate(k, [0, 1], [850, 600]) - Math.sin(k * Math.PI) * 200} r={9} fill="#F2B640" />)}
            <Person x={900} y={1000} look={YOU} mood="smug" t={t} lookX={1} pose="point" />
            <Ripple t={t} at={stop} x={960} y={700} />
            <Label t={t} at={stop + 0.4} x={1250} y={420} text="EVERY COIN, IN HIS HAT" size={30} bg="#FFC844" />
          </Svg>
          <div style={{ position: "absolute", left: 60, top: 40, display: "flex", gap: 14, fontFamily: font, fontWeight: 900, fontSize: 34, alignItems: "center" }}>
            <span style={{ background: "#E25C5C", color: P.white, borderRadius: 10, padding: "6px 16px" }}>LIVE</span>
            <span style={{ background: "rgba(14,19,32,0.85)", color: P.white, borderRadius: 10, padding: "6px 16px" }}>{Math.round(interpolate(t, [S(a + 2), stop], [120, 200], clamp))},000 WATCHING · NO CUTS</span>
          </div>
          <Watch v={keys(t, [[stop, 10], [stop + 1, 8.8]])} on={f > 0.5} />
        </Camera>
      );
    }
    return (
      <Camera t={t} t0={S(a + 4) - 0.3} t1={t1} from={1.0} to={1.06}>
        <Kitchen t={t} />
        <Svg>
          <Person x={700} y={1000} look={YOU} mood="happy" t={t} lookX={1} pose="phone" holding={<rect x={-26} y={-44} width={52} height={88} rx={8} fill="#141A28" />} />
          <Person x={1300} y={1000} look={MOM} mood="angry" t={t} flip lookX={-1} pose="point" />
          {[["BRAND DEAL", "$5,000"], ["BRAND DEAL", "$20,000"]].map(([w, m], i) => <g key={i} transform={`translate(${520 + i * 380} 260) scale(${pop(t, S(a + 4) + D(a + 4) * (0.15 + i * 0.25))})`}>
            <rect x={-170} y={-70} width={340} height={140} rx={18} fill={P.cream} /><text x={-140} y={-20} fontFamily={font} fontWeight={800} fontSize={24} fill="#7C8296">{w}</text><text x={-140} y={40} fontFamily={font} fontWeight={900} fontSize={60} fill="#2E8B57">{m}</text></g>)}
          <Label t={t} at={S(a + 4) + D(a + 4) * 0.75} x={1300} y={330} text="MOM: SUSPICIOUS" size={30} bg="#FF6B6B" color={P.white} />
        </Svg>
      </Camera>
    );
  },

  offer: ({ t, t0, t1 }) => {
    const a = first("offer");
    const b = beatOf(t, a, 4);
    if (b <= 1) return (
      <Camera t={t} t0={t0} t1={S(a + 2)} from={1.0} to={1.06}>
        <Backdrop base="#1E2638" light="#3A4766"><Bokeh t={t} n={12} opacity={0.15} /></Backdrop>
        <Svg>
          <g transform={`translate(960 520) scale(${pop(t, S(a) + 0.2)})`}>
            <rect x={-600} y={-330} width={1200} height={620} rx={26} fill={P.cream} /><rect x={-600} y={-330} width={1200} height={90} rx={26} fill="#3F5F8A" /><text x={-560} y={-270} fontFamily={font} fontWeight={900} fontSize={36} fill={P.white}>NEW EMAIL</text>
            <text x={-560} y={-180} fontFamily={font} fontWeight={800} fontSize={30} fill="#7C8296">Subject:</text><text x={-420} y={-180} fontFamily={font} fontWeight={900} fontSize={34} fill={P.ink}>One trick. $1,000,000.</text>
            {b === 1 && <g>
              <text x={-560} y={-90} fontFamily={font} fontWeight={800} fontSize={30} fill={P.ink}>New Year's Live · the biggest show in the country</text>
              <text x={-560} y={-30} fontFamily={font} fontWeight={800} fontSize={30} fill={P.ink}>One impossible trick, live, at 11:59 p.m.</text>
              <text x={-560} y={30} fontFamily={font} fontWeight={800} fontSize={30} fill={P.ink}>If 60,000 people can't explain it:</text>
              <text x={-560} y={150} fontFamily={font} fontWeight={900} fontSize={110} fill="#2E8B57">$1,000,000</text></g>}
          </g>
        </Svg>
      </Camera>
    );
    if (b === 2) {
      const k = (t - S(a + 2)) / D(a + 2);
      return (
        <Camera t={t} t0={S(a + 2) - 0.3} t1={S(a + 3)} from={1.0} to={1.04}>
          <Backdrop base="#F4ECE2" light="#FFFFFF">{Array.from({ length: 30 }, (_, i) => <rect key={i} x={i * 66} y={0} width={2} height={1080} fill="#DDE3EC" />)}</Backdrop>
          <Svg>
            {/* the plan, drawn like a sketch: stands around a stage, arrows of phones to the middle */}
            <ellipse cx={960} cy={600} rx={760} ry={380} fill="none" stroke="#3F5F8A" strokeWidth={10} /><ellipse cx={960} cy={600} rx={560} ry={250} fill="none" stroke="#3F5F8A" strokeWidth={6} strokeDasharray="20 14" />
            <rect x={860} y={540} width={200} height={120} rx={10} fill="#5A5F6C" /><text x={960} y={612} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={30} fill={P.white}>STAGE</text>
            {Array.from({ length: 12 }, (_, i) => { const an = i * Math.PI / 6; const p = Math.min(1, Math.max(0, k * 2 - i * 0.05)); return <g key={i}>
              <line x1={960 + Math.cos(an) * 660} y1={600 + Math.sin(an) * 320} x2={960 + Math.cos(an) * 660 * (1 - p * 0.75)} y2={600 + Math.sin(an) * 320 * (1 - p * 0.75)} stroke="#E25C5C" strokeWidth={6} />
              <PhoneSmall x={960 + Math.cos(an) * 660 * (1 - p * 0.8)} y={600 + Math.sin(an) * 320 * (1 - p * 0.8)} /></g>; })}
            <Label t={t} at={S(a + 2) + 0.3} x={960} y={140} text="60,000 PHONES → 1 PILE" size={48} bg="#FFC844" />
            <Label t={t} at={S(a + 2) + D(a + 2) * 0.7} x={960} y={1000 - 80} text="NEEDS 9 SECONDS" size={44} bg={ICE} />
          </Svg>
        </Camera>
      );
    }
    return (
      <Camera t={t} t0={S(a + 3) - 0.3} t1={t1} from={1.0} to={1.06}>
        <Kitchen t={t} />
        <Svg>
          <Pizza x={1240} y={640} s={1.2} /><rect x={1180} y={680} width={120} height={14} rx={7} fill="#E4E9F0" />
          <Person x={760} y={1000} look={YOU} mood="deadpan" t={t} lookX={1} />
          <Label t={t} at={S(a + 3) + D(a + 3) * 0.3} x={1240} y={540} text="NOT TODAY" size={32} bg="#FF6B6B" color={P.white} />
          <g transform="translate(1600 330)"><rect x={-130} y={-150} width={260} height={280} rx={16} fill={P.white} /><rect x={-130} y={-150} width={260} height={70} rx={16} fill="#E25C5C" /><text y={-100} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={40} fill={P.white}>DEC</text><text y={80} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={140} fill={P.ink}>31</text></g>
        </Svg>
        <Watch v={10} />
      </Camera>
    );
  },

  bus: ({ t, t0, t1 }) => {
    const a = first("bus");
    const b = beatOf(t, a, 6);
    const stop = S(a + 3) + 0.2;
    const go = S(a + 5) + 0.2;
    const f = frz(t, stop, go);
    if (b === 2) return (
      <Camera t={t} t0={S(a + 2) - 0.3} t1={S(a + 3)} from={1.0} to={1.04}>
        <Frozen on={0.6}><Street t={0} /><Svg><Bus x={300} /></Svg></Frozen>
        <Svg>
          {[["USE YOUR SECONDS", ICE], ["NO 9 SECONDS = NO TRICK", "#FFC844"], ["NO TRICK = NO $1,000,000", "#FF6B6B"]].map(([w, c], i) => <Label key={i} t={t} at={S(a + 2) + D(a + 2) * (0.1 + i * 0.28)} x={960} y={260 + i * 170} text={w} size={50} bg={c} color={i === 2 ? P.white : P.ink} />)}
        </Svg>
        <Watch v={10} />
      </Camera>
    );
    const busX = t < stop ? interpolate(t, [t0, stop], [-600, 260], clamp) : t < go ? 260 : interpolate(t, [go, go + 1.2], [260, 2600], clamp);
    const carry = ease(t, S(a + 4), S(a + 4) + D(a + 4) * 0.8);
    const kidX = t < stop ? interpolate(t, [t0, S(a + 1)], [1300, 960], clamp) : interpolate(carry, [0, 1], [960, 1420]);
    const kidY = interpolate(carry, [0, 1], [930, 760]);
    const v = keys(t, [[stop, 10], [S(a + 4) + D(a + 4) * 0.85, 3.4]]);
    return (
      <Camera t={t} t0={b <= 1 ? t0 : S(a + 3) - 0.3} t1={b <= 1 ? S(a + 2) : t1} from={1.0} to={1.07} fx={900} shake={b <= 1 ? [S(a + 1) + 0.3] : []}>
        <Frozen on={f}>
          <Street t={f > 0.5 ? 0 : t} />
          <Svg>
            {/* the kid and his ball: carried by you while time is stopped, so they stay in colour then */}
            {carry < 0.02 && <g><Ball x={kidX - 120} y={960} r={30} c="#4DBE8A" /><Person x={kidX} y={kidY + 60} look={KID} mood={b >= 1 && t > S(a + 1) ? "shocked" : "happy"} t={f > 0.5 ? 0 : t} s={0.6} flip lookX={-1} pose="point" /></g>}
            <Bus x={busX} />
          </Svg>
        </Frozen>
        <Svg>
          {carry >= 0.02 && <g><Person x={kidX} y={kidY + 60} look={KID} mood={t > go ? "happy" : "shocked"} t={t > go ? t : 0} s={0.6} flip pose="hold" holding={carry > 0.9 ? <Ball x={0} y={0} r={30} c="#4DBE8A" /> : undefined} /></g>}
          {b >= 3 && <Person x={t < S(a + 4) ? 700 : kidX - 140} y={t < S(a + 4) ? 760 : kidY + 120} look={YOU} mood={t > go ? "happy" : "deadpan"} t={t} s={0.85} lookX={1} pose={carry > 0.02 && carry < 0.95 ? "hold" : "stand"} />}
          {b <= 2 && <Person x={700} y={760} look={YOU} mood={b === 1 ? "shocked" : "neutral"} t={t} s={0.85} lookX={1} />}
          <Ripple t={t} at={stop} x={960} y={700} />
          {b === 0 && <Label t={t} at={S(a) + 0.4} x={1000} y={200} text="7:40 P.M. · ON THE WAY TO THE SHOW" size={34} />}
          {b === 1 && <Label t={t} at={S(a + 1) + 0.2} x={500} y={200} text="TOO FAST TO STOP" size={44} bg="#FF6B6B" color={P.white} />}
          {b === 5 && <Label t={t} at={go + 0.4} x={1420} y={330} text="SAFE" size={56} bg="#4DE08A" />}
        </Svg>
        {b >= 3 && <Watch v={v} on={f > 0.5} />}
      </Camera>
    );
  },

  stage: ({ t, t0, t1 }) => {
    const a = first("stage");
    const b = beatOf(t, a, 8);
    const sec = Math.min(59, Math.floor(keys(t, [[t0, 40], [S(a + 3), 50], [S(a + 6), 57], [E(a + 6), 60]])));
    const ny = t > S(a + 6) + D(a + 6) * 0.75;
    const clock = ny ? "00:00:00" : `23:59:${String(sec).padStart(2, "0")}`;
    const refill = S(a + 7);
    const count = b === 6 ? ["3", "2", "1"][Math.min(2, Math.floor((t - S(a + 6)) / (D(a + 6) * 0.25)))] : "";
    const f = frz(t, refill + D(a + 7) * 0.5, 1e9);
    return (
      <Camera t={t} t0={t0} t1={t1} from={1.0} to={1.08} fx={960} fy={b === 3 ? 300 : 600} punch={[S(a + 3), refill]}>
        <Frozen on={f}>
          <Stadium t={f > 0.5 ? 0 : t} clock={clock} fireworks={ny} />
          <Svg>
            <Person x={1400} y={1000} look={HOST} mood={b === 6 ? "happy" : "smug"} t={f > 0.5 ? 0 : t} {...say(t, "HOST")} flip lookX={-1} pose={b === 1 ? "point" : "hold"} holding={<rect x={-10} y={-50} width={20} height={56} rx={8} fill="#2B2B36" />} />
            <Person x={1760} y={1000} look={THEO} mood={b === 2 ? "nervous" : "happy"} t={f > 0.5 ? 0 : t} {...say(t, "THEO")} flip lookX={-1} sweat={b === 2} />
          </Svg>
        </Frozen>
        <Svg>
          <Person x={800} y={1000} look={YOU} mood={b >= 4 ? "smug" : "nervous"} t={t} {...say(t, "YOU")} lookX={b === 3 ? 0 : 1} pose={b === 5 ? "cheer" : "stand"} />
          {b === 2 && <Label t={t} at={S(a + 2) + 0.2} x={1760} y={330} text="THEO (SIDE STAGE)" size={28} bg={P.orange} color={P.white} />}
          {b === 4 && <Label t={t} at={S(a + 4) + 0.3} x={960} y={340} text="MIDNIGHT = REFILL" size={56} bg="#FFC844" />}
          {count && <text x={960} y={620} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={300} fill={P.white} opacity={0.9} style={{ paintOrder: "stroke" }} stroke="#141A33" strokeWidth={14}>{count}</text>}
          {b === 7 && <Label t={t} at={refill + 0.1} x={960} y={380} text="REFILLED: 10.0" size={56} bg={ICE} />}
          <Ripple t={t} at={refill + D(a + 7) * 0.5} x={800} y={600} />
        </Svg>
        <Watch v={b === 7 ? 10 : 3.4} on={f > 0.5} />
        {b === 0 && <Chip t={t} at={t0 + 0.2} text="11:58 P.M. · DECEMBER 31" />}
      </Camera>
    );
  },

  trick: ({ t, t0, t1 }) => {
    const a = first("trick");
    const b = beatOf(t, a, 3);
    const go = S(a + 1) + 0.2;
    const f = frz(t, -1, go);
    const k = ease(t, t0, go - 0.2);
    const zip = (t * 2.2) % 1;
    return (
      <Camera t={t} t0={t0} t1={t1} from={1.0} to={1.06} punch={[go]} shake={[S(a + 2) + D(a + 2) * 0.5]}>
        <Frozen on={f}>
          <Stadium t={f > 0.5 ? 0 : t} clock="00:00:00" phones={1 - k} fireworks={t > go} />
          <Svg>
            {/* the pile grows on stage */}
            {Array.from({ length: Math.round(k * 80) }, (_, i) => <PhoneSmall key={i} x={760 + (i * 47) % 400 + (i % 3) * 6} y={740 - Math.floor(i / 9) * 14} rot={(i * 37) % 180} c={["#2B2B36", "#E25C7A", "#3F5F8A", "#C9D2DE"][i % 4]} />)}
            {t > go && Array.from({ length: 12 }, (_, i) => <g key={i} transform={`translate(${150 + i * 150} 560) scale(0.5)`}><Person x={0} y={0} look={extra(i)} mood={b === 2 && t > S(a + 2) + D(a + 2) * 0.5 ? "happy" : "shocked"} t={t} pose={b === 2 && t > S(a + 2) + D(a + 2) * 0.5 ? "cheer" : "shrug"} noLegs /></g>)}
          </Svg>
        </Frozen>
        <Svg>
          {/* you, zipping row by row (after-images show the speed) */}
          {t < go && [0, 1, 2].map((g) => <g key={g} opacity={1 - g * 0.3} transform={`translate(${200 + ((zip - g * 0.04 + 1) % 1) * 1500} ${-200 + Math.floor(t * 3) % 4 * 60}) scale(0.6)`}><Person x={0} y={900} look={YOU} mood="happy" t={t} noLegs /></g>)}
          {t > go && <Person x={960} y={1000} look={YOU} mood="smug" t={t} pose="cheer" />}
          {b === 0 && <Label t={t} at={t0 + 0.4} x={960} y={300} text="ROW BY ROW" size={44} bg={ICE} />}
          {b >= 1 && <Label t={t} at={go + 0.3} x={960} y={300} text="60,000 PHONES · 1 PILE" size={48} bg="#FFC844" />}
        </Svg>
        <Watch v={keys(t, [[t0, 10], [go, 1.0]])} on={f > 0.5} />
      </Camera>
    );
  },

  win: ({ t, t0, t1 }) => {
    const a = first("win");
    const b = beatOf(t, a, 3);
    if (b === 1) {
      const views = Math.round(interpolate(t, [S(a + 1) + D(a + 1) * 0.6, E(a + 1)], [0, 90], clamp));
      return (
        <Camera t={t} t0={S(a + 1) - 0.3} t1={S(a + 2)} from={1.0} to={1.05}>
          <Backdrop base="#11162A" light="#26305A"><Bokeh t={t} n={10} opacity={0.15} /></Backdrop>
          <Svg>
            {[0, 1].map((i) => <g key={i} transform={`translate(${520 + i * 880} 520)`}>
              <rect x={-400} y={-250} width={800} height={460} rx={14} fill="#1A1A22" /><g clipPath={`url(#dc${i})`}><clipPath id={`dc${i}`}><rect x={-390} y={-240} width={780} height={440} rx={8} /></clipPath>
                <g transform="translate(-960 -540) scale(1)"><g transform="translate(570 300) scale(0.42)"><rect width={1920} height={1080} fill="#E9A07A" /><rect y={700} width={1920} height={80} fill="#AEB6CC" /><rect y={780} width={1920} height={300} fill="#5A5F6C" />
                  <Person x={i === 0 ? 960 : 1420} y={i === 0 ? 990 : 820} look={KID} mood="happy" t={0} s={0.6} /></g></g></g>
              <text x={-380} y={-200} fontFamily="'Courier New', monospace" fontWeight={900} fontSize={30} fill="#FF6B6B">● DASHCAM  19:40:0{i === 0 ? "1.00" : "1.03"}</text>
              <text y={260} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={40} fill={P.white}>{i === 0 ? "FRAME 1: IN THE STREET" : "FRAME 2: ON THE SIDEWALK"}</text></g>)}
            <Label t={t} at={S(a + 1) + D(a + 1) * 0.6} x={960} y={130} text={`${views}M VIEWS`} size={60} bg="#FF6B6B" color={P.white} />
          </Svg>
        </Camera>
      );
    }
    return (
      <Camera t={t} t0={b === 0 ? t0 : S(a + 2) - 0.3} t1={b === 0 ? S(a + 1) : t1} from={1.0} to={1.08} punch={[S(a) + 0.3]}>
        <Stadium t={t} clock="00:00:12" fireworks />
        <Svg>
          {Array.from({ length: 40 }, (_, i) => <rect key={i} x={(i * 97 + Math.sin(t + i) * 30) % 1920} y={((t - S(a)) * 220 + i * 71) % 1080 - 40} width={16} height={26} rx={3} fill={["#FFC844", "#4DE08A", "#E25C5C", "#9FE3FF"][i % 4]} opacity={0.9} />)}
          <Person x={520} y={1000} look={YOU} mood="happy" t={t} pose="cheer" />
          <Person x={1400} y={1000} look={THEO} mood={b === 2 ? "shocked" : "happy"} t={t} {...say(t, "THEO")} flip lookX={-1} pose={b === 2 ? "point" : "cheer"} />
          <g transform={`translate(960 880) scale(${0.72 * pop(t, S(a) + 0.3)}) rotate(-3)`}>
            <rect x={-420} y={-170} width={840} height={300} rx={14} fill={P.cream} stroke="#2E8B57" strokeWidth={10} />
            <text x={-380} y={-110} fontFamily={font} fontWeight={800} fontSize={30} fill="#7C8296">PAY TO</text>
            <text x={-380} y={-56} fontFamily={font} fontWeight={900} fontSize={46} fill={P.ink}>YOU & THEO</text>
            <text x={380} y={60} textAnchor="end" fontFamily={font} fontWeight={900} fontSize={90} fill="#2E8B57">$1,000,000</text>
          </g>
        </Svg>
      </Camera>
    );
  },

  ending: ({ t, t0, t1 }) => {
    const a = first("ending");
    const b = beatOf(t, a, 4);
    const stop = S(a + 3) + 0.2;
    const f = frz(t, stop, 1e9);
    const pace = Math.sin((t - stop) * 2.2);
    return (
      <Camera t={t} t0={t0} t1={t1} from={1.0} to={1.08} fx={1000}>
        <Frozen on={f}>
          <Exterior t={f > 0.5 ? 0 : t} />
          <Svg><Person x={1240} y={1000} look={AVA} mood={b >= 2 ? "smug" : "happy"} t={f > 0.5 ? 0 : t} {...say(t, "AVA")} flip lookX={-1} /></Svg>
        </Frozen>
        <Svg>
          <Person x={b === 3 ? 760 + pace * 120 : 760} y={1000} look={YOU} mood={b === 3 ? "nervous" : "smug"} t={t} {...say(t, "YOU")} lookX={b === 3 ? (pace > 0 ? 1 : -1) : 1} sweat={b === 3} />
          <Ripple t={t} at={stop} x={760} y={600} />
          {b === 0 && <Label t={t} at={S(a) + 0.4} x={1240} y={330} text="AVA" size={36} bg="#E25C7A" color={P.white} />}
          {b === 3 && ["HI?", "I LIKE YOU", "IT'S MAGIC", "WANT PIZZA?"].map((w, i) => <Label key={i} t={t} at={stop + 0.6 + i * 0.7} until={stop + 1.2 + i * 0.7} x={760} y={300} text={w} size={40} />)}
        </Svg>
        {b === 3 && <Watch v={keys(t, [[stop, 10], [E(a + 3) + 0.5, 0.4]])} on />}
      </Camera>
    );
  },

  endcard: ({ t, t0, t1 }) => (
    <Camera t={t} t0={t0} t1={t1} from={1} to={1.05}>
      <Backdrop base="#11162A" light="#26305A"><Bokeh t={t} /><DotLine t={t} y={900} /></Backdrop>
      <Svg>
        <g transform={`translate(960 640) scale(${pop(t, t0 + 0.2)})`}><rect x={-26} y={-250} width={52} height={40} rx={8} fill="#C9D2DE" /><circle r={200} fill="#1F2433" stroke="#C9D2DE" strokeWidth={14} />
          <path d={`M 0 0 L 0 -180 A 180 180 0 1 1 ${180 * Math.sin(-0.3)} ${-180 * Math.cos(-0.3)} Z`} fill={ICE} /><text y={30} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={110} fill={P.white}>10 s</text></g>
      </Svg>
      <Title t={t} at={t0 + 0.6} words={"WHAT WOULD YOU USE THEM FOR?".split(" ")} accent={["USE"]} size={90} y={-360} />
    </Camera>
  ),
};

const SPEAKER_COLOR: Record<string, string> = { NARRATOR: "#FFFFFF", YOU: "#7FE3DD", THEO: "#FFB37A", MOM: "#FFB3C1", AVA: "#FFB3C8", HOST: "#FFE08A" };
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
      {captions && <Captions t={t} />}
      {!("estimated" in timeline) && <Audio src={staticFile("stoptime/mix.wav")} />}
    </AbsoluteFill>
  );
};
