// "What If Everyone Got a Superpower Except You?" Shots are keyed by each line's `scene` and timed
// from public/except/timeline.json; mouths follow public/except/lips.json.
// Clarity rule (youtube/motion.md): every place has its defining objects, every power has a visible
// effect and a label the first time, mind-controlled people have glowing purple eyes.
import React from "react";
import { AbsoluteFill, Audio, interpolate, staticFile } from "remotion";
import timeline from "../../public/except/timeline.json";
import lips from "../../public/except/lips.json";
import { P, useT, ease, pop, Camera, Bokeh, Glow, Backdrop, Shadow, Person, YOU, THEO, extra, Chip, Counter, StatCard, Title, DotLine, Bubble, Mood, Look, Lip, Pose } from "../ll/kit";
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
const at = (scene: string, k: number) => first(scene) + k;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

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
const DAD: Look = { skin: P.skin2, hair: "#2B211C", top: "#5E7A9A", topDark: "#4A6280", hairStyle: "bald", mustache: "#2B211C", tall: 1.05 };
const TEACHER: Look = { skin: P.skin, hair: "#8A8A8A", top: "#8A7A5A", topDark: "#6F6248", hairStyle: "short", glasses: true, tall: 1.04 };
const MAX: Look = { skin: P.skin, hair: "#1A1A22", top: "#3A3F4D", topDark: "#2B2F3A", hairStyle: "long" };
const GIRL: Look = { skin: P.skin3, hair: "#1E1A18", top: "#E9894E", topDark: "#C96E37", hairStyle: "bun" };
const QB: Look = { skin: P.skin2, hair: "#2B211C", top: "#C0413A", topDark: "#A0342E", hairStyle: "short", tall: 1.08 };
const GUARD: Look = { skin: P.skin3, hair: "#1E1A18", top: "#1F2433", topDark: "#141820", hairStyle: "bald", tall: 1.1, acc: ["bowtie"] };
const DEALER: Look = { skin: P.skin, hair: "#7A5A3A", top: "#F4F6FA", topDark: "#D8DDE6", hairStyle: "short", acc: ["bowtie"] };
const READER: Look = { skin: P.skin2, hair: "#3A2A20", top: "#5B4B8A", topDark: "#493C70", hairStyle: "long", glasses: true };

// ---------- power effects ----------
const PURPLE = "#B47CFF";
// waves going out from (x, y) toward (tx, ty): mind reading, mind control
const Waves: React.FC<{ t: number; x: number; y: number; tx: number; ty: number; color?: string; n?: number }> = ({ t, x, y, tx, ty, color = PURPLE, n = 4 }) => {
  const ang = Math.atan2(ty - y, tx - x) * 180 / Math.PI;
  const len = Math.hypot(tx - x, ty - y);
  return <g transform={`translate(${x} ${y}) rotate(${ang})`}>{Array.from({ length: n }, (_, i) => { const k = ((t * 0.9 + i / n) % 1); return <path key={i} d={`M ${k * len} -40 Q ${k * len + 22} 0 ${k * len} 40`} stroke={color} strokeWidth={8} fill="none" strokeLinecap="round" opacity={Math.sin(k * Math.PI)} />; })}</g>;
};
const Sparkle: React.FC<{ t: number; x: number; y: number; at: number; r?: number; color?: string }> = ({ t, x, y, at: a, r = 160, color = "#9FE3FF" }) => {
  const k = ease(t, a, a + 0.6);
  if (t < a || k >= 1) return null;
  return <g>{Array.from({ length: 12 }, (_, i) => { const an = i * Math.PI / 6; return <circle key={i} cx={x + Math.cos(an) * r * k} cy={y + Math.sin(an) * r * k} r={12 * (1 - k) + 3} fill={color} opacity={1 - k} />; })}<circle cx={x} cy={y} r={r * k} fill="none" stroke={color} strokeWidth={6} opacity={1 - k} /></g>;
};
const SpeedLines: React.FC<{ t: number; x: number; y: number }> = ({ t, x, y }) => (
  <g>{Array.from({ length: 7 }, (_, i) => <rect key={i} x={x - 380 - ((t * 900 + i * 90) % 200)} y={y - 420 + i * 55} width={260} height={8} rx={4} fill={P.white} opacity={0.7} />)}</g>
);
const Ice: React.FC<{ x: number; y: number; w?: number; h?: number }> = ({ x, y, w = 220, h = 480 }) => (
  <g><rect x={x - w / 2} y={y - h} width={w} height={h} rx={20} fill="#BFEFFF" opacity={0.65} stroke="#E8FBFF" strokeWidth={6} /><path d={`M ${x - w / 2 + 30} ${y - h + 40} l 50 60 M ${x + 20} ${y - h + 120} l 40 50`} stroke={P.white} strokeWidth={6} opacity={0.8} /></g>
);
const Dome: React.FC<{ t: number; x: number; y: number; r: number }> = ({ t, x, y, r }) => (
  <g><path d={`M ${x - r} ${y} A ${r} ${r} 0 0 1 ${x + r} ${y}`} fill="#5BD3D0" opacity={0.18 + 0.05 * Math.sin(t * 4)} stroke="#9FF0EC" strokeWidth={8} />
    {Array.from({ length: 5 }, (_, i) => <path key={i} d={`M ${x - r + i * r / 2.5} ${y} A ${r} ${r} 0 0 1 ${x - r + i * r / 2.5 + 40} ${y - r * 0.6}`} stroke="#9FF0EC" strokeWidth={3} fill="none" opacity={0.5} />)}</g>
);
const Heal: React.FC<{ t: number; x: number; y: number }> = ({ t, x, y }) => (
  <g><Glow cx={x} cy={y} r={120} color="#6FD38F" opacity={0.6} id={`heal${x}`} />{[0, 1, 2, 3].map((i) => <path key={i} d="M -8 0 h 16 M 0 -8 v 16" transform={`translate(${x + Math.cos(t * 3 + i) * 50} ${y - ((t * 60 + i * 30) % 120)})`} stroke="#6FD38F" strokeWidth={6} strokeLinecap="round" />)}</g>
);
const Pigeon: React.FC<{ x: number; y: number; t: number; flip?: boolean; say?: string }> = ({ x, y, t, flip = false, say }) => (
  <g transform={`translate(${x} ${y + Math.abs(Math.sin(t * 5 + x)) * -6}) scale(${flip ? -1 : 1} 1)`}>
    <ellipse cx={0} cy={-30} rx={44} ry={28} fill="#9AA3B5" /><path d="M -40 -30 L -76 -18 L -40 -14 Z" fill="#7A8396" /><ellipse cx={-6} cy={-34} rx={22} ry={12} fill="#8A93A5" />
    <circle cx={34} cy={-62} r={20} fill="#8A93A5" /><circle cx={40} cy={-66} r={4} fill={P.ink} /><path d="M 52 -62 l 14 4 l -14 4 Z" fill={P.gold} />
    <path d="M -6 -4 l -6 10 M 10 -4 l 6 10" stroke="#E25C5C" strokeWidth={4} />
    {say && <g transform={`scale(${flip ? -1 : 1} 1) translate(${flip ? -60 : 60} -150)`}><rect x={-10} y={-40} width={say.length * 17 + 30} height={60} rx={16} fill={P.white} /><text x={6} y={0} fontFamily={font} fontWeight={800} fontSize={28} fill={P.ink}>{say}</text></g>}
  </g>
);
// floating: a dark shadow on the ground, a dashed gap line and the person lifted, so it can't read as standing
const Floating: React.FC<{ x: number; ground?: number; lift?: number; children: React.ReactNode; tape?: boolean }> = ({ x, ground = 1000, lift = 200, children, tape = true }) => (
  <g>
    <ellipse cx={x} cy={ground} rx={95 * (1 - lift / 900)} ry={16} fill="#000" opacity={0.3} />
    {lift > 30 && <line x1={x} y1={ground - 8} x2={x} y2={ground - lift + 8} stroke="#FFFFFF" strokeWidth={5} strokeDasharray="10 10" opacity={0.85} />}
    {tape && lift > 60 && <g><rect x={x + 110} y={ground - lift} width={20} height={lift} fill="#F2B640" />{Array.from({ length: 7 }, (_, i) => <rect key={i} x={x + 110} y={ground - lift + i * (lift / 6)} width={12} height={4} fill={P.ink} />)}<text x={x + 140} y={ground - lift / 2 + 12} fontFamily={font} fontWeight={900} fontSize={34} fill={P.ink}>2 FT</text></g>}
    <g transform={`translate(0 ${-lift})`}>{children}</g>
  </g>
);
// a bench seen from the front; seated people sit on it
export const Bench: React.FC<{ x: number; w: number; y?: number }> = ({ x, w, y = 1000 }) => (
  <g><rect x={x - w / 2} y={y - 120} width={w} height={26} rx={8} fill="#8E6646" /><rect x={x - w / 2} y={y - 190} width={w} height={20} rx={8} fill="#7A563A" /><rect x={x - w / 2 + 20} y={y - 94} width={16} height={94} fill="#6A4A30" /><rect x={x + w / 2 - 36} y={y - 94} width={16} height={94} fill="#6A4A30" /></g>
);
// purple glow around a controlled person's head
const Controlled: React.FC<{ x: number; y: number; t: number; s?: number }> = ({ x, y, t, s = 1 }) => (
  <g opacity={0.8}><Glow cx={x} cy={y - 360 * s} r={130 * s} color={PURPLE} opacity={0.55 + 0.2 * Math.sin(t * 4)} id={`ctl${Math.round(x)}`} /></g>
);

