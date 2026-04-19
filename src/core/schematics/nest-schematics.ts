import {
  genController,
  genDecorator,
  genDto,
  genDynamicModule,
  genEntity,
  genFilter,
  genGuard,
  genHttpException,
  genInterceptor,
  genInterface,
  genMiddleware,
  genModule,
  genParamDecorator,
  genRepository,
  genService,
  genSpec,
} from "../../generators";

import type { CliOptionConfig, FrameworkDefinition } from "../types/schematic.types";

/**
 * Flag declarations reused across several schematics. Kept at module scope
 * so they are easy to discover and to edit.
 */

const specOption: CliOptionConfig = {
  flags: "--no-spec",
  description: "Do not generate *.spec.ts",
};

const docsOption: CliOptionConfig = {
  flags: "--no-docs",
  description: "Do not generate *.docs.ts",
};

const moduleOptions: CliOptionConfig[] = [
  {
    flags: "-m, --module <module>",
    description: "Module to register in",
  },
  {
    flags: "--skip-import",
    description: "Do not register in module",
    defaultValue: false,
  },
];

interface NestCliOptionFlags {
  spec: boolean;
  module: boolean;
  docs: boolean;
}

/**
 * Composes the set of CLI flags that applies to a given schematic based on
 * what features it actually supports.
 */
function nestCliOptions({ spec, module, docs }: NestCliOptionFlags): CliOptionConfig[] | undefined {
  const options: CliOptionConfig[] = [];
  if (spec) options.push(specOption);
  if (module) options.push(...moduleOptions);
  if (docs) options.push(docsOption);
  return options.length ? options : undefined;
}

/**
 * Full NestJS framework definition. This is the single source of truth the
 * CLI layer reads to build its command tree.
 */
export const NEST_FRAMEWORK: FrameworkDefinition = {
  id: "nestjs",
  label: "NestJS",
  aliases: ["nt"],
  defaults: {
    pathDefault: "src",
    supportsFlat: true,
  },
  schematics: [
    {
      name: "controller",
      alias: "co",
      description: "Generate a controller declaration",
      cliOptions: nestCliOptions({ spec: true, module: true, docs: true }),
      generator: genController,
    },
    {
      name: "dto",
      alias: "d",
      description: "Generate a DTO class",
      generator: genDto,
    },
    {
      name: "interface",
      alias: "itf",
      description: "Generate an interface",
      generator: genInterface,
    },
    {
      name: "module",
      alias: "mo",
      description: "Generate a module declaration",
      cliOptions: nestCliOptions({ spec: false, module: true, docs: false }),
      generator: genModule,
    },
    {
      name: "repository",
      alias: "repo",
      description: "Generate a repository declaration",
      cliOptions: nestCliOptions({ spec: true, module: true, docs: false }),
      generator: genRepository,
    },
    {
      name: "service",
      alias: "s",
      description: "Generate a service declaration",
      cliOptions: nestCliOptions({ spec: true, module: true, docs: false }),
      generator: genService,
    },
    {
      name: "decorator",
      alias: "dec",
      description: "Generate a decorator declaration",
      generator: genDecorator,
    },
    {
      name: "entity",
      alias: "ent",
      description: "Generate an entity declaration",
      generator: genEntity,
    },
    {
      name: "filter",
      alias: "f",
      description: "Generate a filter declaration",
      generator: genFilter,
    },
    {
      name: "guard",
      alias: "gu",
      description: "Generate a guard declaration",
      generator: genGuard,
    },
    {
      name: "httpExc",
      alias: "he",
      description: "Generate an http exception declaration",
      generator: genHttpException,
    },
    {
      name: "interceptor",
      alias: "itc",
      description: "Generate an interceptor declaration",
      generator: genInterceptor,
    },
    {
      name: "middleware",
      alias: "mi",
      description: "Generate a middleware declaration",
      generator: genMiddleware,
    },
    {
      name: "dymodule",
      alias: "dmo",
      description: "Generate a dynamic module declaration",
      cliOptions: nestCliOptions({ spec: false, module: true, docs: false }),
      generator: genDynamicModule,
    },
    {
      name: "paramdecorator",
      alias: "pdec",
      description: "Generate a param decorator declaration",
      generator: genParamDecorator,
    },
    {
      name: "vitest",
      alias: "vt",
      description: "Generate a Vitest spec declaration",
      generator: genSpec,
    },
  ],
};
