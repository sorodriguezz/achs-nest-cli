import chalk from "chalk";

/**
 * Centralised logging helper. Keeps the console output uniform across the
 * whole CLI and makes it trivial to swap the transport in tests.
 */
export const log = {
  create: (file: string) => console.log(chalk.green("CREATE") + ` ${file}`),
  update: (file: string, detail?: string) =>
    console.log(
      chalk.blue("UPDATE") + ` ${file}` + (detail ? chalk.gray(` (${detail})`) : "")
    ),
  skip: (file: string, reason?: string) =>
    console.log(
      chalk.yellow("SKIP") + ` ${file}` + (reason ? chalk.gray(` (${reason})`) : "")
    ),

  dryCreate: (file: string) =>
    console.log(chalk.gray("[dry-run]") + chalk.green(" CREATE") + ` ${file}`),
  dryUpdate: (file: string) =>
    console.log(chalk.gray("[dry-run]") + chalk.blue(" UPDATE") + ` ${file}`),
  dryMkdir: (dir: string) =>
    console.log(chalk.gray("[dry-run]") + ` mkdir -p ${dir}`),

  info: (msg: string) => console.log(chalk.cyan(msg)),
  warn: (msg: string) => console.log(chalk.yellow("WARN") + ` ${msg}`),
  error: (msg: string) => console.error(chalk.red("ERROR") + ` ${msg}`),
  success: (msg: string) => console.log(chalk.green("✔") + ` ${msg}`),

  snippet: (title: string, content: string) => {
    console.log(chalk.gray(`----- ${title} -----`));
    console.log(content);
  },
};