// ---------- sets ----------
// a student desk seen from the front; drawn after the seated person so it hides the legs
export const Desk: React.FC<{ x: number; y?: number; s?: number; book?: boolean }> = ({ x, y = 1000, s = 1, book = true }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-150} y={-250} width={300} height={24} rx={6} fill="#C99D74" /><rect x={-140} y={-226} width={280} height={110} rx={6} fill="#B5875E" />
    <rect x={-130} y={-116} width={14} height={116} fill="#6F7480" /><rect x={116} y={-116} width={14} height={116} fill="#6F7480" />
    {book && <g><rect x={-70} y={-268} width={90} height={18} rx={3} fill="#5E7A9A" /><rect x={40} y={-262} width={60} height={10} rx={3} fill={P.white} /></g>}
  </g>
);
export const SchoolOutside: React.FC<{ t: number; police?: boolean }> = ({ t, police = false }) => (
  <Backdrop base="#8FC3E6" light="#E3F3FB" cx={60} cy={15}>
    {[0, 1].map((i) => <ellipse key={i} cx={((t * 14 + i * 900) % 2200) - 140} cy={110 + i * 50} rx={130} ry={32} fill={P.white} opacity={0.9} />)}
    <rect x={360} y={300} width={1200} height={500} fill="#C9775A" />{Array.from({ length: 12 }, (_, i) => <rect key={i} x={360} y={300 + i * 42} width={1200} height={4} fill="#B5664B" />)}
    <path d="M 340 300 L 960 170 L 1580 300 Z" fill="#8E4B3A" /><rect x={880} y={210} width={160} height={110} rx={8} fill={P.cream} /><circle cx={960} cy={265} r={40} fill={P.white} stroke={P.ink} strokeWidth={5} />
    <line x1={960} y1={265} x2={960} y2={238} stroke={P.ink} strokeWidth={5} /><line x1={960} y1={265} x2={980} y2={275} stroke={P.ink} strokeWidth={5} />
    <rect x={560} y={330} width={800} height={80} rx={10} fill="#2F5545" /><text x={960} y={386} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={52} fill={P.cream}>NORTHVIEW HIGH SCHOOL</text>
    {Array.from({ length: 10 }, (_, i) => <g key={i}><rect x={420 + (i % 5) * 230} y={440 + Math.floor(i / 5) * 160} width={130} height={110} rx={6} fill="#BFE3F6" /><rect x={420 + (i % 5) * 230} y={440 + Math.floor(i / 5) * 160} width={130} height={110} rx={6} fill="none" stroke={P.cream} strokeWidth={8} /></g>)}
    <rect x={880} y={620} width={160} height={180} rx={8} fill="#5E3A2A" /><line x1={960} y1={620} x2={960} y2={800} stroke="#3A2418" strokeWidth={6} />
    <rect x={200} y={260} width={10} height={540} fill="#AEB6CC" /><path d={`M 210 270 L ${330 + Math.sin(t * 3) * 8} ${290 + Math.sin(t * 2) * 6} L 210 330 Z`} fill="#E25C5C" />
    <rect y={800} width={1920} height={280} fill="#9AA3B5" /><rect y={800} width={1920} height={30} fill="#C9D2DE" />
    {[0, 1].map((i) => <ellipse key={i} cx={1700 - i * 1500} cy={760} rx={110} ry={80} fill="#6DB46F" />)}
    {police && <g transform="translate(1500 930)"><rect x={-200} y={-90} width={400} height={90} rx={24} fill={P.white} /><path d="M -130 -90 L -90 -150 L 90 -150 L 130 -90 Z" fill={P.white} /><rect x={-80} y={-140} width={160} height={46} rx={6} fill="#BFE3F6" />
      <rect x={-200} y={-50} width={400} height={20} fill="#1F2A4A" /><text y={-64} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={30} fill="#1F2A4A">POLICE</text>
      <rect x={-50} y={-172} width={46} height={22} rx={6} fill={Math.sin(t * 6) > 0 ? "#E25C5C" : "#7A2A2A"} /><rect x={4} y={-172} width={46} height={22} rx={6} fill={Math.sin(t * 6) > 0 ? "#3F5F8A" : "#5E9AD1"} />
      {[-120, 120].map((x) => <circle key={x} cx={x} cy={0} r={40} fill="#2B2B36" />)}</g>}
  </Backdrop>
);
export const Classroom: React.FC<{ t: number; math?: string }> = ({ t, math = "2x + 7 = 19" }) => (
  <Backdrop base="#C9D9C4" light="#F0F6EA" cx={45} cy={25}>
    {/* windows with daylight */}
    {[0, 1].map((i) => <g key={i}><rect x={80 + i * 290} y={120} width={250} height={330} rx={8} fill="#BFE3F6" /><rect x={80 + i * 290} y={120} width={250} height={330} rx={8} fill="none" stroke={P.cream} strokeWidth={14} /><line x1={205 + i * 290} y1={120} x2={205 + i * 290} y2={450} stroke={P.cream} strokeWidth={8} /></g>)}
    <path d="M 80 450 L 370 450 L 520 900 L 0 900 Z" fill="#FFF4D6" opacity={0.15} />
    {/* chalkboard with math */}
    <rect x={700} y={110} width={880} height={380} rx={12} fill="#2F5545" /><rect x={700} y={110} width={880} height={380} rx={12} fill="none" stroke="#8E6646" strokeWidth={18} />
    <rect x={720} y={478} width={840} height={16} fill="#8E6646" /><rect x={760} y={470} width={50} height={10} rx={3} fill={P.white} />
    <text x={1140} y={270} textAnchor="middle" fontFamily="'Comic Sans MS', cursive" fontSize={84} fill="#E8F0E4">{math}</text>
    <text x={1140} y={390} textAnchor="middle" fontFamily="'Comic Sans MS', cursive" fontSize={56} fill="#E8F0E4" opacity={0.8}>x = ?</text>
    {/* clock, flag, posters */}
    <circle cx={1730} cy={170} r={56} fill={P.white} stroke="#5E7A9A" strokeWidth={8} /><line x1={1730} y1={170} x2={1730} y2={136} stroke={P.ink} strokeWidth={6} /><line x1={1730} y1={170} x2={1730 + Math.cos(t * 0.6) * 40} y2={170 + Math.sin(t * 0.6) * 40} stroke={P.red} strokeWidth={3} />
    <rect x={1650} y={280} width={160} height={200} rx={6} fill="#F2B640" opacity={0.8} /><text x={1730} y={360} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={30} fill={P.ink}>MATH</text><text x={1730} y={400} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={30} fill={P.ink}>IS FUN</text>
    <rect y={700} width={1920} height={380} fill="#B8A88E" />{Array.from({ length: 16 }, (_, i) => <rect key={i} x={i * 120} y={700} width={3} height={380} fill="#A8987E" />)}
    {/* teacher's desk with an apple */}
    <rect x={1240} y={640} width={420} height={36} rx={8} fill="#8E6646" /><rect x={1260} y={676} width={380} height={160} rx={6} fill="#7A563A" /><circle cx={1300} cy={622} r={22} fill="#E25C5C" /><rect x={1296} y={596} width={6} height={10} fill="#6B4E36" />
    <rect x={1420} y={610} width={120} height={30} rx={4} fill="#5E7A9A" /><rect x={1430} y={588} width={100} height={22} rx={4} fill="#E9894E" />
    <Bokeh t={t} n={8} opacity={0.12} />
  </Backdrop>
);
export const SchoolHall: React.FC<{ t: number; speaker?: boolean }> = ({ t, speaker = false }) => (
  <Backdrop base="#D9D2C4" light="#F6F1E6" cx={50} cy={20}>
    {/* lockers */}
    {Array.from({ length: 16 }, (_, i) => <g key={i}><rect x={20 + i * 118} y={300} width={110} height={460} rx={6} fill={i % 2 ? "#3F7FA8" : "#4A8BB4"} />
      {[0, 1, 2].map((v) => <rect key={v} x={40 + i * 118} y={330 + v * 22} width={70} height={8} rx={4} fill="#2F6A92" />)}<rect x={100 + i * 118} y={520} width={10} height={40} rx={5} fill="#C9D2DE" /></g>)}
    <rect x={20} y={280} width={1880} height={22} fill="#2F6A92" />
    {/* exit sign, banner, PA speaker */}
    <rect x={160} y={120} width={150} height={60} rx={8} fill="#2E8B57" /><text x={235} y={163} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={34} fill={P.white}>EXIT</text>
    <rect x={620} y={110} width={680} height={90} rx={12} fill="#C0413A" /><text x={960} y={172} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={48} fill={P.white}>GO NORTHVIEW!</text>
    <g transform="translate(1640 170)"><rect x={-70} y={-60} width={140} height={120} rx={14} fill="#5A5F6C" />{[0, 1, 2, 3].map((i) => <rect key={i} x={-50} y={-40 + i * 22} width={100} height={8} rx={4} fill="#3A3F4D" />)}
      {speaker && [0, 1, 2].map((i) => { const k = ((t * 1.2 + i / 3) % 1); return <path key={i} d={`M ${80 + k * 160} -60 Q ${110 + k * 180} 0 ${80 + k * 160} 60`} stroke={PURPLE} strokeWidth={10} fill="none" opacity={1 - k} />; })}
      <text y={100} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={24} fill="#5A5F6C">SPEAKER</text></g>
    <rect y={760} width={1920} height={320} fill="#C9C2B4" />{Array.from({ length: 14 }, (_, i) => <path key={i} d={`M ${i * 150} 760 L ${i * 150 - 300} 1080`} stroke="#B8B0A1" strokeWidth={3} />)}
    <Bokeh t={t} n={8} opacity={0.12} />
  </Backdrop>
);
export const Cafeteria: React.FC<{ t: number }> = ({ t }) => (
  <Backdrop base="#E6D8B8" light="#FFF6E2" cx={50} cy={20}>
    <rect x={460} y={110} width={1000} height={110} rx={14} fill="#2F5545" /><text x={960} y={186} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={70} fill={P.cream}>CAFETERIA</text>
    <rect x={200} y={300} width={1520} height={230} rx={10} fill="#AEB6CC" /><rect x={180} y={280} width={1560} height={30} rx={8} fill="#C9D2DE" />
    {["PIZZA", "TACOS", "SALAD", "FRIES"].map((f, i) => <g key={f}><rect x={260 + i * 370} y={330} width={300} height={70} rx={10} fill={["#E9894E", "#F2B640", "#4DBE8A", "#E25C5C"][i]} /><text x={410 + i * 370} y={378} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={36} fill={P.white}>{f}</text>
      {[0, 1].map((k) => <path key={k} d={`M ${380 + i * 370 + k * 50} ${320 - ((t * 40 + k * 30 + i * 13) % 70)} q 14 -16 0 -32`} stroke={P.white} strokeWidth={5} fill="none" opacity={0.5} />)}</g>)}
    <rect y={760} width={1920} height={320} fill="#C9B79A" />
    {/* long table with benches and trays */}
    <rect x={160} y={760} width={1600} height={34} rx={10} fill="#E9894E" /><rect x={200} y={794} width={24} height={150} fill="#C96E37" /><rect x={1700} y={794} width={24} height={150} fill="#C96E37" />
    {[340, 760, 1180, 1600].map((x) => <g key={x}><rect x={x - 80} y={736} width={160} height={26} rx={6} fill="#5E7A9A" /><circle cx={x - 30} cy={740} r={16} fill="#F2B640" /><rect x={x + 10} y={730} width={40} height={16} rx={4} fill="#E25C5C" /></g>)}
  </Backdrop>
);
const Casino: React.FC<{ t: number }> = ({ t }) => (
  <Backdrop base="#2A1E3A" light="#5A3A6A" cx={50} cy={30}>
    {/* neon sign, slot machines */}
    <g opacity={0.85 + 0.15 * Math.sin(t * 3)}><rect x={660} y={60} width={600} height={120} rx={20} fill="none" stroke="#FFC870" strokeWidth={8} /><text x={960} y={148} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={84} fill="#FFC870">CASINO</text></g>
    {Array.from({ length: 6 }, (_, i) => <g key={i} transform={`translate(${130 + i * 330} 260)`}><rect x={-90} y={0} width={180} height={300} rx={20} fill="#C0413A" /><rect x={-70} y={30} width={140} height={90} rx={8} fill="#1A1A22" />
      {[0, 1, 2].map((k) => <rect key={k} x={-62 + k * 44} y={40} width={38} height={70} rx={4} fill={P.white} />)}{[0, 1, 2].map((k) => <circle key={k} cx={-43 + k * 44} cy={75} r={12} fill={["#E25C5C", "#F2B640", "#4DBE8A"][(k + i + Math.floor(t * 2)) % 3]} />)}
      <rect x={-60} y={150} width={120} height={20} rx={10} fill="#FFC870" /><rect x={90} y={40} width={10} height={80} fill="#AEB6CC" /><circle cx={95} cy={36} r={14} fill="#E25C5C" /></g>)}
    {/* carpet */}
    <rect y={600} width={1920} height={480} fill="#5A1E2E" />{Array.from({ length: 40 }, (_, i) => <circle key={i} cx={(i * 211) % 1920} cy={640 + (i * 97) % 420} r={14} fill="#7A2E3E" />)}
    {/* exit door */}
    <rect x={1680} y={360} width={170} height={300} rx={8} fill="#8E6646" /><rect x={1700} y={330} width={130} height={30} rx={6} fill="#2E8B57" /><text x={1765} y={354} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={22} fill={P.white}>EXIT</text>
  </Backdrop>
);
// the poker table, top of it toward the camera
const PokerTable: React.FC<{ t: number; win?: number }> = ({ t, win = 0 }) => (
  <g>
    <ellipse cx={960} cy={830} rx={720} ry={170} fill="#6B4E36" /><ellipse cx={960} cy={820} rx={680} ry={150} fill="#2E8B57" /><ellipse cx={960} cy={820} rx={600} ry={120} fill="none" stroke="#5FB884" strokeWidth={4} />
    {[700, 800, 900, 1000, 1100].map((x, i) => <g key={x} transform={`translate(${x + 20} 790) rotate(${-6 + i * 3})`}><rect x={-34} y={-48} width={68} height={96} rx={8} fill={P.white} /><text y={14} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={34} fill={i % 2 ? P.red : P.ink}>{["A", "K", "Q", "J", "10"][i]}</text></g>)}
    {/* your chip stack grows with every win */}
    {Array.from({ length: Math.min(14, win) }, (_, i) => <ellipse key={i} cx={560} cy={880 - i * 12} rx={44} ry={14} fill={i % 2 ? "#E25C5C" : "#F4F6FA"} stroke="#1A1A22" strokeWidth={2} />)}
    {[1300, 1400].map((x) => <g key={x}>{[0, 1, 2].map((i) => <ellipse key={i} cx={x} cy={880 - i * 12} rx={40} ry={13} fill="#3F5F8A" stroke="#1A1A22" strokeWidth={2} />)}</g>)}
  </g>
);
const Gym: React.FC<{ t: number }> = ({ t }) => (
  <Backdrop base="#C98E56" light="#F0C690" cx={50} cy={25}>
    {Array.from({ length: 6 }, (_, r) => <rect key={r} x={0} y={160 + r * 50} width={1920} height={40} fill={r % 2 ? "#8E6646" : "#7A563A"} />)}
    <rect x={560} y={60} width={800} height={90} rx={14} fill="#3F5F8A" /><text x={960} y={122} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={54} fill={P.white}>FLYING CLUB</text>
    <rect x={1700} y={120} width={14} height={300} fill="#5A5F6C" /><rect x={1600} y={140} width={200} height={130} rx={8} fill={P.white} opacity={0.9} /><circle cx={1700} cy={290} r={46} fill="none" stroke={P.red} strokeWidth={8} />
    <rect y={460} width={1920} height={620} fill="#D9A46A" /><ellipse cx={960} cy={760} rx={520} ry={110} fill="none" stroke={P.white} strokeWidth={8} opacity={0.8} /><line x1={960} y1={460} x2={960} y2={1080} stroke={P.white} strokeWidth={8} opacity={0.8} />
    <Bokeh t={t} n={8} opacity={0.1} />
  </Backdrop>
);
const RadioRoom: React.FC<{ t: number; on?: boolean }> = ({ t, on = true }) => (
  <Backdrop base="#2B3448" light="#4A5A80" cx={50} cy={30}>
    {/* soundproof foam */}
    {Array.from({ length: 48 }, (_, i) => <rect key={i} x={(i % 16) * 120} y={Math.floor(i / 16) * 120} width={112} height={112} fill={(i + Math.floor(i / 16)) % 2 ? "#323C52" : "#2A3346"} />)}
    {/* ON AIR light */}
    <g transform="translate(960 420)"><rect x={-160} y={-50} width={320} height={100} rx={16} fill={on ? (Math.sin(t * 4) > -0.5 ? "#C0413A" : "#8A2E2A") : "#3A3F4D"} /><text y={20} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={60} fill={P.white}>ON AIR</text>{on && <Glow cx={0} cy={0} r={260} color="#FF6B6B" opacity={0.35} id="onair" />}</g>
    <rect x={260} y={140} width={300} height={200} rx={10} fill="#141A28" /><text x={410} y={250} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={36} fill="#5BD3D0">RADIO ROOM</text>
    {/* mixing desk */}
    <rect y={760} width={1920} height={320} fill="#1E2638" />
    <path d="M 380 700 L 1540 700 L 1640 860 L 280 860 Z" fill="#3A4256" />
    {Array.from({ length: 16 }, (_, i) => <g key={i}><rect x={420 + i * 70} y={720} width={10} height={110} fill="#141A28" /><rect x={410 + i * 70} y={760 + Math.sin(t * 2 + i) * 30} width={30} height={20} rx={4} fill={i % 4 === 0 ? P.red : "#C9D2DE"} /></g>)}
    {/* microphone on an arm */}
    <path d="M 1400 700 L 1340 520 L 1180 470" stroke="#5A5F6C" strokeWidth={14} fill="none" strokeLinecap="round" /><rect x={1120} y={420} width={70} height={130} rx={34} fill="#2B2B36" />{[0, 1, 2, 3].map((i) => <rect key={i} x={1128} y={440 + i * 22} width={54} height={6} rx={3} fill="#5A5F6C" />)}
  </Backdrop>
);
const City: React.FC<{ t: number; reach: number; controlled?: boolean }> = ({ t, reach, controlled = true }) => (
  <Backdrop base="#1E2638" light="#3A4766" cx={50} cy={20}>
    {Array.from({ length: 16 }, (_, i) => <g key={i}><rect x={i * 125} y={420 + (i * 71) % 220} width={115} height={700} fill={["#2C3852", "#3A4766", "#26304A"][i % 3]} />
      {Array.from({ length: 10 }, (_, k) => <rect key={k} x={i * 125 + 14 + (k % 3) * 34} y={450 + (i * 71) % 220 + Math.floor(k / 3) * 60} width={22} height={30} fill={controlled && reach > 0.2 ? PURPLE : P.gold} opacity={0.75} />)}</g>)}
    {/* radio tower */}
    <path d="M 960 120 L 1010 640 L 910 640 Z" fill="none" stroke="#C9D2DE" strokeWidth={8} />{[0, 1, 2, 3, 4].map((i) => <line key={i} x1={960 - 10 - i * 10} y1={220 + i * 90} x2={960 + 10 + i * 10} y2={220 + i * 90} stroke="#C9D2DE" strokeWidth={6} />)}
    <circle cx={960} cy={120} r={14} fill={P.red} />
    {controlled && <circle cx={960} cy={120} r={60 + reach * 1100} fill="none" stroke={PURPLE} strokeWidth={10} opacity={0.6} />}
    {controlled && [0, 1, 2].map((i) => { const k = ((t * 0.6 + i / 3) % 1); return <circle key={i} cx={960} cy={120} r={40 + k * reach * 1100} fill="none" stroke={PURPLE} strokeWidth={6} opacity={(1 - k) * 0.7} />; })}
  </Backdrop>
);
const Bus: React.FC<{ t: number }> = ({ t }) => (
  <Backdrop base="#8FC3E6" light="#E3F3FB" cx={50} cy={20}>
    <rect y={760} width={1920} height={320} fill="#6A6F7C" />{Array.from({ length: 10 }, (_, i) => <rect key={i} x={((i * 220 + t * 300) % 2200) - 200} y={900} width={120} height={14} fill={P.white} />)}
    {Array.from({ length: 8 }, (_, i) => <rect key={i} x={((i * 300 + t * 120) % 2400) - 240} y={380 + (i % 3) * 50} width={200} height={380} fill={["#B8C4D4", "#A3B0C4", "#C9D2DE"][i % 3]} />)}
    {/* the school bus */}
    <g transform={`translate(0 ${Math.sin(t * 8) * 3})`}>
      <rect x={360} y={460} width={1200} height={340} rx={40} fill="#F2B640" /><rect x={1460} y={540} width={180} height={260} rx={30} fill="#F2B640" />
      <rect x={360} y={660} width={1280} height={18} fill="#1A1A22" /><text x={900} y={740} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={60} fill="#1A1A22">SCHOOL BUS</text>
      {Array.from({ length: 6 }, (_, i) => <rect key={i} x={400 + i * 180} y={500} width={150} height={130} rx={12} fill="#BFE3F6" />)}
      <rect x={1500} y={560} width={110} height={100} rx={10} fill="#BFE3F6" />
      {[520, 1400].map((x) => <g key={x}><circle cx={x} cy={810} r={70} fill="#2B2B36" /><circle cx={x} cy={810} r={30} fill="#8A8F9C" /></g>)}
    </g>
  </Backdrop>
);

