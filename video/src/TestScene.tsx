import React from "react";
import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import timeline from "../public/test-scene/timeline.json";
import { INK, OUT, C as CC, You, Arm, SHOULDER_R, toWorld, Shadow, Pt } from "./cartoon";

type Line = (typeof timeline.lines)[number];
const L = timeline.lines;

const C = {
  ...CC,
  wall: "#B9C3F2", wallStripe: "#AFB9EC", floor: "#9A6E58", plank: "#86604C", base: "#F3F0FF",
  wood: "#C98B5A", woodDark: "#9C6440", blanket: "#F27C6B", blanketStripe: "#E05F50",
  sheet: "#FFFFFF", pillow: "#EDEFFF", mint: "#9BE3C8", night: "#1E2140", red: "#FF5A5A",
  curtain: "#F7A1C4", sky: "#8FD3FF", leaf: "#4CB07A", pot: "#E0784F", rug: "#FFD27A", rugStripe: "#F2B84B",
};
const SPEAKER = { narrator: "#FFFFFF", you: "#FFE066", roommate: "#FF9AC1" } as const;
const stroke = { stroke: INK, strokeWidth: OUT, strokeLinejoin: "round" as const };

// A scene starts a beat before its first line so the cut lands in the pause.
const sceneStart = (name: string) => Math.max(0, L.find((l) => l.scene === name)!.start - 0.25);
const S = { fact: sceneStart("fact"), door: sceneStart("door"), end: sceneStart("end") };
const T = {
  hit: L[0].end - 0.15,   // fist lands on the snooze button
  sit: L[3].start,        // "You sit up."
  snap: L[3].start + 1.6, // "...snaps like a breadstick"
  bubble: L[4].start,     // roommate shouts
  grow: L[7].start,       // "Overnight, yours went up ten times."
  reach: L[9].start,      // "You reach for the doorknob."
};

const ease = (t: number, a: number, b: number, from = 0, to = 1) =>
  interpolate(t, [a, b], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
const mix = (a: Pt, b: Pt, p: number): Pt => ({ x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p });
const useT = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return { t: frame / fps, fps, frame };
};
const pop = (frame: number, fps: number, at: number) => spring({ frame: frame - at * fps, fps, config: { damping: 11, stiffness: 160 } });
const blinkAt = (t: number) => t % 2.7 < 0.12;

const Stripes: React.FC<{ id: string; a: string; b: string; w: number; angle?: number }> = ({ id, a, b, w, angle = 0 }) => (
  <pattern id={id} width={w * 2} height={w * 2} patternUnits="userSpaceOnUse" patternTransform={`rotate(${angle})`}>
    <rect width={w * 2} height={w * 2} fill={a} />
    <rect width={w} height={w * 2} fill={b} />
  </pattern>
);

