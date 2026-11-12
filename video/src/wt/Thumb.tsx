// Thumbnail for "What If You Could Do Everything You've Ever Watched on YouTube?" (1280x720 still).
// Patterns from research/packaging-2026-11-12.md: 1-2 huge words with one yellow word, a red arrow,
// the power drawn as a glowing status label over the hero, one big panicked face.
// Text must not repeat the title's words: "ONLY 71%".
import React from "react";
import { AbsoluteFill } from "remotion";
import { P, Glow, Person, YOU, THEO, Look } from "../ll/kit";

const RAY: Look = { skin: P.skin2, hair: "#2B211C", top: "#C9A14A", topDark: "#AA8638", hairStyle: "short", mustache: "#2B211C", acc: ["headphones"] };
const font = "'Inter Display', Inter, sans-serif";

export const Thumb: React.FC = () => (
  <AbsoluteFill style={{ background: "#232B3C" }}>
    <svg viewBox="0 0 1280 720" style={{ position: "absolute", inset: 0 }}>
      {/* windshield: sky, ground, the runway rushing up */}
      <path d="M 40 30 Q 640 -10 1240 30 L 1260 400 Q 640 360 20 400 Z" fill="#8FC3E6" />
      <path d="M 30 250 Q 640 225 1250 250 L 1260 400 Q 640 360 20 400 Z" fill="#6DB46F" />
      <path d="M 600 250 L 680 250 L 900 395 L 380 395 Z" fill="#4A4F5C" />
      {[0, 1, 2].map((i) => <rect key={i} x={634 - i * 8} y={262 + i * 40} width={12 + i * 16} height={16 + i * 8} fill={P.white} />)}
      <rect x={0} y={380} width={1280} height={90} fill="#1A2030" />
      {[220, 420, 860, 1060].map((x) => <g key={x}><circle cx={x} cy={425} r={34} fill="#0E1320" /><line x1={x} y1={425} x2={x + 20} y2={405} stroke="#FFC870" strokeWidth={5} /></g>)}
      {/* Ray, out cold */}
      <g transform="translate(1140 980) rotate(-24 0 -350) scale(1)"><Person x={0} y={0} look={RAY} mood="sleepy" t={0.5} flip /></g>
      {/* Theo screaming in the back */}
      <g transform="translate(250 870) scale(0.8)"><Person x={0} y={0} look={THEO} mood="shocked" t={0.5} pose="cheer" /></g>
      {/* you, big, panicking */}
      <Glow cx={640} cy={430} r={360} color="#FF6B6B" opacity={0.35} id="tg" />
      <g transform="translate(640 1180) scale(1.7)"><Person x={0} y={0} look={{ ...YOU, acc: ["headphones"] }} mood="shocked" t={0.5} sweat /></g>
      {/* the progress bar over your head, stuck at 71% */}
      <g transform="translate(640 175)">
        <rect x={-300} y={-62} width={600} height={112} rx={26} fill="rgba(14,19,32,0.92)" stroke="#FF3B3B" strokeWidth={4} />
        <text x={-270} y={-18} fontFamily={font} fontWeight={800} fontSize={30} fill="#E8ECF4">HOW TO LAND A PLANE</text>
        <rect x={-270} y={6} width={540} height={20} rx={10} fill="#3A4256" />
        <rect x={-270} y={6} width={540 * 0.71} height={20} rx={10} fill="#FF3B3B" />
        <circle cx={-270 + 540 * 0.71} cy={16} r={17} fill="#FF3B3B" />
      </g>
      {/* red arrow from the text to the bar */}
      <path d="M 340 300 C 480 310, 640 300, 735 250" stroke="#E5383B" strokeWidth={14} fill="none" strokeLinecap="round" />
      <path d="M 712 232 L 758 220 L 742 266 Z" fill="#E5383B" />
    </svg>
    <div style={{ position: "absolute", left: 30, top: 230, fontFamily: font, fontWeight: 900, fontSize: 118, lineHeight: 0.9, letterSpacing: -3,
      color: P.white, WebkitTextStroke: "6px #0E1330", paintOrder: "stroke fill", textShadow: "0 8px 0 #0E1330" }}>
      ONLY<br /><span style={{ color: "#FFD54A" }}>71%</span>
    </div>
  </AbsoluteFill>
);
