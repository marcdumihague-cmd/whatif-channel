// "What If You Could Call Anyone Who Died, for One Minute?" Shots are keyed by each line's `scene` and
// timed from public/one-minute/timeline.json, so re-voicing re-times everything.
import React from "react";
import { AbsoluteFill, Audio, interpolate, staticFile } from "remotion";
import timeline from "../../public/one-minute/timeline.json";
import { P, useT, ease, pop, Camera, Rain, Bokeh, Glow, Backdrop, Shadow, Person, Head, YOU, THEO, extra, Chip, Counter, StatCard, Title, DotLine, Mood, Look } from "../ll/kit";

type Line = (typeof timeline.lines)[number] & { caption?: string };
const L: Line[] = timeline.lines as Line[];
export const DURATION = timeline.duration;
const S = (i: number) => L[i].start;
const E = (i: number) => L[i].end;
const font = "'Inter Display', Inter, sans-serif";
// first line index of a scene
const first = (scene: string) => L.findIndex((l) => l.scene === scene);
const last = (scene: string) => L.length - 1 - [...L].reverse().findIndex((l) => l.scene === scene);
const lineOf = (scene: string, who: string, n = 0) => L.findIndex((l, i) => l.scene === scene && l.who === who && (n-- === 0));

const SHOTS: { name: string; a: number; b: number }[] = [];
L.forEach((l, i) => {
  const lastShot = SHOTS[SHOTS.length - 1];
  if (lastShot && lastShot.name === l.scene) lastShot.b = i; else SHOTS.push({ name: l.scene, a: i, b: i });
});
const shotStart = (k: number) => (k === 0 ? 0 : (E(SHOTS[k - 1].b) + S(SHOTS[k].a)) / 2);
const speaking = (t: number, who: string) => L.some((l) => l.who === who && t >= l.start && t <= l.end);
type ShotProps = { t: number; t0: number; t1: number };

// ---------- cast ----------
const GRANDPA: Look = { skin: P.skin, hair: "#E8E4DC", top: "#8A6A4F", topDark: "#6F543E", hairStyle: "bald", glasses: true, mustache: "#E8E4DC" };
const GRANDMA: Look = { skin: P.skin, hair: "#D9D6D0", top: "#9C86B8", topDark: "#806C9E", hairStyle: "bun", glasses: true };
const MOM: Look = { skin: P.skin, hair: "#5A3A2A", top: "#C66B7A", topDark: "#A85563", hairStyle: "long" };
const EINSTEIN: Look = { skin: P.skin, hair: "#F2F0EA", top: "#7A7F8C", topDark: "#62666F", hairStyle: "wild", mustache: "#E6E3DC" };
const TRADER: Look = { skin: P.skin2, hair: "#1E1A18", top: "#2B3352", topDark: "#1F2640", hairStyle: "short" };
const SARAH: Look = { skin: P.skin2, hair: "#2E2522", top: "#D9474B", topDark: "#B53A3E", hairStyle: "long" };
const HAROLD: Look = { skin: P.skin3, hair: "#BDBDBD", top: "#5E7A62", topDark: "#4A6350", hairStyle: "bald", glasses: true };
const EDDIE: Look = { skin: P.skin2, hair: "#CFCFCF", top: "#3F5F8A", topDark: "#324C70", hairStyle: "short", mustache: "#CFCFCF" };

// ---------- props ----------
const RotaryPhone: React.FC<{ x: number; y: number; s?: number; t: number; lit?: number; lifted?: boolean; ring?: boolean }> = ({ x, y, s = 1, t, lit = 0, lifted = false, ring = false }) => {
  const shake = ring ? Math.sin(t * 60) * 4 : 0;
  return (
    <g transform={`translate(${x + shake} ${y}) scale(${s})`}>
      {lit > 0 && <Glow cx={0} cy={-40} r={260} color="#FFC870" opacity={0.45 * lit} id={`pglow${x}`} />}
      <Shadow cx={0} cy={10} rx={150} />
      <path d="M -140 0 L -110 -110 Q -100 -130 -80 -130 L 80 -130 Q 100 -130 110 -110 L 140 0 Z" fill="#D9474B" />
      <circle cx={0} cy={-62} r={58} fill="#E9E1D2" />
      {Array.from({ length: 10 }, (_, i) => {
        const a = (-60 + i * 30) * Math.PI / 180;
        return <circle key={i} cx={Math.cos(a) * 38} cy={-62 + Math.sin(a) * 38} r={9} fill="#2E2A30" />;
      })}
      <circle cx={0} cy={-62} r={16} fill="#C9A14A" />
      {!lifted && <path d="M -150 -140 Q -150 -175 -110 -175 L 110 -175 Q 150 -175 150 -140 L 120 -130 Q 110 -150 80 -150 L -80 -150 Q -110 -150 -120 -130 Z" fill="#C23E42" />}
      {ring && [0, 1, 2].map((i) => <path key={i} d={`M ${-170 - i * 22} -190 q -14 30 0 60 M ${170 + i * 22} -190 q 14 30 0 60`} stroke={P.gold} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.4 + 0.6 * Math.abs(Math.sin(t * 9 + i))} />)}
    </g>
  );
};

const Handset: React.FC = () => (
  <g transform="rotate(-20)"><rect x={-18} y={-90} width={36} height={180} rx={18} fill="#D9474B" /><ellipse cx={0} cy={-92} rx={30} ry={22} fill="#D9474B" /><ellipse cx={0} cy={92} rx={30} ry={22} fill="#D9474B" /></g>
);

