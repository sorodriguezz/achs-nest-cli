import { runSimpleGenerator } from "./shared/simple-generator";

import type { GeneratorOptions } from "../core/types/generator.types";

/** Generates a standalone Vitest `*.spec.ts` file. */
export async function genSpec(opts: GeneratorOptions): Promise<void> {
  await runSimpleGenerator(opts, {
    extension: ".spec.ts",
    template: "spec.hbs",
    data: (specName) => ({ specName }),
  });
}
