// Vertical teaser (1080x1920) for TikTok / Reels / Shorts: the episode's cold open, then a call to
// action pointing to the full video on YouTube.
import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import episodeTimeline from "../../public/one-minute/timeline.json";
import ctaTimeline from "../../public/one-minute-teaser/timeline.json";
import { Episode } from "./Episode";
import { P, pop, ease, Glow, Head, Bokeh, Look } from "../ll/kit";
import { interpolate } from "remotion";

const FPS = 30;
const font = "'Inter Display', Inter, sans-serif";
const L = episodeTimeline.lines;
// Through the rules: "More than 100 billion people have ever lived. You get to choose 30." Cut just
// before the episode switches to the next shot (the midpoint of the pause after that line).
const LAST = L.findIndex((l) => l.text.startsWith("More than 100 billion"));
const CLIP = (L[LAST].end + L[LAST + 1].start) / 2 - 0.05;
const CTA = ctaTimeline.duration + 1.2;
export const TEASER_DURATION = CLIP + CTA;
const GRANDPA: Look = { skin: P.skin, hair: "#E8E4DC", top: "#8A6A4F", topDark: "#6F543E", hairStyle: "bald", glasses: true, mustache: "#E8E4DC" };

const Header: React.FC<{ t: number }> = ({ t }) => {
  const words = "WHAT IF YOU COULD CALL ANYONE WHO DIED FOR 60 SECONDS?".split(" ");
  return (
    <div style={{ position: "absolute", top: 150, left: 60, right: 60, textAlign: "center", fontFamily: font, fontWeight: 900, fontSize: 86, lineHeight: 1.05, textTransform: "uppercase" }}>
      {words.map((w, i) => {
        const p = pop(t, 0.1 + i * 0.05);
        return <span key={i} style={{ display: "inline-block", margin: "0 0.16em", opacity: Math.min(1, p), transform: `translateY(${(1 - p) * 30}px)`, color: ["60", "SECONDS?"].includes(w) ? "#FFC870" : P.white }}>{w}</span>;
      })}
    </div>
  );
};

const BigCaption: React.FC<{ t: number }> = ({ t }) => {
  const line = L.find((l) => t >= l.start && t <= l.end + 0.15);
  if (!line) return null;
  const color = line.who === "GRANDPA" ? "#FFD98A" : line.who === "YOU" ? "#7FE3DD" : P.white;
  return (
    <div style={{ position: "absolute", top: 1430, left: 70, right: 70, textAlign: "center", fontFamily: font, fontWeight: 900, fontSize: 64, lineHeight: 1.2, color,
      textShadow: "0 6px 0 #10141F, 0 0 24px rgba(0,0,0,0.7)" }}>{line.text}</div>
  );
};

const Clip: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  // tight crop on the caller and Grandpa for the cold open, full width for the promise and rules shots
  const wide = interpolate(t, [L[5].end + 0.2, L[6].start], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, #2C3852 0%, #10141F 75%)" }}>
      <Header t={t} />
      {/* the episode, cropped to the caller, the phone and Grandpa's bubble */}
      <div style={{ position: "absolute", top: 560, left: 0, width: 1080, height: 855, overflow: "hidden", borderRadius: 36, background: "#18202F" }}>
        <div style={{ position: "absolute", left: -285 * (1 - wide), top: 45 + 79 * wide, width: 1920, height: 1080, transform: `scale(${0.75 - 0.1875 * wide})`, transformOrigin: "0 0" }}>
          <Episode captions={false} />
        </div>
      </div>
      <BigCaption t={t} />
    </AbsoluteFill>
  );
};

const CallToAction: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const glow = 0.6 + 0.2 * Math.sin(t * 3);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #4A3A5A 0%, #10141F 75%)" }}>
      <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        <Bokeh t={t} n={14} opacity={0.18} />
        <Glow cx={540} cy={640} r={460} color="#FFC870" opacity={glow * 0.6} id="ctaglow" />
        <g transform={`translate(540 640) scale(${pop(t, 0.1)})`}>
          <circle r={250} fill="#F7E3B8" />
          <clipPath id="ctab"><circle r={236} /></clipPath>
          <g clipPath="url(#ctab)"><circle r={236} fill="#6B4E36" /><g transform="translate(0 30) scale(1.6)"><Head look={GRANDPA} mood="nervous" t={t} /></g></g>
        </g>
        <g transform={`translate(540 1060) scale(${pop(t, 0.4)})`}>
          <path d="M -140 0 L -110 -110 Q -100 -130 -80 -130 L 80 -130 Q 100 -130 110 -110 L 140 0 Z" fill="#D9474B" />
          <circle cx={0} cy={-62} r={58} fill="#E9E1D2" /><circle cx={0} cy={-62} r={16} fill="#C9A14A" />
          {Array.from({ length: 10 }, (_, i) => { const a = (-60 + i * 30) * Math.PI / 180; return <circle key={i} cx={Math.cos(a) * 38} cy={-62 + Math.sin(a) * 38} r={9} fill="#2E2A30" />; })}
        </g>
      </svg>
      <div style={{ position: "absolute", top: 140, left: 60, right: 60, textAlign: "center", fontFamily: font, fontWeight: 900, fontSize: 92, lineHeight: 1.05, color: P.white,
        opacity: Math.min(1, pop(t, 0.2)) }}>
        WHAT WAS HE<br /><span style={{ color: "#FFC870" }}>GOING TO SAY?</span>
      </div>
      <div style={{ position: "absolute", top: 1260, left: 60, right: 60, textAlign: "center", fontFamily: font, fontWeight: 900, fontSize: 76, lineHeight: 1.1, color: P.white,
        opacity: Math.min(1, pop(t, 2.2)), transform: `scale(${0.9 + 0.1 * Math.min(1, pop(t, 2.2))})` }}>
        FULL VIDEO ON MY<br /><span style={{ color: "#FF5C5C" }}>YOUTUBE CHANNEL</span>
      </div>
      <div style={{ position: "absolute", top: 1560, left: 0, right: 0, textAlign: "center", fontFamily: font, fontWeight: 900, fontSize: 64, color: "#FFC870",
        opacity: Math.min(1, pop(t, 4.2)), transform: `translateY(${Math.sin(t * 5) * 10 * ease(t, 4.2, 4.6)}px)` }}>
        LINK BELOW ↓
      </div>
    </AbsoluteFill>
  );
};

export const Teaser: React.FC = () => (
  <AbsoluteFill style={{ background: "#10141F" }}>
    <Sequence durationInFrames={Math.round(CLIP * FPS)}><Clip /></Sequence>
    <Sequence from={Math.round(CLIP * FPS)}>
      <CallToAction />
      <Audio src={staticFile("one-minute-teaser/voice.wav")} />
    </Sequence>
  </AbsoluteFill>
);
