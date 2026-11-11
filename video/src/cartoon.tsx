// Reusable cartoon pieces: outlined flat style, one recurring character.
import React from "react";

export const INK = "#1E2140";
export const OUT = 6; // outline width everywhere
export const C = {
  skin: "#F6C49A", skinShade: "#E3A577", shirt: "#4F7DF3", shirtShade: "#3A63D1", hair: "#3B2A24",
  white: "#FFFFFF", blush: "#F59A8B", sweat: "#7FD3FF", gold: "#F5C542", goldShade: "#D9A425",
};

export type Expr = "sleepy" | "shocked" | "nervous";
export type Pt = { x: number; y: number };

// Two-bone arm: shoulder -> elbow -> hand, elbow bends to the given side. Lengths in px.
const UPPER = 130, FORE = 135;
export const solveArm = (s: Pt, target: Pt, bend: 1 | -1): { e: Pt; h: Pt } => {
  const dx = target.x - s.x, dy = target.y - s.y;
  const d = Math.min(Math.hypot(dx, dy), UPPER + FORE - 1);
  const a = Math.atan2(dy, dx);
  const h = { x: s.x + Math.cos(a) * d, y: s.y + Math.sin(a) * d };
  const cosE = (UPPER * UPPER + d * d - FORE * FORE) / (2 * UPPER * d);
  const ang = a + bend * Math.acos(Math.max(-1, Math.min(1, cosE)));
  return { e: { x: s.x + Math.cos(ang) * UPPER, y: s.y + Math.sin(ang) * UPPER }, h };
};

// A thick limb with an ink outline: draw the outline stroke first, the fill stroke on top.
const Limb: React.FC<{ a: Pt; b: Pt; w: number; fill: string }> = ({ a, b, w, fill }) => (
  <g strokeLinecap="round">
    <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={INK} strokeWidth={w + OUT * 2} />
    <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={fill} strokeWidth={w} />
  </g>
);

export const Hand: React.FC<{ at: Pt; r?: number; angle?: number }> = ({ at, r = 30, angle = 0 }) => (
  <g transform={`translate(${at.x} ${at.y}) rotate(${angle})`} stroke={INK} strokeWidth={OUT}>
    <ellipse cx={r * 0.55} cy={-r * 0.55} rx={r * 0.35} ry={r * 0.5} fill={C.skin} transform={`rotate(-35 ${r * 0.55} ${-r * 0.55})`} />
    <circle r={r} fill={C.skin} />
    <path d={`M ${-r * 0.2} ${-r * 0.35} q ${r * 0.35} ${r * 0.15} ${r * 0.6} 0`} fill="none" strokeWidth={OUT * 0.6} />
  </g>
);

export const Arm: React.FC<{ s: Pt; target: Pt; bend: 1 | -1 }> = ({ s, target, bend }) => {
  const { e, h } = solveArm(s, target, bend);
  return (
    <g>
      <Limb a={s} b={e} w={44} fill={C.shirt} />
      <Limb a={e} b={h} w={34} fill={C.skin} />
      <Hand at={h} angle={(Math.atan2(h.y - e.y, h.x - e.x) * 180) / Math.PI} />
    </g>
  );
};

const Face: React.FC<{ expr: Expr; blink: boolean; look: number }> = ({ expr, blink, look }) => {
  const eyeR = expr === "shocked" ? 20 : 15;
  const pupil = expr === "shocked" ? 6 : 8;
  const closed = expr === "sleepy" || blink;
  const brow = expr === "shocked" ? -20 : expr === "nervous" ? -8 : 0;
  return (
    <g stroke={INK} strokeWidth={OUT} strokeLinecap="round" strokeLinejoin="round">
      {/* eyebrows */}
      <path d={`M -42 ${-34 + brow} q 14 ${expr === "nervous" ? 6 : -8} 28 ${expr === "nervous" ? -4 : 0}`} fill="none" />
      <path d={`M 14 ${-34 + brow + (expr === "nervous" ? -4 : 0)} q 14 ${expr === "nervous" ? 10 : -8} 28 ${expr === "nervous" ? 4 : 0}`} fill="none" />
      {closed ? (
        <g fill="none">
          <path d="M -40 -8 q 12 10 24 0" />
          <path d="M 16 -8 q 12 10 24 0" />
        </g>
      ) : (
        <g>
          <circle cx={-28} cy={-10} r={eyeR} fill={C.white} />
          <circle cx={28} cy={-10} r={eyeR} fill={C.white} />
          <circle cx={-28 + look * 6} cy={-8} r={pupil} fill={INK} stroke="none" />
          <circle cx={28 + look * 6} cy={-8} r={pupil} fill={INK} stroke="none" />
          <circle cx={-31 + look * 6} cy={-12} r={2.5} fill={C.white} stroke="none" />
          <circle cx={25 + look * 6} cy={-12} r={2.5} fill={C.white} stroke="none" />
        </g>
      )}
      {/* nose */}
      <path d="M 0 4 q 7 8 -2 12" fill="none" strokeWidth={OUT * 0.7} />
      {/* cheeks */}
      <ellipse cx={-48} cy={18} rx={12} ry={7} fill={C.blush} stroke="none" opacity={0.7} />
      <ellipse cx={48} cy={18} rx={12} ry={7} fill={C.blush} stroke="none" opacity={0.7} />
      {/* mouth */}
      {expr === "sleepy" && <path d="M -10 32 q 10 6 20 0" fill="none" />}
      {expr === "shocked" && <ellipse cx={0} cy={36} rx={11} ry={15} fill={INK} />}
      {expr === "nervous" && <path d="M -22 34 q 6 -8 11 0 q 6 8 11 0 q 6 -8 11 0 q 5 8 11 0" fill="none" />}
    </g>
  );
};

