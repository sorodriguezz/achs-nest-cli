import { toPascalCase } from "../shared/naming";
import { resolvePaths } from "../shared/paths";
import { ensureDir, writeFile } from "../infrastructure/fs/file-system";
import { renderTemplate } from "../infrastructure/templates/template-renderer";

import { resolveNestTargetModule } from "./shared/module-resolver";
import { registerSymbolInModule } from "./shared/module-registrar";

import type { GeneratorOptions } from "../core/types/generator.types";

/**
 * Generates a NestJS service, its optional `.spec.ts`, and registers the
 * class inside the closest module under the `providers` array.
 */
export async function genService(opts: GeneratorOptions): Promise<void> {
  const paths = resolvePaths({
    name: opts.name,
    basePath: opts.path,
    flat: opts.flat,
    extesion: ".service.ts",
    extesionTest: ".service.spec.ts",
    namingConventions: "KEBABCASE",
  });

  ensureDir(paths.featureDir, { dryRun: opts.dryRun, force: opts.force });

  const serviceContent = renderTemplate({
    scope: "generate",
    framework: "nestjs",
    template: "service.hbs",
    data: { className: paths.featureName },
  });
  writeFile(paths.file, serviceContent, {
    dryRun: opts.dryRun,
    force: opts.force,
  });

  if (opts.spec !== false) {
    const specContent = renderTemplate({
      scope: "generate",
      framework: "nestjs",
      template: "spec-service.hbs",
      data: { className: paths.featureName, kind: "service" },
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
    symbolName: `${toPascalCase(paths.featureName)}Service`,
    property: "providers",
    skipImport: opts.skipImport,
    dryRun: opts.dryRun,
    force: opts.force,
    featureName: paths.featureName,
  });
}
