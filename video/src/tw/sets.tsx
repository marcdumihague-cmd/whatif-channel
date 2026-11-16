// Sets for "What If You Lived Every Day Twice?". Each set draws a far layer (soft focus), the subject plane
// (its children go here, between the set and its foreground), and a foreground layer with light on top.
import React from "react";
import { Layer, Grad, Shafts, Bloom, Dust, GroundShadow, shade, rnd, font, Person, pose, extra, Look } from "../v2/kit";

type SetProps = { t: number; children?: React.ReactNode; far?: React.ReactNode; fg?: React.ReactNode };
const T: React.FC<{ x: number; y: number; s?: number; c?: string; w?: number; a?: "start" | "middle" | "end"; children: React.ReactNode; o?: number; ls?: number }> = ({ x, y, s = 30, c = "#FFFFFF", w = 800, a = "middle", children, o = 1, ls = 0 }) => (
  <text x={x} y={y} textAnchor={a} fontFamily={font} fontWeight={w} fontSize={s} fill={c} opacity={o} letterSpacing={ls}>{children}</text>
);
export { T };

// ---------- small props ----------
export const Flowers: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s}) rotate(-8)`}>
    <path d="M -6 10 L 6 10 L 16 -70 L -16 -70 Z" fill="#F4F0E6" /><path d="M -16 -70 L 16 -70 L 10 -40 L -10 -40 Z" fill="#E6DCC8" />
    {[[-22, -92, "#FF6B8A"], [0, -108, "#FFD24A"], [22, -92, "#FF8A5C"], [-10, -80, "#FF9EC0"], [12, -78, "#FF6B8A"]].map(([x, y, c], i) => (
      <g key={i} transform={`translate(${x} ${y})`}>{[0, 72, 144, 216, 288].map((r) => <ellipse key={r} cx={0} cy={-11} rx={8} ry={12} fill={c as string} transform={`rotate(${r})`} />)}<circle r={7} fill="#FFF1B8" /></g>
    ))}
    <path d="M -14 -68 q -14 -6 -18 -20 M 14 -68 q 14 -6 18 -20" stroke="#4FA36A" strokeWidth={6} fill="none" strokeLinecap="round" />
  </g>
);
export const PhoneUp: React.FC<{ c?: string; glow?: boolean }> = ({ c = "#1B1E2B", glow = true }) => (
  <g><rect x={-15} y={-56} width={30} height={56} rx={7} fill={c} /><rect x={-11} y={-50} width={22} height={40} rx={3} fill={glow ? "#BFE0FF" : "#39405A"} /><circle cx={0} cy={-45} r={2.5} fill="#FF4B4B" /></g>
);
export const Clapper: React.FC<{ take: 1 | 2; t: number; at: number }> = ({ take, t, at }) => {
  const k = Math.max(0, Math.min(1, (t - at) / 0.18)), open = t < at ? 26 : 26 * (1 - k);
  const c = take === 1 ? "#8FA6C8" : "#FFC83A";
  return (
    <g>
      <rect x={-150} y={-60} width={300} height={190} rx={16} fill="#161A28" stroke={c} strokeWidth={8} />
      <g transform={`rotate(${-open} -150 -60)`}>
        <rect x={-150} y={-112} width={300} height={48} rx={10} fill="#F4F5F8" />
        {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M ${-140 + i * 60} -64 l 28 -48 l 28 0 l -28 48 Z`} fill="#161A28" />)}
      </g>
      <T x={0} y={20} s={64} w={900} c={c}>{`TAKE ${take}`}</T>
      <T x={0} y={84} s={36} w={800} c="#FFFFFF">{take === 1 ? "PRACTICE" : "REAL"}</T>
    </g>
  );
};
const Window: React.FC<{ x: number; y: number; w: number; h: number; sky?: string; night?: boolean }> = ({ x, y, w, h, sky = "#BFE4F7", night }) => (
  <g>
    <rect x={x - 12} y={y - 12} width={w + 24} height={h + 24} rx={10} fill="#F7F3EA" />
    <Grad id={`win${x}${y}`} x={x} y={y} w={w} h={h} from={night ? "#141A3A" : sky} to={night ? "#2A3460" : "#EAF7FF"} />
    {!night && <g opacity={0.9}><ellipse cx={x + w * 0.3} cy={y + h * 0.35} rx={w * 0.2} ry={h * 0.08} fill="#FFFFFF" /><ellipse cx={x + w * 0.42} cy={y + h * 0.3} rx={w * 0.13} ry={h * 0.07} fill="#FFFFFF" /></g>}
    {night && Array.from({ length: 14 }, (_, i) => <circle key={i} cx={x + rnd(i) * w} cy={y + rnd(i + 20) * h * 0.8} r={1.5 + rnd(i + 5) * 2} fill="#FFFFFF" opacity={0.8} />)}
    <rect x={x + w / 2 - 5} y={y} width={10} height={h} fill="#F7F3EA" /><rect x={x} y={y + h / 2 - 5} width={w} height={10} fill="#F7F3EA" />
  </g>
);
const Crowd: React.FC<{ t: number; n: number; x0: number; x1: number; y: number; s: number; phones?: boolean; seed?: number; mood?: "shocked" | "happy" | "laugh" | "neutral"; cheer?: boolean; lightDir?: number }> = ({ t, n, x0, x1, y, s, phones, seed = 0, mood = "shocked", cheer, lightDir }) => (
  <g>{Array.from({ length: n }, (_, i) => {
    const x = x0 + ((x1 - x0) * (i + 0.5)) / n + (rnd(i + seed) - 0.5) * 20, l: Look = extra(i + seed * 3);
    const p = cheer ? pose("cheer", { y: -10 - Math.abs(Math.sin(t * 7 + i)) * 26 }) : phones && i % 3 !== 2 ? pose("holdUp", { aR: 128 + Math.sin(t * 2 + i) * 4 }) : pose();
    return <Person key={i} x={x} y={y + (i % 2) * 14} look={l} mood={mood} t={t} s={s} p={p} seed={i + seed} lookX={x < (x0 + x1) / 2 ? 0.6 : -0.6} shadow={false} lightDir={lightDir}
      hold={phones && i % 3 !== 2 && !cheer ? <g transform="translate(0 -8) rotate(18)"><PhoneUp /></g> : undefined} />;
  })}</g>
);
export { Crowd };