// The main character, drawn upright around the hip (0,0). Arm targets are in the same local space.
export const You: React.FC<{
  expr: Expr; blink?: boolean; look?: number; breathe?: number; sweat?: number;
  rightHand?: Pt; leftHand?: Pt; rightArm?: boolean; leftArm?: boolean;
}> = ({ expr, blink = false, look = 0, breathe = 0, sweat = 0, rightHand = { x: 95, y: -10 }, leftHand = { x: -95, y: -10 }, rightArm = true, leftArm = true }) => {
  const sy = 1 + breathe * 0.02;
  return (
    <g>
      {leftArm && <Arm s={{ x: -58, y: -140 }} target={leftHand} bend={-1} />}
      {/* torso with a shaded side */}
      <g transform={`scale(1 ${sy})`} stroke={INK} strokeWidth={OUT}>
        <path d="M -70 0 Q -78 -120 -50 -160 Q 0 -178 50 -160 Q 78 -120 70 0 Z" fill={C.shirt} />
        <path d="M 30 -165 Q 72 -130 68 -4 L 40 -4 Q 46 -110 30 -165 Z" fill={C.shirtShade} stroke="none" />
        <path d="M -24 -166 Q 0 -140 24 -166" fill="none" />
        <circle cx={0} cy={-110} r={5} fill={INK} stroke="none" />
        <circle cx={0} cy={-75} r={5} fill={INK} stroke="none" />
      </g>
      {/* head */}
      <g transform={`translate(0 ${-245 - breathe * 2})`} stroke={INK} strokeWidth={OUT} strokeLinejoin="round">
        <ellipse cx={-76} cy={4} rx={14} ry={20} fill={C.skin} />
        <ellipse cx={76} cy={4} rx={14} ry={20} fill={C.skin} />
        <ellipse rx={78} ry={74} fill={C.skin} />
        <path d="M 40 -50 Q 80 0 50 55 Q 70 0 40 -50 Z" fill={C.skinShade} stroke="none" opacity={0.6} />
        <path d="M -80 -10 Q -92 -80 -30 -92 Q 10 -110 50 -90 Q 92 -70 82 -10 Q 66 -46 40 -44 Q 34 -66 10 -52 Q -8 -74 -26 -50 Q -50 -64 -60 -36 Q -76 -40 -80 -10 Z" fill={C.hair} />
        <path d="M -40 -80 q 20 -10 40 -6" stroke={C.white} strokeWidth={5} opacity={0.35} fill="none" strokeLinecap="round" />
        <Face expr={expr} blink={blink} look={look} />
        {sweat > 0 && (
          <path d="M 86 -50 q 14 26 0 36 q -14 -10 0 -36 Z" fill={C.sweat} opacity={sweat} transform={`translate(0 ${(1 - sweat) * -16})`} />
        )}
      </g>
      {rightArm && <Arm s={SHOULDER_R} target={rightHand} bend={1} />}
    </g>
  );
};

export const SHOULDER_R: Pt = { x: 58, y: -140 };

// Local point of a group at `origin` rotated by `deg` -> world point.
export const toWorld = (p: Pt, origin: Pt, deg: number): Pt => {
  const r = (deg * Math.PI) / 180;
  return { x: origin.x + p.x * Math.cos(r) - p.y * Math.sin(r), y: origin.y + p.x * Math.sin(r) + p.y * Math.cos(r) };
};

// Convert a world point into the local space of a group at `origin` rotated by `deg`.
export const toLocal = (p: Pt, origin: Pt, deg: number): Pt => {
  const r = (-deg * Math.PI) / 180, dx = p.x - origin.x, dy = p.y - origin.y;
  return { x: dx * Math.cos(r) - dy * Math.sin(r), y: dx * Math.sin(r) + dy * Math.cos(r) };
};

export const Shadow: React.FC<{ cx: number; cy: number; rx: number }> = ({ cx, cy, rx }) => (
  <ellipse cx={cx} cy={cy} rx={rx} ry={rx * 0.12} fill={INK} opacity={0.18} />
);
