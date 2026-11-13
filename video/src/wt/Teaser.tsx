// Vertical teaser (1080x1920) for Shorts / TikTok / Reels: the cold open and the promise, a jump to the
// plane setup ("71 percent watched... Remember that."), then a call to action to the full video.
import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import episodeTimeline from "../../public/watched/timeline.json";
import ctaTimeline from "../../public/watched-teaser/timeline.json";
import ctaBioTimeline from "../../public/watched-teaser-bio/timeline.json";
import { Episode } from "./Episode";
import { P, pop, ease, Bokeh, Glow, Person, YOU } from "../ll/kit";

const FPS = 30;
const font = "'Inter Display', Inter, sans-serif";
const L = episodeTimeline.lines;
const mid = (i: number) => (L[i].end + L[i + 1].start) / 2;
const promise = L.findIndex((l) => l.scene === "promise");
const plane = L.findIndex((l) => l.text.startsWith("And one video from 3 a.m."));
const remember = L.findIndex((l) => l.text === "Remember that.");
// the two pieces of the episode, in episode seconds
const SEGS: [number, number][] = [[0, mid(promise) - 0.05], [L[plane].start - 0.3, mid(remember) - 0.05]];
const CLIP = SEGS.reduce((s, [a, b]) => s + b - a, 0);
export const TEASER_DURATION = CLIP + ctaTimeline.duration + 1.0;
export const TEASER_BIO_DURATION = CLIP + ctaBioTimeline.duration + 1.0; // TikTok / Instagram: no links in captions

const Header: React.FC<{ t: number }> = ({ t }) => {
  const words = "WHAT IF YOU COULD DO ANYTHING YOU'VE WATCHED ON YOUTUBE?".split(" ");
  return (
    <div style={{ position: "absolute", top: 140, left: 60, right: 60, textAlign: "center", fontFamily: font, fontWeight: 900, fontSize: 84, lineHeight: 1.05 }}>
      {words.map((w, i) => {
        const p = pop(t, 0.1 + i * 0.05);
        return <span key={i} style={{ display: "inline-block", margin: "0 0.16em", opacity: Math.min(1, p), transform: `translateY(${(1 - p) * 30}px)`, color: ["ANYTHING", "WATCHED"].includes(w) ? "#FFD54A" : P.white }}>{w}</span>;
      })}
    </div>
  );
};

const BigCaption: React.FC<{ et: number }> = ({ et }) => {
  const line = L.find((l) => et >= l.start && et <= l.end + 0.15);
  if (!line) return null;
  const color = line.who === "THEO" ? "#FFB37A" : line.who === "YOU" ? "#7FE3DD" : P.white;
  return (
    <div style={{ position: "absolute", top: 1410, left: 60, right: 60, textAlign: "center", fontFamily: font, fontWeight: 900, fontSize: 54, lineHeight: 1.2, color,
      textShadow: "0 6px 0 #10141F, 0 0 24px rgba(0,0,0,0.7)" }}>{line.text}</div>
  );
};

// one piece of the episode, cropped into the phone frame; `et0` = the episode second it starts at
const Piece: React.FC<{ et0: number; et1: number }> = ({ et0, et1 }) => {
  const frame = useCurrentFrame();
  const et = et0 + frame / FPS;
  const wide = L[promise] ? interpolate(et, [L[promise].start - 0.4, L[promise].start, L[promise].end, L[promise].end + 0.4], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  const s = 0.75 - 0.1875 * wide; // 0.75 = tight on the action, 0.5625 = full width for the promise
  const fx = 1000;
  const fade = Math.min(ease(frame / FPS, 0, 0.2), 1 - ease(et, et1 - 0.2, et1));
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, #2C3852 0%, #10141F 75%)" }}>
      <div style={{ position: "absolute", top: 560, left: 0, width: 1080, height: 820, overflow: "hidden", borderRadius: 36, background: "#18202F", opacity: fade }}>
        <div style={{ position: "absolute", left: -(fx * s - 540), top: (820 - 1080 * s) / 2, width: 1920, height: 1080, transform: `scale(${s})`, transformOrigin: "0 0" }}>
          <Sequence from={-Math.round(et0 * FPS)}><Episode captions={false} /></Sequence>
        </div>
      </div>
      <BigCaption et={et} />
    </AbsoluteFill>
  );
};

