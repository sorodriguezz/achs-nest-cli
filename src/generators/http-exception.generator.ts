import { runSimpleGenerator } from "./shared/simple-generator";

import type { GeneratorOptions } from "../core/types/generator.types";

/** Generates a custom HTTP exception class. */
export async function genHttpException(opts: GeneratorOptions): Promise<void> {
  await runSimpleGenerator(opts, {
    extension: ".exception.ts",
    template: "http-exception.hbs",
    data: (httpExceptionName) => ({ httpExceptionName }),
  });
}
