import chalk from "chalk";
import { Command } from "commander";

import type { GeneratorOptions } from "../../core/types/generator.types";
import type {
  CliOptionConfig,
  FrameworkDefinition,
  SchematicConfig,
  SchematicOptions,
} from "../../core/types/schematic.types";
import { printSchematicsTable } from "../utils/schematics-table";

/**
 * Registers the `generate <schematic> <name>` (alias `g`) command tree
 * from a framework definition. Each schematic becomes a sub-command with
 * its own aliases, flags and help text.
 */
export function registerGenerateCommand(
  program: Command,
  framework: FrameworkDefinition
): void {
  const root = program
    .command("generate")
    .alias("g")
    .description(`Generate ${framework.label} elements (files & schematics)`);

  attachHelpText(root, framework);
  attachUnknownSchematicHandler(root, framework.schematics);

  root.configureHelp({
    subcommandTerm: (cmd) => {
      const name = cmd.name();
      const hasOptions = cmd.options?.length ? "[options] " : "";
      return `${name} ${hasOptions}`.trim();
    },
  });

  for (const schematic of framework.schematics) {
    registerSchematic(root, schematic, framework.defaults, framework.cliOptions);
  }
}

function attachHelpText(root: Command, framework: FrameworkDefinition): void {
  root.addHelpText("after", () => {
    let output = "\n" + chalk.bold(`Available ${framework.label} schematics:\n\n`);
    const originalLog = console.log;
    let buffer = "";
    console.log = (...args: unknown[]) => {
      buffer += args.join(" ") + "\n";
    };
    printSchematicsTable(framework.schematics);
    console.log = originalLog;
    return output + buffer;
  });
}

function attachUnknownSchematicHandler(
  root: Command,
  schematics: SchematicConfig[]
): void {
  root.on("command:*", (operands: string[]) => {
    const valid = schematics.map((s) => s.name).join(", ");
    console.error(chalk.red(`\nerror: unknown generator '${operands[0]}'`));
    console.error(`\nValid generators are: ${valid}\n`);
    process.exit(1);
  });
}

function registerSchematic(
  parent: Command,
  config: SchematicConfig,
  frameworkDefaults?: SchematicOptions,
  frameworkCliOptions?: CliOptionConfig[]
): void {
  const cmd = parent
    .command(config.name)
    .alias(config.alias)
    .description(config.description)
    .argument("<name>", "Feature name (e.g. users)");

  applyBaseOptions(cmd, config.options, frameworkDefaults);
  applyCliOptions(cmd, mergeCliOptions(frameworkCliOptions, config.cliOptions));

  cmd.configureHelp({
    commandUsage: () => {
      const alias = parent.alias();
      const aliasLabel = alias ? `|${alias}` : "";
      return `${parent.name()}${aliasLabel} ${config.name}|${config.alias} [options] <name>`;
    },
  });

  cmd.action(async (name: string, opts: GeneratorOptions) => {
    await config.generator({ ...opts, name });
  });
}

function applyBaseOptions(
  cmd: Command,
  options?: SchematicOptions,
  defaults?: SchematicOptions
): void {
  const pathDefault = options?.pathDefault ?? defaults?.pathDefault ?? "src";
  const pathDescription =
    options?.pathDescription ??
    defaults?.pathDescription ??
    `Base path (default: ${pathDefault})`;
  const supportsFlat = options?.supportsFlat ?? defaults?.supportsFlat ?? false;

  cmd
    .option("-p, --path <path>", pathDescription, pathDefault)
    .option("--dry-run", "Do not write files, only print actions", false)
    .option("--force", "Overwrite existing files", false);

  if (supportsFlat) {
    cmd.option("--flat", "Do not create a folder for the feature", false);
  }
}

function applyCliOptions(cmd: Command, options?: CliOptionConfig[]): void {
  if (!options?.length) return;
  for (const option of options) {
    if (option.defaultValue !== undefined) {
      cmd.option(option.flags, option.description, option.defaultValue);
    } else {
      cmd.option(option.flags, option.description);
    }
  }
}

function mergeCliOptions(
  framework?: CliOptionConfig[],
  schematic?: CliOptionConfig[]
): CliOptionConfig[] | undefined {
  if (!framework?.length && !schematic?.length) return undefined;
  const byFlags = new Map<string, CliOptionConfig>();
  for (const option of framework ?? []) byFlags.set(option.flags, option);
  for (const option of schematic ?? []) byFlags.set(option.flags, option);
  return Array.from(byFlags.values());
}
