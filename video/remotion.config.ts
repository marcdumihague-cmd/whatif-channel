import { Config } from "@remotion/cli/config";

// Use the pre-installed headless Chrome instead of downloading one.
if (process.env.REMOTION_CHROME) Config.setBrowserExecutable(process.env.REMOTION_CHROME);