// Golden memory bubble for the dead, with a soft grain flicker.
const DeadBubble: React.FC<{ t: number; at: number; until?: number; cx: number; cy: number; r: number; look: Look; mood: Mood; talk: boolean; id: string }> = ({ t, at, until = 1e9, cx, cy, r, look, mood, talk, id }) => {
  const p = pop(t, at) * (1 - ease(t, until, until + 0.4));
  if (p <= 0.001) return null;
  return (
    <g transform={`translate(${cx} ${cy}) scale(${p})`}>
      <Glow cx={0} cy={0} r={r * 1.6} color="#FFC870" opacity={0.5} id={`${id}g`} />
      <circle r={r + 12} fill="#F7E3B8" opacity={0.9} />
      <clipPath id={id}><circle r={r} /></clipPath>
      <g clipPath={`url(#${id})`}>
        <circle r={r} fill="#6B4E36" />
        <circle r={r} fill="#FFD9A0" opacity={0.18 + 0.05 * Math.sin(t * 13)} />
        <g transform={`translate(0 ${r * 0.95}) scale(${r / 330})`}><Person x={0} y={0} look={look} mood={mood} t={t} talk={talk} /></g>
      </g>
    </g>
  );
};

// 60-second countdown ring; counts from 60 to 0 between a and b (compressed to the shot).
const CallTimer: React.FC<{ t: number; a: number; b: number; x?: number; y?: number }> = ({ t, a, b, x = 960, y = 120 }) => {
  if (t < a - 0.3 || t > b + 1.2) return null;
  const k = Math.max(0, Math.min(1, (t - a) / (b - a)));
  const secs = Math.ceil(60 * (1 - k));
  const r = 62, c = 2 * Math.PI * r;
  const done = t >= b;
  return (
    <div style={{ position: "absolute", left: x - 80, top: y - 80, width: 160, height: 160, opacity: pop(t, a - 0.3) }}>
      <svg viewBox="-80 -80 160 160" width={160} height={160}>
        <circle r={70} fill="rgba(20,24,36,0.85)" />
        <circle r={r} fill="none" stroke="#3A4766" strokeWidth={10} />
        <circle r={r} fill="none" stroke={done || secs <= 10 ? P.red : "#FFC870"} strokeWidth={10} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * k} transform="rotate(-90)" />
        <text y={16} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={44} fill={done ? P.red : P.white}>0:{String(secs).padStart(2, "0")}</text>
      </svg>
    </div>
  );
};

const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>{children}</svg>;

const NightRoom: React.FC<{ t: number; clock?: string; rain?: boolean }> = ({ t, clock = "3:07", rain = true }) => (
  <Backdrop base={P.night} light={P.dusk} cx={30} cy={35}>
    <rect x={200} y={130} width={480} height={380} rx={8} fill="#141A28" />
    {Array.from({ length: 12 }, (_, i) => <rect key={i} x={230 + (i * 71) % 420} y={350 + (i * 53) % 140} width={10} height={12} fill={P.gold} opacity={Math.sin(t * 0.7 + i * 2) > -0.3 ? 0.8 : 0.15} />)}
    {rain && <Rain t={t} x={200} y={130} w={480} h={380} n={40} />}
    <rect x={200} y={130} width={480} height={380} rx={8} fill="none" stroke="#3C4866" strokeWidth={18} />
    <line x1={440} y1={130} x2={440} y2={510} stroke="#3C4866" strokeWidth={12} />
    <rect x={1180} y={150} width={220} height={280} rx={10} fill="#2C3852" />
    <rect x={1200} y={170} width={180} height={240} rx={6} fill="#4A5A80" />
    <g transform="translate(1290 330) scale(0.32)"><Head look={GRANDPA} mood="happy" t={t} /></g>
    <rect y={860} width={1920} height={220} fill="#18202F" />
    <rect x={760} y={700} width={420} height={160} rx={14} fill="#2C3852" />
    <rect x={1240} y={640} width={160} height={60} rx={12} fill="#10141F" />
    <text x={1320} y={683} textAnchor="middle" fontFamily="monospace" fontWeight={700} fontSize={34} fill={P.red}>{clock}</text>
    <Glow cx={1320} cy={670} r={100} color={P.red} opacity={0.22} id="clk" />
    <Bokeh t={t} n={10} opacity={0.12} />
  </Backdrop>
);

const Kitchen: React.FC<{ t: number; night?: boolean; drawerOpen?: number }> = ({ t, night = false, drawerOpen = 0 }) => (
  <Backdrop base={night ? "#2A2630" : "#D9C3AC"} light={night ? "#4D4458" : "#F4E6D6"} cx={35} cy={30}>
    {Array.from({ length: 12 }, (_, i) => <rect key={i} x={i * 160} y={0} width={80} height={860} fill={night ? "#2F2A36" : "#D2BBA3"} opacity={0.5} />)}
    <rect x={180} y={150} width={380} height={300} rx={10} fill={night ? "#141A28" : P.sky} />
    {night && <Rain t={t} x={180} y={150} w={380} h={300} n={30} />}
    <rect x={180} y={150} width={380} height={300} rx={10} fill="none" stroke={night ? "#4A4252" : P.cream} strokeWidth={16} />
    {/* cabinet with drawers */}
    <rect x={1380} y={520} width={420} height={340} rx={12} fill={night ? "#5A4434" : P.wood} />
    {[0, 1, 2].map((i) => (
      <g key={i} transform={`translate(${i === 1 ? -drawerOpen * 120 : 0} 0)`}>
        <rect x={1400} y={540 + i * 105} width={380} height={90} rx={8} fill={night ? "#6A5240" : "#C99D74"} />
        <rect x={1560} y={578 + i * 105} width={60} height={14} rx={7} fill={P.gold} />
      </g>
    ))}
    <rect y={860} width={1920} height={220} fill={night ? "#1E1A22" : "#A97E58"} />
    {/* table */}
    <rect x={560} y={700} width={760} height={34} rx={12} fill={night ? "#6A5240" : P.woodDark} />
    <rect x={600} y={734} width={30} height={160} fill={night ? "#5A4434" : P.woodDark} />
    <rect x={1250} y={734} width={30} height={160} fill={night ? "#5A4434" : P.woodDark} />
    <Glow cx={940} cy={160} r={420} color="#FFD98A" opacity={night ? 0.3 : 0.2} id="kitlamp" />
    <Bokeh t={t} n={10} opacity={0.12} color="#FFE9C4" />
  </Backdrop>
);

