// "What If You Lived Every Day Twice?" (episode 9). First episode on the v2 kit: every scene is a lit set
// with several camera framings (wide, two-shot, close-up) cut inside it. Timed from public/twice/timeline.json.
// Motif: TAKE 1 (practice: drained, blue, dashed frame) vs TAKE 2 (real: warm, full colour), shown by the
// clapper badge top-left; a rewind glitch marks midnight. Clarity rule: youtube/motion.md.
import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import timeline from "../../public/twice/timeline.json";
import lips from "../../public/twice/lips.json";
import { ease, pop, Lip, useT } from "../ll/kit";
import { World, Layer, Vignette, Grain, Bloom, Grad, Cam, lerp, keys, font, Person, pose, walk, poseAt, Mood, Captions, Tag, Slam, YOU, THEO, AVA, MOM, HOST, OWNER, TEACHER, PRINCIPAL, extra, GroundShadow, rnd, Look } from "../v2/kit";
import { T, Flowers, PhoneUp, Clapper, Crowd, Cafeteria, LunchTable, Bedroom, Hallway, Classroom, Desk, TestPaper, Pack, RareCard, CardShop, Counter, LivingRoom, Couch, Kitchen, Storage, Arcade, Octopus, Aquarium, Bench, Studio, Podium, Envelope, Hospital, Street, Truck, Car, Backstage } from "./sets";

type Line = (typeof timeline.lines)[number];
const L: Line[] = timeline.lines;
export const DURATION = timeline.duration;
const S = (i: number) => L[i].start;
const E = (i: number) => L[i].end;
const F = (i: number, f: number) => S(i) + (E(i) - S(i)) * f; // the moment a fraction of the way through line i
const first = (scene: string) => L.findIndex((l) => l.scene === scene);
const speaking = (t: number, who: string) => L.some((l) => l.who === who && t >= l.start && t <= l.end);
const say = (t: number, who: string): { talk: boolean; lip?: Lip } => {
  const on = speaking(t, who), f = Math.round(t * 30);
  if (!on || !lips.shape[f]) return { talk: on };
  return { talk: on, lip: { o: Number(lips.open[f]) / 9, v: lips.shape[f] } };
};
const at = <V,>(t: number, list: [number, V][]): V => { let v = list[0][1]; for (const [a, x] of list) if (t >= a) v = x; return v; };
type Seg = [number, Cam, Cam?];
// hard cuts between framings; each framing drifts (a slow push-in by default) so nothing is ever still
const cuts = (t: number, segs: Seg[], end: number): Cam => {
  let k = 0;
  for (let i = 0; i < segs.length; i++) if (t >= segs[i][0]) k = i;
  const [a0, a, b = { x: a.x, y: a.y, z: a.z * 1.07 }] = segs[k], a1 = k + 1 < segs.length ? segs[k + 1][0] : end;
  const q = Math.min(1, Math.max(0, (t - a0) / Math.max(0.1, a1 - a0)));
  return { x: lerp(a.x, b.x, q), y: lerp(a.y, b.y, q), z: lerp(a.z, b.z, q) };
};
const C = (x: number, y: number, z: number): Cam => ({ x, y, z });
const WIDE = C(960, 540, 1);

// ---------- frame: grading per take, light, grain ----------
const Frame: React.FC<{ t: number; cam: Cam; take?: 0 | 1 | 2; shake?: number; fade?: number; children: React.ReactNode }> = ({ t, cam, take = 0, shake = 0, children }) => (
  <AbsoluteFill>
    <AbsoluteFill style={{ filter: take === 1 ? "saturate(0.5) contrast(0.95) brightness(1.05)" : take === 2 ? "saturate(1.12) contrast(1.03)" : undefined }}>
      <World cam={cam} shake={shake} t={t}>{children}</World>
    </AbsoluteFill>
    {take === 1 && <AbsoluteFill style={{ background: "#5F84E0", mixBlendMode: "soft-light", opacity: 0.4 }} />}
    {take === 2 && <AbsoluteFill style={{ background: "#FFB85C", mixBlendMode: "soft-light", opacity: 0.14 }} />}
    <Vignette o={take === 1 ? 0.6 : 0.45} /><Grain t={t} o={take === 1 ? 0.16 : 0.09} />
    {take === 1 && <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}><rect x={22} y={22} width={1876} height={1036} rx={26} fill="none" stroke="#DCE6FF" strokeWidth={6} strokeDasharray="30 22" strokeDashoffset={-t * 40} opacity={0.55} /></svg>}
  </AbsoluteFill>
);
// the clapper: slams in the middle when a take starts (big), then lives in the top-left corner
const TakeHud: React.FC<{ t: number; take: 1 | 2; from: number; big?: boolean }> = ({ t, take, from, big = false }) => {
  if (t < from) return null;
  const k = big ? ease(t, from + 0.6, from + 0.95) : 1;
  const s = lerp(2.3, 0.44, k) * (big ? Math.min(1, 0.4 + pop(t, from)) : Math.min(1, pop(t, from)));
  return (
    <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
      {big && k < 1 && <rect width={1920} height={1080} fill="#05060F" opacity={0.5 * (1 - k)} />}
      <g transform={`translate(${lerp(960, 124, k)} ${lerp(500, 92, k)}) scale(${s})`}><Clapper take={take} t={t} at={from + 0.14} /></g>
    </svg>
  );
};
// midnight: scanlines tearing sideways, the picture underneath is played backwards by the caller
const Rewind: React.FC<{ t: number; from: number; to: number; label?: string }> = ({ t, from, to, label = "MIDNIGHT" }) => {
  if (t < from || t > to) return null;
  const q = (t - from) / (to - from);
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 14 }, (_, i) => { const y = (rnd(i + Math.floor(t * 18)) * 1080); return <rect key={i} x={0} y={y} width={1920} height={8 + rnd(i * 3 + Math.floor(t * 18)) * 46} fill={i % 3 ? "#DCE6FF" : "#5F84E0"} opacity={0.22} />; })}
        <rect width={1920} height={1080} fill="#0B1030" opacity={0.3 + 0.2 * Math.sin(q * Math.PI)} />
        <g transform="translate(960 470)">
          <circle r={150} fill="#0B0E1A" opacity={0.85} stroke="#DCE6FF" strokeWidth={10} />
          <line x1={0} y1={0} x2={0} y2={-70} stroke="#FFFFFF" strokeWidth={12} strokeLinecap="round" transform={`rotate(${-q * 360})`} />
          <line x1={0} y1={0} x2={0} y2={-112} stroke="#FF5C5C" strokeWidth={8} strokeLinecap="round" transform={`rotate(${-q * 360 * 12})`} />
          <circle r={12} fill="#FFFFFF" />
        </g>
        <text x={960} y={720} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={84} fill="#FFFFFF" stroke="#0B0E1A" strokeWidth={14} paintOrder="stroke">{`◀◀  ${label}`}</text>
      </svg>
    </AbsoluteFill>
  );
};
const Flash: React.FC<{ t: number; at: number; c?: string; d?: number }> = ({ t, at: a, c = "#FFFFFF", d = 0.35 }) => (t < a || t > a + d ? null : <AbsoluteFill style={{ background: c, opacity: 1 - (t - a) / d }} />);
// a card that pops over the scene (screen space): fact cards, phone videos, emails
const Card: React.FC<{ t: number; from: number; to?: number; x: number; y: number; w: number; h: number; rot?: number; bg?: string; children: React.ReactNode }> = ({ t, from, to = 1e9, x, y, w, h, rot = 0, bg = "#FFFFFF", children }) => {
  if (t < from || t > to) return null;
  const k = pop(t, from), out = ease(t, to - 0.2, to);
  return (
    <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
      <g transform={`translate(${x} ${y + (1 - k) * 60 + out * 40}) rotate(${rot}) scale(${0.7 + 0.3 * k})`} opacity={Math.min(1, k * 2) * (1 - out)}>
        <rect x={-w / 2 + 10} y={-h / 2 + 16} width={w} height={h} rx={28} fill="#05060F" opacity={0.45} />
        <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={28} fill={bg} stroke="#0B0E1A" strokeWidth={7} />
        {children}
      </g>
    </svg>
  );
};
const money = (t: number) => {
  const i = (text: string) => L.findIndex((l) => l.text.startsWith(text));
  const a = i("Pack 31"), b = i("The arcade machine"), c = i("By week 3"), d = i("1 million dollars. Theo");
  return keys(t, [[S(a), 0], [E(a), 2800], [F(b, 0.3), 2800], [F(b, 0.45), 11800], [S(c), 11800], [F(c, 0.5), 41000], [S(d), 41000], [F(d, 0.3), 1041000]]);
};
const Money: React.FC<{ t: number }> = ({ t }) => {
  const v = money(t), i0 = L.findIndex((l) => l.text.startsWith("Pack 31"));
  if (t < E(i0) - 0.4) return null;
  const moving = Math.abs(money(t + 0.05) - v) > 1;
  return (
    <div style={{ position: "absolute", right: 44, top: 40, padding: "10px 30px", borderRadius: 26, background: "rgba(11,14,26,0.9)", border: `5px solid ${moving ? "#FFE14A" : "#3BE07A"}`, fontFamily: font, fontWeight: 900, fontSize: 56,
      color: moving ? "#FFE14A" : "#6BFFA6", fontVariantNumeric: "tabular-nums", transform: `scale(${moving ? 1.12 : 1})`, transformOrigin: "right top" }}>${Math.round(v).toLocaleString("en-US")}</div>
  );
};
const Chip: React.FC<{ t: number; from: number; to?: number; text: string }> = ({ t, from, to = 1e9, text }) => {
  if (t < from || t > to) return null;
  const k = pop(t, from);
  return <div style={{ position: "absolute", left: 250, top: 62, padding: "10px 26px", borderRadius: 20, background: "rgba(11,14,26,0.88)", color: "#FFFFFF", fontFamily: font, fontWeight: 900, fontSize: 36, letterSpacing: 2, transform: `translateX(${(1 - k) * -60}px)`, opacity: Math.min(1, k * 2) }}>{text}</div>;
};
type ShotProps = { t: number; t0: number; t1: number };
const Backpack = <g><rect x={-62} y={-360} width={124} height={160} rx={34} fill="#F2B640" /><rect x={-40} y={-300} width={80} height={70} rx={14} fill="#D99A2A" /></g>;
const Bill: React.FC<{ v: string }> = ({ v }) => <g transform="rotate(-20)"><rect x={-34} y={-58} width={68} height={36} rx={5} fill="#7BC98A" stroke="#2F7A4A" strokeWidth={4} /><T x={0} y={-32} s={22} w={900} c="#1F5A34">{v}</T></g>;

