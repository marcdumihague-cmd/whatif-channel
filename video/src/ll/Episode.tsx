// "What If You Were the Last Liar on Earth?" Shots are keyed by the `scene` of each script line and timed
// from public/last-liar/timeline.json, so re-voicing re-times everything automatically.
import React from "react";
import { AbsoluteFill, Audio, interpolate, staticFile } from "remotion";
import timeline from "../../public/last-liar/timeline.json";
import {
  P, useT, ease, pop, Camera, Rain, Bokeh, Glow, Backdrop, Shadow, Person, Head, YOU, THEO, extra,
  Chip, Counter, Bubble, StatCard, Title, DotLine, Mood, Look,
} from "./kit";

type Line = (typeof timeline.lines)[number];
const L: Line[] = timeline.lines;
export const DURATION = timeline.duration;
const S = (i: number) => L[i].start;
const E = (i: number) => L[i].end;

// shot name -> [first line, last line]
const SHOTS: { name: string; a: number; b: number }[] = [];
L.forEach((l, i) => {
  const last = SHOTS[SHOTS.length - 1];
  if (last && last.name === l.scene) last.b = i; else SHOTS.push({ name: l.scene, a: i, b: i });
});
const shotStart = (k: number) => (k === 0 ? 0 : (E(SHOTS[k - 1].b) + S(SHOTS[k].a)) / 2);
const speaking = (t: number, who: string) => L.some((l) => l.who === who && t >= l.start && t <= l.end);
const during = (t: number, i: number) => t >= S(i) && t <= E(i) + 0.3;

type ShotProps = { t: number; t0: number; t1: number };
const font = "'Inter Display', Inter, sans-serif";

// ---------- shared sets ----------
const Bedroom: React.FC<{ t: number; lit?: number }> = ({ t, lit = 0 }) => (
  <Backdrop base={P.night} light={P.dusk} cx={30} cy={35}>
    <rect x={260} y={140} width={460} height={380} rx={8} fill="#141A28" />
    {[0, 1, 2, 3, 4, 5, 6].map((i) => <rect key={i} x={290 + i * 60} y={520 - 60 - (i * 37) % 200} width={44} height={60 + (i * 37) % 200} fill="#232C44" />)}
    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
      <rect key={i} x={300 + (i * 71) % 400} y={360 + (i * 53) % 140} width={10} height={12} fill={P.gold} opacity={(Math.sin(t * 0.7 + i * 2) > -0.3 ? 0.8 : 0.15)} />
    ))}
    <Rain t={t} x={260} y={140} w={460} h={380} n={40} />
    <rect x={260} y={140} width={460} height={380} rx={8} fill="none" stroke="#3C4866" strokeWidth={18} />
    <line x1={490} y1={140} x2={490} y2={520} stroke="#3C4866" strokeWidth={12} />
    <line x1={260} y1={330} x2={720} y2={330} stroke="#3C4866" strokeWidth={12} />
    <rect y={860} width={1920} height={220} fill="#18202F" />
    {/* bed */}
    <rect x={860} y={600} width={760} height={220} rx={30} fill="#3A4766" />
    <rect x={820} y={520} width={60} height={340} rx={24} fill="#2C3852" />
    <ellipse cx={980} cy={610} rx={110} ry={42} fill="#D9DEEA" />
    {/* nightstand + clock */}
    <rect x={620} y={700} width={170} height={160} rx={14} fill="#2C3852" />
    <rect x={640} y={640} width={130} height={60} rx={12} fill="#10141F" />
    <text x={705} y={683} textAnchor="middle" fontFamily="monospace" fontWeight={700} fontSize={36} fill={P.red}>3:00</text>
    <Glow cx={705} cy={670} r={110} color={P.red} opacity={0.25} id="clockglow" />
    {lit > 0 && <Glow cx={1060} cy={560} r={260} color="#9FD8FF" opacity={0.35 * lit} id="phoneglow" />}
    <Bokeh t={t} n={10} opacity={0.12} />
  </Backdrop>
);

const InBed: React.FC<{ t: number; mood: Mood; talk?: boolean; phone?: boolean }> = ({ t, mood, talk, phone }) => (
  <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
    <g transform="translate(1000 560) rotate(-8) scale(0.85)"><Head look={YOU} mood={mood} t={t} talk={talk} /></g>
    <path d="M 1000 630 Q 1200 560 1600 610 L 1600 820 L 960 820 Q 930 700 1000 630 Z" fill="#5C6E99" />
    <path d="M 1000 660 Q 1200 600 1600 650" stroke="#6E81AD" strokeWidth={10} fill="none" />
    {phone && (
      <g transform={`translate(1110 600) rotate(-10)`}>
        <rect x={-40} y={-70} width={80} height={140} rx={14} fill="#10141F" />
        <rect x={-32} y={-60} width={64} height={120} rx={8} fill="#9FD8FF" />
      </g>
    )}
  </svg>
);

const Studio: React.FC<{ t: number; live?: boolean }> = ({ t, live = true }) => (
  <Backdrop base="#1C2236" light="#3A3F66" cx={50} cy={30}>
    {[300, 960, 1620].map((x, i) => (
      <polygon key={x} points={`${x - 30},0 ${x + 30},0 ${x + 260 - i * 260},880 ${x - 260 - i * 260 + 520},880`} fill="#FFFFFF" opacity={0.04 + 0.02 * Math.sin(t + i)} />
    ))}
    <rect x={560} y={140} width={800} height={180} rx={24} fill="#141A2B" />
    <text x={960} y={260} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={96} fill={P.white} letterSpacing={6}>JUST <tspan fill={P.gold}>ASKING</tspan></text>
    {live && <g><circle cx={360} cy={120} r={14} fill={P.red} opacity={Math.sin(t * 5) > 0 ? 1 : 0.3} /><text x={385} y={133} fontFamily={font} fontWeight={900} fontSize={36} fill={P.red}>LIVE</text></g>}
    <rect y={860} width={1920} height={220} fill="#151A28" />
    <rect x={760} y={760} width={400} height={30} rx={12} fill="#2B3250" />
    {/* audience silhouettes */}
    {Array.from({ length: 16 }, (_, i) => <circle key={i} cx={60 + i * 120} cy={1040 + (i % 2) * 18} r={58} fill="#0E1220" />)}
  </Backdrop>
);

const Stage: React.FC<{ t: number; crowd?: number; brick?: boolean; laugh?: boolean; big?: boolean }> = ({ t, crowd = 14, brick = true, laugh = false, big = false }) => (
  <Backdrop base={big ? "#2A1E2E" : "#24181A"} light={big ? "#6B3A55" : "#5A3328"} cx={50} cy={40}>
    {brick && Array.from({ length: 9 }, (_, r) => Array.from({ length: 12 }, (_, c) => (
      <rect key={`${r}-${c}`} x={c * 170 - (r % 2) * 85} y={r * 80} width={160} height={70} rx={6} fill="#3A2420" opacity={0.6} />
    )))}
    {big && <text x={960} y={160} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={110} fill={P.gold} opacity={0.9}>THEO LIVE</text>}
    <polygon points="900,0 1020,0 1260,900 660,900" fill="#FFF3D6" opacity={0.12} />
    <ellipse cx={960} cy={890} rx={330} ry={46} fill="#FFF3D6" opacity={0.18} />
    <rect y={900} width={1920} height={180} fill="#140E10" />
    {Array.from({ length: crowd }, (_, i) => {
      const b = laugh ? Math.abs(Math.sin(t * 8 + i)) * 14 : 0;
      return <g key={i}><circle cx={70 + i * (1840 / crowd)} cy={1010 - b} r={52} fill="#0B0708" /><rect x={20 + i * (1840 / crowd)} y={1040 - b} width={100} height={80} rx={40} fill="#0B0708" /></g>;
    })}
  </Backdrop>
);

const Phone: React.FC<{ x: number; y: number; s?: number; glow?: boolean }> = ({ x, y, s = 1, glow = true }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {glow && <Glow cx={0} cy={0} r={120} color="#9FD8FF" opacity={0.35} id={`pg${x}${y}`} />}
    <rect x={-34} y={-62} width={68} height={124} rx={14} fill="#10141F" />
    <rect x={-27} y={-52} width={54} height={104} rx={8} fill="#9FD8FF" />
  </g>
);

const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>{children}</svg>
);

