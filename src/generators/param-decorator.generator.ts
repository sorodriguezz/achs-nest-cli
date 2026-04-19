import { runSimpleGenerator } from "./shared/simple-generator";

import type { GeneratorOptions } from "../core/types/generator.types";

/** Generates a custom NestJS param decorator. */
export async function genParamDecorator(opts: GeneratorOptions): Promise<void> {
  await runSimpleGenerator(opts, {
    extension: ".decorator.ts",
    template: "param-decorator.hbs",
    data: (decoratorName) => ({ decoratorName }),
  });
}