// ---------- 1. cold open: the table, the "no", the rewind ----------
const ColdOpen: React.FC<ShotProps> = ({ t, t1 }) => {
  const a = first("cold_open");
  const rw0 = S(a + 4), rw1 = S(a + 4) + 1.5; // the rewind
  const bed = t >= rw1;
  if (!bed) {
    const tt = t < rw0 ? t : rw0 - (t - rw0) * 5; // played backwards during the rewind
    const cam = cuts(tt, [[0, C(1150, 380, 1.4), C(1150, 400, 1.6)], [S(a + 1), WIDE, C(960, 520, 1.12)], [S(a + 2), C(520, 560, 2.0)], [S(a + 3), C(960, 300, 2.2), C(960, 250, 2.9)]], rw0);
    const no = pop(tt, 0.05);
    const youMood: Mood = tt < S(a + 3) - 0.2 ? "shocked" : "smug";
    const practice = tt >= F(a + 3, 0.55);
    return (
      <AbsoluteFill>
        <Frame t={t} cam={cam} take={practice ? 1 : 0} shake={tt < 0.5 ? 1 - tt * 2 : 0}>
          <Cafeteria t={tt}>
            <LunchTable x={960} y={650} />
            <Person x={560} y={985} look={THEO} mood={tt < S(a + 2) ? "shocked" : "worried"} t={tt} p={tt >= S(a + 2) - 0.2 ? pose("facepalm", { turn: 0.5 }) : pose({ turn: 0.6, head: -6 })} lookX={0.7} lookY={-0.6} {...say(tt, "THEO")} seed={2} />
            <Person x={1340} y={985} look={AVA} mood="deadpan" t={tt} p={pose("hips", { turn: -0.5 })} flip lookX={0.7} lookY={-0.5} seed={3} behind={Backpack} />
            <Person x={960} y={650} look={YOU} mood={youMood} t={tt} s={0.92} p={tt < S(a + 3) - 0.2 ? pose("holdUp", { turn: 0.5, aL: 30, eL: 30 }) : pose("holdUp", { aR: 100, eR: 30, turn: 0.2 })} lookX={0.5} hold={<Flowers s={1.1} />} seed={1} sweat={tt < S(a + 3) - 0.2} />
            {/* her answer */}
            <g transform={`translate(1470 330) scale(${no}) rotate(4)`}>
              <path d="M -170 -110 h 340 a 30 30 0 0 1 30 30 v 150 a 30 30 0 0 1 -30 30 h -200 l -70 60 l 10 -60 h -80 a 30 30 0 0 1 -30 -30 v -150 a 30 30 0 0 1 30 -30 Z" fill="#FFFFFF" stroke="#0B0E1A" strokeWidth={9} />
              <T x={0} y={50} s={170} w={900} c="#E0353F">NO.</T>
            </g>
            <Tag t={tt} at={S(a + 1) + 1.4} until={S(a + 2)} x={960} y={250} text="300 PHONES FILMING" bg="#FF5C5C" fg="#FFFFFF" size={46} />
          </Cafeteria>
        </Frame>
        <Slam t={tt} at={F(a + 3, 0.55)} until={rw0} text="TODAY DOESN'T COUNT" color="#DCE6FF" size={104} y={60} />
        {practice && t < rw0 && <TakeHud t={t} take={1} from={F(a + 3, 0.55)} />}
        <Rewind t={t} from={rw0} to={rw1} />
      </AbsoluteFill>
    );
  }
  const up = ease(t, rw1 + 0.5, rw1 + 1.0);
  const cam = cuts(t, [[rw1, C(1260, 640, 2.4), C(1260, 660, 1.7)], [rw1 + 1.3, C(820, 600, 1.25)], [S(a + 5), C(600, 600, 2.0), C(580, 590, 2.5)]], t1);
  return (
    <AbsoluteFill>
      <Frame t={t} cam={cam} take={2}>
        <Bedroom t={t} clock="7:00" day="MONDAY">
          <g transform={`rotate(${lerp(-50, 0, up)} 560 830)`}><Person x={560} y={1020} look={YOU} mood={t < S(a + 5) ? (up < 1 ? "sleepy" : "shocked") : "smug"} t={t} s={0.95} p={pose(t >= S(a + 5) ? "think" : "stand", { turn: 0.4 })} lookX={0.6} cut={-205} shadow={false} seed={1} /></g>
          <rect x={200} y={826} width={860} height={130} rx={26} fill="#4B6FC2" /><rect x={200} y={826} width={860} height={36} rx={18} fill="#6F8FDB" />
        </Bedroom>
      </Frame>
      <Flash t={t} at={rw1} />
      <Slam t={t} at={rw1 + 0.2} until={S(a + 5)} text="SAME MONDAY" color="#FFE14A" size={120} y={50} x={300} />
      <TakeHud t={t} take={2} from={rw1 + 1.5} big />
    </AbsoluteFill>
  );
};

// ---------- 2. promise + rules ----------
const Dark: React.FC<{ t: number; children: React.ReactNode; c?: string }> = ({ t, children, c = "#1B1F4A" }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 42%, ${c} 0%, #090B1C 78%)` }}>
    <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: 26 }, (_, i) => <circle key={i} cx={(rnd(i) * 1920 + t * (8 + rnd(i + 2) * 16)) % 1920} cy={rnd(i + 30) * 1080} r={3 + rnd(i + 9) * 8} fill="#FFFFFF" opacity={0.05 + 0.08 * Math.abs(Math.sin(t + i))} />)}
      {children}
    </svg>
    <Vignette /><Grain t={t} />
  </AbsoluteFill>
);
const DayTile: React.FC<{ x: number; y: number; take: 1 | 2; t: number; from: number; label?: string }> = ({ x, y, take, t, from, label = "MONDAY" }) => {
  const k = pop(t, from), c = take === 1 ? "#8FA6C8" : "#FFC83A";
  return (
    <g transform={`translate(${x} ${y}) scale(${k}) rotate(${take === 1 ? -4 : 4})`}>
      <rect x={-180} y={-150} width={360} height={320} rx={28} fill={take === 1 ? "#232B4A" : "#3A2A0E"} stroke={c} strokeWidth={8} strokeDasharray={take === 1 ? "24 16" : undefined} />
      <rect x={-180} y={-150} width={360} height={76} rx={28} fill={c} /><T x={0} y={-96} s={44} w={900} c="#0B0E1A">{label}</T>
      <T x={0} y={30} s={84} w={900} c={c}>{`TAKE ${take}`}</T><T x={0} y={104} s={38} w={800} c="#FFFFFF">{take === 1 ? "practice · erased" : "real · it counts"}</T>
    </g>
  );
};
const Promise: React.FC<ShotProps> = ({ t }) => {
  const a = first("promise");
  const b1 = F(a, 0.42), b2 = F(a, 0.6), b3 = F(a, 0.72), b4 = F(a, 0.8);
  return (
    <Dark t={t}>
      <g transform={`translate(${960 * 0.45 * ease(t, b1 - 0.2, b1 + 0.3)} ${30 * ease(t, b1 - 0.2, b1 + 0.3)}) scale(${1 - ease(t, b1 - 0.2, b1 + 0.3) * 0.45})`}>
        <T x={960} y={170} s={84} w={900}>YOU LIVE EVERY DAY</T><T x={960} y={170 + 0} s={84} w={900} c="#FFE14A" o={0}>.</T>
        <g transform={`translate(960 250) scale(${pop(t, S(a) + 0.9)})`}><T x={0} y={40} s={130} w={900} c="#FFE14A">TWICE</T></g>
        <DayTile x={690} y={640} take={1} t={t} from={F(a, 0.2)} /><DayTile x={1230} y={640} take={2} t={t} from={F(a, 0.3)} />
        <path d="M 890 640 h 130 m -34 -30 l 34 30 l -34 30" stroke="#FFFFFF" strokeWidth={12} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={ease(t, F(a, 0.3), F(a, 0.36))} />
      </g>
      {t > b1 && <g>
        <g transform={`translate(960 590) scale(${pop(t, b1)})`}><rect x={-250} y={-60} width={500} height={110} rx={30} fill="#0B0E1A" stroke="#FFFFFF" strokeWidth={6} /><T x={0} y={18} s={64} w={900}>IN 30 DAYS</T></g>
        <g transform={`translate(430 790) scale(${pop(t, b2)}) rotate(-4)`}><rect x={-250} y={-90} width={500} height={180} rx={28} fill="#0E3A22" stroke="#3BE07A" strokeWidth={8} /><T x={0} y={26} s={84} w={900} c="#6BFFA6">$1,000,000</T></g>
        <g transform={`translate(960 800) scale(${pop(t, b3)})`}><rect x={-200} y={-90} width={400} height={180} rx={28} fill="#3A0E14" stroke="#FF5C5C" strokeWidth={8} /><path d="M -130 -40 l 60 40 l -60 40 Z" fill="#FF5C5C" /><T x={40} y={26} s={76} w={900} c="#FFFFFF">VIRAL</T></g>
        <g transform={`translate(1490 790) scale(${pop(t, b4)}) rotate(4)`}><rect x={-250} y={-90} width={500} height={180} rx={28} fill="#2A1E5E" stroke="#B79CFF" strokeWidth={8} /><T x={0} y={-10} s={40} w={900} c="#FFFFFF">THE ONE MOMENT</T><T x={0} y={46} s={40} w={900} c="#B79CFF">YOU CAN'T PRACTICE</T></g>
      </g>}
    </Dark>
  );
};
const Rules: React.FC<ShotProps> = ({ t, t1 }) => {
  const a = first("rules");
  if (t < S(a + 1) - 0.12) {
    const mid = F(a, 0.38), wipe = ease(t, F(a, 0.42), F(a, 0.62)), two = F(a, 0.68);
    return (
      <Dark t={t}>
        <T x={960} y={140} s={72} w={900}>THE RULES</T>
        <g transform={`translate(560 560) scale(${pop(t, S(a) + 0.5) * 1.5})`}><Clapper take={1} t={t} at={S(a) + 0.9} /></g>
        <g transform={`translate(560 850) scale(${pop(t, F(a, 0.2))})`}><T x={0} y={0} s={56} w={900} c="#DCE6FF">NOTHING COUNTS</T></g>
        {t > mid && <g opacity={0.9}><rect x={260} y={380} width={600 * wipe} height={520} fill="#090B1C" opacity={0.82} /><T x={560} y={640} s={60} w={900} c="#FF8A8A" o={wipe}>ERASED AT MIDNIGHT</T></g>}
        <g transform={`translate(1360 560) scale(${pop(t, two) * 1.5})`}><Clapper take={2} t={t} at={two + 0.4} /></g>
        <g transform={`translate(1360 850) scale(${pop(t, two + 0.3)})`}><T x={0} y={0} s={56} w={900} c="#FFE14A">EVERYTHING IS REAL</T></g>
      </Dark>
    );
  }
  if (t < S(a + 2) - 0.12) {
    // take 2 of the lunch: you walk past the table
    const x = lerp(300, 1500, (t - S(a + 1)) / (E(a + 1) - S(a + 1) + 0.3));
    return (
      <AbsoluteFill>
        <Frame t={t} cam={cuts(t, [[S(a + 1), C(900, 560, 1.25), C(1100, 560, 1.3)]], S(a + 2))} take={2}>
          <Cafeteria t={t} crowd={false}>
            <LunchTable x={960} y={650} />
            <Crowd t={t} n={5} x0={60} x1={640} y={905} s={0.62} seed={1} mood="happy" />
            <Person x={x} y={990} look={YOU} mood="smug" t={t} p={pose(walk(t), { turn: 0.6 })} lookX={0.6} seed={1} />
            <Tag t={t} at={S(a + 1) + 0.8} x={960} y={330} text="NO TABLE. NO FLOWERS." size={50} />
          </Cafeteria>
        </Frame>
        <TakeHud t={t} take={2} from={0} />
      </AbsoluteFill>
    );
  }
  const cam = cuts(t, [[0, C(960, 520, 1.5)], [S(a + 3) - 0.1, C(1180, 520, 2.5)], [S(a + 4) - 0.1, C(760, 520, 2.5)], [S(a + 5) - 0.1, C(1180, 520, 2.6)], [S(a + 6) - 0.1, C(1180, 520, 1.9), C(1250, 500, 3.2)]], t1);
  const leave = ease(t, S(a + 6) + 0.2, t1);
  return (
    <AbsoluteFill>
      <Frame t={t} cam={cam} take={2}>
        <Hallway t={t} far={<Crowd t={t} n={3} x0={1500} x1={1900} y={800} s={0.5} seed={9} mood="neutral" />}>
          <Person x={760} y={985} look={YOU} mood={at<Mood>(t, [[0, "happy"], [S(a + 3) + 0.6, "neutral"], [S(a + 4) - 0.2, "shocked"], [S(a + 6), "nervous"]])} t={t} p={poseAt(t, [[0, pose("wave", { turn: 0.6 })], [S(a + 3), pose({ turn: 0.6 })], [S(a + 4) - 0.1, pose("shrug", { turn: 0.6 })], [S(a + 5), pose({ turn: 0.6, head: 8 })]])} lookX={0.7} {...say(t, "YOU")} seed={1} />
          <Person x={1180 + leave * 60} y={985} look={AVA} mood={at<Mood>(t, [[0, "neutral"], [S(a + 3), "smug"], [S(a + 5), "smug"], [S(a + 6), "happy"]])} t={t} p={pose(t >= S(a + 5) ? "stand" : "hips", { turn: -0.6 + leave * 1.0 })} flip lookX={0.7 - leave * 0.3} {...say(t, "AVA")} seed={3} behind={Backpack} />
          <Tag t={t} at={S(a + 6) + 0.9} x={1180} y={230} text="REMEMBER THIS" bg="#B79CFF" size={40} />
        </Hallway>
      </Frame>
      <TakeHud t={t} take={2} from={0} />
    </AbsoluteFill>
  );
};

