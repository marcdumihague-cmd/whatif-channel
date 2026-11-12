// "What If You Could See the Dreams Your Parents Gave Up for You?" Shots are keyed by each line's
// `scene` and timed from public/dreams/timeline.json; mouths follow public/dreams/lips.json.
import React from "react";
import { AbsoluteFill, Audio, interpolate, staticFile } from "remotion";
import timeline from "../../public/dreams/timeline.json";
import lips from "../../public/dreams/lips.json";
import { P, useT, ease, pop, Camera, Bokeh, Glow, Backdrop, Shadow, Person, Head, YOU, THEO, extra, Chip, Counter, StatCard, Title, DotLine, Bubble, Mood, Look, Lip, Pose } from "../ll/kit";

type Line = (typeof timeline.lines)[number] & { caption?: string };
const L: Line[] = timeline.lines as Line[];
export const DURATION = timeline.duration;
const S = (i: number) => L[i].start;
const E = (i: number) => L[i].end;
const font = "'Inter Display', Inter, sans-serif";
const first = (scene: string) => L.findIndex((l) => l.scene === scene);

const SHOTS: { name: string; a: number; b: number }[] = [];
L.forEach((l, i) => {
  const lastShot = SHOTS[SHOTS.length - 1];
  if (lastShot && lastShot.name === l.scene) lastShot.b = i; else SHOTS.push({ name: l.scene, a: i, b: i });
});
const shotStart = (k: number) => (k === 0 ? 0 : (E(SHOTS[k - 1].b) + S(SHOTS[k].a)) / 2);
const speaking = (t: number, who: string) => L.some((l) => l.who === who && t >= l.start && t <= l.end);
// the speaker's mouth: real visemes when lips.json exists, else the generic flap
const say = (t: number, who: string): { talk: boolean; lip?: Lip } => {
  const on = speaking(t, who);
  const f = Math.round(t * 30);
  if (!on || !lips.shape[f]) return { talk: on };
  return { talk: on, lip: { o: Number(lips.open[f]) / 9, v: lips.shape[f] } };
};
// k-th line of the current shot
const at = (scene: string, k: number) => first(scene) + k;
const during = (t: number, i: number, j = i) => t >= S(i) - 0.15 && t < (j + 1 < L.length ? S(j + 1) - 0.15 : 1e9);
type ShotProps = { t: number; t0: number; t1: number };

// ---------- cast ----------
const MOM: Look = { skin: P.skin, hair: "#5A3A2A", top: "#C66B7A", topDark: "#A85563", hairStyle: "long" };
const DAD: Look = { skin: P.skin2, hair: "#2B211C", top: "#5E7A9A", topDark: "#4A6280", hairStyle: "short", mustache: "#2B211C", tall: 1.05 };
const DRIVER: Look = { skin: P.skin3, hair: "#9A9A9A", top: "#3D5A80", topDark: "#30496A", hairStyle: "bald", mustache: "#9A9A9A" };
const TEACHER: Look = { skin: P.skin, hair: "#8A8A8A", top: "#8A7A5A", topDark: "#6F6248", hairStyle: "short", glasses: true };
const COACH: Look = { skin: P.skin2, hair: "#1E1A18", top: "#C0413A", topDark: "#A0342E", hairStyle: "short", tall: 1.06 };
const PRINCIPAL: Look = { skin: P.skin3, hair: "#1E1A18", top: "#2B3352", topDark: "#1F2640", hairStyle: "short", glasses: true };
const LUNCH: Look = { skin: P.skin, hair: "#B57A4A", top: "#E8E2D6", topDark: "#CFC7B8", hairStyle: "bun", acc: ["hairnet"] };
const CUSTOMER: Look = { skin: P.skin2, hair: "#3A2A20", top: "#6FA36B", topDark: "#588A55", hairStyle: "curly" };
const MAILMAN: Look = { skin: P.skin, hair: "#6A4A30", top: "#3B5BA9", topDark: "#2E4785", hairStyle: "short", acc: ["mailcap"] };
const SUIT: Look = { skin: P.skin, hair: P.hair, top: "#2B3352", topDark: "#1F2640", hairStyle: "short" };
const KID: Look = { skin: P.skin2, hair: "#3B2B20", top: "#F2B640", topDark: "#D39A2A", hairStyle: "curly", tall: 0.9 };
// the ghosts: what each of them almost became
const G_PILOT: Look = { ...MOM, top: "#2E3D66", topDark: "#24304F", acc: ["pilot"] };
const G_OPERA: Look = { ...DRIVER, top: "#1A1A22", topDark: "#101016", acc: ["bowtie"] };
const G_SURF: Look = { ...SUIT, top: "#5BD3D0", topDark: "#3FB2AF", hair: "#E8C37A" };
const G_STUNT: Look = { ...TEACHER, top: "#2B2B36", topDark: "#1A1A22", glasses: false, acc: ["helmet"] };
const G_DJ: Look = { ...PRINCIPAL, top: "#8E4BC0", topDark: "#733A9E", acc: ["headphones"] };
const G_BALLET: Look = { ...COACH, top: "#F4A6C8", topDark: "#DE8BB0", acc: ["tutu"] };
const G_DESIGN: Look = { ...LUNCH, top: "#1A1A22", topDark: "#101016", acc: ["beret"] };
const G_COMIC: Look = { ...CUSTOMER, top: "#8E4BC0", topDark: "#733A9E" };
const G_THEO: Look = { ...THEO, top: "#C9A0FF", topDark: "#A77FE0", acc: ["sequins"] };
const G_YOU: Look = { ...YOU, acc: ["beret"] };
const SEAL: Look = { ...THEO, top: "#55663A", topDark: "#43522D" };

// ---------- drawing helpers ----------
const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
    <defs>
      {/* ghost tint: pale, cool, a little see-through */}
      <filter id="ghost" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="0.5 0 0 0 0.36  0 0.5 0 0 0.46  0 0 0.5 0 0.52  0 0 0 1 0" /></filter>
    </defs>
    {children}
  </svg>
);

// A floating ghost: feet at (x, y), opacity o. Drawn before its owner so the owner stands in front.
const Ghost: React.FC<{ x: number; y: number; look: Look; t: number; o: number; s?: number; pose?: Pose; flip?: boolean; mood?: Mood; wink?: boolean; spin?: boolean; children?: React.ReactNode }> =
  ({ x, y, look, t, o, s = 0.85, pose = "stand", flip = false, mood = "happy", wink, spin = false, children }) => {
    if (o <= 0.005) return null;
    const fy = y + Math.sin(t * 1.8 + x * 0.01) * 12;
    const sx = spin ? Math.cos(t * 7) : 1; // a pirouette
    return (
      <g opacity={Math.min(1, o)}>
        <Glow cx={x} cy={fy - 300 * s} r={300 * s} color="#9FE3FF" opacity={0.6} id={`gg${Math.round(x)}_${Math.round(y)}`} />
        <g filter="url(#ghost)" transform={`translate(${x} ${fy}) scale(${sx} 1) translate(${-x} ${-fy})`}>
          <path d={`M ${x - 60 * s} ${fy - 120 * s} Q ${x - 10 * s} ${fy + 10 * s} ${x + 30 * s + Math.sin(t * 3) * 25 * s} ${fy + 50 * s} Q ${x + 20 * s} ${fy - 50 * s} ${x + 60 * s} ${fy - 120 * s} Z`} fill={look.top} />
          <Person x={x} y={fy} look={look} mood={mood} t={t + 0.7} s={s} pose={pose} flip={flip} noLegs wink={wink} />
          {children}
        </g>
      </g>
    );
  };

const Note: React.FC<{ x: number; y: number; t: number; k: number }> = ({ x, y, t, k }) => {
  const p = ((t * 0.6 + k * 0.33) % 1);
  return (
    <g transform={`translate(${x + Math.sin(t * 3 + k) * 30 + p * 60} ${y - p * 220})`} opacity={Math.sin(p * Math.PI)} fill="#BFEFFF">
      <ellipse cx={0} cy={0} rx={16} ry={12} transform="rotate(-20)" /><rect x={12} y={-60} width={6} height={60} /><path d="M 18 -60 q 26 10 20 34 q -6 -18 -20 -20 Z" />
    </g>
  );
};

const Jet: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -150 0 Q -150 -26 -110 -26 L 120 -26 Q 170 -20 180 0 Q 170 18 120 22 L -110 22 Q -150 22 -150 0 Z" fill="#F4F6FA" />
    <path d="M -120 -24 L -165 -95 L -130 -95 L -70 -24 Z" fill="#D9474B" />
    <path d="M -10 10 L -80 70 L -40 70 L 50 10 Z" fill="#C9D2E0" />
    {Array.from({ length: 9 }, (_, i) => <circle key={i} cx={-80 + i * 22} cy={-6} r={5} fill="#5E7A9A" />)}
    <path d="M 150 -16 Q 168 -10 172 0 L 150 0 Z" fill="#5E7A9A" />
  </g>
);

export const Cessna: React.FC<{ x: number; y: number; s?: number; t: number; pilot?: React.ReactNode; flip?: boolean }> = ({ x, y, s = 1, t, pilot, flip = false }) => (
  <g transform={`translate(${x} ${y + Math.sin(t * 2) * 6}) scale(${flip ? -s : s} ${s}) rotate(${Math.sin(t * 1.3) * 2})`}>
    <rect x={-200} y={-74} width={330} height={20} rx={10} fill="#F4F6FA" />
    <path d="M -170 -10 Q -170 -50 -120 -54 L 80 -54 Q 140 -50 160 -10 Q 150 26 90 30 L -120 30 Q -160 26 -170 -10 Z" fill={P.white} />
    <path d="M -170 -10 L -250 -80 L -215 -84 L -150 -26 Z" fill="#D9474B" />
    <path d="M -175 0 L 160 0" stroke="#D9474B" strokeWidth={10} />
    <path d="M 20 -50 L 100 -50 Q 128 -40 136 -16 L 20 -16 Z" fill="#5E7A9A" />
    {pilot && <g transform="translate(78 -26)">{pilot}</g>}
    <path d="M 20 -50 L 100 -50 Q 128 -40 136 -16 L 20 -16 Z" fill="#BFE3F6" opacity={0.35} />
    <g transform="translate(166 -8)"><rect x={-6} y={-12} width={20} height={24} rx={6} fill="#8A8F9C" /><ellipse cx={18} cy={0} rx={5} ry={60 * Math.abs(Math.sin(t * 40))} fill="#5A5F6C" opacity={0.6} /></g>
    <line x1={-20} y1={30} x2={-40} y2={70} stroke="#5A5F6C" strokeWidth={6} /><circle cx={-40} cy={74} r={13} fill="#2B2B36" />
    <line x1={70} y1={30} x2={90} y2={70} stroke="#5A5F6C" strokeWidth={6} /><circle cx={90} cy={74} r={13} fill="#2B2B36" />
  </g>
);