// ---------- cafeteria ----------
export const Cafeteria: React.FC<SetProps & { crowd?: boolean }> = ({ t, children, far, fg, crowd = true }) => (
  <>
    <Layer d={0.55} blur={2.2}>
      <Grad id="cafW" x={-200} y={0} w={2320} h={1000} from="#F3E3C6" to="#E8C99C" />
      <rect x={-200} y={610} width={2320} height={400} fill="#5FA7A0" /><rect x={-200} y={600} width={2320} height={14} fill="#F7F3EA" />
      {[120, 560, 1000, 1440].map((x) => <Window key={x} x={x} y={130} w={330} h={360} />)}
      <g transform="translate(960 70)"><rect x={-330} y={-34} width={660} height={74} rx={14} fill="#D9434F" /><T x={0} y={18} s={44} w={900}>LUNCH · NORTHVIEW HIGH</T></g>
      {/* serving counter */}
      <rect x={1500} y={520} width={520} height={420} fill="#C9CED8" /><rect x={1500} y={500} width={520} height={30} rx={8} fill="#E9ECF2" />
      {[1540, 1660, 1780, 1900].map((x, i) => <g key={x}><rect x={x} y={470} width={90} height={34} rx={8} fill={["#E0A53C", "#D9607A", "#5FA86A", "#C96A4A"][i]} /><path d={`M ${x + 20} 462 q 6 -${14 + Math.sin(t * 2 + i) * 4} 0 -26 M ${x + 60} 462 q 6 -${12 + Math.cos(t * 2 + i) * 4} 0 -22`} stroke="#FFFFFF" strokeWidth={4} fill="none" opacity={0.5} strokeLinecap="round" /></g>)}
      <Shafts x={120} y={130} w={1650} h={700} t={t} n={8} o={0.2} />
      {far}
    </Layer>
    <Layer>
      <Grad id="cafF" x={-200} y={760} w={2320} h={340} from="#D6C2A2" to="#A88E6C" />
      {Array.from({ length: 12 }, (_, i) => <line key={i} x1={-200 + i * 210} y1={760} x2={-420 + i * 260} y2={1100} stroke="#000" strokeWidth={3} opacity={0.06} />)}
      {[830, 910, 1010].map((y) => <line key={y} x1={-200} y1={y} x2={2120} y2={y} stroke="#000" strokeWidth={3} opacity={0.05} />)}
      {crowd && <Crowd t={t} n={7} x0={-60} x1={700} y={900} s={0.62} phones seed={1} />}
      {crowd && <Crowd t={t} n={7} x0={1240} x1={1980} y={900} s={0.62} phones seed={5} />}
      {children}
    </Layer>
    <Layer d={1.3} blur={5}>
      {crowd && [150, 520, 1420, 1790].map((x, i) => <g key={x} transform={`translate(${x} 1130)`}><ellipse cx={0} cy={-90} rx={110} ry={120} fill={["#3B2A24", "#2A1D17", "#7B2F1C", "#17131A"][i]} /><g transform={`translate(${i % 2 ? 110 : -110} -200) scale(2.4) rotate(${i % 2 ? 10 : -10})`}><PhoneUp /></g></g>)}
      {fg}
      <Dust t={t} n={18} o={0.4} />
    </Layer>
  </>
);
// the lunch table you stand on (feet at y = tableTop)
export const LunchTable: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g>
    <GroundShadow x={x} y={y + 196} rx={380} o={0.3} />
    <rect x={x - 300} y={y + 40} width={24} height={150} fill="#7C8291" /><rect x={x + 276} y={y + 40} width={24} height={150} fill="#7C8291" />
    <rect x={x - 380} y={y + 110} width={760} height={22} rx={8} fill="#9AA3B5" />
    <rect x={x - 340} y={y} width={680} height={44} rx={12} fill="#F2E9D8" /><rect x={x - 340} y={y + 30} width={680} height={14} rx={7} fill="#CDBFA4" />
    <g transform={`translate(${x - 240} ${y})`}><rect x={-46} y={-14} width={92} height={14} rx={5} fill="#E0554F" /><ellipse cx={-14} cy={-20} rx={22} ry={10} fill="#F2B640" /><rect x={14} y={-40} width={22} height={28} rx={4} fill="#F7F3EA" /></g>
    <g transform={`translate(${x + 230} ${y})`}><rect x={-46} y={-14} width={92} height={14} rx={5} fill="#4BA7B8" /><circle cx={-10} cy={-26} r={14} fill="#E0554F" /><rect x={14} y={-36} width={20} height={24} rx={4} fill="#9A76CC" /></g>
  </g>
);

// ---------- bedroom ----------
export const Bedroom: React.FC<SetProps & { clock: string; day: string; night?: boolean }> = ({ t, children, fg, clock, day, night }) => (
  <>
    <Layer d={0.6} blur={2}>
      <Grad id="bedW" x={-200} y={0} w={2320} h={1000} from={night ? "#232A4E" : "#CFE0F2"} to={night ? "#343C66" : "#B7CDE6"} />
      <Window x={1180} y={130} w={420} h={400} night={night} sky="#FFD9A8" />
      {!night && <Shafts x={1180} y={130} w={420} h={760} skew={-420} t={t} o={0.3} color="#FFE2B0" />}
      <g transform="translate(300 150)"><rect width={300} height={380} rx={10} fill="#2E3550" /><rect x={18} y={18} width={264} height={344} fill="#F08A3C" /><circle cx={150} cy={150} r={70} fill="#FFE14A" /><T x={150} y={310} s={40} w={900} c="#2E3550">ARCADE</T></g>
      <g transform="translate(700 210)"><rect width={360} height={22} rx={6} fill="#8A6A4C" />{[0, 1, 2, 3, 4, 5, 6].map((i) => <rect key={i} x={14 + i * 44} y={-90 + (i % 3) * 12} width={34} height={90 - (i % 3) * 12} rx={4} fill={["#D9607A", "#5E78C9", "#E0A53C", "#5FA86A", "#9A76CC", "#4BA7B8", "#C96A4A"][i]} />)}<circle cx={330} cy={-30} r={28} fill="#F7F3EA" /></g>
    </Layer>
    <Layer>
      <Grad id="bedF" x={-200} y={780} w={2320} h={320} from={night ? "#3A3550" : "#C9A27A"} to={night ? "#262238" : "#9C7650"} />
      <ellipse cx={1050} cy={960} rx={620} ry={110} fill={night ? "#4A4470" : "#D9607A"} opacity={0.55} />
      {/* bed */}
      <rect x={180} y={640} width={60} height={300} rx={16} fill="#6E5038" /><rect x={200} y={760} width={860} height={170} rx={26} fill="#F4F0E6" />
      <rect x={200} y={820} width={860} height={130} rx={26} fill="#4B6FC2" /><rect x={200} y={820} width={860} height={36} rx={18} fill="#6F8FDB" />
      <rect x={230} y={716} width={220} height={90} rx={36} fill="#FFFFFF" />
      {/* nightstand + alarm clock */}
      <rect x={1130} y={730} width={260} height={220} rx={12} fill="#8A6A4C" /><rect x={1150} y={790} width={220} height={60} rx={8} fill="#A5825E" /><circle cx={1260} cy={820} r={9} fill="#F2B640" />
      <g transform={`translate(1260 668) rotate(${Math.sin(t * 40) * (night ? 0 : 2.4)})`}>
        <rect x={-130} y={-62} width={260} height={124} rx={22} fill="#1B1E2B" /><rect x={-114} y={-46} width={228} height={92} rx={12} fill="#0E1322" />
        <T x={0} y={-2} s={58} w={900} c="#FF5C5C">{clock}</T><T x={0} y={34} s={24} w={800} c="#FFB3B3" ls={3}>{day}</T>
      </g>
      {!night && <Bloom x={1260} y={668} r={220} color="#FF6B6B" o={0.28} />}
      {children}
    </Layer>
    <Layer d={1.25} blur={4}><Dust t={t} n={20} />{fg}</Layer>
  </>
);

