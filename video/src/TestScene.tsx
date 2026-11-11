import React from "react";
import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import timeline from "../public/test-scene/timeline.json";

type Line = (typeof timeline.lines)[number];
const L = timeline.lines;

const C = {
  wall: "#B8C4F0", floor: "#8C6A5A", skin: "#F6C49A", shirt: "#4F7DF3", blanket: "#F27C6B",
  wood: "#C98B5A", woodDark: "#9C6440", ink: "#1E2140", white: "#FFFFFF", gold: "#F5C542",
  mint: "#9BE3C8", night: "#1E2140", sweat: "#7FD3FF",
};
const SPEAKER = { narrator: "#FFFFFF", you: "#FFE066", roommate: "#FF9AC1" } as const;

// A scene starts a beat before its first line so the cut lands in the pause.
const sceneStart = (name: string) => Math.max(0, L.find((l) => l.scene === name)!.start - 0.25);
const S = {
  bedroom: 0,
  fact: sceneStart("fact"),
  door: sceneStart("door"),
  end: sceneStart("end"),
};
const T = {
  hit: L[0].end - 0.15,          // fist lands on the snooze button
  sit: L[3].start,               // "You sit up."
  snap: L[3].start + 1.6,        // "...snaps like a breadstick"
  bubble: L[4].start,            // roommate shouts
  grow: L[7].start,              // "Overnight, yours went up ten times."
  reach: L[9].start,             // "You reach for the doorknob."
};

const ease = (t: number, a: number, b: number, from = 0, to = 1) =>
  interpolate(t, [a, b], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });

const useT = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return { t: frame / fps, fps, frame };
};

const pop = (frame: number, fps: number, at: number) => spring({ frame: frame - at * fps, fps, config: { damping: 11, stiffness: 160 } });

// ---------- the main character ----------
const You: React.FC<{ eyes: "sleepy" | "wide" | "nervous"; sweat?: number }> = ({ eyes, sweat = 0 }) => (
  <g>
    <rect x={-62} y={-150} width={124} height={150} rx={50} fill={C.shirt} />
    <circle cx={0} cy={-215} r={68} fill={C.skin} />
    <path d="M -66 -235 Q -40 -300 20 -288 Q 70 -280 66 -228 Q 30 -262 -66 -235 Z" fill={C.ink} />
    {eyes === "sleepy" && (
      <g stroke={C.ink} strokeWidth={6} strokeLinecap="round" fill="none">
        <path d="M -34 -210 Q -24 -202 -14 -210" />
        <path d="M 14 -210 Q 24 -202 34 -210" />
      </g>
    )}
    {eyes !== "sleepy" && (
      <g>
        <circle cx={-24} cy={-212} r={eyes === "wide" ? 17 : 13} fill={C.white} />
        <circle cx={24} cy={-212} r={eyes === "wide" ? 17 : 13} fill={C.white} />
        <circle cx={-22} cy={-210} r={7} fill={C.ink} />
        <circle cx={26} cy={-210} r={7} fill={C.ink} />
      </g>
    )}
    {eyes === "nervous" ? (
      <path d="M -24 -172 Q -12 -180 0 -172 Q 12 -164 24 -172" stroke={C.ink} strokeWidth={5} fill="none" strokeLinecap="round" />
    ) : (
      <ellipse cx={0} cy={-170} rx={eyes === "wide" ? 9 : 12} ry={eyes === "wide" ? 11 : 4} fill={C.ink} />
    )}
    {sweat > 0 && <path d={`M 70 -250 q 12 22 0 30 q -12 -8 0 -30 Z`} fill={C.sweat} opacity={sweat} transform={`translate(0 ${(1 - sweat) * -20})`} />}
  </g>
);

