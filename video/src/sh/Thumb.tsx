// Thumbnail for "What If You Could See Who Secretly Hates You?" (1280x720 still).
// Winning patterns (research/packaging-2026-11-12.md): 1-3 huge words with one yellow word, a red arrow,
// the power drawn as a glowing tag over someone, one big emotional face. Text doesn't repeat the title.
import React from "react";
import { AbsoluteFill } from "remotion";
import { P, Glow, Person, YOU, THEO } from "../ll/kit";
import { Tag } from "./Episode";

const font = "'Inter Display', Inter, sans-serif";

export const Thumb: React.FC = () => (
  <AbsoluteFill style={{ background: "radial-gradient(circle at 30% 40%, #5A2430 0%, #10141F 75%)" }}>
    <svg viewBox="0 0 1280 720" style={{ position: "absolute", inset: 0 }}>
      <Glow cx={330} cy={250} r={330} color="#FF4B4B" opacity={0.55} id="red" />
      <g transform="translate(330 1130) scale(1.75)"><Person x={0} y={0} look={THEO} mood="smug" t={0.5} lookX={1} /></g>
      <g transform="translate(330 175) scale(1.55)"><Tag t={5} x={0} y={0} v={87} id="th" /></g>
      <g transform="translate(1010 1250) scale(1.9)"><Person x={0} y={0} look={YOU} mood="shocked" t={0.5} flip lookX={-1} sweat /></g>
      <path d="M 820 330 C 720 250, 640 200, 560 190" stroke="#E5383B" strokeWidth={16} fill="none" strokeLinecap="round" />
      <path d="M 580 162 L 532 190 L 584 222 Z" fill="#E5383B" />
    </svg>
    <div style={{ position: "absolute", right: 36, top: 26, fontFamily: font, fontWeight: 900, fontSize: 104, lineHeight: 0.92, letterSpacing: -3, textAlign: "right",
      color: P.white, WebkitTextStroke: "6px #0E1330", paintOrder: "stroke fill", textShadow: "0 8px 0 #0E1330" }}>
      BEST<br /><span style={{ color: "#FFD54A" }}>FRIEND?!</span>
    </div>
  </AbsoluteFill>
);