// ---------- school hallway ----------
export const Hallway: React.FC<SetProps> = ({ t, children, far, fg }) => (
  <>
    <Layer d={0.6} blur={2}>
      <Grad id="hallW" x={-200} y={0} w={2320} h={1000} from="#E9E2D0" to="#D8CDB4" />
      <rect x={-200} y={0} width={2320} height={90} fill="#C9BEA4" />
      {[200, 760, 1320, 1880].map((x) => <g key={x}><rect x={x - 90} y={60} width={180} height={26} rx={8} fill="#FFFDF2" /><Bloom x={x} y={90} r={260} color="#FFF6D8" o={0.35} /></g>)}
      {/* lockers */}
      {Array.from({ length: 17 }, (_, i) => {
        const x = -150 + i * 130, c = i % 2 ? "#3F7FB8" : "#4A8BC6";
        return <g key={i}><rect x={x} y={250} width={122} height={640} rx={6} fill={c} /><rect x={x + 10} y={262} width={102} height={40} rx={4} fill={shade(c, -0.14)} />{[0, 1, 2].map((k) => <line key={k} x1={x + 22} y1={274 + k * 9} x2={x + 100} y2={274 + k * 9} stroke="#1B1E2B" strokeWidth={3} opacity={0.35} />)}<rect x={x + 94} y={500} width={12} height={36} rx={5} fill="#E9ECF2" /><T x={x + 61} y={350} s={24} c="#FFFFFF" o={0.75}>{String(101 + i)}</T></g>;
      })}
      <g transform="translate(1010 150)"><rect x={-190} y={-44} width={380} height={86} rx={10} fill="#F7F3EA" stroke="#C9BEA4" strokeWidth={6} /><T x={0} y={-6} s={30} w={900} c="#D9434F">GO WOLVES!</T><T x={0} y={26} s={20} c="#5B6274">Northview High School</T></g>
      {far}
    </Layer>
    <Layer>
      <Grad id="hallF" x={-200} y={770} w={2320} h={330} from="#C9D4DE" to="#8FA0B0" />
      <rect x={-200} y={770} width={2320} height={16} fill="#5B6274" opacity={0.5} />
      {Array.from({ length: 9 }, (_, i) => <line key={i} x1={-200 + i * 300} y1={786} x2={-520 + i * 380} y2={1100} stroke="#FFFFFF" strokeWidth={4} opacity={0.18} />)}
      <ellipse cx={960} cy={900} rx={700} ry={40} fill="#FFFFFF" opacity={0.12} />
      {children}
    </Layer>
    <Layer d={1.25} blur={4}>{fg}<Dust t={t} n={12} o={0.3} /></Layer>
  </>
);

// ---------- classroom ----------
export const Classroom: React.FC<SetProps> = ({ t, children, fg }) => (
  <>
    <Layer d={0.6} blur={2}>
      <Grad id="clsW" x={-200} y={0} w={2320} h={1000} from="#EFE6CF" to="#E0D2B0" />
      <rect x={380} y={150} width={980} height={420} rx={12} fill="#8A6A4C" /><rect x={400} y={170} width={940} height={380} rx={6} fill="#2F5D50" />
      <T x={870} y={260} s={56} w={900} c="#F2F4F0" o={0.9}>MATH · SURPRISE TEST</T>
      <T x={870} y={350} s={44} c="#F2F4F0" o={0.7}>x² − 5x + 6 = 0</T><T x={870} y={430} s={40} c="#F2F4F0" o={0.6}>20 questions · 30 minutes</T>
      <Window x={1500} y={150} w={340} h={400} /><Shafts x={1500} y={150} w={340} h={760} skew={-380} t={t} o={0.26} />
      <g transform="translate(200 250)"><circle r={78} fill="#F7F3EA" stroke="#2E3550" strokeWidth={10} /><line x1={0} y1={0} x2={0} y2={-52} stroke="#2E3550" strokeWidth={8} strokeLinecap="round" transform={`rotate(${t * 6})`} /><line x1={0} y1={0} x2={34} y2={0} stroke="#2E3550" strokeWidth={8} strokeLinecap="round" /></g>
    </Layer>
    <Layer>
      <Grad id="clsF" x={-200} y={780} w={2320} h={320} from="#C29A6E" to="#946E48" />
      {children}
    </Layer>
    <Layer d={1.25} blur={4}><Dust t={t} n={16} />{fg}</Layer>
  </>
);
export const Desk: React.FC<{ x: number; y: number; children?: React.ReactNode }> = ({ x, y, children }) => (
  <g>
    <GroundShadow x={x} y={y + 6} rx={230} />
    <rect x={x - 170} y={y - 190} width={18} height={190} fill="#7C8291" /><rect x={x + 152} y={y - 190} width={18} height={190} fill="#7C8291" />
    <rect x={x - 200} y={y - 222} width={400} height={38} rx={10} fill="#E3C79A" /><rect x={x - 200} y={y - 196} width={400} height={12} rx={6} fill="#B99A6C" />
    <g transform={`translate(${x} ${y - 222})`}>{children}</g>
  </g>
);
export const TestPaper: React.FC<{ grade: string; good: boolean; t: number; at: number }> = ({ grade, good, t, at }) => (
  <g>
    <g transform="scale(1 0.36)"><rect x={-80} y={-96} width={160} height={96} rx={4} fill="#FFFFFF" transform="skewX(-20)" />
    {[0, 1, 2, 3].map((i) => <line key={i} x1={-60} y1={-80 + i * 18} x2={50} y2={-80 + i * 18} stroke="#9AA3B5" strokeWidth={6} transform="skewX(-20)" />)}</g>
    {t > at && <g transform={`translate(150 -70) rotate(-8) scale(${Math.min(1.6, 3.6 - 2 * Math.min(1, (t - at) / 0.2))})`}><circle r={36} fill="#FFFFFF" /><circle r={32} fill="none" stroke={good ? "#2FA35A" : "#E0353F"} strokeWidth={7} /><T x={0} y={14} s={38} w={900} c={good ? "#2FA35A" : "#E0353F"}>{grade}</T></g>}
  </g>
);