// ---------- 3. school: the test, the practice days ----------
const GolfCart: React.FC<{ x: number; t: number }> = ({ x, t }) => (
  <g transform={`translate(${x} ${985 + Math.sin(t * 30) * 3})`}>
    <GroundShadow x={0} y={4} rx={300} />
    <rect x={-230} y={-420} width={420} height={26} rx={10} fill="#F7F3EA" /><rect x={-210} y={-400} width={12} height={250} fill="#C9CED8" /><rect x={150} y={-400} width={12} height={250} fill="#C9CED8" />
    <g transform="translate(-40 -37) scale(0.72)"><Person x={0} y={0} look={YOU} mood="laugh" t={t} p={pose("sit", { aR: 60, eR: 20, aL: 60, eL: 20, turn: 0.6 })} shadow={false} seed={1} /></g>
    <path d="M -260 -170 L 220 -170 L 260 -110 L 260 -50 L -260 -50 Z" fill="#3BB56A" /><rect x={-260} y={-90} width={520} height={20} fill="#2F9456" /><T x={-30} y={-104} s={36} w={900}>SCHOOL CART</T>
    <path d="M 150 -170 l 30 -70 l 26 0" stroke="#2A2D3C" strokeWidth={12} fill="none" strokeLinecap="round" />
    {[-160, 170].map((w) => <g key={w}><circle cx={w} cy={-40} r={46} fill="#1B1E2B" /><circle cx={w} cy={-40} r={18} fill="#C9CED8" /><line x1={w - 18} y1={-40} x2={w + 18} y2={-40} stroke="#1B1E2B" strokeWidth={5} transform={`rotate(${t * 700} ${w} -40)`} /></g>)}
    {[0, 1, 2, 3].map((i) => <line key={i} x1={-290 - i * 40} y1={-150 + i * 34} x2={-420 - i * 60} y2={-150 + i * 34} stroke="#FFFFFF" strokeWidth={8} strokeLinecap="round" opacity={0.6} />)}
  </g>
);
const School: React.FC<ShotProps> = ({ t, t1 }) => {
  const a = first("school");
  if (t < S(a + 2) - 0.12) {
    const two = t >= S(a + 1) - 0.12, st = two ? F(a + 1, 0.35) : F(a, 0.62);
    const cam = cuts(t, [[0, C(900, 520, 1.15), C(820, 560, 1.4)], [F(a, 0.55), C(760, 660, 2.4)], [S(a + 1) - 0.12, C(820, 560, 1.4)], [F(a + 1, 0.3), C(760, 660, 2.4)], [F(a + 1, 0.55), C(900, 520, 1.7)]], S(a + 2));
    return (
      <AbsoluteFill>
        <Frame t={t} cam={cam} take={two ? 2 : 1}>
          <Classroom t={t}>
            <Person x={1220 - (two ? ease(t, F(a + 1, 0.5), F(a + 1, 0.7)) * 230 : 0)} y={985} look={TEACHER} mood={two ? (t > F(a + 1, 0.5) ? "angry" : "shocked") : "neutral"} t={t} p={two && t > F(a + 1, 0.6) ? pose("reach", { turn: -0.6, aR: 60, eR: 30 }) : pose("hips", { turn: -0.5 })} flip lookX={0.8} lookY={0.4} seed={7} />
            <Person x={740} y={1094} look={YOU} mood={two ? "smug" : t > st ? "happy" : "nervous"} t={t} p={pose("write", { turn: 0.3 })} shadow={false} seed={1} sweat={!two && t < st} />
            <Desk x={760} y={990}><g transform="translate(40 0)"><TestPaper grade={two ? "100" : "F"} good={two} t={t} at={st} /></g></Desk>
            {[320, 1500].map((x, i) => <g key={x}><Person x={x} y={1094} look={extra(i + 2)} mood="nervous" t={t} p={pose("write")} shadow={false} seed={i + 5} /><Desk x={x + 20} y={990}><g transform="translate(30 0)"><TestPaper grade="" good t={0} at={9} /></g></Desk></g>)}
            {!two && <Tag t={t} at={F(a, 0.7)} x={1130} y={620} text="MEMORIZE EVERY QUESTION" bg="#DCE6FF" size={38} />}
            {two && <Tag t={t} at={F(a + 1, 0.42)} until={F(a + 1, 0.55)} x={1080} y={660} text="100%" bg="#3BE07A" size={70} />}
            {two && <Tag t={t} at={F(a + 1, 0.72)} x={1010} y={420} text="CHECKING YOUR SLEEVES" bg="#FF5C5C" fg="#FFFFFF" size={36} />}
          </Classroom>
        </Frame>
        <TakeHud t={t} take={two ? 2 : 1} from={two ? S(a + 1) - 0.12 : t >= 0 ? S(a) - 0.3 : 0} big={!two} />
        <Chip t={t} from={S(a)} to={S(a + 2) - 0.12} text="TUESDAY" />
        <Flash t={t} at={S(a + 1) - 0.12} c="#DCE6FF" />
      </AbsoluteFill>
    );
  }
  if (t < S(a + 3) - 0.12) {
    const i = a + 2, b1 = F(i, 0.3), b2 = F(i, 0.56), b3 = F(i, 0.72);
    let inner: React.ReactNode;
    if (t < b1) inner = (
      <Frame t={t} cam={cuts(t, [[0, C(960, 500, 1.3), C(960, 480, 1.6)]], b1)} take={1}>
        <Hallway t={t}><Person x={960} y={985} look={YOU} mood="happy" t={t} p={pose("cheer")} seed={1} /><Crowd t={t} n={3} x0={200} x1={620} y={985} s={0.9} seed={4} mood="shocked" /></Hallway>
      </Frame>);
    else if (t < b2) inner = (
      <Frame t={t} cam={cuts(t, [[0, C(960, 560, 1.15), C(1060, 560, 1.25)]], b2)} take={1} shake={0.25}>
        <Hallway t={t}>
          <Crowd t={t} n={2} x0={1500} x1={1850} y={985} s={0.9} seed={7} mood="shocked" />
          <GolfCart x={lerp(-200, 1500, (t - b1) / (b2 - b1))} t={t} />
          {Array.from({ length: 8 }, (_, k) => <rect key={k} x={lerp(-200, 1500, (t - b1) / (b2 - b1)) - 300 - k * 60} y={620 + ((k * 97) % 260) + Math.sin(t * 6 + k) * 30} width={44} height={56} fill="#FFFFFF" transform={`rotate(${t * 200 + k * 40} ${lerp(-200, 1500, (t - b1) / (b2 - b1)) - 300 - k * 60} ${700})`} opacity={0.85} />)}
        </Hallway>
      </Frame>);
    else if (t < b3) inner = (
      <Frame t={t} cam={cuts(t, [[0, C(960, 560, 1.5), C(960, 520, 1.9)]], b3)} take={1}>
        <Cafeteria t={t} crowd={false}>
          <LunchTable x={960} y={760} />
          <Person x={760} y={990} look={YOU} mood="happy" t={t} p={pose("holdBoth", { turn: 0.5 })} lookX={0.6} seed={1} talk />
          {Array.from({ length: 9 }, (_, k) => { const sh = pop(t, b2 + k * ((b3 - b2) * 0.08)); return <g key={k} transform={`translate(1010 ${758 - k * 34}) scale(${sh})`}><rect x={-62} y={-30} width={124} height={14} rx={7} fill="#C9743A" /><rect x={-66} y={-18} width={132} height={10} rx={5} fill="#5FA86A" /><rect x={-60} y={-10} width={120} height={12} rx={6} fill="#7A3E22" /><rect x={-62} y={0} width={124} height={4} rx={2} fill="#FFD24A" /></g>; })}
          <Tag t={t} at={b2 + 0.5} x={1260} y={520} text="9 BURGERS" bg="#FFE14A" size={56} />
        </Cafeteria>
      </Frame>);
    else inner = (
      <Frame t={t} cam={cuts(t, [[0, C(1000, 500, 1.5)], [F(i, 0.86), C(1200, 620, 2.6)]], S(a + 3))} take={1}>
        <Hallway t={t}>
          <Person x={800} y={985} look={YOU} mood="smug" t={t} p={pose("point", { turn: 0.6, aR: 78 })} lookX={0.7} seed={1} talk />
          <Person x={1200} y={985} look={{ ...PRINCIPAL, under: "#FF5CA8" }} mood="shocked" t={t} p={pose("hips", { turn: -0.5 })} flip lookX={0.7} seed={8} />
          <Tag t={t} at={b3 + 0.4} x={1200} y={300} text="PRINCIPAL" bg="#161A28" fg="#FFFFFF" size={34} />
          <Tag t={t} at={F(i, 0.86)} x={1420} y={640} text="THE TIE" bg="#FF5CA8" fg="#FFFFFF" size={40} />
        </Hallway>
      </Frame>);
    return <AbsoluteFill>{inner}<TakeHud t={t} take={1} from={0} /><Slam t={t} at={S(i) + 1.2} until={b1} text="NOTHING COUNTS" color="#DCE6FF" size={120} y={50} /></AbsoluteFill>;
  }
  const cam = cuts(t, [[0, C(960, 520, 1.5)], [S(a + 3) + 0.05, C(1150, 520, 2.4)], [S(a + 4) - 0.1, C(780, 520, 2.5)]], t1);
  return (
    <AbsoluteFill>
      <Frame t={t} cam={cam} take={1}>
        <Hallway t={t}>
          <Person x={780} y={985} look={YOU} mood="smug" t={t} p={pose(t >= S(a + 4) ? "shrug" : "hips", { turn: 0.6 })} lookX={0.7} {...say(t, "YOU")} seed={1} />
          <Person x={1150} y={985} look={THEO} mood="worried" t={t} p={pose("shrug", { turn: -0.6 })} flip lookX={0.7} {...say(t, "THEO")} seed={2} />
        </Hallway>
      </Frame>
      <TakeHud t={t} take={1} from={0} />
    </AbsoluteFill>
  );
};

