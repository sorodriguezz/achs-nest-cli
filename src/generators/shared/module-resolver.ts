import fs from "node:fs";
import path from "node:path";

import { fileExists } from "../../infrastructure/fs/file-system";

export interface ResolveModuleInput {
  /** Value passed via `--module`. May be a path, a file or a feature name. */
  moduleOption?: string;
  /** Resolved base path of the feature (e.g. `src`). */
  basePath: string;
  /** Resolved directory of the feature being generated. */
  featureDir: string;
  /** Whether the resolver should walk upwards looking for a sibling module. */
  walkUp?: boolean;
}

/**
 * Resolves the target `*.module.ts` that a newly generated symbol should be
 * registered into. Mirrors the behaviour of `@nestjs/cli`:
 *
 *  - If `--module` is provided, honour it (path, file, or feature name).
 *  - Otherwise walk upwards from the feature directory looking for a
 *    `<dir>.module.ts` or any `*.module.ts`.
 *  - Fall back to `<basePath>/app.module.ts`.
 *
 * Returns `null` when no suitable module file can be found.
 */
export function resolveNestTargetModule(input: ResolveModuleInput): string | null {
  if (input.moduleOption) {
    return resolveExplicitModule(input.moduleOption, input.basePath);
  }

  const baseAbs = path.resolve(process.cwd(), input.basePath);

  if (input.walkUp !== false) {
    const walked = walkUpLookingForModule(input.featureDir, baseAbs);
    if (walked) return walked;
  }

  const appModule = path.join(baseAbs, "app.module.ts");
  return fileExists(appModule) ? appModule : null;
}

function resolveExplicitModule(moduleOption: string, basePath: string): string {
  const base = path.resolve(process.cwd(), basePath);

  if (path.isAbsolute(moduleOption) || moduleOption.includes(path.sep)) {
    return path.resolve(process.cwd(), moduleOption);
  }

  if (moduleOption.endsWith(".ts")) {
    return path.join(base, moduleOption);
  }

  const nestedCandidate = path.join(base, moduleOption, `${moduleOption}.module.ts`);
  if (fileExists(nestedCandidate)) return nestedCandidate;

  const flatCandidate = path.join(base, `${moduleOption}.module.ts`);
  if (fileExists(flatCandidate)) return flatCandidate;

  return path.resolve(process.cwd(), moduleOption);
}

function walkUpLookingForModule(
  featureDir: string,
  baseAbs: string
): string | null {
  let dir = path.resolve(process.cwd(), featureDir);

  while (true) {
    const entries = safeReadDir(dir);
    if (entries) {
      const preferred = `${path.basename(dir)}.module.ts`;
      if (entries.includes(preferred)) {
        return path.join(dir, preferred);
      }
      const any = entries.find((entry) => entry.endsWith(".module.ts"));
      if (any) return path.join(dir, any);
    }

    if (path.resolve(dir) === path.resolve(baseAbs)) return null;

    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

function safeReadDir(target: string): string[] | null {
  try {
    return fs.readdirSync(target);
  } catch {
    return null;
  }
}
