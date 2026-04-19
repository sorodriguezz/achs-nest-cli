import { Command } from "commander";

import { NEST_FRAMEWORK } from "../core/schematics/nest-schematics";
import { version } from "../../package.json";

import { registerGenerateCommand } from "./commands/generate.command";

/**
 * Public entry point for the CLI. Builds the command tree and parses the
 * provided argv. Kept pure (no side effects) so it can be re-used from
 * tests or a custom host.
 */
export async function runCli(argv: string[]): Promise<void> {
  const program = new Command();

  program
    .name("achs-nest")
    .description("Per-project scaffolding CLI for NestJS")
    .version(version);

  registerGenerateCommand(program, NEST_FRAMEWORK);

  await program.parseAsync(argv);
}
