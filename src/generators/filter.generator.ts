import { runSimpleGenerator } from "./shared/simple-generator";

import type { GeneratorOptions } from "../core/types/generator.types";

/** Generates a NestJS exception filter. */
export async function genFilter(opts: GeneratorOptions): Promise<void> {
  await runSimpleGenerator(opts, {
    extension: ".filter.ts",
    template: "filter.hbs",
    data: (filterName) => ({ filterName }),
  });
}
