// Contact sheet: render one still every N seconds of a composition, to check layout before a render.
//   node sheet.mjs <Composition> <everySeconds> <outDir> [fromSec] [toSec]
//   node sheet.mjs <Composition> 6,60,66.5 <outDir>      (a comma list = exactly those seconds)
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";

const [id, every = "3", out = "out/sheet", from = "0", to = "1e9"] = process.argv.slice(2);
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const browserExecutable = process.env.REMOTION_CHROME;
const comp = await selectComposition({ serveUrl, id, browserExecutable });
const end = Math.min(comp.durationInFrames - 1, Math.round(Number(to) * comp.fps));
const frames = every.includes(",") ? every.split(",").map((x) => Math.min(end, Math.round(Number(x) * comp.fps)))
  : Array.from({ length: Math.floor((end - Math.round(Number(from) * comp.fps)) / Math.round(Number(every) * comp.fps)) + 1 }, (_, i) => Math.round(Number(from) * comp.fps) + i * Math.round(Number(every) * comp.fps));
for (const f of frames) {
  const file = `${out}/${String(f).padStart(5, "0")}.jpg`;
  await renderStill({ serveUrl, composition: comp, frame: f, output: file, imageFormat: "jpeg", scale: 0.4, browserExecutable });
  console.log(file);
}
