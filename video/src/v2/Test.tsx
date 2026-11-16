import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { World, Layer, Vignette, Grain, Shafts, Dust, Grad, Person, pose, YOU, THEO, AVA, MOM, HOST, OWNER, TEACHER, extra } from "./kit";
export const Test: React.FC = () => {
  const t = useCurrentFrame() / 30 + 1;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <World cam={{ x: 960, y: 540, z: 1 }}>
        <Layer d={0.5} blur={3}><Grad id="tw" x={0} y={0} w={1920} h={760} from="#F6D9B8" to="#E9B48E" /><rect x={200} y={120} width={420} height={380} rx={12} fill="#BFE3F5" /><Shafts x={200} y={120} w={420} h={700} t={t} /></Layer>
        <Layer><Grad id="tf" x={0} y={760} w={1920} h={320} from="#B9805A" to="#8A5A3C" />
          <Person x={220} y={1000} look={YOU} mood="happy" t={t} p={pose("holdUp")} seed={1} />
          <Person x={520} y={1000} look={THEO} mood="shocked" t={t} p={pose("facepalm")} seed={2} />
          <Person x={820} y={1000} look={AVA} mood="smug" t={t} p={pose("hips", { turn: -0.6 })} flip seed={3} />
          <Person x={1100} y={1000} look={MOM} mood="worried" t={t} p={pose("phone")} seed={4} />
          <Person x={1380} y={1000} look={HOST} mood="laugh" t={t} p={pose("point")} seed={5} />
          <Person x={1650} y={1000} look={OWNER} mood="deadpan" t={t} p={pose("shrug")} seed={6} />
          <Person x={1820} y={1010} look={TEACHER} mood="angry" t={t} p={pose("think")} seed={7} s={0.8} />
          <Dust t={t} />
        </Layer>
      </World>
      <Vignette /><Grain t={t} />
    </AbsoluteFill>
  );
};
