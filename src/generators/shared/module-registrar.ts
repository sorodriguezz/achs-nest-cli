import {
  nestModuleEditor,
  type NestModuleProperty,
} from "../../infrastructure/ast/nest-module-editor";
import { fileExists } from "../../infrastructure/fs/file-system";
import { log } from "../../infrastructure/logger/logger";

export interface ModuleRegistrationInput {
  /** Absolute/resolved path to the `*.module.ts` to update, or `null`. */
  targetModule: string | null;
  /** Absolute/resolved path to the file exporting the symbol. */
  symbolFilePath: string;
  /** Class/identifier to register. */
  symbolName: string;
  /** Property of the `@Module()` decorator to update. */
  property: NestModuleProperty;
  /** When set, skip the whole step (mirrors `--skip-import`). */
  skipImport?: boolean;
  dryRun?: boolean;
  force?: boolean;
  /** Human-readable feature name used for warnings only. */
  featureName: string;
}

/**
 * Registers a generated symbol inside a target NestJS module if possible.
 * All the repetitive "is the module missing / dry-run / try-catch" logic
 * lives here so individual generators stay small.
 */
export async function registerSymbolInModule(
  input: ModuleRegistrationInput
): Promise<void> {
  if (input.skipImport) return;

  if (!input.targetModule) {
    log.warn(
      `module not found, cannot register ${input.property} for ${input.featureName}`
    );
    return;
  }

  if (!fileExists(input.targetModule)) {
    log.warn(
      `module not found, cannot register ${input.property}: ${input.targetModule}`
    );
    return;
  }

  try {
    await nestModuleEditor.updateModuleFile({
      modulePath: input.targetModule,
      symbolName: input.symbolName,
      symbolFilePath: input.symbolFilePath,
      property: input.property,
      dryRun: input.dryRun,
      force: input.force,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log.error(`failed to update module ${input.targetModule} -> ${msg}`);
  }
}
