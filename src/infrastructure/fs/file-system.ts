import fs from "node:fs";
import path from "node:path";

import { log } from "../logger/logger";

export interface WriteOptions {
  dryRun?: boolean;
  force?: boolean;
}

/**
 * Thin, logged wrappers around Node's `fs` APIs. All generators go through
 * this module so that `--dry-run` and `--force` are honoured consistently.
 */

export function fileExists(target: string): boolean {
  try {
    fs.accessSync(target, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export function ensureDir(dirPath: string, opts: WriteOptions): void {
  if (opts.dryRun) {
    log.dryMkdir(dirPath);
    return;
  }
  fs.mkdirSync(dirPath, { recursive: true });
}

export function writeFile(
  target: string,
  content: string | Buffer,
  opts: WriteOptions
): void {
  const exists = fileExists(target);
  if (exists && !opts.force) {
    log.skip(target, "exists, use --force to overwrite");
    return;
  }

  if (opts.dryRun) {
    log.dryCreate(target);
    return;
  }

  ensureDir(path.dirname(target), opts);
  if (Buffer.isBuffer(content)) {
    fs.writeFileSync(target, content);
  } else {
    fs.writeFileSync(target, content, "utf8");
  }
  log.create(target);
}

export function readFile(target: string): string {
  return fs.readFileSync(target, "utf8");
}

export function readDir(target: string): string[] {
  try {
    return fs.readdirSync(target);
  } catch {
    return [];
  }
}