// ---------- bedroom set pieces ----------
const Room: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <rect width={1920} height={800} fill="url(#wall)" />
    {/* window with sky, clouds and curtains */}
    <rect x={170} y={130} width={320} height={270} rx={10} fill={C.sky} {...stroke} />
    <circle cx={420} cy={200} r={38} fill={C.gold} {...stroke} />
    <clipPath id="win"><rect x={170} y={130} width={320} height={270} rx={10} /></clipPath>
    <g clipPath="url(#win)">{[0, 1].map((i) => {
      const x = 160 + ((t * 12 + i * 170) % 360);
      return <path key={i} d={`M ${x} ${300 - i * 60} a 22 22 0 0 1 40 -12 a 26 26 0 0 1 48 8 a 18 18 0 0 1 0 30 h -82 a 16 16 0 0 1 -6 -26 Z`} fill={C.white} {...stroke} strokeWidth={4} />;
    })}</g>
    <rect x={170} y={130} width={320} height={270} rx={10} fill="none" stroke={C.white} strokeWidth={14} />
    <rect x={170} y={130} width={320} height={270} rx={10} fill="none" {...stroke} />
    <line x1={330} y1={130} x2={330} y2={400} stroke={C.white} strokeWidth={10} />
    <rect x={150} y={395} width={360} height={22} rx={6} fill={C.white} {...stroke} />
    <line x1={110} y1={112} x2={550} y2={112} {...stroke} strokeWidth={10} strokeLinecap="round" />
    <path d="M 120 112 h 90 q -10 80 8 150 q 14 80 -4 160 h -86 q 10 -150 -8 -310 Z" fill={C.curtain} {...stroke} />
    <path d="M 450 112 h 90 q -16 160 -4 310 h -86 q -16 -80 -2 -160 q 14 -70 2 -150 Z" fill={C.curtain} {...stroke} />
    {/* poster */}
    <rect x={1180} y={170} width={190} height={240} rx={6} fill="#2B3270" {...stroke} />
    {[0, 1, 2, 3, 4].map((i) => <circle key={i} cx={1200 + i * 37} cy={200 + (i % 2) * 40} r={3} fill={C.white} />)}
    <g transform="translate(1275 300) rotate(20)">
      <path d="M 0 -70 q 30 30 22 90 h -44 q -8 -60 22 -90 Z" fill={C.white} {...stroke} strokeWidth={4} />
      <circle cy={-10} r={10} fill={C.sky} {...stroke} strokeWidth={4} />
      <path d="M -22 20 l -18 26 l 22 -6 Z M 22 20 l 18 26 l -22 -6 Z" fill={C.red} {...stroke} strokeWidth={4} />
      <path d="M -12 24 q 12 40 24 0 Z" fill={C.gold} />
    </g>
    {/* shelf with books and a trophy */}
    <rect x={860} y={330} width={250} height={18} rx={4} fill={C.wood} {...stroke} />
    {[["#F27C6B", 0, 78], ["#4F7DF3", 30, 92], ["#F5C542", 62, 70], ["#4CB07A", 90, 86]].map(([c, x, h]) => (
      <rect key={String(x)} x={880 + Number(x)} y={330 - Number(h)} width={28} height={Number(h)} rx={3} fill={String(c)} {...stroke} strokeWidth={4} />
    ))}
    <g transform="translate(1050 330)" {...stroke} strokeWidth={4}>
      <rect x={-18} y={-14} width={36} height={14} fill={C.woodDark} />
      <path d="M -22 -70 h 44 q 0 40 -22 44 q -22 -4 -22 -44 Z" fill={C.gold} />
      <rect x={-5} y={-28} width={10} height={14} fill={C.gold} />
    </g>
    {/* floor, baseboard, rug, plant */}
    <rect y={800} width={1920} height={280} fill={C.floor} />
    {[860, 940, 1030].map((y) => <line key={y} x1={0} y1={y} x2={1920} y2={y} stroke={C.plank} strokeWidth={4} />)}
    <rect y={772} width={1920} height={30} fill={C.base} {...stroke} strokeWidth={4} />
    <ellipse cx={1120} cy={872} rx={400} ry={46} fill="url(#rug)" {...stroke} />
    <g {...stroke}>
      <path d="M 1545 700 q -60 -60 -30 -140 q 30 40 30 140 Z" fill={C.leaf} />
      <path d="M 1575 700 q 50 -90 20 -170 q -50 70 -20 170 Z" fill={C.leaf} />
      <path d="M 1560 700 q 0 -100 -10 -160 q 40 60 10 160 Z" fill="#3E9A68" />
      <path d="M 1515 700 h 90 l -12 100 h -66 Z" fill={C.pot} />
    </g>
    {/* door the roommate is behind */}
    <rect x={1660} y={290} width={220} height={490} rx={6} fill={C.wood} {...stroke} />
    <rect x={1690} y={320} width={160} height={170} rx={6} fill="none" stroke={C.woodDark} strokeWidth={6} />
    <rect x={1690} y={530} width={160} height={210} rx={6} fill="none" stroke={C.woodDark} strokeWidth={6} />
    <circle cx={1700} cy={520} r={13} fill={C.gold} {...stroke} strokeWidth={4} />
  </g>
);