const CallToAction: React.FC<{ bio: boolean }> = ({ bio }) => {
  const t = useCurrentFrame() / FPS;
  const k = Math.min(0.71, interpolate(t, [0.3, 1.6], [0, 0.71], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #3A2A3A 0%, #10141F 75%)" }}>
      <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        <Bokeh t={t} n={14} opacity={0.18} />
        <Glow cx={540} cy={820} r={460} color="#FF6B6B" opacity={0.35} id="ctaglow" />
        <g transform="translate(540 1180) scale(1.25)"><Person x={0} y={0} look={{ ...YOU, acc: ["headphones"] }} mood="shocked" t={t} sweat /></g>
        <g transform={`translate(540 560) scale(${pop(t, 0.1)})`}>
          <rect x={-420} y={-80} width={840} height={150} rx={30} fill="rgba(14,19,32,0.92)" stroke="#FF3B3B" strokeWidth={5} />
          <text x={-380} y={-24} fontFamily={font} fontWeight={800} fontSize={40} fill="#E8ECF4">HOW TO LAND A PLANE</text>
          <text x={380} y={-24} textAnchor="end" fontFamily={font} fontWeight={900} fontSize={40} fill="#FF6B6B">{Math.round(k * 100)}%</text>
          <rect x={-380} y={10} width={760} height={26} rx={13} fill="#3A4256" />
          <rect x={-380} y={10} width={760 * k} height={26} rx={13} fill="#FF3B3B" />
          <circle cx={-380 + 760 * k} cy={23} r={22} fill="#FF3B3B" />
        </g>
      </svg>
      <div style={{ position: "absolute", top: 140, left: 60, right: 60, textAlign: "center", fontFamily: font, fontWeight: 900, fontSize: 96, lineHeight: 1.05, color: P.white, opacity: Math.min(1, pop(t, 0.2)) }}>
        WHAT HAPPENS<br /><span style={{ color: "#FFD54A" }}>AT 71%?</span>
      </div>
      <div style={{ position: "absolute", top: 1260, left: 60, right: 60, textAlign: "center", fontFamily: font, fontWeight: 900, fontSize: 76, lineHeight: 1.1, color: P.white,
        opacity: Math.min(1, pop(t, 2.2)), transform: `scale(${0.9 + 0.1 * Math.min(1, pop(t, 2.2))})` }}>
        FULL VIDEO ON MY<br /><span style={{ color: "#FF5C5C" }}>YOUTUBE CHANNEL</span>
      </div>
      <div style={{ position: "absolute", top: 1560, left: 0, right: 0, textAlign: "center", fontFamily: font, fontWeight: 900, fontSize: 64, color: "#FFD54A",
        opacity: Math.min(1, pop(t, 4.4)), transform: `translateY(${Math.sin(t * 5) * 10 * ease(t, 4.4, 4.8)}px)` }}>
        {bio ? "LINK IN MY BIO" : "LINK BELOW ↓"}
      </div>
    </AbsoluteFill>
  );
};

export const Teaser: React.FC<{ bio?: boolean }> = ({ bio = false }) => {
  const frame = useCurrentFrame();
  let from = 0;
  return (
    <AbsoluteFill style={{ background: "#10141F" }}>
      {SEGS.map(([a, b], i) => {
        const start = from;
        from += Math.round((b - a) * FPS);
        return <Sequence key={i} from={start} durationInFrames={Math.round((b - a) * FPS)}><Piece et0={a} et1={b} /></Sequence>;
      })}
      {frame < from && <Header t={frame / FPS} />}
      <Sequence from={from}>
        <CallToAction bio={bio} />
        <Audio src={staticFile(bio ? "watched-teaser-bio/voice.wav" : "watched-teaser/voice.wav")} />
      </Sequence>
    </AbsoluteFill>
  );
};