const Bill: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r})`}><rect x={-60} y={-30} width={120} height={60} rx={8} fill="#6FBF73" /><circle r={16} fill="#4E9A55" /></g>
);

// ---------- shots ----------
const shots: Record<string, React.FC<ShotProps>> = {
  open: ({ t, t0, t1 }) => {
    const planet = t >= S(1) - 0.2;
    const wave = ease(t, S(1), S(1) + 2.2);
    if (!planet)
      return (
        <Camera t={t} t0={t0} t1={S(1)} from={1} to={1.1} fx={1000} fy={560}>
          <Bedroom t={t} />
          <InBed t={t} mood={t > S(0) + 1.8 ? "smug" : "sleepy"} />
        </Camera>
      );
    return (
      <Camera t={t} t0={S(1)} t1={t1} from={1.15} to={1}>
        <Backdrop base="#0D1222" light="#1F2B4A">
          <Bokeh t={t} n={40} opacity={0.18} />
          <circle cx={960} cy={560} r={360} fill="#1D3A5C" />
          <path d="M 700 430 q 80 -60 160 -10 q 40 60 -40 90 q -80 30 -120 -80 Z M 1020 380 q 120 -20 180 60 q 20 90 -90 70 q -100 -10 -90 -130 Z M 900 700 q 90 -40 170 30 q -10 80 -110 60 q -70 -20 -60 -90 Z" fill="#2D5A7E" />
          <circle cx={960} cy={560} r={360 * wave} fill="none" stroke="#FFF3B0" strokeWidth={30 * (1 - wave) + 2} opacity={1 - wave} />
          {Array.from({ length: 60 }, (_, i) => {
            const a = i * 2.4, rr = 40 + (i * 53) % 300;
            const x = 960 + Math.cos(a) * rr, y = 560 + Math.sin(a) * rr * 0.9;
            const lit = Math.hypot(x - 960, y - 560) < 360 * wave;
            return <circle key={i} cx={x} cy={y} r={5} fill={lit ? "#FFF3B0" : "#7FA2C8"} opacity={lit ? 0.9 : 0.4} />;
          })}
          <circle cx={1050} cy={520} r={10 + Math.sin(t * 5) * 3} fill={P.red} />
          <Glow cx={1050} cy={520} r={60} color={P.red} opacity={0.6} id="you-dot" />
        </Backdrop>
      </Camera>
    );
  },

  promise: ({ t, t0, t1 }) => (
    <Camera t={t} t0={t0} t1={t1}>
      <Backdrop base={P.night} light={P.nightHi}>
        <Bokeh t={t} />
        <Bubble t={t} at={t0 + 0.2} cx={420} cy={420} r={170} id="pr1" bg="#24543F">
          {[0, 1, 2, 3, 4].map((i) => <Bill key={i} x={110 + i * 30} y={230 - i * 26} r={-10 + i * 6} />)}
        </Bubble>
        <Bubble t={t} at={t0 + 0.8} cx={960} cy={340} r={150} id="pr2" bg="#1C2236">
          <text x={150} y={170} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={44} fill={P.gold}>LIVE</text>
          <circle cx={90} cy={150} r={12} fill={P.red} />
        </Bubble>
        <Bubble t={t} at={t0 + 1.4} cx={1500} cy={420} r={170} id="pr3" bg="#1F2A40">
          <Rain t={t} w={340} h={340} n={20} />
          {[0, 1, 2, 3, 4].map((i) => <circle key={i} cx={60 + i * 55} cy={230} r={22} fill="#0E1220" />)}
        </Bubble>
        <Bubble t={t} at={t0 + 2.4} cx={960} cy={760} r={170} id="pr4" bg="#3A2F45">
          <g transform="translate(240 300) scale(0.45)"><Person x={0} y={0} look={THEO} mood="sad" t={t} flip /></g>
        </Bubble>
      </Backdrop>
    </Camera>
  ),

  cafe: ({ t, t0, t1 }) => {
    const youMood: Mood = t > S(12) ? "happy" : t > S(10) ? "smug" : t > S(5) ? "deadpan" : "neutral";
    const baristaMood: Mood = during(t, 11) ? "shocked" : t > E(11) ? "nervous" : "happy";
    const cup = ease(t, S(11) + 0.5, S(11) + 1.2);
    return (
      <Camera t={t} t0={t0} t1={t1} fx={900} fy={600} punch={[S(5) + 1.4, S(10) + 0.3]}>
        <Backdrop base="#D9C3AC" light="#F4E6D6" cx={40} cy={30}>
          <rect y={0} width={1920} height={120} fill="#C9AE94" />
          <rect x={120} y={170} width={520} height={300} rx={16} fill="#3A3A3A" />
          {["ESPRESSO 3", "LATTE 4", "BURNT 2"].map((m, i) => <text key={m} x={160} y={250 + i * 70} fontFamily={font} fontWeight={800} fontSize={42} fill={i === 2 ? P.gold : P.cream}>{m}</text>)}
          {/* TV with the weatherman */}
          <rect x={1340} y={150} width={420} height={260} rx={14} fill="#1F2433" />
          <rect x={1360} y={170} width={380} height={220} rx={8} fill={P.sky} />
          <g transform="translate(1470 390) scale(0.42)"><Person x={0} y={0} look={extra(0)} mood={t > S(7) ? "sad" : "neutral"} t={t} talk={speaking(t, "WEATHERMAN")} pose="shrug" /></g>
          <text x={1650} y={290} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={110} fill={P.white}
            transform={`rotate(${Math.sin(t * 3) * 15} 1650 255)`}>?</text>
          {/* espresso machine with steam */}
          <rect x={1100} y={470} width={200} height={170} rx={20} fill="#8A8F9C" />
          {[0, 1, 2].map((i) => {
            const k = (t * 0.6 + i / 3) % 1;
            return <circle key={i} cx={1200 + Math.sin(k * 6 + i) * 16} cy={460 - k * 160} r={14 + k * 26} fill={P.white} opacity={0.4 * (1 - k)} />;
          })}
          <Person x={1150} y={860} look={extra(1)} mood={baristaMood} t={t} talk={speaking(t, "BARISTA")} pose="hold" flip lookX={-1} />
          {/* counter */}
          <rect x={700} y={640} width={1220} height={300} fill="#8E6646" />
          <rect x={700} y={630} width={1220} height={30} rx={8} fill="#A97E58" />
          <g transform={`translate(${interpolate(cup, [0, 1], [1050, 820])} 600)`}>
            <rect x={-30} y={-60} width={60} height={70} rx={10} fill={P.cream} /><rect x={-34} y={-70} width={68} height={16} rx={6} fill={P.wood} />
          </g>
          <Person x={520} y={1000} look={YOU} mood={youMood} t={t} talk={speaking(t, "YOU")} lookX={1} s={1.05} />
          <Bokeh t={t} n={12} opacity={0.18} />
        </Backdrop>
        <Chip t={t} at={t0 + 0.3} text="7:40 A.M." />
      </Camera>
    );
  },

  coin: ({ t, t0, t1 }) => {
    const spin = Math.cos(t * 9);
    return (
      <Camera t={t} t0={t0} t1={t1}>
        <Backdrop base={P.night} light={P.dusk}>
          <Bokeh t={t} />
          <g transform={`translate(700 560) scale(${spin} 1)`}>
            <circle r={210} fill={P.gold} /><circle r={170} fill="#E3A42E" />
            <text y={50} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={160} fill={P.gold}>{spin > 0 ? "?" : "!"}</text>
          </g>
          <Shadow cx={700} cy={860} rx={180} />
        </Backdrop>
        <StatCard t={t} at={S(14) + 0.6} x={1080} y={340} w={640} title="PEOPLE SPOT A LIE" big="54%" sub="of the time. A coin gets 50%." />
      </Camera>
    );
  },

  rules: ({ t, t0, t1 }) => {
    const icons = [
      (k: number) => <g key="a"><rect x={-70} y={-50} width={140} height={90} rx={30} fill={P.cream} /><text y={14} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={40} fill={P.ink}>LIE</text>{k > 0 && <line x1={-80} y1={-60} x2={80} y2={60} stroke={P.red} strokeWidth={16 * k} strokeLinecap="round" />}</g>,
      (k: number) => <g key="b"><rect x={-50} y={-70} width={100} height={140} rx={12} fill={P.cream} /><text y={20} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={60} fill={P.red}>A♠</text>{k > 0 && <line x1={-80} y1={-60} x2={80} y2={60} stroke={P.red} strokeWidth={16 * k} strokeLinecap="round" />}</g>,
      (k: number) => <g key="c"><circle r={70} fill={P.gold} /><path d="M -30 10 Q 0 40 30 10" stroke={P.ink} strokeWidth={8} fill="none" /><text y={-90} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={34} fill={P.cream}>"I'M FINE"</text>{k > 0 && <line x1={-80} y1={-60} x2={80} y2={60} stroke={P.red} strokeWidth={16 * k} strokeLinecap="round" />}</g>,
    ];
    const crowd = t > S(16);
    return (
      <Camera t={t} t0={t0} t1={t1} punch={[S(16) + 2.2]}>
        <Backdrop base="#2B3550" light="#4A5A80">
          <Bokeh t={t} />
          {!crowd && icons.map((f, i) => {
            const at = S(15) + 0.4 + i * 0.6;
            return <g key={i} transform={`translate(${560 + i * 400} 420) scale(${pop(t, at)})`}>{f(ease(t, at + 0.3, at + 0.6))}</g>;
          })}
          {crowd && Array.from({ length: 9 }, (_, i) => (
            <g key={i}>
              <g transform={`translate(${220 + i * 185} 930) scale(0.55)`}><Person x={0} y={0} look={extra(i)} mood="neutral" t={t + i} lookX={i < 4 ? 1 : -1} /></g>
              <g transform={`translate(${220 + i * 185} 610) scale(${pop(t, S(16) + 0.5 + i * 0.1)})`}><circle r={30} fill={P.green} /><path d="M -13 0 l 9 10 l 16 -20" stroke={P.white} strokeWidth={7} fill="none" strokeLinecap="round" /></g>
            </g>
          ))}
        </Backdrop>
      </Camera>
    );
  },

  planet: ({ t, t0, t1 }) => (
    <Camera t={t} t0={t0} t1={t1} from={1} to={1.12}>
      <Backdrop base="#0D1222" light="#1F2B4A">
        <Bokeh t={t} n={40} opacity={0.15} />
        <circle cx={960} cy={540} r={300} fill="#1D3A5C" />
        <Glow cx={960} cy={540} r={420} color="#5BD3D0" opacity={0.25} id="planetglow" />
      </Backdrop>
      <div style={{ position: "absolute", top: 380, width: "100%", textAlign: "center", fontFamily: font, fontWeight: 900, color: P.white }}>
        <div style={{ fontSize: 40, letterSpacing: 6, color: "#AEB6CC" }}>8,000,000,000 PEOPLE</div>
        <div style={{ fontSize: 130 }}>LIES TODAY: <span style={{ color: P.red }}>{t > S(17) + 3.2 ? 1 : 0}</span></div>
      </div>
    </Camera>
  ),

  theo_call: ({ t, t0, t1 }) => {
    const theoMood: Mood = t > S(21) ? "nervous" : t > S(19) ? "happy" : "neutral";
    const youMood: Mood = t > S(23) ? "nervous" : t > S(22) ? "smug" : t > S(20) ? "deadpan" : "neutral";
    return (
      <Camera t={t} t0={t0} t1={t1} punch={[S(21) + 0.2]} fx={1300}>
        <AbsoluteFill style={{ background: "#3A4766" }} />
        <div style={{ position: "absolute", left: 0, top: 0, width: 958, height: 1080, overflow: "hidden" }}>
          <Backdrop base="#2C3852" light="#4A5A80"><Bokeh t={t} n={8} /></Backdrop>
          <Svg><Person x={480} y={1060} look={YOU} mood={youMood} t={t} talk={speaking(t, "YOU")} pose="phone" holding={<Phone x={0} y={0} s={0.5} glow={false} />} s={1.6} /></Svg>
        </div>
        <div style={{ position: "absolute", left: 962, top: 0, width: 958, height: 1080, overflow: "hidden" }}>
          <Backdrop base="#4A3B33" light="#7A5D4A">
            <rect x={80} y={160} width={300} height={200} rx={10} fill="#5E4A3E" />
            <text x={230} y={275} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={40} fill={P.gold}>OPEN MIC</text>
                      </Backdrop>
          <Svg>
            <Person x={480} y={1060} look={THEO} mood={theoMood} t={t} talk={speaking(t, "THEO")} pose="phone" holding={<Phone x={0} y={0} s={0.5} glow={false} />} s={1.6} flip />
            <Bubble t={t} at={S(19) + 1.2} until={E(20)} cx={740} cy={250} r={150} fromX={560} fromY={520} id="theo-dream" bg="#24181A">
              <polygon points="130,0 170,0 260,300 40,300" fill="#FFF3D6" opacity={0.18} />
              <g transform="translate(150 270) scale(0.32)"><Person x={0} y={0} look={THEO} mood="nervous" t={t} pose="wave" /></g>
              <text x={240} y={110} fontFamily={font} fontWeight={900} fontSize={30} fill={P.cream} opacity={Math.sin(t * 6) > 0 ? 1 : 0.2}>chirp</text>
            </Bubble>
          </Svg>
        </div>
      </Camera>
    );
  },

  boss_call: ({ t, t0, t1 }) => {
    const youMood: Mood = t > S(27) ? "smug" : t > S(26) + 1.2 ? "shocked" : "nervous";
    return (
      <Camera t={t} t0={t0} t1={t1} punch={[S(26) + 1.2]} fx={500}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 958, height: 1080, overflow: "hidden" }}>
          <Backdrop base="#2C3852" light="#4A5A80"><Bokeh t={t} n={8} /></Backdrop>
          <Svg><Person x={480} y={1060} look={YOU} mood={youMood} t={t} talk={speaking(t, "YOU")} pose="phone" holding={<Phone x={0} y={0} s={0.5} glow={false} />} s={1.6} /></Svg>
        </div>
        <div style={{ position: "absolute", left: 962, top: 0, width: 958, height: 1080, overflow: "hidden" }}>
          <Backdrop base="#B9C2CF" light="#E6EBF1">
            {[0, 1, 2].map((i) => <rect key={i} x={80 + i * 280} y={120} width={240} height={300} rx={8} fill="#A9B4C4" />)}
            <rect x={0} y={780} width={958} height={300} fill="#8E98A9" />
          </Backdrop>
          <Svg><Person x={480} y={1060} look={extra(3)} mood={t > S(26) + 1.5 ? "happy" : "neutral"} t={t} talk={speaking(t, "DANA")} pose="phone" holding={<Phone x={0} y={0} s={0.5} glow={false} />} s={1.6} flip /></Svg>
        </div>
      </Camera>
    );
  },

  poker: ({ t, t0, t1 }) => {
    const flip = (i: number) => pop(t, S(30) + 0.5 + i * 0.5);
    const allIn = ease(t, S(31) + 0.4, S(31) + 1.2);
    const win = ease(t, S(32) + 0.6, S(32) + 1.6);
    const card = (x: number, y: number, label: string, red: boolean, k: number, r = 0) => (
      <g transform={`translate(${x} ${y}) rotate(${r}) scale(${Math.max(0.05, Math.abs(Math.cos((1 - k) * Math.PI / 2)))} 1)`}>
        <rect x={-45} y={-65} width={90} height={130} rx={10} fill={k > 0.5 ? P.cream : "#C25555"} />
        {k > 0.5 && <text y={18} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={46} fill={red ? P.red : P.ink}>{label}</text>}
      </g>
    );
    const players = [{ x: 960, y: 230, cards: ["K♥", "K♦"], bet: true }, { x: 430, y: 470, cards: ["9♣", "4♦"], bet: false }, { x: 1490, y: 470, cards: ["Q♠", "J♠"], bet: true }];
    return (
      <Camera t={t} t0={t0} t1={t1} punch={[S(31) + 1.3]}>
        <Backdrop base="#152A22" light="#24493A">
          <rect x={80} y={60} width={1760} height={900} rx={40} fill="#1A1F2C" />
          <ellipse cx={960} cy={540} rx={760} ry={380} fill="#2E7D5B" />
          <ellipse cx={960} cy={540} rx={700} ry={330} fill="#348A64" />
          {players.map((p, i) => (
            <g key={i}>
              <g transform={`translate(${p.x} ${p.y - 40}) scale(0.5)`}><Head look={extra(i + 1)} mood={t > S(32) && i === 2 ? "sad" : "neutral"} t={t + i} talk={i === 2 && speaking(t, "POKER PLAYER")} /></g>
              {card(p.x - 55, p.y + 90, p.cards[0], p.cards[0].includes("♥") || p.cards[0].includes("♦"), flip(i), -6)}
              {card(p.x + 55, p.y + 90, p.cards[1], p.cards[1].includes("♥") || p.cards[1].includes("♦"), flip(i), 6)}
              {flip(i) > 0.6 && t < S(31) && <text x={p.x} y={p.y + 200} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={40} fill={p.bet ? P.gold : "#AEB6CC"}>{p.bet ? "BET" : "FOLD"}</text>}
              {t > S(32) && i === 2 && <text x={p.x} y={p.y + 200} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={40} fill="#AEB6CC">FOLD</text>}
            </g>
          ))}
          {/* your hand: 7 and 2 */}
          {card(900, 830, "7♣", false, t > S(31) ? 1 : 0, -8)}
          {card(1020, 830, "2♦", true, t > S(31) + 0.3 ? 1 : 0, 8)}
          {t > S(31) && <text x={960} y={720} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={54} fill={P.gold} opacity={allIn}>ALL IN</text>}
          {Array.from({ length: 8 }, (_, i) => (
            <circle key={i} cx={interpolate(win, [0, 1], [960 + (i - 4) * 30, 960 + (i - 4) * 12])} cy={interpolate(win, [0, 1], [520, 800 - i * 6])} r={26} fill={[P.red, P.gold, P.white][i % 3]} />
          ))}
        </Backdrop>
      </Camera>
    );
  },

  vegas: ({ t, t0, t1 }) => {
    const kicked = t > S(36) - 0.2;
    const walk = ease(t, S(36) + 1.6, E(36) + 0.6);
    return (
      <Camera t={t} t0={t0} t1={t1} punch={[S(34) + 2.6]}>
        <Backdrop base="#1A1030" light="#3D1F5C" cy={30}>
          {["SLOTS", "BLACKJACK", "WIN"].map((s, i) => (
            <text key={s} x={300 + i * 460} y={280} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={84}
              fill={[P.red, P.gold, "#5BD3D0"][i]} opacity={Math.sin(t * (3 + i) + i) > -0.4 ? 1 : 0.25}>{s}</text>
          ))}
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${200 + i * 140} 330)`}>
              <rect width={120} height={260} rx={14} fill="#7A2D4A" /><rect x={14} y={40} width={92} height={90} rx={8} fill={P.cream} />
              <text x={60} y={110} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={60} fill={P.red}>{"7$♦"[Math.floor(t * 10 + i) % 3]}</text>
            </g>
          ))}
          <rect y={860} width={1920} height={220} fill="#120A20" />
          <ellipse cx={1100} cy={820} rx={520} ry={90} fill="#2E7D5B" />
          {Array.from({ length: 12 }, (_, i) => <rect key={i} x={1000 + (i % 4) * 40} y={760 - Math.floor(i / 4) * 22} width={36} height={18} rx={4} fill={[P.red, P.gold, P.white][i % 3]} />)}
          <Person x={980 + walk * 900} y={1000} look={YOU} mood={kicked ? "deadpan" : "smug"} t={t} pose={kicked ? "hold" : "stand"} />
          {kicked && <Person x={1500 + walk * 900} y={1000} look={{ ...extra(2), top: "#2A2A2A", topDark: "#1A1A1A" }} mood="nervous" t={t} talk={speaking(t, "PIT BOSS")} flip pose="point" />}
          {kicked && <Person x={1750 + walk * 900} y={1000} look={{ ...extra(0), top: "#2A2A2A", topDark: "#1A1A1A" }} mood="deadpan" t={t} flip />}
          <Bokeh t={t} color="#FFC4F0" opacity={0.2} />
        </Backdrop>
        <Chip t={t} at={S(33) + 2.2} text="THURSDAY · LAS VEGAS" />
      </Camera>
    );
  },

  cop: ({ t, t0, t1 }) => {
    const flash = Math.sin(t * 10) > 0;
    return (
      <Camera t={t} t0={t0} t1={t1} punch={[S(39) + 0.2]}>
        <Backdrop base="#121828" light="#26304A">
          <Glow cx={300} cy={300} r={500} color={flash ? P.red : "#4C7BFF"} opacity={0.35} id="siren" />
          <Rain t={t} n={50} />
          <rect x={0} y={260} width={1920} height={640} rx={40} fill="#2A3045" />
          <rect x={140} y={320} width={900} height={420} rx={30} fill="#3E4A6A" />
          <Person x={590} y={980} look={YOU} mood={t > S(39) ? "smug" : "nervous"} t={t} talk={speaking(t, "YOU")} s={1.05} />
          <rect x={0} y={740} width={1920} height={340} fill="#1F2436" />
          <Person x={1450} y={1080} look={{ ...extra(2), top: "#2E3E6E", topDark: "#22305A" }} mood={t > S(39) ? "happy" : "neutral"} t={t} talk={speaking(t, "POLICE OFFICER")} flip pose={t > S(39) ? "wave" : "stand"} s={1.25} />
        </Backdrop>
      </Camera>
    );
  },

  plane: ({ t, t0, t1 }) => {
    const open = ease(t, S(41), S(41) + 0.8);
    return (
      <Camera t={t} t0={t0} t1={t1} punch={[S(41) + 0.4]}>
        <Backdrop base="#C9D3DF" light="#EEF2F6">
          {[0, 1, 2, 3].map((i) => <rect key={i} x={160 + i * 440} y={180} width={150} height={210} rx={70} fill={P.sky} />)}
          <rect x={760} y={420} width={400 * (1 - open)} height={460} fill="#7D8BB8" />
          <rect x={1160 - 400 * (1 - open)} y={420} width={400 * (1 - open)} height={460} fill="#6A78A3" />
          {open > 0.5 && <text x={960} y={560} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={60} fill={P.gold}>FIRST CLASS</text>}
          {open > 0.5 && <Bokeh t={t} n={14} color={P.gold} opacity={0.35} />}
          <rect y={880} width={1920} height={200} fill="#9AA3B5" />
          <Person x={520} y={1000} look={YOU} mood={t > S(41) ? "smug" : "neutral"} t={t} talk={speaking(t, "YOU")} />
          <Person x={1400} y={1000} look={extra(1)} mood="happy" t={t} talk={speaking(t, "FLIGHT ATTENDANT")} flip pose="point" />
        </Backdrop>
      </Camera>
    );
  },

  chef: ({ t, t0, t1 }) => (
    <Camera t={t} t0={t0} t1={t1} punch={[S(43) + 0.6]}>
      <Backdrop base="#5A2E2A" light="#8A4A3E">
        {[0, 1, 2, 3, 4].map((i) => <g key={i}><line x1={200 + i * 380} y1={0} x2={200 + i * 380} y2={120} stroke="#2A1A18" strokeWidth={4} /><circle cx={200 + i * 380} cy={140} r={24} fill="#FFD98A" /><Glow cx={200 + i * 380} cy={140} r={140} color="#FFD98A" opacity={0.35} id={`lamp${i}`} /></g>)}
        <rect x={420} y={760} width={1080} height={40} rx={14} fill="#F4ECE2" />
        <rect x={460} y={800} width={1000} height={280} fill="#3E211E" />
        <Person x={620} y={1000} look={YOU} mood="smug" t={t} talk={speaking(t, "YOU")} pose="hold" holding={<rect x={-30} y={-40} width={60} height={80} rx={6} fill={P.cream} />} />
        <Person x={1300} y={1000} look={{ ...extra(4), top: P.cream, topDark: "#DDD5C8" }} mood="nervous" t={t} talk={speaking(t, "CHEF")} flip pose="hold" sweat />
        <ellipse cx={1120} cy={760} rx={110} ry={26} fill={P.white} />
        <circle cx={1120} cy={746} r={36} fill="#C96E37" />
      </Backdrop>
    </Camera>
  ),

  deal: ({ t, t0, t1 }) => {
    const reveal = pop(t, S(46) + 0.4);
    return (
      <Camera t={t} t0={t0} t1={t1} punch={[S(46) + 0.5]}>
        <Backdrop base="#2B3550" light="#4A5A80">
          <Bokeh t={t} />
          <rect x={360} y={760} width={1200} height={40} rx={14} fill="#B98A63" />
          <Person x={560} y={1000} look={extra(0)} mood="neutral" t={t} lookX={1} />
          <Person x={1360} y={1000} look={extra(3)} mood="neutral" t={t} flip lookX={-1} />
          {[{ x: 560, n: "MAX $500" }, { x: 1360, n: "MIN $380" }].map((p, i) => (
            <g key={i} transform={`translate(${p.x} 300)`}>
              <rect x={-150} y={-60} width={300} height={110} rx={24} fill={P.cream} opacity={0.95} />
              <text y={18} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={reveal > 0.5 ? 50 : 70} fill={reveal > 0.5 ? P.orange : P.grey}>{reveal > 0.5 ? p.n : "?"}</text>
            </g>
          ))}
        </Backdrop>
      </Camera>
    );
  },

  dealer: ({ t, t0, t1 }) => {
    const price = t > S(51) ? "$17,000" : t > S(48) + 2.4 ? "$19,000" : "$24,000";
    return (
      <Camera t={t} t0={t0} t1={t1} punch={[S(48) + 2.4, S(51) + 0.3]} fx={1100}>
        <Backdrop base="#A9C4D6" light="#E8F0F4" cy={20}>
          {[0, 1, 2, 3, 4, 5].map((i) => <polygon key={i} points={`${i * 340},120 ${i * 340 + 170},60 ${i * 340 + 340},120`} fill={[P.red, P.gold, "#5BD3D0"][i % 3]} opacity={0.8} />)}
          <line x1={0} y1={90} x2={1920} y2={90} stroke="#6B7690" strokeWidth={4} />
          <rect y={860} width={1920} height={220} fill="#8E98A9" />
          {/* the car */}
          <g transform="translate(1180 760)">
            <path d="M -380 60 Q -380 -40 -260 -60 L -150 -160 Q -100 -190 40 -190 L 180 -190 Q 260 -190 300 -110 L 380 -60 Q 420 -40 420 60 Z" fill={P.red} />
            <path d="M -130 -150 L 40 -170 L 40 -80 L -210 -70 Z M 70 -170 L 190 -170 Q 240 -160 260 -90 L 70 -80 Z" fill={P.sky} />
            <circle cx={-220} cy={70} r={70} fill={P.ink} /><circle cx={260} cy={70} r={70} fill={P.ink} />
            <circle cx={-220} cy={70} r={30} fill={P.grey} /><circle cx={260} cy={70} r={30} fill={P.grey} />
            <g transform={`translate(-60 -120) scale(${1 + pop(t, S(48) + 2.4) * 0.1 - (t > S(48) + 2.4 ? 0.1 : 0) + (t > S(51) ? pop(t, S(51)) * 0.15 : 0)})`}>
              <rect x={-110} y={-40} width={220} height={80} rx={12} fill={P.cream} />
              <text y={18} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={46} fill={t > S(51) ? P.green : P.ink}>{price}</text>
            </g>
          </g>
          <Person x={380} y={1000} look={YOU} mood={t > S(51) ? "smug" : t > S(50) ? "smug" : "neutral"} t={t} talk={speaking(t, "YOU")} lookX={1} />
          <Person x={1700} y={1000} look={{ ...extra(2), top: "#C9A14A", topDark: "#AA8638" }} mood={t > S(51) ? "sad" : t > S(49) ? "nervous" : "happy"} t={t} talk={speaking(t, "CAR SALESMAN")} flip pose={t < S(49) ? "point" : "stand"} sweat={t > S(49)} />
        </Backdrop>
      </Camera>
    );
  },

  anchor: ({ t, t0, t1 }) => {
    const bars = [{ label: "His ask", v: 24, c: P.grey }, { label: "His real limit", v: 19, c: P.orange }, { label: "Your price", v: 17, c: P.green }];
    const drop = ease(t, S(53) + 0.3, S(53) + 1.1);
    return (
      <Camera t={t} t0={t0} t1={t1}>
        <Backdrop base="#9BD8C2" light="#C7EDDF">
          <rect x={200} y={140} width={1520} height={760} rx={36} fill={P.cream} />
          <text x={280} y={240} fontFamily={font} fontWeight={900} fontSize={64} fill={P.ink}>THE ANCHOR</text>
          {bars.map((b, i) => {
            const w = ease(t, S(52) + 0.5 + i * 0.5, S(52) + 1.3 + i * 0.5) * b.v * 40;
            return (
              <g key={i}>
                <text x={280} y={350 + i * 170} fontFamily={font} fontWeight={800} fontSize={36} fill="#7C8296">{b.label}</text>
                <rect x={280} y={370 + i * 170} width={Math.max(w, 1)} height={80} rx={24} fill={b.c} />
                {w > 200 && <text x={300 + w} y={425 + i * 170} fontFamily={font} fontWeight={900} fontSize={44} fill={P.ink}>${b.v},000</text>}
              </g>
            );
          })}
          <g transform={`translate(1590 ${interpolate(drop, [0, 1], [-200, 560])})`}>
            <circle cy={-110} r={22} fill="none" stroke={P.ink} strokeWidth={14} />
            <rect x={-10} y={-90} width={20} height={190} fill={P.ink} />
            <path d="M -90 40 Q -80 110 0 110 Q 80 110 90 40" stroke={P.ink} strokeWidth={20} fill="none" strokeLinecap="round" />
            <rect x={-60} y={-60} width={120} height={18} rx={8} fill={P.ink} />
          </g>
        </Backdrop>
      </Camera>
    );
  },

  broker: ({ t, t0, t1 }) => {
    const nums = [{ at: S(55) + 1.0, txt: "$90K", c: P.grey }, { at: S(55) + 3.2, txt: "$110K", c: P.orange }, { at: S(56) + 1.6, txt: "$120K?", c: P.red }, { at: S(57) + 1.0, txt: "$115K", c: P.green }];
    return (
      <Camera t={t} t0={t0} t1={t1} punch={[S(57) + 2.6]}>
        <Backdrop base="#D9C3AC" light="#F4E6D6">
          <rect x={160} y={160} width={500} height={320} rx={10} fill="#C4AD95" />
          <text x={410} y={340} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={44} fill={P.cream}>NEGOTIATOR</text>
          <rect x={300} y={720} width={900} height={40} rx={14} fill={P.woodDark} />
          <Person x={700} y={1000} look={YOU} mood={t > S(56) ? "smug" : "neutral"} t={t} talk={speaking(t, "YOU")} pose="phone" holding={<Phone x={0} y={0} s={0.5} glow={false} />} />
          {nums.map((n, i) => {
            const p = pop(t, n.at);
            return p > 0 ? <g key={i} transform={`translate(${1250 + (i % 2) * 300} ${420 + i * 130}) scale(${p})`}>
              <rect x={-130} y={-55} width={260} height={100} rx={50} fill={P.cream} />
              <text y={18} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={52} fill={n.c}>{n.txt}</text>
            </g> : null;
          })}
          <Bubble t={t} at={S(55)} until={E(56)} cx={1150} cy={230} r={110} fromX={820} fromY={440} id="hr" bg="#B9C2CF">
            <g transform="translate(110 200) scale(0.42)"><Person x={0} y={0} look={extra(3)} mood="neutral" t={t} talk={speaking(t, "HR MANAGER")} /></g>
          </Bubble>
        </Backdrop>
        <Chip t={t} at={S(57) + 1.6} text="WEEK 3" />
      </Camera>
    );
  },

  showtitle: ({ t, t0, t1 }) => (
    <Camera t={t} t0={t0} t1={t1} from={1.05} to={1}>
      <Backdrop base="#11162A" light="#26305A">
        <Bokeh t={t} />
        <DotLine t={t} y={720} />
      </Backdrop>
      {t < S(59) ? (
        <Title t={t} at={S(58) + 0.6} words={"THE IDEA THAT MAKES YOU A MILLIONAIRE".split(" ")} accent={["MILLIONAIRE"]} size={92} />
      ) : (
        <Title t={t} at={S(59) + 2.2} words={["JUST", "ASKING"]} accent={["ASKING"]} size={190} />
      )}
    </Camera>
  ),

  studio_pop: ({ t, t0, t1 }) => (
    <Camera t={t} t0={t0} t1={t1} punch={[S(62) + 0.3]} fx={1200}>
      <Studio t={t} />
      <Svg>
        <Person x={620} y={960} look={YOU} mood={t > S(62) ? "smug" : "neutral"} t={t} talk={speaking(t, "YOU")} lookX={1} />
        <Person x={1300} y={960} look={{ ...extra(1), top: "#C66BB0", topDark: "#A85595", hairStyle: "long" }} mood={t > S(62) ? "nervous" : "happy"} t={t} talk={speaking(t, "POP STAR")} flip sweat={t > S(62)} />
        <Bubble t={t} at={S(62) + 1.6} cx={1600} cy={420} r={120} fromX={1380} fromY={560} id="gary" bg="#2B3250">
          <circle cx={120} cy={110} r={50} fill="#0E1220" /><rect x={60} y={160} width={120} height={100} rx={50} fill="#0E1220" />
          <text x={120} y={70} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={34} fill={P.gold}>GARY?</text>
        </Bubble>
      </Svg>
    </Camera>
  ),

  studio_ceo: ({ t, t0, t1 }) => {
    const silent = t > S(66);
    return (
      <Camera t={t} t0={t0} t1={t1} punch={[S(65) + 0.2]} fx={1300} to={silent ? 1.18 : 1.07}>
        <Studio t={t} />
        <Svg>
          <Person x={620} y={960} look={YOU} mood={t > S(65) ? "happy" : "neutral"} t={t} talk={speaking(t, "YOU")} lookX={1} />
          <Person x={1300} y={960} look={{ ...extra(2), top: "#3C4560", topDark: "#2D3449" }} mood={silent ? "nervous" : t > S(65) ? "deadpan" : "neutral"} t={t} talk={speaking(t, "SNACK CEO")} flip pose="hold"
            holding={<g><rect x={-40} y={-60} width={80} height={110} rx={10} fill={P.gold} /><text y={8} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={22} fill={P.red}>CHIPS</text></g>} sweat={silent} />
          {silent && <g transform="translate(1600 420)"><circle r={60} fill={P.cream} /><line x1={0} y1={0} x2={0} y2={-42} stroke={P.ink} strokeWidth={8} strokeLinecap="round" transform={`rotate(${t * 180})`} /></g>}
        </Svg>
      </Camera>
    );
  },

  views: ({ t, t0, t1 }) => {
    const v = Math.round(interpolate(t, [S(67), S(67) + 3.5], [0, 40], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    const conf = t > S(68) + 0.3;
    return (
      <Camera t={t} t0={t0} t1={t1} punch={[S(68) + 0.4]}>
        <Backdrop base="#11162A" light="#26305A">
          <Bokeh t={t} />
          {["SNACKCO", "PHONEPLUS", "GOODSHOES", "FASTVPN"].map((s, i) => {
            const p = pop(t, S(67) + 2 + i * 0.4);
            return <g key={s} transform={`translate(${330 + i * 420} 820) scale(${p})`}><rect x={-170} y={-50} width={340} height={100} rx={20} fill={P.cream} /><text y={16} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={40} fill={P.ink}>{s}</text></g>;
          })}
          {conf && Array.from({ length: 60 }, (_, i) => {
            const k = t - S(68) - 0.3;
            return <rect key={i} x={(i * 97) % 1920} y={-40 + k * (300 + (i % 7) * 60) - (i % 5) * 80} width={16} height={26} fill={[P.gold, P.red, "#5BD3D0", P.green][i % 4]} transform={`rotate(${i * 40 + k * 200} ${(i * 97) % 1920} ${k * 300})`} />;
          })}
        </Backdrop>
        <div style={{ position: "absolute", top: 260, width: "100%", textAlign: "center", fontFamily: font, fontWeight: 900, color: P.white }}>
          <div style={{ fontSize: 44, letterSpacing: 6, color: "#AEB6CC" }}>VIEWS</div>
          <div style={{ fontSize: 170 }}>{v}<span style={{ color: P.gold }}>M</span></div>
        </div>
        <Chip t={t} at={S(68)} text="WEEK 6" />
      </Camera>
    );
  },

  warmup: ({ t, t0, t1 }) => {
    const grey = ease(t, S(73), S(73) + 2.5);
    return (
      <Camera t={t} t0={t0} t1={t1} punch={[S(72) + 0.2]} fx={960} fy={500} to={1.15}>
        <AbsoluteFill style={{ filter: `saturate(${1 - grey * 0.7})` }}>
          <Stage t={t} crowd={12} brick={false} />
          <Svg>
            <Person x={960} y={890} look={THEO} mood={t > S(73) ? "sad" : t > S(71) ? "nervous" : "happy"} t={t} talk={speaking(t, "THEO")} pose={t > S(73) ? "stand" : "hold"}
              holding={t < S(73) ? <g><rect x={-6} y={-70} width={12} height={70} fill="#555" /><circle cy={-80} r={18} fill="#333" /></g> : undefined} />
            {t > S(72) && <g transform={`translate(300 820) scale(${pop(t, S(72))})`}><g transform="scale(0.6)"><Person x={0} y={0} look={extra(4)} mood="deadpan" t={t} talk={speaking(t, "AUDIENCE MEMBER")} /></g></g>}
            {t > S(73) + 1 && <rect x={1010} y={640 + ease(t, S(73) + 1, S(73) + 2.2) * 60} width={70} height={90} rx={6} fill={P.cream} opacity={1 - ease(t, S(73) + 2, S(73) + 2.4)} />}
          </Svg>
        </AbsoluteFill>
      </Camera>
    );
  },

  party: ({ t, t0, t1 }) => {
    const spread = ease(t, S(78), E(78));
    const shocked = t > S(77);
    return (
      <Camera t={t} t0={t0} t1={t1} punch={[S(76) + 0.3]}>
        <Backdrop base="#2A2140" light="#4D3A6B">
          {Array.from({ length: 24 }, (_, i) => <circle key={i} cx={40 + i * 82} cy={120 + Math.sin(i * 0.6) * 30} r={9} fill={[P.gold, P.red, "#5BD3D0"][i % 3]} opacity={0.6 + 0.4 * Math.sin(t * 3 + i)} />)}
          <path d={`M 0 120 ${Array.from({ length: 24 }, (_, i) => `L ${40 + i * 82} ${120 + Math.sin(i * 0.6) * 30}`).join(" ")} L 1920 120`} stroke="#1A1428" strokeWidth={3} fill="none" />
          <Bokeh t={t} color="#FFD9A8" opacity={0.2} />
          <rect y={880} width={1920} height={200} fill="#1C1630" />
          {spread < 0.05 && <>
            {[{ x: 300, i: 0 }, { x: 1280, i: 1 }, { x: 1560, i: 3 }, { x: 1790, i: 4 }].map((p) => (
              <Person key={p.x} x={p.x} y={1000} look={extra(p.i)} mood={shocked ? "shocked" : "happy"} t={t + p.i} s={0.85} flip={p.x > 900} pose={shocked ? "stand" : "hold"} />
            ))}
            <Person x={780} y={1000} look={YOU} mood={t > S(77) ? "smug" : "happy"} t={t} talk={speaking(t, "YOU")} pose="hold" holding={<rect x={-22} y={-50} width={44} height={60} rx={8} fill={P.red} />} />
            {t > S(75) && <Bubble t={t} at={S(75) + 0.4} until={S(76)} cx={1100} cy={360} r={110} id="harbor" bg="#1E2638">
              <rect x={50} y={70} width={120} height={110} fill={P.cream} /><polygon points="40,70 110,30 180,70" fill={P.cream} />
              <text x={110} y={210} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={22} fill={P.gold}>HARBOR BANK</text>
            </Bubble>}
          </>}
          {spread >= 0.05 && Array.from({ length: 90 }, (_, i) => {
            const x = 100 + (i * 173) % 1720, y = 200 + (i * 97) % 640;
            const on = Math.hypot(x - 960, y - 540) < spread * 1100;
            return <g key={i} opacity={on ? 1 : 0.15}><rect x={x - 12} y={y - 20} width={24} height={40} rx={5} fill={on ? "#9FD8FF" : "#5A5A7A"} />{on && <Glow cx={x} cy={y} r={50} color="#9FD8FF" opacity={0.4} id={`ph${i}`} />}</g>;
          })}
        </Backdrop>
      </Camera>
    );
  },

  svb: ({ t, t0, t1 }) => {
    const draw = ease(t, S(79) + 3, S(79) + 6);
    const pts = Array.from({ length: 30 }, (_, i) => {
      const x = 260 + i * 48;
      const y = i < 18 ? 560 + Math.sin(i) * 14 : 560 + (i - 18) ** 2 * 4.2;
      return `${i ? "L" : "M"} ${x} ${y}`;
    }).join(" ");
    return (
      <Camera t={t} t0={t0} t1={t1}>
        <Backdrop base="#11162A" light="#2A1E2E">
          <path d={pts} stroke={P.red} strokeWidth={10} fill="none" strokeLinecap="round" strokeDasharray={2000} strokeDashoffset={2000 * (1 - draw)} />
          <line x1={260} y1={980} x2={1700} y2={980} stroke="#3A4766" strokeWidth={4} />
        </Backdrop>
        <StatCard t={t} at={S(79) + 0.6} x={240} y={110} w={860} title="SILICON VALLEY BANK · MARCH 9, 2023" big="$42 BILLION" sub="asked back in a single day" color={P.red} />
        <Chip t={t} at={S(79) + 1.2} text="REAL" x={1600} y={60} />
      </Camera>
    );
  },

  line_rain: ({ t, t0, t1 }) => {
    const n = Math.floor(interpolate(t, [t0, t1], [6, 22], { extrapolateRight: "clamp" }));
    return (
      <Camera t={t} t0={t0} t1={t1} from={1.1} to={1}>
        <Backdrop base="#121828" light="#26304A">
          <rect x={1200} y={200} width={620} height={700} fill="#2A3352" />
          {[0, 1, 2, 3].map((i) => <rect key={i} x={1250 + i * 140} y={380} width={60} height={420} fill="#38426A" />)}
          <polygon points="1170,200 1510,60 1850,200" fill="#2A3352" />
          <text x={1510} y={300} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={54} fill={P.gold}>HARBOR BANK</text>
          <Glow cx={1300} cy={760} r={160} color="#9FD8FF" opacity={0.5} id="atm" />
          <rect x={1270} y={680} width={80} height={120} rx={10} fill="#9FD8FF" />
          <rect y={900} width={1920} height={180} fill="#0E1320" />
          {Array.from({ length: n }, (_, i) => (
            <g key={i} transform={`translate(${1180 - i * 70} ${905 + (i % 2) * 6})`}>
              <circle cy={-130} r={26} fill="#0B0F1A" /><rect x={-24} y={-104} width={48} height={104} rx={20} fill="#0B0F1A" />
              <path d="M -60 -150 Q 0 -215 60 -150 Z" fill={["#C66B7A", "#7D8BB8", "#6FA36B", "#C9A14A"][i % 4]} />
            </g>
          ))}
          <Rain t={t} n={110} speed={1.3} />
        </Backdrop>
        <Chip t={t} at={S(81)} text="2:00 A.M." />
      </Camera>
    );
  },

  live: ({ t, t0, t1 }) => (
    <Camera t={t} t0={t0} t1={t1} punch={[S(83) + 0.2]}>
      <Studio t={t} />
      <Svg>
        <Person x={960} y={960} look={YOU} mood={t > S(84) ? "happy" : "nervous"} t={t} talk={speaking(t, "YOU")} />
        <Bubble t={t} at={S(84) + 1.4} cx={1550} cy={460} r={150} fromX={1060} fromY={560} id="home" bg="#121828">
          <Rain t={t} w={300} h={300} n={15} />
          {[0, 1, 2, 3].map((i) => <g key={i} transform={`translate(${60 + i * 60 + ease(t, S(84) + 1.8, S(84) + 4) * 200} 240)`}><circle cy={-40} r={14} fill="#0B0F1A" /><rect x={-14} y={-26} width={28} height={50} rx={10} fill="#0B0F1A" /></g>)}
        </Bubble>
      </Svg>
    </Camera>
  ),

  argue: ({ t, t0, t1 }) => {
    const leave = ease(t, S(91) + 1.4, E(91) + 0.5);
    const theoMood: Mood = t > S(90) ? "sad" : t > S(88) ? "angry" : t > S(86) ? "shocked" : "neutral";
    const youMood: Mood = t > S(89) ? "sad" : t > S(86) ? "nervous" : "neutral";
    const focusTheo = (t > S(86) && t < S(87)) || (t > S(88) && t < S(89)) || t > S(90);
    return (
      <Camera t={t} t0={t0} t1={t1} punch={[S(86) + 1.2]} fx={focusTheo ? 1250 : 650} to={1.12}>
        <Backdrop base={P.night} light={P.dusk} cx={50} cy={30}>
          <rect x={640} y={120} width={640} height={420} rx={8} fill="#141A28" />
          <Rain t={t} x={640} y={120} w={640} h={420} n={45} />
          <rect x={640} y={120} width={640} height={420} rx={8} fill="none" stroke="#3C4866" strokeWidth={18} />
          <line x1={960} y1={120} x2={960} y2={540} stroke="#3C4866" strokeWidth={12} />
          <rect y={880} width={1920} height={200} fill="#18202F" />
          <rect x={1660} y={340} width={200} height={540} fill="#2C3852" />
          <Person x={620} y={1000} look={YOU} mood={youMood} t={t} talk={speaking(t, "YOU")} lookX={1} />
          <Person x={1250 + leave * 520} y={1000} look={THEO} mood={theoMood} t={t} talk={speaking(t, "THEO")} flip={leave < 0.2} lookX={-1} pose={t > S(88) && t < S(90) ? "point" : "stand"} />
          <rect x={1660} y={340} width={200 * (leave > 0.95 ? 1 : 0)} height={540} fill="#33415F" />
        </Backdrop>
      </Camera>
    );
  },

  lonely: ({ t, t0, t1 }) => {
    const items = [
      { at: S(93) + 1.5, txt: '"It\'s worse."', look: extra(1) },
      { at: S(93) + 2.6, txt: '"It\'s not good."', look: { ...extra(4), tall: 0.7 } as Look },
      { at: S(93) + 3.8, txt: '"It\'s dry."', look: { ...extra(2), hairStyle: "bun" as const } },
    ];
    return (
      <Camera t={t} t0={t0} t1={t1}>
        <AbsoluteFill style={{ filter: `saturate(${0.4})` }}>
          <Backdrop base="#2B3142" light="#465069">
            <Rain t={t} n={80} />
            {items.map((it, i) => (
              <Bubble key={i} t={t} at={it.at} cx={360 + i * 600} cy={460} r={210} id={`lon${i}`} bg="#3A4258">
                <g transform="translate(210 400) scale(0.7)"><Person x={0} y={0} look={it.look} mood="sad" t={t + i} /></g>
                <text x={210} y={90} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={40} fill={P.cream}>{it.txt}</text>
              </Bubble>
            ))}
            {t > S(94) && <g transform="translate(960 900)"><g transform="scale(0.8)"><Person x={0} y={0} look={YOU} mood="sad" t={t} /></g></g>}
          </Backdrop>
        </AbsoluteFill>
      </Camera>
    );
  },

  theo_call2: ({ t, t0, t1 }) => (
    <Camera t={t} t0={t0} t1={t1} to={1.12} fx={800}>
      <Backdrop base={P.night} light={P.dusk} cx={50} cy={30}>
        <rect x={500} y={120} width={640} height={420} rx={8} fill="#141A28" />
        <Rain t={t} x={500} y={120} w={640} h={420} n={45} />
        <rect x={500} y={120} width={640} height={420} rx={8} fill="none" stroke="#3C4866" strokeWidth={18} />
        <rect y={880} width={1920} height={200} fill="#18202F" />
        <Person x={820} y={1000} look={YOU} mood="sad" t={t} pose="phone" holding={<Phone x={0} y={0} s={0.5} />} />
        <Bubble t={t} at={S(96) - 0.2} cx={1420} cy={380} r={170} fromX={950} fromY={600} id="theo2" bg="#4A3B33">
          <g transform="translate(170 200) scale(0.8)"><Head look={THEO} mood="sad" t={t} talk={speaking(t, "THEO")} /></g>
        </Bubble>
      </Backdrop>
    </Camera>
  ),

  club: ({ t, t0, t1 }) => {
    const ha = t > S(98) + 5;
    return (
      <Camera t={t} t0={t0} t1={t1} punch={[S(98) + 5]} fy={560}>
        <Stage t={t} crowd={10} />
        <Svg>
          <Person x={960} y={890} look={THEO} mood={ha ? "happy" : t > S(98) ? "nervous" : "neutral"} t={t} talk={t > S(97) + 3 && t < S(99) && !ha} pose="hold"
            holding={<g><rect x={-6} y={-70} width={12} height={70} fill="#555" /><circle cy={-80} r={18} fill="#333" /></g>} sweat={!ha} />
          {ha && <g transform={`translate(1350 560) scale(${pop(t, S(98) + 5)})`}><circle r={90} fill={P.cream} /><text y={30} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={80} fill={P.orange}>HA!</text></g>}
        </Svg>
        <Chip t={t} at={S(97) - 0.4} text="FRIDAY · 10:15 P.M." />
      </Camera>
    );
  },

  door: ({ t, t0, t1 }) => {
    const decide = t > S(102) && t < S(105);
    const theoMood: Mood = t > S(107) ? "happy" : t > S(106) ? "sad" : t > S(105) ? "shocked" : "nervous";
    const youMood: Mood = t > S(107) ? "happy" : t > S(105) ? "smug" : decide ? "deadpan" : "neutral";
    const rainStop = 1 - ease(t, S(108), E(108) + 0.8);
    return (
      <Camera t={t} t0={t0} t1={t1} fx={decide ? 650 : 960} to={1.15} punch={[S(105) + 0.2]}>
        <Backdrop base="#2E2226" light="#5C3E3A" cx={50} cy={30}>
          <rect x={760} y={100} width={400} height={300} rx={8} fill="#141A28" />
          <Rain t={t} x={760} y={100} w={400} h={300} n={Math.round(30 * rainStop)} />
          <rect x={760} y={100} width={400} height={300} rx={8} fill="none" stroke="#4A3434" strokeWidth={16} />
          <text x={960} y={470} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={42} fill={P.red} opacity={0.7 + 0.3 * Math.sin(t * 4)}>EXIT</text>
          <rect y={880} width={1920} height={200} fill="#1A1214" />
          <Person x={640} y={1000} look={YOU} mood={youMood} t={t} talk={speaking(t, "YOU")} lookX={1} />
          <Person x={1280} y={1000} look={THEO} mood={theoMood} t={t} talk={speaking(t, "THEO")} flip lookX={-1} />
          {decide && <>
            <Bubble t={t} at={S(103)} until={S(104)} cx={420} cy={300} r={120} fromX={600} fromY={560} id="truth" bg="#3A4258">
              <text x={120} y={135} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={70} fill={P.cream}>3/10</text>
            </Bubble>
            <Bubble t={t} at={S(104) + 0.3} until={S(105)} cx={420} cy={300} r={120} fromX={600} fromY={560} id="lie" bg="#5C3E3A">
              <text x={120} y={145} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={110} fill={P.gold}>★</text>
            </Bubble>
          </>}
          <Bokeh t={t} color="#FFD9A8" opacity={0.12} />
        </Backdrop>
      </Camera>
    );
  },

  bigshow: ({ t, t0, t1 }) => (
    <Camera t={t} t0={t0} t1={t1} from={1.15} to={1}>
      <Stage t={t} crowd={20} brick={false} laugh big />
      <Svg>
        <Person x={960} y={890} look={THEO} mood="happy" t={t} pose="cheer" />
        <Bokeh t={t} color={P.gold} opacity={0.25} />
      </Svg>
      <Chip t={t} at={S(109) - 0.3} text="ONE YEAR LATER" />
    </Camera>
  ),

  phone3am: ({ t, t0, t1 }) => {
    const laugh = t > S(115);
    return (
      <Camera t={t} t0={t0} t1={t1} from={1} to={1.1} fx={1000} fy={560} punch={[S(114) + 0.2]}>
        <Bedroom t={t} lit={1} />
        <InBed t={t + (laugh ? Math.sin(t * 20) * 0.02 : 0)} mood={laugh || t > S(114) ? "happy" : t > S(113) ? "smug" : "neutral"} talk={speaking(t, "YOU")} phone />
        <Svg>
          <Bubble t={t} at={S(111) - 0.2} cx={1500} cy={330} r={160} fromX={1150} fromY={560} id="theo3" bg="#4A3B33">
            <g transform="translate(160 190) scale(0.75)"><Head look={THEO} mood={t > S(113) ? "happy" : "smug"} t={t} talk={speaking(t, "THEO")} /></g>
          </Bubble>
          {laugh && ["ha", "ha", "HA"].map((h, i) => (
            <text key={i} x={1180 + i * 90} y={480 - ease(t, S(115) + i * 0.3, S(115) + i * 0.3 + 1.5) * 120} fontFamily={font} fontWeight={900} fontSize={54} fill={P.cream}
              opacity={1 - ease(t, S(115) + i * 0.3 + 1, S(115) + i * 0.3 + 1.5)}>{h}</text>
          ))}
        </Svg>
        <Chip t={t} at={S(110)} text="3:00 A.M." />
      </Camera>
    );
  },

  coda: ({ t, t0, t1 }) => (
    <Camera t={t} t0={t0} t1={t1} punch={[S(117) + 2.2]}>
      <Backdrop base="#2A2140" light="#4D3A6B">
        <Glow cx={960} cy={120} r={500} color="#FFD98A" opacity={0.3} id="poker-lamp" />
        <ellipse cx={960} cy={860} rx={720} ry={140} fill="#2E7D5B" />
        <Person x={480} y={1000} look={THEO} mood="happy" t={t} flip={false} lookX={1} />
        <Person x={960} y={960} look={YOU} mood="smug" t={t} pose="hold" holding={<g>{[0, 1, 2].map((i) => <rect key={i} x={-45 + i * 20} y={-70} width={60} height={90} rx={8} fill={P.cream} transform={`rotate(${-15 + i * 15})`} />)}</g>} />
        <Person x={1440} y={1000} look={extra(3)} mood="deadpan" t={t} flip lookX={-1} />
        {Array.from({ length: 14 }, (_, i) => <rect key={i} x={860 + (i % 7) * 30} y={820 - Math.floor(i / 7) * 22} width={28} height={18} rx={4} fill={[P.red, P.gold, P.white][i % 3]} />)}
      </Backdrop>
      <Chip t={t} at={S(116)} text="EVERY THURSDAY" />
    </Camera>
  ),

  endcard: ({ t, t0, t1 }) => (
    <Camera t={t} t0={t0} t1={t1} from={1} to={1.05}>
      <Backdrop base="#11162A" light="#26305A">
        <Bokeh t={t} />
        <DotLine t={t} y={900} />
        <g transform="translate(960 250) scale(0.9)"><Head look={YOU} mood="smug" t={t} /></g>
      </Backdrop>
      <Title t={t} at={t0 + 0.3} words={"WHAT IF YOU WERE THE LAST LIAR ON EARTH?".split(" ")} accent={["LAST", "LIAR"]} size={88} y={140} />
    </Camera>
  ),
};

// ---------- overlays ----------
const LIES: [number, number][] = [[10, 1], [25, 2], [31, 3], [38, 301], [40, 302], [42, 303], [49, 304], [56, 305], [76, 306], [105, 307]];
const liesAt = (t: number) => {
  if (t >= S(117)) return Math.round(interpolate(t, [S(117), S(117) + 2.2], [307, 9999], { extrapolateRight: "clamp" }));
  if (t >= S(33) && t < S(38)) return Math.round(interpolate(t, [S(33), E(36)], [3, 300], { extrapolateRight: "clamp" }));
  let v = 0;
  for (const [i, n] of LIES) if (t >= S(i)) v = n;
  return v;
};
const MONEY: [number, number, number][] = [[32, 0, 2000], [33, 2000, 41000], [54, 41000, 380000], [67, 380000, 1000000]];
const moneyAt = (t: number) => {
  let v = 0;
  for (const [i, from, to] of MONEY) {
    if (t < S(i)) break;
    const end = i === 32 ? E(32) : i === 33 ? E(36) : i === 54 ? E(57) : E(68);
    v = Math.round(interpolate(t, [S(i), end], [from, to], { extrapolateRight: "clamp" }));
  }
  return v;
};
const lastTick = (t: number) => Math.max(...LIES.map(([i]) => (t >= S(i) ? S(i) : -99)));

const HUD: React.FC<{ t: number; shot: string }> = ({ t, shot }) => {
  const hidden = ["showtitle", "svb", "endcard", "views", "anchor"].includes(shot) || t < S(2);
  if (hidden) return null;
  const bump = Math.max(0, 1 - (t - lastTick(t)) * 3);
  const money = moneyAt(t);
  const warm = t > S(105) && t < S(117);
  return (
    <>
      <Counter label="LIES TOLD" value={liesAt(t).toLocaleString("en-US")} x={1540} y={40} bump={bump} color={warm ? P.gold : "#FF6B6B"} />
      {money > 0 && t < S(74) && <Counter label="MONEY" value={`$${money.toLocaleString("en-US")}`} x={1460} y={170} color="#6FD38F" />}
    </>
  );
};

const SPEAKER_COLOR: Record<string, string> = { NARRATOR: "#FFFFFF", YOU: "#7FE3DD", THEO: "#FFB37A" };
const Captions: React.FC<{ t: number }> = ({ t }) => {
  const line = L.find((l) => t >= l.start && t <= l.end + 0.15);
  if (!line || line.scene === "endcard") return null;
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 46 }}>
      <div style={{ maxWidth: 1500, background: "rgba(16,20,32,0.72)", borderRadius: 18, padding: "12px 28px", fontFamily: font,
        fontWeight: 800, fontSize: 46, lineHeight: 1.25, textAlign: "center", color: SPEAKER_COLOR[line.who] ?? "#F4D58D" }}>
        {line.text}
      </div>
    </AbsoluteFill>
  );
};

export const Episode: React.FC = () => {
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
      <Captions t={t} />
      {!("estimated" in timeline) && <Audio src={staticFile("last-liar/voice.wav")} />}
    </AbsoluteFill>
  );
};
