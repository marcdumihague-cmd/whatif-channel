// Thumbnail (1280x720): the same day twice. Left: TAKE 1, drained, she says no. Right: TAKE 2, warm, $1M.
import React from "react";
import { AbsoluteFill } from "remotion";
import { World, Layer, Vignette, Person, pose, YOU, AVA, font, Bloom } from "../v2/kit";
import { Cafeteria, Flowers, T } from "./sets";

const Half: React.FC<{ take: 1 | 2 }> = ({ take }) => (
  <AbsoluteFill style={{ filter: take === 1 ? "saturate(0.35) contrast(0.95) brightness(1.0)" : "saturate(1.25) contrast(1.05)" }}>
    <World cam={take === 1 ? { x: 1100, y: 600, z: 1.3 } : { x: 800, y: 600, z: 1.3 }}>
      <Cafeteria t={2} crowd={false}>
        {take === 1 ? <>
          <Person x={700} y={1010} look={YOU} mood="shocked" t={2.5} s={1.15} p={pose("holdUp", { turn: 0.5, aR: 120 })} lookX={0.7} hold={<Flowers s={1.1} />} sweat blink={false} seed={1} />
          <g transform="translate(960 470) rotate(-4) scale(0.72)"><path d="M -150 -90 h 300 a 26 26 0 0 1 26 26 v 120 a 26 26 0 0 1 -26 26 h -60 l 30 60 l -90 -60 h -180 a 26 26 0 0 1 -26 -26 v -120 a 26 26 0 0 1 26 -26 Z" fill="#FFFFFF" stroke="#0B0E1A" strokeWidth={10} /><T x={0} y={42} s={150} w={900} c="#E0353F">NO.</T></g>
        </> : <>
          <Bloom x={1150} y={500} r={700} color="#FFD98A" o={0.5} />
          <Person x={1090} y={1010} look={YOU} mood="smug" t={2.5} s={1.15} p={pose("holdUp", { turn: -0.4, aR: 118 })} lookX={-0.6} blink={false} seed={1}
            hold={<g transform="rotate(-10)">{[0, 1, 2, 3, 4].map((k) => <rect key={k} x={-70} y={-40 - k * 16} width={140} height={60} rx={8} fill={k % 2 ? "#5FBF7A" : "#7BD992"} stroke="#1F5A34" strokeWidth={5} />)}<T x={0} y={-62} s={44} w={900} c="#1F5A34">$1M</T></g>} />
          <Person x={1400} y={1010} look={AVA} mood="love" t={2.5} s={1.02} p={pose("holdBoth", { turn: -0.5 })} flip lookX={0.8} blink={false} seed={3} />
        </>}
      </Cafeteria>
    </World>
    {take === 1 && <AbsoluteFill style={{ background: "#5F84E0", mixBlendMode: "soft-light", opacity: 0.5 }} />}
    {take === 2 && <AbsoluteFill style={{ background: "#FFB85C", mixBlendMode: "soft-light", opacity: 0.25 }} />}
  </AbsoluteFill>
);
const Big: React.FC<{ text: string; c: string; left?: number; right?: number }> = ({ text, c, left, right }) => (
  <div style={{ position: "absolute", top: 18, left, right, fontFamily: font, fontWeight: 900, fontSize: 200, letterSpacing: -6, lineHeight: 1, color: c, WebkitTextStroke: "30px #0B0E1A", paintOrder: "stroke fill", textShadow: "0 16px 0 #0B0E1A" }}>{text}</div>
);
export const Thumb: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <div style={{ position: "absolute", width: 1920, height: 1080, transform: "scale(0.66667)", transformOrigin: "0 0" }}>
      <AbsoluteFill style={{ clipPath: "polygon(0 0, 53% 0, 47% 100%, 0 100%)" }}><Half take={1} /></AbsoluteFill>
      <AbsoluteFill style={{ clipPath: "polygon(53% 0, 100% 0, 100% 100%, 47% 100%)" }}><Half take={2} /></AbsoluteFill>
      <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
        <line x1={1018} y1={-10} x2={902} y2={1090} stroke="#FFFFFF" strokeWidth={22} />
        <path d="M 760 880 C 880 990 1040 990 1150 900" stroke="#0B0E1A" strokeWidth={54} fill="none" strokeLinecap="round" /><path d="M 1090 850 L 1190 880 L 1130 970 Z" fill="#0B0E1A" stroke="#0B0E1A" strokeWidth={30} strokeLinejoin="round" />
        <path d="M 760 880 C 880 990 1040 990 1150 900" stroke="#FF3B3B" strokeWidth={30} fill="none" strokeLinecap="round" /><path d="M 1090 850 L 1190 880 L 1130 970 Z" fill="#FF3B3B" />
      </svg>
      <Big text="FAIL" c="#DCE6FF" left={50} /><Big text="REDO" c="#FFE14A" right={50} />
      <Vignette o={0.35} />
    </div>
  </AbsoluteFill>
);