// ---------- scene 1: bedroom (alarm, smash, bed) ----------
const Bedroom: React.FC = () => {
  const { t, fps, frame } = useT();
  const hitP = pop(frame, fps, T.hit);
  const broken = t >= T.hit;
  const snapped = t >= T.snap;
  const snapP = pop(frame, fps, T.snap);
  const sitP = ease(t, T.sit, T.sit + 0.6);
  const shake = (at: number) => (t >= at && t < at + 0.4 ? Math.sin(t * 90) * 14 * (1 - (t - at) / 0.4) : 0);
  const sx = shake(T.hit) + shake(T.snap);

  // fist travels in an arc from the bed to the clock, then stays in the rubble
  const reachP = ease(t, T.hit - 0.6, T.hit);
  const retract = ease(t, T.sit - 0.8, T.sit - 0.2);
  const hand = {
    x: interpolate(reachP, [0, 1], [930, 560]) + retract * 320,
    y: interpolate(reachP, [0, 1], [560, 650]) - Math.sin(Math.PI * reachP) * 220 * (1 - retract) - retract * 0,
  };
  const showHand = t > T.hit - 0.6 && t < T.sit - 0.2;
  const blink = Math.floor(t * 2) % 2 === 0;

  const eyes = t < T.hit ? "sleepy" : t < T.bubble ? "wide" : "nervous";
  const bedTilt = snapped ? snapP * 9 : 0;

  return (
    <AbsoluteFill style={{ background: C.wall }}>
      <svg viewBox="0 0 1920 1080" style={{ transform: `translateX(${sx}px)` }}>
        {/* window */}
        <rect x={220} y={150} width={300} height={240} rx={16} fill="#FFE9A8" stroke={C.white} strokeWidth={16} />
        <line x1={370} y1={150} x2={370} y2={390} stroke={C.white} strokeWidth={12} />
        <circle cx={460} cy={215} r={34} fill="#FFC94D" />
        {/* door (roommate is behind it) */}
        <rect x={1640} y={300} width={220} height={480} rx={8} fill={C.wood} />
        <circle cx={1680} cy={560} r={14} fill={C.gold} />
        {/* floor */}
        <rect x={0} y={780} width={1920} height={300} fill={C.floor} />

        {/* nightstand + alarm clock */}
        {!broken && (
          <g>
            <rect x={460} y={620} width={200} height={160} rx={10} fill={C.wood} />
            <rect x={480} y={660} width={160} height={50} rx={8} fill={C.woodDark} />
            <rect x={490} y={545} width={140} height={75} rx={14} fill={C.ink} />
            <text x={560} y={600} textAnchor="middle" fontFamily="monospace" fontSize={44} fontWeight={700} fill={blink ? "#FF5A5A" : "#7A2A2A"}>7:02</text>
            <rect x={540} y={530} width={40} height={15} rx={5} fill="#FF5A5A" />
          </g>
        )}
        {broken && (
          <g>
            <g transform={`translate(${-90 * hitP} ${40 * hitP}) rotate(${-24 * hitP} 460 780)`}>
              <path d="M 460 640 L 555 630 L 535 780 L 460 780 Z" fill={C.wood} />
            </g>
            <g transform={`translate(${90 * hitP} ${40 * hitP}) rotate(${26 * hitP} 660 780)`}>
              <path d="M 565 630 L 660 640 L 660 780 L 548 780 Z" fill={C.wood} />
            </g>
            {/* clock flies and lands on the floor */}
            <g transform={`translate(${interpolate(hitP, [0, 1], [490, 250])} ${interpolate(hitP, [0, 1], [545, 820])}) rotate(${hitP * 200} 70 37)`}>
              <rect width={140} height={75} rx={14} fill={C.ink} />
              <text x={70} y={55} textAnchor="middle" fontFamily="monospace" fontSize={44} fontWeight={700} fill="#7A2A2A">7:02</text>
            </g>
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const p = ease(t, T.hit, T.hit + 0.9);
              const a = (i / 6) * Math.PI * 2;
              return <circle key={i} cx={560 + Math.cos(a) * 140 * p} cy={720 + Math.sin(a) * 60 * p} r={30 + 30 * p} fill={C.white} opacity={0.8 * (1 - p)} />;
            })}
          </g>
        )}

        {/* bed: two halves that fold into a V when it snaps */}
        <g transform={`rotate(${bedTilt} 1180 780)`}>
          <rect x={700} y={460} width={45} height={320} rx={12} fill={C.woodDark} />
          <rect x={700} y={660} width={480} height={70} fill={C.wood} />
          <rect x={745} y={590} width={435} height={70} rx={20} fill={C.white} />
          <ellipse cx={810} cy={585} rx={70} ry={30} fill="#EDEFFF" />
        </g>
        <g transform={`rotate(${-bedTilt} 1180 780)`}>
          <rect x={1180} y={660} width={360} height={70} fill={C.wood} />
          <rect x={1180} y={590} width={340} height={70} rx={20} fill={C.white} />
          <rect x={1515} y={540} width={40} height={240} rx={12} fill={C.woodDark} />
        </g>
        {snapped && (
          <path d="M 1165 660 l 15 25 l -12 20 l 18 25" stroke={C.ink} strokeWidth={6} fill="none" opacity={1 - ease(t, T.snap + 0.8, T.snap + 1.4)} />
        )}

        {/* the fist */}
        {showHand && (
          <g>
            <line x1={950} y1={600} x2={hand.x} y2={hand.y} stroke={C.skin} strokeWidth={34} strokeLinecap="round" />
            <circle cx={hand.x} cy={hand.y} r={36} fill={C.skin} />
          </g>
        )}
        {/* you: lying down, then sitting up (rotate around the hip) */}
        <g transform={`translate(1060 ${640 - sitP * 10}) rotate(${(1 - sitP) * -90 + bedTilt * 0.6})`}>
          <You eyes={eyes} sweat={t > L[5].start ? ease(t, L[5].start, L[5].start + 0.4) : 0} />
        </g>
        {/* blanket over the legs */}
        <g transform={`rotate(${bedTilt * 0.5} 1180 780)`}>
          <rect x={sitP > 0.5 ? 1040 : 900} y={600} width={sitP > 0.5 ? 480 : 620} height={80} rx={30} fill={C.blanket} />
        </g>

        {t > T.hit && t < T.hit + 0.5 && (
          <text x={560} y={470} textAnchor="middle" fontSize={110} fontWeight={900} fill={C.white} stroke={C.ink} strokeWidth={8} paintOrder="stroke"
            transform={`rotate(-8 560 470) scale(${0.6 + hitP * 0.4})`} style={{ transformBox: "fill-box", transformOrigin: "center" }}>CRUNCH</text>
        )}

        {/* roommate's shout from behind the door */}
        {t > T.bubble && t < sceneStart("fact") && (
          <g transform={`translate(1540 220) scale(${pop(frame, fps, T.bubble)})`}>
            <path d="M -200 -70 h 400 a 30 30 0 0 1 30 30 v 80 a 30 30 0 0 1 -30 30 h -120 l 40 60 l -90 -60 h -230 a 30 30 0 0 1 -30 -30 v -80 a 30 30 0 0 1 30 -30 Z" fill={C.white} stroke={C.ink} strokeWidth={6} />
            <text x={0} y={18} textAnchor="middle" fontSize={56} fontWeight={800} fill={C.ink} fontFamily="sans-serif">What was that?!</text>
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};

// ---------- scene 2: the fact card ----------
const Fact: React.FC = () => {
  const { t, fps, frame } = useT();
  const inP = pop(frame, fps, S.fact);
  const avg = ease(t, S.fact + 0.8, S.fact + 2) * 340;
  const you = ease(t, T.grow, T.grow + 1.6) * 3400;
  const stamp = pop(frame, fps, T.grow + 1.4);
  return (
    <AbsoluteFill style={{ background: C.mint, fontFamily: "sans-serif" }}>
      <svg viewBox="0 0 1920 1080">
        <g transform={`translate(0 ${(1 - inP) * 200})`} opacity={inP}>
          <text x={160} y={210} fontSize={84} fontWeight={900} fill={C.ink}>GRIP STRENGTH</text>
          <text x={160} y={410} fontSize={46} fontWeight={700} fill={C.ink}>Most adults</text>
          <rect x={160} y={440} width={Math.max(avg, 1)} height={90} rx={24} fill={C.shirt} />
          {avg > 300 && <text x={160 + avg + 30} y={502} fontSize={46} fontWeight={800} fill={C.ink}>30–45 kg</text>}
          <text x={160} y={680} fontSize={46} fontWeight={700} fill={C.ink}>You, this morning</text>
          <rect x={160} y={710} width={Math.max(you, 1)} height={90} rx={24} fill={C.blanket} />
          {you > 600 && <text x={200} y={772} fontSize={46} fontWeight={800} fill={C.white}>300–450 kg</text>}
        </g>
        {t > T.grow + 1.4 && (
          <g transform={`translate(1500 300) rotate(-12) scale(${stamp})`}>
            <circle r={130} fill={C.gold} stroke={C.ink} strokeWidth={8} />
            <text y={38} textAnchor="middle" fontSize={120} fontWeight={900} fill={C.ink}>×10</text>
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};

// ---------- scene 3: the door ----------
const Door: React.FC = () => {
  const { t } = useT();
  const reach = ease(t, T.reach, T.reach + 1.5);
  const tremble = Math.sin(t * 60) * 4 * reach;
  const zoom = 1 + ease(t, S.door, S.end) * 0.12;
  return (
    <AbsoluteFill style={{ background: C.wall }}>
      <svg viewBox="0 0 1920 1080" style={{ transform: `scale(${zoom})` }}>
        <rect x={610} y={60} width={700} height={1020} rx={12} fill={C.wood} />
        <rect x={680} y={140} width={560} height={360} rx={12} fill={C.woodDark} opacity={0.35} />
        <rect x={680} y={580} width={560} height={420} rx={12} fill={C.woodDark} opacity={0.35} />
        <circle cx={1200} cy={560} r={46} fill={C.gold} stroke="#C9971E" strokeWidth={8} />
        {/* the hand, slowly, carefully */}
        <g transform={`translate(${interpolate(reach, [0, 1], [1900, 1260]) + tremble} ${600 + tremble})`}>
          <rect x={0} y={-40} width={700} height={80} rx={40} fill={C.shirt} />
          <circle cx={-10} cy={0} r={62} fill={C.skin} />
          {[-36, -12, 12, 36].map((y) => <rect key={y} x={-86} y={y - 10} width={60} height={22} rx={11} fill={C.skin} />)}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// ---------- scene 4: end card ----------
const End: React.FC = () => {
  const { t } = useT();
  const words = L[L.length - 1].text.split(" ");
  const line = L[L.length - 1];
  const per = (line.end - line.start) / words.length;
  return (
    <AbsoluteFill style={{ background: C.night, justifyContent: "center", alignItems: "center", fontFamily: "sans-serif" }}>
      <div style={{ fontSize: 104, fontWeight: 900, color: C.white, textAlign: "center", maxWidth: 1500 }}>
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
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 70, fontFamily: "sans-serif" }}>
      <div style={{ fontSize: 52, fontWeight: 800, color: SPEAKER[line.who as keyof typeof SPEAKER], textAlign: "center", maxWidth: 1500,
        textShadow: "0 0 10px #000, 0 4px 0 #000, 0 -2px 0 #000, 3px 0 0 #000, -3px 0 0 #000", lineHeight: 1.25 }}>
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
