import { Composition } from "remotion";
import { TestScene } from "./TestScene";
import { Episode, DURATION } from "./ll/Episode";
import timeline from "../public/test-scene/timeline.json";

export const FPS = 30;

export const Root = () => (
  <>
    <Composition id="TestScene" component={TestScene} durationInFrames={Math.ceil(timeline.duration * FPS)} fps={FPS} width={1920} height={1080} />
    <Composition id="LastLiar" component={Episode} durationInFrames={Math.ceil(DURATION * FPS)} fps={FPS} width={1920} height={1080} />
  </>
);
