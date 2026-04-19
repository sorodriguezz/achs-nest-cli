import { resolvePaths } from "../../shared/paths";
import { ensureDir, writeFile } from "../../infrastructure/fs/file-system";
import { renderTemplate } from "../../infrastructure/templates/template-renderer";

import type { GeneratorOptions } from "../../core/types/generator.types";

export interface SimpleGeneratorInput {
  /** Feature/file extension (e.g. `.dto.ts`). */
  extension: string;
  /** Handlebars template filename under `templates/generate/nestjs/`. */
  template: string;
  /** Builds the data object passed to the template. */
  data: (featureName: string) => Record<string, unknown>;
}

/**
 * Runs the minimum scaffolding pipeline used by generators that only need
 * to emit a single file (DTOs, interfaces, guards, interceptors, ...).
 */
export async function runSimpleGenerator(
  opts: GeneratorOptions,
  input: SimpleGeneratorInput
): Promise<void> {
  const paths = resolvePaths({
    name: opts.name,
    basePath: opts.path,
    flat: opts.flat,
    extesion: input.extension,
    namingConventions: "KEBABCASE",
  });

  ensureDir(paths.featureDir, { dryRun: opts.dryRun, force: opts.force });

  const content = renderTemplate({
    scope: "generate",
    framework: "nestjs",
    template: input.template,
    data: input.data(paths.featureName),
  });

  writeFile(paths.file, content, { dryRun: opts.dryRun, force: opts.force });
}
