// Contact sheet: render one still every N seconds of a composition, to check layout before a render.
//   node sheet.mjs <Composition> <everySeconds> <outDir> [fromSec] [toSec]
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";

const [id, every = "3", out = "out/sheet", from = "0", to = "1e9"] = process.argv.slice(2);
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const browserExecutable = process.env.REMOTION_CHROME;
const comp = await selectComposition({ serveUrl, id, browserExecutable });
const end = Math.min(comp.durationInFrames - 1, Math.round(Number(to) * comp.fps));
for (let f = Math.round(Number(from) * comp.fps); f <= end; f += Math.round(Number(every) * comp.fps)) {
  const file = `${out}/${String(f).padStart(5, "0")}.jpg`;
  await renderStill({ serveUrl, composition: comp, frame: f, output: file, imageFormat: "jpeg", scale: 0.4, browserExecutable });
  console.log(file);
}
