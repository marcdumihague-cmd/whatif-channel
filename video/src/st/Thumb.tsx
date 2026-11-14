// Thumbnail for "What If You Could Stop Time for 10 Seconds a Day?" (1280x720 still).
// Winning patterns (research/packaging-2026-11-12.md): 1-3 huge words with one yellow word, a red arrow,
// the power drawn as a glowing label over the hero, one big emotional face. Text doesn't repeat the title.
import React from "react";
import { AbsoluteFill } from "remotion";
import { P, Glow, Person, YOU, extra } from "../ll/kit";
import { Ball, Gym, Frozen } from "./Episode";

const font = "'Inter Display', Inter, sans-serif";

export const Thumb: React.FC = () => (
  <AbsoluteFill style={{ background: "#10141F" }}>
    {/* the frozen gym, drawn at 1920x1080 and scaled into 1280x720 */}
    <div style={{ position: "absolute", width: 1920, height: 1080, transform: "scale(0.6667)", transformOrigin: "0 0" }}>
      <Frozen on={1}>
        <Gym t={0} />
        <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
          <g transform="translate(1560 1080) scale(1.2)"><Person x={0} y={0} look={extra(0)} mood="smug" t={0} flip pose="point" /></g>
          <g transform="translate(250 1080) scale(1.1)"><Person x={0} y={0} look={extra(2)} mood="shocked" t={0} /></g>
        </svg>
      </Frozen>
    </div>
    <svg viewBox="0 0 1280 720" style={{ position: "absolute", inset: 0 }}>
      {/* you, in colour, face to face with a frozen dodgeball */}
      <g transform="translate(560 1260) scale(2.0)"><Person x={0} y={0} look={YOU} mood="shocked" t={0.5} lookX={1} sweat /></g>
      <Glow cx={820} cy={430} r={160} color="#7FB8FF" opacity={0.6} id="ball" />
      <g style={{ filter: "saturate(0.3)" }}><Ball x={820} y={430} r={88} /></g>
      <line x1={1000} y1={420} x2={1260} y2={400} stroke="#7FB8FF" strokeWidth={8} strokeDasharray="16 14" />
      {/* the stopwatch tag over you */}
      <g transform="translate(560 120)">
        <rect x={-150} y={-56} width={300} height={112} rx={28} fill="rgba(14,19,32,0.92)" stroke="#7FB8FF" strokeWidth={6} />
        <circle cx={-92} cy={0} r={34} fill="#1F2433" stroke="#C9D2DE" strokeWidth={5} /><path d="M -92 0 L -92 -30 A 30 30 0 1 1 -118 15 Z" fill="#7FB8FF" />
        <text x={40} y={20} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={60} fill="#7FB8FF">7.2 s</text>
      </g>
      <path d="M 1110 300 C 1060 360, 990 400, 930 420" stroke="#E5383B" strokeWidth={16} fill="none" strokeLinecap="round" />
      <path d="M 950 392 L 902 428 L 958 446 Z" fill="#E5383B" />
    </svg>
    <div style={{ position: "absolute", right: 34, top: 26, fontFamily: font, fontWeight: 900, fontSize: 104, lineHeight: 0.92, letterSpacing: -3, textAlign: "right",
      color: P.white, WebkitTextStroke: "6px #0E1330", paintOrder: "stroke fill", textShadow: "0 8px 0 #0E1330" }}>
      EVERYONE<br /><span style={{ color: "#FFD54A" }}>FROZE</span>
    </div>
  </AbsoluteFill>
);