// ---------- card shop ----------
export const Pack: React.FC<{ n?: number; c?: string; glow?: boolean; s?: number; open?: boolean }> = ({ n, c = "#5E78C9", glow, s = 1, open }) => (
  <g transform={`scale(${s})`}>
    {glow && <Bloom x={0} y={-36} r={110} color="#FFE14A" o={0.8} />}
    <rect x={-24} y={-72} width={48} height={72} rx={5} fill={c} stroke={glow ? "#FFE14A" : "none"} strokeWidth={5} />
    {open ? <path d="M -24 -72 l 8 10 l 8 -10 l 8 10 l 8 -10 l 8 10 l 8 -10 Z" fill="#161A28" opacity={0.4} /> : <rect x={-24} y={-72} width={48} height={12} rx={4} fill="#FFFFFF" opacity={0.35} />}
    <path d="M 0 -52 l 6 12 l 13 2 l -10 9 l 3 13 l -12 -7 l -12 7 l 3 -13 l -10 -9 l 13 -2 Z" fill="#FFE14A" opacity={0.9} />
    {n !== undefined && <T x={0} y={-6} s={15} w={900} c="#FFFFFF">{String(n)}</T>}
  </g>
);
export const RareCard: React.FC<{ s?: number; t: number }> = ({ s = 1, t }) => (
  <g transform={`scale(${s})`}>
    <Bloom x={0} y={0} r={240} color="#FFE14A" o={0.7} />
    {Array.from({ length: 10 }, (_, i) => <line key={i} x1={0} y1={0} x2={Math.cos(i * 0.628 + t * 0.5) * 230} y2={Math.sin(i * 0.628 + t * 0.5) * 230} stroke="#FFF3B0" strokeWidth={10} opacity={0.35} strokeLinecap="round" />)}
    <rect x={-74} y={-104} width={148} height={208} rx={12} fill="#FFD24A" stroke="#FFFFFF" strokeWidth={6} />
    <rect x={-60} y={-86} width={120} height={96} rx={6} fill="#6FC2E8" /><circle cx={0} cy={-40} r={30} fill="#FF8A3C" /><circle cx={-10} cy={-46} r={5} fill="#161A28" /><circle cx={12} cy={-46} r={5} fill="#161A28" /><path d="M -8 -30 q 8 8 18 0" stroke="#161A28" strokeWidth={4} fill="none" />
    <path d="M -22 -64 l -10 -22 l 20 10 Z M 22 -64 l 10 -22 l -20 10 Z" fill="#FF8A3C" />
    <T x={0} y={40} s={20} w={900} c="#7A4A00">HOLO · 1 OF 50</T>{[60, 76].map((y) => <line key={y} x1={-52} y1={y} x2={52} y2={y} stroke="#7A4A00" strokeWidth={4} opacity={0.4} />)}
    <rect x={-74} y={-104} width={148} height={208} rx={12} fill="#FFFFFF" opacity={0.25 + 0.2 * Math.sin(t * 3)} style={{ mixBlendMode: "overlay" }} />
  </g>
);
export const CardShop: React.FC<SetProps & { rack?: React.ReactNode }> = ({ t, children, fg, rack }) => (
  <>
    <Layer d={0.6} blur={2}>
      <Grad id="shopW" x={-200} y={0} w={2320} h={1000} from="#3A2F56" to="#57407A" />
      <g transform="translate(960 96)"><rect x={-360} y={-56} width={720} height={112} rx={20} fill="#161A28" stroke="#FF5CA8" strokeWidth={8} /><T x={0} y={18} s={62} w={900} c="#FFE14A">CARD KINGDOM</T><Bloom x={0} y={0} r={420} color="#FF5CA8" o={0.25 + 0.05 * Math.sin(t * 5)} /></g>
      {/* shelves of boxes and framed cards */}
      {[0, 1, 2].map((r) => <g key={r}><rect x={-100} y={300 + r * 150} width={720} height={18} rx={6} fill="#2A2140" />{Array.from({ length: 9 }, (_, i) => <rect key={i} x={-80 + i * 76} y={210 + r * 150 + (i % 2) * 14} width={62} height={90 - (i % 2) * 14} rx={6} fill={["#D9607A", "#5E78C9", "#E0A53C", "#5FA86A", "#9A76CC", "#4BA7B8"][(i + r) % 6]} />)}</g>)}
      {[0, 1, 2, 3, 4, 5].map((i) => <g key={i} transform={`translate(${1380 + (i % 3) * 190} ${250 + Math.floor(i / 3) * 250})`}><rect x={-70} y={-96} width={140} height={192} rx={8} fill="#161A28" /><rect x={-56} y={-82} width={112} height={164} rx={6} fill={["#FFD24A", "#6FC2E8", "#FF8A5C", "#9A76CC", "#5FA86A", "#D9607A"][i]} /><circle cx={0} cy={-20} r={30} fill="#FFFFFF" opacity={0.5} /><T x={0} y={64} s={22} w={900} c="#161A28">{["$40", "$15", "$90", "$25", "$8", "$60"][i]}</T></g>)}
    </Layer>
    <Layer>
      <Grad id="shopF" x={-200} y={780} w={2320} h={320} from="#6A4A3A" to="#3E2A22" />
      {rack}
      {children}
    </Layer>
    <Layer d={1.25} blur={4}><Dust t={t} n={18} color="#FFD6F0" />{fg}</Layer>
  </>
);
export const Counter: React.FC<{ x: number; y: number; w?: number; children?: React.ReactNode }> = ({ x, y, w = 640, children }) => (
  <g>
    <GroundShadow x={x} y={y + 4} rx={w * 0.62} />
    <Grad id={`cnt${x}`} x={x - w / 2} y={y - 250} w={w} h={250} from="#8A5A3C" to="#5E3A26" rx={10} />
    <rect x={x - w / 2 - 16} y={y - 270} width={w + 32} height={36} rx={10} fill="#C9905E" /><rect x={x - w / 2 + 30} y={y - 200} width={w - 60} height={130} rx={8} fill="#000" opacity={0.14} />
    <g transform={`translate(${x} ${y - 270})`}>{children}</g>
  </g>
);

// ---------- living room / kitchen ----------
export const LivingRoom: React.FC<SetProps & { tv: React.ReactNode }> = ({ t, children, fg, tv }) => (
  <>
    <Layer d={0.6} blur={1.6}>
      <Grad id="livW" x={-200} y={0} w={2320} h={1000} from="#3B3558" to="#544A78" />
      <rect x={1040} y={210} width={700} height={410} rx={16} fill="#11131E" /><g transform="translate(1060 228)"><clipPath id="tvclip"><rect width={660} height={374} rx={8} /></clipPath><g clipPath="url(#tvclip)">{tv}</g></g>
      <rect x={1340} y={620} width={100} height={60} fill="#11131E" /><rect x={1140} y={676} width={500} height={110} rx={10} fill="#6A4A3A" />
      <Bloom x={1390} y={410} r={620} color="#9FC8FF" o={0.28 + 0.04 * Math.sin(t * 9)} />
      <g transform="translate(330 300)"><rect x={-110} y={-140} width={220} height={280} rx={8} fill="#F7F3EA" /><rect x={-92} y={-122} width={184} height={244} fill="#E0A53C" /><circle cx={-30} cy={-10} r={40} fill="#F0BE9C" /><circle cx={44} cy={10} r={32} fill="#F0BE9C" /></g>
      <g transform="translate(700 560)"><rect x={-10} y={0} width={20} height={220} fill="#2A2140" /><path d="M -70 0 L 70 0 L 44 -110 L -44 -110 Z" fill="#FFD9A0" /><Bloom x={0} y={-30} r={300} color="#FFD9A0" o={0.4} /></g>
    </Layer>
    <Layer>
      <Grad id="livF" x={-200} y={780} w={2320} h={320} from="#4A3A52" to="#2E2438" />
      <ellipse cx={760} cy={980} rx={760} ry={110} fill="#D9607A" opacity={0.25} />
      {children}
    </Layer>
    <Layer d={1.25} blur={4}>{fg}</Layer>
  </>
);
export const Couch: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g>
    <GroundShadow x={x} y={y + 6} rx={420} />
    <rect x={x - 360} y={y - 330} width={720} height={250} rx={50} fill="#4B8F8A" /><rect x={x - 400} y={y - 240} width={110} height={230} rx={40} fill="#3F7C78" /><rect x={x + 290} y={y - 240} width={110} height={230} rx={40} fill="#3F7C78" />
    <rect x={x - 310} y={y - 190} width={620} height={120} rx={30} fill="#5FAAA4" /><rect x={x - 330} y={y - 90} width={660} height={70} rx={20} fill="#3F7C78" />
  </g>
);
export const Kitchen: React.FC<SetProps & { night?: boolean }> = ({ t, children, fg }) => (
  <>
    <Layer d={0.6} blur={1.8}>
      <Grad id="kitW" x={-200} y={0} w={2320} h={1000} from="#FBE9C8" to="#F3D29C" />
      {Array.from({ length: 30 }, (_, i) => <rect key={i} x={-190 + (i % 15) * 150} y={470 + Math.floor(i / 15) * 76} width={144} height={70} rx={6} fill="#FFFFFF" opacity={0.5} />)}
      <Window x={240} y={130} w={420} h={300} sky="#FFD9A8" /><Shafts x={240} y={130} w={420} h={700} t={t} o={0.3} color="#FFE2B0" />
      {[820, 1050, 1280, 1510].map((x, i) => <g key={x}><rect x={x} y={110} width={214} height={300} rx={10} fill={i % 2 ? "#6FB3A6" : "#7CC0B2"} /><rect x={x + 16} y={126} width={182} height={268} rx={6} fill="#000" opacity={0.06} /><rect x={x + (i % 2 ? 22 : 176)} y={320} width={12} height={50} rx={6} fill="#F7F3EA" /></g>)}
      <rect x={-200} y={620} width={2320} height={34} rx={8} fill="#F7F3EA" /><rect x={-200} y={654} width={2320} height={330} fill="#B98A5E" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => <g key={i}><rect x={-160 + i * 320} y={670} width={290} height={100} rx={8} fill="#C99A6C" /><rect x={-50 + i * 320} y={692} width={70} height={10} rx={5} fill="#F7F3EA" /></g>)}
      {/* stove */}
      <rect x={1240} y={590} width={300} height={36} rx={8} fill="#2A2D3C" /><ellipse cx={1390} cy={592} rx={100} ry={14} fill="#11131E" />
    </Layer>
    <Layer>
      <Grad id="kitF" x={-200} y={780} w={2320} h={320} from="#D9B48A" to="#A8845C" />
      {Array.from({ length: 16 }, (_, i) => <rect key={i} x={-200 + i * 150} y={784} width={146} height={316} fill="#FFFFFF" opacity={i % 2 ? 0.07 : 0} />)}
      {children}
    </Layer>
    <Layer d={1.25} blur={4}><Dust t={t} n={18} />{fg}</Layer>
  </>
);

