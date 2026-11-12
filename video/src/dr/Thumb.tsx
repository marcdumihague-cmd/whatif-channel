// Thumbnail for "What If You Could See the Dreams Your Parents Gave Up?" (1280x720 still).
// Built from the Nov 2026 vidIQ research in episodes/dreams/packaging.md: 1-2 words of text with one
// accent word, a red arrow to the power, a glowing status tag (like the breakout "timer" and
// "DODGE: 100%" thumbnails), a big emotional face. Text must not repeat the title's words.
import React from "react";
import { AbsoluteFill } from "remotion";
import { P, Glow, Person, YOU, Look } from "../ll/kit";

const MOM: Look = { skin: P.skin, hair: "#5A3A2A", top: "#C66B7A", topDark: "#A85563", hairStyle: "long" };
const G_PILOT: Look = { ...MOM, top: "#2E3D66", topDark: "#24304F", acc: ["pilot"] };
const font = "'Inter Display', Inter, sans-serif";

export const Thumb: React.FC = () => (
  <AbsoluteFill style={{ background: "radial-gradient(circle at 70% 38%, #4A66B0 0%, #1A2350 55%, #0E1330 100%)" }}>
    <svg viewBox="0 0 1280 720" style={{ position: "absolute", inset: 0 }}>
      <defs><filter id="ghost" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="0.42 0 0 0 0.45  0 0.42 0 0 0.62  0 0 0.42 0 0.72  0 0 0 1 0" /></filter></defs>
      <Glow cx={950} cy={330} r={430} color="#9FE3FF" opacity={0.9} id="tg" />
      {/* the ghost: the pilot she never became, floating behind her */}
      <g filter="url(#ghost)" opacity={0.92}>
        <path d="M 890 520 Q 960 680 1040 700 Q 1010 590 1030 520 Z" fill="#2E3D66" />
        <g transform="translate(960 620) scale(1.15)"><Person x={0} y={0} look={G_PILOT} mood="happy" t={0.5} flip noLegs /></g>
      </g>
      <path d="M 905 345 l 55 -11 l 55 11 l -55 9 Z" fill="#F2B640" />
      {/* status tag above the ghost */}
      <g transform="translate(960 70)">
        <rect x={-150} y={-34} width={300} height={68} rx={16} fill="#B3262E" stroke="#FF6B6B" strokeWidth={4} />
        <text y={14} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={40} fill={P.white}>2 DAYS LEFT</text>
      </g>
      <g transform="translate(900 1040) scale(1.2)"><Person x={0} y={0} look={MOM} mood="happy" t={0.5} flip lookX={-1} /></g>
      {/* you, in tears, close to camera */}
      <g transform="translate(300 1120) scale(1.75)"><Person x={0} y={0} look={YOU} mood="sad" t={0.5} lookX={1} /></g>
      <path d="M 262 535 q 10 40 0 62 q -12 -18 0 -62 Z M 362 535 q 10 40 0 62 q -12 -18 0 -62 Z" fill="#8FD3FF" />
      {/* red arrow from the text to the ghost */}
      <path d="M 560 150 C 690 120, 780 160, 830 230" stroke="#E5383B" strokeWidth={16} fill="none" strokeLinecap="round" />
      <path d="M 800 215 L 850 265 L 860 196 Z" fill="#E5383B" />
    </svg>
    <div style={{ position: "absolute", left: 40, top: 40, fontFamily: font, fontWeight: 900, fontSize: 132, lineHeight: 0.92, letterSpacing: -3,
      color: P.white, WebkitTextStroke: "6px #0E1330", paintOrder: "stroke fill", textShadow: "0 8px 0 #0E1330" }}>
      <span style={{ color: "#FFD54A" }}>PILOT</span><br />MOM?!
    </div>
  </AbsoluteFill>
);
