import { runSimpleGenerator } from "./shared/simple-generator";

import type { GeneratorOptions } from "../core/types/generator.types";

/** Generates a NestJS guard. */
export async function genGuard(opts: GeneratorOptions): Promise<void> {
  await runSimpleGenerator(opts, {
    extension: ".guard.ts",
    template: "guard.hbs",
    data: (guardName) => ({ guardName }),
  });
}
