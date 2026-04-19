/**
 * Options accepted by every generator command.
 *
 * The CLI layer builds this object from the parsed `commander` arguments
 * and hands it to a pure `GeneratorFn`. Generators must remain agnostic of
 * how these values were obtained.
 */
export interface GeneratorOptions {
  /** Feature name (supports nested paths like `users/profile`). */
  name: string;
  /** Base path where files are created. Defaults to `src`. */
  path?: string;
  /** If `true`, do not create a sub-folder for the feature. */
  flat?: boolean;
  /** If `true`, simulate the operation without touching the disk. */
  dryRun?: boolean;
  /** If `true`, overwrite existing files. */
  force?: boolean;
  /** If `false`, skip the `.spec.ts` generation. */
  spec?: boolean;
  /** Explicit module file/path/dir to register the symbol in. */
  module?: string;
  /** If `true`, skip updating any module file. */
  skipImport?: boolean;
  /** If `false`, skip the `.docs.ts` generation (controllers only). */
  docs?: boolean;
}

/**
 * A pure generator function. Takes already-normalised options and
 * performs the scaffold.
 */
export type GeneratorFn = (opts: GeneratorOptions) => Promise<void>;