// ---------- storage facility ----------
export const Storage: React.FC<SetProps & { open: (i: number) => number; inside?: (i: number) => React.ReactNode; hi?: number }> = ({ t, children, fg, open, inside, hi }) => (
  <>
    <Layer d={0.5} blur={2}>
      <Grad id="stoS" x={-200} y={0} w={2320} h={700} from="#8FC7EE" to="#E6F3FA" />
      {[200, 900, 1500].map((x, i) => <g key={x} opacity={0.9}><ellipse cx={x + Math.sin(t * 0.1 + i) * 30} cy={110 + i * 40} rx={190} ry={44} fill="#FFFFFF" /><ellipse cx={x + 110} cy={90 + i * 40} rx={120} ry={40} fill="#FFFFFF" /></g>)}
      <Bloom x={1700} y={90} r={520} color="#FFF1C2" o={0.7} />
    </Layer>
    <Layer>
      <rect x={-200} y={200} width={2320} height={90} fill="#D9434F" /><rect x={-200} y={280} width={2320} height={500} fill="#E9E4D8" />
      <T x={960} y={262} s={56} w={900}>U-STORE-IT · UNIT AUCTION TODAY</T>
      {Array.from({ length: 6 }, (_, k) => {
        const i = k + 4, x = 80 + k * 300, o = open(i);
        return (
          <g key={i}>
            <rect x={x - 8} y={352} width={266} height={428} fill="#B9B2A2" />
            <rect x={x} y={360} width={250} height={420} fill="#1B1E2B" />
            <g>{inside?.(i)}</g>
            <rect x={x} y={360} width={250} height={420} fill="#000" opacity={0.35 * (1 - o)} />
            <g><clipPath id={`door${i}`}><rect x={x} y={360} width={250} height={420 * (1 - o * 0.86)} /></clipPath>
              <g clipPath={`url(#door${i})`}><rect x={x} y={360} width={250} height={420} fill={i === hi ? "#F08A3C" : "#E0A53C"} />{Array.from({ length: 14 }, (_, r) => <rect key={r} x={x} y={360 + r * 30} width={250} height={6} fill="#000" opacity={0.12} />)}</g></g>
            <circle cx={x + 125} cy={322} r={28} fill="#161A28" /><T x={x + 125} y={334} s={32} w={900}>{String(i)}</T>
          </g>
        );
      })}
      <Grad id="stoF" x={-200} y={780} w={2320} h={320} from="#9AA0AA" to="#6E7480" />
      {Array.from({ length: 8 }, (_, i) => <line key={i} x1={-200 + i * 330} y1={780} x2={-560 + i * 420} y2={1100} stroke="#FFFFFF" strokeWidth={5} opacity={0.2} />)}
      {children}
    </Layer>
    <Layer d={1.25} blur={4}>{fg}<Dust t={t} n={14} o={0.35} /></Layer>
  </>
);
export const Arcade: React.FC<{ t: number; s?: number }> = ({ t, s = 1 }) => (
  <g transform={`scale(${s})`}>
    <path d="M -80 0 L -80 -330 L -50 -380 L 80 -380 L 80 0 Z" fill="#2B2F6A" /><path d="M 40 -380 L 80 -380 L 80 0 L 40 0 Z" fill="#1E2150" />
    <rect x={-66} y={-372} width={132} height={44} rx={6} fill="#FFE14A" /><T x={0} y={-340} s={24} w={900} c="#D9434F">STAR BLAST</T>
    <rect x={-62} y={-316} width={124} height={108} rx={8} fill="#0E1322" />
    {Array.from({ length: 6 }, (_, i) => <circle key={i} cx={-44 + ((i * 37 + t * 60) % 96)} cy={-300 + (i * 19) % 80} r={4} fill={["#FFE14A", "#FF5CA8", "#5BE0FF"][i % 3]} />)}
    <path d="M -74 -196 L 74 -196 L 80 -150 L -80 -150 Z" fill="#D9434F" /><circle cx={-34} cy={-180} r={12} fill="#161A28" /><rect x={-38} y={-206} width={8} height={26} fill="#161A28" /><circle cx={20} cy={-176} r={10} fill="#FFE14A" /><circle cx={50} cy={-176} r={10} fill="#5BE0FF" />
    <rect x={-40} y={-110} width={80} height={60} rx={6} fill="#1E2150" /><rect x={-8} y={-96} width={16} height={30} rx={4} fill="#FFE14A" />
    <Bloom x={0} y={-262} r={150} color="#7FE0FF" o={0.5} />
  </g>
);