const Nightstand: React.FC<{ t: number; hitP: number }> = ({ t, hitP }) => {
  const broken = t >= T.hit;
  const blink = Math.floor(t * 2) % 2 === 0;
  const clock = (lit: boolean) => (
    <g>
      <rect width={130} height={70} rx={14} fill={INK} {...stroke} />
      <rect x={10} y={10} width={110} height={50} rx={8} fill="#0D0F24" />
      <text x={65} y={50} textAnchor="middle" fontFamily="monospace" fontSize={40} fontWeight={700} fill={lit ? C.red : "#7A2A2A"}>7:02</text>
      <rect x={45} y={-12} width={40} height={12} rx={4} fill={C.red} {...stroke} strokeWidth={4} />
    </g>
  );
  const lamp = (
    <g {...stroke}>
      <rect x={-30} y={-12} width={60} height={12} rx={4} fill={C.woodDark} />
      <rect x={-5} y={-80} width={10} height={70} fill={C.gold} />
      <path d="M -40 -80 h 80 l -16 -60 h -48 Z" fill="#FFF3B0" />
    </g>
  );
  if (!broken)
    return (
      <g>
        <Shadow cx={515} cy={800} rx={140} />
        <rect x={400} y={618} width={230} height={164} rx={10} fill={C.wood} {...stroke} />
        <rect x={420} y={650} width={190} height={56} rx={8} fill={C.woodDark} {...stroke} strokeWidth={4} />
        <circle cx={515} cy={678} r={8} fill={C.gold} {...stroke} strokeWidth={3} />
        <g transform="translate(450 618)">{lamp}</g>
        <g transform="translate(495 548)">{clock(blink)}</g>
      </g>
    );
  const dust = ease(t, T.hit, T.hit + 0.9);
  return (
    <g>
      <Shadow cx={515} cy={800} rx={160} />
      <g transform={`translate(${-80 * hitP} ${30 * hitP}) rotate(${-24 * hitP} 400 782)`}>
        <path d="M 400 640 L 515 628 L 492 782 L 400 782 Z" fill={C.wood} {...stroke} />
      </g>
      <g transform={`translate(${80 * hitP} ${30 * hitP}) rotate(${26 * hitP} 630 782)`}>
        <path d="M 525 628 L 630 640 L 630 782 L 505 782 Z" fill={C.wood} {...stroke} />
      </g>
      {/* lamp topples left, clock flies onto the floor */}
      <g transform={`translate(${450 - 120 * hitP} ${618 + 160 * hitP}) rotate(${-80 * hitP})`}>{lamp}</g>
      <g transform={`translate(${interpolate(hitP, [0, 1], [495, 230])} ${interpolate(hitP, [0, 1], [548, 845])}) rotate(${hitP * 200} 65 35)`}>{clock(false)}</g>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => {
        const a = (i / 7) * Math.PI * 2;
        return <circle key={i} cx={515 + Math.cos(a) * 150 * dust} cy={720 + Math.sin(a) * 60 * dust} r={28 + 30 * dust} fill={C.white} opacity={0.85 * (1 - dust)} {...stroke} strokeWidth={4} strokeOpacity={1 - dust} />;
      })}
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={515 + (i - 1.5) * 70 * hitP} y={700 + 90 * hitP} width={22} height={10} rx={3} fill={C.woodDark} transform={`rotate(${i * 50 * hitP} ${515 + (i - 1.5) * 70 * hitP} ${700 + 90 * hitP})`} />
      ))}
    </g>
  );
};

const BedHalf: React.FC<{ side: "head" | "foot" }> = ({ side }) =>
  side === "head" ? (
    <g>
      <rect x={640} y={430} width={60} height={370} rx={22} fill={C.woodDark} {...stroke} />
      <rect x={652} y={470} width={36} height={130} rx={12} fill={C.wood} />
      <rect x={640} y={680} width={460} height={70} fill={C.wood} {...stroke} />
      <rect x={700} y={600} width={400} height={84} rx={18} fill={C.sheet} {...stroke} />
      <ellipse cx={780} cy={598} rx={78} ry={34} fill={C.pillow} {...stroke} />
    </g>
  ) : (
    <g>
      <rect x={1100} y={680} width={460} height={70} fill={C.wood} {...stroke} />
      <rect x={1100} y={600} width={420} height={84} rx={18} fill={C.sheet} {...stroke} />
      <rect x={1500} y={540} width={60} height={260} rx={22} fill={C.woodDark} {...stroke} />
    </g>
  );

const Blanket: React.FC<{ x: number; w: number }> = ({ x, w }) => (
  <path d={`M ${x} 610 q ${w * 0.25} -26 ${w * 0.5} -4 q ${w * 0.25} -22 ${w * 0.5} 4 v 86 q -${w * 0.5} 16 -${w} 0 Z`} fill="url(#blanket)" {...stroke} />
);