const card = (t: number, a: number, until: number, title: string, big: string, sub: string, color = P.orange, x = 1100, y = 140, w = 700) => (
  <StatCard t={t} at={a} until={until} x={x} y={y} w={w} title={title} big={big} sub={sub} color={color} />
);

// ---------- shots ----------
const shots: Record<string, React.FC<ShotProps>> = {
  cold_open: ({ t, t0, t1 }) => {
    const a = first("cold_open");
    const lift = ease(t, S(a) + 0.8, S(a) + 2);
    const nothing = t > S(a + 3) - 0.15;
    const inv = Math.sin(t * 3) > 0 ? 1 : 0.15;
    return (
      <Camera t={t} t0={t0} t1={t1} from={1.0} to={1.08} fx={nothing ? 780 : 960} fy={620} punch={[S(a + 1) + 0.2, S(a + 4) + 0.2]}>
        <Classroom t={t} />
        <Svg>
          {/* back row */}
          <g opacity={inv}><Person x={1100} y={820} look={GIRL} mood="happy" t={t} pose="sit" s={0.8} /></g><Desk x={1100} y={820} s={0.8} />
          <Person x={1500} y={820} look={extra(2)} mood="shocked" t={t} pose="sit" s={0.8} /><Desk x={1500} y={820} s={0.8} />
          {t > S(a + 2) && <Label t={t} at={S(a + 2) + D(a + 2) * 0.55} x={1100} y={330} text="INVISIBLE" size={30} bg="#9FE3FF" />}
          {/* teacher at the board, reading minds */}
          <Person x={1560} y={1000} look={TEACHER} mood={t > S(a + 2) ? "shocked" : "neutral"} t={t} flip lookX={-1} pose={t > S(a + 2) ? "point" : "stand"} />
          {t > S(a + 2) && t < S(a + 3) && <Waves t={t} x={1480} y={640} tx={1160} ty={560} />}
          {t > S(a + 2) && <Label t={t} at={S(a + 2) + D(a + 2) * 0.3} x={1560} y={420} text="READS MINDS" size={30} bg={PURPLE} color={P.white} />}
          {/* front row: Theo floating, you waiting */}
          <Floating x={420} lift={lift * 230} tape={lift > 0.6}><Person floating={lift > 0.05} x={420} y={1000} look={THEO} mood={lift > 0.5 ? "happy" : "shocked"} t={t} {...say(t, "THEO")} pose={lift > 0.5 ? "cheer" : "sit"} /></Floating>
          {lift < 0.5 && <Desk x={420} />}
          {lift > 0.5 && <Label t={t} at={S(a) + 1.8} x={420} y={330} text="FLYING" size={32} bg="#F2B640" />}
          <Person x={780} y={1000} look={YOU} mood={t > S(a + 5) ? "sad" : nothing ? "nervous" : "shocked"} t={t} {...say(t, "YOU")} pose="sit" lookX={-1} />
          <Desk x={780} />
          {nothing && <Label t={t} at={S(a + 3) + 0.4} x={780} y={560} text="NO POWER" size={34} bg="#3A4256" color={P.white} />}
        </Svg>
        {t > S(a + 5) - 0.15 && <div style={{ position: "absolute", top: 140, width: "100%", textAlign: "center", fontFamily: font, fontWeight: 900, fontSize: 64, color: P.white, textShadow: "0 6px 0 #10141F", transform: `scale(${pop(t, S(a + 5) + 0.2)})` }}>8,000,000,000 POWERS · <span style={{ color: P.red }}>0 FOR YOU</span></div>}
        {t < S(a + 5) && <Chip t={t} at={t0 + 0.2} text="9:41 A.M. · MATH CLASS" />}
      </Camera>
    );
  },

  promise: ({ t, t0, t1 }) => {
    const a = first("promise");
    const items = [
      { k: 0.12, x: 360, txt: "KICKED OUT", c: "#FFC870" }, { k: 0.33, x: 960, txt: "12M VIEWS", c: P.red }, { k: 0.55, x: 1560, txt: "ONE KID VS. THE CITY", c: PURPLE },
    ];
    return (
      <Camera t={t} t0={t0} t1={t1}>
        <Backdrop base={P.night} light={P.nightHi}><Bokeh t={t} /></Backdrop>
        <Svg>
          {items.map((it, i) => {
            const p = pop(t, S(a) + D(a) * it.k);
            return p > 0 ? <g key={i} transform={`translate(${it.x} 480) scale(${p})`}>
              <Glow cx={0} cy={0} r={260} color={it.c} opacity={0.3} id={`pr${i}`} /><circle r={190} fill="#F7E3B8" /><circle r={176} fill="#2C3852" />
              {i === 0 && <g>{[0, 1, 2, 3].map((k) => <ellipse key={k} cx={0} cy={60 - k * 22} rx={70} ry={22} fill={k % 2 ? "#E25C5C" : P.white} stroke="#1A1A22" strokeWidth={3} />)}<rect x={-40} y={-110} width={56} height={80} rx={8} fill={P.white} transform="rotate(-12)" /><rect x={0} y={-110} width={56} height={80} rx={8} fill={P.white} transform="rotate(10)" /></g>}
              {i === 1 && <g><rect x={-110} y={-80} width={220} height={140} rx={16} fill="#141A28" /><path d="M -20 -30 L 30 -5 L -20 20 Z" fill={P.white} /><rect x={-110} y={70} width={220} height={10} fill="#3A4256" /><rect x={-110} y={70} width={160} height={10} fill={P.red} /></g>}
              {i === 2 && <g>{[0, 1, 2].map((k) => <circle key={k} r={40 + k * 40} fill="none" stroke={PURPLE} strokeWidth={8} opacity={1 - k * 0.3} />)}<circle r={26} fill={P.skin} /></g>}
              <text y={250} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={40} fill={it.c}>{it.txt}</text>
            </g> : null;
          })}
        </Svg>
      </Camera>
    );
  },

  rules: ({ t, t0, t1 }) => {
    const a = first("rules");
    const beat = [0, 1, 2, 3, 4, 5, 6, 7].filter((k) => t >= S(a + k) - 0.15).pop() ?? 0;
    // 0: one power each (world), 1: poll, 2-3: Theo 2 ft, 4-5: mom and dad, 6: Max, 7: hotline
    if (beat <= 1) return (
      <Camera t={t} t0={t0} t1={S(a + 2)} from={1.0} to={1.06}>
        <Backdrop base="#1E2638" light="#3A4766"><Bokeh t={t} n={12} opacity={0.15} /></Backdrop>
        <Svg>
          {/* the globe, everyone lighting up */}
          <g transform="translate(960 560)"><circle r={330} fill="#3F7FA8" /><path d="M -200 -150 Q -120 -230 -40 -170 Q 10 -100 -60 -40 Q -160 0 -210 -70 Z M 60 -40 Q 160 -120 250 -40 Q 280 60 200 120 Q 100 180 40 90 Z M -150 100 Q -80 60 -40 140 Q -60 230 -150 210 Z" fill="#6DB46F" />
            {Array.from({ length: 40 }, (_, i) => <circle key={i} cx={Math.cos(i * 2.4) * (60 + (i * 37) % 250)} cy={Math.sin(i * 2.4) * (60 + (i * 37) % 250)} r={7} fill={["#FFC870", PURPLE, "#9FE3FF", "#6FD38F"][i % 4]} opacity={0.5 + 0.5 * Math.sin(t * 4 + i)} />)}</g>
          <Label t={t} at={S(a) + 0.4} x={960} y={160} text="1 POWER EACH · RANDOM · NO TRADES" size={40} />
        </Svg>
        {beat === 1 && card(t, S(a + 1) + 0.2, E(a + 1) + 0.3, "MARIST POLL · 2011", "28%", "picked mind reading. 28% time travel. 16% flying.", PURPLE, 1080, 520, 760)}
      </Camera>
    );
    if (beat <= 3) return (
      <Camera t={t} t0={S(a + 2) - 0.3} t1={S(a + 4)} from={1.0} to={1.1} fx={960} punch={[S(a + 3) + 0.2]}>
        <Backdrop base="#BFE3F6" light="#F2FAFE" cx={50} cy={20}><rect y={940} width={1920} height={140} fill="#7BBF7A" />{Array.from({ length: 60 }, (_, i) => <path key={i} d={`M ${(i * 33) % 1920} ${950 + (i * 17) % 100} l 4 -16 l 4 16`} stroke="#5FA862" strokeWidth={3} fill="none" />)}</Backdrop>
        <Svg>
          <Floating x={960} ground={1000} lift={200 + Math.sin(t * 2) * 8}><Person floating x={960} y={1000} look={THEO} mood={t > S(a + 3) ? "angry" : "happy"} t={t} {...say(t, "THEO")} pose="cheer" /></Floating>
          <Label t={t} at={S(a + 2) + 0.4} x={960} y={330} text="FLYING · MAX HEIGHT 2 FT" size={38} bg="#F2B640" />
        </Svg>
      </Camera>
    );
    if (beat <= 5) {
      const cut = S(a + 4) + 0.3;
      return (
        <Camera t={t} t0={S(a + 4) - 0.3} t1={S(a + 6)} from={1.0} to={1.06} punch={[S(a + 5) + 0.2]}>
          <Kitchen t={t} />
          <Svg>
            <Person x={560} y={1000} look={MOM} mood="happy" t={t} pose="hold" lookX={1} />
            <Label t={t} at={cut} x={560} y={420} text="HEALING · 3 SECONDS" size={30} bg="#6FD38F" />
            <Bubble t={t} at={cut - 0.2} cx={900} cy={330} r={170} fromX={640} fromY={600} id="finger" bg="#F4E6D6">
              <rect x={60} y={150} width={240} height={80} rx={40} fill={P.skin} /><ellipse cx={300} cy={190} rx={30} ry={38} fill={P.skin} />
              <path d="M 150 170 L 200 210" stroke="#C0413A" strokeWidth={10} strokeLinecap="round" opacity={1 - ease(t, cut + 0.8, cut + 3)} />
              <Heal t={t} x={175} y={190} />
              <text x={170} y={300} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={34} fill={P.ink}>{t < cut + 3 ? `${Math.max(1, Math.ceil(cut + 3 - t))}...` : "HEALED"}</text>
            </Bubble>
            <Person x={1350} y={1000} look={DAD} mood={t > S(a + 5) ? "sad" : "happy"} t={t} {...say(t, "DAD")} flip lookX={-1} />
            <g transform="translate(1620 680) scale(1.5) translate(-1620 -680)"><Pigeon x={1620} y={680} t={t} flip say={t > S(a + 4) + D(a + 4) * 0.7 ? "BALD" : undefined} /></g>
            <Label t={t} at={S(a + 4) + D(a + 4) * 0.45} x={1350} y={420} text="TALKS TO PIGEONS" size={30} bg="#AEB6CC" />
          </Svg>
        </Camera>
      );
    }
    if (beat === 6) return (
      <Camera t={t} t0={S(a + 6) - 0.3} t1={S(a + 7)} from={1.15} to={1.0} fx={1300} fy={640}>
        <Classroom t={t} />
        <Svg>
          <Person x={500} y={820} look={extra(1)} mood="happy" t={t} pose="sit" s={0.8} /><Desk x={500} y={820} s={0.8} />
          <Person x={900} y={820} look={extra(3)} mood="happy" t={t} pose="sit" s={0.8} /><Desk x={900} y={820} s={0.8} />
          <Person x={1300} y={1000} look={MAX} mood="deadpan" t={t} pose="sit" lookX={-1} /><Desk x={1300} />
          <Label t={t} at={S(a + 6) + 0.6} x={1300} y={500} text="MAX · POWER: ???" size={40} bg="#3A4256" color={P.white} />
          <g transform={`translate(1300 380) scale(${pop(t, S(a + 6) + D(a + 6) * 0.7)})`}><circle r={60} fill="none" stroke={P.red} strokeWidth={10} /><text y={22} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={60} fill={P.red}>!</text></g>
        </Svg>
      </Camera>
    );
    return (
      <Camera t={t} t0={S(a + 7) - 0.3} t1={t1} from={1.0} to={1.08}>
        <Bedroom t={t} night={false} />
        <Svg>
          <Person x={600} y={1000} look={YOU} mood="nervous" t={t} pose="phone" holding={<rect x={-26} y={-44} width={52} height={88} rx={8} fill="#141A28" />} lookX={1} />
          <Phone x={1200} y={520} s={0.9} t={t}>
            <rect x={-154} y={-300} width={308} height={600} fill="#F7F8FB" /><text x={0} y={-220} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={30} fill={P.ink}>POWER HOTLINE</text>
            <text x={0} y={-150} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={24} fill="#5A5F6C">Some powers arrive late.</text>
            <text x={0} y={-80} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={60} fill={P.red}>30 DAYS</text>
            <text x={0} y={-30} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={24} fill="#5A5F6C">maximum wait</text>
            {Array.from({ length: 30 }, (_, i) => <rect key={i} x={-130 + (i % 6) * 44} y={20 + Math.floor(i / 6) * 44} width={36} height={36} rx={6} fill={i === 0 ? P.red : "#E4E9F0"} />)}
          </Phone>
        </Svg>
      </Camera>
    );
  },

  chaos: ({ t, t0, t1 }) => {
    const a = first("chaos");
    const qbX = ((t - S(a)) * 1400) % 2600 - 300;
    const questions = t >= S(a + 3) - 0.15;
    return (
      <Camera t={t} t0={t0} t1={t1} from={1.0} to={1.06} punch={[S(a + 4) + 0.1, S(a + 5) + 0.1, S(a + 6) + 0.2]} shake={[S(a) + 0.8]}>
        <SchoolHall t={t} />
        <Svg>
          {!questions && <>
            {/* the quarterback at super speed */}
            {t < S(a + 2) && <g><SpeedLines t={t} x={qbX} y={1000} />{[3, 2, 1].map((k) => <g key={k} opacity={0.15 * (4 - k)}><Person x={qbX - k * 110} y={1000} look={QB} mood="happy" t={t} pose="point" /></g>)}<Person x={qbX} y={1000} look={QB} mood="happy" t={t} pose="point" /><Label t={t} at={S(a) + 0.4} x={960} y={250} text="SUPER SPEED · 90 MPH" size={36} bg={P.red} color={P.white} /></g>}
            {t >= S(a + 1) && t < S(a + 2) && <g transform={`translate(960 420) scale(${pop(t, S(a + 1))})`}><rect x={-260} y={-60} width={520} height={250} rx={24} fill={P.cream} />
              <text y={-6} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={26} fill="#7C8296">REACTION TIME</text>
              <text x={-120} y={90} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={60} fill={P.ink}>0.25 s</text><text x={-120} y={140} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={24} fill="#7C8296">average person</text>
              <text x={130} y={90} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={60} fill={P.red}>~0 s</text><text x={130} y={140} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={24} fill="#7C8296">him</text></g>}
            {t >= S(a + 2) - 0.15 && <g>
              <Person x={700} y={1000} look={extra(4)} mood="happy" t={t} pose="hold" holding={<g><rect x={-30} y={-10} width={60} height={50} rx={6} fill="#C96E37" /><path d="M 0 -10 Q -30 -60 -10 -90 Q 10 -50 0 -10 M 0 -10 Q 30 -70 40 -40 Q 20 -20 0 -10" fill="#4DBE8A" /></g>} />
              <Label t={t} at={S(a + 2) + 0.2} x={700} y={420} text="TALKS TO PLANTS" size={32} bg="#4DBE8A" color={P.white} />
              <g transform={`translate(980 520) scale(${pop(t, S(a + 2) + D(a + 2) * 0.6)})`}><rect x={-10} y={-50} width={300} height={70} rx={18} fill={P.white} /><text x={140} y={-4} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={30} fill="#2E8B57">PLEASE. STOP.</text></g>
            </g>}
          </>}
          {questions && <>
            <Person x={960} y={1000} look={YOU} mood="nervous" t={t} sweat />
            <Person x={420} y={1000} look={THEO} mood="happy" t={t} {...say(t, "THEO")} lookX={1} pose={t >= S(a + 4) && t < E(a + 4) ? "point" : "stand"} />
            <g opacity={Math.sin(t * 3) > 0 ? 1 : 0.15}><Person x={1500} y={1000} look={GIRL} mood="deadpan" t={t} {...say(t, "GIRL")} flip lookX={-1} /></g>
            {t >= S(a + 6) - 0.2 && <Person x={1250} y={1000} look={TEACHER} mood="angry" t={t} {...say(t, "TEACHER")} flip lookX={-1} pose="point" />}
            {[S(a + 4), S(a + 5)].map((x, i) => <Label key={i} t={t} at={x + 0.2} x={[420, 1500][i]} y={430} text="WHAT'S YOUR POWER?" size={28} />)}
            {t >= S(a + 6) && <Label t={t} at={S(a + 6) + D(a + 6) * 0.6} x={1250} y={380} text="SCEPTIC" size={30} bg={P.red} color={P.white} rot={-5} />}
          </>}
        </Svg>
      </Camera>
    );
  },

  immune: ({ t, t0, t1 }) => {
    const a = first("immune");
    if (t < S(a + 2) - 0.15) return (
      <Camera t={t} t0={t0} t1={S(a + 2)} from={1.0} to={1.1} fx={1000} punch={[S(a + 1) + 0.2]}>
        <Classroom t={t} math="POP QUIZ" />
        <Svg>
          <Person x={1500} y={1000} look={TEACHER} mood={t > S(a + 1) ? "shocked" : "smug"} t={t} {...say(t, "TEACHER")} flip lookX={-1} pose="point" />
          <Waves t={t} x={1400} y={640} tx={920} ty={580} />
          {/* the waves stop at you: a crossed-out signal */}
          <g transform="translate(860 560)"><circle r={52} fill="#141A28" /><path d="M -22 14 Q 0 -10 22 14 M -34 0 Q 0 -32 34 0" stroke={PURPLE} strokeWidth={6} fill="none" /><line x1={-36} y1={36} x2={36} y2={-36} stroke={P.red} strokeWidth={8} /></g>
          <Label t={t} at={S(a + 1) + 0.2} x={860} y={460} text="NO SIGNAL" size={32} bg={P.red} color={P.white} />
          <Person x={700} y={1000} look={YOU} mood="nervous" t={t} pose="sit" lookX={1} /><Desk x={700} />
        </Svg>
        <Chip t={t} at={t0 + 0.2} text="DAY 3" />
      </Camera>
    );
    if (t < S(a + 4) - 0.15) {
      const hi5 = S(a + 2) + D(a + 2) * 0.35;
      const drop = t > hi5 && t < hi5 + 1.2;
      return (
        <Camera t={t} t0={S(a + 2) - 0.3} t1={S(a + 4)} from={1.0} to={1.08} fx={960} punch={[hi5]} shake={[hi5 + 0.1]}>
          <Cafeteria t={t} />
          <Svg>
            <Person x={760} y={1000} look={YOU} mood={drop ? "shocked" : "happy"} t={t} lookX={1} pose={t > hi5 - 0.6 && t < hi5 + 0.4 ? "point" : "stand"} />
            <Floating x={1160} lift={drop ? 0 : 200} tape={!drop}><Person floating={!drop} x={1160} y={1000} look={THEO} mood={drop || t > S(a + 3) ? "shocked" : "happy"} t={t} {...say(t, "THEO")} flip lookX={-1} pose={t > hi5 - 0.6 && t < hi5 + 0.4 ? "point" : "stand"} /></Floating>
            {t > hi5 - 0.1 && t < hi5 + 0.5 && <g transform={`translate(960 600) scale(${pop(t, hi5 - 0.1)})`}><path d="M 0 -60 L 14 -14 L 60 -14 L 22 12 L 36 56 L 0 30 L -36 56 L -22 12 L -60 -14 L -14 -14 Z" fill={P.gold} /><text y={110} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={40} fill={P.ink}>HIGH FIVE</text></g>}
            {drop && <Label t={t} at={hi5 + 0.1} x={1160} y={380} text="POWER OFF" size={34} bg={P.red} color={P.white} />}
          </Svg>
        </Camera>
      );
    }
    // the explanation diagram
    return (
      <Camera t={t} t0={S(a + 4) - 0.3} t1={t1} from={1.0} to={1.05}>
        <Backdrop base="#1E2638" light="#3A4766"><Bokeh t={t} n={10} opacity={0.12} /></Backdrop>
        <Svg>
          <Glow cx={960} cy={640} r={320} color="#FFFFFF" opacity={0.15} id="you" />
          <Person x={960} y={1000} look={YOU} mood="shocked" t={t} />
          {[[200, 300, PURPLE, "MIND READING"], [1720, 300, "#9FE3FF", "TELEPORT"], [200, 820, "#BFEFFF", "FREEZE"], [1720, 820, "#F2B640", "LIE DETECTOR"]].map(([x, y, c, lab], i) => {
            const k = ((t * 0.7 + i * 0.25) % 1);
            const px = (x as number) + (960 - (x as number)) * Math.min(k, 0.6) / 0.6 * 0.75, py = (y as number) + (640 - (y as number)) * Math.min(k, 0.6) / 0.6 * 0.75;
            return <g key={i}><text x={x as number} y={(y as number) - 40} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={30} fill={c as string}>{lab as string}</text>
              {k < 0.6 ? <circle cx={px} cy={py} r={22} fill={c as string} /> : <circle cx={px - ((x as number) > 960 ? -1 : 1) * (k - 0.6) * 300} cy={py - (k - 0.6) * 300} r={22 * (1 - (k - 0.6) * 2)} fill={c as string} opacity={1 - (k - 0.6) * 2.5} />}</g>;
          })}
          <Label t={t} at={S(a + 4) + 0.6} x={960} y={140} text="POWERS BOUNCE OFF YOU" size={44} bg={P.cream} />
          <Label t={t} at={S(a + 4) + D(a + 4) * 0.7} x={960} y={250} text="YOUR TOUCH SWITCHES THEM OFF" size={36} bg={P.red} color={P.white} />
        </Svg>
        {t > S(a + 5) - 0.15 && card(t, S(a + 5) + 0.2, E(a + 5) + 0.3, "STANFORD MEDICINE · DAVID SPIEGEL", "1 IN 4", "of his patients can't be hypnotized at all", PURPLE, 1060, 660, 760)}
      </Camera>
    );
  },

  viral: ({ t, t0, t1 }) => {
    const a = first("viral");
    const views = (lo: number, hi: number, i: number) => Math.round(interpolate(t, [S(i), E(i)], [lo, hi], clamp));
    const testing = t >= S(a + 3) - 0.15 && t < S(a + 4) - 0.15;
    if (testing) {
      const d = D(a + 3);
      return (
        <Camera t={t} t0={S(a + 3) - 0.3} t1={S(a + 4)} from={1.0} to={1.06}>
          <Bedroom t={t} night={false} />
          <Svg>
            {/* three tests, side by side */}
            {[0, 1, 2].map((i) => <rect key={i} x={30 + i * 630} y={140} width={600} height={720} rx={24} fill="rgba(16,20,32,0.35)" />)}
            <Person x={220} y={820} look={READER} mood="shocked" t={t} pose="point" s={0.75} /><Waves t={t} x={300} y={540} tx={460} ty={540} />
            <Person x={480} y={820} look={YOU} mood="smug" t={t} s={0.75} /><Label t={t} at={S(a + 3) + 0.2} x={330} y={200} text="MIND READER: NOTHING" size={26} />
            <Person x={850} y={820} look={extra(2)} mood="angry" t={t} s={0.75} /><g transform="translate(1060 620)"><rect x={-60} y={-90} width={120} height={140} rx={14} fill="#3A4256" /><circle cy={-30} r={30} fill={Math.sin(t * 10) > 0 ? P.red : "#7A2A2A"} /></g>
            <Person x={1150} y={820} look={YOU} mood="deadpan" t={t} s={0.75} /><Label t={t} at={S(a + 3) + d * 0.35} x={960} y={200} text="LIE DETECTOR: BEEPS AT ALL" size={26} />
            {t > S(a + 3) + d * 0.65 && <Ice x={1480} y={820} w={200} h={420} />}
            <Person x={1480} y={820} look={extra(5)} mood="shocked" t={t} s={0.75} pose="point" />
            <Person x={1760} y={820} look={YOU} mood="happy" t={t} s={0.75} /><Label t={t} at={S(a + 3) + d * 0.65} x={1590} y={200} text="FREEZER: FROZE HIMSELF" size={26} bg="#BFEFFF" />
          </Svg>
        </Camera>
      );
    }
    return (
      <Camera t={t} t0={t0} t1={t1} from={1.0} to={1.06} punch={[S(a + 1) + D(a + 1) * 0.7, S(a + 4) + 0.2, S(a + 7) + 0.1]}>
        <Bedroom t={t} night={false} />
        <Svg>
          {/* ring light and camera on a tripod */}
          <g transform="translate(300 500)"><circle r={110} fill="none" stroke="#FFF4D6" strokeWidth={22} /><Glow cx={0} cy={0} r={200} color="#FFF4D6" opacity={0.3} id="ring" /><line x1={0} y1={110} x2={0} y2={500} stroke="#2B2B36" strokeWidth={10} /></g>
          <g transform="translate(560 560)"><rect x={-70} y={-50} width={140} height={90} rx={12} fill="#2B2B36" /><circle cx={0} cy={-5} r={30} fill="#141A28" /><circle cx={56} cy={-36} r={8} fill={P.red} />
            <path d="M 0 40 L -80 440 M 0 40 L 80 440 M 0 40 L 0 440" stroke="#2B2B36" strokeWidth={8} /></g>
          {/* the upload screen */}
          <g transform="translate(1260 420)">
            <rect x={-420} y={-280} width={840} height={540} rx={24} fill="#F7F8FB" />
            <rect x={-390} y={-250} width={360} height={200} rx={12} fill={t < S(a + 2) ? "#F2B640" : "#3A4256"} />
            {t < S(a + 2) ? <g><g transform="translate(-210 -70) scale(0.3)"><Person x={0} y={0} look={THEO} mood="happy" t={t} pose="cheer" /></g><text x={-120} y={-80} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={22} fill={P.ink}>2 FT</text></g>
              : <g><circle cx={-210} cy={-150} r={50} fill={P.skin} /><path d="M -260 -210 Q -210 -250 -160 -210" stroke={P.hair} strokeWidth={30} fill="none" /></g>}
            <text x={0} y={-200} fontFamily={font} fontWeight={900} fontSize={30} fill={P.ink}>{t < S(a + 2) ? "Flying for 24 hours" : "Testing every superpower"}</text>
            <text x={0} y={-160} fontFamily={font} fontWeight={900} fontSize={30} fill={P.ink}>{t < S(a + 2) ? "(2 feet)" : "on the 1 person it doesn't"}</text>
            {t >= S(a + 2) && <text x={0} y={-120} fontFamily={font} fontWeight={900} fontSize={30} fill={P.ink}>work on</text>}
            <text x={0} y={-60} fontFamily={font} fontWeight={900} fontSize={40} fill={t < S(a + 2) ? "#7C8296" : P.red}>{t < S(a + 2) ? `${views(0, 40, a + 1)} views` : `${views(0, 12000000, a + 4).toLocaleString("en-US")} views`}</text>
            {t >= S(a + 6) - 0.15 && <g><rect x={-390} y={20} width={360} height={200} rx={12} fill="#9AA3B5" /><text x={0} y={70} fontFamily={font} fontWeight={900} fontSize={30} fill={P.ink}>Pigeon Translations</text><text x={0} y={120} fontFamily={font} fontWeight={900} fontSize={36} fill={P.green}>2,400,000 views</text><text x={0} y={170} fontFamily={font} fontWeight={700} fontSize={26} fill="#7C8296">by Dad</text></g>}
            {t >= S(a + 6) - 0.15 && <g transform="translate(-210 170) scale(0.8)"><Pigeon x={0} y={0} t={t} /></g>}
          </g>
          {t >= S(a + 1) && t < S(a + 2) && <Label t={t} at={S(a + 1) + D(a + 1) * 0.65} x={1260} y={760} text="39 OF THEM: HIS MOM" size={32} />}
          {/* mom trying to heal a paper cut, the envelopes */}
          {t >= S(a + 4) + 0.4 && t < S(a + 6) && <g>
            {Array.from({ length: 6 }, (_, i) => <g key={i} transform={`translate(${200 + i * 60} ${900 - (i % 2) * 20}) rotate(${-10 + i * 5})`}><rect x={-50} y={-30} width={100} height={60} rx={6} fill={P.cream} /><path d="M -50 -30 L 0 5 L 50 -30" stroke="#D8CDBE" strokeWidth={4} fill="none" /></g>)}
            <Person x={760} y={1000} look={MOM} mood={t > S(a + 5) ? "angry" : "nervous"} t={t} {...say(t, "MOM")} pose="hold" lookX={1} /><Heal t={t} x={960} y={640} />
            <Person x={1060} y={1000} look={YOU} mood="deadpan" t={t} flip lookX={-1} pose="hold" holding={<rect x={-14} y={-6} width={28} height={12} rx={4} fill="#E25C5C" />} />
            <Label t={t} at={S(a + 5) + 0.2} x={960} y={420} text="HEALING: BLOCKED" size={32} bg={P.red} color={P.white} />
          </g>}
          {t >= S(a + 6) - 0.15 && <Person x={420} y={1000} look={THEO} mood={t > S(a + 7) ? "angry" : "neutral"} t={t} {...say(t, "THEO")} lookX={1} pose={t > S(a + 7) ? "shrug" : "stand"} />}
        </Svg>
        <Chip t={t} at={t0 + 0.2} text="DAY 6" />
      </Camera>
    );
  },

  casino: ({ t, t0, t1 }) => {
    const a = first("casino");
    const win = Math.round(interpolate(t, [S(a + 1), E(a + 1) + 0.5], [0, 14], clamp));
    const out = t >= S(a + 3) - 0.15;
    if (out) {
      const k = ease(t, S(a + 3), E(a + 3));
      return (
        <Camera t={t} t0={S(a + 3) - 0.3} t1={t1} from={1.0} to={1.06}>
          <Casino t={t} />
          <Svg>
            <rect x={1680} y={360} width={170} height={300} rx={8} fill="#2B2733" opacity={k > 0.3 ? 1 : 0} />
            <Person x={1100 + k * 520} y={1000} look={GUARD} mood="deadpan" t={t} pose="hold" holding={<rect x={-10} y={-10} width={20} height={20} fill={GUARD.skin} />} />
            <Person x={1300 + k * 480} y={1000} look={YOU} mood="nervous" t={t} s={0.95} />
            <Label t={t} at={S(a + 3) + 0.4} x={1100} y={300} text="WALKS THROUGH WALLS · USES THE DOOR" size={30} bg="#AEB6CC" />
          </Svg>
        </Camera>
      );
    }
    return (
      <Camera t={t} t0={t0} t1={S(a + 3)} from={1.0} to={1.08} fx={900} punch={[S(a + 2) + 0.2]}>
        <Casino t={t} />
        <Svg>
          <Person x={960} y={760} look={DEALER} mood="deadpan" t={t} s={0.85} />
          <Person x={1440} y={860} look={READER} mood={win > 6 ? "shocked" : "smug"} t={t} s={0.85} pose="point" flip />
          {/* the mind reader reads everyone's cards: thought bubbles */}
          {[[1700, 480, "K K"], [1180, 420, "7 2"]].map(([x, y, c], i) => <g key={i} transform={`translate(${x} ${y})`}><circle r={70} fill={P.white} /><text y={16} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={40} fill={P.ink}>{c}</text></g>)}
          <Person x={1700} y={1000} look={extra(4)} mood="smug" t={t} pose="sit" s={0.9} flip />
          <g transform="translate(560 420)"><circle r={70} fill={P.white} /><text y={22} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={60} fill={P.red}>???</text></g>
          <Waves t={t} x={1360} y={520} tx={640} ty={440} />
          <Label t={t} at={S(a) + 0.6} x={1440} y={300} text="MIND READER (SECURITY)" size={28} bg={PURPLE} color={P.white} />
          <Person x={560} y={1000} look={YOU} mood={win > 4 ? "smug" : "neutral"} t={t} pose="sit" lookX={1} />
          <PokerTable t={t} win={win} />
          {t > S(a + 1) - 0.15 && <Label t={t} at={S(a + 1)} x={560} y={620} text={`WINS: ${win}`} size={40} bg={P.green} color={P.white} />}
          {t > S(a + 2) - 0.15 && <Person x={1700} y={1000} look={GUARD} mood="angry" t={t} {...say(t, "GUARD")} flip lookX={-1} pose="point" />}
        </Svg>
        <Chip t={t} at={t0 + 0.2} text="DAY 9 · CASINO" />
      </Camera>
    );
  },

  lonely: ({ t, t0, t1 }) => {
    const a = first("lonely");
    const beat = [0, 1, 2, 3, 4, 5].filter((k) => t >= S(a + k) - 0.15).pop() ?? 0;
    if (beat <= 1) {
      const gone = S(a + 1) + D(a + 1) * 0.25;
      return (
        <Camera t={t} t0={t0} t1={S(a + 2)} from={1.0} to={1.06}>
          {t < S(a + 1) + D(a + 1) * 0.6 ? <SchoolOutside t={t} /> : <Bus t={t} />}
          <Svg>
            {t < S(a + 1) + D(a + 1) * 0.6 ? <>
              {Array.from({ length: 6 }, (_, i) => <g key={i}>{t < gone + i * 0.08 && <Person x={420 + i * 150} y={1000} look={extra(i)} mood="happy" t={t} s={0.8} />}<Sparkle t={t} x={420 + i * 150} y={760} at={gone + i * 0.08} r={120} /></g>)}
              <Person x={1450} y={1000} look={YOU} mood={t > gone ? "shocked" : "happy"} t={t} s={0.9} flip lookX={-1} />
              <Label t={t} at={gone - 0.6} x={700} y={560} text="TELEPORT → PARIS · 4 SECONDS" size={34} bg="#9FE3FF" />
              <Label t={t} at={gone + 0.8} x={1450} y={520} text="DOESN'T WORK ON YOU" size={30} bg={P.red} color={P.white} />
            </> : <>
              <g transform="translate(400 520)"><circle r={60} fill={P.skin} /><path d="M -60 -20 Q -60 -70 0 -70 Q 60 -70 60 -20 Q 30 -50 0 -46 Q -30 -50 -60 -20 Z" fill={P.hair} /><circle cx={-20} cy={0} r={7} fill={P.ink} /><circle cx={20} cy={0} r={7} fill={P.ink} /><path d="M -16 30 Q 0 20 16 30" stroke={P.ink} strokeWidth={5} fill="none" /></g>
              <Label t={t} at={S(a + 1) + D(a + 1) * 0.65} x={900} y={300} text="BUS TO THE AIRPORT: 9 HOURS" size={36} bg="#F2B640" />
            </>}
          </Svg>
        </Camera>
      );
    }
    if (beat <= 3) return (
      <Camera t={t} t0={S(a + 2) - 0.3} t1={S(a + 4)} from={1.0} to={1.08} punch={[S(a + 3) + D(a + 3) * 0.6]}>
        <Gym t={t} />
        <Svg>
          {[0, 1, 2, 3].map((i) => <Floating key={i} x={400 + i * 300} lift={190 + Math.sin(t * 2 + i) * 8} tape={i === 0}><Person floating x={400 + i * 300} y={1000} look={i === 1 ? THEO : extra(i + 1)} mood="happy" t={t + i} {...(i === 1 ? say(t, "THEO") : {})} pose="cheer" s={0.85} /></Floating>)}
          <ellipse cx={1650} cy={1000} rx={110} ry={30} fill={P.ink} opacity={0.9} /><Person x={1650} y={1095} look={YOU} mood="sad" t={t} pose="sit" s={0.9} flip lookX={-1} />
          <Label t={t} at={S(a + 2) + D(a + 2) * 0.6} x={1650} y={520} text="ON THE FLOOR" size={30} bg="#3A4256" color={P.white} />
        </Svg>
      </Camera>
    );
    if (beat === 4) return (
      <Camera t={t} t0={S(a + 4) - 0.3} t1={S(a + 5)} from={1.12} to={1.0} fx={1300} fy={640}>
        <Cafeteria t={t} />
        <Svg>
          <Person x={500} y={900} look={extra(1)} mood="happy" t={t} s={0.8} /><Person x={680} y={900} look={extra(2)} mood="happy" t={t} s={0.8} /><Person x={860} y={900} look={extra(3)} mood="happy" t={t} s={0.8} />
          <Bench x={1400} w={420} /><Person x={1400} y={1000} look={MAX} mood="sad" t={t} pose="sit" flip lookX={-1} />
          <Label t={t} at={S(a + 4) + 0.6} x={1400} y={520} text="MAX · ALWAYS ALONE" size={32} bg="#3A4256" color={P.white} />
        </Svg>
      </Camera>
    );
    return (
      <Camera t={t} t0={S(a + 5) - 0.3} t1={t1} from={1.0} to={1.08}>
        <Bedroom t={t} />
        <Svg>
          <Person x={600} y={1000} look={YOU} mood="sad" t={t} pose="phone" holding={<rect x={-26} y={-44} width={52} height={88} rx={8} fill="#141A28" />} lookX={1} />
          <Phone x={1200} y={520} s={0.9} t={t}>
            <rect x={-154} y={-300} width={308} height={600} fill="#F7F8FB" /><text x={0} y={-220} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={30} fill={P.ink}>POWER HOTLINE</text>
            <text x={0} y={-120} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={44} fill={P.red}>NO ANSWER</text>
            {Array.from({ length: 30 }, (_, i) => <g key={i}><rect x={-130 + (i % 6) * 44} y={-40 + Math.floor(i / 6) * 44} width={36} height={36} rx={6} fill={i < 26 ? "#C9D2DE" : i === 25 ? P.red : "#E4E9F0"} />{i < 25 && <path d={`M ${-124 + (i % 6) * 44} ${-34 + Math.floor(i / 6) * 44} l 24 24 M ${-100 + (i % 6) * 44} ${-34 + Math.floor(i / 6) * 44} l -24 24`} stroke="#7C8296" strokeWidth={3} />}</g>)}
          </Phone>
        </Svg>
        <Chip t={t} at={S(a + 5) + 0.2} text="DAY 26" />
      </Camera>
    );
  },

  max: ({ t, t0, t1 }) => {
    const a = first("max");
    const beat = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter((k) => t >= S(a + k) - 0.15).pop() ?? 0;
    const frozen = t > S(a + 1) + 0.3;
    if (beat <= 4) return (
      <Camera t={t} t0={t0} t1={S(a + 5)} from={1.0} to={1.08} fx={960} punch={[S(a + 1) + 0.3, S(a + 4) + 0.3]} shake={[S(a + 1) + 0.3]}>
        <SchoolHall t={t} speaker={t > S(a) + 1} />
        <Svg>
          {[0, 1, 2, 3, 4].map((i) => {
            const x = 260 + i * 330;
            return <g key={i}>{frozen && <Controlled x={x} y={1000} t={t} s={0.85} />}<Person x={x} y={1000} look={i === 2 ? QB : extra(i + 2)} mood={frozen ? "controlled" : "happy"} t={frozen ? 0.5 : t + i} pose={frozen ? (i % 2 ? "point" : "wave") : "stand"} s={0.85}
              holding={beat >= 3 && frozen ? <rect x={-24} y={-40} width={48} height={80} rx={8} fill="#141A28" /> : undefined} /></g>;
          })}
          {beat >= 3 && <g transform="translate(960 900)"><rect x={-160} y={-80} width={320} height={110} rx={14} fill="#5A5F6C" /><text y={-10} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={32} fill={P.white}>PHONES</text>
            {Array.from({ length: Math.min(12, Math.floor((t - S(a + 3)) * 4)) }, (_, i) => <rect key={i} x={-140 + (i % 6) * 48} y={-60 - Math.floor(i / 6) * 30} width={36} height={60} rx={6} fill="#141A28" transform={`rotate(${-10 + i * 4})`} />)}</g>}
          {frozen && <Label t={t} at={S(a + 2) + 0.3} x={960} y={300} text="MIND CONTROL" size={52} bg={PURPLE} color={P.white} />}
          {beat >= 4 && <><Person x={1750} y={1000} look={YOU} mood="shocked" t={t} s={0.9} flip lookX={-1} pose="hold" holding={<rect x={-24} y={-40} width={48} height={80} rx={8} fill="#141A28" />} />
            <Label t={t} at={S(a + 4) + 0.6} x={1750} y={500} text="STILL HAS PHONE" size={28} bg={P.green} color={P.white} /></>}
          {!frozen && t > S(a) + 1 && <Label t={t} at={S(a) + 1.2} x={1640} y={360} text="MAX ON THE SPEAKERS" size={30} bg="#3A4256" color={P.white} />}
        </Svg>
        <Chip t={t} at={t0 + 0.2} text="DAY 27 · 3:15 P.M." />
      </Camera>
    );
    if (beat === 5) return (
      <Camera t={t} t0={S(a + 5) - 0.3} t1={S(a + 6)} from={1.0} to={1.05}>
        <City t={t} reach={interpolate(t, [S(a + 5), E(a + 5)], [0.1, 0.9], clamp)} />
        <Svg>
          <Label t={t} at={S(a + 5) + 0.3} x={960} y={760} text="CITY EMERGENCY RADIO" size={40} bg={PURPLE} color={P.white} />
          <g transform="translate(1620 160)"><rect x={-200} y={-60} width={400} height={120} rx={20} fill="rgba(16,20,32,0.85)" /><text y={-12} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={24} fill="#AEB6CC">REACHES THE WHOLE STATE AT</text><text y={36} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={44} fill={PURPLE}>MIDNIGHT</text></g>
        </Svg>
      </Camera>
    );
    if (beat <= 8) return (
      <AbsoluteFill>
        {/* split screen: you in the hallway, Mom in the kitchen */}
        <div style={{ position: "absolute", left: 0, top: 0, width: 960, height: 1080, overflow: "hidden" }}>
          <div style={{ position: "absolute", left: -480, top: 0, width: 1920, height: 1080 }}>
            <SchoolHall t={t} speaker />
            <Svg><Person x={960} y={1000} look={YOU} mood={beat >= 7 ? "shocked" : "nervous"} t={t} pose="phone" holding={<rect x={-26} y={-44} width={52} height={88} rx={8} fill="#141A28" />} lookX={1} /></Svg>
          </div>
        </div>
        <div style={{ position: "absolute", left: 960, top: 0, width: 960, height: 1080, overflow: "hidden", borderLeft: "10px solid #10141F" }}>
          <div style={{ position: "absolute", left: -480, top: 0, width: 1920, height: 1080 }}>
            <Kitchen t={t} />
            <Svg>{t > S(a + 6) + D(a + 6) * 0.5 && <Controlled x={960} y={1000} t={t} />}<Person x={960} y={1000} look={MOM} mood={t > S(a + 6) + D(a + 6) * 0.5 ? "controlled" : "happy"} t={t} {...say(t, "MOM")} pose="phone" holding={<rect x={-26} y={-44} width={52} height={88} rx={8} fill="#141A28" />} flip lookX={-1} />
              <g transform="translate(1340 130)"><circle r={60} fill="none" stroke={PURPLE} strokeWidth={8} /><rect x={-40} y={-24} width={80} height={48} rx={10} fill="#3A4256" /><text y={110} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={26} fill={PURPLE}>RADIO ON</text></g></Svg>
          </div>
        </div>
        {beat >= 8 && <div style={{ position: "absolute", top: 40, width: "100%", textAlign: "center" }}><span style={{ display: "inline-block", background: "rgba(16,20,32,0.9)", borderRadius: 24, padding: "14px 36px", fontFamily: font, fontWeight: 900, fontSize: 56, color: P.white }}>
          3:22 P.M. · <span style={{ color: PURPLE }}>MIDNIGHT IN {(() => { const s = Math.max(0, 8 * 3600 + 38 * 60 - Math.floor((t - S(a + 8)) * 60)); return `${Math.floor(s / 3600)}:${String(Math.floor(s / 60) % 60).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`; })()}</span></span></div>}
      </AbsoluteFill>
    );
    return (
      <Camera t={t} t0={S(a + 9) - 0.3} t1={t1} from={1.0} to={1.15} fx={1100} fy={560}>
        <SchoolHall t={t} speaker />
        <Svg>
          <Controlled x={1300 - ease(t, S(a + 9), E(a + 10)) * 300} y={880} t={t} />
          <Shadow cx={1300 - ease(t, S(a + 9), E(a + 10)) * 300} cy={1000} rx={70} />
          <Person x={1300 - ease(t, S(a + 9), E(a + 10)) * 300} y={880} look={THEO} mood="controlled" t={t} {...say(t, "THEO")} flip lookX={-1} pose="point" />
          <Person x={560} y={1000} look={YOU} mood="shocked" t={t} lookX={1} sweat />
          <Label t={t} at={S(a + 9) + 0.4} x={1150} y={300} text="THEO · MIND CONTROLLED" size={36} bg={PURPLE} color={P.white} />
        </Svg>
      </Camera>
    );
  },

  climax: ({ t, t0, t1 }) => {
    const a = first("climax");
    const beat = [0, 1, 2, 3, 4, 5, 6, 7].filter((k) => t >= S(a + k) - 0.15).pop() ?? 0;
    if (beat <= 1) {
      const d = D(a + 1), s1 = S(a + 1);
      const walk = interpolate(t, [S(a), S(a + 1) + D(a + 1) * 0.3, S(a + 1) + D(a + 1) * 0.6, E(a + 1)], [160, 760, 1060, 1640], clamp);
      return (
        <Camera t={t} t0={t0} t1={S(a + 2)} from={1.0} to={1.06} fx={walk} punch={[s1 + 0.2, s1 + d * 0.4, s1 + d * 0.75]}>
          <SchoolHall t={t} speaker />
          <Svg>
            {/* the radio room door at the end of the hall */}
            <rect x={1720} y={400} width={170} height={360} rx={8} fill="#5E3A2A" /><rect x={1700} y={330} width={210} height={60} rx={8} fill={P.cream} /><text x={1805} y={372} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={30} fill={P.ink}>RADIO ROOM</text>
            {/* 1. teleporter blinks in front of you: nothing happens */}
            <Controlled x={560} y={1000} t={t} s={0.85} /><Person x={560} y={1000} look={extra(3)} mood="controlled" t={0.5} pose="point" s={0.85} flip /><Sparkle t={t} x={560} y={720} at={s1 + 0.1} />
            <Label t={t} at={s1 + 0.2} until={s1 + d * 0.33} x={560} y={250} text="1. TELEPORT: NOTHING" size={32} bg="#9FE3FF" />
            {/* 2. force field: you walk straight through */}
            <path d="M 760 1000 A 240 240 0 0 1 1240 1000" fill="#5BD3D0" opacity={0.35} stroke="#9FF0EC" strokeWidth={12} />
            <Label t={t} at={s1 + d * 0.35} until={s1 + d * 0.66} x={1000} y={250} text="2. FORCE FIELD: WALKS RIGHT THROUGH" size={32} bg="#5BD3D0" />
            {/* 3. the freezer freezes himself */}
            {t > s1 + d * 0.7 && <Ice x={1440} y={1000} w={200} h={440} />}<Controlled x={1440} y={1000} t={t} s={0.85} /><Person x={1440} y={1000} look={extra(5)} mood="controlled" t={0.5} pose="point" s={0.85} flip />
            <Label t={t} at={s1 + d * 0.7} x={1440} y={250} text="3. FREEZER: FROZE HIMSELF" size={32} bg="#BFEFFF" />
            <Person x={walk} y={1000} look={YOU} mood="angry" t={t} />
          </Svg>
          <Chip t={t} at={t0 + 0.2} text="3:31 P.M." />
        </Camera>
      );
    }
    const grab = S(a + 4) + D(a + 4) * 0.35;
    const held = t > grab;
    if (beat <= 4) return (
      <Camera t={t} t0={S(a + 2) - 0.3} t1={S(a + 5)} from={1.0} to={1.12} fx={1100} fy={600} punch={[S(a + 2) + 0.2, grab]} shake={[S(a + 2) + 0.2]}>
        <RadioRoom t={t} on={!held} />
        <Svg>
          <Person x={1240} y={1000} look={MAX} mood={held ? "shocked" : t > S(a + 2) ? "angry" : "smug"} t={t} {...say(t, "MAX")} flip lookX={-1} pose={held ? "point" : "stand"} />
          {!held && <Waves t={t} x={1150} y={640} tx={760} ty={640} />}
          <Person x={held ? 1000 : 620} y={1000} look={YOU} mood={held ? "deadpan" : "angry"} t={t} pose={held ? "point" : "stand"} lookX={1} />
          {held && <g transform="translate(1120 760)"><circle r={44} fill={P.skin} /><Glow cx={0} cy={0} r={160} color="#FFFFFF" opacity={0.5} id="grab" /></g>}
          {held && <Label t={t} at={grab + 0.1} x={1120} y={300} text="HAND GRAB: POWER OFF" size={44} bg={P.red} color={P.white} />}
          {!held && t > S(a + 3) - 0.1 && <Label t={t} at={S(a + 3)} x={760} y={300} text="DOESN'T WORK ON YOU" size={40} bg="#3A4256" color={P.white} />}
        </Svg>
      </Camera>
    );
    if (beat === 5) return (
      <Camera t={t} t0={S(a + 5) - 0.3} t1={S(a + 6)} from={1.0} to={1.05}>
        <City t={t} reach={interpolate(t, [S(a + 5), E(a + 5)], [0.9, 0], clamp)} controlled={t < E(a + 5) - 0.5} />
        <Svg><Label t={t} at={S(a + 5) + 0.6} x={960} y={760} text="2,000,000 PEOPLE · FREE" size={44} bg={P.green} color={P.white} /></Svg>
      </Camera>
    );
    return (
      <Camera t={t} t0={S(a + 6) - 0.3} t1={t1} from={1.05} to={1.15} fx={1100} punch={[S(a + 7) + 0.4]}>
        <RadioRoom t={t} on={false} />
        <Svg>
          <Person x={1240} y={1000} look={MAX} mood="sad" t={t} {...say(t, "MAX")} flip lookX={-1} />
          <Person x={1000} y={1000} look={YOU} mood={t > S(a + 7) ? "deadpan" : "neutral"} t={t} {...say(t, "YOU")} lookX={1} />
          <g transform="translate(1120 760)"><circle r={36} fill={P.skin} /></g>
        </Svg>
      </Camera>
    );
  },

  payoff: ({ t, t0, t1 }) => {
    const a = first("payoff");
    const beat = [0, 1, 2, 3, 4, 5].filter((k) => t >= S(a + k) - 0.15).pop() ?? 0;
    if (beat === 0) return (
      <Camera t={t} t0={t0} t1={S(a + 1)} from={1.0} to={1.06}>
        <SchoolOutside t={t} police />
        <Svg>
          <Bench x={740} w={460} />
          <Person x={640} y={1000} look={YOU} mood="deadpan" t={t} pose="sit" lookX={1} /><Person x={840} y={1000} look={MAX} mood="sad" t={t} pose="sit" flip lookX={-1} />
          <g transform="translate(740 780)"><circle r={30} fill={P.skin} /></g>
          <g transform="translate(1180 560)"><rect x={-160} y={-60} width={320} height={110} rx={20} fill="rgba(16,20,32,0.85)" /><text y={-10} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={24} fill="#AEB6CC">HOLDING HANDS FOR</text>
            <text y={36} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={44} fill={P.white}>{Math.min(40, Math.floor(interpolate(t, [S(a), E(a)], [0, 40], clamp)))} MIN</text></g>
        </Svg>
      </Camera>
    );
    if (beat === 1) return (
      <Camera t={t} t0={S(a + 1) - 0.3} t1={S(a + 2)} from={1.0} to={1.06}>
        <Classroom t={t} math="SEATING PLAN" />
        <Svg>
          <Person x={700} y={1000} look={YOU} mood="deadpan" t={t} pose="sit" lookX={1} /><Desk x={700} />
          <Person x={1100} y={1000} look={MAX} mood="sad" t={t} pose="sit" lookX={-1} /><Desk x={1100} />
          <Label t={t} at={S(a + 1) + D(a + 1) * 0.5} x={900} y={520} text="UNTIL GRADUATION" size={40} bg={P.gold} />
        </Svg>
      </Camera>
    );
    if (beat === 2) return (
      <Camera t={t} t0={S(a + 2) - 0.3} t1={S(a + 3)} from={1.0} to={1.06}>
        <Backdrop base="#9CCB8E" light="#E6F4D8" cx={50} cy={20}>{[200, 1700].map((x) => <g key={x}><rect x={x - 20} y={380} width={40} height={420} fill="#7A563A" /><circle cx={x} cy={360} r={150} fill="#6DB46F" /></g>)}<rect y={800} width={1920} height={280} fill="#C9C2B4" /></Backdrop>
        <Svg>
          <Bench x={1000} w={1000} />
          <Person x={700} y={1000} look={DAD} mood="sad" t={t} pose="sit" />
          {[[950, "IDIOT"], [1150, "BALD IDIOT"], [1370, "STILL BALD"]].map(([x, w], i) => <Pigeon key={i} x={x as number} y={880} t={t + i} flip say={t > S(a + 2) + 0.5 + i * 0.6 ? (w as string) : undefined} />)}
        </Svg>
      </Camera>
    );
    if (beat === 3) return (
      <Camera t={t} t0={S(a + 3) - 0.3} t1={S(a + 4)} from={1.0} to={1.08}>
        <Classroom t={t} math="GREAT JOB" />
        <Svg>
          <Person x={1300} y={1000} look={TEACHER} mood="happy" t={t} {...say(t, "TEACHER")} flip lookX={-1} pose="point" />
          <Person x={700} y={1000} look={YOU} mood="happy" t={t} pose="sit" lookX={1} /><Desk x={700} />
          <Label t={t} at={S(a + 3) + D(a + 3) * 0.5} x={1300} y={380} text="SCEPTIC: CONVINCED" size={30} bg={P.green} color={P.white} />
        </Svg>
      </Camera>
    );
    const trip = S(a + 4) + D(a + 4) * 0.3;
    const fall = interpolate(t, [trip, trip + 0.5], [0, 1], clamp);
    return (
      <Camera t={t} t0={S(a + 4) - 0.3} t1={t1} from={1.0} to={1.08} punch={[trip + 0.5, S(a + 5) + 0.1]}>
        <SchoolHall t={t} />
        <Svg>
          {/* stairs */}
          {Array.from({ length: 6 }, (_, i) => <rect key={i} x={300 + i * 100} y={1000 - (6 - i) * 60} width={100} height={(6 - i) * 60} fill="#AEB6CC" stroke="#8A93A5" strokeWidth={3} />)}
          {t < trip ? <Person x={interpolate(t, [S(a + 4), trip], [450, 760], clamp)} y={700} look={THEO} mood="happy" t={t} {...say(t, "THEO")} />
            : <Floating x={1100} lift={interpolate(fall, [0, 1], [500, 200])} tape={fall > 0.9}><g transform={`rotate(${-80 * Math.min(1, fall * 1.5)} 1100 820)`}><Person floating x={1100} y={1000} look={THEO} mood={fall > 0.9 ? "happy" : "shocked"} t={t} {...say(t, "THEO")} pose={fall > 0.9 ? "cheer" : "stand"} /></g></Floating>}
          <Label t={t} at={trip + 0.6} x={900} y={420} text="2 FT. EXACTLY ENOUGH." size={36} bg="#F2B640" />
        </Svg>
      </Camera>
    );
  },

  tease: ({ t, t0, t1 }) => {
    const a = first("tease");
    return (
      <Camera t={t} t0={t0} t1={t1} from={1.0} to={1.25} fx={1100} fy={520}>
        <Bedroom t={t} />
        <Svg>
          <Person x={700} y={1000} look={YOU} mood={t > S(a + 1) ? "shocked" : "sleepy"} t={t} lookX={1} pose="phone" holding={<rect x={-26} y={-44} width={52} height={88} rx={8} fill="#141A28" />} />
          <Glow cx={1160} cy={460} r={320} color="#9FC8FF" opacity={0.4} id="phglow" />
          <Phone x={1160} y={460} s={0.75} t={t}>
            <rect x={-154} y={-300} width={308} height={600} fill="#141A28" />
            <text x={0} y={-180} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={70} fill={P.white}>9:41</text>
            {t > S(a) + D(a) * 0.5 && <g><rect x={-140} y={-100} width={280} height={180} rx={18} fill="#2C3852" /><text x={-120} y={-60} fontFamily={font} fontWeight={800} fontSize={20} fill="#AEB6CC">UNKNOWN NUMBER</text>
              {t > S(a + 1) - 0.1 && <><text x={-120} y={-14} fontFamily={font} fontWeight={900} fontSize={28} fill={P.white}>Your power is</text><text x={-120} y={24} fontFamily={font} fontWeight={900} fontSize={28} fill={P.white}>ready.</text><text x={-120} y={62} fontFamily={font} fontWeight={900} fontSize={28} fill={P.red}>Are you?</text></>}</g>}
          </Phone>
        </Svg>
      </Camera>
    );
  },

  endcard: ({ t, t0, t1 }) => (
    <Camera t={t} t0={t0} t1={t1} from={1} to={1.05}>
      <Backdrop base="#11162A" light="#26305A"><Bokeh t={t} /><DotLine t={t} y={900} /></Backdrop>
      <Svg>{[["FLYING", "#F2B640"], ["MIND READING", PURPLE], ["TELEPORT", "#9FE3FF"], ["???", P.red]].map(([w, c], i) => <Label key={i} t={t} at={t0 + 0.2 + i * 0.15} x={300 + i * 440} y={200} text={w} size={36} bg={c} color={i === 1 || i === 3 ? P.white : P.ink} />)}</Svg>
      <Title t={t} at={t0 + 0.6} words={"WHAT WOULD YOUR POWER BE?".split(" ")} accent={["POWER", "BE?"]} size={96} y={120} />
    </Camera>
  ),
};

// ---------- overlays ----------
const dayAt = (t: number) => {
  const k: [number, number][] = [[first("immune"), 3], [first("viral"), 6], [first("casino"), 9], [at("lonely", 5), 26], [first("max"), 27]];
  let d = 1;
  for (const [i, n] of k) if (t >= S(i) - 0.2) d = n;
  return d;
};
const HUD: React.FC<{ t: number; shot: string }> = ({ t, shot }) => {
  if (!["rules", "chaos", "immune", "viral", "casino", "lonely"].includes(shot)) return null;
  if (t < S(at("rules", 7)) + 1) return null;
  return <Counter label="WAITING FOR MY POWER" value={`DAY ${dayAt(t)} / 30`} x={1480} y={40} color="#FFC870" />;
};

const SPEAKER_COLOR: Record<string, string> = { NARRATOR: "#FFFFFF", YOU: "#7FE3DD", THEO: "#FFB37A", MOM: "#FFB3C1", DAD: "#B3D4FF", MAX: "#D7B8FF", TEACHER: "#FFE08A", GIRL: "#FFD0A8", GUARD: "#C9D2DE" };
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
      {!("estimated" in timeline) && <Audio src={staticFile("except/mix.wav")} />}
    </AbsoluteFill>
  );
};
