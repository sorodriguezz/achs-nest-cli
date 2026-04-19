import { runSimpleGenerator } from "./shared/simple-generator";

import type { GeneratorOptions } from "../core/types/generator.types";

/** Generates a NestJS interceptor. */
export async function genInterceptor(opts: GeneratorOptions): Promise<void> {
  await runSimpleGenerator(opts, {
    extension: ".interceptor.ts",
    template: "interceptor.hbs",
    data: (interceptorName) => ({ interceptorName }),
  });
}