// ---------- scene 1: bedroom (alarm, smash, bed) ----------
const Bedroom: React.FC = () => {
  const { t, fps, frame } = useT();
  const hitP = pop(frame, fps, T.hit);
  const snapP = t >= T.snap ? pop(frame, fps, T.snap) : 0;
  const sitP = ease(t, T.sit, T.sit + 0.6);
  const reachP = ease(t, T.hit - 0.7, T.hit);
  const retract = ease(t, T.sit - 0.8, T.sit - 0.15);
  const shake = (at: number) => (t >= at && t < at + 0.45 ? Math.sin(t * 90) * 16 * (1 - (t - at) / 0.45) : 0);
  const sx = shake(T.hit) + shake(T.snap);
  const tilt = snapP * 9;

  // body: lying -> leaning toward the clock -> back -> sitting up
  const lean = reachP * (1 - retract);
  const hip = mix(mix({ x: 990, y: 650 }, { x: 930, y: 640 }, lean), { x: 1030, y: 650 }, sitP);
  const rot = (1 - sitP) * (-90 + lean * 6) + tilt * 0.6;
  const expr = t < T.hit ? "sleepy" : t < T.bubble ? "shocked" : "nervous";

  // the reaching right arm, in world space so it can sit on top of the blanket
  const rest = toWorld({ x: 70, y: 40 }, hip, rot);
  const restSit = toWorld({ x: 110, y: -5 }, hip, rot);
  const clock = { x: 560, y: 585 };
  const rubble = { x: 545, y: 700 };
  let handW = mix(rest, clock, reachP);
  handW.y -= Math.sin(Math.PI * reachP) * 170;
  if (t >= T.hit) handW = mix(clock, rubble, ease(t, T.hit, T.hit + 0.15));
  if (retract > 0) handW = mix(rubble, sitP > 0 ? restSit : rest, retract);
  if (sitP > 0) handW = restSit;
  const shoulder = toWorld(SHOULDER_R, hip, rot);
  const sweat = t > L[5].start ? ease(t, L[5].start, L[5].start + 0.4) : 0;

  return (
    <AbsoluteFill style={{ background: C.wall }}>
      <svg viewBox="0 0 1920 1080" style={{ transform: `translateX(${sx}px)` }}>
        <defs>
          <Stripes id="wall" a={C.wall} b={C.wallStripe} w={40} />
          <Stripes id="blanket" a={C.blanket} b={C.blanketStripe} w={22} angle={90} />
          <Stripes id="rug" a={C.rug} b={C.rugStripe} w={30} />
        </defs>
        <Room t={t} />
        <Shadow cx={1100} cy={802} rx={480} />
        <Nightstand t={t} hitP={hitP} />
        <g transform={`rotate(${tilt} 1100 800)`}><BedHalf side="head" /></g>
        <g transform={`rotate(${-tilt} 1100 800)`}><BedHalf side="foot" /></g>
        {t >= T.snap && (
          <g opacity={1 - ease(t, T.snap + 0.9, T.snap + 1.5)} {...stroke} fill="none">
            <path d="M 1088 662 l 16 26 l -14 22 l 18 30" />
            <path d="M 1040 640 l -30 -20 M 1150 640 l 30 -22 M 1100 630 l 0 -34" strokeLinecap="round" />
          </g>
        )}
        {sitP <= 0.5 && <Arm s={shoulder} target={handW} bend={1} />}
        <g transform={`translate(${hip.x} ${hip.y}) rotate(${rot})`}>
          <You expr={expr} blink={expr !== "sleepy" && blinkAt(t)} look={expr === "nervous" ? 1 : 0}
            breathe={Math.sin(t * 2.6)} sweat={sweat} rightArm={false} leftArm={sitP > 0.5} />
        </g>
        <g transform={`rotate(${tilt * 0.5} 1100 800)`}>
          <Blanket x={sitP > 0.5 ? 1010 : 880} w={sitP > 0.5 ? 512 : 642} />
        </g>
        {sitP > 0.5 && <Arm s={shoulder} target={handW} bend={1} />}
        {/* Zzz while asleep */}
        {t < T.hit - 0.7 &&
          [0, 1, 2].map((i) => {
            const p = ((t * 0.6 + i / 3) % 1);
            return (
              <text key={i} x={740 + p * 80} y={540 - p * 160} fontSize={40 + p * 30} fontWeight={900} fill={C.white} opacity={1 - p}
                stroke={INK} strokeWidth={4} paintOrder="stroke" fontFamily="sans-serif">z</text>
            );
          })}
        {t > T.hit && t < T.hit + 0.6 && (
          <g transform={`translate(560 450) rotate(-8) scale(${0.6 + hitP * 0.5})`}>
            <path d="M -190 -10 l 40 -60 l 30 30 l 50 -70 l 30 50 l 60 -40 l 10 50 l 70 -10 l -30 50 l 50 30 l -60 20 l 20 50 l -70 -10 l -20 50 l -40 -40 l -60 40 l -10 -50 l -70 10 Z" fill={C.gold} {...stroke} />
            <text y={22} textAnchor="middle" fontSize={84} fontWeight={900} fill={C.white} stroke={INK} strokeWidth={8} paintOrder="stroke" fontFamily="sans-serif">CRUNCH</text>
          </g>
        )}
        {t > T.bubble && t < S.fact && (
          <g transform={`translate(1560 200) scale(${pop(frame, fps, T.bubble)})`}>
            <path d="M -220 -70 h 440 a 30 30 0 0 1 30 30 v 80 a 30 30 0 0 1 -30 30 h -110 l 60 70 l -120 -70 h -270 a 30 30 0 0 1 -30 -30 v -80 a 30 30 0 0 1 30 -30 Z" fill={C.white} {...stroke} />
            <text y={20} textAnchor="middle" fontSize={58} fontWeight={900} fill={INK} fontFamily="sans-serif">What was that?!</text>
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};

// ---------- scene 2: the fact card ----------
const MiniHead: React.FC<{ hair: string; skin?: string }> = ({ hair, skin = C.skin }) => (
  <g {...stroke}>
    <circle r={46} fill={skin} />
    <path d="M -48 -6 Q -50 -56 0 -54 Q 50 -56 48 -6 Q 30 -30 0 -26 Q -30 -30 -48 -6 Z" fill={hair} />
    <circle cx={-16} cy={4} r={5} fill={INK} stroke="none" />
    <circle cx={16} cy={4} r={5} fill={INK} stroke="none" />
    <path d="M -10 22 q 10 6 20 0" fill="none" strokeWidth={4} />
  </g>
);

const Fact: React.FC = () => {
  const { t, fps, frame } = useT();
  const inP = pop(frame, fps, S.fact);
  const avg = ease(t, S.fact + 0.8, S.fact + 2) * 380;
  const you = ease(t, T.grow, T.grow + 1.6) * 3800;
  const burst = you > 1540;
  const stamp = pop(frame, fps, T.grow + 1.4);
  return (
    <AbsoluteFill style={{ background: C.mint }}>
      <svg viewBox="0 0 1920 1080">
        <defs>
          <pattern id="dots" width={44} height={44} patternUnits="userSpaceOnUse">
            <circle cx={22} cy={22} r={5} fill="#86D6B8" />
          </pattern>
        </defs>
        <rect width={1920} height={1080} fill="url(#dots)" />
        <g transform={`translate(0 ${(1 - inP) * 220})`} opacity={Math.min(1, inP * 1.5)}>
          <rect x={140} y={140} width={1640} height={720} rx={34} fill={INK} transform="translate(14 16)" />
          <rect x={140} y={140} width={1640} height={720} rx={34} fill={C.white} {...stroke} />
          <g transform="translate(250 240)" {...stroke} strokeWidth={5}>
            <rect x={-38} y={-30} width={76} height={62} rx={22} fill={C.skin} />
            {[-26, -9, 8, 25].map((x) => <line key={x} x1={x} y1={-30} x2={x} y2={-6} strokeWidth={4} />)}
          </g>
          <text x={320} y={268} fontSize={80} fontWeight={900} fill={INK} fontFamily="sans-serif">GRIP STRENGTH</text>
          {/* scale ticks */}
          {[0, 100, 200, 300].map((kg, i) => (
            <g key={kg}>
              <line x1={420 + i * 338} y1={360} x2={420 + i * 338} y2={790} stroke="#D5D9F0" strokeWidth={4} strokeDasharray="10 12" />
              <text x={420 + i * 338} y={350} textAnchor="middle" fontSize={30} fontWeight={700} fill="#8A90B8" fontFamily="sans-serif">{kg} kg</text>
            </g>
          ))}
          <g transform="translate(280 480)"><MiniHead hair="#8A90B8" /></g>
          <text x={420} y={430} fontSize={40} fontWeight={800} fill={INK} fontFamily="sans-serif">Most adults</text>
          <rect x={420} y={450} width={Math.max(avg, 1)} height={80} rx={22} fill={C.shirt} {...stroke} />
          {avg > 300 && <text x={420 + avg + 24} y={505} fontSize={44} fontWeight={900} fill={INK} fontFamily="sans-serif">30–45 kg</text>}
          <g transform="translate(280 700)"><MiniHead hair={C.hair} /></g>
          <text x={420} y={650} fontSize={40} fontWeight={800} fill={INK} fontFamily="sans-serif">You, this morning</text>
        </g>
        <rect x={420} y={670} width={Math.max(you, 1)} height={80} rx={22} fill={C.blanket} {...stroke} opacity={inP} />
        {you > 500 && <text x={450} y={725} fontSize={44} fontWeight={900} fill={C.white} stroke={INK} strokeWidth={6} paintOrder="stroke" fontFamily="sans-serif">300–450 kg</text>}
        {burst && (
          <g {...stroke} fill="none" strokeLinecap="round">
            <path d="M 1782 640 l 30 -40 M 1782 780 l 36 30 M 1790 700 l 50 -6 M 1760 650 l -20 -40 M 1760 770 l -16 40" />
          </g>
        )}
        {t > T.grow + 1.4 && (
          <g transform={`translate(1560 300) rotate(-12) scale(${stamp})`}>
            <path d="M 0 -150 l 35 50 l 60 -25 l 0 62 l 62 10 l -36 50 l 46 42 l -60 20 l 16 60 l -62 -8 l -20 60 l -41 -48 l -41 48 l -20 -60 l -62 8 l 16 -60 l -60 -20 l 46 -42 l -36 -50 l 62 -10 l 0 -62 l 60 25 Z" fill={C.gold} {...stroke} />
            <text y={40} textAnchor="middle" fontSize={120} fontWeight={900} fill={INK} fontFamily="sans-serif">×10</text>
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};

// ---------- scene 3: the door ----------
const Door: React.FC = () => {
  const { t } = useT();
  const reach = ease(t, T.reach, T.reach + 1.4);
  const touched = t > T.reach + 1.4;
  const tremble = Math.sin(t * 60) * 4 * reach;
  const zoom = 1 + ease(t, S.door, S.end) * 0.1;
  return (
    <AbsoluteFill style={{ background: C.wall }}>
      <svg viewBox="0 0 1920 1080" style={{ transform: `scale(${zoom})` }}>
        <defs><Stripes id="wall2" a={C.wall} b={C.wallStripe} w={60} /></defs>
        <rect width={1920} height={1080} fill="url(#wall2)" />
        {/* framed picture and light switch */}
        <rect x={120} y={200} width={300} height={230} rx={8} fill={C.white} {...stroke} />
        <rect x={145} y={225} width={250} height={180} fill={C.sky} {...stroke} strokeWidth={4} />
        <path d="M 145 405 l 80 -110 l 50 60 l 40 -40 l 80 90 Z" fill={C.leaf} {...stroke} strokeWidth={4} />
        <circle cx={350} cy={265} r={20} fill={C.gold} {...stroke} strokeWidth={4} />
        <rect x={1420} y={470} width={70} height={110} rx={10} fill={C.base} {...stroke} />
        <rect x={1445} y={500} width={20} height={44} rx={6} fill="#D5D9F0" {...stroke} strokeWidth={4} />
        <rect y={1000} width={1920} height={80} fill={C.base} {...stroke} />
        {/* the door */}
        <rect x={560} y={40} width={720} height={1060} rx={10} fill={C.wood} {...stroke} />
        <path d="M 1180 40 h 100 v 1060 h -100 Z" fill={C.woodDark} opacity={0.25} />
        <rect x={630} y={120} width={580} height={360} rx={14} fill="none" stroke={C.woodDark} strokeWidth={10} />
        <rect x={630} y={560} width={580} height={420} rx={14} fill="none" stroke={C.woodDark} strokeWidth={10} />
        {[200, 860].map((y) => <rect key={y} x={548} y={y} width={30} height={90} rx={6} fill={C.goldShade} {...stroke} strokeWidth={4} />)}
        <ellipse cx={1170} cy={600} rx={42} ry={78} fill={C.goldShade} {...stroke} />
        <circle cx={1170} cy={600} r={52} fill={C.gold} {...stroke} />
        <path d="M 1140 575 q 12 -18 32 -16" stroke={C.white} strokeWidth={8} strokeLinecap="round" fill="none" opacity={0.8} />
        {touched && (
          <g {...stroke} fill="none" strokeLinecap="round" opacity={ease(t, T.reach + 1.4, T.reach + 1.6)}>
            <path d="M 1110 540 l -30 -30 l 8 -24 M 1110 670 l -36 30 M 1220 540 l 26 -34 M 1225 665 l 30 26 l 4 22" />
            <text x={1230} y={440} fontSize={56} fontWeight={900} fill={C.white} stroke={INK} strokeWidth={6} paintOrder="stroke" fontFamily="sans-serif">creak…</text>
          </g>
        )}
        {/* the hand, slowly, carefully */}
        <g transform={`translate(${interpolate(reach, [0, 1], [2050, 1235]) + tremble} ${612 + tremble})`}>
          <rect x={60} y={-56} width={900} height={112} rx={30} fill={C.shirt} {...stroke} />
          <rect x={60} y={-56} width={60} height={112} rx={20} fill={C.shirtShade} {...stroke} />
          <g {...stroke}>
            {[-48, -18, 12, 42].map((y, i) => <rect key={y} x={-70 - (i === 1 || i === 2 ? 14 : 0)} y={y - 15} width={110} height={30} rx={15} fill={C.skin} />)}
            <ellipse cx={30} cy={0} rx={62} ry={70} fill={C.skin} />
            <ellipse cx={-4} cy={58} rx={38} ry={20} fill={C.skin} transform="rotate(-20 -4 58)" />
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// ---------- scene 4: end card ----------
const End: React.FC = () => {
  const { t, fps, frame } = useT();
  const line = L[L.length - 1];
  const words = line.text.split(" ");
  const per = (line.end - line.start) / words.length;
  const knob = pop(frame, fps, S.end + 0.1);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, #2B3270, ${C.night} 70%)`, justifyContent: "center", alignItems: "center", fontFamily: "sans-serif" }}>
      <svg viewBox="0 0 1920 1080" style={{ position: "absolute" }}>
        <g transform={`translate(960 300) scale(${knob}) rotate(${Math.sin(t * 3) * 8})`} {...stroke}>
          <ellipse rx={34} ry={62} fill={C.goldShade} />
          <circle r={46} fill={C.gold} />
          <path d="M -10 -46 l 10 26 l -14 18 l 12 20" fill="none" strokeLinecap="round" />
        </g>
      </svg>
      <div style={{ fontSize: 104, fontWeight: 900, color: C.white, textAlign: "center", maxWidth: 1500, marginTop: 220,
        textShadow: `0 8px 0 ${INK}` }}>
        {words.map((w, i) => (
          <span key={i} style={{ opacity: ease(t, line.start + i * per, line.start + i * per + 0.2), color: w.startsWith("weird") ? C.gold : C.white }}>{w} </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ---------- captions ----------
const Captions: React.FC = () => {
  const { t } = useT();
  const line: Line | undefined = L.find((l) => t >= l.start && t <= l.end + 0.2);
  if (!line || line.scene === "end") return null;
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 60, fontFamily: "sans-serif" }}>
      <div style={{ fontSize: 52, fontWeight: 900, color: SPEAKER[line.who as keyof typeof SPEAKER], textAlign: "center", maxWidth: 1500,
        WebkitTextStroke: `10px ${INK}`, paintOrder: "stroke fill", lineHeight: 1.25 }}>
        {line.text}
      </div>
    </AbsoluteFill>
  );
};

export const TestScene: React.FC = () => {
  const { t } = useT();
  const scene = t >= S.end ? <End /> : t >= S.door ? <Door /> : t >= S.fact ? <Fact /> : <Bedroom />;
  return (
    <AbsoluteFill>
      {scene}
      <Captions />
      <Audio src={staticFile("test-scene/voice.wav")} />
    </AbsoluteFill>
  );
};
