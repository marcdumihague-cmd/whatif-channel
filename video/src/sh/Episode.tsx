// "What If You Could See Who Secretly Hates You?" Shots are keyed by each line's `scene` and timed
// from public/secretly/timeline.json; mouths follow public/secretly/lips.json.
// Motif: a glowing "hate %" tag over every head (green 0 -> gold -> red 100). Your own head never has one.
// Clarity rule (youtube/motion.md): every place has its defining objects, new things get a label.
import React from "react";
import { AbsoluteFill, Audio, interpolate, staticFile } from "remotion";
import timeline from "../../public/secretly/timeline.json";
import lips from "../../public/secretly/lips.json";
import { P, useT, ease, pop, Camera, Bokeh, Glow, Backdrop, Person, YOU, THEO, extra, Chip, Counter, StatCard, Title, DotLine, Look, Lip, Mood, Pose } from "../ll/kit";
import { Label } from "../dr/Episode";
import { Bedroom, Kitchen, Phone } from "../wt/Episode";
import { Desk, Classroom, SchoolHall } from "../ex/Episode";

type Line = (typeof timeline.lines)[number] & { caption?: string };
const L: Line[] = timeline.lines as Line[];
export const DURATION = timeline.duration;
const S = (i: number) => L[i].start;
const E = (i: number) => L[i].end;
const D = (i: number) => E(i) - S(i);
const font = "'Inter Display', Inter, sans-serif";
const first = (scene: string) => L.findIndex((l) => l.scene === scene);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
// index (0..n-1) of the latest line of the scene that has started
const beatOf = (t: number, a: number, n: number) => { let b = 0; for (let k = 0; k < n; k++) if (t >= S(a + k) - 0.15) b = k; return b; };

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
const MAYA: Look = { skin: P.skin3, hair: "#1E1A18", top: "#8E7BB8", topDark: "#6F5E9A", hairStyle: "long" };
const TEACHER: Look = { skin: P.skin, hair: "#8A8A8A", top: "#8A7A5A", topDark: "#6F6248", hairStyle: "bun", glasses: true, tall: 1.04 };
const SELLER: Look = { skin: P.skin2, hair: "#9A9A9A", top: "#4E6B4E", topDark: "#3C543C", hairStyle: "short", mustache: "#7A7A7A", tall: 1.06 };
const HI_KID: Look = { ...extra(1), top: "#E9894E", topDark: "#C96E37" };
const QUIET: Look = { ...extra(3), glasses: true };
const COPIER: Look = extra(4);
const JUDGES: Look[] = [
  { skin: P.skin, hair: "#3A2A20", top: "#2C3852", topDark: "#1F2840", hairStyle: "bun", glasses: true },
  { skin: P.skin3, hair: "#1E1A18", top: "#5E5E6E", topDark: "#48485A", hairStyle: "bald", tall: 1.05, acc: ["bowtie"] },
  { skin: P.skin2, hair: "#7A4A2A", top: "#9A3A4A", topDark: "#7A2E3A", hairStyle: "long" },
];

