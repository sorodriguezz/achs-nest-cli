import { toPascalCase } from "../shared/naming";
import { resolvePaths } from "../shared/paths";
import { ensureDir, writeFile } from "../infrastructure/fs/file-system";
import { renderTemplate } from "../infrastructure/templates/template-renderer";

import { resolveNestTargetModule } from "./shared/module-resolver";
import { registerSymbolInModule } from "./shared/module-registrar";

import type { GeneratorOptions } from "../core/types/generator.types";

/**
 * Generates a NestJS repository class (with optional spec) and registers
 * it under the nearest module's `providers` array.
 */
export async function genRepository(opts: GeneratorOptions): Promise<void> {
  const paths = resolvePaths({
    name: opts.name,
    basePath: opts.path,
    flat: opts.flat,
    extesion: ".repository.ts",
    extesionTest: ".repository.spec.ts",
    namingConventions: "KEBABCASE",
  });

  ensureDir(paths.featureDir, { dryRun: opts.dryRun, force: opts.force });

  const repositoryContent = renderTemplate({
    scope: "generate",
    framework: "nestjs",
    template: "repository.hbs",
    data: { className: paths.featureName },
  });
  writeFile(paths.file, repositoryContent, {
    dryRun: opts.dryRun,
    force: opts.force,
  });

  if (opts.spec !== false) {
    const specContent = renderTemplate({
      scope: "generate",
      framework: "nestjs",
      template: "spec-repository.hbs",
      data: { className: paths.featureName, kind: "repository" },
    });
    writeFile(paths.testFile, specContent, {
      dryRun: opts.dryRun,
      force: opts.force,
    });
  }

  const targetModule = resolveNestTargetModule({
    moduleOption: opts.module,
    basePath: paths.basePath,
    featureDir: paths.featureDir,
  });

  await registerSymbolInModule({
    targetModule,
    symbolFilePath: paths.file,
    symbolName: `${toPascalCase(paths.featureName)}Repository`,
    property: "providers",
    skipImport: opts.skipImport,
    dryRun: opts.dryRun,
    force: opts.force,
    featureName: paths.featureName,
  });
}
