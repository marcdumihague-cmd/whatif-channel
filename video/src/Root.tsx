import { Composition } from "remotion";
import { TestScene } from "./TestScene";
import { Episode, DURATION } from "./ll/Episode";
import { Episode as OneMinute, DURATION as OM_DURATION } from "./om/Episode";
import { Thumb as OneMinuteThumb } from "./om/Thumb";
import { Teaser as OneMinuteTeaser, TEASER_DURATION } from "./om/Teaser";
import { Episode as Dreams, DURATION as DR_DURATION } from "./dr/Episode";
import { Thumb as DreamsThumb } from "./dr/Thumb";
import { Episode as Watched, DURATION as WT_DURATION } from "./wt/Episode";
import { Thumb as WatchedThumb } from "./wt/Thumb";
import { Teaser as WatchedTeaser, TEASER_DURATION as WT_TEASER, TEASER_BIO_DURATION as WT_TEASER_BIO } from "./wt/Teaser";
import { Episode as Except, DURATION as EX_DURATION } from "./ex/Episode";
import timeline from "../public/test-scene/timeline.json";

export const FPS = 30;

export const Root = () => (
  <>
    <Composition id="TestScene" component={TestScene} durationInFrames={Math.ceil(timeline.duration * FPS)} fps={FPS} width={1920} height={1080} />
    <Composition id="OneMinute" component={OneMinute} durationInFrames={Math.ceil(OM_DURATION * FPS)} fps={FPS} width={1920} height={1080} />
    <Composition id="OneMinuteThumb" component={OneMinuteThumb} durationInFrames={1} fps={FPS} width={1280} height={720} />
    <Composition id="OneMinuteTeaser" component={OneMinuteTeaser} durationInFrames={Math.ceil(TEASER_DURATION * FPS)} fps={FPS} width={1080} height={1920} />
    <Composition id="LastLiar" component={Episode} durationInFrames={Math.ceil(DURATION * FPS)} fps={FPS} width={1920} height={1080} />
    <Composition id="Dreams" component={Dreams} durationInFrames={Math.ceil(DR_DURATION * FPS)} fps={FPS} width={1920} height={1080} />
    <Composition id="DreamsThumb" component={DreamsThumb} durationInFrames={1} fps={FPS} width={1280} height={720} />
    <Composition id="Watched" component={Watched} durationInFrames={Math.ceil(WT_DURATION * FPS)} fps={FPS} width={1920} height={1080} />
    <Composition id="WatchedThumb" component={WatchedThumb} durationInFrames={1} fps={FPS} width={1280} height={720} />
    <Composition id="WatchedTeaser" component={WatchedTeaser} durationInFrames={Math.ceil(WT_TEASER * FPS)} fps={FPS} width={1080} height={1920} />
    <Composition id="WatchedTeaserBio" component={WatchedTeaser} defaultProps={{ bio: true }} durationInFrames={Math.ceil(WT_TEASER_BIO * FPS)} fps={FPS} width={1080} height={1920} />
    <Composition id="Except" component={Except} durationInFrames={Math.ceil(EX_DURATION * FPS)} fps={FPS} width={1920} height={1080} />
  </>
);
