// Thumbnail for "What If Everyone Got a Superpower Except You?" (1280x720 still).
// Winning patterns (research/packaging-2026-11-12.md): 1-2 huge words with a yellow word, a red arrow,
// a glowing status tag over the hero, big faces. Text must not repeat the title's words: "NOT ME?!".
import React from "react";
import { AbsoluteFill } from "remotion";
import { P, Glow, Person, YOU, THEO, extra, Look } from "../ll/kit";

const font = "'Inter Display', Inter, sans-serif";
const GREY: Look = { ...YOU, top: "#8A8F9C", topDark: "#6F7480" };

export const Thumb: React.FC = () => (
  <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, #3A2A5A 0%, #10141F 75%)" }}>
    <svg viewBox="0 0 1280 720" style={{ position: "absolute", inset: 0 }}>
      {/* everyone else, glowing with powers */}
      <Glow cx={180} cy={360} r={260} color="#F2B640" opacity={0.6} id="g1" />
      <g transform="translate(180 640) scale(0.95)"><Person x={0} y={0} look={THEO} mood="happy" t={0.5} pose="cheer" floating /></g>
      <line x1={180} y1={650} x2={180} y2={706} stroke={P.white} strokeWidth={5} strokeDasharray="8 8" />
      <ellipse cx={180} cy={712} rx={80} ry={14} fill="#000" opacity={0.55} />
      <Glow cx={1100} cy={330} r={260} color="#B47CFF" opacity={0.7} id="g2" />
      <g transform="translate(1100 820) scale(1.05)"><Person x={0} y={0} look={extra(1)} mood="smug" t={0.5} pose="point" flip /></g>
      <Glow cx={1210} cy={560} r={150} color="#FFC870" opacity={0.9} id="ball" /><circle cx={1210} cy={560} r={48} fill="#FFE9A8" />
      <Glow cx={1180} cy={120} r={140} color="#9FE3FF" opacity={0.7} id="g3" />
      {/* you: grey, no glow, with the tag */}
      <g transform="translate(640 1180) scale(1.9)"><Person x={0} y={0} look={GREY} mood="shocked" t={0.5} sweat /></g>
      <g transform="translate(640 280)">
        <rect x={-190} y={-46} width={380} height={92} rx={22} fill="rgba(14,19,32,0.92)" stroke="#FF3B3B" strokeWidth={5} />
        <text y={16} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={46} fill="#FF6B6B">POWER: NONE</text>
      </g>
      <path d="M 300 150 C 380 120, 440 150, 470 230" stroke="#E5383B" strokeWidth={14} fill="none" strokeLinecap="round" />
      <path d="M 446 222 L 478 268 L 496 214 Z" fill="#E5383B" />
    </svg>
    <div style={{ position: "absolute", left: 30, top: 24, fontFamily: font, fontWeight: 900, fontSize: 110, lineHeight: 0.9, letterSpacing: -3,
      color: P.white, WebkitTextStroke: "6px #0E1330", paintOrder: "stroke fill", textShadow: "0 8px 0 #0E1330" }}>
      <span style={{ color: "#FFD54A" }}>NOT</span> ME?!
    </div>
  </AbsoluteFill>
);
