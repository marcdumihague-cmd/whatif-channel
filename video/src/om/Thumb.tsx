// Thumbnail for "What If You Could Call Anyone Who Died for 60 Seconds?" (1280x720 still).
// Text must not repeat the title's words (yt-package rule): "HE PICKED UP".
import React from "react";
import { AbsoluteFill } from "remotion";
import { P, Glow, Person, Head, YOU, Look } from "../ll/kit";

const GRANDPA: Look = { skin: P.skin, hair: "#E8E4DC", top: "#8A6A4F", topDark: "#6F543E", hairStyle: "bald", glasses: true, mustache: "#E8E4DC" };

export const Thumb: React.FC = () => (
  <AbsoluteFill style={{ background: "radial-gradient(circle at 70% 45%, #4A3A5A 0%, #141A2B 70%)" }}>
    <svg viewBox="0 0 1280 720" style={{ position: "absolute", inset: 0 }}>
      {/* Grandpa in a golden bubble */}
      <Glow cx={930} cy={300} r={420} color="#FFC870" opacity={0.55} id="tg" />
      <circle cx={930} cy={300} r={235} fill="#F7E3B8" />
      <clipPath id="tb"><circle cx={930} cy={300} r={222} /></clipPath>
      <g clipPath="url(#tb)">
        <circle cx={930} cy={300} r={222} fill="#6B4E36" />
        <g transform="translate(930 330) scale(1.55)"><Head look={GRANDPA} mood="happy" t={0.5} /></g>
      </g>
      {/* you, crying, handset at the ear, cord down to a rotary phone */}
      <g transform="translate(330 860) scale(1.45)"><Person x={0} y={0} look={YOU} mood="shocked" t={0.5} pose="phone" /></g>
      <path d="M 300 395 q 8 30 0 44 q -10 -12 0 -44 Z M 382 395 q 8 30 0 44 q -10 -12 0 -44 Z" fill="#8FD3FF" />
      <path d="M 470 470 C 520 520, 480 560, 530 590 S 560 640, 610 640" stroke="#B53A3E" strokeWidth={8} fill="none" strokeDasharray="14 6" />
      <g transform="translate(468 340) rotate(14)">
        <rect x={-24} y={-110} width={48} height={220} rx={24} fill="#D9474B" />
        <ellipse cx={0} cy={-112} rx={40} ry={28} fill="#D9474B" /><ellipse cx={0} cy={112} rx={40} ry={28} fill="#D9474B" />
      </g>
      <g transform="translate(640 700) scale(0.9)">
        <path d="M -140 0 L -110 -110 Q -100 -130 -80 -130 L 80 -130 Q 100 -130 110 -110 L 140 0 Z" fill="#D9474B" />
        <circle cx={0} cy={-62} r={58} fill="#E9E1D2" /><circle cx={0} cy={-62} r={16} fill="#C9A14A" />
        {Array.from({ length: 10 }, (_, i) => { const a = (-60 + i * 30) * Math.PI / 180; return <circle key={i} cx={Math.cos(a) * 38} cy={-62 + Math.sin(a) * 38} r={9} fill="#2E2A30" />; })}
      </g>
      {/* red countdown */}
      <g transform="translate(1135 600)">
        <circle r={92} fill="rgba(20,24,36,0.92)" />
        <circle r={78} fill="none" stroke={P.red} strokeWidth={14} strokeDasharray={490} strokeDashoffset={60} transform="rotate(-90)" strokeLinecap="round" />
        <text y={20} textAnchor="middle" fontFamily="'Inter Display', Inter, sans-serif" fontWeight={900} fontSize={56} fill={P.white}>0:60</text>
      </g>
    </svg>
    <div style={{ position: "absolute", left: 40, top: 34, width: 640, fontFamily: "'Inter Display', Inter, sans-serif", fontWeight: 900,
      fontSize: 118, lineHeight: 0.95, color: "#FFD54A", textShadow: "0 8px 0 #141A2B, 0 0 30px rgba(0,0,0,0.6)", letterSpacing: -2 }}>
      HE PICKED<br />UP
    </div>
  </AbsoluteFill>
);