// ---------- 4. the card shop ----------
const VideoCard: React.FC<{ t: number; from: number; to: number; x: number; y: number; title: string; views: string; children: React.ReactNode; s?: number }> = ({ t, from, to, x, y, title, views, children, s = 1 }) => (
  <Card t={t} from={from} to={to} x={x} y={y} w={760 * s} h={560 * s} rot={-2} bg="#11131E">
    <g transform={`scale(${s})`}>
      <rect x={-350} y={-250} width={700} height={360} rx={16} fill="#1F2440" />
      <g>{children}</g>
      <rect x={-350} y={96} width={700} height={10} fill="#3A3F52" /><rect x={-350} y={96} width={700 * Math.min(1, (t - from) / Math.max(0.1, to - from))} height={10} fill="#FF3B3B" />
      <circle cx={-316} cy={176} r={30} fill="#5E78C9" /><T x={-270} y={166} s={34} w={900} a="start">{title}</T><T x={-270} y={212} s={28} w={700} c="#9AA3B5" a="start">{views}</T>
    </g>
  </Card>
);
const Rack: React.FC<{ t: number; opened?: number; glow?: boolean; gone?: boolean }> = ({ t, opened = 0, glow, gone }) => (
  <g>
    <rect x={120} y={250} width={720} height={500} rx={16} fill="#2A2140" stroke="#FF5CA8" strokeWidth={6} /><T x={480} y={300} s={34} w={900} c="#FFE14A">40 SEALED PACKS · $5 EACH</T>
    {Array.from({ length: 40 }, (_, k) => {
      const x = 170 + (k % 10) * 68, y = 420 + Math.floor(k / 10) * 100, n = k + 1;
      if (n <= opened || (gone && n === 31)) return <rect key={k} x={x - 24} y={y - 72} width={48} height={72} rx={5} fill="#000" opacity={0.25} />;
      return <g key={k} transform={`translate(${x} ${y})`}><Pack n={n} c={["#5E78C9", "#D9607A", "#5FA86A", "#9A76CC", "#E0A53C"][k % 5]} glow={glow && n === 31} /></g>;
    })}
    {glow && <g transform={`translate(${170 + 0 * 68} ${420 + 3 * 100})`}><circle cx={0} cy={-36} r={56 + Math.sin(t * 6) * 6} fill="none" stroke="#FFE14A" strokeWidth={7} /></g>}
  </g>
);
const Cards: React.FC<ShotProps> = ({ t, t1 }) => {
  const a = first("cards");
  if (t < S(a + 1) - 0.12) {
    const fact = F(a, 0.5);
    return (
      <AbsoluteFill>
        <Frame t={t} cam={cuts(t, [[0, C(700, 600, 1.2), C(640, 600, 1.4)]], S(a + 1))} take={0}>
          <Bedroom t={t} clock="9:41" day="TUESDAY" night>
            <Person x={620} y={1060} look={YOU} mood={t > fact ? "shocked" : "neutral"} t={t} p={pose("sit", { aR: 20, eR: -110, turn: 0.5 })} shadow={false} lookX={0.5} lookY={0.4} hold={<g transform="rotate(20)"><PhoneUp /></g>} seed={1} />
            <Bloom x={690} y={760} r={260} color="#9FC8FF" o={0.5} />
          </Bedroom>
        </Frame>
        <VideoCard t={t} from={S(a) + 0.5} to={fact} x={1330} y={500} title="I OPENED 1,000 PACKS" views="12M views">
          {Array.from({ length: 7 }, (_, k) => { const q = ((t * 1.5 + k * 0.4) % 2.8) / 2.8; return <g key={k} transform={`translate(${-260 + k * 84} ${-70 + Math.sin(q * 3.14) * -90}) rotate(${-20 + k * 7 + q * 60})`} opacity={1 - q * 0.6}><Pack c={["#5E78C9", "#D9607A", "#5FA86A", "#9A76CC", "#E0A53C"][k % 5]} open={q > 0.4} s={1.3} /></g>; })}
          <T x={0} y={60} s={40} w={900} c="#FFE14A">{`${Math.min(1000, Math.round(((t - S(a)) / (fact - S(a))) * 1000))} / 1,000`}</T>
        </VideoCard>
        <Card t={t} from={fact} to={S(a + 1) - 0.1} x={1320} y={500} w={840} h={640} rot={2} bg="#FFF8E2">
          <T x={0} y={-236} s={36} w={900} c="#8A6A3C" ls={3}>MOST EXPENSIVE CARD EVER SOLD</T>
          <g transform="translate(-250 30) rotate(-6)"><RareCard t={t} s={1.05} /></g>
          <T x={130} y={-40} s={92} w={900} c="#1F7A45">$16.5</T><T x={130} y={46} s={72} w={900} c="#1F7A45">MILLION</T>
          <T x={130} y={120} s={32} w={800} c="#3A3F52">Pikachu Illustrator</T><T x={130} y={162} s={28} w={700} c="#3A3F52">sold by Logan Paul, Feb 2026</T>
          <T x={0} y={270} s={24} w={700} c="#8A6A3C">Source: Guinness World Records</T>
        </Card>
      </AbsoluteFill>
    );
  }
  const two = t >= S(a + 3) - 0.12;
  const opened = two ? 0 : Math.floor(keys(t, [[F(a + 1, 0.55), 0], [E(a + 1), 30], [S(a + 2), 30], [S(a + 2) + 0.4, 31]], undefined));
  const reveal = !two && t >= F(a + 2, 0.3);
  const cam = cuts(t, [[0, WIDE, C(900, 560, 1.2)], [F(a + 1, 0.55), C(700, 620, 1.5), C(760, 620, 1.7)], [S(a + 2) - 0.1, C(480, 640, 2.2), C(520, 660, 2.6)], [F(a + 2, 0.3), C(960, 540, 1.3)], [S(a + 3) - 0.12, C(1000, 560, 1.2), C(1040, 560, 1.35)], [S(a + 4) - 0.1, C(820, 600, 1.9)], [S(a + 5) - 0.1, C(1420, 520, 2.4)]], t1);
  const walkIn = two ? ease(t, S(a + 3) - 0.1, S(a + 3) + 1.4) : 1;
  return (
    <AbsoluteFill>
      <Frame t={t} cam={cam} take={two ? 2 : 1}>
        <CardShop t={t} rack={<Rack t={t} opened={opened} glow={two ? t > S(a + 4) : t > S(a + 2) - 0.1 && !reveal} gone={two && t > S(a + 5)} />}>
          <Counter x={1440} y={990} w={620}><g transform="translate(-200 0)"><rect x={-60} y={-70} width={120} height={70} rx={8} fill="#2A2D3C" /><rect x={-48} y={-60} width={96} height={30} rx={4} fill="#6BFFA6" opacity={0.7} /></g></Counter>
          <Person x={1500} y={985} look={OWNER} mood={two ? (t > S(a + 5) - 0.1 ? "deadpan" : "neutral") : t > F(a + 1, 0.6) ? "shocked" : "neutral"} t={t} p={pose(two && t > S(a + 5) ? "shrug" : "hips", { turn: -0.5 })} flip lookX={0.7} {...say(t, "OWNER")} seed={6} cut={-262} shadow={false} />
          <Person x={lerp(1900, 880, walkIn)} y={985} look={YOU} mood={two ? "smug" : reveal ? "shocked" : "determined"} t={t} flip={two && walkIn < 1}
            p={two ? (walkIn < 1 ? pose(walk(t), { turn: 0.6, aR: 120, eR: 20 }) : t > S(a + 4) - 0.1 ? pose("pointL", { turn: -0.6, aL: 86 }) : pose("holdUp", { turn: -0.3 })) : reveal ? pose("cheer") : pose("holdBoth", { turn: -0.4 })}
            lookX={two ? -0.7 : -0.5} {...say(t, "YOU")} seed={1} hold={two && t < S(a + 5) ? <Bill v="$5" /> : undefined} />
          {/* take 1: torn packs pile up and cards fly */}
          {!two && Array.from({ length: Math.min(opened, 30) }, (_, k) => <g key={k} transform={`translate(${560 + ((k * 53) % 420)} ${985 - ((k * 31) % 40)}) rotate(${(k * 67) % 360})`}><Pack open c={["#5E78C9", "#D9607A", "#5FA86A", "#9A76CC", "#E0A53C"][k % 5]} s={0.8} /></g>)}
          {!two && t > F(a + 1, 0.55) && !reveal && Array.from({ length: 10 }, (_, k) => { const q = ((t * 1.8 + k * 0.31) % 1); return <rect key={k} x={840 + Math.cos(k * 2.1) * q * 420} y={640 - Math.sin(q * 3.14) * 300 + q * 200} width={34} height={46} rx={4} fill={["#FFFFFF", "#FFD24A", "#BFE0FF"][k % 3]} transform={`rotate(${q * 400 + k * 30} ${840 + Math.cos(k * 2.1) * q * 420} ${640})`} opacity={1 - q} />; })}
          {!two && <Tag t={t} at={F(a + 1, 0.42)} until={S(a + 2)} x={1180} y={420} text="SAVINGS: $200 → $0" bg="#FF5C5C" fg="#FFFFFF" size={40} />}
          {two && <Tag t={t} at={S(a + 3) + 1.0} until={S(a + 5)} x={480} y={200} text="YOU ONLY WANT #31" bg="#FFE14A" size={40} />}
          {reveal && <g transform={`translate(960 470) scale(${pop(t, F(a + 2, 0.3)) * 1.7})`}><RareCard t={t} /></g>}
          {reveal && <Tag t={t} at={F(a + 2, 0.5)} x={960} y={880} text="WORTH $2,800" bg="#3BE07A" size={64} />}
        </CardShop>
      </Frame>
      <TakeHud t={t} take={two ? 2 : 1} from={two ? S(a + 3) - 0.12 : S(a + 1) - 0.12} big={!two} />
      <Flash t={t} at={S(a + 3) - 0.12} c="#DCE6FF" />
      {!two && <Slam t={t} at={S(a + 2)} until={F(a + 2, 0.3)} text="PACK 31" color="#FFE14A" size={150} y={40} />}
    </AbsoluteFill>
  );
};

// ---------- 5. the lottery: why chance doesn't repeat ----------
const Lottery: React.FC<ShotProps> = ({ t, t1 }) => {
  const a = first("lottery");
  if (t < S(a + 1) - 0.12) {
    const draw = F(a, 0.45);
    const tv = (
      <g>
        <rect width={660} height={374} fill="#16306A" /><T x={330} y={64} s={44} w={900} c="#FFE14A">TONIGHT'S NUMBERS</T>
        {[7, 19, 23, 31, 40, 44].map((n, k) => { const sh = pop(t, draw + k * 0.25); return <g key={k} transform={`translate(${70 + k * 104} 190) scale(${sh})`}><circle r={44} fill="#FFFFFF" /><circle r={44} fill="none" stroke="#FFC83A" strokeWidth={6} /><T x={0} y={16} s={44} w={900} c="#16306A">{String(n)}</T></g>; })}
        <T x={330} y={320} s={34} w={800} c="#BFD4FF">LIVE DRAW</T>
      </g>
    );
    return (
      <AbsoluteFill>
        <Frame t={t} cam={cuts(t, [[0, C(960, 560, 1.1), C(1000, 540, 1.25)], [F(a, 0.7), C(560, 560, 2.2)]], S(a + 1))} take={2}>
          <LivingRoom t={t} tv={tv}>
            <Couch x={560} y={1000} />
            <Person x={470} y={1066} look={MOM} mood={t > F(a, 0.75) ? "sad" : "happy"} t={t} p={pose("sit", { aR: 30, eR: 60, turn: 0.5 })} shadow={false} lookX={0.7} seed={4}
              hold={<g transform="rotate(10)"><rect x={-70} y={-50} width={140} height={64} rx={6} fill="#FFF8E2" stroke="#C9B48A" strokeWidth={3} /><T x={0} y={-22} s={17} w={900} c="#0B0E1A">3 11 16 28 35 42</T>{t > F(a, 0.75) && <path d="M -50 -44 L 50 6 M 50 -44 L -50 6" stroke="#E0353F" strokeWidth={8} strokeLinecap="round" />}</g>} />
            <Person x={720} y={1066} look={YOU} mood={t > F(a, 0.7) ? "shocked" : "smug"} t={t} p={pose("sit", { turn: 0.5 })} shadow={false} lookX={0.7} seed={1} />
            <Tag t={t} at={F(a, 0.75)} x={640} y={420} text="0 OF 6" bg="#FF5C5C" fg="#FFFFFF" size={64} />
          </LivingRoom>
        </Frame>
        <TakeHud t={t} take={2} from={0} />
      </AbsoluteFill>
    );
  }
  if (t < S(a + 2) - 0.12) {
    const i = a + 1, split = F(i, 0.42), balls = F(i, 0.8);
    const k = ease(t, split, F(i, 0.62));
    const pts = (off: number) => Array.from({ length: 60 }, (_, n) => { const x = n / 59, d = Math.max(0, x - 0.3) * off; return `${200 + x * 1520},${620 + Math.sin(x * 14) * 70 * (1 - d * 0.4) + Math.sin(x * 23 + d * 9) * 120 * d}`; }).join(" ");
    return (
      <Dark t={t} c="#103A3A">
        <T x={110} y={120} s={44} w={900} c="#8FE8D0" ls={3} a="start">1961 · EDWARD LORENZ · WEATHER SIMULATION</T>
        <g transform={`translate(560 290) scale(${pop(t, S(i) + 1.6)})`}><rect x={-300} y={-80} width={600} height={160} rx={20} fill="#06201F" stroke="#3BE0B0" strokeWidth={6} /><T x={0} y={30} s={96} w={900} c="#6BFFD0">0.506127</T></g>
        <g transform={`translate(1360 290) scale(${pop(t, F(i, 0.36))})`}><rect x={-300} y={-80} width={600} height={160} rx={20} fill="#2A0E14" stroke="#FF6B6B" strokeWidth={6} /><T x={0} y={30} s={96} w={900} c="#FF9A9A">0.506</T></g>
        <rect x={180} y={430} width={1560} height={420} rx={20} fill="#06201F" opacity={0.8} />
        <polyline points={pts(0)} fill="none" stroke="#6BFFD0" strokeWidth={8} strokeLinejoin="round" />
        <g><clipPath id="lz"><rect x={180} y={430} width={1560 * k} height={420} /></clipPath><polyline points={pts(1)} fill="none" stroke="#FF6B6B" strokeWidth={8} strokeLinejoin="round" clipPath="url(#lz)" /></g>
        {t > F(i, 0.62) && <g transform={`translate(1420 480) scale(${pop(t, F(i, 0.62))}) rotate(3)`}><rect x={-290} y={-44} width={580} height={88} rx={22} fill="#FF5C5C" /><T x={0} y={16} s={44} w={900}>A TOTALLY NEW FORECAST</T></g>}
        {t > balls && <g>{Array.from({ length: 9 }, (_, n) => <g key={n} transform={`translate(${300 + n * 165} ${960 - Math.abs(Math.sin(t * (3 + (n % 4)) + n)) * 90})`}><circle r={40} fill="#FFFFFF" stroke="#FFC83A" strokeWidth={6} /><T x={0} y={14} s={38} w={900} c="#16306A">{String((n * 7 + Math.floor(t * 3)) % 49 + 1)}</T></g>)}</g>}
      </Dark>
    );
  }
  const i = a + 2, r = F(i, 0.4);
  return (
    <Dark t={t}>
      <T x={960} y={150} s={72} w={900} c="#FFE14A">NEW RULE</T>
      <g transform={`translate(520 560) scale(${pop(t, S(i) + 0.7)})`}>
        <rect x={-340} y={-250} width={680} height={520} rx={36} fill="#2A0E14" stroke="#FF6B6B" strokeWidth={8} strokeDasharray="26 18" />
        <T x={0} y={-160} s={64} w={900} c="#FF9A9A">CHANCE</T>
        {[-150, 0, 150].map((x, n) => <g key={x} transform={`translate(${x} ${-10 - Math.abs(Math.sin(t * 4 + n)) * 50}) rotate(${t * 80 + n * 40})`}><rect x={-50} y={-50} width={100} height={100} rx={18} fill="#FFFFFF" />{[[-22, -22], [22, 22], [0, 0]].slice(0, n + 1).map(([dx, dy], q) => <circle key={q} cx={dx} cy={dy} r={10} fill="#16306A" />)}</g>)}
        <T x={0} y={210} s={62} w={900}>CHANGES</T>
      </g>
      <g transform={`translate(1400 560) scale(${pop(t, r)})`}>
        <rect x={-340} y={-250} width={680} height={520} rx={36} fill="#0E3A22" stroke="#3BE07A" strokeWidth={8} />
        <T x={0} y={-160} s={64} w={900} c="#6BFFA6">SEALED</T>
        <g transform="translate(-170 0) scale(1.8)"><Pack c="#5E78C9" /></g><g transform="translate(20 -30) scale(1.1)"><Envelope /></g>
        <g transform="translate(200 -30)"><rect x={-44} y={-10} width={88} height={70} rx={12} fill="#FFC83A" /><path d="M -26 -10 v -26 a 26 26 0 0 1 52 0 v 26" stroke="#C9CED8" strokeWidth={12} fill="none" /></g>
        <T x={0} y={210} s={62} w={900}>STAYS THE SAME</T>
      </g>
    </Dark>
  );
};

