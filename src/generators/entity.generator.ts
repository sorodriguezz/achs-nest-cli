import { runSimpleGenerator } from "./shared/simple-generator";

import type { GeneratorOptions } from "../core/types/generator.types";

/** Generates a persistence entity class. */
export async function genEntity(opts: GeneratorOptions): Promise<void> {
  await runSimpleGenerator(opts, {
    extension: ".entity.ts",
    template: "entity.hbs",
    data: (entityName) => ({ entityName }),
  });
}
