// Vertical teaser (1080x1920) for Shorts / TikTok / Reels: the cold open (Theo at 87%), a jump to the
// haggling scene (98. Deal.), then a call to action that teases Theo's secret without giving it away.
import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import episodeTimeline from "../../public/secretly/timeline.json";
import ctaTimeline from "../../public/secretly-teaser/timeline.json";
import ctaBioTimeline from "../../public/secretly-teaser-bio/timeline.json";
import { Episode, Tag } from "./Episode";
import { P, pop, ease, Bokeh, Glow, Person, THEO } from "../ll/kit";

const FPS = 30;
const font = "'Inter Display', Inter, sans-serif";
const L = episodeTimeline.lines;
const mid = (i: number) => (L[i].end + L[i + 1].start) / 2;
const promise = L.findIndex((l) => l.scene === "promise");
const garage = L.findIndex((l) => l.scene === "market");
const nightmare = L.findIndex((l) => l.text === "Kid, you're a nightmare.");
// the two pieces of the episode, in episode seconds
const SEGS: [number, number][] = [[0, mid(promise - 1) - 0.05], [L[garage].start - 0.3, mid(nightmare) - 0.05]];
const CLIP = SEGS.reduce((s, [a, b]) => s + b - a, 0);
export const TEASER_DURATION = CLIP + ctaTimeline.duration + 1.0;
export const TEASER_BIO_DURATION = CLIP + ctaBioTimeline.duration + 1.0; // TikTok / Instagram: no links in captions

const Header: React.FC<{ t: number }> = ({ t }) => {
  const words = "WHAT IF YOU COULD SEE WHO SECRETLY HATES YOU?".split(" ");
  return (
    <div style={{ position: "absolute", top: 140, left: 60, right: 60, textAlign: "center", fontFamily: font, fontWeight: 900, fontSize: 88, lineHeight: 1.05 }}>
      {words.map((w, i) => {
        const p = pop(t, 0.1 + i * 0.05);
        return <span key={i} style={{ display: "inline-block", margin: "0 0.16em", opacity: Math.min(1, p), transform: `translateY(${(1 - p) * 30}px)`, color: ["SECRETLY", "HATES"].includes(w) ? "#FFD54A" : P.white }}>{w}</span>;
      })}
    </div>
  );
};

const COLOR: Record<string, string> = { THEO: "#FFB37A", YOU: "#7FE3DD", SELLER: "#B8E0B8" };
const BigCaption: React.FC<{ et: number }> = ({ et }) => {
  const line = L.find((l) => et >= l.start && et <= l.end + 0.15);
  if (!line) return null;
  return (
    <div style={{ position: "absolute", top: 1410, left: 60, right: 60, textAlign: "center", fontFamily: font, fontWeight: 900, fontSize: 54, lineHeight: 1.2, color: COLOR[line.who] ?? P.white,
      textShadow: "0 6px 0 #10141F, 0 0 24px rgba(0,0,0,0.7)" }}>{line.text}</div>
  );
};

// one piece of the episode, cropped into the phone frame; `et0` = the episode second it starts at
const Piece: React.FC<{ et0: number; et1: number }> = ({ et0, et1 }) => {
  const frame = useCurrentFrame();
  const et = et0 + frame / FPS;
  const s = et0 < 1 ? 0.5625 : 0.75, fx = et0 < 1 ? 960 : 1000; // the cold open needs the full width: tags sit at both edges
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
  const v = interpolate(t, [0.3, 1.6], [0, 87], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #4A2430 0%, #10141F 75%)" }}>
      <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        <Bokeh t={t} n={14} opacity={0.18} />
        <Glow cx={540} cy={760} r={460} color="#FF4B4B" opacity={0.35} id="ctaglow" />
        <g transform="translate(540 1250) scale(1.25)"><Person x={0} y={0} look={THEO} mood="smug" t={t} /></g>
        <g transform={`translate(540 520) scale(${1.8 * pop(t, 0.1)})`}><Tag t={t} x={0} y={0} v={v} id="cta" /></g>
      </svg>
      <div style={{ position: "absolute", top: 140, left: 60, right: 60, textAlign: "center", fontFamily: font, fontWeight: 900, fontSize: 96, lineHeight: 1.05, color: P.white, opacity: Math.min(1, pop(t, 0.2)) }}>
        WHY DOES HE<br /><span style={{ color: "#FFD54A" }}>HATE YOU?</span>
      </div>
      <div style={{ position: "absolute", top: 1300, left: 60, right: 60, textAlign: "center", fontFamily: font, fontWeight: 900, fontSize: 76, lineHeight: 1.1, color: P.white,
        opacity: Math.min(1, pop(t, 2.4)), transform: `scale(${0.9 + 0.1 * Math.min(1, pop(t, 2.4))})` }}>
        FULL VIDEO ON MY<br /><span style={{ color: "#FF5C5C" }}>YOUTUBE CHANNEL</span>
      </div>
      <div style={{ position: "absolute", top: 1580, left: 0, right: 0, textAlign: "center", fontFamily: font, fontWeight: 900, fontSize: 64, color: "#FFD54A",
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
        <Audio src={staticFile(bio ? "secretly-teaser-bio/voice.wav" : "secretly-teaser/voice.wav")} />
      </Sequence>
    </AbsoluteFill>
  );
};
