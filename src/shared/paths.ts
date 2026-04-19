import path from "node:path";

import { namingFunctions, toKebabCase, type NamingConvention } from "./naming";

export interface ResolvedPaths {
  /** Normalised base path used as the root for the feature. */
  basePath: string;
  /** Last segment of the name after applying the naming convention. */
  featureName: string;
  /** Directory the feature lives in. */
  featureDir: string;
  /** Full path to the feature file without its extension. */
  fileWithOutExtesion: string;
  /** Full path to the feature file. */
  file: string;
  /** Full path to the companion `.spec.ts` file (if applicable). */
  testFile: string;
}

export interface ResolvePathsInput {
  name: string;
  extesion: string;
  namingConventions: NamingConvention;
  basePath?: string;
  flat?: boolean;
  extesionTest?: string;
}

/**
 * Resolves all the filesystem paths for a feature based on its name and the
 * provided layout options. Supports nested paths (`users/profile`), both
 * `flat` and folder layouts, and arbitrary naming conventions.
 */
export function resolvePaths(params: ResolvePathsInput): ResolvedPaths {
  const basePath = params.basePath?.trim() || "src";
  const segments = params.name.split(/[\\/]/).filter(Boolean);

  const rawFeatureName = segments[segments.length - 1] ?? "";
  const featureName = namingFunctions[params.namingConventions](rawFeatureName);
  const directories = segments.slice(0, -1).map(toKebabCase);

  const featureDir = params.flat
    ? directories.length > 0
      ? path.join(basePath, ...directories)
      : basePath
    : path.join(basePath, ...directories, featureName);

  return {
    basePath,
    featureName,
    featureDir,
    file: path.join(featureDir, `${featureName}${params.extesion}`),
    testFile: path.join(featureDir, `${featureName}${params.extesionTest ?? ".spec.ts"}`),
    fileWithOutExtesion: path.join(featureDir, featureName),
  };
}
