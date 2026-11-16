// Vertical teaser (1080x1920) for Shorts, TikTok and Reels: the cold open and the promise, a jump to the new
// question with no take 2, then a call to action. It stops before the answer. One file for all three platforms:
// the end card says where the full video is without a "link below" or "link in bio".
import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import episodeTimeline from "../../public/twice/timeline.json";
import ctaTimeline from "../../public/twice-teaser/timeline.json";
import { Episode } from "./Episode";
import { ease, pop } from "../ll/kit";
import { Captions, font, Vignette, Grain } from "../v2/kit";

const FPS = 30;
const L = episodeTimeline.lines;
const mid = (i: number) => (L[i].end + L[i + 1].start) / 2;
const rules = L.findIndex((l) => l.scene === "rules");
const noTake2 = L.findIndex((l) => l.text.startsWith("A question you've never heard"));
// the two pieces of the episode, in episode seconds
const SEGS: [number, number][] = [[0, mid(rules - 1) - 0.05], [mid(noTake2 - 1) + 0.05, L[noTake2 + 1].end + 0.35]];
const CLIP = SEGS.reduce((s, [a, b]) => s + b - a, 0);
export const TEASER_DURATION = CLIP + ctaTimeline.duration + 1.2;
const COLORS: Record<string, string> = { THEO: "#FFB37A", HOST: "#FFE14A" };

const Header: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: "absolute", top: 240, left: 50, right: 50, textAlign: "center", fontFamily: font, fontWeight: 900, fontSize: 92, lineHeight: 1.04, letterSpacing: -2 }}>
    {"WHAT IF YOU LIVED EVERY DAY TWICE?".split(" ").map((w, i) => {
      const p = pop(t, 0.05 + i * 0.05);
      return <span key={i} style={{ display: "inline-block", margin: "0 0.14em", opacity: Math.min(1, p * 2), transform: `translateY(${(1 - p) * 30}px)`, color: w === "TWICE?" ? "#FFE14A" : "#FFFFFF", WebkitTextStroke: "12px #0B0E1A", paintOrder: "stroke fill" }}>{w}</span>;
    })}
  </div>
);
// one piece of the episode in the phone frame; the first piece is cropped in a little so faces are bigger
const Piece: React.FC<{ et0: number; et1: number }> = ({ et0, et1 }) => {
  const frame = useCurrentFrame();
  const et = et0 + frame / FPS;
  const s = et0 < 1 ? 0.7 : 0.5625, h = 1080 * s;
  const fade = Math.min(et0 < 1 ? 1 : ease(frame / FPS, 0, 0.15), 1 - ease(et, et1 - 0.15, et1));
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 610, left: 0, width: 1080, height: h, overflow: "hidden", borderRadius: 40, background: "#0B0E1A", opacity: fade, boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }}>
        <div style={{ position: "absolute", left: 540 - 960 * s, top: 0, width: 1920, height: 1080, transform: `scale(${s})`, transformOrigin: "0 0" }}>
          <Sequence from={-Math.round(et0 * FPS)}><Episode captions={false} /></Sequence>
        </div>
      </div>
      <Captions t={et} lines={L} colors={COLORS} y={610 + h + 70} />
    </AbsoluteFill>
  );
};
const CallToAction: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const left = Math.max(0, 30 - t * 2.2), full = ctaTimeline.duration * 0.55;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 170, left: 50, right: 50, textAlign: "center", fontFamily: font, fontWeight: 900, fontSize: 100, lineHeight: 1.05, color: "#FFFFFF", opacity: Math.min(1, pop(t, 0.1) * 2), WebkitTextStroke: "12px #0B0E1A", paintOrder: "stroke fill" }}>
        WHAT COLOR IS AN<br /><span style={{ color: "#7FB0FF" }}>OCTOPUS'S BLOOD?</span>
      </div>
      <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(540 800) scale(${pop(t, 0.3) * (1 + 0.04 * Math.sin(t * 10))})`}>
          <circle r={230} fill="#0B0E1A" stroke="#2A3050" strokeWidth={30} />
          <circle r={230} fill="none" stroke={left < 12 ? "#FF5C5C" : "#FFE14A"} strokeWidth={30} strokeDasharray={`${(left / 30) * 1445} 1445`} transform="rotate(-90)" strokeLinecap="round" />
          <text x={0} y={70} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={210} fill={left < 12 ? "#FF5C5C" : "#FFE14A"}>{Math.ceil(left)}</text>
        </g>
        <g transform={`translate(540 1140) scale(${pop(t, 0.8)}) rotate(-3)`}><rect x={-400} y={-70} width={800} height={140} rx={36} fill="#0E3A22" stroke="#3BE07A" strokeWidth={8} /><text x={0} y={30} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={88} fill="#6BFFA6">$1,000,000</text></g>
        <g transform={`translate(540 1290) scale(${pop(t, 1.6)})`}><text x={0} y={0} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={64} fill="#FF8A8A">NO SECOND TRY</text></g>
      </svg>
      <div style={{ position: "absolute", top: 1420, left: 50, right: 50, textAlign: "center", fontFamily: font, fontWeight: 900, fontSize: 84, lineHeight: 1.08, color: "#FFFFFF",
        opacity: Math.min(1, pop(t, full) * 2), transform: `scale(${0.85 + 0.15 * Math.min(1, pop(t, full))})`, WebkitTextStroke: "12px #0B0E1A", paintOrder: "stroke fill" }}>
        FULL VIDEO ON MY<br /><span style={{ color: "#FF5C5C" }}>YOUTUBE CHANNEL</span>
      </div>
    </AbsoluteFill>
  );
};
export const Teaser: React.FC = () => {
  const frame = useCurrentFrame();
  let from = 0;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 42%, #2A1E5E 0%, #090B1C 78%)" }}>
      {SEGS.map(([a, b], i) => {
        const start = from, n = Math.round((b - a) * FPS);
        from += n;
        return <Sequence key={i} from={start} durationInFrames={n}><Piece et0={a} et1={b} /></Sequence>;
      })}
      {frame < from && <Header t={frame / FPS} />}
      <Sequence from={from}><CallToAction /><Audio src={staticFile("twice-teaser/voice.wav")} /></Sequence>
      <Vignette o={0.35} /><Grain t={frame / FPS} o={0.06} />
    </AbsoluteFill>
  );
};
