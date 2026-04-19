import { runSimpleGenerator } from "./shared/simple-generator";

import type { GeneratorOptions } from "../core/types/generator.types";

/** Generates a NestJS DTO class. */
export async function genDto(opts: GeneratorOptions): Promise<void> {
  await runSimpleGenerator(opts, {
    extension: ".dto.ts",
    template: "dto.hbs",
    data: (className) => ({ className }),
  });
}