// ---------- 6. storage units, going viral, the money ----------
const Junk = (i: number) => {
  const x = 80 + (i - 4) * 300;
  return <g>{[0, 1, 2].map((k) => <rect key={k} x={x + 20 + k * 70} y={690 - ((i + k) % 3) * 60} width={64} height={90 + ((i + k) % 3) * 60} fill={["#B98A5E", "#A5825E", "#8A6A4C"][k]} stroke="#6E5038" strokeWidth={3} />)}<ellipse cx={x + 180} cy={770} rx={50} ry={14} fill="#5B6274" /></g>;
};
const StorageScene: React.FC<ShotProps> = ({ t, t1 }) => {
  const a = first("storage");
  if (t >= S(a + 5) - 0.12) {
    // week 3: the total, and one email
    const i = a + 5, mail = F(i, 0.55);
    return (
      <Dark t={t} c="#0E3A22">
        <T x={960} y={230} s={64} w={900} c="#8FE8B0" ls={6}>WEEK 3</T>
        <T x={960} y={560} s={260} w={900} c="#6BFFA6">{`$${Math.round(money(t)).toLocaleString("en-US")}`}</T>
        {Array.from({ length: 16 }, (_, k) => <g key={k} transform={`translate(${(rnd(k) * 1920)} ${((t * (160 + rnd(k + 3) * 160) + rnd(k + 7) * 1080) % 1200) - 60}) rotate(${t * 90 + k * 30})`}><rect x={-34} y={-18} width={68} height={36} rx={5} fill="#7BC98A" stroke="#2F7A4A" strokeWidth={3} opacity={0.7} /></g>)}
        {t > mail && <g transform={`translate(960 770) scale(${pop(t, mail)})`}><rect x={-330} y={-80} width={660} height={160} rx={30} fill="#0B0E1A" stroke="#FFFFFF" strokeWidth={6} /><g transform="translate(-230 0) scale(0.8)"><Envelope label="" /></g><T x={50} y={18} s={56} w={900}>1 NEW EMAIL</T><circle cx={310} cy={-70} r={30} fill="#FF3B3B" /><T x={310} y={-56} s={36} w={900}>1</T></g>}
      </Dark>
    );
  }
  const two = t >= F(a + 1, 0.74);
  const sold = t >= S(a + 4) - 0.12;
  const open = (i: number) => (two ? (sold && i === 7 ? ease(t, S(a + 4), S(a + 4) + 0.6) : 0) : t < S(a + 1) ? 0 : ease(t, F(a + 1, 0.12) + (i - 4) * 0.22, F(a + 1, 0.12) + (i - 4) * 0.22 + 0.45));
  const cam = cuts(t, [[0, WIDE, C(960, 560, 1.15)], [S(a + 1) - 0.1, C(500, 560, 1.5), C(1100, 560, 1.6)], [F(a + 1, 0.5), C(1105, 580, 2.3), C(1105, 560, 2.7)], [F(a + 1, 0.74), C(1000, 560, 1.25)], [S(a + 2) - 0.1, C(620, 520, 2.3)], [S(a + 3) - 0.1, C(900, 520, 2.5)], [S(a + 4) - 0.12, C(1105, 600, 1.7), C(1105, 580, 1.9)]], S(a + 5));
  const post = F(a + 4, 0.42);
  return (
    <AbsoluteFill>
      <Frame t={t} cam={cam} take={t < S(a + 1) - 0.1 ? 0 : two ? 2 : 1}>
        <Storage t={t} open={open} hi={two ? 7 : undefined} inside={(i) => (i === 7 ? <g transform={`translate(${80 + 3 * 300 + 125} 780)`}><Arcade t={t} s={0.95} /></g> : Junk(i))}>
          <Person x={620} y={985} look={THEO} mood={sold ? "laugh" : two ? "worried" : "neutral"} t={t} p={pose(sold ? "cheer" : "hold", { turn: 0.6 })} lookX={0.7} {...say(t, "THEO")} seed={2} hold={!sold ? <g transform="translate(6 -10) rotate(80)"><PhoneUp /></g> : undefined} />
          <Person x={900} y={985} look={YOU} mood={sold ? "happy" : two ? "smug" : "determined"} t={t} p={pose(sold ? "cheer" : two && t > S(a + 3) - 0.1 ? "shrug" : "hips", { turn: two ? -0.4 : 0.6 })} lookX={two ? -0.6 : 0.7} {...say(t, "YOU")} seed={1} />
          {two && <Person x={1420} y={985} look={{ ...extra(4), tall: 1.12, outfit: "jacket" }} mood="neutral" t={t} p={pose("holdUp", { turn: -0.4 })} flip seed={11} hold={<g><rect x={-6} y={-90} width={12} height={90} fill="#8A6A4C" /><circle cx={0} cy={-120} r={48} fill="#FFFFFF" stroke="#0B0E1A" strokeWidth={5} /><T x={0} y={-102} s={52} w={900} c="#E0353F">7</T></g>} />}
          {two && !sold && <Tag t={t} at={F(a + 1, 0.8)} x={1420} y={330} text="THEO'S BROTHER BIDS" bg="#161A28" fg="#FFFFFF" size={34} />}
          {t < S(a + 1) - 0.1 && <Tag t={t} at={F(a, 0.5)} x={960} y={560} text="$300 · CONTENTS UNKNOWN" size={56} />}
          {!two && t > F(a + 1, 0.5) && <Tag t={t} at={F(a + 1, 0.5)} x={1105} y={330} text="UNIT 7 · 1980s ARCADE" bg="#FFE14A" size={38} />}
          {sold && <Tag t={t} at={S(a + 4) + 0.9} until={post} x={1105} y={330} text="SOLD · $9,000" bg="#3BE07A" size={60} />}
        </Storage>
      </Frame>
      {t < S(a + 1) - 0.1 && <VideoCard t={t} from={F(a, 0.3)} to={F(a, 0.5) - 0.05} x={1400} y={420} s={0.8} title="I BOUGHT AN ABANDONED UNIT" views="8.4M views"><rect x={-200} y={-200} width={400} height={260} fill="#E0A53C" />{Array.from({ length: 9 }, (_, r) => <rect key={r} x={-200} y={-200 + r * 30} width={400} height={6} fill="#000" opacity={0.15} />)}<T x={0} y={-50} s={120} w={900}>?</T></VideoCard>}
      {sold && <VideoCard t={t} from={post} to={S(a + 5) - 0.1} x={1380} y={470} title="THIS KID ONLY PICKS WINNERS" views={`${(keys(t, [[post, 0], [E(a + 4), 6]]) as number).toFixed(1)}M views`}><g transform="translate(-120 96) scale(0.72)"><Arcade t={t} /></g><g transform="translate(140 110) scale(0.5)"><Person x={0} y={0} look={YOU} mood="smug" t={t} p={pose("point", { turn: -0.5 })} flip shadow={false} seed={1} /></g></VideoCard>}
      {t >= S(a + 1) - 0.1 && <TakeHud t={t} take={two ? 2 : 1} from={two ? F(a + 1, 0.74) : S(a + 1) - 0.1} big={!two} />}
      <Flash t={t} at={F(a + 1, 0.74)} c="#DCE6FF" />
    </AbsoluteFill>
  );
};