// someone talking on the rotary phone at a desk, seen from the side
const Caller: React.FC<{ t: number; look: Look; mood: Mood; who: string; x?: number; flip?: boolean; lit?: number }> = ({ t, look, mood, who, x = 620, flip = false, lit = 1 }) => (
  <g>
    <rect x={x - 260} y={760} width={520} height={30} rx={12} fill="#2C3852" />
    <RotaryPhone x={x + (flip ? -150 : 150)} y={760} s={0.7} t={t} lit={lit} lifted />
    <Person x={x} y={1000} look={look} mood={mood} t={t} talk={speaking(t, who)} pose="phone" flip={flip} holding={<g transform="scale(0.6)"><Handset /></g>} />
  </g>
);

const card = (t: number, at: number, until: number, title: string, big: string, sub: string, color = P.orange, x = 1060, y = 300) => (
  <StatCard t={t} at={at} until={until} x={x} y={y} w={720} title={title} big={big} sub={sub} color={color} />
);

// ---------- shots ----------
const shots: Record<string, React.FC<ShotProps>> = {
  cold_open: ({ t, t0, t1 }) => {
    const gp = first("cold_open") + 2; // Grandpa's first line
    const connected = t > S(gp) - 0.6 && t < E(gp + 2) + 0.15;
    const mood: Mood = t > S(gp + 3) ? "sad" : t > S(gp + 1) ? "shocked" : t > S(1) ? "nervous" : "sad";
    return (
      <Camera t={t} t0={t0} t1={t1} from={1.02} to={1.14} fx={900} fy={640} punch={[S(gp + 1)]}>
        <NightRoom t={t} />
        <Svg>
          <Caller t={t} look={YOU} mood={mood} who="YOU" x={760} lit={connected ? 1 : 0} />
          <DeadBubble t={t} at={S(gp) - 0.3} until={E(gp + 2) + 0.1} cx={1450} cy={380} r={170} look={GRANDPA} mood="nervous" talk={speaking(t, "GRANDPA")} id="gp1" />
          {t > E(gp + 2) && t < E(gp + 2) + 0.7 && <text x={1450} y={400} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={110} fill={P.white} opacity={1 - ease(t, E(gp + 2) + 0.3, E(gp + 2) + 0.7)}>CLICK</text>}
        </Svg>
        <CallTimer t={t} a={S(gp) - 0.6} b={E(gp + 2) + 0.1} />
        <Chip t={t} at={t0 + 0.3} text="3:07 A.M." />
      </Camera>
    );
  },

  promise: ({ t, t0, t1 }) => {
    const items = [
      { at: t0 + 0.4, x: 420, look: EINSTEIN, label: "EINSTEIN" },
      { at: t0 + 1.4, x: 960, look: null, label: "$86,000" },
      { at: t0 + 2.6, x: 1500, look: GRANDMA, label: "THE SENTENCE" },
    ];
    return (
      <Camera t={t} t0={t0} t1={t1}>
        <Backdrop base={P.night} light={P.nightHi}>
          <Bokeh t={t} />
          {items.map((it, i) => {
            const p = pop(t, it.at);
            return p > 0 ? <g key={i} transform={`translate(${it.x} 470) scale(${p})`}>
              <circle r={190} fill="#F7E3B8" /><circle r={176} fill={i === 1 ? "#24543F" : "#3A2F45"} />
              {it.look ? <g transform="translate(0 150) scale(0.5)"><Person x={0} y={0} look={it.look} mood={i === 2 ? "sad" : "smug"} t={t + i} /></g>
                : <text y={30} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={84} fill="#6FD38F">$</text>}
              <text y={260} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={42} fill={P.cream}>{it.label}</text>
            </g> : null;
          })}
        </Backdrop>
      </Camera>
    );
  },

  rules: ({ t, t0, t1 }) => {
    const a = first("rules");
    const rules = [{ at: S(a + 1) + 0.2, txt: "60 SECONDS" }, { at: S(a + 1) + 1.6, txt: "1 CALL A DAY" }, { at: S(a + 1) + 3.0, txt: "EACH PERSON ONCE" }];
    const people = t > S(a + 3);
    return (
      <Camera t={t} t0={t0} t1={t1} punch={[S(a + 2) + 0.3]}>
        <Backdrop base="#2B3550" light="#4A5A80">
          <Bokeh t={t} />
          {!people && <>
            <RotaryPhone x={960} y={760} s={1.6} t={t} lit={ease(t, S(a), S(a) + 1)} />
            {rules.map((r, i) => {
              const p = pop(t, r.at);
              return p > 0 ? <g key={i} transform={`translate(${380 + i * 560} 330) scale(${p})`}><rect x={-230} y={-55} width={460} height={100} rx={50} fill={P.cream} /><text y={18} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={44} fill={P.ink}>{r.txt}</text></g> : null;
            })}
            {t > S(a + 2) && <g transform={`translate(960 470) scale(${pop(t, S(a + 2))})`}><rect x={-300} y={-50} width={600} height={90} rx={45} fill={P.red} /><text y={16} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={40} fill={P.white}>GRANDPA: USED</text></g>}
          </>}
          {people && Array.from({ length: 240 }, (_, i) => {
            const x = 80 + (i % 30) * 60, y = 220 + Math.floor(i / 30) * 80;
            const chosen = i % 8 === 3 && i < 240;
            const lit = chosen && t > S(a + 3) + 2 + (i / 240) * 2;
            return <g key={i} transform={`translate(${x} ${y})`} opacity={lit ? 1 : 0.35}><circle cy={-14} r={11} fill={lit ? "#FFC870" : "#AEB6CC"} /><rect x={-11} y={-2} width={22} height={26} rx={10} fill={lit ? "#FFC870" : "#AEB6CC"} /></g>;
          })}
        </Backdrop>
        {people && <div style={{ position: "absolute", top: 70, width: "100%", textAlign: "center", fontFamily: font, fontWeight: 900, color: P.white, fontSize: 70 }}>100,000,000,000+ <span style={{ color: "#FFC870" }}>· PICK 30</span></div>}
        <Chip t={t} at={t0 + 0.2} text="DAY 1" />
      </Camera>
    );
  },

  grandma: ({ t, t0, t1 }) => {
    const a = first("grandma");
    const taps = S(a + 4);
    const fact = S(a + 6);
    const gmMood: Mood = t > S(a + 5) ? "sad" : t > S(a + 3) ? "sad" : "neutral";
    return (
      <Camera t={t} t0={t0} t1={t1} fx={900} punch={[S(a + 3) + 2.4]}>
        <Kitchen t={t} />
        <Svg>
          <rect x={860} y={660} width={130} height={40} rx={4} fill={P.cream} transform="rotate(-6 925 680)" />
          {t > S(a + 1) && <g transform={`translate(925 560) scale(${pop(t, S(a + 1)) * (1 - ease(t, S(a + 2), S(a + 2) + 0.4))})`}><rect x={-170} y={-70} width={340} height={140} rx={16} fill={P.cream} /><text y={-14} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={34} fill={P.red}>FINAL NOTICE</text><text y={40} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={54} fill={P.ink}>$86,000</text></g>}
          <Person x={1100} y={1000} look={GRANDMA} mood={gmMood} t={t} talk={speaking(t, "GRANDMA")} flip lookX={-1} />
          <Person x={560} y={1000} look={YOU} mood={t > S(a + 2) ? "sad" : "neutral"} t={t} lookX={1} />
          {/* memory: Grandpa tapping the table */}
          {t > taps - 0.2 && t < fact && (
            <g transform={`translate(960 330) scale(${pop(t, taps - 0.2)})`}>
              <circle r={210} fill="#F7E3B8" /><clipPath id="tapmem"><circle r={196} /></clipPath>
              <g clipPath="url(#tapmem)"><circle r={196} fill="#6B4E36" /><rect x={-200} y={60} width={400} height={30} fill="#3A2A1E" />
                <g transform="translate(0 190) scale(0.55)"><Person x={0} y={0} look={GRANDPA} mood="happy" t={t} /></g>
                {[0, 1, 2].map((i) => { const at = taps + 0.6 + i * 0.45; const p = ease(t, at, at + 0.4); return t > at ? <circle key={i} cx={60} cy={70} r={20 + p * 60} fill="none" stroke="#FFC870" strokeWidth={6} opacity={1 - p} /> : null; })}
              </g>
              {[0, 1, 2].map((i) => t > taps + 0.6 + i * 0.45 ? <text key={i} x={-120 + i * 120} y={-150} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={44} fill="#FFC870">TAP</text> : null)}
            </g>
          )}
        </Svg>
        {card(t, fact + 0.4, E(a + 6), "HOSPICE STUDY · 2020", "STILL HEARING", "Dying brains still reacted to sound.", "#7FB5E0", 1100, 120)}
      </Camera>
    );
  },

  mom: ({ t, t0, t1 }) => (
    <Camera t={t} t0={t0} t1={t1} punch={[t0 + 1.2]} fx={1200}>
      <Kitchen t={t} night />
      <Svg>
        <Person x={600} y={1000} look={YOU} mood="nervous" t={t} lookX={1} />
        <Person x={1240} y={1000} look={MOM} mood="deadpan" t={t} talk={speaking(t, "MOM")} flip pose="point" />
      </Svg>
    </Camera>
  ),

  theo: ({ t, t0, t1 }) => {
    const a = first("theo");
    return (
      <Camera t={t} t0={t0} t1={t1} punch={[S(a + 1) + 0.6]} fx={1250}>
        <NightRoom t={t} clock="9:41" rain={false} />
        <Svg>
          <RotaryPhone x={960} y={760} s={0.9} t={t} />
          <Person x={600} y={1000} look={YOU} mood="smug" t={t} lookX={1} />
          <Person x={1300} y={1000} look={THEO} mood={t > S(a + 1) ? "happy" : "shocked"} t={t} talk={speaking(t, "THEO")} flip pose={t > S(a + 1) ? "cheer" : "stand"} />
        </Svg>
      </Camera>
    );
  },

  einstein: ({ t, t0, t1 }) => {
    const a = first("einstein");
    const call = [S(a + 1) - 0.5, E(a + 4) + 0.2];
    const youMood: Mood = t > S(a + 5) ? "deadpan" : t > S(a + 4) ? "nervous" : "happy";
    return (
      <Camera t={t} t0={t0} t1={t1} punch={[S(a + 4) + 0.4, S(a + 5) + 1.4]} fx={900}>
        <NightRoom t={t} clock="9:00" />
        <Svg>
          <Caller t={t} look={YOU} mood={youMood} who="YOU" x={700} lit={t > call[0] && t < call[1] ? 1 : 0} />
          <DeadBubble t={t} at={call[0]} until={call[1]} cx={1400} cy={400} r={180} look={EINSTEIN} mood={t > S(a + 4) ? "smug" : "neutral"} talk={speaking(t, "EINSTEIN")} id="ein" />
        </Svg>
        {card(t, S(a + 2) + 0.4, E(a + 2), "APRIL 18, 1955 · PRINCETON", "IN GERMAN", "His nurse didn't speak German.", P.gold, 1080, 640)}
        <CallTimer t={t} a={call[0]} b={call[1]} />
        <Chip t={t} at={t0 + 0.2} text="DAY 2" />
      </Camera>
    );
  },

  trader: ({ t, t0, t1 }) => {
    const a = first("trader");
    const call = [S(a + 1) - 0.4, E(a + 2) + 0.2];
    const fact = S(a + 3);
    const elvis = lineOf("trader", "THEO");
    return (
      <Camera t={t} t0={t0} t1={t1} punch={[S(elvis) + 0.3]} fx={t > S(elvis) ? 1300 : 900}>
        <NightRoom t={t} clock="9:00" rain={false} />
        <Svg>
          <Caller t={t} look={YOU} mood={t > fact ? "deadpan" : "happy"} who="YOU" x={700} lit={t > call[0] && t < call[1] ? 1 : 0} />
          <DeadBubble t={t} at={call[0]} until={call[1]} cx={1400} cy={400} r={180} look={TRADER} mood="smug" talk={speaking(t, "TRADER")} id="trd" />
          {t > S(elvis) - 0.3 && <Person x={1500} y={1000} look={THEO} mood="happy" t={t} talk={speaking(t, "THEO")} flip pose="wave" />}
          {t > fact && t < S(elvis) - 0.4 && <>
            <g transform={`translate(620 330) scale(${pop(t, fact + 0.3)})`}><rect x={-230} y={-120} width={460} height={240} rx={26} fill="#1E2A4A" /><text y={-30} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={44} fill="#FFD54A">BLOCKBUSTER</text><text y={40} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={40} fill={P.cream}>said no to</text></g>
            <g transform={`translate(1300 330) scale(${pop(t, fact + 1.2)})`}><rect x={-230} y={-120} width={460} height={240} rx={26} fill="#4A1A1E" /><text y={-30} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={44} fill={P.red}>NETFLIX</text><text y={40} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={48} fill={P.cream}>$50 MILLION</text></g>
            {t > fact + 4 && <g transform={`translate(620 560) rotate(-10) scale(${pop(t, fact + 4)})`}><rect x={-200} y={-50} width={400} height={100} rx={12} fill="none" stroke={P.red} strokeWidth={10} /><text y={20} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={52} fill={P.red}>BANKRUPT 2010</text></g>}
          </>}
        </Svg>
        <CallTimer t={t} a={call[0]} b={call[1]} />
        <Chip t={t} at={t0 + 0.2} text="DAY 3" />
      </Camera>
    );
  },

  sarah: ({ t, t0, t1 }) => {
    const a = first("sarah");
    const call = [S(a + 1) - 0.4, E(a + 1) + 0.2];
    const drop = ease(t, S(a + 2) + 0.3, S(a + 2) + 0.8);
    return (
      <Camera t={t} t0={t0} t1={t1} punch={[S(a + 2) + 0.5]} fx={1250}>
        <Kitchen t={t} night />
        <Svg>
          <RotaryPhone x={940} y={700} s={0.8} t={t} lit={t > call[0] && t < call[1] ? 1 : 0} />
          <Person x={560} y={1000} look={YOU} mood={t > S(a + 2) ? "smug" : "neutral"} t={t} pose={t > call[0] && t < call[1] ? "phone" : "stand"} holding={t > call[0] && t < call[1] ? <g transform="scale(0.6)"><Handset /></g> : undefined} lookX={1} />
          <Person x={1320} y={1000} look={MOM} mood={t > S(a + 2) ? "shocked" : t > S(a + 1) ? "nervous" : "deadpan"} t={t} talk={speaking(t, "MOM")} flip />
          <g transform={`translate(${1220} ${640 + drop * 300}) rotate(${drop * 120})`}><rect x={-26} y={-34} width={52} height={64} rx={8} fill={P.cream} /></g>
          {drop > 0.95 && <g opacity={1 - ease(t, S(a + 2) + 0.8, S(a + 2) + 1.6)}>{[0, 1, 2, 3, 4].map((i) => <circle key={i} cx={1200 + (i - 2) * 30} cy={950} r={10} fill="#8A5A3A" />)}</g>}
          <DeadBubble t={t} at={call[0]} until={call[1]} cx={940} cy={400} r={170} look={SARAH} mood="happy" talk={speaking(t, "SARAH")} id="sarah" />
        </Svg>
        <CallTimer t={t} a={call[0]} b={call[1]} />
        <Chip t={t} at={t0 + 0.2} text="DAY 4" />
      </Camera>
    );
  },

  unclaimed: ({ t, t0, t1 }) => {
    const a = first("unclaimed");
    const seven = S(a + 1) + 4;
    return (
      <Camera t={t} t0={t0} t1={t1}>
        <Backdrop base="#1B2A2A" light="#2F4A48">
          <Bokeh t={t} color="#9FE3C0" opacity={0.16} />
          {t > S(a + 1) && Array.from({ length: 7 }, (_, i) => (
            <g key={i} transform={`translate(${520 + i * 140} 820) scale(${pop(t, seven + i * 0.08)})`}>
              <circle cy={-60} r={30} fill={i === 3 ? "#6FD38F" : "#AEB6CC"} /><rect x={-30} y={-28} width={60} height={80} rx={26} fill={i === 3 ? "#6FD38F" : "#AEB6CC"} />
            </g>
          ))}
          {t > S(a + 3) && <g transform={`translate(1500 820) scale(${pop(t, S(a + 3) + 0.3)})`}><circle r={70} fill="none" stroke={P.gold} strokeWidth={18} /><line x1={50} y1={50} x2={120} y2={120} stroke={P.gold} strokeWidth={22} strokeLinecap="round" /></g>}
        </Backdrop>
        {card(t, S(a + 1) + 0.3, E(a + 2), "HELD BY U.S. STATES", "$70 BILLION", "unclaimed · about 1 in 7 Americans", "#6FD38F", 600, 200)}
        {card(t, S(a + 3) + 0.4, E(a + 4), "HEIR HUNTERS KEEP", "10–30%", "of what they find for a family", P.gold, 600, 200)}
        <Chip t={t} at={S(a + 4)} text="26 CALLS LEFT" />
      </Camera>
    );
  },

  harold: ({ t, t0, t1 }) => {
    const a = first("harold");
    const call = [S(a + 1) - 0.4, E(a + 4) + 0.2];
    return (
      <Camera t={t} t0={t0} t1={t1} punch={[S(a + 4) + 0.3]} fx={1300}>
        <NightRoom t={t} clock="9:00" rain={false} />
        <Svg>
          <Caller t={t} look={YOU} mood={t > S(a + 4) ? "sad" : "happy"} who="YOU" x={700} lit={t > call[0] && t < call[1] ? 1 : 0} />
          <DeadBubble t={t} at={call[0]} until={call[1]} cx={1400} cy={400} r={180} look={HAROLD} mood={t > S(a + 4) ? "happy" : "neutral"} talk={speaking(t, "HAROLD")} id="har" />
          {t > S(a + 2) && t < S(a + 4) && <g transform={`translate(1400 760) scale(${pop(t, S(a + 2) + 0.2)})`}><rect x={-220} y={-60} width={440} height={120} rx={20} fill={P.cream} /><text y={18} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={56} fill="#3E9C5E">$42,000</text></g>}
        </Svg>
        <CallTimer t={t} a={call[0]} b={call[1]} />
        <Chip t={t} at={t0 + 0.2} text="DAY 5" />
      </Camera>
    );
  },

  montage: ({ t, t0, t1 }) => {
    const a = first("montage");
    const d = (E(a) - S(a)) / 3;
    const items = [{ at: S(a), day: "DAY 6", icon: "⚓", txt: "A SAILOR'S PENSION" }, { at: S(a) + d, day: "DAY 9", icon: "🔒", txt: "SAFE DEPOSIT BOX" }, { at: S(a) + 2 * d, day: "DAY 14", icon: "☕", txt: "CASH IN A COFFEE CAN" }];
    const elvis = lineOf("montage", "THEO");
    return (
      <Camera t={t} t0={t0} t1={t1} punch={[S(elvis + 1) + 0.6]}>
        <Backdrop base={P.night} light={P.nightHi}>
          <Bokeh t={t} />
          {t < S(elvis) - 0.3 && items.map((it, i) => {
            const p = pop(t, it.at);
            return p > 0 ? <g key={i} transform={`translate(${420 + i * 540} 480) scale(${p})`}>
              <circle r={200} fill="#F7E3B8" /><circle r={186} fill="#6B4E36" />
              <text y={40} textAnchor="middle" fontSize={130}>{it.icon}</text>
              <text y={250} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={36} fill={P.cream}>{it.txt}</text>
              <text y={-230} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={40} fill="#FFC870">{it.day}</text>
            </g> : null;
          })}
          {t >= S(elvis) - 0.3 && <>
            <Person x={620} y={1000} look={YOU} mood={t > S(elvis + 1) ? "deadpan" : "neutral"} t={t} talk={speaking(t, "YOU")} lookX={1} />
            <Person x={1300} y={1000} look={THEO} mood="happy" t={t} talk={speaking(t, "THEO")} flip pose="wave" />
          </>}
        </Backdrop>
      </Camera>
    );
  },

  setback: ({ t, t0, t1 }) => {
    const a = first("setback");
    return (
      <Camera t={t} t0={t0} t1={t1} shake={[S(a + 1) + 0.2, S(a + 2) + 0.2]}>
        <Kitchen t={t} night />
        <Svg>
          {t > S(a + 1) && <g transform={`translate(700 380) rotate(-6) scale(${pop(t, S(a + 1))})`}><rect x={-260} y={-150} width={520} height={300} rx={14} fill={P.cream} /><text y={-70} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={34} fill={P.ink}>HARBOR SAVINGS BANK</text><text y={10} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={44} fill={P.red}>CLOSING MOVED</text><text y={70} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={38} fill={P.ink}>DAY 30 · MIDNIGHT</text></g>}
          {t > S(a + 2) && <g transform={`translate(1240 420) rotate(5) scale(${pop(t, S(a + 2))})`}><rect x={-260} y={-150} width={520} height={300} rx={14} fill="#F1EADF" /><text y={-70} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={34} fill={P.ink}>PHONE COMPANY</text><text y={10} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={40} fill={P.red}>DISCONNECTION</text><text y={70} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={38} fill={P.ink}>DAY 30 · MIDNIGHT</text></g>}
          <Person x={960} y={1060} look={YOU} mood={t > S(a + 3) ? "sad" : "nervous"} t={t} s={0.9} sweat />
        </Svg>
        <Chip t={t} at={t0 + 0.2} text="DAY 26" />
      </Camera>
    );
  },

  eddie: ({ t, t0, t1 }) => {
    const a = first("eddie");
    const call = [S(a + 1) - 0.4, E(a + 3) + 0.2];
    const fact = S(a + 2);
    return (
      <Camera t={t} t0={t0} t1={t1} punch={[S(a + 3) + 0.4]} fx={1300}>
        <NightRoom t={t} clock="9:00" />
        <Svg>
          <Caller t={t} look={YOU} mood={t > S(a + 3) ? "shocked" : "nervous"} who="YOU" x={700} lit={t > call[0] && t < call[1] ? 1 : 0} />
          <DeadBubble t={t} at={call[0]} until={call[1]} cx={1400} cy={400} r={180} look={EDDIE} mood="happy" talk={speaking(t, "EDDIE")} id="eddie" />
          {t > S(a + 3) + 0.8 && <g transform={`translate(1400 780) scale(${pop(t, S(a + 3) + 0.8)})`}><rect x={-110} y={-60} width={220} height={120} rx={22} fill="#3E6FB5" /><rect x={-110} y={-60} width={220} height={28} rx={14} fill="#5A8BD6" /></g>}
        </Svg>
        {card(t, fact + 0.4, E(a + 2), "U.S. TREASURY", "$30 BILLION", "in savings bonds nobody cashed", "#7FB5E0", 140, 150)}
        <CallTimer t={t} a={call[0]} b={call[1]} />
        <Chip t={t} at={t0 + 0.2} text="DAY 27" />
      </Camera>
    );
  },

  house: ({ t, t0, t1 }) => {
    const a = first("house");
    const open = ease(t, S(a + 1), S(a + 1) + 1);
    const bonds = t > S(a + 2);
    return (
      <Camera t={t} t0={t0} t1={t1} fx={1200} fy={600} to={1.1} punch={[S(a + 2) + 0.3]}>
        <Kitchen t={t} night drawerOpen={open} />
        <Svg>
          {open > 0.6 && <g transform={`translate(1300 ${560 - ease(t, S(a + 1) + 1.2, S(a + 1) + 2) * 120})`}><Glow cx={0} cy={0} r={200} color="#7FB5E0" opacity={0.5} id="tin" /><rect x={-90} y={-50} width={180} height={100} rx={18} fill="#3E6FB5" /><rect x={-90} y={-50} width={180} height={24} rx={12} fill="#5A8BD6" /></g>}
          {bonds && Array.from({ length: 9 }, (_, i) => {
            const p = pop(t, S(a + 2) + i * 0.08);
            return <g key={i} transform={`translate(${1250 + (i - 4) * 70 * p} ${430 - Math.abs(i - 4) * 10 * p}) rotate(${(i - 4) * 8 * p})`}><rect x={-60} y={-80} width={120} height={160} rx={8} fill="#DDEBD5" /><text y={10} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={22} fill="#3E7A4E">U.S. BOND</text></g>;
          })}
          {t > S(a + 2) + 1.5 && <g transform={`translate(700 300) scale(${pop(t, S(a + 2) + 1.5)})`}><rect x={-240} y={-60} width={480} height={110} rx={55} fill="#3E9C5E" /><text y={18} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={46} fill={P.white}>HOUSE SAVED ✓</text></g>}
          <Person x={600} y={1020} look={YOU} mood={bonds ? "happy" : "nervous"} t={t} lookX={1} />
          <Person x={1020} y={1020} look={GRANDMA} mood={bonds ? "shocked" : "sad"} t={t} lookX={1} />
        </Svg>
        <Chip t={t} at={t0 + 0.2} text="DAY 30 · 8:00 P.M." />
      </Camera>
    );
  },

  letter: ({ t, t0, t1 }) => {
    const a = first("letter");
    const words = L[a].text;
    const k = ease(t, S(a), E(a));
    const count = Math.round(interpolate(t, [S(a + 1) + 1, S(a + 1) + 3.5], [0, 18615], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    const tableShot = t > S(a + 2) - 0.3;
    return (
      <Camera t={t} t0={t0} t1={t1} from={1} to={1.1}>
        {!tableShot ? (
          <Backdrop base="#3A2E24" light="#6B5440">
            <Bokeh t={t} color="#FFE2B0" opacity={0.15} />
            <g transform="rotate(-3 960 520)">
              <rect x={460} y={160} width={1000} height={700} rx={10} fill="#F4ECD8" />
              {Array.from({ length: 10 }, (_, i) => <line key={i} x1={520} y1={300 + i * 52} x2={1400} y2={300 + i * 52} stroke="#C9BFA8" strokeWidth={2} />)}
            </g>
            <foreignObject x={520} y={230} width={880} height={600}>
              <div style={{ fontFamily: "'Caladea', Georgia, serif", fontStyle: "italic", fontSize: 54, lineHeight: 1.45, color: "#3A2A1E", transform: "rotate(-3deg)" }}>
                {words.slice(0, Math.floor(words.length * k))}
              </div>
            </foreignObject>
            {t > S(a + 1) && <g transform={`translate(960 110) scale(${pop(t, S(a + 1) + 0.8)})`}><rect x={-330} y={-70} width={660} height={130} rx={65} fill="rgba(20,24,36,0.9)" /><text y={22} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={70} fill="#FFC870">{count.toLocaleString("en-US")} TIMES</text></g>}
          </Backdrop>
        ) : (
          <>
            <Kitchen t={t} night />
            <Svg>
              <Person x={960} y={1020} look={GRANDMA} mood={t > S(a + 3) ? "happy" : "sad"} t={t} talk={speaking(t, "GRANDMA")} />
              {[0, 1, 2].map((i) => { const at = S(a + 2) + 0.8 + i * 0.5; const p = ease(t, at, at + 0.6); return t > at ? <circle key={i} cx={1060} cy={716} r={20 + p * 90} fill="none" stroke="#FFC870" strokeWidth={8} opacity={1 - p} /> : null; })}
              {[0, 1, 2].map((i) => t > S(a + 2) + 0.8 + i * 0.5 && t < S(a + 3) ? <text key={i} x={1200 + i * 120} y={560} fontFamily={font} fontWeight={900} fontSize={48} fill="#FFC870">TAP</text> : null)}
            </Svg>
          </>
        )}
      </Camera>
    );
  },

  lastcall: ({ t, t0, t1 }) => {
    const a = first("lastcall");
    const theo2 = lineOf("lastcall", "THEO", 1);
    return (
      <Camera t={t} t0={t0} t1={t1} punch={[S(theo2) + 0.3]} fx={t > S(a + 2) ? 1250 : 960} to={1.15}>
        <Kitchen t={t} night />
        <Svg>
          <rect x={1240} y={300} width={200} height={70} rx={12} fill="#10141F" />
          <text x={1340} y={348} textAnchor="middle" fontFamily="monospace" fontWeight={700} fontSize={40} fill={P.red}>{t > S(a) + 3 ? "11:59" : "11:58"}</text>
          <RotaryPhone x={940} y={700} s={0.8} t={t} lit={0.5} />
          <Person x={600} y={1000} look={YOU} mood={t > S(theo2) ? "sad" : "neutral"} t={t} lookX={1} />
          <Person x={1300} y={1000} look={THEO} mood={t > S(a + 2) ? "sad" : "neutral"} t={t} talk={speaking(t, "THEO")} flip lookX={-1} />
        </Svg>
        <Chip t={t} at={t0 + 0.2} text="11:58 P.M." />
      </Camera>
    );
  },

  theo_call: ({ t, t0, t1 }) => {
    const a = first("theo_call");
    const call = [S(a) + 1, E(a + 1)];
    const k = (t - call[0]) / (call[1] - call[0]);
    const mood: Mood = k < 0.15 ? "nervous" : k < 0.5 ? "happy" : k < 0.85 ? "sad" : "happy";
    return (
      <Camera t={t} t0={t0} t1={t1} from={1.05} to={1.25} fx={960} fy={560}>
        <Kitchen t={t} night />
        <Svg>
          <Glow cx={960} cy={500} r={500} color="#FFC870" opacity={0.25 + 0.1 * Math.sin(t * 2)} id="theoglow" />
          <Person x={960} y={1040} look={THEO} mood={t > call[0] ? mood : "nervous"} t={t} pose="phone" holding={<g transform="scale(0.6)"><Handset /></g>} talk={t > call[0] && t < call[1] && Math.sin(t * 1.3) > -0.2} s={1.15} />
        </Svg>
        <CallTimer t={t} a={call[0]} b={call[1]} x={1650} y={160} />
      </Camera>
    );
  },

  bookend: ({ t, t0, t1 }) => {
    const a = first("bookend");
    const ring = t < S(a + 1);
    return (
      <Camera t={t} t0={t0} t1={t1} from={1} to={1.12} fx={1000} fy={650}>
        <NightRoom t={t} />
        <Svg>
          <RotaryPhone x={1000} y={760} s={1.1} t={t} ring={ring} lit={ring ? 0.3 : ease(t, S(a + 1), S(a + 1) + 1)} lifted={!ring} />
          {!ring && <Person x={620} y={1000} look={YOU} mood={t > S(a + 2) ? "happy" : "shocked"} t={t} pose="phone" holding={<g transform="scale(0.6)"><Handset /></g>} lookX={1} />}
          {[0, 1, 2].map((i) => { const at = S(a + 1) + 2 + i * 0.55; const p = ease(t, at, at + 0.7); return t > at && t < S(a + 2) + 0.5 ? <circle key={i} cx={1000} cy={640} r={30 + p * 160} fill="none" stroke="#FFC870" strokeWidth={8} opacity={1 - p} /> : null; })}
        </Svg>
        <Chip t={t} at={t0 + 0.2} text="3:07 A.M." />
      </Camera>
    );
  },

  coda: ({ t, t0, t1 }) => (
    <Camera t={t} t0={t0} t1={t1} punch={[S(first("coda") + 1) + 0.4]}>
      <Kitchen t={t} />
      <Svg>
        <Person x={520} y={1000} look={GRANDMA} mood="happy" t={t} pose="wave" />
        <Person x={960} y={1000} look={YOU} mood="happy" t={t} />
        <Person x={1400} y={1000} look={THEO} mood="smug" t={t} talk={speaking(t, "THEO")} flip pose="point" />
      </Svg>
    </Camera>
  ),

  endcard: ({ t, t0, t1 }) => (
    <Camera t={t} t0={t0} t1={t1} from={1} to={1.05}>
      <Backdrop base="#11162A" light="#26305A">
        <Bokeh t={t} />
        <DotLine t={t} y={900} />
        <RotaryPhone x={960} y={330} s={0.9} t={t} lit={0.8} />
      </Backdrop>
      <Title t={t} at={t0 + 0.3} words={"IF YOU HAD ONE MINUTE, WHO WOULD YOU CALL?".split(" ")} accent={["ONE", "MINUTE,", "CALL?"]} size={84} y={150} />
    </Camera>
  ),
};

// ---------- overlays ----------
const callsLeft = (t: number) => {
  const steps: [number, number][] = [
    [first("rules"), 29], [first("einstein") + 1, 28], [first("trader") + 1, 27], [first("sarah") + 1, 26], [first("harold") + 1, 25],
    [first("montage"), 22], [first("montage") + 3, 5], [first("setback"), 4], [first("eddie") + 1, 3], [first("lastcall"), 1], [first("theo_call") + 1, 0],
  ];
  let v = 30;
  for (const [i, n] of steps) if (t >= S(i)) v = n;
  if (t >= S(first("montage")) && t < S(first("montage") + 3)) v = Math.round(interpolate(t, [S(first("montage")), S(first("montage") + 3)], [24, 5]));
  return v;
};
const moneyAt = (t: number) => {
  const h = first("harold") + 2, m = first("montage"), s = first("setback"), house = first("house") + 2;
  if (t < S(h)) return -1;
  if (t >= S(house) + 1) return 86000;
  if (t < S(m)) return 8400;
  return Math.round(interpolate(t, [S(m), S(s)], [8400, 71000], { extrapolateRight: "clamp" }));
};

const HUD: React.FC<{ t: number; shot: string }> = ({ t, shot }) => {
  if (["cold_open", "promise", "endcard", "letter", "theo_call", "bookend", "coda", "unclaimed"].includes(shot)) return null;
  if (t < S(first("rules"))) return null;
  const m = moneyAt(t);
  return (
    <>
      <Counter label="CALLS LEFT" value={String(callsLeft(t))} x={1580} y={40} color="#FFC870" />
      {m >= 0 && <Counter label="MONEY" value={`$${m.toLocaleString("en-US")}`} x={1480} y={170} color={m >= 86000 ? "#6FD38F" : "#9FE3C0"} />}
    </>
  );
};

const SPEAKER_COLOR: Record<string, string> = { NARRATOR: "#FFFFFF", YOU: "#7FE3DD", THEO: "#FFB37A", GRANDPA: "#FFD98A", GRANDMA: "#E2C6FF" };
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

export const Episode: React.FC<{ captions?: boolean }> = ({ captions = true }) => {
  const { t } = useT();
  let k = 0;
  while (k + 1 < SHOTS.length && t >= shotStart(k + 1)) k++;
  const shot = SHOTS[k];
  const Shot = shots[shot.name];
  const t0 = shotStart(k), t1 = k + 1 < SHOTS.length ? shotStart(k + 1) : DURATION;
  const fadeIn = ease(t, t0, t0 + 0.25);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ opacity: k === 0 ? 1 : 0.35 + 0.65 * fadeIn }}>
        {Shot ? <Shot t={t} t0={t0} t1={t1} /> : <AbsoluteFill style={{ background: "#f0f" }} />}
      </AbsoluteFill>
      <HUD t={t} shot={shot.name} />
      {captions && <Captions t={t} />}
      {!("estimated" in timeline) && <Audio src={staticFile("one-minute/mix.wav")} />}
    </AbsoluteFill>
  );
};

export { last };
