import { toPascalCase } from "../shared/naming";
import { resolvePaths } from "../shared/paths";
import { ensureDir, fileExists, writeFile } from "../infrastructure/fs/file-system";
import { log } from "../infrastructure/logger/logger";
import { renderTemplate } from "../infrastructure/templates/template-renderer";

import { resolveNestTargetModule } from "./shared/module-resolver";
import { registerSymbolInModule } from "./shared/module-registrar";

import type { GeneratorOptions } from "../core/types/generator.types";

/**
 * Generates a standard NestJS module and registers it into a parent module
 * (`app.module.ts` by default or the one resolved via `--module`).
 *
 * Unlike providers/controllers, modules do NOT walk up the tree: a new
 * module is generally a top-level feature and should plug into the root.
 */
export async function genModule(opts: GeneratorOptions): Promise<void> {
  const paths = resolvePaths({
    name: opts.name,
    basePath: opts.path,
    flat: opts.flat,
    extesion: ".module.ts",
    namingConventions: "KEBABCASE",
  });

  ensureDir(paths.featureDir, { dryRun: opts.dryRun, force: opts.force });

  const content = renderTemplate({
    scope: "generate",
    framework: "nestjs",
    template: "module.hbs",
    data: { className: paths.featureName },
  });

  writeFile(paths.file, content, { dryRun: opts.dryRun, force: opts.force });

  if (!fileExists(paths.file) && !opts.dryRun) {
    log.warn(`module not created (maybe skipped) -> ${paths.file}`);
  }

  if (opts.skipImport) return;

  const targetModule = resolveNestTargetModule({
    moduleOption: opts.module,
    basePath: paths.basePath,
    featureDir: paths.featureDir,
    walkUp: false,
  });

  await registerSymbolInModule({
    targetModule,
    symbolFilePath: paths.file,
    symbolName: `${toPascalCase(paths.featureName)}Module`,
    property: "imports",
    skipImport: opts.skipImport,
    dryRun: opts.dryRun,
    force: opts.force,
    featureName: paths.featureName,
  });
}
