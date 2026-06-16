import { runSimpleGenerator } from "./shared/simple-generator";

import type { GeneratorOptions } from "../core/types/generator.types";

/** Generates a NestJS middleware class. */
export async function genMiddleware(opts: GeneratorOptions): Promise<void> {
  await runSimpleGenerator(opts, {
    extension: ".middleware.ts",
    template: "middleware.hbs",
    data: (middlewareName) => ({ middlewareName }),
  });
}
