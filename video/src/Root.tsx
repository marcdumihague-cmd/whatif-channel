import { Composition } from "remotion";
import { TestScene } from "./TestScene";
import { Episode, DURATION } from "./ll/Episode";
import { Episode as OneMinute, DURATION as OM_DURATION } from "./om/Episode";
import { Thumb as OneMinuteThumb } from "./om/Thumb";
import { Teaser as OneMinuteTeaser, TEASER_DURATION } from "./om/Teaser";
import timeline from "../public/test-scene/timeline.json";

export const FPS = 30;

export const Root = () => (
  <>
    <Composition id="TestScene" component={TestScene} durationInFrames={Math.ceil(timeline.duration * FPS)} fps={FPS} width={1920} height={1080} />
    <Composition id="OneMinute" component={OneMinute} durationInFrames={Math.ceil(OM_DURATION * FPS)} fps={FPS} width={1920} height={1080} />
    <Composition id="OneMinuteThumb" component={OneMinuteThumb} durationInFrames={1} fps={FPS} width={1280} height={720} />
    <Composition id="OneMinuteTeaser" component={OneMinuteTeaser} durationInFrames={Math.ceil(TEASER_DURATION * FPS)} fps={FPS} width={1080} height={1920} />
    <Composition id="LastLiar" component={Episode} durationInFrames={Math.ceil(DURATION * FPS)} fps={FPS} width={1920} height={1080} />
  </>
);
