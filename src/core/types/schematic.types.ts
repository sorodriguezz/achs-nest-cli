import type { GeneratorFn } from "./generator.types";

/**
 * Declarative representation of an extra CLI flag exposed by a schematic.
 */
export interface CliOptionConfig {
  /** commander-style flags (e.g. `-m, --module <module>`). */
  flags: string;
  description: string;
  defaultValue?: string | boolean;
}

/**
 * Per-schematic overrides for the base CLI options.
 */
export interface SchematicOptions {
  pathDefault?: string;
  pathDescription?: string;
  supportsFlat?: boolean;
}

/**
 * Full schematic definition used to build the CLI tree.
 */
export interface SchematicConfig {
  name: string;
  alias: string;
  description: string;
  options?: SchematicOptions;
  cliOptions?: CliOptionConfig[];
  generator: GeneratorFn;
}

/**
 * Grouping of schematics + defaults that applies to a whole framework
 * (currently only NestJS, but the shape keeps the CLI extensible).
 */
export interface FrameworkDefinition {
  id: string;
  label: string;
  aliases: string[];
  schematics: SchematicConfig[];
  defaults?: SchematicOptions;
  cliOptions?: CliOptionConfig[];
}
