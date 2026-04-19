import chalk from "chalk";

import type { SchematicConfig } from "../../core/types/schematic.types";

const NAME_WIDTH = 14;
const ALIAS_WIDTH = 6;
const DESC_WIDTH = 44;

/**
 * Pretty-prints the registered schematics as an ASCII table so users can
 * discover them via `--help` or when an unknown generator is requested.
 */
export function printSchematicsTable(schematics: SchematicConfig[]): void {
  const top = border("┌", "┬", "┐");
  const mid = border("├", "┼", "┤");
  const bot = border("└", "┴", "┘");

  console.log(chalk.gray(`  ${top}`));
  console.log(
    chalk.gray(
      `  │ ${chalk.bold(pad("name", NAME_WIDTH))} │ ${chalk.bold(
        pad("alias", ALIAS_WIDTH)
      )} │ ${chalk.bold(pad("description", DESC_WIDTH))} │`
    )
  );
  console.log(chalk.gray(`  ${mid}`));

  for (const schematic of schematics) {
    console.log(
      chalk.gray("  │ ") +
        chalk.green(pad(schematic.name, NAME_WIDTH)) +
        chalk.gray(" │ ") +
        chalk.yellow(pad(schematic.alias, ALIAS_WIDTH)) +
        chalk.gray(" │ ") +
        pad(schematic.description, DESC_WIDTH) +
        chalk.gray(" │")
    );
  }

  console.log(chalk.gray(`  ${bot}`));
}

function border(left: string, middle: string, right: string): string {
  return (
    left +
    "─".repeat(NAME_WIDTH + 2) +
    middle +
    "─".repeat(ALIAS_WIDTH + 2) +
    middle +
    "─".repeat(DESC_WIDTH + 2) +
    right
  );
}

function pad(value: string, length: number): string {
  return value + " ".repeat(Math.max(0, length - value.length));
}
