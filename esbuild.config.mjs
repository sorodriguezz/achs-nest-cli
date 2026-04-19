import esbuild from "esbuild";

const green = (text) => `\x1b[32m${text}\x1b[0m`;
const cyan = (text) => `\x1b[36m${text}\x1b[0m`;
const bold = (text) => `\x1b[1m${text}\x1b[0m`;

const isWatch = process.argv.includes("--watch");

const buildOptions = {
  entryPoints: {
    bin: "src/bin.ts",
  },
  outdir: "dist",
  bundle: true,
  platform: "node",
  target: ["node18"],
  format: "cjs",
  sourcemap: true,
  minify: true,
  banner: {
    js: "#!/usr/bin/env node",
  },
  external: [],
};

if (isWatch) {
  const ctx = await esbuild.context(buildOptions);
  await ctx.watch();
  console.log(cyan("👀 Watching for changes..."));
} else {
  await esbuild.build(buildOptions);
  console.log(green("✔") + ` Build OK: ${bold("dist/bin.js")}`);
}