// ---------- aquarium ----------
export const Octopus: React.FC<{ t: number; s?: number }> = ({ t, s = 1 }) => (
  <g transform={`scale(${s}) translate(0 ${Math.sin(t * 1.1) * 14})`}>
    {Array.from({ length: 8 }, (_, i) => {
      const a = -70 + i * 20, w = Math.sin(t * 1.6 + i * 0.9) * 26;
      return <path key={i} d={`M ${a * 0.9} 40 C ${a * 1.4 + w} 120 ${a * 2 - w} 190 ${a * 2.4 + w * 1.5} 260`} stroke={i % 2 ? "#F0795C" : "#E86A4E"} strokeWidth={30 - i % 3 * 3} strokeLinecap="round" fill="none" />;
    })}
    <ellipse cx={0} cy={-30} rx={110} ry={120} fill="#F0795C" /><ellipse cx={-36} cy={-74} rx={40} ry={50} fill="#FFFFFF" opacity={0.18} />
    <ellipse cx={-38} cy={10} rx={20} ry={24} fill="#FFFFFF" /><ellipse cx={38} cy={10} rx={20} ry={24} fill="#FFFFFF" /><rect x={-48} y={6} width={20} height={9} rx={4} fill="#161A28" /><rect x={28} y={6} width={20} height={9} rx={4} fill="#161A28" />
    {[[-60, -90], [50, -100], [0, -120], [70, -40]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={7} fill="#D9553C" />)}
  </g>
);
export const Aquarium: React.FC<SetProps> = ({ t, children, fg, far }) => (
  <>
    <Layer d={0.5} blur={1.5}>
      <Grad id="aqW" x={-200} y={0} w={2320} h={1100} from="#0B2A5A" to="#0A1838" />
      <rect x={60} y={90} width={1800} height={650} rx={30} fill="#0E1E44" />
      <Grad id="aqT" x={90} y={120} w={1740} h={590} from="#2F9FD6" to="#135C9E" rx={16} />
      {Array.from({ length: 7 }, (_, i) => <polygon key={i} points={`${160 + i * 250},120 ${260 + i * 250},120 ${330 + i * 250 + Math.sin(t * 0.7 + i) * 50},710 ${130 + i * 250 + Math.sin(t * 0.7 + i) * 50},710`} fill="#BFF0FF" opacity={0.1} />)}
      {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M ${200 + i * 380} 710 q ${Math.sin(t + i) * 30} -90 0 -180 q ${-Math.sin(t + i) * 30} -70 10 -130`} stroke="#3FBF8A" strokeWidth={22} strokeLinecap="round" fill="none" opacity={0.8} />)}
      {Array.from({ length: 9 }, (_, i) => { const x = (i * 260 + t * (30 + (i % 3) * 14)) % 1700 + 100, y = 200 + ((i * 97) % 380) + Math.sin(t * 2 + i) * 10; return <g key={i} transform={`translate(${x} ${y})`}><ellipse rx={26} ry={13} fill={["#FFD24A", "#FF8A5C", "#BFE0FF"][i % 3]} /><path d="M -24 0 l -20 -14 l 0 28 Z" fill={["#FFD24A", "#FF8A5C", "#BFE0FF"][i % 3]} /><circle cx={12} cy={-3} r={3} fill="#161A28" /></g>; })}
      {Array.from({ length: 16 }, (_, i) => <circle key={i} cx={140 + rnd(i) * 1650} cy={710 - ((t * (30 + rnd(i + 3) * 40) + rnd(i + 8) * 590) % 590)} r={4 + rnd(i + 2) * 6} fill="none" stroke="#DFF6FF" strokeWidth={3} opacity={0.6} />)}
      <rect x={90} y={660} width={1740} height={50} fill="#D9C08A" opacity={0.6} />
      {far}
      <g transform="translate(960 60)"><rect x={-260} y={-34} width={520} height={64} rx={12} fill="#0E1E44" stroke="#5BE0FF" strokeWidth={5} /><T x={0} y={12} s={36} w={900} c="#BFF0FF">GIANT PACIFIC OCTOPUS</T></g>
    </Layer>
    <Layer>
      <Grad id="aqF" x={-200} y={740} w={2320} h={360} from="#16264E" to="#0A1230" />
      <ellipse cx={960} cy={800} rx={900} ry={60} fill="#5BC8F0" opacity={0.18} />
      {children}
    </Layer>
    <Layer d={1.2} blur={3}>
      <g style={{ mixBlendMode: "screen" }}>{Array.from({ length: 6 }, (_, i) => <ellipse key={i} cx={200 + i * 320 + Math.sin(t * 0.8 + i) * 60} cy={960 + Math.cos(t * 0.6 + i) * 30} rx={150} ry={26} fill="#5BC8F0" opacity={0.12} />)}</g>
      {fg}
    </Layer>
  </>
);
export const Bench: React.FC<{ x: number; y: number; w?: number }> = ({ x, y, w = 560 }) => (
  <g><GroundShadow x={x} y={y + 4} rx={w * 0.6} /><rect x={x - w / 2 + 30} y={y - 110} width={22} height={110} fill="#2A2D3C" /><rect x={x + w / 2 - 52} y={y - 110} width={22} height={110} fill="#2A2D3C" /><rect x={x - w / 2} y={y - 136} width={w} height={34} rx={10} fill="#6E7FA8" /></g>
);

// ---------- TV studio ----------
export const Studio: React.FC<SetProps & { screen: React.ReactNode; cheer?: boolean; dim?: number }> = ({ t, children, fg, screen, cheer, dim = 0 }) => (
  <>
    <Layer d={0.5} blur={1.6}>
      <Grad id="stuW" x={-200} y={0} w={2320} h={1100} from="#120B2E" to="#2A1458" />
      {Array.from({ length: 9 }, (_, i) => <rect key={i} x={-120 + i * 260} y={0} width={10} height={760} fill="#FF5CA8" opacity={0.18} />)}
      {/* the big screen */}
      <rect x={520} y={110} width={880} height={430} rx={24} fill="#0A0C1A" stroke="#FFC83A" strokeWidth={10} />
      <g transform="translate(540 130)"><clipPath id="stuclip"><rect width={840} height={390} rx={12} /></clipPath><g clipPath="url(#stuclip)"><rect width={840} height={390} fill="#1A1F4A" />{screen}</g></g>
      <Bloom x={960} y={325} r={700} color="#8FA8FF" o={0.3} />
      {[150, 1770].map((x, i) => <g key={x}><rect x={x - 90} y={180} width={180} height={420} rx={16} fill="#1E1650" stroke="#FF5CA8" strokeWidth={6} /><T x={x} y={300} s={86} w={900} c="#FFE14A">$1M</T><T x={x} y={360} s={24} w={900} c="#FFFFFF">QUESTION</T>{[0, 1, 2, 3, 4].map((k) => <circle key={k} cx={x} cy={420 + k * 34} r={10} fill={Math.floor(t * 4 + k + i) % 5 === 0 ? "#FFE14A" : "#5B3FA8"} />)}</g>)}
      {/* spotlights */}
      {[300, 700, 1220, 1620].map((x, i) => <g key={x}><rect x={x - 30} y={-10} width={60} height={50} rx={10} fill="#11131E" /><g style={{ mixBlendMode: "screen" }}><polygon points={`${x - 24},40 ${x + 24},40 ${x + 260 + Math.sin(t * 0.8 + i * 2) * 160},1000 ${x - 260 + Math.sin(t * 0.8 + i * 2) * 160},1000`} fill={["#FFE9B8", "#FF8AD0", "#8FD0FF", "#FFE9B8"][i]} opacity={0.1 * (1 - dim)} /></g></g>)}
    </Layer>
    <Layer>
      {/* audience rows in silhouette behind the stage */}
      <g opacity={0.9}>{[0, 1].map((r) => Array.from({ length: 22 }, (_, i) => { const x = -60 + i * 96 + r * 44, b = cheer ? Math.abs(Math.sin(t * 8 + i * 1.7 + r)) * 22 : Math.sin(t * 1.5 + i) * 2; return <g key={`${r}${i}`} transform={`translate(${x} ${650 + r * 50 - b})`}><circle r={30} fill={r ? "#2C1E5E" : "#22164C"} /><rect x={-36} y={22} width={72} height={90} rx={26} fill={r ? "#2C1E5E" : "#22164C"} />{cheer && <g stroke={r ? "#2C1E5E" : "#22164C"} strokeWidth={14} strokeLinecap="round"><line x1={-30} y1={30} x2={-46} y2={-34} /><line x1={30} y1={30} x2={46} y2={-34} /></g>}</g>; }))}</g>
      <Grad id="stuF" x={-200} y={770} w={2320} h={330} from="#3A2A8A" to="#1A1040" />
      <ellipse cx={960} cy={900} rx={820} ry={110} fill="#6C4CE0" opacity={0.5} /><ellipse cx={960} cy={900} rx={820} ry={110} fill="none" stroke="#FFC83A" strokeWidth={8} opacity={0.8} />
      <ellipse cx={960} cy={900} rx={560} ry={70} fill="#FFFFFF" opacity={0.08} />
      {children}
      <rect x={-200} y={0} width={2320} height={1100} fill="#05030F" opacity={dim * 0.55} />
    </Layer>
    <Layer d={1.25} blur={4}>
      {[[-40, 1], [1960, -1]].map(([x, s]) => <g key={x} transform={`translate(${x} 1100) scale(${s} 1)`}><rect x={-30} y={-420} width={60} height={420} fill="#0A0C1A" /><rect x={-140} y={-520} width={300} height={170} rx={24} fill="#11131E" /><circle cx={150} cy={-436} r={60} fill="#1F2440" /><circle cx={150} cy={-436} r={34} fill="#5BC8F0" opacity={0.6} /><circle cx={-110} cy={-496} r={9} fill="#FF4B4B" opacity={0.5 + 0.5 * Math.sin(t * 6)} /></g>)}
      {fg}
    </Layer>
  </>
);
export const Podium: React.FC<{ x: number; y: number; label?: string }> = ({ x, y, label = "$1M" }) => (
  <g><GroundShadow x={x} y={y + 4} rx={150} /><path d={`M ${x - 90} ${y} L ${x - 70} ${y - 240} L ${x + 70} ${y - 240} L ${x + 90} ${y} Z`} fill="#2A1E6A" stroke="#FFC83A" strokeWidth={6} /><rect x={x - 96} y={y - 262} width={192} height={30} rx={8} fill="#FFC83A" /><T x={x} y={y - 120} s={48} w={900} c="#FFE14A">{label}</T></g>
);
export const Envelope: React.FC<{ s?: number; open?: number; label?: string }> = ({ s = 1, open = 0, label = "SEALED" }) => (
  <g transform={`scale(${s})`}>
    <rect x={-90} y={-58} width={180} height={116} rx={8} fill="#F7EEDA" stroke="#C9B48A" strokeWidth={4} />
    <path d={`M -90 -58 L 0 ${-58 + 70 * (1 - open * 2)} L 90 -58`} fill={open > 0.5 ? "#E6D9B8" : "#EFE3C6"} stroke="#C9B48A" strokeWidth={4} strokeLinejoin="round" />
    {open < 0.5 && <g><circle cx={0} cy={4} r={24} fill="#D9434F" /><circle cx={0} cy={4} r={15} fill="none" stroke="#FFFFFF" strokeWidth={3} opacity={0.6} /><T x={0} y={12} s={20} w={900}>$</T></g>}
    <T x={0} y={46} s={18} w={900} c="#8A6A3C" ls={3}>{label}</T>
  </g>
);

// ---------- hospital, street, backstage ----------
export const Hospital: React.FC<SetProps & { clock: number }> = ({ t, children, fg, clock }) => (
  <>
    <Layer d={0.6} blur={1.6}>
      <Grad id="hosW" x={-200} y={0} w={2320} h={1000} from="#CFE2E6" to="#B4CED4" />
      <rect x={-200} y={470} width={2320} height={20} fill="#7FB0B8" /><rect x={-200} y={490} width={2320} height={480} fill="#A9C6CC" />
      <g transform="translate(1440 110)"><rect x={-250} y={0} width={500} height={110} rx={12} fill="#D9434F" /><T x={0} y={72} s={56} w={900}>SURGERY</T><circle cx={-200} cy={55} r={14} fill="#FFFFFF" opacity={0.5 + 0.5 * Math.sin(t * 4)} /></g>
      <rect x={1240} y={250} width={400} height={680} rx={8} fill="#8FB0B8" /><rect x={1436} y={250} width={8} height={530} fill="#6E929A" /><rect x={1290} y={320} width={110} height={150} rx={8} fill="#DDF0F4" /><rect x={1480} y={320} width={110} height={150} rx={8} fill="#DDF0F4" />
      <g transform="translate(520 240)"><circle r={110} fill="#F7F3EA" stroke="#2E3550" strokeWidth={12} />{Array.from({ length: 12 }, (_, i) => <line key={i} x1={0} y1={-92} x2={0} y2={-78} stroke="#2E3550" strokeWidth={6} transform={`rotate(${i * 30})`} />)}<line x1={0} y1={0} x2={0} y2={-54} stroke="#2E3550" strokeWidth={10} strokeLinecap="round" transform={`rotate(${clock * 30})`} /><line x1={0} y1={0} x2={0} y2={-82} stroke="#D9434F" strokeWidth={7} strokeLinecap="round" transform={`rotate(${clock * 360})`} /></g>
      {[150, 1000].map((x) => <g key={x}><rect x={x - 80} y={40} width={160} height={24} rx={8} fill="#FFFFFF" /><Bloom x={x} y={60} r={300} color="#EAF8FF" o={0.4} /></g>)}
    </Layer>
    <Layer>
      <Grad id="hosF" x={-200} y={780} w={2320} h={320} from="#C9D8DC" to="#8FA6AC" />
      <ellipse cx={900} cy={900} rx={700} ry={50} fill="#FFFFFF" opacity={0.2} />
      {[0, 1, 2, 3].map((i) => <g key={i} transform={`translate(${520 + i * 190} 960)`}><rect x={-80} y={-290} width={160} height={150} rx={18} fill="#5E8FB8" /><rect x={-86} y={-150} width={172} height={40} rx={12} fill="#6FA0C8" /><rect x={-70} y={-110} width={14} height={110} fill="#7C8291" /><rect x={56} y={-110} width={14} height={110} fill="#7C8291" /></g>)}
      {children}
    </Layer>
    <Layer d={1.25} blur={4}>{fg}</Layer>
  </>
);
export const Street: React.FC<SetProps & { light: "red" | "green"; dusk?: boolean }> = ({ t, children, fg, light }) => (
  <>
    <Layer d={0.4} blur={1.4}>
      <Grad id="strS" x={-200} y={0} w={2320} h={1000} from="#3B2A6A" to="#F08A5C" />
      <circle cx={1500} cy={560} r={120} fill="#FFD9A0" /><Bloom x={1500} y={560} r={520} color="#FFB36B" o={0.7} />
      {Array.from({ length: 11 }, (_, i) => { const x = -160 + i * 210, h = 260 + ((i * 97) % 240); return <g key={i}><rect x={x} y={760 - h} width={190} height={h} fill={i % 2 ? "#2A2050" : "#34285E"} />{Array.from({ length: 12 }, (_, k) => <rect key={k} x={x + 22 + (k % 3) * 54} y={760 - h + 30 + Math.floor(k / 3) * 60} width={32} height={36} rx={4} fill="#FFD98A" opacity={rnd(i * 13 + k) > 0.45 ? 0.9 : 0.12} />)}</g>; })}
      <rect x={-200} y={750} width={2320} height={250} fill="#8E8AA0" />
    </Layer>
    <Layer>
      <rect x={-200} y={740} width={2320} height={70} fill="#8E8AA0" /><rect x={-200} y={800} width={2320} height={300} fill="#3A3850" />
      <rect x={760} y={800} width={400} height={300} fill="#44425C" />
      {Array.from({ length: 9 }, (_, i) => <rect key={i} x={-160 + i * 270} y={930} width={150} height={14} rx={7} fill="#F2F4F8" opacity={0.8} />)}
      {[790, 850, 910, 970, 1030, 1090].map((x) => <rect key={x} x={x} y={812} width={34} height={96} fill="#F2F4F8" opacity={0.7} />)}
      {/* traffic light */}
      <rect x={1228} y={380} width={16} height={380} fill="#1B1E2B" /><rect x={1196} y={300} width={80} height={200} rx={18} fill="#1B1E2B" />
      {(["red", "amber", "green"] as const).map((c, i) => <circle key={c} cx={1236} cy={340 + i * 60} r={22} fill={c === light ? (c === "red" ? "#FF3B3B" : "#3BE07A") : "#3A3F52"} />)}
      <Bloom x={1236} y={light === "red" ? 340 : 460} r={150} color={light === "red" ? "#FF3B3B" : "#3BE07A"} o={0.7} />
      <rect x={300} y={470} width={14} height={290} fill="#1B1E2B" /><rect x={230} y={430} width={160} height={50} rx={8} fill="#2F8A5A" /><T x={310} y={466} s={30} w={900}>ROUTE 9</T>
      {children}
    </Layer>
    <Layer d={1.25} blur={4}>{fg}<Dust t={t} n={10} o={0.3} color="#FFD9A0" /></Layer>
  </>
);
export const Truck: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => (
  <g transform={`translate(${x} ${y + Math.sin(t * 40) * 2})`}>
    <GroundShadow x={0} y={4} rx={420} />
    <rect x={-380} y={-330} width={520} height={280} rx={10} fill="#E9ECF2" /><rect x={-380} y={-330} width={520} height={50} fill="#D9434F" /><T x={-120} y={-170} s={64} w={900} c="#D9434F">FREIGHT</T>
    <path d="M 140 -260 L 300 -260 L 372 -160 L 372 -50 L 140 -50 Z" fill="#D9434F" /><path d="M 170 -236 L 286 -236 L 340 -160 L 170 -160 Z" fill="#BFE4F7" />
    <rect x={352} y={-110} width={30} height={30} rx={6} fill="#FFF1B8" /><Bloom x={380} y={-95} r={220} color="#FFF1B8" o={0.7} />
    {[-260, -150, 250].map((w) => <g key={w}><circle cx={w} cy={-40} r={50} fill="#1B1E2B" /><circle cx={w} cy={-40} r={22} fill="#9AA3B5" /><line x1={w - 22} y1={-40} x2={w + 22} y2={-40} stroke="#1B1E2B" strokeWidth={6} transform={`rotate(${t * 900} ${w} -40)`} /></g>)}
    {[0, 1, 2].map((i) => <line key={i} x1={-400 - i * 50} y1={-260 + i * 70} x2={-560 - i * 70} y2={-260 + i * 70} stroke="#FFFFFF" strokeWidth={8} strokeLinecap="round" opacity={0.5} />)}
  </g>
);
export const Car: React.FC<{ x: number; y: number; t: number; driver?: React.ReactNode; flip?: boolean }> = ({ x, y, t, flip }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`}>
    <GroundShadow x={0} y={4} rx={250} />
    <path d="M -220 -60 L -200 -120 L -120 -130 L -70 -200 L 80 -200 L 140 -130 L 210 -116 L 224 -60 Z" fill="#D8607A" /><path d="M -56 -186 L 10 -186 L 10 -134 L -96 -134 Z M 26 -186 L 72 -186 L 116 -134 L 26 -134 Z" fill="#BFE4F7" />
    <rect x={196} y={-104} width={28} height={20} rx={6} fill="#FFF1B8" /><Bloom x={224} y={-94} r={150} color="#FFF1B8" o={0.6} />
    {[-130, 130].map((w) => <g key={w}><circle cx={w} cy={-50} r={44} fill="#1B1E2B" /><circle cx={w} cy={-50} r={20} fill="#C9CED8" /><line x1={w - 20} y1={-50} x2={w + 20} y2={-50} stroke="#1B1E2B" strokeWidth={5} transform={`rotate(${t * 600} ${w} -50)`} /></g>)}
  </g>
);
export const Backstage: React.FC<SetProps> = ({ t, children, fg }) => (
  <>
    <Layer d={0.6} blur={1.8}>
      <Grad id="bkW" x={-200} y={0} w={2320} h={1000} from="#1A1430" to="#2E2450" />
      {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M ${-200 + i * 110} 0 q 30 400 0 780 l 110 0 q -30 -380 0 -780 Z`} fill={i % 2 ? "#7A1E3A" : "#8E2444"} />)}
      <rect x={-200} y={770} width={1480} height={200} fill="#7A1E3A" />
      <rect x={1280} y={0} width={840} height={780} fill="#1E1838" />
      <g transform="translate(1640 170)"><rect x={-110} y={-44} width={220} height={88} rx={12} fill="#0E3A22" stroke="#3BE07A" strokeWidth={5} /><T x={0} y={18} s={52} w={900} c="#6BFFA6">EXIT</T><Bloom x={0} y={0} r={300} color="#3BE07A" o={0.35} /></g>
      <g transform="translate(1500 420)"><rect x={-150} y={-120} width={300} height={240} rx={14} fill="#F7F3EA" />{Array.from({ length: 10 }, (_, i) => <g key={i}><circle cx={i < 5 ? -130 + i * 65 : -130 + (i - 5) * 65} cy={i < 5 ? -104 : 104} r={12} fill="#FFE9B8" /><Bloom x={i < 5 ? -130 + i * 65 : -130 + (i - 5) * 65} y={i < 5 ? -104 : 104} r={50} color="#FFE9B8" o={0.6} /></g>)}<rect x={-120} y={-88} width={240} height={176} fill="#BFD4E6" /></g>
      <Bloom x={300} y={300} r={600} color="#FFC83A" o={0.22} />
    </Layer>
    <Layer>
      <Grad id="bkF" x={-200} y={780} w={2320} h={320} from="#3A3050" to="#1E1830" />
      <g transform="translate(1720 960)"><rect x={-150} y={-190} width={300} height={190} rx={10} fill="#2A2D3C" stroke="#9AA3B5" strokeWidth={6} /><rect x={-150} y={-110} width={300} height={10} fill="#9AA3B5" /><T x={0} y={-40} s={34} w={900} c="#9AA3B5">CABLES</T><circle cx={-110} cy={10} r={22} fill="#11131E" /><circle cx={110} cy={10} r={22} fill="#11131E" /></g>
      {children}
    </Layer>
    <Layer d={1.25} blur={4}><Dust t={t} n={16} color="#FFD9A0" />{fg}</Layer>
  </>
);