// ---------- 7. the cost, the aquarium ----------
const Pancakes = <g><ellipse cx={0} cy={0} rx={70} ry={14} fill="#FFFFFF" />{[0, 1, 2, 3].map((k) => <ellipse key={k} cx={0} cy={-10 - k * 13} rx={52} ry={12} fill={k % 2 ? "#E0A553" : "#D9963F"} />)}<rect x={-14} y={-66} width={28} height={12} rx={4} fill="#FFE98A" /><path d="M -40 -52 q 10 26 4 40" stroke="#B8651E" strokeWidth={7} fill="none" strokeLinecap="round" /></g>;
const Cost: React.FC<ShotProps> = ({ t, t1 }) => {
  const a = first("cost");
  if (t >= F(a + 2, 0.5)) {
    return (
      <AbsoluteFill>
        <Frame t={t} cam={cuts(t, [[0, C(1300, 520, 2.0), C(1340, 515, 3.3)]], t1)} take={2}>
          <Hallway t={t}>
            <Person x={620} y={985} look={YOU} mood="neutral" t={t} p={pose(walk(t, 0.6), { turn: -0.6 })} flip lookX={0.6} seed={1} />
            <Person x={1340} y={985} look={AVA} mood="smug" t={t} p={pose("hips", { turn: -0.7 })} flip lookX={1} seed={3} behind={Backpack} />
          </Hallway>
        </Frame>
        <TakeHud t={t} take={2} from={0} />
      </AbsoluteFill>
    );
  }
  const two = t >= S(a + 1) - 0.12, snap = F(a, 0.42);
  const cam = cuts(t, [[0, C(960, 540, 1.15), C(900, 540, 1.3)], [snap, C(760, 520, 2.0)], [F(a, 0.62), C(1300, 520, 2.5)], [S(a + 1) - 0.12, C(1000, 560, 1.4)], [F(a + 1, 0.5), C(760, 520, 2.6)], [S(a + 2) - 0.1, C(760, 540, 1.6), C(760, 530, 2.0)]], t1);
  return (
    <AbsoluteFill>
      <Frame t={t} cam={cam} take={two ? 2 : 1}>
        <Kitchen t={t}>
          <Person x={1300} y={985} look={MOM} mood={two ? "happy" : t > snap + 0.3 ? "sad" : "happy"} t={t} p={pose(two ? "hold" : t > snap + 0.3 ? "slump" : "wave", { turn: -0.5 })} flip lookX={0.7} seed={4} hold={two ? <g transform="translate(10 -16)">{Pancakes}</g> : undefined} />
          <Person x={760} y={985} look={YOU} mood={two ? "sad" : t > snap + 1.4 ? "deadpan" : "angry"} t={t} p={pose(two ? "slump" : t < snap + 1.2 ? "point" : "hips", { turn: 0.6 })} lookX={0.7} seed={1} />
          {!two && t > snap && t < F(a, 0.62) && <g transform={`translate(1010 330) scale(${pop(t, snap)}) rotate(-4)`}><path d="M -150 -70 l 40 20 l 30 -50 l 30 50 l 50 -30 l 0 50 l 60 0 l -40 40 l 50 40 l -70 0 l 0 50 l -50 -30 l -30 40 l -30 -40 l -50 20 l 10 -50 l -60 -10 l 50 -30 Z" fill="#E0353F" stroke="#0B0E1A" strokeWidth={8} /><T x={-10} y={30} s={64} w={900}>#@!%</T></g>}
          {!two && <Tag t={t} at={F(a, 0.8)} x={760} y={250} text="&quot;IT'S A DRAFT&quot;" bg="#DCE6FF" size={44} />}
          {two && <Tag t={t} at={F(a + 1, 0.55)} x={760} y={250} text="YOU REMEMBER" bg="#FF5C5C" fg="#FFFFFF" size={44} />}
        </Kitchen>
      </Frame>
      <TakeHud t={t} take={two ? 2 : 1} from={two ? S(a + 1) - 0.12 : S(a)} />
      <Flash t={t} at={S(a + 1) - 0.12} c="#DCE6FF" />
    </AbsoluteFill>
  );
};
const AquariumShot: React.FC<{ t: number; a: number; cam: Cam; erase?: number }> = ({ t, a, cam, erase = 0 }) => {
  const sit = ease(t, F(a, 0.75), F(a, 0.75) + 0.5), fact = S(a + 1);
  const yx = t < F(a, 0.35) ? 300 : lerp(300, 800, ease(t, F(a, 0.35), F(a, 0.75)));
  return (
    <Frame t={t} cam={cam} take={1}>
      <Aquarium t={t} far={<g transform="translate(1180 380)"><Octopus t={t} s={1.05} />      </g>}>
        <Tag t={t} at={fact + 0.3} x={850} y={210} text="BLUE BLOOD" bg="#2F6BFF" fg="#FFFFFF" size={50} />
        <Tag t={t} at={F(a + 1, 0.42)} x={820} y={330} text="COPPER, NOT IRON" bg="#C96A2A" fg="#FFFFFF" size={36} rot={2} />
        <Tag t={t} at={F(a + 1, 0.78)} x={1520} y={220} text="3 HEARTS" bg="#FF4B6E" fg="#FFFFFF" size={50} rot={3} />
        <Bench x={960} y={990} w={640} />
        <Person x={1090} y={990 + 114 * 0.95} look={AVA} mood={at<Mood>(t, [[0, "neutral"], [fact, "happy"], [S(a + 3), "smug"], [S(a + 4), "happy"]])} t={t} s={0.95} p={t >= fact && t < S(a + 2) ? pose("sit", { aR: 110, eR: 10, turn: -0.3 }) : pose("sit", { turn: -0.5 })} flip lookX={t >= S(a + 3) ? 0.9 : -0.3} lookY={t >= S(a + 3) ? 0 : -0.5} {...say(t, "AVA")} shadow={false} seed={3} />
        <Person x={yx} y={990 + sit * 114 * 0.95} look={YOU} mood={at<Mood>(t, [[0, "neutral"], [F(a, 0.35), "shocked"], [fact, "happy"], [S(a + 3) + 0.4, "nervous"], [S(a + 4), "love"]])} t={t} s={0.95} p={sit > 0.5 ? pose("sit", { turn: 0.5 }) : t < F(a, 0.35) ? pose({ turn: 0.6 }) : pose(walk(t), { turn: 0.6 })} lookX={0.8} lookY={-0.2} {...say(t, "YOU")} shadow={sit < 0.5} seed={1} />
      </Aquarium>
      {erase > 0 && <Layer><rect x={-400} y={-200} width={2800} height={1500} fill="#0A1230" opacity={erase * 0.9} /></Layer>}
    </Frame>
  );
};
const AquariumScene: React.FC<ShotProps> = ({ t, t1 }) => {
  const a = first("aquarium");
  const gone = F(a + 4, 0.55);
  const cam = cuts(t, [[0, WIDE, C(960, 520, 1.25)], [F(a, 0.6), C(1000, 600, 1.5)], [S(a + 1) - 0.1, C(1090, 560, 2.3)], [F(a + 1, 0.25), C(1130, 420, 1.35), C(1150, 400, 1.5)], [S(a + 2) - 0.1, C(800, 580, 2.5)], [S(a + 3) - 0.1, C(1090, 570, 2.6)], [S(a + 4) - 0.1, C(950, 560, 1.5), C(950, 540, 1.2)]], t1);
  return (
    <AbsoluteFill>
      <AquariumShot t={t} a={a} cam={cam} erase={ease(t, gone + 0.5, t1)} />
      <TakeHud t={t} take={1} from={S(a)} big />
      <Rewind t={t} from={gone + 0.1} to={t1} label="IT NEVER HAPPENED" />
    </AbsoluteFill>
  );
};

// ---------- 8. the offer ----------
const Offer: React.FC<ShotProps> = ({ t, t1 }) => {
  const a = first("offer");
  if (t < S(a + 1) - 0.12) {
    const b1 = F(a, 0.3), b2 = F(a, 0.5), b3 = F(a, 0.72);
    return (
      <Dark t={t} c="#2A1458">
        <g transform={`translate(960 ${lerp(560, 330, ease(t, b3 - 0.3, b3))}) scale(${pop(t, S(a) + 0.2) * lerp(1, 0.78, ease(t, b3 - 0.3, b3))})`}>
          <rect x={-620} y={-290} width={1240} height={520} rx={30} fill="#FFFFFF" stroke="#0B0E1A" strokeWidth={8} /><rect x={-620} y={-290} width={1240} height={90} rx={30} fill="#2A1E6A" /><T x={-580} y={-230} s={40} w={900} a="start">NEW EMAIL</T>
          <T x={-570} y={-140} s={34} w={700} c="#5B6274" a="start">From: The $1,000,000 Question</T>
          <T x={-570} y={-50} s={72} w={900} c="#0B0E1A" a="start">YOU'RE INVITED.</T>
          <g opacity={ease(t, b1, b1 + 0.2)}><rect x={-570} y={-10} width={300} height={70} rx={16} fill="#FF3B3B" /><T x={-420} y={38} s={40} w={900}>● LIVE</T><T x={-240} y={40} s={44} w={900} c="#0B0E1A" a="start">20,000,000 VIEWERS</T></g>
          <g opacity={ease(t, b2, b2 + 0.2)}><T x={-570} y={130} s={44} w={900} c="#2A1E6A" a="start">1 CONTESTANT · 1 QUESTION · $1,000,000</T></g>
        </g>
        {t > b3 && <g transform={`translate(760 730) scale(${pop(t, b3) * 1.7})`}><Envelope /></g>}
        {t > b3 + 0.5 && <g transform={`translate(1250 730) scale(${pop(t, b3 + 0.5)}) rotate(3)`}><rect x={-240} y={-50} width={480} height={100} rx={24} fill="#FFE14A" stroke="#0B0E1A" strokeWidth={6} /><T x={0} y={16} s={42} w={900} c="#0B0E1A">SEALED 7 DAYS BEFORE</T></g>}
      </Dark>
    );
  }
  if (t < S(a + 2) - 0.12) {
    return (
      <AbsoluteFill>
        <Frame t={t} cam={cuts(t, [[0, C(620, 600, 2.2), C(620, 560, 2.7)]], S(a + 2))} take={2}>
          <Bedroom t={t} clock="9:12" day="FRIDAY" night>
            <Person x={620} y={1060} look={YOU} mood={t > S(a + 1) + 0.7 ? "laugh" : "smug"} t={t} p={pose("sit", { aR: 20, eR: -110, turn: 0.4 })} shadow={false} lookY={0.3} hold={<g transform="rotate(20)"><PhoneUp /></g>} seed={1} />
            <Bloom x={690} y={760} r={260} color="#9FC8FF" o={0.5} />
          </Bedroom>
        </Frame>
        <Slam t={t} at={S(a + 1)} until={S(a + 2) - 0.12} text="SEALED." color="#6BFFA6" size={170} y={60} x={520} />
        <TakeHud t={t} take={2} from={0} />
      </AbsoluteFill>
    );
  }
  const i = a + 2, p2 = F(i, 0.6);
  return (
    <Dark t={t} c="#1B1F4A">
      <T x={960} y={150} s={72} w={900} c="#FFE14A">THE PLAN</T>
      <g transform={`translate(520 440) scale(${pop(t, F(i, 0.22)) * 1.25})`}><Clapper take={1} t={t} at={F(i, 0.3)} /></g>
      <g transform={`translate(520 720) scale(${pop(t, F(i, 0.3))})`}><T x={0} y={0} s={60} w={900} c="#DCE6FF">HEAR THE QUESTION</T></g>
      <path d="M 800 460 h 300 m -50 -44 l 50 44 l -50 44" stroke="#FFFFFF" strokeWidth={16} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={ease(t, p2 - 0.3, p2)} />
      <g transform={`translate(1400 440) scale(${pop(t, p2) * 1.25})`}><Clapper take={2} t={t} at={p2 + 0.3} /></g>
      <g transform={`translate(1400 720) scale(${pop(t, p2 + 0.2)})`}><T x={0} y={0} s={60} w={900} c="#FFE14A">ANSWER IT</T></g>
      {t > p2 + 0.6 && <g transform={`translate(960 830) scale(${pop(t, p2 + 0.6)})`}><T x={0} y={0} s={90} w={900} c="#6BFFA6">= $1,000,000</T></g>}
    </Dark>
  );
};

// ---------- 9. the show, take 1 ----------
const Q: React.FC<{ q: string[]; sub?: string; subC?: string; timer?: number; bg?: string }> = ({ q, sub, subC = "#FFE14A", timer, bg }) => (
  <g>
    {bg && <rect width={840} height={390} fill={bg} />}
    {q.map((l, k) => <T key={k} x={420} y={(sub ? 120 : 170) + k * 74 - (q.length - 1) * 30} s={62} w={900}>{l}</T>)}
    {sub && <T x={420} y={320} s={84} w={900} c={subC}>{sub}</T>}
    {timer !== undefined && <g transform="translate(760 70)"><circle r={50} fill="#0B0E1A" stroke={timer < 10 ? "#FF5C5C" : "#FFE14A"} strokeWidth={8} /><T x={0} y={18} s={50} w={900} c={timer < 10 ? "#FF5C5C" : "#FFE14A"}>{String(Math.ceil(timer))}</T></g>}
  </g>
);
const Final1: React.FC<ShotProps> = ({ t, t1 }) => {
  const a = first("final1");
  if (t >= S(a + 6) - 0.12) {
    // the hospital: waiting for midnight
    const q = (t - S(a + 6)) / Math.max(0.1, t1 - S(a + 6));
    return (
      <AbsoluteFill>
        <Frame t={t} cam={cuts(t, [[0, C(900, 560, 1.2), C(760, 600, 1.9)]], t1)} take={1}>
          <Hospital t={t} clock={lerp(10.4, 12, Math.min(1, q * 1.25))}>
            <Person x={710} y={960 + 114} look={YOU} mood="sad" t={t} p={pose("sit", { head: -16, lean: 6, turn: 0.2 })} shadow={false} lookY={0.8} seed={1} />
            <Tag t={t} at={S(a + 6) + 1.0} x={520} y={420} text="WAITING FOR MIDNIGHT" bg="#DCE6FF" size={36} />
          </Hospital>
        </Frame>
        <TakeHud t={t} take={1} from={0} />
        <Rewind t={t} from={t1 - 0.9} to={t1} />
      </AbsoluteFill>
    );
  }
  if (t >= S(a + 5) - 0.12) {
    // what happened at 7:42
    const i = a + 5, hit = F(i, 0.62), tx = lerp(-700, 880, ease(t, F(i, 0.3), hit));
    return (
      <AbsoluteFill>
        <Frame t={t} cam={cuts(t, [[0, C(960, 560, 1.1), C(1000, 600, 1.35)]], hit)} take={1} shake={t > hit - 0.4 && t < hit ? 0.6 : 0}>
          <Street t={t} light="red">
            <Car x={lerp(1900, 1180, ease(t, S(i), hit))} y={985} t={t} flip />
            <Truck x={tx} y={900} t={t} />
            <Tag t={t} at={S(i) + 0.4} x={lerp(1900, 1180, ease(t, S(i), hit))} y={730} text="MOM'S CAR" bg="#D8607A" fg="#FFFFFF" size={36} />
            <Tag t={t} at={F(i, 0.4)} x={1236} y={230} text="RED LIGHT" bg="#FF3B3B" fg="#FFFFFF" size={40} />
          </Street>
        </Frame>
        {t >= hit && <AbsoluteFill style={{ background: "#FFFFFF", opacity: 1 - ease(t, hit, hit + 0.5) * 0.0 }} />}
        {t >= hit && <AbsoluteFill style={{ background: "#0A1230", opacity: ease(t, hit + 0.1, hit + 0.6) }}><svg viewBox="0 0 1920 1080"><g transform={`translate(960 520) scale(${pop(t, hit + 0.5)})`}><rect x={-420} y={-110} width={840} height={220} rx={30} fill="#D9434F" /><T x={0} y={36} s={120} w={900}>IN SURGERY</T></g></svg></AbsoluteFill>}
        <TakeHud t={t} take={1} from={0} /><Chip t={t} from={S(i)} to={hit} text="7:42 PM" />
      </AbsoluteFill>
    );
  }
  const ans = S(a + 3), off = S(a + 4), ring = F(a + 4, 0.6);
  const screen = t < F(a, 0.7) ? <g><T x={420} y={170} s={90} w={900} c="#FFE14A">THE $1,000,000</T><T x={420} y={270} s={90} w={900}>QUESTION</T></g>
    : t < ans ? <Q q={["WHICH PLANET HAS", "THE LONGEST DAY?"]} sub={t > S(a + 2) + 0.9 ? "JUPITER?" : undefined} subC="#FFFFFF" />
      : <Q q={["WHICH PLANET HAS", "THE LONGEST DAY?"]} sub="VENUS" subC="#6BFFA6" bg={t < ans + 0.4 ? "#7A1420" : undefined} />;
  const cam = cuts(t, [[0, WIDE, C(960, 520, 1.15)], [F(a, 0.7), C(640, 560, 1.9)], [S(a + 1) - 0.1, C(960, 370, 1.6)], [F(a + 1, 0.6), C(640, 520, 2.5)], [S(a + 2) - 0.1, C(1260, 520, 2.5)], [ans - 0.1, C(960, 370, 1.6)], [ans + 1.2, C(640, 520, 2.4)], [off - 0.1, C(1300, 560, 1.5), C(1600, 560, 1.7)], [ring, C(1600, 600, 2.6)]], S(a + 5));
  const wx = t < off ? 1260 : lerp(1260, 1640, ease(t, off, ring));
  return (
    <AbsoluteFill>
      <Frame t={t} cam={cam} take={1}>
        <Studio t={t} screen={screen}>
          <Person x={640} y={985} look={HOST} mood={t >= ans ? "sad" : "happy"} t={t} p={pose(t < S(a + 1) ? "holdUp" : t >= ans ? "shrug" : "hold", { turn: 0.5 })} lookX={0.7} {...say(t, "HOST")} seed={5} hold={<g transform="translate(0 -30) rotate(-10) scale(0.6)"><Envelope open={ease(t, F(a, 0.6), F(a, 0.9))} label="" /></g>} lightDir={1} />
          <Podium x={1260} y={990} />
          <Person x={wx} y={985} look={YOU} mood={t >= off ? (t > ring ? "shocked" : "smug") : t >= ans ? "smug" : "nervous"} t={t} p={t >= ring ? pose("phone", { turn: 0.3 }) : t >= off ? pose(walk(t), { turn: 0.6 }) : pose(t >= S(a + 2) ? "shrug" : "stand", { turn: -0.5 })} flip={t < off} lookX={0.7} {...say(t, "YOU")} seed={1} cut={t < off ? -200 : undefined} hold={t >= ring ? <g transform="rotate(-10)"><PhoneUp /></g> : undefined} />
          {t >= ring && <Tag t={t} at={ring} x={1640} y={300} text="COUNTY HOSPITAL CALLING" bg="#FF3B3B" fg="#FFFFFF" size={34} />}
        </Studio>
      </Frame>
      <TakeHud t={t} take={1} from={S(a) - 0.3} big />
      <Chip t={t} from={S(a) + 0.8} to={off} text="SATURDAY · 8:00 PM · LIVE" />
    </AbsoluteFill>
  );
};

// ---------- 10. the show, take 2 ----------
const Split: React.FC<{ left: React.ReactNode; right: React.ReactNode }> = ({ left, right }) => (
  <AbsoluteFill>
    <AbsoluteFill style={{ clipPath: "polygon(0 0, 54% 0, 46% 100%, 0 100%)" }}>{left}</AbsoluteFill>
    <AbsoluteFill style={{ clipPath: "polygon(54% 0, 100% 0, 100% 100%, 46% 100%)" }}>{right}</AbsoluteFill>
    <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}><line x1={1037} y1={-10} x2={883} y2={1090} stroke="#FFFFFF" strokeWidth={14} /></svg>
  </AbsoluteFill>
);
const Final2: React.FC<ShotProps> = ({ t, t1 }) => {
  const a = first("final2");
  const L3 = S(a + 3), L4 = S(a + 4), L5 = S(a + 5), L6 = S(a + 6), L7 = S(a + 7), L8 = S(a + 8), L9 = S(a + 9), L10 = S(a + 10), L11 = S(a + 11);
  if (t < L3 - 0.12) {
    // the call: keep her on the phone
    const mins = keys(t, [[S(a + 1), 0], [L3 - 0.3, 3]]);
    const left = (
      <Frame t={t} cam={cuts(t, [[0, C(820, 560, 1.6), C(800, 540, 1.9)]], L3)} take={2}>
        <Backstage t={t}><Person x={760} y={985} look={YOU} mood={t < S(a + 1) ? "determined" : "nervous"} t={t} p={pose("phone", { turn: 0.3 })} lookX={0.3} {...say(t, "YOU")} seed={1} hold={<g transform="rotate(-10)"><PhoneUp /></g>} sweat /></Backstage>
      </Frame>);
    const right = (
      <Frame t={t} cam={cuts(t, [[0, C(900, 540, 1.3), C(940, 520, 1.6)]], L3)} take={2}>
        <Kitchen t={t}><Person x={1240} y={985} look={MOM} mood={t >= S(a + 2) - 0.1 ? "happy" : "neutral"} t={t} p={pose("phone", { turn: -0.3 })} flip lookX={0.2} {...say(t, "MOM")} seed={4} hold={<g transform="rotate(-10)"><PhoneUp c="#D8607A" /></g>} holdL={<g transform="translate(0 20)"><circle r={14} fill="none" stroke="#C9CED8" strokeWidth={5} /><rect x={-4} y={12} width={8} height={36} rx={3} fill="#C9CED8" /></g>} />
          <Tag t={t} at={S(a + 1) + 0.5} x={1080} y={330} text="CAR KEYS IN HAND" bg="#D8607A" fg="#FFFFFF" size={34} /></Kitchen>
      </Frame>);
    return (
      <AbsoluteFill>
        {t < S(a + 1) - 0.1 ? left : <Split left={left} right={right} />}
        <TakeHud t={t} take={2} from={S(a) - 0.3} big />
        <Chip t={t} from={S(a) + 0.9} to={L3} text="7:30 PM" />
        {t >= S(a + 1) && <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", fontFamily: font, fontWeight: 900, fontSize: 54, color: "#FFE14A", WebkitTextStroke: "10px #0B0E1A", paintOrder: "stroke fill" }}>KEEP HER TALKING · {Math.floor(mins)} MIN</div>}
      </AbsoluteFill>
    );
  }
  if (t < L4 - 0.12) {
    const pass = F(a + 3, 0.5), tx = lerp(-800, 2700, ease(t, pass, pass + 1.5)), car = ease(t, F(a + 3, 0.8), L4);
    const mins = keys(t, [[L3, 3], [pass, 14]]);
    return (
      <AbsoluteFill>
        <Frame t={t} cam={cuts(t, [[0, C(960, 560, 1.1), C(1000, 580, 1.3)]], L4)} take={2} shake={t > pass + 0.3 && t < pass + 1 ? 0.4 : 0}>
          <Street t={t} light={t > F(a + 3, 0.8) ? "green" : "red"}>
            <Truck x={tx} y={900} t={t} />
            {car > 0 && <Car x={lerp(2300, 700, car)} y={985} t={t} flip />}
            <Tag t={t} at={pass + 0.2} until={F(a + 3, 0.8)} x={960} y={560} text="EMPTY INTERSECTION" bg="#3BE07A" size={56} />
            <Tag t={t} at={F(a + 3, 0.85)} x={960} y={560} text="MOM: SAFE" bg="#3BE07A" size={64} />
          </Street>
        </Frame>
        <TakeHud t={t} take={2} from={0} /><Chip t={t} from={L3} to={L4} text="7:42 PM" />
        {t < pass && <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", fontFamily: font, fontWeight: 900, fontSize: 54, color: "#FFE14A", WebkitTextStroke: "10px #0B0E1A", paintOrder: "stroke fill" }}>KEEP HER TALKING · {Math.floor(mins)} MIN</div>}
      </AbsoluteFill>
    );
  }
  if (t >= L8 - 0.1 && t < L9 - 0.1) {
    // the memory: a Tuesday that never happened
    const aq = first("aquarium");
    const mt = F(aq + 1, 0.3) + (t - L8) * 0.6;
    return (
      <AbsoluteFill>
        <AquariumShot t={mt} a={aq} cam={cuts(t, [[0, C(1130, 440, 1.5), C(1150, 400, 2.0)]], L9)} />
        <AbsoluteFill style={{ boxShadow: "inset 0 0 260px 120px #FFFFFF", opacity: 0.55 }} />
        <TakeHud t={t} take={1} from={0} />
        <Flash t={t} at={L8 - 0.1} d={0.5} />
      </AbsoluteFill>
    );
  }
  const late = t < L5 - 0.1, newEnv = t >= L5 - 0.1, asked = t >= L7 - 0.1, answered = t >= L9 - 0.1, right = t >= L10 - 0.1, won = t >= L11 - 0.1;
  const timer = asked ? Math.max(1, 30 - (t - L7) * 1.9) : 30;
  const screen = won ? <g><rect width={840} height={390} fill="#0E3A22" /><T x={420} y={230} s={150} w={900} c="#6BFFA6">$1,000,000</T></g>
    : right ? <g><rect width={840} height={390} fill={Math.floor(t * 8) % 2 ? "#1F7A45" : "#2FA35A"} /><T x={420} y={235} s={150} w={900}>CORRECT!</T></g>
      : answered ? <Q q={["WHAT COLOR IS AN", "OCTOPUS'S BLOOD?"]} sub="BLUE" subC="#7FB0FF" timer={timer} bg="#16306A" />
        : asked ? <Q q={["WHAT COLOR IS AN", "OCTOPUS'S BLOOD?"]} timer={timer} />
          : t >= L6 - 0.1 ? <g><T x={420} y={150} s={64} w={900}>A NEW QUESTION</T><T x={420} y={290} s={150} w={900} c="#FFE14A">0:30</T></g>
            : newEnv ? <g><T x={420} y={220} s={84} w={900} c="#FFE14A">NEW ENVELOPE</T></g>
              : <Q q={["WHICH PLANET HAS", "THE LONGEST DAY?"]} sub="VENUS ✓" subC="#6BFFA6" />;
  const run = ease(t, L4, F(a + 4, 0.4));
  const cam = cuts(t, [[0, C(1300, 560, 1.3), C(1100, 540, 1.2)], [F(a + 4, 0.45), C(1000, 420, 1.7), C(1200, 480, 2.0)], [L5 - 0.1, C(640, 540, 2.2)], [L6 - 0.1, C(1560, 520, 2.4), C(1560, 500, 3.0)], [L7 - 0.1, C(640, 520, 2.3)], [F(a + 7, 0.4), C(960, 370, 1.6)], [L9 - 0.1, C(1560, 510, 2.8), C(1560, 500, 3.3)], [L10 - 0.1, C(640, 520, 2.2)], [F(a + 10, 0.5), C(960, 500, 1.15)], [L11 - 0.1, C(960, 370, 1.6)], [F(a + 11, 0.3), C(300, 600, 2.3)], [F(a + 11, 0.55), C(1700, 600, 2.4), C(1700, 590, 2.8)]], t1);
  return (
    <AbsoluteFill>
      <Frame t={t} cam={cam} take={2} shake={right && t < L10 + 0.5 ? 0.5 : 0}>
        <Studio t={t} screen={screen} cheer={right} dim={asked && !right ? 0.5 : 0}>
          <Person x={640} y={985} look={HOST} mood={right ? "laugh" : newEnv ? "happy" : "neutral"} t={t} p={pose(right ? "cheer" : newEnv ? "holdUp" : "hold", { turn: 0.5 })} lookX={0.7} {...say(t, "HOST")} seed={5} hold={<g transform="translate(0 -30) rotate(-10) scale(0.6)"><Envelope open={asked ? 1 : 0} label={newEnv ? "NEW" : ""} /></g>} lightDir={1} />
          <Podium x={1260} y={990} />
          {late && <Person x={1260} y={985} look={{ ...extra(5), top: "#5FA86A" }} mood="happy" t={t} p={pose("cheer", { turn: -0.4 })} flip seed={12} cut={-200} hold={<g transform="translate(0 -20) scale(0.5)"><Envelope open={1} label="YOURS" /></g>} />}
          {late && <Tag t={t} at={F(a + 4, 0.6)} x={1260} y={250} text="BACKUP CONTESTANT · YOUR ENVELOPE" bg="#FF5C5C" fg="#FFFFFF" size={34} />}
          <Person x={late ? lerp(2100, 1620, run) : 1560} y={985} look={YOU} mood={won ? "happy" : right ? "shocked" : answered ? "determined" : asked ? "worried" : t >= L6 - 0.1 ? "shocked" : "nervous"} t={t} flip
            p={late && run < 1 ? pose(walk(t, 1.4), { turn: 0.6 }) : right ? pose("cheer") : answered ? pose("point", { turn: 0.4, aR: 120, eR: 20 }) : pose({ turn: 0.5 })} lookX={0.7} {...say(t, "YOU")} seed={1} sweat={!right && !answered} />
          {won && <g>{Array.from({ length: 70 }, (_, k) => <rect key={k} x={(rnd(k) * 2100) - 90} y={((t - L10) * (260 + rnd(k + 5) * 300) + rnd(k + 9) * 1100) % 1150 - 60} width={18} height={30} rx={4} fill={["#FFE14A", "#FF5CA8", "#5BE0FF", "#6BFFA6"][k % 4]} transform={`rotate(${t * 200 + k * 31} ${(rnd(k) * 2100) - 90} ${500})`} />)}</g>}
          {right && !won && <g>{Array.from({ length: 50 }, (_, k) => <rect key={k} x={(rnd(k) * 2100) - 90} y={((t - L10) * (300 + rnd(k + 5) * 300) + rnd(k + 9) * 1100) % 1150 - 60} width={18} height={30} rx={4} fill={["#FFE14A", "#FF5CA8", "#5BE0FF", "#6BFFA6"][k % 4]} />)}</g>}
          {won && <Person x={300} y={1010} look={THEO} mood="laugh" t={t} p={pose("cheer", { y: -30 - Math.abs(Math.sin(t * 9)) * 40 })} seed={2} talk />}
          {won && <Person x={1700} y={1010} look={MOM} mood="cry" t={t} p={pose("holdBoth", { turn: -0.3 })} flip seed={4} tear />}
          {won && <Tag t={t} at={F(a + 11, 0.3)} until={F(a + 11, 0.55)} x={300} y={330} text="THEO" bg="#F08A3C" size={44} />}
          {won && <Tag t={t} at={F(a + 11, 0.55)} x={1700} y={330} text="MOM · ROW 3" bg="#D8607A" fg="#FFFFFF" size={44} />}
        </Studio>
      </Frame>
      <TakeHud t={t} take={2} from={0} />
      {late && <Chip t={t} from={L4} to={L5} text="8:14 PM · 14 MINUTES LATE" />}
      {t >= L6 - 0.1 && t < L7 - 0.1 && <Slam t={t} at={F(a + 6, 0.62)} until={L7 - 0.1} text="NO TAKE 2" color="#FF5C5C" size={170} y={50} x={-420} />}
      {asked && !right && t < L8 - 0.1 && <div style={{ position: "absolute", right: 60, top: 130, fontFamily: font, fontWeight: 900, fontSize: 150, color: timer < 12 ? "#FF5C5C" : "#FFE14A", WebkitTextStroke: "16px #0B0E1A", paintOrder: "stroke fill", transform: `scale(${1 + 0.08 * Math.sin(t * 12)})` }}>{Math.ceil(timer)}</div>}
      <Flash t={t} at={L10 - 0.1} />
      {won && <Slam t={t} at={L11} until={F(a + 11, 0.3)} text="$1,000,000" color="#6BFFA6" size={220} y={420} rot={-4} />}
    </AbsoluteFill>
  );
};

// ---------- 11. the twist, the end card ----------
const Twist: React.FC<ShotProps> = ({ t, t1 }) => {
  const a = first("twist");
  const L1 = S(a + 1), L2 = S(a + 2), L3 = S(a + 3), L4 = S(a + 4), L5 = S(a + 5), L6 = S(a + 6);
  const cam = cuts(t, [[0, C(960, 540, 1.2), C(1000, 530, 1.4)], [L1 - 0.1, C(1180, 520, 2.6)], [L2 - 0.1, C(760, 520, 2.6)], [L3 - 0.1, C(1180, 520, 2.4), C(1180, 510, 2.8)], [L4 - 0.1, C(960, 500, 1.5), C(960, 480, 1.7)], [L5 - 0.1, C(760, 520, 2.7)], [L6 - 0.1, C(1180, 520, 2.5), C(1300, 520, 2.2)]], t1);
  const leave = ease(t, F(a + 6, 0.35), t1 + 0.6);
  return (
    <AbsoluteFill>
      <Frame t={t} cam={cam} take={2}>
        <Backstage t={t}>
          <Person x={760} y={985} look={YOU} mood={at<Mood>(t, [[0, "happy"], [L1 + 0.5, "nervous"], [L2 + 1.6, "shocked"], [L3, "shocked"], [L5, "worried"], [L6 + 1.2, "love"]])} t={t} p={poseAt(t, [[0, pose({ turn: 0.6 })], [L2, pose("shrug", { turn: 0.6 })], [L3 + 0.4, pose("facepalm", { turn: 0.5 })], [L4, pose({ turn: 0.6 })], [L5, pose("shrug", { turn: 0.6 })], [L6 + 1, pose({ turn: 0.6 })]])} lookX={0.8} {...say(t, "YOU")} seed={1} />
          <Person x={1180 + leave * 330} y={985} look={AVA} mood={at<Mood>(t, [[0, "smug"], [L3, "happy"], [L4, "smug"], [L6, "happy"]])} t={t} p={leave > 0.02 ? pose(walk(t, 0.7), { turn: -0.2 }) : pose(t >= L3 && t < L4 ? "think" : "hips", { turn: -0.6 })} flip={leave < 0.02 || true} lookX={0.8} {...say(t, "AVA")} seed={3} />
          {/* she remembers: the table, in a thought bubble */}
          {t >= L3 + 0.3 && t < L4 - 0.1 && <g transform={`translate(1500 300) scale(${pop(t, L3 + 0.3)})`}>
            <circle r={170} fill="#DCE6FF" stroke="#0B0E1A" strokeWidth={8} /><circle cx={-150} cy={150} r={26} fill="#DCE6FF" stroke="#0B0E1A" strokeWidth={6} /><circle cx={-200} cy={200} r={14} fill="#DCE6FF" stroke="#0B0E1A" strokeWidth={5} />
            <rect x={-120} y={50} width={240} height={22} rx={8} fill="#8FA0B0" /><g transform="translate(0 52) scale(0.42)"><Person x={0} y={0} look={YOU} mood="shocked" t={t} p={pose("holdUp")} hold={<Flowers s={1.1} />} shadow={false} seed={1} /></g>
            <T x={0} y={130} s={30} w={900} c="#5B6274">TAKE 1 · MONDAY</T>
          </g>}
          {t >= L4 && t < L5 - 0.1 && <g>
            {[760, 1180].map((x, k) => <g key={x} transform={`translate(${x} 290) scale(${pop(t, L4 + 0.3 + k * 0.5) * 0.5})`}><Clapper take={2} t={t} at={L4 + 0.6 + k * 0.5} /></g>)}
          </g>}
        </Backstage>
      </Frame>
      <TakeHud t={t} take={2} from={0} />
      <Slam t={t} at={L4 + 0.2} until={L5 - 0.1} text="SHE LIVES EVERY DAY TWICE TOO" color="#B79CFF" size={84} y={40} x={-160} />
      <Slam t={t} at={F(a + 6, 0.3)} until={t1} text="ASK ME ON A DAY THAT COUNTS" color="#FFE14A" size={78} y={50} x={-240} />
    </AbsoluteFill>
  );
};
const EndCard: React.FC<ShotProps> = ({ t, t0 }) => {
  const words = ["WHAT", "WOULD", "YOU", "DO", "ON", "THE", "DAY", "THAT", "DOESN'T", "COUNT?"];
  return (
    <Dark t={t} c="#2A1E5E">
      <g transform={`translate(520 300) scale(${pop(t, t0 + 0.2) * 1.1}) rotate(-5)`}><Clapper take={1} t={t} at={t0 + 0.6} /></g>
      <g transform={`translate(1400 300) scale(${pop(t, t0 + 0.5) * 1.1}) rotate(5)`}><Clapper take={2} t={t} at={t0 + 0.9} /></g>
      {[words.slice(0, 5), words.slice(5)].map((row, r) => { let x = 0; const ws = row.map((w) => { const o = x; x += w.length * 74 + 60; return [w, o] as [string, number]; }); return ws.map(([w, o], k) => <g key={w + r} transform={`translate(${960 - x / 2 + o + (w.length * 74) / 2} ${700 + r * 130}) scale(${pop(t, t0 + 1.2 + (r * 5 + k) * 0.12)})`}><T x={0} y={0} s={108} w={900} c={["DOESN'T", "COUNT?"].includes(w) ? "#FFE14A" : "#FFFFFF"}>{w}</T></g>); })}
      {Array.from({ length: 40 }, (_, k) => <circle key={k} cx={200 + k * 39} cy={980 + Math.sin(t * 5 + k * 0.6) * 10 * (speaking(t, "NARRATOR") ? 1 : 0.2)} r={5} fill="#7FE3DD" opacity={0.7} />)}
    </Dark>
  );
};

const shots: Record<string, React.FC<ShotProps>> = { cold_open: ColdOpen, promise: Promise, rules: Rules, school: School, cards: Cards, lottery: Lottery, storage: StorageScene, cost: Cost, aquarium: AquariumScene, offer: Offer, final1: Final1, final2: Final2, twist: Twist, endcard: EndCard };
const SHOTS: { name: string; a: number; b: number }[] = [];
L.forEach((l, i) => { const last = SHOTS[SHOTS.length - 1]; if (last && last.name === l.scene) last.b = i; else SHOTS.push({ name: l.scene, a: i, b: i }); });
const shotStart = (k: number) => (k === 0 ? 0 : (E(SHOTS[k - 1].b) + S(SHOTS[k].a)) / 2);
const COLORS: Record<string, string> = { THEO: "#FFB37A", YOU: "#7FE3DD", AVA: "#C9B0FF", MOM: "#FF9EC0", HOST: "#FFE14A", OWNER: "#B8E0B8" };

export const Episode: React.FC<{ captions?: boolean }> = ({ captions = true }) => {
  const { t } = useT();
  let k = 0;
  while (k + 1 < SHOTS.length && t >= shotStart(k + 1)) k++;
  const Shot = shots[SHOTS[k].name];
  const t0 = shotStart(k), t1 = k + 1 < SHOTS.length ? shotStart(k + 1) : DURATION;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Shot t={t} t0={t0} t1={t1} />
      {SHOTS[k].name !== "endcard" && <Money t={t} />}
      {captions && <Captions t={t} lines={L} colors={COLORS} />}
      {!("estimated" in timeline) && <Audio src={staticFile("twice/mix.wav")} />}
    </AbsoluteFill>
  );
};
