import { toPascalCase } from "../shared/naming";
import { resolvePaths } from "../shared/paths";
import { ensureDir, writeFile } from "../infrastructure/fs/file-system";
import { renderTemplate } from "../infrastructure/templates/template-renderer";

import { resolveNestTargetModule } from "./shared/module-resolver";
import { registerSymbolInModule } from "./shared/module-registrar";

import type { GeneratorOptions } from "../core/types/generator.types";

/**
 * Generates a NestJS controller along with optional `.spec.ts` and
 * `.docs.ts` files, and registers the class in the closest module.
 */
export async function genController(opts: GeneratorOptions): Promise<void> {
  const paths = resolvePaths({
    name: opts.name,
    basePath: opts.path,
    flat: opts.flat,
    extesion: ".controller.ts",
    extesionTest: ".controller.spec.ts",
    namingConventions: "KEBABCASE",
  });

  ensureDir(paths.featureDir, { dryRun: opts.dryRun, force: opts.force });

  const controllerContent = renderTemplate({
    scope: "generate",
    framework: "nestjs",
    template: "controller.hbs",
    data: { className: paths.featureName, route: paths.featureName },
  });
  writeFile(paths.file, controllerContent, {
    dryRun: opts.dryRun,
    force: opts.force,
  });

  if (opts.spec !== false) {
    const specContent = renderTemplate({
      scope: "generate",
      framework: "nestjs",
      template: "spec-controller.hbs",
      data: { className: paths.featureName, kind: "controller" },
    });
    writeFile(paths.testFile, specContent, {
      dryRun: opts.dryRun,
      force: opts.force,
    });
  }

  if (opts.docs !== false) {
    const docsContent = renderTemplate({
      scope: "generate",
      framework: "nestjs",
      template: "docs-controller.hbs",
      data: { className: paths.featureName, kind: "controller" },
    });
    writeFile(`${paths.fileWithOutExtesion}.controller.docs.ts`, docsContent, {
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
    symbolName: `${toPascalCase(paths.featureName)}Controller`,
    property: "controllers",
    skipImport: opts.skipImport,
    dryRun: opts.dryRun,
    force: opts.force,
    featureName: paths.featureName,
  });
}