const Motorbike: React.FC<{ t: number }> = ({ t }) => (
  <g>
    {[-110, 110].map((cx) => <g key={cx}><circle cx={cx} cy={0} r={52} fill="#2B2B36" /><circle cx={cx} cy={0} r={22} fill="#8A8F9C" /></g>)}
    <path d="M -110 -10 L -40 -70 L 70 -70 L 110 -10 L 40 -20 Z" fill="#E2463E" />
    <path d="M 70 -70 L 100 -120" stroke="#2B2B36" strokeWidth={10} strokeLinecap="round" />
    {[0, 1, 2, 3].map((i) => {
      const f = 0.7 + 0.3 * Math.sin(t * 20 + i * 2);
      return <path key={i} d={`M ${-150 - i * 30} ${-30 + i * 6} q ${-60 * f} ${-30 - i * 10} ${-120 * f} ${-10} q ${50 * f} ${20} ${120 * f} ${40} Z`} fill={i % 2 ? "#FFC870" : "#F2702E"} opacity={0.9} />;
    })}
  </g>
);

const Envelope: React.FC<{ x: number; y: number; s?: number; label: string; color?: string; open?: number }> = ({ x, y, s = 1, label, color = P.cream, open = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {open > 0 && <g transform={`translate(0 ${-110 * open})`}><rect x={-150} y={-90} width={300} height={170} rx={8} fill={P.white} /><text y={-30} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={30} fill={P.green}>ACCEPTED</text><text y={14} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={22} fill={P.ink}>{label}</text></g>}
    <rect x={-170} y={-100} width={340} height={200} rx={12} fill={color} />
    <path d="M -170 -100 L 0 20 L 170 -100" fill="none" stroke="#D8CDBE" strokeWidth={6} />
  </g>
);

// A screen with a label and a big button
const Screen: React.FC<{ x: number; y: number; t: number; title: string; sub: string; color: string; state?: "idle" | "paid" | "gone"; glow?: number; btn?: string }> = ({ x, y, t, title, sub, color, state = "idle", glow = 0, btn = "PAY $14,800" }) => (
  <g transform={`translate(${x} ${y})`}>
    {glow > 0 && <Glow cx={0} cy={0} r={420} color={color} opacity={0.4 * glow} id={`scr${x}`} />}
    <rect x={-300} y={-200} width={600} height={380} rx={22} fill="#141A28" />
    <rect x={-280} y={-180} width={560} height={340} rx={12} fill={state === "gone" ? "#2A2F3D" : "#1F2A44"} />
    <text y={-100} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={42} fill={state === "gone" ? "#6A7186" : P.white}>{title}</text>
    <text y={-50} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={30} fill="#AEB6CC">{sub}</text>
    <rect x={-170} y={10} width={340} height={100} rx={50} fill={state === "paid" ? P.green : state === "gone" ? "#3A4050" : color} transform={state === "idle" ? `scale(${1 + 0.03 * Math.sin(t * 6)})` : undefined} />
    <text y={76} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={40} fill={state === "gone" ? "#6A7186" : P.white}>{state === "paid" ? "PAID ✓" : state === "gone" ? "EXPIRED" : btn}</text>
    <rect x={-40} y={180} width={80} height={60} fill="#141A28" /><rect x={-120} y={236} width={240} height={16} rx={8} fill="#141A28" />
  </g>
);

export const Label: React.FC<{ t: number; at: number; x: number; y: number; text: string; color?: string; bg?: string; size?: number; until?: number; rot?: number }> =
  ({ t, at: a, x, y, text, color = P.ink, bg = P.cream, size = 40, until = 1e9, rot = 0 }) => {
    const p = pop(t, a) * (1 - ease(t, until, until + 0.3));
    if (p <= 0.001) return null;
    const w = text.length * size * 0.62 + 60;
    return (
      <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${p})`}>
        <rect x={-w / 2} y={-size * 0.95} width={w} height={size * 1.7} rx={size * 0.85} fill={bg} />
        <text y={size * 0.34} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={size} fill={color}>{text}</text>
      </g>
    );
  };

const card = (t: number, a: number, until: number, title: string, big: string, sub: string, color = P.orange, x = 1060, y = 140, w = 720) => (
  <StatCard t={t} at={a} until={until} x={x} y={y} w={w} title={title} big={big} sub={sub} color={color} />
);

// ---------- sets ----------
const Kitchen: React.FC<{ t: number; night?: boolean; win?: React.ReactNode }> = ({ t, night = false, win }) => (
  <Backdrop base={night ? "#2A2630" : "#D9C3AC"} light={night ? "#4D4458" : "#F4E6D6"} cx={35} cy={30}>
    {Array.from({ length: 12 }, (_, i) => <rect key={i} x={i * 160} y={0} width={80} height={860} fill={night ? "#2F2A36" : "#D2BBA3"} opacity={0.5} />)}
    <clipPath id="kwin"><rect x={180} y={150} width={380} height={300} rx={10} /></clipPath>
    <g clipPath="url(#kwin)">
      <rect x={180} y={150} width={380} height={300} fill={night ? "#18213A" : P.sky} />
      {night ? Array.from({ length: 14 }, (_, i) => <circle key={i} cx={200 + (i * 97) % 340} cy={170 + (i * 61) % 200} r={2.5} fill={P.white} opacity={0.4 + 0.5 * Math.abs(Math.sin(t + i))} />)
        : [0, 1].map((i) => <ellipse key={i} cx={((t * 12 + i * 220) % 560) + 120} cy={220 + i * 70} rx={70} ry={22} fill={P.white} opacity={0.8} />)}
      {win}
    </g>
    <rect x={180} y={150} width={380} height={300} rx={10} fill="none" stroke={night ? "#4A4252" : P.cream} strokeWidth={16} />
    <line x1={370} y1={150} x2={370} y2={450} stroke={night ? "#4A4252" : P.cream} strokeWidth={10} />
    <rect x={1380} y={520} width={420} height={340} rx={12} fill={night ? "#5A4434" : P.wood} />
    {[0, 1, 2].map((i) => <g key={i}><rect x={1400} y={540 + i * 105} width={380} height={90} rx={8} fill={night ? "#6A5240" : "#C99D74"} /><rect x={1560} y={578 + i * 105} width={60} height={14} rx={7} fill={P.gold} /></g>)}
    <rect x={1440} y={420} width={60} height={100} rx={10} fill="#5E7A9A" /><rect x={1520} y={450} width={50} height={70} rx={10} fill="#E9894E" />
    <rect y={860} width={1920} height={220} fill={night ? "#1E1A22" : "#A97E58"} />
    <path d="M 960 0 L 960 70" stroke="#3A3036" strokeWidth={4} /><path d="M 900 70 L 1020 70 L 990 110 L 930 110 Z" fill="#F2B640" />
    <Glow cx={960} cy={140} r={460} color="#FFD98A" opacity={night ? 0.32 : 0.18} id="kitlamp" />
    <Bokeh t={t} n={10} opacity={0.12} color="#FFE9C4" />
  </Backdrop>
);
const Table: React.FC<{ night?: boolean }> = ({ night }) => (
  <g><rect x={560} y={760} width={800} height={34} rx={12} fill={night ? "#6A5240" : P.woodDark} />
    <rect x={600} y={794} width={30} height={130} fill={night ? "#5A4434" : P.woodDark} /><rect x={1290} y={794} width={30} height={130} fill={night ? "#5A4434" : P.woodDark} /></g>
);

const Bus: React.FC<{ t: number }> = ({ t }) => (
  <Backdrop base="#3A4A66" light="#6F86A8" cx={50} cy={30}>
    <rect x={0} y={120} width={1920} height={320} fill="#9CC7E0" />
    {Array.from({ length: 8 }, (_, i) => { const x = ((i * 300 - t * 260) % 2400 + 2400) % 2400 - 240; return <rect key={i} x={x} y={200 + (i % 3) * 40} width={200} height={260} fill={["#B8C4D4", "#A3B0C4", "#C9D2DE"][i % 3]} />; })}
    {Array.from({ length: 6 }, (_, i) => <rect key={i} x={i * 330 - 10} y={110} width={40} height={340} fill="#2E3B55" />)}
    <rect x={0} y={100} width={1920} height={30} fill="#2E3B55" /><rect x={0} y={440} width={1920} height={30} fill="#2E3B55" />
    {Array.from({ length: 10 }, (_, i) => <line key={i} x1={120 + i * 190} y1={60} x2={120 + i * 190} y2={100} stroke="#8A97AE" strokeWidth={6} />)}
    <rect x={0} y={56} width={1920} height={10} fill="#8A97AE" />
    <rect y={880} width={1920} height={200} fill="#2B3448" />
    {[700, 1150, 1600].map((x) => <g key={x}><rect x={x - 120} y={640} width={240} height={250} rx={30} fill="#3F6E9A" /><rect x={x - 130} y={600} width={260} height={70} rx={30} fill="#4F82B0" /></g>)}
    <Bokeh t={t} n={8} opacity={0.1} />
  </Backdrop>
);

const Classroom: React.FC<{ t: number; gym?: boolean }> = ({ t, gym = false }) => gym ? (
  <Backdrop base="#C98E56" light="#F0C690" cx={50} cy={30}>
    {Array.from({ length: 10 }, (_, i) => <rect key={i} x={i * 200} y={0} width={100} height={760} fill="#BF8550" opacity={0.4} />)}
    <rect x={160} y={120} width={300} height={200} rx={10} fill="none" stroke={P.white} strokeWidth={10} /><circle cx={310} cy={320} r={40} fill="none" stroke={P.red} strokeWidth={8} />
    <rect y={760} width={1920} height={320} fill="#D9A46A" /><ellipse cx={960} cy={900} rx={500} ry={80} fill="none" stroke={P.white} strokeWidth={8} opacity={0.7} />
    <Bokeh t={t} n={10} opacity={0.12} />
  </Backdrop>
) : (
  <Backdrop base="#B9C9B8" light="#E6EEDC" cx={40} cy={30}>
    <rect x={700} y={110} width={1000} height={440} rx={16} fill="#2F5545" /><rect x={700} y={110} width={1000} height={440} rx={16} fill="none" stroke="#8E6646" strokeWidth={20} />
    <text x={1200} y={300} textAnchor="middle" fontFamily="'Comic Sans MS', cursive" fontSize={110} fill="#E8F0E4" opacity={0.92}>FRACTIONS</text>
    <text x={1200} y={430} textAnchor="middle" fontFamily="'Comic Sans MS', cursive" fontSize={80} fill="#E8F0E4" opacity={0.75}>½ + ¼ = ?</text>
    <circle cx={1810} cy={200} r={70} fill={P.cream} /><line x1={1810} y1={200} x2={1810} y2={150} stroke={P.ink} strokeWidth={8} /><line x1={1810} y1={200} x2={1810 + Math.cos(t * 0.5) * 45} y2={200 + Math.sin(t * 0.5) * 45} stroke={P.red} strokeWidth={5} />
    <rect y={860} width={1920} height={220} fill="#8E7A62" />
    {[260, 1660].map((x) => <g key={x}><rect x={x - 140} y={760} width={280} height={30} rx={8} fill="#C99D74" /><rect x={x - 120} y={790} width={20} height={90} fill="#8E6646" /><rect x={x + 100} y={790} width={20} height={90} fill="#8E6646" /></g>)}
    <Bokeh t={t} n={10} opacity={0.15} />
  </Backdrop>
);

const Cafeteria: React.FC<{ t: number }> = ({ t }) => (
  <Backdrop base="#B7D0D6" light="#EAF4F2" cx={60} cy={30}>
    {Array.from({ length: 24 }, (_, i) => <rect key={i} x={(i % 12) * 160} y={Math.floor(i / 12) * 160 + 100} width={150} height={150} fill="#C8DEE2" />)}
    <rect x={980} y={560} width={900} height={300} fill="#8A97AE" /><rect x={960} y={540} width={940} height={40} rx={10} fill="#C9D2DE" />
    {[1080, 1260, 1440, 1620, 1780].map((x, i) => <g key={x}><rect x={x - 60} y={500} width={120} height={50} rx={8} fill={["#E9894E", "#4DBE8A", "#F2B640", "#E25C5C", "#B9A7D6"][i]} />
      {[0, 1].map((k) => <path key={k} d={`M ${x - 20 + k * 30} ${490 - ((t * 40 + k * 30 + i * 13) % 80)} q 14 -16 0 -32`} stroke={P.white} strokeWidth={5} fill="none" opacity={0.5} />)}</g>)}
    <rect y={860} width={1920} height={220} fill="#9AA3B5" />
    <rect x={120} y={760} width={760} height={30} rx={10} fill="#E9894E" /><rect x={160} y={790} width={20} height={90} fill="#C96E37" /><rect x={820} y={790} width={20} height={90} fill="#C96E37" />
    <Bokeh t={t} n={10} opacity={0.15} />
  </Backdrop>
);

const Garage: React.FC<{ t: number; sign?: number }> = ({ t, sign = 1 }) => (
  <Backdrop base="#3B3446" light="#6A5A78" cx={50} cy={30}>
    {Array.from({ length: 9 }, (_, i) => <rect key={i} x={160} y={60 + i * 50} width={1600} height={42} rx={6} fill="#4A4258" />)}
    <path d={`M 120 40 ${Array.from({ length: 16 }, (_, i) => `Q ${180 + i * 110} 90 ${230 + i * 110} 40`).join(" ")}`} stroke="#2B2B36" strokeWidth={3} fill="none" />
    {Array.from({ length: 16 }, (_, i) => <circle key={i} cx={175 + i * 110} cy={64} r={9} fill={["#FFC870", "#5BD3D0", "#E25C5C"][i % 3]} opacity={0.55 + 0.45 * Math.sin(t * 3 + i)} />)}
    {sign > 0 && <g transform={`translate(960 210) scale(${sign}) rotate(${Math.sin(t * 1.5) * 1.5})`}>
      <rect x={-420} y={-80} width={840} height={160} rx={20} fill="#F7E3B8" /><rect x={-404} y={-64} width={808} height={128} rx={14} fill="none" stroke="#C9A14A" strokeWidth={5} strokeDasharray="14 10" />
      <text y={22} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={70} fill="#3B3446">DREAM DETECTIVE · $20</text>
    </g>}
    <rect y={860} width={1920} height={220} fill="#2B2733" />
    <rect x={760} y={720} width={400} height={30} rx={8} fill="#8E6646" /><rect x={790} y={750} width={20} height={130} fill="#6A4A30" /><rect x={1110} y={750} width={20} height={130} fill="#6A4A30" />
    <Bokeh t={t} n={12} opacity={0.15} color="#FFE9C4" />
  </Backdrop>
);

const Attic: React.FC<{ t: number }> = ({ t }) => (
  <Backdrop base="#3A2E2A" light="#7A5E4A" cx={70} cy={25}>
    <path d="M 0 0 L 960 -200 L 1920 0 L 1920 120 L 960 -60 L 0 120 Z" fill="#2A201C" />
    {[300, 700, 1220, 1620].map((x) => <rect key={x} x={x} y={0} width={30} height={860} fill="#4A3A30" />)}
    <path d="M 1460 120 L 1640 120 L 1300 860 L 880 860 Z" fill="#FFE2A8" opacity={0.12} />
    <rect x={1460} y={60} width={180} height={140} rx={8} fill="#FFE2A8" opacity={0.7} />
    {Array.from({ length: 24 }, (_, i) => <circle key={i} cx={950 + ((i * 53 + t * 10) % 500)} cy={200 + ((i * 89 + t * 14) % 620)} r={3} fill="#FFE2A8" opacity={0.5} />)}
    <rect y={860} width={1920} height={220} fill="#2A201C" />
    {[0, 1, 2].map((i) => <rect key={i} x={140 + i * 90} y={700 - i * 60} width={200} height={160 - (i === 2 ? 0 : 0)} rx={6} fill={["#8E6646", "#7A563A", "#A97E58"][i]} />)}
  </Backdrop>
);

const Room: React.FC<{ t: number; win?: React.ReactNode }> = ({ t, win }) => (
  <Backdrop base="#1E2638" light="#3A4766" cx={50} cy={35}>
    <clipPath id="rwin"><rect x={1420} y={140} width={360} height={420} rx={10} /></clipPath>
    <g clipPath="url(#rwin)"><rect x={1420} y={140} width={360} height={420} fill="#141A28" />
      {Array.from({ length: 10 }, (_, i) => <circle key={i} cx={1440 + (i * 71) % 330} cy={160 + (i * 97) % 380} r={2.5} fill={P.white} opacity={0.3 + 0.5 * Math.abs(Math.sin(t + i))} />)}{win}</g>
    <rect x={1420} y={140} width={360} height={420} rx={10} fill="none" stroke="#3C4866" strokeWidth={16} />
    <rect x={160} y={160} width={160} height={210} rx={6} fill="#5BD3D0" opacity={0.5} /><rect x={360} y={200} width={140} height={180} rx={6} fill="#F2B640" opacity={0.5} />
    <rect y={860} width={1920} height={220} fill="#18202F" />
    <rect x={340} y={740} width={1240} height={34} rx={10} fill="#2C3852" />
    <Bokeh t={t} n={10} opacity={0.12} />
  </Backdrop>
);

const Sky: React.FC<{ t: number; house?: boolean }> = ({ t, house = true }) => (
  <Backdrop base="#7FB5E0" light="#D8EEF8" cx={60} cy={25}>
    <Glow cx={1600} cy={180} r={300} color="#FFE9A8" opacity={0.8} id="sun" /><circle cx={1600} cy={180} r={70} fill="#FFE9A8" />
    {Array.from({ length: 6 }, (_, i) => <g key={i} transform={`translate(${((i * 400 - t * (20 + i * 6)) % 2400 + 2400) % 2400 - 240} ${120 + (i % 3) * 140})`} opacity={0.9}><ellipse rx={130} ry={36} fill={P.white} /><ellipse cx={-50} cy={-24} rx={60} ry={34} fill={P.white} /><ellipse cx={40} cy={-30} rx={70} ry={40} fill={P.white} /></g>)}
    <path d="M 0 900 Q 480 820 960 880 T 1920 860 L 1920 1080 L 0 1080 Z" fill="#7BBF7A" />
    <path d="M 0 960 Q 600 900 1100 950 T 1920 940 L 1920 1080 L 0 1080 Z" fill="#5FA862" />
    {house && <g transform="translate(560 900)"><rect x={-160} y={-170} width={320} height={170} fill="#F4E6D6" /><path d="M -190 -170 L 0 -300 L 190 -170 Z" fill="#C66B7A" />
      <rect x={-40} y={-90} width={80} height={90} fill="#8E6646" /><rect x={-130} y={-140} width={60} height={50} fill="#A8CFE0" /><rect x={70} y={-140} width={60} height={50} fill="#A8CFE0" /></g>}
  </Backdrop>
);

const Stage: React.FC<{ t: number; color?: string }> = ({ t, color = "#2B2440" }) => (
  <Backdrop base="#141826" light={color} cx={50} cy={40}>
    <path d="M 760 0 L 1160 0 L 1420 1000 L 500 1000 Z" fill="#FFF4D6" opacity={0.07} />
    <rect y={900} width={1920} height={180} fill="#100F18" />
    <Bokeh t={t} n={14} opacity={0.15} />
  </Backdrop>
);

// ---------- ghost strengths ----------
const DAYS: [number, number][] = [];
const dayKeys = () => [[first("bus"), 2], [first("detective"), 3], [at("detective", 4), 9], [at("detective", 8), 20], [first("cost"), 22], [first("sceptic"), 25], [at("sceptic", 7), 28], [first("choice"), 30]] as [number, number][];
const dayAt = (t: number) => {
  if (!DAYS.length) DAYS.push(...dayKeys());
  let d = 1;
  for (const [i, n] of DAYS) if (t >= S(i) - 0.2) d = n;
  return d;
};
const momGhost = (t: number) => {
  const sc = first("sceptic");
  let o = 0.5 - dayAt(t) * 0.013;
  if (t >= S(sc + 5) && t < S(sc + 7)) o += 0.3 * Math.abs(Math.sin((t - S(sc + 5)) * 7)) * (1 - ease(t, E(sc + 6) - 0.4, E(sc + 6))); // "78?" flicker
  if (t >= S(sc + 7) + 1.2) o = 0; // day 28: gone
  if (t >= S(sc + 8) + 0.6) o = 0.07 + 0.05 * Math.abs(Math.sin(t * 5)); // flickers back
  return o;
};
const moneyAt = (t: number) => {
  const d = first("detective");
  const k: [number, number][] = [[S(d), 43], [S(d + 2), 143], [S(d + 5), 400], [S(d + 6), 3000], [S(d + 8), 9500], [S(first("cost")), 11200], [S(first("choice")), 15000]];
  return Math.round(interpolate(t, k.map((x) => x[0]), k.map((x) => x[1]), { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
};

// ---------- shots ----------
const shots: Record<string, React.FC<ShotProps>> = {
  cold_open: ({ t, t0, t1 }) => {
    const dadIn = S(1) + 1.4;
    const dadX = interpolate(t, [dadIn, dadIn + 1.2], [2150, 1640], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const ghostIn = ease(t, S(0) + 1.4, S(0) + 2.6);
    return (
      <Camera t={t} t0={t0} t1={t1} from={1.0} to={1.1} fx={1100} fy={500} punch={[S(3) + 0.1]}>
        <Kitchen t={t} />
        <Svg>
          <Table />
          <Ghost x={1180} y={640} look={G_PILOT} t={t} o={momGhost(t) * ghostIn * 1.2} pose="wave" flip />
          <Person x={1120} y={1000} look={MOM} mood={t > S(2) ? "happy" : "neutral"} t={t} {...say(t, "MOM")} flip lookX={-1} pose="hold" holding={<rect x={-30} y={-40} width={60} height={70} rx={10} fill="#F4F6FA" />} />
          <Person x={520} y={1000} look={YOU} mood={t > S(3) ? "nervous" : "shocked"} t={t} {...say(t, "YOU")} lookX={1} sweat={t > S(3)} />
          {dadX < 2100 && <g>
            <Person x={dadX} y={1000} look={DAD} mood="neutral" t={t} {...say(t, "DAD")} flip lookX={-1} />
            <Label t={t} at={dadIn + 1.3} until={E(1) + 0.2} x={dadX} y={460} text="?" size={70} bg="rgba(255,255,255,0.85)" />
          </g>}
          <Label t={t} at={S(0) + 2.6} until={S(1) - 0.1} x={1180} y={140} text="THE PILOT SHE NEVER BECAME" size={34} />
        </Svg>
        <Chip t={t} at={S(1) + 0.2} text="30 DAYS LEFT" />
      </Camera>
    );
  },

  promise: ({ t, t0, t1 }) => {
    const d = E(4) - S(4);
    const items = [
      { a: S(4) + d * 0.12, x: 420, txt: "$15,000", c: "#6FD38F" },
      { a: S(4) + d * 0.38, x: 960, txt: "SCHOOL", c: "#9FE3FF" },
      { a: S(4) + d * 0.7, x: 1500, txt: "?", c: P.gold },
    ];
    return (
      <Camera t={t} t0={t0} t1={t1}>
        <Backdrop base={P.night} light={P.nightHi}>
          <Bokeh t={t} />
        </Backdrop>
        <Svg>
          {items.map((it, i) => {
            const p = pop(t, it.a);
            return p > 0 ? <g key={i} transform={`translate(${it.x} 500) scale(${p}) rotate(${Math.sin(t * 2 + i) * 3})`}>
              <Glow cx={0} cy={0} r={300} color={it.c} opacity={0.35} id={`pr${i}`} />
              <circle r={200} fill="#F7E3B8" /><circle r={186} fill="#2C3852" />
              {i === 1 && <><Ghost x={-60} y={150} look={G_DJ} t={t} o={0.9} s={0.42} pose="cheer" /><Ghost x={70} y={150} look={G_BALLET} t={t + 1} o={0.9} s={0.42} spin /></>}
              {i === 2 && <g transform="translate(0 40)"><rect x={-90} y={-70} width={180} height={110} fill="#F4E6D6" /><path d="M -110 -70 L 0 -150 L 110 -70 Z" fill="#C66B7A" /></g>}
              <text y={i === 0 ? 34 : i === 2 ? -10 : -110} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={i === 0 ? 92 : i === 2 ? 140 : 54} fill={it.c}>{it.txt}</text>
            </g> : null;
          })}
        </Svg>
      </Camera>
    );
  },

  rules: ({ t, t0, t1 }) => {
    const a = first("rules");
    if (t < S(a + 4) - 0.15) {
      // explainer on a stage
      const one = t < S(a + 1) - 0.15, three = !one && t < S(a + 2) - 0.15, kid = !one && !three && t < S(a + 3) - 0.15;
      const d1 = E(a + 1) - S(a + 1);
      return (
        <Camera t={t} t0={t0} t1={t1} punch={[S(a + 1) + d1 * 0.82]}>
          <Stage t={t} />
          <Svg>
            {one && <>
              <Ghost x={1010} y={700} look={{ ...extra(0), top: "#E25C5C", topDark: "#C04848", acc: ["headphones"] }} t={t} o={ease(t, S(a) + 0.6, S(a) + 2)} pose="cheer" />
              <Person x={960} y={1000} look={extra(0)} mood="neutral" t={t} />
            </>}
            {three && [0, 1, 2].map((i) => {
              const x = 420 + i * 540, ap = S(a + 1) + d1 * (0.05 + i * 0.3);
              const o = [0.95, 0.3, i === 2 ? 0.3 * (1 - ease(t, ap + 0.4, ap + 1.6)) : 0][i];
              return <g key={i}>
                <Ghost x={x + 50} y={700} look={{ ...extra(i + 1), top: ["#F2B640", "#5BD3D0", "#B9A7D6"][i], acc: [["pilot"], ["beret"], ["partyhat"]][i] as Look["acc"] }} t={t + i} o={o * pop(t, ap)} pose={i === 0 ? "cheer" : "stand"} />
                <Person x={x} y={1000} look={extra(i + 1)} mood={["happy", "neutral", "sad"][i] as Mood} t={t + i} s={0.9} />
                <Label t={t} at={ap + 0.2} x={x} y={150} text={["BRIGHT", "FAINT", "GONE"][i]} size={34} bg={["#F2B640", "#9FE3FF", "#E25C5C"][i]} />
              </g>;
            })}
            {kid && <>
              <Person x={760} y={1000} look={KID} mood="smug" t={t} s={0.8} />
              <Label t={t} at={S(a + 2) + 0.4} x={760} y={420} text="NO GHOST (YET)" size={34} />
              <Person x={1240} y={1000} look={{ ...KID, tall: 1.05, top: P.teal, topDark: P.tealDark }} mood="shocked" t={t} />
              <Ghost x={1290} y={700} look={{ ...KID, tall: 1.05, top: "#9FE3FF", acc: ["helmet"] }} t={t} o={0.8 * ease(t, S(a + 2) + 1.4, S(a + 2) + 2.4)} pose="wave" />
              <Label t={t} at={S(a + 2) + 1.4} x={1480} y={560} text="18" size={40} bg={P.gold} />
            </>}
          </Svg>
          {!one && !three && !kid && card(t, S(a + 3) + 0.3, E(a + 3) + 0.3, "CORNELL STUDY · 2018", "76%", "said their biggest regret was who they didn't become", "#9FE3FF", 600, 300)}
          {!one && !three && !kid && <AbsoluteFill><Svg><Ghost x={360} y={900} look={G_SURF} t={t} o={0.6} s={0.7} /><Ghost x={1600} y={900} look={G_OPERA} t={t} o={0.6} s={0.7} pose="cheer" /></Svg></AbsoluteFill>}
        </Camera>
      );
    }
    return (
      <Camera t={t} t0={S(a + 4) - 0.3} t1={t1} from={1.08} to={1.0} fx={1100} punch={[S(a + 7) + 0.2]}>
        <Kitchen t={t} night />
        <Svg>
          <Table night />
          <Ghost x={1000} y={650} look={G_PILOT} t={t} o={momGhost(t)} pose="wave" flip />
          <Person x={950} y={1000} look={MOM} mood={t > S(a + 7) ? "smug" : "neutral"} t={t} {...say(t, "MOM")} flip lookX={1} />
          <Person x={1450} y={1000} look={DAD} mood={t > S(a + 6) ? "nervous" : "neutral"} t={t} {...say(t, "DAD")} flip lookX={-1} />
          <Person x={420} y={1000} look={YOU} mood="shocked" t={t} lookX={1} />
          <Label t={t} at={S(a + 4) + 0.6} until={S(a + 5)} x={1000} y={160} text="ALMOST SEE-THROUGH" size={34} />
        </Svg>
        <Chip t={t} at={S(a + 5) + 0.3} text="17 YEARS" x={60} y={50} />
      </Camera>
    );
  },

  bus: ({ t, t0, t1 }) => {
    const a = first("bus");
    const fx = interpolate(t, [S(a + 3) - 0.2, S(a + 3) + 0.8], [600, 1350], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const sing = t > S(a + 2) - 0.2;
    return (
      <Camera t={t} t0={t0} t1={t1} from={1.05} to={1.15} fx={fx} fy={560} punch={[S(a + 2) + 0.3, S(a + 3) + (E(a + 3) - S(a + 3)) * 0.6]}>
        <Bus t={t} />
        <Svg>
          <Ghost x={360} y={720} look={G_OPERA} t={t} o={0.85} pose={sing ? "cheer" : "stand"} mood={sing ? "happy" : "neutral"} />
          {sing && [0, 1, 2].map((k) => <Note key={k} x={460} y={300} t={t} k={k} />)}
          <Person x={300} y={1000} look={DRIVER} mood="deadpan" t={t} {...say(t, "BUS DRIVER")} lookX={1} />
          <circle cx={440} cy={830} r={70} fill="none" stroke="#2B2B36" strokeWidth={16} />
          <Ghost x={1200} y={680} look={G_SURF} t={t} o={0.8} pose="wave"><rect x={1290} y={300} width={44} height={280} rx={22} fill="#F2B640" transform="rotate(12 1312 440)" /></Ghost>
          <Person x={1150} y={1000} look={SUIT} mood="deadpan" t={t} s={0.9} />
          <Person x={1600} y={1000} look={KID} mood="happy" t={t} s={0.62} pose="hold" holding={<rect x={-26} y={-34} width={52} height={64} rx={8} fill="#E25C5C" />} />
          <Label t={t} at={S(a + 3) + (E(a + 3) - S(a + 3)) * 0.75} x={1600} y={560} text="JUST SNACKS" size={32} />
          <Label t={t} at={S(a + 3) + 0.3} x={1150} y={330} text="ROW 3" size={30} bg="#9FE3FF" />
        </Svg>
        <Chip t={t} at={t0 + 0.3} text="DAY 2 · 7:40 A.M." />
      </Camera>
    );
  },

  class: ({ t, t0, t1 }) => {
    const a = first("class");
    const gym = t >= S(a + 3) - 0.15;
    if (gym) return (
      <Camera t={t} t0={S(a + 3) - 0.3} t1={t1} from={1.0} to={1.12} fx={960} fy={600} punch={[S(a + 4) + 0.2]} shake={[S(a + 3) + 0.2]}>
        <Classroom t={t} gym />
        <Svg>
          <Ghost x={1080} y={640} look={G_BALLET} t={t} o={0.9} pose="cheer" spin={t > S(a + 4) - 0.2} mood="happy" />
          <Person x={900} y={1000} look={COACH} mood="angry" t={t} {...say(t, "COACH")} pose="point" lookX={-1} flip />
          <Label t={t} at={S(a + 4) + 0.3} x={1080} y={180} text="PERFECT PIROUETTE" size={34} bg="#F4A6C8" />
        </Svg>
      </Camera>
    );
    const bike = t > S(a + 1) - 0.1;
    const d2 = E(a + 2) - S(a + 2);
    return (
      <Camera t={t} t0={t0} t1={t1} from={1.0} to={1.1} fx={760} punch={[S(a + 1) + 1.4]}>
        <Classroom t={t} />
        <Svg>
          {bike && <g transform={`translate(${330 + Math.sin(t * 2) * 30} ${400 + Math.sin(t * 4) * 8}) rotate(${-8 + Math.sin(t * 3) * 3})`} opacity={0.9} filter="url(#ghost)">
            <Glow cx={0} cy={-120} r={360} color="#FFC870" opacity={0.5} id="bikeglow" />
            <Motorbike t={t} /><g transform="translate(0 -40)"><Person x={0} y={0} look={G_STUNT} mood="happy" t={t} s={0.65} pose="cheer" noLegs /></g>
          </g>}
          {!bike && <Ghost x={620} y={640} look={G_STUNT} t={t} o={0.5} />}
          <Person x={540} y={1000} look={TEACHER} mood="deadpan" t={t} {...say(t, "TEACHER")} lookX={1} />
          <Bubble t={t} at={S(a + 2) + 0.1} until={E(a + 2) + 0.05} cx={1150} cy={380} r={200} fromX={760} fromY={560} id="dj" bg="#3A2F55">
            <Ghost x={240} y={330} look={G_DJ} t={t} o={0.95} s={0.5} pose="cheer" /><Person x={180} y={420} look={PRINCIPAL} mood="deadpan" t={t} s={0.5} />
            <rect x={150} y={300} width={140} height={40} rx={8} fill="#2B2B36" /><circle cx={190} cy={320} r={14} fill="#5BD3D0" /><circle cx={250} cy={320} r={14} fill="#5BD3D0" transform={`rotate(${t * 300} 250 320)`} />
          </Bubble>
          <Bubble t={t} at={S(a + 2) + d2 * 0.45} until={E(a + 2) + 0.05} cx={1600} cy={560} r={200} fromX={760} fromY={560} id="bal" bg="#553A4A">
            <Ghost x={240} y={330} look={G_BALLET} t={t} o={0.95} s={0.5} pose="cheer" spin /><Person x={180} y={420} look={COACH} mood="angry" t={t} s={0.5} />
          </Bubble>
          <Label t={t} at={S(a + 1) + 1.2} until={S(a + 2)} x={560} y={170} text="ON FIRE. ON A MOTORCYCLE." size={32} bg="#FFC870" />
        </Svg>
      </Camera>
    );
  },

  lunch: ({ t, t0, t1 }) => {
    const a = first("lunch");
    const theo = t >= S(a + 2) - 0.15;
    return (
      <Camera t={t} t0={t0} t1={t1} from={1.06} to={1.0} fx={theo ? 500 : 1350} punch={[S(a + 4) + 0.2]}>
        <Cafeteria t={t} />
        <Svg>
          <g opacity={1 - 0.5 * ease(t, S(a + 2) - 0.2, S(a + 2) + 0.4)}>
            <Ghost x={1420} y={590} look={G_DESIGN} t={t} o={0.85} pose="point" flip>
              <path d="M 1640 520 L 1660 300 L 1680 520 Z M 1630 420 L 1690 420" stroke="#BFEFFF" strokeWidth={6} fill="none" />
            </Ghost>
            <Person x={1360} y={880} look={LUNCH} mood="deadpan" t={t} flip />
          </g>
          {!theo && <Label t={t} at={S(a) + 1.6} x={1420} y={150} text="PARIS" size={40} bg="#C2384A" color={P.white} />}
          <Person x={260} y={1000} look={YOU} mood={t > S(a + 3) ? "smug" : "neutral"} t={t} {...say(t, "YOU")} lookX={1} s={0.95} />
          <Person x={720} y={1000} look={THEO} mood={t > S(a + 4) ? "sad" : t > S(a + 2) ? "happy" : "neutral"} t={t + (theo ? Math.sin(t * 6) * 0.02 : 0)} {...say(t, "THEO")} flip lookX={1} s={0.95}
            pose={t > S(a + 4) ? "shrug" : t > S(a + 2) ? "cheer" : "stand"} />
          {theo && <Label t={t} at={S(a + 3) + 0.4} x={720} y={330} text="17 = NO GHOST" size={32} />}
        </Svg>
        {!theo && card(t, S(a + 1) + 0.3, E(a + 1) + 0.1, "VERA WANG", "AGE 40", "her first dress, after skating and journalism", "#C2384A", 120, 160)}
      </Camera>
    );
  },

  dinner: ({ t, t0, t1 }) => {
    const a = first("dinner");
    const planeK = (t - S(a)) / 4;
    const dadGhost = t > S(a + 4) - 0.15;
    return (
      <Camera t={t} t0={t0} t1={t1} from={1.0} to={1.08} fx={dadGhost ? 1450 : 800} shake={[S(a) + 1.2]} punch={[S(a + 1) + 0.3]}>
        <Kitchen t={t} night win={planeK > 0 && planeK < 1 ? <Jet x={140 + planeK * 520} y={260 - planeK * 40} s={0.7} /> : null} />
        <Svg>
          <Table night />
          <Ghost x={760} y={650} look={G_PILOT} t={t} o={momGhost(t) * (t > S(a + 3) ? 1.5 : 1)} pose={t > S(a + 1) ? "point" : "stand"} mood={t > S(a + 3) ? "sad" : "happy"} />
          <Person x={700} y={1000} look={MOM} mood={t > S(a + 3) ? "sad" : "smug"} t={t} {...say(t, "MOM")} pose={t > S(a + 1) - 0.2 && t < S(a + 3) ? "point" : "stand"} flip lookX={1} />
          {/* Dad's ghost: exactly where he stands, a faint shimmer of his own outline */}
          {dadGhost && <g opacity={0.25 + 0.2 * Math.sin(t * 4)}><Glow cx={1400} cy={720} r={340} color="#9FE3FF" opacity={0.5} id="dadg" /></g>}
          <Person x={1400} y={1000} look={DAD} mood={t > S(a + 2) ? "happy" : "neutral"} t={t} {...say(t, "DAD")} flip lookX={-1} />
          {dadGhost && <g opacity={0.3 + 0.15 * Math.sin(t * 4)} filter="url(#ghost)" transform="translate(6 -4)"><Person x={1400} y={1000} look={DAD} mood="happy" t={t + 0.4} flip noLegs /></g>}
          <Person x={1060} y={1000} look={YOU} mood={t > S(a + 5) ? "sad" : t > S(a + 4) ? "shocked" : "neutral"} t={t} lookX={t > S(a + 4) ? 1 : -1} s={0.9} />
          <Label t={t} at={S(a + 1) + 0.2} until={S(a + 3)} x={370} y={500} text="BOEING 737" size={38} bg="#9FE3FF" />
          <Label t={t} at={S(a + 4) + 1.2} until={E(a + 5) + 0.2} x={1400} y={220} text={t > S(a + 5) ? "ALMOST GONE?" : "BARELY THERE"} size={34} />
        </Svg>
      </Camera>
    );
  },

  goal: ({ t, t0, t1 }) => {
    const a = first("goal");
    const fill = Math.floor(interpolate(t, [S(a) + 0.5, E(a)], [0, 30], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    const cash = t > S(a + 2) - 0.15;
    return (
      <Camera t={t} t0={t0} t1={t1} punch={[S(a + 2) + 0.8]}>
        <Room t={t} />
        <Svg>
          {!cash && <g transform="translate(520 200)">
            {Array.from({ length: 30 }, (_, i) => {
              const x = (i % 10) * 92, y = Math.floor(i / 10) * 92, lit = i < fill;
              return <g key={i} transform={`translate(${x} ${y}) scale(${lit ? 1 : 0.92})`}><rect width={80} height={80} rx={14} fill={lit ? "#9FE3FF" : "#2C3852"} opacity={lit ? 0.35 + 0.65 * (1 - i / 30) : 1} />
                <text x={40} y={52} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={30} fill={lit ? P.ink : "#6A7186"}>{i + 1}</text></g>;
            })}
            <text x={0} y={-30} fontFamily={font} fontWeight={900} fontSize={40} fill="#9FE3FF">MOM'S GHOST · 30 DAYS</text>
          </g>}
          {cash && <>
            <Person x={760} y={1000} look={YOU} mood="nervous" t={t} pose="shrug" />
            <Label t={t} at={S(a + 2) + 0.2} x={1180} y={420} text="$43" size={90} bg="#6FD38F" />
            <g transform={`translate(1180 620) scale(${pop(t, S(a + 2) + 1.2)}) rotate(-6)`}><rect x={-160} y={-60} width={320} height={120} rx={14} fill={P.cream} /><text y={-6} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={30} fill={P.ink}>LIBRARY CARD</text><rect x={-120} y={20} width={240} height={14} rx={7} fill="#C9D2DE" /></g>
          </>}
        </Svg>
        {!cash && card(t, S(a + 1) + 0.2, E(a + 1) + 0.2, "FLIGHT SCHOOL · AOPA", "$6K–$20K", "to earn a private pilot license", P.gold, 1100, 560, 700)}
      </Camera>
    );
  },

  detective: ({ t, t0, t1 }) => {
    const a = first("detective");
    const beat = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].filter((k) => t >= S(a + k) - 0.15).pop() ?? 0;
    const cam = (from: number, to: number, fx = 960, fy = 540, punch: number[] = [], shake: number[] = [], k0 = beat) => ({ t, t0: S(a + k0) - 0.2, t1: E(a + k0) + 0.3, from, to, fx, fy, punch, shake });
    // open mic
    if (beat === 2) return (
      <Camera {...cam(1.05, 1.15, 960, 500, [S(a + 2) + 1.2])}>
        <Stage t={t} color="#5A2F55" />
        <Svg>
          <Glow cx={960} cy={500} r={500} color="#FFF4D6" opacity={0.35} id="mic" />
          <Person x={960} y={960} look={CUSTOMER} mood="happy" t={t} talk pose="hold" holding={<g><rect x={-8} y={-10} width={16} height={60} rx={6} fill="#2B2B36" /><circle cy={-16} r={16} fill="#8A8F9C" /></g>} />
          {[0, 1, 2].map((i) => <Label key={i} t={t} at={S(a + 2) + 0.8 + i * 0.35} x={420 + i * 540} y={240 + (i % 2) * 90} text="HA HA" size={50} bg={P.gold} rot={-8 + i * 8} />)}
        </Svg>
        <Chip t={t} at={S(a + 2)} text="OPEN MIC · 9 P.M." />
      </Camera>
    );
    // the stunt over the fountain
    if (beat === 6) {
      const k = ease(t, S(a + 6) + 0.6, S(a + 6) + 2.4);
      const alarm = t > S(a + 6) + 2.6;
      return (
        <Camera {...cam(1.0, 1.08, 960, 540, [], [S(a + 6) + 2.6])}>
          <Sky t={t} house={false} />
          <Svg>
            <rect y={860} width={1920} height={220} fill="#9AA3B5" />
            <g transform="translate(960 860)"><ellipse rx={260} ry={50} fill="#6F86A8" /><ellipse cy={-10} rx={230} ry={36} fill="#8FC3E6" /><rect x={-30} y={-180} width={60} height={170} fill="#C9D2DE" />
              {[0, 1, 2, 3].map((i) => <path key={i} d={`M 0 -180 q ${-80 + i * 55} -60 ${-140 + i * 95} ${60 + (i % 2) * 20}`} stroke="#BFEFFF" strokeWidth={8} fill="none" opacity={0.8} />)}</g>
            <g transform={`translate(${200 + k * 1500} ${760 - Math.sin(k * Math.PI) * 420}) rotate(${-20 + k * 40}) scale(0.8)`}>
              <Motorbike t={t} /><g transform="translate(0 -40)"><Person x={0} y={0} look={{ ...TEACHER, acc: ["helmet"] }} mood="happy" t={t} s={0.65} pose="cheer" noLegs /></g>
            </g>
            {alarm && <g transform="translate(1680 180)"><circle r={70} fill={Math.sin(t * 25) > 0 ? P.red : "#8A2E2E"} /><text y={150} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={44} fill={P.red}>FIRE ALARM</text>
              {[0, 1].map((i) => <path key={i} d={`M ${-100 - i * 30} -40 q -20 40 0 80 M ${100 + i * 30} -40 q 20 40 0 80`} stroke={P.red} strokeWidth={8} fill="none" opacity={Math.abs(Math.sin(t * 12 + i))} />)}</g>}
            <Label t={t} at={S(a + 6) + 0.3} x={600} y={140} text="PEP RALLY" size={40} bg={P.gold} />
          </Svg>
        </Camera>
      );
    }
    // opera on route 9, going viral
    if (beat === 7) {
      const views = Math.round(interpolate(t, [S(a + 7) + 1.6, E(a + 7)], [0, 6000000], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
      return (
        <Camera {...cam(1.02, 1.1, 960, 540, [E(a + 7) - 0.6])}>
          <Bus t={t} />
          <Svg>
            <g transform="translate(960 470) scale(0.85)">
              <rect x={-330} y={-460} width={660} height={900} rx={60} fill="#141A28" /><rect x={-300} y={-420} width={600} height={720} rx={30} fill="#3A4A66" />
              <clipPath id="ph"><rect x={-300} y={-420} width={600} height={720} rx={30} /></clipPath>
              <g clipPath="url(#ph)"><Person x={0} y={300} look={{ ...DRIVER, acc: ["bowtie"] }} mood="happy" t={t} talk pose="cheer" s={1.1} />{[0, 1, 2].map((k) => <Note key={k} x={120} y={-150} t={t} k={k} />)}</g>
              <text y={250} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={60} fill={P.white}>{views.toLocaleString("en-US")} views</text>
            </g>
            <Label t={t} at={S(a + 7) + 0.3} x={420} y={200} text="ROUTE 9" size={44} bg="#9FE3FF" />
          </Svg>
        </Camera>
      );
    }
    // the line around the block
    if (beat === 8) return (
      <Camera {...cam(1.0, 1.15, 1300, 700)}>
        <Sky t={t} house={false} />
        <Svg>
          <rect x={1300} y={500} width={600} height={400} fill="#4A4258" /><path d="M 1260 500 L 1600 360 L 1940 500 Z" fill="#3B3446" /><rect x={1380} y={600} width={440} height={300} fill="#2B2733" />
          <text x={1600} y={570} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={34} fill="#F7E3B8">DREAM DETECTIVE</text>
          {Array.from({ length: 16 }, (_, i) => <g key={i}><Ghost x={1260 - i * 82 + 20} y={760} look={{ ...extra(i), acc: [(["pilot", "beret", "headphones", "partyhat", "helmet"] as const)[i % 5]] }} t={t + i} o={0.55} s={0.34} /><Person x={1260 - i * 82} y={960} look={extra(i)} mood={i % 3 ? "neutral" : "happy"} t={t + i} s={0.42} /></g>)}
        </Svg>
        <Chip t={t} at={S(a + 8)} text="DAY 20" />
      </Camera>
    );
    // the money recap
    if (beat === 11) {
      const d = E(a + 11) - S(a + 11);
      return (
        <Camera {...cam(1.0, 1.08)}>
          <Backdrop base="#163A2C" light="#2E6B50"><Bokeh t={t} color="#6FD38F" /></Backdrop>
          <Svg>
            {[["DAY 5", "$400"], ["DAY 12", "$3,000"], ["DAY 20", "$9,500"]].map(([dy, m], i) => {
              const p = pop(t, S(a + 11) + d * (0.05 + i * 0.33));
              return p > 0 ? <g key={i} transform={`translate(${400 + i * 560} 540) scale(${p * (1 + i * 0.12)})`}>
                <rect x={-220} y={-150} width={440} height={300} rx={36} fill={P.cream} /><text y={-50} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={40} fill="#7C8296">{dy}</text>
                <text y={70} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={96} fill={P.green}>{m}</text></g> : null;
            })}
          </Svg>
        </Camera>
      );
    }
    // the garage: customers, mailman, parents, Theo
    const garageBeats = beat < 2 ? 0 : beat < 6 ? 3 : beat < 11 ? 9 : 12;
    const mail = beat >= 3 && beat <= 5, parents = beat === 9 || beat === 10, theo = beat >= 12;
    return (
      <Camera t={t} t0={S(a + garageBeats) - 0.2} t1={E(a + (garageBeats === 12 ? 14 : garageBeats === 9 ? 10 : garageBeats === 3 ? 5 : 1)) + 0.3} from={1.02} to={1.1} fx={1150} fy={600}
        punch={[S(a + 1) + 0.2, S(a + 5) + 0.3, S(a + 14) + 0.3]}>
        <Garage t={t} sign={pop(t, S(a) + 0.8)} />
        <Svg>
          <Person x={760} y={1000} look={YOU} mood={theo ? "deadpan" : "smug"} t={t} {...say(t, "YOU")} lookX={1} s={0.95} pose={beat === 0 ? "hold" : "stand"}
            holding={beat === 0 ? <g transform="rotate(-30)"><circle r={34} fill="none" stroke="#8E6646" strokeWidth={10} /><circle r={28} fill="#BFEFFF" opacity={0.5} /><rect x={-6} y={34} width={12} height={60} rx={6} fill="#8E6646" /></g> : undefined} />
          {beat <= 1 && <>
            <Ghost x={1320} y={640} look={G_COMIC} t={t} o={0.85 * ease(t, S(a + 1) - 0.4, S(a + 1) + 0.4)} pose="hold" mood="happy" />
            <Person x={1260} y={1000} look={CUSTOMER} mood={t > S(a + 1) + 1 ? "happy" : "shocked"} t={t} {...say(t, "CUSTOMER")} flip lookX={-1} />
            <Label t={t} at={S(a + 1) + 0.4} x={1320} y={200} text="STAND-UP COMEDIAN" size={34} bg="#B9A7D6" />
          </>}
          {mail && <>
            <Ghost x={1310} y={650} look={MAILMAN} t={t} o={0.7} pose="wave" />
            <Person x={1260} y={1000} look={MAILMAN} mood="happy" t={t} {...say(t, "MAILMAN")} flip lookX={-1} pose="hold" holding={<rect x={-50} y={-30} width={100} height={70} rx={10} fill="#8E6646" />} />
            <Label t={t} at={S(a + 3) + 1.6} x={960} y={400} text="SAME BAG. SAME SHORTS." size={32} />
            {beat === 5 && <g transform={`translate(1260 560) rotate(-10) scale(${pop(t, S(a + 5) + 0.2)})`}><rect x={-250} y={-50} width={500} height={100} rx={12} fill="none" stroke={P.red} strokeWidth={10} /><text y={20} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={52} fill={P.red}>REMEMBER HIM</text></g>}
          </>}
          {parents && <>
            <Ghost x={1500} y={640} look={G_PILOT} t={t} o={momGhost(t)} pose="wave" flip />
            <Person x={1460} y={1000} look={MOM} mood="smug" t={t} {...say(t, "MOM")} flip lookX={-1} />
            <Person x={1180} y={1000} look={DAD} mood={t > S(a + 10) ? "happy" : "nervous"} t={t} {...say(t, "DAD")} flip lookX={-1} />
            <Label t={t} at={S(a + 10) + 0.6} x={760} y={280} text="+ TAX" size={44} bg="#6FD38F" />
          </>}
          {theo && <>
            <Person x={1260} y={1000} look={THEO} mood={beat === 14 ? "smug" : "happy"} t={t} {...say(t, "THEO")} flip lookX={-1} pose={beat === 14 ? "point" : "cheer"} />
            <Bubble t={t} at={S(a + 14) + 0.3} cx={1600} cy={540} r={160} fromX={1320} fromY={640} id="seal" bg="#3E4A30">
              <Person x={170} y={330} look={SEAL} mood="angry" t={t} s={0.45} /><rect x={60} y={50} width={220} height={50} rx={25} fill={P.cream} /><text x={170} y={86} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={30} fill={P.ink}>NAVY SEAL?</text>
            </Bubble>
          </>}
        </Svg>
        {beat === 0 && <Chip t={t} at={S(a) + 0.2} text="DAY 3" />}
      </Camera>
    );
  },

  cost: ({ t, t0, t1 }) => {
    const a = first("cost");
    const attic = t >= S(a + 2) - 0.15 && t < S(a + 5) - 0.15;
    const email = t >= S(a + 5) - 0.15;
    if (email) {
      const clash = t > S(a + 6) - 0.15;
      return (
        <Camera t={t} t0={S(a + 5) - 0.3} t1={t1} from={1.0} to={1.1} punch={[S(a + 5) + (E(a + 5) - S(a + 5)) * 0.85, S(a + 6) + 2.5]}>
          <Room t={t} />
          <Svg>
            {!clash && <><Screen x={960} y={420} t={t} title="SUMMER ANIMATION" sub="Your application" color={P.teal} glow={1} btn="OPEN EMAIL" />
              <Label t={t} at={S(a + 5) + (E(a + 5) - S(a + 5)) * 0.8} x={960} y={330} text="ACCEPTED!" size={70} bg={P.green} color={P.white} rot={-6} />
              <Person x={420} y={1000} look={YOU} mood={t > S(a + 5) + 3 ? "happy" : "neutral"} t={t} pose={t > S(a + 5) + 3 ? "cheer" : "stand"} lookX={1} /></>}
            {clash && <>
              {[0, 1].map((i) => <g key={i} transform={`translate(${560 + i * 800} 440) scale(${pop(t, S(a + 6) + i * 1.2)})`}>
                <rect x={-330} y={-170} width={660} height={340} rx={30} fill={P.cream} /><text y={-80} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={34} fill="#7C8296">{i ? "MOM'S FLIGHT SCHOOL" : "YOUR DEPOSIT"}</text>
                <text y={30} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={84} fill={i ? P.gold : P.teal}>{i ? "DAY 30" : "$14,800"}</text>
                <text y={110} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={36} fill={P.red}>{i ? "LAST DAY TO ENROLL" : "DUE DAY 30"}</text></g>)}
              {t > S(a + 6) + 2.5 && <g transform={`translate(960 760) scale(${pop(t, S(a + 6) + 2.5)})`}><rect x={-300} y={-60} width={600} height={120} rx={60} fill={P.red} /><text y={22} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={60} fill={P.white}>SAME DAY</text></g>}
            </>}
          </Svg>
        </Camera>
      );
    }
    if (attic) return (
      <Camera t={t} t0={S(a + 2) - 0.3} t1={S(a + 5)} from={1.08} to={1.0} fx={1000} punch={[S(a + 3) + (E(a + 3) - S(a + 3)) * 0.8]}>
        <Attic t={t} />
        <Svg>
          <g transform={`translate(1450 560) rotate(${Math.sin(t * 1.2) * 2})`}><line x1={0} y1={-260} x2={0} y2={-200} stroke="#8A8F9C" strokeWidth={6} />
            <path d="M -40 -200 L 40 -200 L 150 -150 L 170 160 L -170 160 L -150 -150 Z" fill="#6A4A30" /><path d="M -40 -200 L 0 -60 L 40 -200" fill="#E8D8C0" /><rect x={-150} y={140} width={320} height={30} fill="#5A3E28" /></g>
          <Person x={760} y={1000} look={YOU} mood={t > S(a + 3) ? "sad" : "shocked"} t={t} pose="hold" lookX={1} holding={<Envelope x={0} y={-40} s={0.45} label="FLIGHT ACADEMY" open={ease(t, S(a + 2) + 1, S(a + 2) + 2)} />} />
          {t > S(a + 3) - 0.15 && t < S(a + 4) - 0.15 && <Label t={t} at={S(a + 3) + (E(a + 3) - S(a + 3)) * 0.78} x={960} y={200} text="YOU WERE THE PRICE" size={60} bg={P.red} color={P.white} />}
          {t > S(a + 4) - 0.15 && <Bubble t={t} at={S(a + 4) + 0.2} cx={1300} cy={330} r={190} fromX={860} fromY={560} id="nap" bg="#2C3852">
            <Person x={190} y={420} look={MOM} mood="sleepy" t={t} s={0.55} />{[0, 1, 2].map((k) => <text key={k} x={260 + k * 30} y={170 - k * 40 - ((t * 20) % 20)} fontFamily={font} fontWeight={900} fontSize={34 + k * 8} fill="#9FE3FF">z</text>)}
          </Bubble>}
        </Svg>
        {t < S(a + 4) - 0.15 && card(t, S(a + 3) + 0.2, S(a + 3) + (E(a + 3) - S(a + 3)) * 0.72, "BROOKINGS ESTIMATE", "$310,605", "to raise one kid to 17", P.orange, 120, 120, 680)}
        {card(t, S(a + 4) + 1.2, E(a + 4) + 0.2, "SLEEP STUDY · 2019", "6 YEARS", "until parents' sleep recovers", "#9FE3FF", 1150, 640, 620)}
      </Camera>
    );
    // whose dream you are / the year you were born
    return (
      <Camera t={t} t0={t0} t1={S(a + 2)} from={1.0} to={1.1} fx={1100}>
        <Kitchen t={t} night />
        <Svg>
          <Ghost x={1180} y={640} look={G_PILOT} t={t} o={momGhost(t) * 1.4} pose="wave" flip mood="sad" />
          <Person x={1120} y={1000} look={MOM} mood="neutral" t={t} flip lookX={-1} />
          <Person x={520} y={1000} look={YOU} mood="sad" t={t} lookX={1} />
          {t > S(a) + 2 && <path d={`M 600 560 Q 860 ${300 + Math.sin(t * 2) * 20} 1120 380`} stroke="#9FE3FF" strokeWidth={6} strokeDasharray="4 18" strokeLinecap="round" fill="none" opacity={ease(t, S(a) + 2, S(a) + 3)} />}
          <Bubble t={t} at={S(a + 1) + 0.2} cx={960} cy={300} r={200} fromX={1120} fromY={560} id="born" bg="#4A3A5A">
            <Person x={200} y={420} look={{ ...MOM, hair: "#6A4A3A" }} mood="happy" t={t} s={0.5} pose="hold" holding={<g><ellipse rx={36} ry={26} fill="#F4E6D6" /><circle cx={-20} cy={-6} r={16} fill={P.skin} /></g>} />
            <g transform="translate(300 170) rotate(10)"><rect x={-60} y={-40} width={120} height={80} rx={8} fill={P.cream} /><text y={8} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={18} fill={P.green}>ACCEPTED</text></g>
          </Bubble>
        </Svg>
        <Chip t={t} at={S(a + 1) + 0.2} text="THE YEAR YOU WERE BORN" />
      </Camera>
    );
  },

  sceptic: ({ t, t0, t1 }) => {
    const a = first("sceptic");
    const facts = t >= S(a + 3) - 0.15 && t < S(a + 5) - 0.15;
    const night = t >= S(a + 7) - 0.15;
    if (facts) {
      const moses = t >= S(a + 4) - 0.15;
      return (
        <Camera t={t} t0={S(a + 3) - 0.3} t1={S(a + 5)} from={1.0} to={1.06}>
          <Sky t={t} house={false} />
          <Svg>
            {!moses && <Cessna x={1300 - (t - S(a + 3)) * 60} y={520} s={1.3} t={t} />}
            {moses && <g transform={`translate(1350 560) scale(${pop(t, S(a + 4) + 0.2)})`}>
              <rect x={-20} y={0} width={40} height={340} fill="#8E6646" transform="rotate(10)" /><rect x={-250} y={-260} width={500} height={340} rx={6} fill="#8E6646" /><rect x={-230} y={-240} width={460} height={300} fill="#F4E6D6" />
              <path d="M -230 0 Q -100 -80 0 -20 T 230 -40 L 230 60 L -230 60 Z" fill="#7BBF7A" /><rect x={-60} y={-90} width={70} height={60} fill="#C66B7A" /><path d="M -70 -90 L -25 -130 L 20 -90 Z" fill="#8E6646" /><circle cx={140} cy={-170} r={30} fill="#F2B640" />
            </g>}
          </Svg>
          {!moses && card(t, S(a + 3) + 0.3, E(a + 3) + 0.2, "PRIVATE PILOT · U.S.", "NO AGE LIMIT", "There's no maximum age. None.", P.teal, 120, 160, 760)}
          {moses && card(t, S(a + 4) + 0.3, E(a + 4) + 0.2, "GRANDMA MOSES", "AGE 78", "when she started painting", P.orange, 120, 160, 640)}
        </Camera>
      );
    }
    const o = momGhost(t);
    return (
      <Camera t={t} t0={night ? S(a + 7) - 0.3 : t0} t1={night ? t1 : S(a + 3)} from={night ? 1.12 : 1.0} to={night ? 1.0 : 1.08} fx={1100}
        punch={night ? [S(a + 7) + 1.2] : [S(a + 5) + 0.2, S(a + 2) + 1.0]}>
        <Kitchen t={t} night={night} />
        <Svg>
          {!night && <Table />}
          <Ghost x={1180} y={640} look={G_PILOT} t={t} o={o} pose={t > S(a + 5) ? "wave" : "stand"} flip mood={t > S(a + 5) ? "happy" : "sad"} />
          <Person x={1120} y={1000} look={MOM} mood={t > S(a + 5) - 0.1 ? "shocked" : t > S(a + 1) ? "sad" : "neutral"} t={t} {...say(t, "MOM")} flip lookX={-1} pose={night ? "sit" : "stand"} />
          {!night && <Person x={1560} y={1000} look={DAD} mood={t > S(a + 2) ? "happy" : "neutral"} t={t} {...say(t, "DAD")} flip lookX={-1} pose={t > S(a + 2) && t < E(a + 2) ? "shrug" : "stand"} />}
          <Person x={520} y={1000} look={YOU} mood={night ? (t > S(a + 8) ? "nervous" : "shocked") : t > S(a + 5) ? "happy" : "nervous"} t={t} {...say(t, "YOU")} lookX={1} />
          {night && t > S(a + 7) + 1.2 && t < S(a + 8) + 0.6 && <Label t={t} at={S(a + 7) + 1.3} x={1180} y={300} text="GONE" size={60} bg={P.red} color={P.white} />}
          {t > S(a + 6) - 0.15 && t < E(a + 6) + 0.2 && <Label t={t} at={S(a + 6)} x={1180} y={160} text="FLICKER" size={36} bg="#9FE3FF" />}
        </Svg>
        {night && <Chip t={t} at={S(a + 7) + 0.2} text={t > S(a + 8) ? "DAY 28 · 2 DAYS LEFT" : "DAY 28"} />}
      </Camera>
    );
  },

  choice: ({ t, t0, t1 }) => {
    const a = first("choice");
    const secs = Math.max(0, Math.ceil(interpolate(t, [S(a + 1), S(a + 2), S(a + 4), S(a + 6)], [60, 30, 10, 2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));
    const pressed = t > S(a + 6) + 0.6;
    const left: "idle" | "paid" | "gone" = pressed ? "gone" : "idle";
    const right: "idle" | "paid" | "gone" = pressed ? "paid" : "idle";
    const ghost = ease(t, S(a + 5) + (E(a + 5) - S(a + 5)) * 0.55, E(a + 5));
    return (
      <Camera t={t} t0={t0} t1={t1} from={1.0} to={1.06} fx={960} fy={560} punch={[S(a + 2) + 0.2, S(a + 6) + 0.6]} shake={[S(a + 2)]}>
        <Room t={t} win={<Ghost x={1600} y={560} look={G_YOU} t={t} o={0.5 * ghost} s={0.6} mood="happy" />} />
        <Svg>
          <Screen x={620} y={430} t={t} title="SUMMER ANIMATION" sub="Your deposit" color={P.teal} state={left} glow={t > S(a + 3) && t < S(a + 4) ? 1 : 0} />
          <Screen x={1300} y={430} t={t} title="MOM'S FLIGHT SCHOOL" sub="Her deposit" color={P.gold} state={right} glow={pressed ? 1.4 : 0.3} />
          <Label t={t} at={S(a + 4) + 0.3} x={620} y={160} text="YOUR FUTURE" size={34} bg={P.teal} color={P.white} />
          <Label t={t} at={S(a + 4) + 1.2} x={1300} y={160} text="HERS" size={34} bg={P.gold} />
          {t > S(a + 2) - 0.15 && t < E(a + 2) + 0.5 && <Person x={1700} y={1000} look={THEO} mood="shocked" t={t} {...say(t, "THEO")} flip pose="cheer" sweat />}
          {t > S(a + 3) && t < S(a + 4) && <Bubble t={t} at={S(a + 3) + 0.3} until={E(a + 3)} cx={360} cy={760} r={170} fromX={620} fromY={620} id="six" bg="#2F5545">
            <Person x={170} y={380} look={{ ...YOU, tall: 0.8 }} mood="happy" t={t} s={0.5} pose="hold" holding={<rect x={-30} y={-40} width={60} height={80} fill={P.white} />} /><Label t={t} at={S(a + 3) + 0.6} x={170} y={70} text="AGE 6" size={30} />
          </Bubble>}
          {/* your hand */}
          <g transform={`translate(${pressed ? 1440 : interpolate(t, [S(a + 4), S(a + 5), S(a + 6)], [960, 640, 1000], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} ${pressed ? 560 : 620 + Math.sin(t * 5) * 6})`}>
            <rect x={-30} y={0} width={60} height={400} rx={30} fill={P.tealDark} /><circle r={42} fill={P.skin} /><rect x={-12} y={-90} width={24} height={80} rx={12} fill={P.skin} />
          </g>
          {pressed && [0, 1, 2].map((i) => { const p = ease(t, S(a + 6) + 0.6 + i * 0.15, S(a + 6) + 1.4 + i * 0.15); return <circle key={i} cx={1300} cy={480} r={40 + p * 300} fill="none" stroke={P.gold} strokeWidth={8} opacity={1 - p} />; })}
        </Svg>
        <div style={{ position: "absolute", top: 80, width: "100%", textAlign: "center", fontFamily: font, fontWeight: 900, fontSize: 90, color: secs <= 10 ? P.red : P.white, transform: `scale(${secs <= 10 ? 1 + 0.06 * Math.abs(Math.sin(t * 8)) : 1})` }}>
          {t < S(a + 1) ? "4:59 P.M." : `0:${String(secs).padStart(2, "0")}`}
        </div>
      </Camera>
    );
  },

  flight: ({ t, t0, t1 }) => {
    const a = first("flight");
    const cockpit = t >= S(a + 1) - 0.15 && t < S(a + 4) - 0.15;
    if (cockpit) return (
      <Camera t={t} t0={S(a + 1) - 0.3} t1={S(a + 4)} from={1.1} to={1.2} fx={980} fy={520} punch={[S(a + 3) + 0.2]}>
        <Sky t={t} house={false} />
        <Svg>
          <rect x={0} y={0} width={1920} height={1080} fill="none" stroke="#2B3448" strokeWidth={160} />
          <path d="M 0 820 L 1920 820 L 1920 1080 L 0 1080 Z" fill="#3A4560" /><rect x={300} y={850} width={1320} height={120} rx={20} fill="#2B3448" />
          {[0, 1, 2, 3, 4].map((i) => <g key={i} transform={`translate(${460 + i * 250} 910)`}><circle r={40} fill="#141A28" /><line x1={0} y1={0} x2={Math.cos(t * (1 + i) + i) * 30} y2={Math.sin(t * (1 + i) + i) * 30} stroke={P.white} strokeWidth={5} /></g>)}
          <Person x={960} y={1140} look={{ ...MOM, acc: ["headphones"] }} mood={t > S(a + 3) ? "happy" : t > S(a + 2) ? "smug" : "neutral"} t={t} {...say(t, "MOM")} s={1.3} />
          <Label t={t} at={S(a + 3) + 0.1} x={960} y={200} text="CESSNA 172. MINE." size={56} bg={P.gold} />
        </Svg>
        {t < S(a + 2) && <Chip t={t} at={S(a + 1) + 0.2} text="THAT MORNING" />}
      </Camera>
    );
    const merge = t >= S(a + 4) - 0.15;
    const px = merge ? 900 : interpolate(t, [t0, E(a)], [-200, 1100], { extrapolateRight: "clamp" });
    const gx = merge ? interpolate(t, [S(a + 4), S(a + 4) + 2], [400, 900], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : -1000;
    const gone = ease(t, S(a + 4) + 2.2, S(a + 4) + 3.2);
    return (
      <Camera t={t} t0={merge ? S(a + 4) - 0.3 : t0} t1={merge ? t1 : S(a + 1)} from={1.0} to={1.08} fx={900} fy={420}>
        <Sky t={t} house={!merge} />
        <Svg>
          {merge && <Ghost x={gx} y={520} look={G_PILOT} t={t} o={0.9 * (1 - gone)} s={0.7} pose="wave" />}
          <Cessna x={px} y={merge ? 420 : 380 + Math.sin(t) * 20} s={merge ? 1.4 : 0.9} t={t} pilot={<g transform="scale(0.24)"><Head look={{ ...MOM, acc: ["headphones"] }} mood="happy" t={t} /></g>} />
          {merge && gone > 0 && Array.from({ length: 12 }, (_, i) => { const r = 60 + gone * 300; const ang = i * Math.PI / 6; return <circle key={i} cx={980 + Math.cos(ang) * r} cy={400 + Math.sin(ang) * r} r={10 * (1 - gone) + 2} fill="#BFEFFF" opacity={1 - gone} />; })}
        </Svg>
        {!merge && <Chip t={t} at={S(a) + 0.2} text="3 WEEKS LATER" />}
      </Camera>
    );
  },

  dad: ({ t, t0, t1 }) => {
    const a = first("dad");
    const reveal = ease(t, S(a + 1) + 0.6, S(a + 1) + 2.0);
    const paid = t > S(a + 3) + (E(a + 3) - S(a + 3)) * 0.35;
    return (
      <Camera t={t} t0={t0} t1={t1} from={1.0} to={1.1} fx={1150} punch={[S(a + 3) + 0.4, S(a + 4) + (E(a + 4) - S(a + 4)) * 0.6]}>
        <Kitchen t={t} />
        <Svg>
          <Glow cx={1300} cy={680} r={420} color="#FFD98A" opacity={0.85 * reveal} id="dadglow" />
          <Person x={1300} y={1000} look={DAD} mood={t > S(a + 2) ? "happy" : "neutral"} t={t} {...say(t, "DAD")} flip lookX={-1} pose={paid ? "hold" : "stand"} holding={paid ? <Envelope x={0} y={-30} s={0.4} label="DEPOSIT PAID" open={1} /> : undefined} />
          <g opacity={reveal * (0.32 + 0.08 * Math.sin(t * 3))} filter="url(#ghost)" transform="translate(4 -3)"><Person x={1300} y={1000} look={DAD} mood="happy" t={t + 0.4} flip noLegs /></g>
          <Ghost x={1700} y={680} look={G_PILOT} t={t} o={0} />
          <Person x={1700} y={1000} look={{ ...MOM, acc: ["pilot"] }} mood={t > S(a + 4) ? "happy" : "neutral"} t={t} {...say(t, "MOM")} flip lookX={-1} />
          <Person x={560} y={1000} look={YOU} mood={paid ? "shocked" : t > S(a + 4) ? "happy" : "neutral"} t={t} lookX={1} pose={t > S(a + 4) + 1 ? "cheer" : "stand"} />
          <Bubble t={t} at={S(a + 1) + (E(a + 1) - S(a + 1)) * 0.3} until={E(a + 1)} cx={760} cy={300} r={160} fromX={600} fromY={560} id="mailr" bg="#2E4785">
            <Ghost x={180} y={300} look={MAILMAN} t={t} o={0.6} s={0.42} /><Person x={160} y={360} look={MAILMAN} mood="happy" t={t} s={0.42} />
          </Bubble>
          <Label t={t} at={S(a + 1) + 2.2} until={E(a + 1)} x={1300} y={200} text="LIVING IT" size={44} bg={P.gold} />
        </Svg>
      </Camera>
    );
  },

  theo: ({ t, t0, t1 }) => {
    const a = first("theo");
    const look = t > S(a + 1) + 0.4;
    return (
      <Camera t={t} t0={t0} t1={t1} from={1.0} to={1.1} fx={1250} punch={[S(a + 2) + 0.3, S(a + 4) + 0.2, S(a + 5) + 0.1]} shake={[S(a + 5) + 0.1]}>
        <Room t={t} />
        <Svg>
          <Ghost x={1380} y={680} look={G_THEO} t={t} o={0.95 * ease(t, S(a + 2) - 0.2, S(a + 2) + 0.6)} pose={Math.sin(t * 5) > 0 ? "cheer" : "wave"} spin={t > S(a + 3)} />
          <Person x={1300} y={1000} look={THEO} mood={t > S(a + 5) ? "happy" : "nervous"} t={t} {...say(t, "THEO")} flip lookX={-1} pose={t > S(a + 5) ? "cheer" : "stand"} />
          <Person x={600} y={1000} look={YOU} mood={t > S(a + 4) ? "deadpan" : look ? "shocked" : "neutral"} t={t} {...say(t, "YOU")} lookX={1} />
          <Label t={t} at={S(a + 2) + 0.6} x={1380} y={160} text="SEQUINS. DANCING." size={36} bg="#C9A0FF" />
          {t > S(a + 5) && Array.from({ length: 30 }, (_, i) => { const k = (t - S(a + 5)) * 0.8; return <rect key={i} x={((i * 137) % 1920)} y={-40 + k * (300 + (i % 7) * 60)} width={16} height={26} fill={[P.gold, P.teal, P.red, "#C9A0FF"][i % 4]} transform={`rotate(${t * 200 + i * 30} ${(i * 137) % 1920} ${-40 + k * (300 + (i % 7) * 60)})`} />; })}
        </Svg>
        <Chip t={t} at={S(a + 1) + 0.2} text="THEO · 18" />
      </Camera>
    );
  },

  coda: ({ t, t0, t1 }) => {
    const a = first("coda");
    const tower = t >= S(a + 1) - 0.15;
    return (
      <Camera t={t} t0={t0} t1={t1} from={1.0} to={1.08} punch={[S(a + 1) + 0.6]}>
        <Sky t={t} house={false} />
        <Svg>
          <Cessna x={tower ? 500 : 1100 - (t - t0) * 40} y={360} s={1.0} t={t} pilot={<g transform="scale(0.24)"><Head look={{ ...MOM, acc: ["headphones"] }} mood="happy" t={t} talk /></g>} />
          {!tower && [0, 1, 2].map((i) => { const p = ((t * 0.8 + i / 3) % 1); return <circle key={i} cx={1100 - (t - t0) * 40 + 70} cy={330} r={40 + p * 220} fill="none" stroke={P.white} strokeWidth={6} opacity={1 - p} />; })}
          {!tower && <Label t={t} at={S(a) + 1.5} x={1300} y={160} text="“THAT'S AN AIRBUS A320!”" size={36} />}
          <Chip t={t} at={S(a) + 0.2} text="EVERY SUNDAY" />
          {tower && <g transform={`translate(1450 860) scale(${pop(t, S(a + 1) - 0.1)})`}><rect x={-50} y={-420} width={100} height={420} fill="#C9D2DE" /><path d="M -130 -420 L 130 -420 L 100 -540 L -100 -540 Z" fill="#5E7A9A" /><rect x={-90} y={-520} width={180} height={70} fill="#8FC3E6" /></g>}
          {tower && <Label t={t} at={S(a + 1) + 0.4} x={1300} y={160} text="PLEASE STOP." size={56} bg={P.white} />}
        </Svg>
      </Camera>
    );
  },

  tease: ({ t, t0, t1 }) => {
    const a = first("tease");
    const g = ease(t, S(a) + (E(a) - S(a)) * 0.5, E(a));
    return (
      <Camera t={t} t0={t0} t1={t1} from={1.0} to={1.25} fx={1180} fy={420}>
        <Backdrop base="#18202F" light="#3A4766" cx={60} cy={35}>
          <Bokeh t={t} n={8} opacity={0.1} />
        </Backdrop>
        <Svg>
          <rect x={860} y={80} width={640} height={760} rx={320} fill="#8E6646" /><rect x={890} y={110} width={580} height={700} rx={290} fill="#2C3852" />
          <clipPath id="mirror"><rect x={890} y={110} width={580} height={700} rx={290} /></clipPath>
          <g clipPath="url(#mirror)">
            <Ghost x={1270} y={720} look={G_YOU} t={t} o={g} s={0.9} mood="happy" wink={t > S(a + 1) + 0.3 && t < S(a + 1) + 1.0} />
            <Person x={1180} y={1100} look={YOU} mood={t > S(a + 1) ? "shocked" : "neutral"} t={t} lookX={-1} />
            <rect x={890} y={110} width={580} height={700} fill="#FFFFFF" opacity={0.05} />
          </g>
          <Person x={520} y={1200} look={YOU} mood={t > S(a + 1) ? "shocked" : "neutral"} t={t} s={1.3} lookX={1} />
          <rect y={960} width={1920} height={120} fill="#141A28" />
        </Svg>
      </Camera>
    );
  },

  endcard: ({ t, t0, t1 }) => (
    <Camera t={t} t0={t0} t1={t1} from={1} to={1.05}>
      <Backdrop base="#11162A" light="#26305A">
        <Bokeh t={t} />
        <DotLine t={t} y={900} />
      </Backdrop>
      <Svg>
        <Ghost x={960} y={560} look={G_PILOT} t={t} o={0.7} s={0.6} pose="wave" />
      </Svg>
      <Title t={t} at={t0 + 0.3} words={"WOULD YOU WANT TO KNOW?".split(" ")} accent={["KNOW?"]} size={100} y={260} />
    </Camera>
  ),
};

// ---------- overlays ----------
const HUD: React.FC<{ t: number; shot: string }> = ({ t, shot }) => {
  if (!["rules", "bus", "class", "lunch", "dinner", "goal", "detective", "cost", "sceptic"].includes(shot)) return null;
  const det = first("detective");
  const showMoney = t >= S(det) && shot !== "detective" || (shot === "detective" && t >= S(det) + 1);
  const m = moneyAt(t);
  const bump = Math.max(0, 1 - Math.abs(t - S(det + 11) - 1) * 2);
  return (
    <>
      <Counter label="DAY" value={`${dayAt(t)} / 30`} x={1640} y={40} color="#9FE3FF" />
      {showMoney && <Counter label="MONEY" value={`$${m.toLocaleString("en-US")}`} x={1580} y={170} color="#6FD38F" bump={bump} />}
    </>
  );
};

const SPEAKER_COLOR: Record<string, string> = { NARRATOR: "#FFFFFF", YOU: "#7FE3DD", THEO: "#FFB37A", MOM: "#FFB3C1", DAD: "#B3D4FF" };
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

const XF = 0.4; // crossfade between shots, seconds
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
      <AbsoluteFill style={{ opacity: Prev ? ease(t, t0, t0 + XF) : 1 }}>
        <Shot t={t} t0={t0} t1={t1} />
      </AbsoluteFill>
      <HUD t={t} shot={shot.name} />
      {captions && <Captions t={t} />}
      {!("estimated" in timeline) && <Audio src={staticFile("dreams/mix.wav")} />}
    </AbsoluteFill>
  );
};
