// Thumbnail for "What If You Could See the Dreams Your Parents Gave Up for You?" (1280x720 still).
// Text must not repeat the title's words (yt-package rule): "MOM WAS A PILOT?"
import React from "react";
import { AbsoluteFill } from "remotion";
import { P, Glow, Person, YOU, Look } from "../ll/kit";

const MOM: Look = { skin: P.skin, hair: "#5A3A2A", top: "#C66B7A", topDark: "#A85563", hairStyle: "long" };
const G_PILOT: Look = { ...MOM, top: "#2E3D66", topDark: "#24304F", acc: ["pilot"] };

export const Thumb: React.FC = () => (
  <AbsoluteFill style={{ background: "radial-gradient(circle at 72% 40%, #3A4A7A 0%, #121828 70%)" }}>
    <svg viewBox="0 0 1280 720" style={{ position: "absolute", inset: 0 }}>
      <defs><filter id="ghost" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="0.45 0 0 0 0.42  0 0.45 0 0 0.56  0 0 0.45 0 0.62  0 0 0 1 0" /></filter></defs>
      <Glow cx={930} cy={300} r={460} color="#9FE3FF" opacity={0.75} id="tg" />
      {/* the ghost: huge, saluting, behind Mom */}
      <g filter="url(#ghost)" opacity={0.85}>
        <path d="M 900 470 Q 960 640 1030 680 Q 1000 560 1020 470 Z" fill="#2E3D66" />
        <g transform="translate(960 590) scale(1.1)"><Person x={0} y={0} look={G_PILOT} mood="happy" t={0.5} pose="cheer" flip noLegs /></g>
      </g>
      <g transform="translate(900 1010) scale(1.2)"><Person x={0} y={0} look={MOM} mood="neutral" t={0.5} flip /></g>
      {/* you, shocked, in the foreground */}
      <g transform="translate(300 1060) scale(1.5)"><Person x={0} y={0} look={YOU} mood="shocked" t={0.5} lookX={1} /></g>
      <path d="M 900 330 l 60 -12 l 60 12 l -60 10 Z" fill="#F2B640" />
    </svg>
    <div style={{ position: "absolute", left: 40, top: 34, width: 600, fontFamily: "'Inter Display', Inter, sans-serif", fontWeight: 900,
      fontSize: 112, lineHeight: 0.95, color: "#FFD54A", textShadow: "0 8px 0 #121828, 0 0 30px rgba(0,0,0,0.6)", letterSpacing: -2 }}>
      MOM WAS<br />A PILOT?
    </div>
  </AbsoluteFill>
);
