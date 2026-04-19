import { runSimpleGenerator } from "./shared/simple-generator";

import type { GeneratorOptions } from "../core/types/generator.types";

/** Generates a custom NestJS decorator. */
export async function genDecorator(opts: GeneratorOptions): Promise<void> {
  await runSimpleGenerator(opts, {
    extension: ".decorator.ts",
    template: "decorator.hbs",
    data: (decoratorName) => ({ decoratorName }),
  });
}
