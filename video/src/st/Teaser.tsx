// Vertical teaser (1080x1920) for YouTube Shorts: the cold open (frozen dodgeball), a jump to the bus
// (the $1M trick needs all 9 seconds), then a call to action that asks the choice without answering it.
import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import episodeTimeline from "../../public/stoptime/timeline.json";
import ctaTimeline from "../../public/stoptime-teaser/timeline.json";
import { Episode, Watch } from "./Episode";
import { P, pop, ease, Bokeh, Glow } from "../ll/kit";

const FPS = 30;
const font = "'Inter Display', Inter, sans-serif";
const L = episodeTimeline.lines;
const mid = (i: number) => (L[i].end + L[i + 1].start) / 2;
const promise = L.findIndex((l) => l.scene === "promise");
const bus = L.findIndex((l) => l.scene === "bus");
// the two pieces of the episode, in episode seconds: the whole cold open, then the bus up to "no million"
const SEGS: [number, number][] = [[0, mid(promise - 1) - 0.05], [L[bus].start - 0.3, mid(bus + 2) - 0.05]];
const CLIP = SEGS.reduce((s, [a, b]) => s + b - a, 0);
export const TEASER_DURATION = CLIP + ctaTimeline.duration + 1.0;

const Header: React.FC<{ t: number }> = ({ t }) => {
  const words = "WHAT IF YOU COULD STOP TIME FOR 10 SECONDS A DAY?".split(" ");
  return (
    <div style={{ position: "absolute", top: 140, left: 60, right: 60, textAlign: "center", fontFamily: font, fontWeight: 900, fontSize: 84, lineHeight: 1.05 }}>
      {words.map((w, i) => {
        const p = pop(t, 0.1 + i * 0.05);
        return <span key={i} style={{ display: "inline-block", margin: "0 0.16em", opacity: Math.min(1, p), transform: `translateY(${(1 - p) * 30}px)`, color: ["STOP", "TIME"].includes(w) ? "#FFD54A" : P.white }}>{w}</span>;
      })}
    </div>
  );
};

const COLOR: Record<string, string> = { THEO: "#FFB37A", YOU: "#7FE3DD" };
const BigCaption: React.FC<{ et: number }> = ({ et }) => {
  const line = L.find((l) => et >= l.start && et <= l.end + 0.15);
  if (!line) return null;
  return (
    <div style={{ position: "absolute", top: 1410, left: 60, right: 60, textAlign: "center", fontFamily: font, fontWeight: 900, fontSize: 54, lineHeight: 1.2, color: COLOR[line.who] ?? P.white,
      textShadow: "0 6px 0 #10141F, 0 0 24px rgba(0,0,0,0.7)" }}>{line.text}</div>
  );
};

// one piece of the episode at full width (a tighter crop cuts off people and the stopwatch at the edges)
const Piece: React.FC<{ et0: number; et1: number }> = ({ et0, et1 }) => {
  const frame = useCurrentFrame();
  const et = et0 + frame / FPS;
  const s = 0.5625;
  const fade = Math.min(ease(frame / FPS, 0, 0.2), 1 - ease(et, et1 - 0.2, et1));
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, #2C3852 0%, #10141F 75%)" }}>
      <div style={{ position: "absolute", top: 560, left: 0, width: 1080, height: 820, overflow: "hidden", borderRadius: 36, background: "#18202F", opacity: fade }}>
        <div style={{ position: "absolute", left: 0, top: (820 - 1080 * s) / 2, width: 1920, height: 1080, transform: `scale(${s})`, transformOrigin: "0 0" }}>
          <Sequence from={-Math.round(et0 * FPS)}><Episode captions={false} /></Sequence>
        </div>
      </div>
      <BigCaption et={et} />
    </AbsoluteFill>
  );
};

const CallToAction: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #233A5C 0%, #10141F 75%)" }}>
      <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        <Bokeh t={t} n={14} opacity={0.18} />
        <Glow cx={540} cy={820} r={460} color="#7FC4FF" opacity={0.3} id="ctaglow" />
      </svg>
      <div style={{ position: "absolute", top: 140, left: 60, right: 60, textAlign: "center", fontFamily: font, fontWeight: 900, fontSize: 104, lineHeight: 1.05, color: P.white, opacity: Math.min(1, pop(t, 0.2)) }}>
        WOULD YOU<br /><span style={{ color: "#FFD54A" }}>SAVE HIM?</span>
      </div>
      <div style={{ position: "absolute", top: 560, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: Math.min(1, pop(t, 0.5)) }}>
        <div style={{ position: "relative", width: 900, height: 230 }}><Watch v={9.99} on x={0} y={0} s={1.9} /></div>
      </div>
      <div style={{ position: "absolute", top: 880, left: 60, right: 60, textAlign: "center", fontFamily: font, fontWeight: 900, fontSize: 56, lineHeight: 1.25, color: P.white, opacity: Math.min(1, pop(t, 1.3)) }}>
        THE $1,000,000 TRICK<br />NEEDS <span style={{ color: "#7FC4FF" }}>9 OF THEM</span>
      </div>
      <div style={{ position: "absolute", top: 1300, left: 60, right: 60, textAlign: "center", fontFamily: font, fontWeight: 900, fontSize: 76, lineHeight: 1.1, color: P.white,
        opacity: Math.min(1, pop(t, 3.4)), transform: `scale(${0.9 + 0.1 * Math.min(1, pop(t, 3.4))})` }}>
        FULL VIDEO ON MY<br /><span style={{ color: "#FF5C5C" }}>YOUTUBE CHANNEL</span>
      </div>
      <div style={{ position: "absolute", top: 1580, left: 0, right: 0, textAlign: "center", fontFamily: font, fontWeight: 900, fontSize: 64, color: "#FFD54A",
        opacity: Math.min(1, pop(t, 6.6)), transform: `translateY(${Math.sin(t * 5) * 10 * ease(t, 6.6, 7.0)}px)` }}>
        LINK BELOW ↓
      </div>
    </AbsoluteFill>
  );
};

export const Teaser: React.FC = () => {
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
        <CallToAction />
        <Audio src={staticFile("stoptime-teaser/voice.wav")} />
      </Sequence>
    </AbsoluteFill>
  );
};
