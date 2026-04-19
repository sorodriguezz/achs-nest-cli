import { runSimpleGenerator } from "./shared/simple-generator";

import type { GeneratorOptions } from "../core/types/generator.types";

/** Generates a plain TypeScript interface. */
export async function genInterface(opts: GeneratorOptions): Promise<void> {
  await runSimpleGenerator(opts, {
    extension: ".interface.ts",
    template: "interface.hbs",
    data: (interfaceName) => ({ interfaceName }),
  });
}