// ---------- the motif: the hate tag ----------
const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mix = (a: string, b: string, k: number) => `rgb(${hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * k)).join(",")})`;
const heat = (v: number) => (v < 50 ? mix("#4DE08A", "#FFC844", v / 50) : mix("#FFC844", "#FF4B4B", (v - 50) / 50));
// a value that eases from one number to the next at given times: [[time, value], ...]
const live = (t: number, keys: [number, number][]) => {
  let v = keys[0][1];
  for (let i = 1; i < keys.length; i++) v = interpolate(t, [keys[i][0], keys[i][0] + 0.5], [v, keys[i][1]], clamp);
  return v;
};
export const tagY = (y: number, s = 1, tall = 1) => y - 545 * s * tall;
export const Tag: React.FC<{ t: number; x: number; y: number; v: number; at?: number; s?: number; hidden?: boolean; id: string }> = ({ t, x, y, v, at: a = -9, s = 1, hidden = false, id }) => {
  const p = pop(t, a);
  if (p <= 0.001) return null;
  const c = hidden ? "#AEB6CC" : heat(v);
  const bob = Math.sin(t * 2 + x * 0.01) * 5;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s * p})`}>
      <Glow cx={0} cy={0} r={130} color={c} opacity={hidden ? 0.15 : 0.35} id={`tg${id}`} />
      <rect x={-100} y={-58} width={200} height={108} rx={26} fill="rgba(14,19,32,0.92)" stroke={c} strokeWidth={6} />
      <text y={8} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={56} fill={c}>{hidden ? "??" : `${Math.round(v)}%`}</text>
      <rect x={-74} y={24} width={148} height={10} rx={5} fill="#3A4256" /><rect x={-74} y={24} width={hidden ? 0 : 148 * v / 100} height={10} rx={5} fill={c} />
      <path d="M -14 50 L 0 68 L 14 50 Z" fill={c} />
      {hidden && <g opacity={0.6}>{[-60, -20, 20, 60].map((dx) => <circle key={dx} cx={dx} cy={-10 + Math.sin(t * 3 + dx) * 6} r={22} fill="#AEB6CC" opacity={0.25} />)}</g>}
    </g>
  );
};

// ---------- props ----------
const Sneaker: React.FC<{ x: number; y: number; s?: number; c?: string; flip?: boolean }> = ({ x, y, s = 1, c = "#E25C5C", flip = false }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
    <path d="M -90 0 L 100 0 Q 112 -12 102 -24 L -92 -24 Z" fill="#F4F6FA" /><rect x={-92} y={-6} width={194} height={6} fill="#C9D2DE" />
    <path d="M -92 -24 L -88 -92 Q -60 -104 -30 -90 L 12 -62 Q 62 -56 98 -40 Q 106 -30 102 -24 Z" fill={c} />
    <path d="M -64 -44 Q 0 -26 64 -46" stroke={P.white} strokeWidth={9} fill="none" strokeLinecap="round" />
    {[0, 1, 2].map((i) => <line key={i} x1={-20 + i * 14} y1={-84 + i * 8} x2={-4 + i * 14} y2={-70 + i * 8} stroke={P.white} strokeWidth={5} strokeLinecap="round" />)}
  </g>
);
const ShoeBox: React.FC<{ x: number; y: number; c?: string; s?: number }> = ({ x, y, c = "#E9894E", s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}><rect x={-80} y={-60} width={160} height={60} rx={4} fill={c} /><rect x={-86} y={-72} width={172} height={18} rx={4} fill={mix(c, "#000000", 0.2)} /><rect x={-30} y={-40} width={60} height={20} rx={3} fill={P.white} opacity={0.8} /></g>
);
const Cash: React.FC<{ x: number; y: number; n: number; s?: number }> = ({ x, y, n, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>{Array.from({ length: n }, (_, i) => <g key={i} transform={`translate(${(i % 3) * 8 - 8} ${-i * 12})`}><rect x={-70} y={-12} width={140} height={14} rx={3} fill="#5FA862" stroke="#3F7A42" strokeWidth={2} /><rect x={-14} y={-12} width={28} height={14} fill="#E6E2C8" /></g>)}</g>
);
const Trophy: React.FC<{ x: number; y: number; s?: number; label?: boolean }> = ({ x, y, s = 1, label = true }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-50} y={-30} width={100} height={30} rx={4} fill="#6B4E36" /><rect x={-12} y={-80} width={24} height={50} fill="#D9A43A" />
    <path d="M -60 -180 L 60 -180 Q 60 -90 0 -80 Q -60 -90 -60 -180 Z" fill="#F2B640" /><path d="M -60 -165 Q -95 -150 -60 -115 M 60 -165 Q 95 -150 60 -115" stroke="#F2B640" strokeWidth={10} fill="none" />
    <path d="M -30 -165 Q -26 -110 0 -96" stroke="#FFE08A" strokeWidth={8} fill="none" opacity={0.7} />
    {label && <text y={-8} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={14} fill={P.cream}>SCIENCE FAIR 1ST</text>}
  </g>
);
// the speech/offer bubble used for prices
const Offer: React.FC<{ t: number; at: number; x: number; y: number; text: string; color?: string; until?: number }> = ({ t, at: a, x, y, text, color = P.white, until = 1e9 }) => (
  <Label t={t} at={a} until={until} x={x} y={y} text={text} size={52} bg={color} />
);

// ---------- sets ----------
const Garage: React.FC<{ t: number }> = ({ t }) => (
  <Backdrop base="#5A606E" light="#8A92A4" cx={50} cy={20}>
    <rect y={0} width={1920} height={120} fill="#4A4F5C" />{Array.from({ length: 6 }, (_, i) => <g key={i}><rect x={120 + i * 330} y={100} width={200} height={16} rx={6} fill="#F4F0D8" opacity={0.85 + 0.1 * Math.sin(t * 7 + i)} /><Glow cx={220 + i * 330} cy={140} r={150} color="#F4F0D8" opacity={0.25} id={`gl${i}`} /></g>)}
    {[220, 1000, 1700].map((x) => <g key={x}><rect x={x - 50} y={120} width={100} height={680} fill="#7A8090" /><rect x={x - 50} y={640} width={100} height={60} fill="#F2B640" />{[0, 1, 2].map((k) => <rect key={k} x={x - 50 + k * 40} y={640} width={18} height={60} fill="#1F2433" transform={`skewX(-20)`} />)}</g>)}
    <rect x={430} y={200} width={160} height={110} rx={10} fill="#3F5F8A" /><text x={510} y={278} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={70} fill={P.white}>P2</text>
    <rect x={1140} y={170} width={460} height={110} rx={14} fill="#1F2433" /><text x={1370} y={228} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={42} fill="#FFC844">SNEAKER MEETUP</text><text x={1370} y={264} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={24} fill={P.cream}>SATURDAY · BUY · SELL · TRADE</text>
    <rect y={800} width={1920} height={280} fill="#6E7482" />{Array.from({ length: 7 }, (_, i) => <rect key={i} x={60 + i * 290} y={840} width={12} height={240} fill={P.white} opacity={0.6} transform={`skewX(${-20 + i * 6})`} />)}
  </Backdrop>
);
// a folding table of sneakers with a price card
const Stall: React.FC<{ x: number; y?: number; colors: string[]; price?: string; s?: number }> = ({ x, y = 860, colors, price, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-230} y={-20} width={460} height={24} rx={6} fill="#E4E9F0" /><path d="M -200 4 L -230 140 M 200 4 L 230 140" stroke="#8A93A5" strokeWidth={10} />
    {colors.map((c, i) => <Sneaker key={i} x={-150 + i * 150} y={-20} s={0.6} c={c} flip={i % 2 === 1} />)}
    <ShoeBox x={-120} y={-88} s={0.6} c="#E9894E" /><ShoeBox x={120} y={-88} s={0.6} c="#3F5F8A" />
    {price && <g transform="translate(170 -150)"><rect x={-60} y={-34} width={120} height={56} rx={10} fill={P.white} stroke="#E25C5C" strokeWidth={4} /><text y={6} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={34} fill="#E25C5C">{price}</text></g>}
  </g>
);
const Stage: React.FC<{ t: number; slide?: number }> = ({ t, slide = 0 }) => (
  <Backdrop base="#3A1E2A" light="#7A3A4A" cx={50} cy={30}>
    {Array.from({ length: 14 }, (_, i) => <rect key={i} x={i * 140} y={0} width={140} height={760} fill={i % 2 ? "#7A2333" : "#8A2A3C"} />)}
    <rect x={0} y={0} width={1920} height={70} fill="#5A1A26" />
    <rect x={360} y={90} width={1200} height={110} rx={16} fill="#1F2433" /><text x={960} y={140} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={42} fill={P.cream}>CITY TEEN BUSINESS CONTEST</text>
    <text x={960} y={186} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={36} fill="#FFC844">1ST PRIZE: $50,000</text>
    {/* the slides screen */}
    <rect x={1180} y={250} width={560} height={340} rx={12} fill="#141A28" /><rect x={1196} y={266} width={528} height={308} rx={8} fill={P.cream} />
    <Slide n={slide} t={t} x={1460} y={420} />
    <rect y={760} width={1920} height={320} fill="#5E3A2A" /><rect y={760} width={1920} height={20} fill="#7A4E3A" />
    {[300, 960, 1620].map((x) => <g key={x}><Glow cx={x} cy={700} r={300} color="#FFE6B0" opacity={0.18} id={`sp${x}`} /></g>)}
  </Backdrop>
);
// slide 0 title, 1 joke, 2 profit chart, 3 "40% under market"
const Slide: React.FC<{ n: number; t: number; x: number; y: number }> = ({ n, t, x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    {n === 0 && <g><text y={-40} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={54} fill={P.ink}>KICKS FOR LESS</text><Sneaker x={0} y={90} s={0.9} c="#E25C5C" /></g>}
    {n === 1 && <g><Sneaker x={0} y={60} s={1} c="#3F5F8A" /><rect x={-40} y={-50} width={90} height={26} rx={10} fill={P.ink} /><text y={120} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={34} fill={P.ink}>TOO COOL FOR FULL PRICE</text></g>}
    {n === 2 && <g><text y={-100} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={34} fill={P.ink}>PROFIT, WEEK 1</text>{[40, 70, 110, 160, 220].map((h, i) => <rect key={i} x={-190 + i * 80} y={110 - h} width={56} height={h} fill="#4DBE8A" />)}<text y={140} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={30} fill="#2E8B57">$8,400</text></g>}
    {n === 3 && <g><text y={-30} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={110} fill="#E25C5C">-40%</text><text y={40} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={34} fill={P.ink}>UNDER MARKET</text><text y={90} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={28} fill="#7C8296">EVERY PAIR WE BUY</text></g>}
  </g>
);
const Chairs: React.FC<{ y: number; n: number; x0: number; gap: number }> = ({ y, n, x0, gap }) => (
  <g>{Array.from({ length: n }, (_, i) => <g key={i}><rect x={x0 + i * gap - 60} y={y - 210} width={120} height={20} rx={6} fill="#2B2B36" /><rect x={x0 + i * gap - 60} y={y - 120} width={120} height={22} rx={6} fill="#3A3F4D" /><rect x={x0 + i * gap - 50} y={y - 98} width={12} height={98} fill="#2B2B36" /><rect x={x0 + i * gap + 38} y={y - 98} width={12} height={98} fill="#2B2B36" /></g>)}</g>
);
const JudgesTable: React.FC<{ y?: number }> = ({ y = 1000 }) => (
  <g><rect x={260} y={y - 260} width={1400} height={30} rx={8} fill="#E4E9F0" /><rect x={280} y={y - 230} width={1360} height={230} fill="#1F2433" />
    <text x={960} y={y - 120} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={44} fill="#FFC844">JUDGES</text>
    {[560, 960, 1360].map((x) => <g key={x}><rect x={x + 60} y={y - 320} width={26} height={60} rx={6} fill="#9FE3FF" opacity={0.8} /><rect x={x - 110} y={y - 300} width={120} height={40} rx={4} fill={P.cream} /></g>)}</g>
);
const Exterior: React.FC<{ t: number }> = ({ t }) => (
  <Backdrop base="#3A3F6A" light="#E9A07A" cx={50} cy={10}>
    <rect x={160} y={180} width={1600} height={620} fill="#C9C2B4" />{Array.from({ length: 10 }, (_, i) => <rect key={i} x={200 + i * 158} y={320} width={110} height={160} rx={6} fill={i % 3 ? "#F4D58D" : "#BFC8DA"} opacity={0.9} />)}
    <rect x={460} y={200} width={1000} height={90} rx={12} fill="#1F2433" /><text x={960} y={262} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={48} fill={P.cream}>CITY CONVENTION CENTER</text>
    {/* glass doors */}
    <rect x={720} y={540} width={480} height={260} fill="#BFE3F6" opacity={0.85} />{[840, 960, 1080].map((x) => <rect key={x} x={x - 4} y={540} width={8} height={260} fill="#5A5F6C" />)}<rect x={712} y={530} width={496} height={14} fill="#5A5F6C" />
    <rect x={180} y={540} width={360} height={160} rx={10} fill="#C0413A" /><text x={360} y={610} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={34} fill={P.white}>TEEN BUSINESS</text><text x={360} y={656} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={34} fill={P.white}>CONTEST TODAY</text>
    <rect y={800} width={1920} height={280} fill="#8A8F9C" /><rect y={800} width={1920} height={20} fill="#AEB6CC" />
    {[60, 1860].map((x) => <g key={x}><rect x={x - 8} y={360} width={16} height={440} fill="#2B2B36" /><circle cx={x} cy={350} r={26} fill="#FFE6B0" /><Glow cx={x} cy={350} r={140} color="#FFE6B0" opacity={0.5} id={`lamp${x}`} /></g>)}
    <Bokeh t={t} n={10} opacity={0.12} color="#FFE6B0" />
  </Backdrop>
);

// ---------- shots ----------
const shots: Record<string, React.FC<ShotProps>> = {
  cold_open: ({ t, t0, t1 }) => {
    const a = first("cold_open");
    const b = beatOf(t, a, 8);
    if (b <= 2) {
      const fx = b === 0 ? 960 : b === 1 ? 1300 : 1700;
      const crowd: [number, Look, number, Pose, Mood][] = [[260, extra(0), 38, "stand", "neutral"], [1300, HI_KID, 91, "wave", "happy"], [1720, QUIET, 0, "stand", "nervous"], [980, extra(2), 55, "phone", "deadpan"]];
      return (
        <Camera t={t} t0={t0} t1={S(a + 3)} from={1.0} to={1.08} fx={fx} fy={560} punch={[S(a + 1) + 0.2, S(a + 2) + 0.2]}>
          <SchoolHall t={t} />
          <Svg>
            {crowd.map(([x, look, v, pose, mood], i) => <g key={i}>
              <Person x={x} y={1000} look={look} mood={mood} t={t} pose={pose} s={0.92} flip={x > 1500} lookX={x > 960 ? -1 : 1} />
              <Tag t={t} x={x} y={tagY(1000, 0.92)} v={v} at={S(a) + 0.8 + i * 0.35} s={x === 1300 && b === 1 ? 1.15 : 0.95} id={`co${i}`} />
            </g>)}
            {/* you, from the side: no tag over your own head */}
            <Person x={620} y={1000} look={YOU} mood="shocked" t={t} s={0.98} lookX={b === 0 ? 0 : 1} />
            <Label t={t} at={S(a) + D(a) * 0.6} until={S(a + 1)} x={960} y={250} text="HOW MUCH THEY SECRETLY HATE YOU" size={44} bg="#FFC844" />
            {b === 1 && <Label t={t} at={S(a + 1) + 0.3} x={1300} y={300} text="SAYS HI EVERY DAY" size={30} />}
            {b === 2 && <Label t={t} at={S(a + 2) + 0.3} x={1640} y={300} text="NEVER TALKED TO HIM" size={30} />}
          </Svg>
          <Chip t={t} at={t0 + 0.2} text="MONDAY · 7:52 A.M. · SCHOOL" />
        </Camera>
      );
    }
    const v = live(t, [[0, 87], [S(a + 7), 88]]);
    return (
      <Camera t={t} t0={S(a + 3) - 0.3} t1={t1} from={1.0} to={1.1} fx={1150} fy={520} punch={[S(a + 4) + 0.3, S(a + 7)]}>
        <SchoolHall t={t} />
        <Svg>
          <Person x={720} y={1000} look={YOU} mood={b >= 5 ? "nervous" : "shocked"} t={t} {...say(t, "YOU")} lookX={1} sweat={b >= 7} />
          <Person x={1180} y={1000} look={THEO} mood={b === 6 ? "smug" : "happy"} t={t} {...say(t, "THEO")} flip lookX={-1} pose={b === 3 ? "wave" : "stand"} />
          <Tag t={t} x={1180} y={tagY(1000, 1, 1.06)} v={v} at={S(a + 4) + 0.2} s={b === 7 ? 1.25 : 1.05} id="theo" />
          {b >= 4 && <Label t={t} at={S(a + 4) + 0.6} x={1500} y={360} text="BEST FRIEND SINCE KINDERGARTEN" size={26} />}
        </Svg>
      </Camera>
    );
  },

  promise: ({ t, t0, t1 }) => {
    const a = first("promise");
    const items = [{ k: 0.05, x: 360, txt: "MORE MONEY THAN YOUR PARENTS", c: "#4DE08A" }, { k: 0.4, x: 960, txt: "THEO'S SECRET", c: "#FF4B4B" }, { k: 0.66, x: 1560, txt: "THE ONE NUMBER", c: "#AEB6CC" }];
    return (
      <Camera t={t} t0={t0} t1={t1}>
        <Backdrop base={P.night} light={P.nightHi}><Bokeh t={t} /></Backdrop>
        <Svg>
          {items.map((it, i) => {
            const p = pop(t, S(a) + D(a) * it.k);
            return p > 0 ? <g key={i} transform={`translate(${it.x} 480) scale(${p})`}>
              <Glow cx={0} cy={0} r={260} color={it.c} opacity={0.3} id={`pr${i}`} /><circle r={190} fill="#F7E3B8" /><circle r={176} fill="#2C3852" />
              {i === 0 && <Cash x={0} y={90} n={9} s={1.2} />}
              {i === 1 && <g><circle cy={-10} r={60} fill="#3B2B20" /><rect x={-70} y={50} width={140} height={90} rx={40} fill={P.orange} /><text y={10} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={80} fill={P.white}>?</text></g>}
              {i === 2 && <g><circle cy={40} r={60} fill="#1E1A18" /><rect x={-70} y={95} width={140} height={60} rx={30} fill="#8E7BB8" /><g transform="translate(0 -70) scale(0.7)"><Tag t={t} x={0} y={0} v={0} hidden id="pr" /></g></g>}
              <text y={250} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={34} fill={it.c}>{it.txt}</text>
            </g> : null;
          })}
          <Label t={t} at={S(a) + 0.1} x={960} y={130} text="THE NEXT 7 DAYS" size={44} bg="#FFC844" />
        </Svg>
      </Camera>
    );
  },

  rules: ({ t, t0, t1 }) => {
    const a = first("rules");
    const b = beatOf(t, a, 6);
    if (b === 0) {
      const v = 100 * (0.5 + 0.5 * Math.sin((t - S(a)) * 1.3 - 1.57));
      return (
        <Camera t={t} t0={t0} t1={S(a + 1)} from={1.0} to={1.05}>
          <Backdrop base="#1E2638" light="#3A4766"><Bokeh t={t} n={12} opacity={0.15} /></Backdrop>
          <Svg>
            {/* the scale, 0 to 100 */}
            <defs><linearGradient id="sc"><stop offset="0%" stopColor="#4DE08A" /><stop offset="50%" stopColor="#FFC844" /><stop offset="100%" stopColor="#FF4B4B" /></linearGradient></defs>
            <rect x={260} y={560} width={1400} height={60} rx={30} fill="url(#sc)" />
            <text x={260} y={690} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={60} fill="#4DE08A">0</text><text x={1660} y={690} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={60} fill="#FF4B4B">100</text>
            <Label t={t} at={S(a) + D(a) * 0.12} x={420} y={780} text="LIKES YOU" size={40} bg="#4DE08A" />
            <g opacity={ease(t, S(a) + D(a) * 0.3, S(a) + D(a) * 0.4)}>
              {/* the winter pool */}
              <rect x={1440} y={330} width={360} height={130} rx={20} fill="#9FE3FF" /><rect x={1440} y={330} width={360} height={130} rx={20} fill="none" stroke={P.white} strokeWidth={10} />
              {[0, 1, 2].map((i) => <path key={i} d={`M ${1470 + i * 110} 370 l 40 30 l -20 30`} stroke={P.white} strokeWidth={5} fill="none" opacity={0.8} />)}
              {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={1440 + (i * 67) % 360} cy={260 + ((t * 60 + i * 41) % 200)} r={6} fill={P.white} />)}
              <Label t={t} at={S(a) + D(a) * 0.35} x={1620} y={250} text="POOL IN DECEMBER" size={34} bg="#FF4B4B" color={P.white} />
            </g>
            <g transform={`translate(${260 + 14 * v} 470)`}><Tag t={t} x={0} y={0} v={v} id="scale" s={0.8} /></g>
            <Label t={t} at={S(a) + D(a) * 0.75} x={960} y={840} text="UPDATES LIVE" size={44} bg="#FFC844" />
          </Svg>
        </Camera>
      );
    }
    if (b === 1) return (
      <Camera t={t} t0={S(a + 1) - 0.3} t1={S(a + 2)} from={1.0} to={1.06}>
        <Backdrop base="#C9D6E6" light="#F2F6FA" cx={50} cy={30}><rect y={860} width={1920} height={220} fill="#A9B5C6" /></Backdrop>
        <Svg>
          {[["MIRROR", 380], ["CAMERA", 960], ["FACETIME", 1540]].map(([w, x], i) => {
            const at = S(a + 1) + D(a + 1) * (0.25 + i * 0.15);
            return <g key={i} transform={`translate(${x} 470)`} opacity={ease(t, at - 0.3, at)}>
              {i === 0 && <g><ellipse rx={150} ry={210} fill="#8E6646" /><ellipse rx={130} ry={190} fill="#BFE3F6" /><circle cy={-30} r={70} fill={P.skin} opacity={0.8} /><rect x={-80} y={50} width={160} height={110} rx={50} fill={P.teal} opacity={0.8} /></g>}
              {i === 1 && <g transform="scale(0.55)"><Phone x={0} y={0} t={t}><rect x={-154} y={-300} width={308} height={600} fill="#BFE3F6" /><circle cy={-40} r={90} fill={P.skin} /><rect x={-110} y={60} width={220} height={240} rx={80} fill={P.teal} /></Phone></g>}
              {i === 2 && <g><rect x={-220} y={-150} width={440} height={280} rx={16} fill="#2B2B36" /><rect x={-200} y={-132} width={400} height={240} rx={8} fill="#BFE3F6" /><circle cy={-30} r={60} fill={P.skin} /><rect x={-80} y={36} width={160} height={72} rx={30} fill={P.teal} /><rect x={-260} y={130} width={520} height={24} rx={8} fill="#5A5F6C" /></g>}
              {/* the empty spot where the tag should be */}
              <g transform="translate(0 -200)"><rect x={-90} y={-46} width={180} height={92} rx={24} fill="none" stroke="#FF4B4B" strokeWidth={6} strokeDasharray="14 10" /><path d="M -30 -30 L 30 30 M 30 -30 L -30 30" stroke="#FF4B4B" strokeWidth={12} strokeLinecap="round" /></g>
              <text y={290} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={44} fill={P.ink}>{w}</text>
            </g>;
          })}
          <Label t={t} at={S(a + 1) + 0.2} x={960} y={110} text="NO NUMBER FOR YOU" size={44} bg="#FF4B4B" color={P.white} />
        </Svg>
      </Camera>
    );
    if (b <= 4) {
      const v = live(t, [[0, 12], [S(a + 4), 13]]);
      return (
        <Camera t={t} t0={S(a + 2) - 0.3} t1={S(a + 5)} from={1.0} to={1.1} fx={1150} fy={520} punch={[S(a + 4)]}>
          <Kitchen t={t} />
          <Svg>
            <Person x={760} y={1000} look={YOU} mood={b === 4 ? "nervous" : "deadpan"} t={t} lookX={1} holding={<g><rect x={-26} y={-40} width={52} height={50} rx={8} fill={P.white} /><rect x={-26} y={-30} width={52} height={14} fill="#F4A6C8" /></g>} pose="hold" />
            <Person x={1240} y={1000} look={MOM} mood={b >= 3 ? "smug" : "neutral"} t={t} {...say(t, "MOM")} flip lookX={-1} pose={b >= 3 ? "point" : "stand"} />
            <Tag t={t} x={1240} y={tagY(1000)} v={v} at={S(a + 2) + 0.6} s={b === 4 ? 1.25 : 1.05} id="mom" />
            {b >= 3 && <Label t={t} at={S(a + 3) + 0.3} x={760} y={320} text="HER YOGURT" size={30} bg="#F4A6C8" />}
          </Svg>
          <Chip t={t} at={S(a + 2)} text="BREAKFAST" />
        </Camera>
      );
    }
    // the friendship study: two-way vs one-way arrows
    return (
      <Camera t={t} t0={S(a + 5) - 0.3} t1={t1} from={1.0} to={1.05}>
        <Backdrop base="#1E2638" light="#3A4766"><Bokeh t={t} n={12} opacity={0.15} /></Backdrop>
        <Svg>
          {[0, 1].map((i) => {
            const y = 400 + i * 300, mutual = i === 0;
            return <g key={i} opacity={ease(t, S(a + 5) + D(a + 5) * (0.2 + i * 0.4), S(a + 5) + D(a + 5) * (0.25 + i * 0.4))}>
              <g transform={`translate(160 ${y + 200}) scale(0.5)`}><Person x={0} y={0} look={extra(i)} mood="happy" t={t} lookX={1} /></g>
              <g transform={`translate(640 ${y + 200}) scale(0.5)`}><Person x={0} y={0} look={extra(i + 2)} mood={mutual ? "happy" : "deadpan"} t={t} flip lookX={-1} /></g>
              <line x1={260} y1={y - 20} x2={540} y2={y - 20} stroke={mutual ? "#4DE08A" : "#FFC844"} strokeWidth={12} />
              <path d={`M 540 ${y - 40} L 575 ${y - 20} L 540 ${y} Z`} fill={mutual ? "#4DE08A" : "#FFC844"} />
              {mutual && <path d={`M 260 ${y - 40} L 225 ${y - 20} L 260 ${y} Z`} fill="#4DE08A" />}
              <text x={400} y={y - 50} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={30} fill={P.white}>{mutual ? "FRIENDS BOTH WAYS" : "ONLY ONE WAY"}</text>
            </g>;
          })}
        </Svg>
        <StatCard t={t} at={S(a + 5) + 0.3} x={900} y={260} w={860} title="MIT + TEL AVIV UNIVERSITY · 2016" big="95%" sub="thought their friends felt the same. About half did." color="#FF4B4B" />
      </Camera>
    );
  },

  school: ({ t, t0, t1 }) => {
    const a = first("school");
    const b = beatOf(t, a, 5);
    if (b <= 2) {
      const fx = b === 0 ? 960 : b === 1 ? 1500 : 500;
      return (
        <Camera t={t} t0={t0} t1={S(a + 3)} from={1.0} to={1.08} fx={fx} fy={560} punch={[S(a + 1) + 0.2, S(a + 2) + 0.2]}>
          <Classroom t={t} math="QUIZ: CHAPTER 7" />
          <Svg>
            <Person x={1500} y={1000} look={TEACHER} mood="deadpan" t={t} flip lookX={-1} pose="hold" holding={<g>{[0, 1, 2, 3, 4].map((i) => <rect key={i} x={-50} y={-10 - i * 12} width={100} height={10} fill={P.white} stroke="#AEB6CC" strokeWidth={2} />)}</g>} />
            <Tag t={t} x={1500} y={tagY(1000, 1, 1.04)} v={2} at={S(a) + 0.6} id="teach" />
            <Person x={500} y={1000} look={COPIER} mood="smug" t={t} pose="sit" lookX={1} /><Desk x={500} />
            <Tag t={t} x={500} y={tagY(1000)} v={74} at={S(a) + 0.9} id="copy" />
            <Person x={900} y={1000} look={YOU} mood={b === 2 ? "deadpan" : "smug"} t={t} pose="sit" lookX={b === 2 ? -1 : 1} /><Desk x={900} />
            {b === 1 && <Label t={t} at={S(a + 1) + D(a + 1) * 0.6} x={1500} y={330} text="HATES GRADING" size={32} bg="#FFC844" />}
            {b === 1 && <Label t={t} at={S(a + 1) + 0.3} x={1150} y={560} text="YOUR GRADE: C-" size={30} />}
            {b === 2 && <g><path d={`M 860 760 L ${interpolate(t, [S(a + 2), S(a + 2) + 1], [860, 600], clamp)} 760`} stroke={P.white} strokeWidth={6} strokeDasharray="10 8" /><Label t={t} at={S(a + 2) + 0.3} x={500} y={330} text="COPIES YOUR HOMEWORK" size={30} /></g>}
          </Svg>
          {b === 0 && <Chip t={t} at={S(a) + 0.2} text="2ND PERIOD · MATH" />}
        </Camera>
      );
    }
    if (b === 3) {
      const flip = Math.cos((t - S(a + 3)) * 9);
      return (
        <Camera t={t} t0={S(a + 3) - 0.3} t1={S(a + 4)} from={1.0} to={1.05}>
          <Backdrop base="#1E2638" light="#3A4766"><Bokeh t={t} n={12} opacity={0.15} /></Backdrop>
          <Svg>
            <g transform={`translate(420 520) scale(${flip} 1)`}><circle r={150} fill={flip > 0 ? "#F2B640" : "#D9A43A"} /><circle r={120} fill="none" stroke="#B5862E" strokeWidth={8} /><text y={36} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={100} fill="#B5862E">{flip > 0 ? "T" : "L"}</text></g>
            <text x={420} y={760} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={40} fill={P.white}>TRUTH OR LIE?</text>
            <g opacity={ease(t, S(a + 3) + D(a + 3) * 0.75, S(a + 3) + D(a + 3) * 0.8)}><Label t={t} at={S(a + 3) + D(a + 3) * 0.78} x={1320} y={640} text="YOU: 100%" size={56} bg="#4DE08A" /></g>
          </Svg>
          <StatCard t={t} at={S(a + 3) + 0.3} x={900} y={180} w={860} title="BOND & DEPAULO · 206 STUDIES" big="54%" sub="of lies spotted. Basically a coin flip." color="#FFC844" />
        </Camera>
      );
    }
    // Maya: the one number you won't read
    const walk = interpolate(t, [S(a + 4), E(a + 4)], [1650, 1250], clamp);
    return (
      <Camera t={t} t0={S(a + 4) - 0.3} t1={t1} from={1.0} to={1.1} fx={1000} fy={560}>
        <Classroom t={t} math="QUIZ: CHAPTER 7" />
        <Svg>
          <Person x={walk} y={1000} look={MAYA} mood="happy" t={t} flip lookX={-1} />
          <Tag t={t} x={walk} y={tagY(1000)} v={0} hidden at={S(a + 4) + 0.4} id="maya" />
          <Person x={700} y={1000} look={YOU} mood="nervous" t={t} pose="sit" sweat />
          <Desk x={700} />
          {/* your eyes go down to your shoes */}
          <path d="M 700 650 Q 640 760 700 900" stroke={P.white} strokeWidth={5} strokeDasharray="10 10" fill="none" opacity={0.8} />
          <Label t={t} at={S(a + 4) + 0.6} x={walk + 230} y={640} text="MAYA" size={36} bg="#8E7BB8" color={P.white} />
          <Label t={t} at={S(a + 4) + D(a + 4) * 0.55} x={420} y={340} text="YOU WON'T LOOK" size={34} bg="#FF4B4B" color={P.white} />
        </Svg>
      </Camera>
    );
  },

  money: ({ t, t0, t1 }) => {
    const a = first("money");
    const b = beatOf(t, a, 5);
    if (b <= 1) return (
      <Camera t={t} t0={t0} t1={S(a + 2)} from={1.0} to={1.12} fx={1180} fy={460}>
        <Bedroom t={t} />
        <Svg>
          <Trophy x={1000} y={330} s={0.7} label={false} />
          <Person x={640} y={900} look={YOU} mood="smug" t={t} pose="phone" lookX={1} holding={<rect x={-26} y={-44} width={52} height={88} rx={8} fill="#141A28" />} />
          <Glow cx={1240} cy={480} r={320} color="#9FC8FF" opacity={0.4} id="vidglow" />
          <Phone x={1240} y={480} s={0.85} t={t}>
            <rect x={-154} y={-300} width={308} height={600} fill="#141A28" />
            <rect x={-154} y={-230} width={308} height={180} fill="#3A4256" />
            <Cash x={-60} y={-80} n={6} s={0.7} /><Sneaker x={60} y={-90} s={0.5} c="#E25C5C" />
            <rect x={-30} y={-162} width={60} height={42} rx={12} fill="#E25C5C" /><path d="M -8 -152 L 12 -141 L -8 -130 Z" fill={P.white} />
            <rect x={-154} y={-52} width={308 * ((t - S(a)) % 20) / 20} height={6} fill="#E25C5C" />
            <text x={-138} y={-10} fontFamily={font} fontWeight={900} fontSize={22} fill={P.white}>I made $10,000 reselling</text>
            <text x={-138} y={20} fontFamily={font} fontWeight={900} fontSize={22} fill={P.white}>sneakers at 16</text>
            <text x={-138} y={52} fontFamily={font} fontWeight={700} fontSize={18} fill="#AEB6CC">2.1M views · 3 weeks ago</text>
            {b === 1 && <g><rect x={-138} y={90} width={276} height={170} rx={14} fill="#2C3852" /><text x={0} y={130} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={22} fill="#FFC844">THE HARD PART:</text>
              <text x={0} y={170} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={20} fill={P.white}>how far can you push</text><text x={0} y={200} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={20} fill={P.white}>before they walk away?</text></g>}
          </Phone>
          <Label t={t} at={S(a) + 0.5} x={1240} y={100} text="RECOMMENDED FOR YOU" size={30} />
        </Svg>
        <Chip t={t} at={t0 + 0.2} text="MONDAY NIGHT" />
      </Camera>
    );
    if (b === 2) return (
      <Camera t={t} t0={S(a + 2) - 0.3} t1={S(a + 3)} from={1.0} to={1.15} fx={700} fy={500}>
        <Bedroom t={t} />
        <Svg>
          <Trophy x={1000} y={330} s={0.7} label={false} />
          <Person x={700} y={900} look={YOU} mood={t > S(a + 2) + D(a + 2) * 0.5 ? "smug" : "deadpan"} t={t} lookX={t > S(a + 2) + D(a + 2) * 0.3 ? 0 : 1} />
          {t > S(a + 2) + D(a + 2) * 0.45 && <g><Glow cx={760} cy={380} r={120} color="#FFE08A" opacity={0.6} id="idea" /><circle cx={760} cy={370} r={40} fill="#FFE08A" /><rect x={744} y={406} width={32} height={22} rx={4} fill="#AEB6CC" /></g>}
        </Svg>
      </Camera>
    );
    return (
      <Camera t={t} t0={S(a + 3) - 0.3} t1={t1} from={1.0} to={1.06}>
        <Bedroom t={t} />
        <Svg>
          <Phone x={960} y={520} s={1.1} t={t}>
            <rect x={-154} y={-300} width={308} height={600} fill="#EEF1F6" /><rect x={-154} y={-300} width={308} height={80} fill="#2C3852" />
            <circle cx={-110} cy={-260} r={22} fill="#3B2B20" /><text x={-76} y={-252} fontFamily={font} fontWeight={900} fontSize={26} fill={P.white}>Theo</text>
            <g transform={`scale(${pop(t, S(a + 3))})`}><rect x={-100} y={-190} width={240} height={120} rx={18} fill="#3E9C97" /><text x={-84} y={-152} fontFamily={font} fontWeight={800} fontSize={22} fill={P.white}>How much do you</text><text x={-84} y={-122} fontFamily={font} fontWeight={800} fontSize={22} fill={P.white}>know about</text><text x={-84} y={-92} fontFamily={font} fontWeight={800} fontSize={22} fill={P.white}>sneakers?</text></g>
            {b === 4 && <g transform={`scale(${pop(t, S(a + 4))})`}><rect x={-140} y={-40} width={170} height={70} rx={18} fill={P.white} /><text x={-124} y={4} fontFamily={font} fontWeight={900} fontSize={26} fill={P.ink}>Bro. Everything.</text></g>}
          </Phone>
          {b === 4 && <g><Person x={1520} y={1000} look={THEO} mood="happy" t={t} {...say(t, "THEO")} pose="cheer" flip />{[0, 1, 2].map((i) => <Sneaker key={i} x={1360 + i * 140} y={1040 - i * 0} s={0.5} c={["#E25C5C", "#3F5F8A", "#F2B640"][i]} />)}</g>}
        </Svg>
      </Camera>
    );
  },

  market: ({ t, t0, t1 }) => {
    const a = first("market");
    const b = beatOf(t, a, 10);
    if (b === 0) return (
      <Camera t={t} t0={t0} t1={S(a + 1)} from={1.0} to={1.07}>
        <Garage t={t} />
        <Svg>
          <Stall x={420} colors={["#E25C5C", "#F4F6FA", "#3F5F8A"]} price="$220" />
          <Stall x={1500} colors={["#F2B640", "#2B2B36", "#4DBE8A"]} price="$180" />
          <Person x={300} y={1000} look={extra(2)} mood="neutral" t={t} s={0.85} /><Tag t={t} x={300} y={tagY(1000, 0.85)} v={22} at={S(a) + 1.2} s={0.8} id="m1" />
          <Person x={1640} y={1000} look={extra(4)} mood="neutral" t={t} s={0.85} flip /><Tag t={t} x={1640} y={tagY(1000, 0.85)} v={31} at={S(a) + 1.4} s={0.8} id="m2" />
          {/* Theo checks a shoe with a magnifier */}
          <Person x={820} y={1000} look={THEO} mood="smug" t={t} pose="hold" holding={<g><Sneaker x={0} y={0} s={0.45} c="#E25C5C" /><circle cx={50} cy={-60} r={34} fill="#BFE3F6" opacity={0.6} stroke="#2B2B36" strokeWidth={8} /></g>} />
          <Person x={1110} y={1000} look={YOU} mood="smug" t={t} lookX={1} />
          <Label t={t} at={S(a) + D(a) * 0.45} x={760} y={470} text="THEO: SPOTS FAKES" size={30} bg="#FFC844" />
          <Label t={t} at={S(a) + D(a) * 0.7} x={1260} y={380} text="YOU: READ THE SELLERS" size={30} bg="#4DE08A" />
        </Svg>
        <Chip t={t} at={t0 + 0.2} text="SATURDAY · PARKING GARAGE" />
      </Camera>
    );
    if (b <= 8) {
      const v = live(t, [[0, 18], [S(a + 3), 70], [S(a + 5), 95], [S(a + 7), 98]]);
      const deal = b >= 7;
      const offer = b >= 6 ? "$160 CASH" : b >= 4 ? "$150?" : b >= 2 ? "$200" : "";
      return (
        <Camera t={t} t0={S(a + 1) - 0.3} t1={S(a + 9)} from={1.0} to={1.06} fx={1150} fy={520} punch={[S(a + 3), S(a + 5), S(a + 7)]} shake={b === 5 ? [S(a + 5) + 0.1] : []}>
          <Garage t={t} />
          <Svg>
            <Stall x={1020} colors={["#E25C5C", "#F4F6FA"]} s={0.9} />
            <Person x={1300} y={1000} look={SELLER} mood={deal ? "deadpan" : b === 5 ? "angry" : b >= 3 ? "nervous" : "smug"} t={t} {...say(t, "SELLER")} flip lookX={-1} pose={deal ? "point" : "hold"}
              holding={deal ? undefined : <g><ShoeBox x={0} y={30} s={0.6} c="#E25C5C" /><Sneaker x={0} y={-10} s={0.45} c="#E25C5C" /></g>} />
            <Tag t={t} x={1300} y={tagY(1000, 1, 1.06)} v={v} at={S(a + 1) + 0.4} s={1.15} id="seller" />
            {/* the walk-away line: the meter next to him */}
            <g transform="translate(1540 330)" opacity={ease(t, S(a + 3), S(a + 3) + 0.4)}>
              <rect x={-24} y={0} width={48} height={460} rx={24} fill="#2B2B36" /><rect x={-16} y={8 + 444 * (1 - v / 100)} width={32} height={444 * v / 100} rx={16} fill={heat(v)} />
              <line x1={-60} y1={8 + 444 * 0.01} x2={60} y2={8 + 444 * 0.01} stroke="#FF4B4B" strokeWidth={6} />
              <text x={0} y={-30} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={30} fill="#FF4B4B">99 = HE WALKS</text>
            </g>
            <Person x={600} y={1000} look={YOU} mood={deal ? "happy" : "smug"} t={t} {...say(t, "YOU")} lookX={1} pose={deal ? "point" : "stand"} />
            {b <= 1 && <Offer t={t} at={S(a + 1) + 0.4} x={1300} y={300} text="NEVER WORN · $400" color="#FFC844" />}
            {offer && <Offer t={t} at={S(a + (b >= 6 ? 6 : b >= 4 ? 4 : 2))} x={600} y={330} text={offer} />}
            {b === 5 && <Label t={t} at={S(a + 5) + 0.6} x={900} y={410} text="ONE MORE DOLLAR AND HE WALKS" size={34} bg="#FF4B4B" color={P.white} />}
            {deal && <Label t={t} at={S(a + 7) + 0.3} x={900} y={410} text="DEAL · $240 UNDER ASKING" size={40} bg="#4DE08A" />}
            {deal && <Cash x={950} y={720} n={4} s={0.8} />}
          </Svg>
        </Camera>
      );
    }
    return (
      <Camera t={t} t0={S(a + 9) - 0.3} t1={t1} from={1.0} to={1.08}>
        <Bedroom t={t} />
        <Svg>
          <Phone x={960} y={520} s={1.1} t={t}>
            <rect x={-154} y={-300} width={308} height={600} fill="#EEF1F6" /><rect x={-154} y={-300} width={308} height={70} fill="#2E8B57" /><text x={0} y={-254} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={26} fill={P.white}>RESALE APP</text>
            <rect x={-130} y={-210} width={260} height={200} rx={14} fill={P.white} /><Sneaker x={0} y={-60} s={1} c="#E25C5C" />
            <text x={-130} y={30} fontFamily={font} fontWeight={900} fontSize={28} fill={P.ink}>Jordan 4 · new</text>
            <text x={-130} y={90} fontFamily={font} fontWeight={900} fontSize={60} fill="#2E8B57">$650</text>
            <rect x={-130} y={130} width={260} height={60} rx={14} fill="#2E8B57" /><text x={0} y={170} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={28} fill={P.white}>LISTED</text>
          </Phone>
          <Label t={t} at={S(a + 9) + D(a + 9) * 0.5} x={1460} y={420} text="PAID $160" size={40} />
          <Label t={t} at={S(a + 9) + D(a + 9) * 0.7} x={1460} y={560} text="+$490" size={56} bg="#4DE08A" />
        </Svg>
      </Camera>
    );
  },

  hustle: ({ t, t0, t1 }) => {
    const a = first("hustle");
    const b = beatOf(t, a, 4);
    if (b === 0) {
      const g = ease(t, S(a) + 0.4, E(a) - 0.5);
      return (
        <Camera t={t} t0={t0} t1={S(a + 1)} from={1.0} to={1.05}>
          <Backdrop base="#1E2638" light="#3A4766"><Bokeh t={t} n={12} opacity={0.15} /></Backdrop>
          <Svg>
            {[["2019", 6], ["2022", 13], ["2030", 30]].map(([y, v], i) => <g key={i}><rect x={220 + i * 220} y={760 - (v as number) * 16 * g} width={150} height={(v as number) * 16 * g} rx={10} fill={i === 2 ? "#4DE08A" : "#3E9C97"} /><text x={295 + i * 220} y={810} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={36} fill={P.white}>{y}</text></g>)}
            <text x={515} y={250} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={34} fill="#AEB6CC">SNEAKER RESALE MARKET</text>
          </Svg>
          <StatCard t={t} at={S(a) + 0.3} x={1000} y={260} w={760} title="COWEN · 2022 ESTIMATE" big="$30 BILLION" sub="a year, by 2030" color="#2E8B57" />
        </Camera>
      );
    }
    if (b === 1) return (
      <Camera t={t} t0={S(a + 1) - 0.3} t1={S(a + 2)} from={1.0} to={1.05}>
        <Backdrop base="#2C3852" light="#4A5A80"><Bokeh t={t} n={10} opacity={0.15} /></Backdrop>
        <Svg>
          {[["MEETUP", "#5A606E"], ["APP", "#2E8B57"], ["GARAGE SALE", "#C9775A"]].map(([w, c], i) => {
            const at = S(a + 1) + D(a + 1) * (0.1 + i * 0.25);
            const p = pop(t, at);
            return <g key={i} transform={`translate(${380 + i * 580} 600) scale(${p})`}>
              <rect x={-250} y={-330} width={500} height={560} rx={30} fill={c} /><rect x={-250} y={-330} width={500} height={560} rx={30} fill="none" stroke={P.cream} strokeWidth={10} />
              {i === 1 ? <g transform="scale(0.5) translate(0 -40)"><Phone x={0} y={0} t={t}><rect x={-154} y={-300} width={308} height={600} fill="#EEF1F6" /><Sneaker x={0} y={-60} s={1} c="#3F5F8A" /><text y={80} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={60} fill="#2E8B57">OFFER?</text></Phone></g>
                : <g transform="translate(0 210) scale(0.6)"><Person x={0} y={0} look={extra(i + 5)} mood="nervous" t={t} />{i === 2 && <rect x={-200} y={-120} width={400} height={30} fill="#E4E9F0" />}</g>}
              <g transform="translate(0 -150) scale(0.8)"><Tag t={t} x={0} y={0} v={98} id={`h${i}`} /></g>
              <text y={-260} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={40} fill={P.white}>{w}</text>
            </g>;
          })}
          <Label t={t} at={S(a + 1) + D(a + 1) * 0.75} x={960} y={130} text="98% · EVERY TIME" size={48} bg="#FFC844" />
        </Svg>
      </Camera>
    );
    if (b === 2) {
      const money = Math.round(interpolate(t, [S(a + 2), S(a + 2) + D(a + 2) * 0.45], [490, 8400], clamp) / 10) * 10;
      const v = live(t, [[0, 12], [S(a + 2) + D(a + 2) * 0.75, 4]]);
      return (
        <Camera t={t} t0={S(a + 2) - 0.3} t1={S(a + 3)} from={1.0} to={1.06}>
          <Kitchen t={t} />
          <Svg>
            <Person x={760} y={1000} look={YOU} mood="happy" t={t} lookX={1} pose="hold" holding={<g><path d="M -50 -60 L 50 -60 L 40 40 L -40 40 Z" fill="#C9A47A" /><circle cx={-20} cy={-70} r={20} fill="#E25C5C" /><rect x={0} y={-100} width={30} height={46} rx={4} fill="#F4F6FA" /></g>} />
            <Person x={1240} y={1000} look={MOM} mood="happy" t={t} flip lookX={-1} />
            <Tag t={t} x={1240} y={tagY(1000)} v={v} at={S(a + 2) + 0.4} s={1.05} id="mom2" />
            <Label t={t} at={S(a + 2) + D(a + 2) * 0.55} x={760} y={560} text="GROCERIES: ON YOU" size={30} bg="#4DE08A" />
          </Svg>
          <Counter label="PROFIT, BY FRIDAY" value={`$${money.toLocaleString("en-US")}`} x={1440} y={40} color="#4DE08A" />
        </Camera>
      );
    }
    return (
      <Camera t={t} t0={S(a + 3) - 0.3} t1={t1} from={1.0} to={1.15} fx={1180} fy={480}>
        <Bedroom t={t} night={false} />
        <Svg>
          <Trophy x={1000} y={330} s={0.7} label={false} />
          <rect x={560} y={760} width={800} height={30} rx={8} fill="#8E6646" /><rect x={580} y={790} width={20} height={210} fill="#6B4E36" /><rect x={1320} y={790} width={20} height={210} fill="#6B4E36" />
          <Person x={700} y={1000} look={YOU} mood="happy" t={t} pose="sit" lookX={1} />
          <Person x={1180} y={1000} look={THEO} mood="happy" t={t} pose="sit" flip lookX={-1} />
          <rect x={560} y={760} width={800} height={30} rx={8} fill="#8E6646" />
          {[760, 940, 1100].map((x, i) => <Cash key={x} x={x} y={756} n={4 + i * 2} s={0.8} />)}
          {/* the number that doesn't move */}
          <Tag t={t} x={1180} y={tagY(1000, 1, 1.06)} v={87} at={S(a + 3) + 0.4} s={1.1 + 0.05 * Math.sin(t * 5)} id="theo87" />
          <Label t={t} at={S(a + 3) + D(a + 3) * 0.7} x={1500} y={260} text="STILL 87" size={36} bg="#FF4B4B" color={P.white} />
        </Svg>
      </Camera>
    );
  },

  secret: ({ t, t0, t1 }) => {
    const a = first("secret");
    const b = beatOf(t, a, 6);
    if (b === 2) {
      // flashback: 4th grade science fair
      const foam = (t - S(a + 2)) % 2.2;
      return (
        <Camera t={t} t0={S(a + 2) - 0.3} t1={S(a + 3)} from={1.0} to={1.06}>
          <AbsoluteFill style={{ filter: "sepia(0.45) saturate(0.8)" }}>
            <Backdrop base="#D9C9A6" light="#F6EBD2" cx={50} cy={25}>
              <rect x={460} y={90} width={1000} height={110} rx={14} fill="#3F5F8A" /><text x={960} y={166} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={60} fill={P.white}>SCIENCE FAIR</text>
              <rect y={760} width={1920} height={320} fill="#B8A88E" />
            </Backdrop>
            <Svg>
              <g transform="translate(0 -130)">{/* table, volcano, foam */}
              <rect x={760} y={720} width={520} height={30} rx={6} fill="#8E6646" /><rect x={780} y={750} width={20} height={250} fill="#6B4E36" /><rect x={1240} y={750} width={20} height={250} fill="#6B4E36" />
              <path d="M 880 720 L 990 520 L 1050 520 L 1160 720 Z" fill="#7A563A" />
              {Array.from({ length: 10 }, (_, i) => <circle key={i} cx={1020 + Math.sin(i * 2.1) * 60 * foam} cy={520 - foam * 160 + i * 8} r={22 - i} fill={P.white} opacity={Math.max(0, 1 - foam / 2.2)} />)}
              <Person x={600} y={1000} look={YOU} mood="happy" t={t} s={0.72} pose="point" />
              <Trophy x={1020} y={1000} s={0} />
              {/* Theo's empty chair */}
              <rect x={1440} y={850} width={160} height={20} rx={6} fill="#5E7A9A" /><rect x={1440} y={720} width={20} height={150} fill="#5E7A9A" /><rect x={1450} y={870} width={14} height={130} fill="#4A6280" /><rect x={1586} y={870} width={14} height={130} fill="#4A6280" />
              <g transform="translate(1520 800) rotate(-4)"><rect x={-90} y={-36} width={180} height={64} rx={6} fill={P.white} /><text y={8} textAnchor="middle" fontFamily="'Comic Sans MS', cursive" fontWeight={700} fontSize={28} fill={P.ink}>THEO: SICK</text></g></g>
            </Svg>
          </AbsoluteFill>
          <Chip t={t} at={S(a + 2) + 0.1} text="6 YEARS AGO · 4TH GRADE" />
          <Svg><Label t={t} at={S(a + 2) + D(a + 2) * 0.55} x={1020} y={360} text="WHOSE IDEA?" size={44} bg="#FFC844" /></Svg>
        </Camera>
      );
    }
    const v = live(t, [[0, 87], [S(a + 3), 93]]);
        return (
      <Camera t={t} t0={b <= 1 ? t0 : S(a + 3) - 0.3} t1={b <= 1 ? S(a + 2) : t1} from={1.0} to={1.1} fx={b <= 1 ? 1000 : 1150} fy={500} punch={b >= 3 ? [S(a + 3)] : []}>
        <Bedroom t={t} night={false} />
        <Svg>
          <Person x={640} y={1000} look={YOU} mood={b >= 4 ? "sad" : b === 3 ? "nervous" : "neutral"} t={t} {...say(t, "YOU")} lookX={1} />
          <Person x={1160} y={1000} look={THEO} mood={b >= 3 ? "sad" : "neutral"} t={t} {...say(t, "THEO")} flip lookX={-1} pose="hold" holding={<Trophy x={0} y={40} s={0.55} label={false} />} />
          <Tag t={t} x={1160} y={tagY(1000, 1, 1.06) - 60} v={v} at={t0 + 0.3} s={b === 3 ? 1.3 : 1.05} id="theo93" />
          {b === 0 && <Label t={t} at={S(a) + D(a) * 0.6} x={1450} y={820} text="SCIENCE FAIR 1ST PLACE" size={30} bg="#F2B640" />}
        </Svg>
      </Camera>
    );
  },

  pitch: ({ t, t0, t1 }) => {
    const a = first("pitch");
    const b = beatOf(t, a, 7);
    if (b === 0) return (
      <Camera t={t} t0={t0} t1={S(a + 1)} from={1.0} to={1.06}>
        <Stage t={t} slide={0} />
        <Svg>
          <rect x={300} y={560} width={160} height={200} rx={10} fill="#1F2433" />
          <Person x={540} y={760} look={YOU} mood="nervous" t={t} s={0.75} lookX={1} />
          <Chairs y={990} n={7} x0={260} gap={240} />
          {[0, 1, 2, 4, 5].map((i) => <g key={i}><Person x={260 + i * 240} y={1030} look={extra(i + 3)} mood="neutral" t={t} s={0.8} noLegs /></g>)}
          <Person x={1700} y={1010} look={THEO} mood="sad" t={t} s={0.8} noLegs flip />
          <Label t={t} at={S(a) + D(a) * 0.75} x={1700} y={600} text="THEO (BACK ROW)" size={28} bg={P.orange} color={P.white} />
        </Svg>
      </Camera>
    );
    if (b <= 3) {
      const keys: [number, number][][] = [[[0, 60], [S(a + 2) + D(a + 2) * 0.25, 55], [S(a + 2) + D(a + 2) * 0.5, 41], [S(a + 2) + D(a + 2) * 0.85, 12]], [[0, 62], [S(a + 2) + D(a + 2) * 0.27, 52], [S(a + 2) + D(a + 2) * 0.52, 38], [S(a + 2) + D(a + 2) * 0.87, 10]], [[0, 59], [S(a + 2) + D(a + 2) * 0.29, 58], [S(a + 2) + D(a + 2) * 0.54, 44], [S(a + 2) + D(a + 2) * 0.89, 14]]];
      const slide = t < S(a + 2) + D(a + 2) * 0.25 ? 0 : t < S(a + 2) + D(a + 2) * 0.5 ? 1 : t < S(a + 2) + D(a + 2) * 0.8 ? 2 : 3;
      return (
        <Camera t={t} t0={S(a + 1) - 0.3} t1={S(a + 4)} from={1.0} to={1.05}>
          <Backdrop base="#3A1E2A" light="#7A3A4A" cx={50} cy={30}>{Array.from({ length: 14 }, (_, i) => <rect key={i} x={i * 140} y={0} width={140} height={1080} fill={i % 2 ? "#7A2333" : "#8A2A3C"} />)}</Backdrop>
          <Svg>
            {[560, 960, 1360].map((x, i) => <g key={x}><Person x={x} y={1000} look={JUDGES[i]} mood={b === 3 && i === 0 ? "neutral" : keys[i][keys[i].length - 1][0] < t ? "happy" : "deadpan"} t={t} {...(i === 0 ? say(t, "JUDGE") : { talk: false })} noLegs />
              <Tag t={t} x={x} y={tagY(1000, 1, JUDGES[i].tall ?? 1)} v={live(t, keys[i])} at={S(a + 1) + 0.4 + i * 0.25} id={`j${i}`} /></g>)}
            <JudgesTable />
            {b === 1 && <Label t={t} at={S(a + 1) + D(a + 1) * 0.6} x={960} y={130} text="40 PITCHES TODAY" size={36} bg="#FFC844" />}
            {/* what you're showing them, top left */}
            {b >= 2 && <g transform="translate(60 40) scale(0.55)"><rect width={560} height={340} rx={12} fill="#141A28" /><rect x={16} y={16} width={528} height={308} rx={8} fill={P.cream} /><Slide n={slide} t={t} x={280} y={170} /></g>}
            {b >= 2 && <Label t={t} at={S(a + 2) + 0.2} x={210} y={260} text="YOUR SLIDES" size={24} />}
          </Svg>
        </Camera>
      );
    }
    if (b === 4) {
      const theo = t > S(a + 4) + D(a + 4) * 0.62;
      if (!theo) return (
        <Camera t={t} t0={S(a + 4) - 0.3} t1={S(a + 4) + D(a + 4) * 0.62} from={1.0} to={1.06}>
          <Stage t={t} slide={3} />
          <Svg>
            <rect x={760} y={560} width={200} height={220} rx={10} fill="#1F2433" />
            <Person x={1000} y={800} look={YOU} mood="nervous" t={t} s={0.85} lookX={-1} sweat />
            {[0, 1, 2].map((i) => <Label key={i} t={t} at={S(a + 4) + 0.6 + i * 0.5} x={480 + i * 120} y={340 + i * 90} text={'"I"'} size={44} bg={P.cream} />)}
            <Label t={t} at={S(a + 4) + D(a + 4) * 0.3} x={560} y={680} text={'EVERY "I" = LOWER NUMBERS'} size={30} bg="#4DE08A" />
          </Svg>
        </Camera>
      );
      return (
        <Camera t={t} t0={S(a + 4) + D(a + 4) * 0.62} t1={S(a + 5)} from={1.15} to={1.25} fx={1500} fy={600}>
          <Stage t={t} slide={3} />
          <Svg>
            <Chairs y={990} n={7} x0={260} gap={240} />
            {[0, 1, 2, 4, 5].map((i) => <Person key={i} x={260 + i * 240} y={1030} look={extra(i + 3)} mood="neutral" t={t} s={0.8} noLegs />)}
            <Person x={1700} y={1010} look={THEO} mood="sad" t={t} s={0.8} noLegs flip lookX={1} />
            <Tag t={t} x={1700} y={tagY(1010, 0.8, 1.06)} v={93} at={S(a + 4) + D(a + 4) * 0.66} id="theo93b" />
          </Svg>
        </Camera>
      );
    }
    const v = live(t, [[0, 93], [S(a + 6) + D(a + 6) * 0.35, 70], [S(a + 6) + D(a + 6) * 0.6, 40], [S(a + 6) + D(a + 6) * 0.85, 9]]);
    return (
      <Camera t={t} t0={S(a + 5) - 0.3} t1={t1} from={1.0} to={1.1} fx={b === 6 ? 1500 : 960} fy={600}>
        <Stage t={t} slide={3} />
        <Svg>
          <rect x={360} y={560} width={200} height={220} rx={10} fill="#1F2433" />
          <Person x={620} y={800} look={YOU} mood="happy" t={t} {...say(t, "YOU")} s={0.85} pose="point" lookX={1} />
          <Chairs y={990} n={7} x0={260} gap={240} />
          {[2, 4, 5].map((i) => <Person key={i} x={260 + i * 240} y={1030} look={extra(i + 3)} mood="happy" t={t} s={0.8} noLegs flip lookX={1} />)}
          <Person x={1700} y={1010} look={THEO} mood={v < 50 ? "happy" : "shocked"} t={t} s={0.8} noLegs flip lookX={-1} />
          <Tag t={t} x={1700} y={tagY(1010, 0.8, 1.06)} v={v} id="theofall" s={b === 6 ? 1.2 : 1} />
          {b === 5 && <path d={`M 760 520 Q 1200 300 ${interpolate(t, [S(a + 5), S(a + 5) + 1], [800, 1560], clamp)} 560`} stroke="#FFC844" strokeWidth={8} strokeDasharray="16 12" fill="none" />}
          {b === 5 && <Label t={t} at={S(a + 5) + D(a + 5) * 0.3} x={1150} y={250} text="HIS IDEA" size={44} bg="#FFC844" />}
        </Svg>
      </Camera>
    );
  },

  win: ({ t, t0, t1 }) => {
    const a = first("win");
    return (
      <Camera t={t} t0={t0} t1={t1} from={1.0} to={1.08} punch={[S(a) + D(a) * 0.4]}>
        <Stage t={t} slide={0} />
        <Svg>
          {Array.from({ length: 40 }, (_, i) => <rect key={i} x={(i * 97 + Math.sin(t + i) * 30) % 1920} y={((t - S(a)) * 220 + i * 71) % 1080 - 40} width={16} height={26} rx={3} fill={["#FFC844", "#4DE08A", "#E25C5C", "#9FE3FF"][i % 4]} transform={`rotate(${(t * 90 + i * 40) % 360} ${(i * 97) % 1920} ${((t - S(a)) * 220 + i * 71) % 1080})`} opacity={t > S(a) + D(a) * 0.4 ? 0.9 : 0} />)}
          <Person x={520} y={1000} look={YOU} mood="happy" t={t} pose="cheer" />
          <Person x={1400} y={1000} look={THEO} mood="happy" t={t} {...say(t, "THEO")} flip lookX={-1} pose={t > S(a + 1) ? "point" : "cheer"} />
          <Tag t={t} x={1400} y={tagY(1000, 1, 1.06)} v={9} id="theo9" s={t > S(a + 1) ? 1.2 : 1} />
          {/* the giant check */}
          <g transform={`translate(960 880) scale(${0.72 * pop(t, S(a) + D(a) * 0.4)}) rotate(-3)`}>
            <rect x={-420} y={-170} width={840} height={300} rx={14} fill={P.cream} stroke="#2E8B57" strokeWidth={10} />
            <text x={-380} y={-110} fontFamily={font} fontWeight={800} fontSize={30} fill="#7C8296">PAY TO</text>
            <text x={-380} y={-56} fontFamily={font} fontWeight={900} fontSize={46} fill={P.ink}>YOU & THEO</text>
            <text x={380} y={60} textAnchor="end" fontFamily={font} fontWeight={900} fontSize={96} fill="#2E8B57">$50,000</text>
            <text x={-380} y={100} fontFamily={font} fontWeight={800} fontSize={26} fill="#7C8296">1ST PRIZE · TEEN BUSINESS CONTEST</text>
          </g>
          {t > S(a + 1) && <Label t={t} at={S(a + 1) + D(a + 1) * 0.5} x={1600} y={260} text="SPOILED HIS SHOW" size={30} bg="#FFC844" />}
        </Svg>
      </Camera>
    );
  },

  crush: ({ t, t0, t1 }) => {
    const a = first("crush");
    const b = beatOf(t, a, 6);
    const look = t > S(a + 2) + D(a + 2) * 0.5;
    const reveal = b >= 3;
    return (
      <Camera t={t} t0={t0} t1={t1} from={1.0} to={1.1} fx={1150} fy={b === 2 || b === 3 ? 420 : 560} punch={[S(a + 3)]}>
        <Exterior t={t} />
        <Svg>
          <Person x={720} y={1000} look={YOU} mood={b >= 5 ? "happy" : b === 3 || b === 4 ? "shocked" : "nervous"} t={t} {...say(t, "YOU")} lookX={1} />
          {b === 2 && <path d={`M 760 640 Q 900 ${interpolate(t, [S(a + 2), S(a + 2) + 1], [640, 420], clamp)} 1100 ${interpolate(t, [S(a + 2), S(a + 2) + 1], [640, 420], clamp)}`} stroke={P.white} strokeWidth={5} strokeDasharray="10 10" fill="none" opacity={0.8} />}
          <Person x={1180} y={1000} look={MAYA} mood={b >= 4 ? "happy" : "smug"} t={t} {...say(t, "MAYA")} flip lookX={-1} wink={b === 4 && t > S(a + 4) + D(a + 4) * 0.7} />
          {b >= 1 && <Tag t={t} x={1180} y={tagY(1000)} v={0} hidden={!look} at={S(a + 1)} s={reveal ? 1.45 : 1} id="maya0" />}
          {reveal && <Glow cx={1180} cy={tagY(1000)} r={360} color="#4DE08A" opacity={0.35 + 0.1 * Math.sin(t * 3)} id="zero" />}
          {b === 0 && <Label t={t} at={S(a) + D(a) * 0.5} x={1180} y={300} text="MAYA" size={36} bg="#8E7BB8" color={P.white} />}
          {b === 3 && t > S(a + 3) + D(a + 3) * 0.75 && <g transform="translate(320 330)"><rect x={-160} y={-120} width={320} height={260} rx={24} fill="rgba(14,19,32,0.85)" /><g transform="translate(0 220) scale(0.5)"><Person x={0} y={0} look={MOM} mood="smug" t={t} noLegs /></g><g transform="translate(0 -60) scale(0.6)"><Tag t={t} x={0} y={0} v={4} id="momi" /></g><text y={110} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={26} fill={P.white}>YOUR MOM</text></g>}
          {b === 3 && <Label t={t} at={S(a + 3) + D(a + 3) * 0.35} x={1180} y={130} text="THE 3RD ZERO EVER" size={40} bg="#4DE08A" />}
        </Svg>
        {b === 0 && <Chip t={t} at={t0 + 0.2} text="AFTER THE CONTEST" />}
      </Camera>
    );
  },

  endcard: ({ t, t0, t1 }) => (
    <Camera t={t} t0={t0} t1={t1} from={1} to={1.05}>
      <Backdrop base="#11162A" light="#26305A"><Bokeh t={t} /><DotLine t={t} y={900} /></Backdrop>
      <Svg>{[[300, 12, P.skin], [740, 91, P.skin2], [1180, 0, P.skin3], [1620, 50, P.skin]].map(([x, v], i) => <g key={i} transform={`translate(${x} 0)`} opacity={ease(t, t0 + 0.2 + i * 0.15, t0 + 0.5 + i * 0.15)}>
        <circle cx={0} cy={700} r={90} fill="#2C3852" /><rect x={-120} y={790} width={240} height={200} rx={90} fill="#2C3852" />
        <Tag t={t} x={0} y={540} v={v as number} hidden={i === 3} id={`end${i}`} /></g>)}</Svg>
      <Title t={t} at={t0 + 0.6} words={"WOULD YOU LOOK?".split(" ")} accent={["LOOK?"]} size={110} y={-330} />
    </Camera>
  ),
};

const SPEAKER_COLOR: Record<string, string> = { NARRATOR: "#FFFFFF", YOU: "#7FE3DD", THEO: "#FFB37A", MOM: "#FFB3C1", SELLER: "#B8E0B8", JUDGE: "#FFE08A", MAYA: "#D7B8FF" };
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
      {!("estimated" in timeline) && <Audio src={staticFile("secretly/mix.wav")} />}
    </AbsoluteFill>
  );
};
