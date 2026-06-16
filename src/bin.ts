#!/usr/bin/env node
import { runCli } from "./cli";

void main();

async function main() {
  try {
    await runCli(process.argv);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[achs-nest] Error: ${msg}`);

    if (process.env.ACHS_NEST_DEBUG === "1") {
      console.error(err);
    }
    process.exit(1);
  }
}
