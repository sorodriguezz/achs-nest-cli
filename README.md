# achs-nest-cli

**English** · [Español](README.es.md)

Per-project scaffolding CLI for **NestJS**. It generates the same artefacts as
`@nestjs/cli` — service, controller, module, repository, dto, guards,
interceptors, middlewares, decorators, filters, etc. — using a curated set of
Handlebars templates and updating the target module via AST (`ts-morph`) so the
imports and the `@Module()` arrays (`providers`, `controllers`, `imports`,
`exports`) are always kept consistent.

## Installation

You can install it **globally** (for a direct `anc` / `achs-nest` command, just
like `nest`) or **per-project** as a dev dependency (for a version pinned in
`package.json`). You can also do both.

### Global install (direct command)

```bash
npm i -g achs-nest-cli
```

This puts the binaries on your PATH, so you can run them directly from any
project — no `npx` needed:

```bash
anc g service users
achs-nest g co auth --path src/modules
```

This is exactly how `@nestjs/cli` exposes its `nest` command.

### Per-project install (dev dependency)

```bash
# npm
npm i -D achs-nest-cli

# pnpm
pnpm add -D achs-nest-cli

# yarn
yarn add -D achs-nest-cli
```

A local install pins the generator version for the whole team / CI, but the
binary lives in `node_modules/.bin` (which is not on your PATH), so you invoke it
via `npx`, an npm script, or `yarn`/`pnpm` (see below).

> The published package ships a prebuilt `dist/` and the `templates/` folder, so
> there is nothing to compile after install. If you install straight from a git
> URL, the `prepare` script builds `dist/` automatically.

**Global vs. dev dependency:**

| | Global (`-g`) | Dev dependency (`-D`) |
| --- | --- | --- |
| Command | bare `anc` / `achs-nest` anywhere | `npx`, npm script, or `yarn`/`pnpm` |
| Version | single, machine-wide | pinned per project (great for teams/CI) |
| On PATH? | yes | no (`node_modules/.bin`) |

Many teams install both: global for the convenient command, local so that
`npx`/scripts use the project-pinned version.

## Using it in your project

The CLI exposes two binaries: `achs-nest` and `anc` (short alias).

**Global install:**

```bash
anc g service users
```

**Per-project — with `npx`:**

```bash
npx anc g service users
npx achs-nest generate service users
```

**Per-project — from an `npm` script** (add it to your `package.json`):

```json
{
  "scripts": {
    "g": "anc g"
  }
}
```

```bash
npm run g -- service users
```

**Per-project — with yarn / pnpm** (they can run local binaries without `npx`):

```bash
yarn anc g service users
pnpm anc g service users
```

**Per-project — direct binary path:**

```bash
./node_modules/.bin/anc g service users
```

### Quick examples

Create a service, its `.spec.ts`, and register it automatically inside the
closest module (adds `UsersService` to `providers` **and** the relative import):

```bash
anc g service users
```

Create a controller with its docs and spec files inside `src/modules/auth`:

```bash
anc g co auth --path src/modules
```

Preview everything without touching the disk:

```bash
anc g service users --dry-run
```

Skip the automatic module registration:

```bash
anc g service users --skip-import
```

Target a specific module explicitly (by feature name, file, or path):

```bash
anc g service users --module orders
```

## How automatic module registration works

When you generate a `service`, `controller`, `repository`, `module` or
`dymodule`, the CLI locates the right `*.module.ts` and updates it via AST:

1. It resolves the **target module**:
   - if `--module <name|file|path>` is given, that one wins;
   - otherwise it walks up from the feature directory looking for a sibling
     `<dir>.module.ts` (or any `*.module.ts`);
   - as a last resort it falls back to `<basePath>/app.module.ts`.
2. It ensures a **named import** for the generated symbol, using a correct
   relative path.
3. It ensures the symbol is present in the right `@Module()` array
   (`providers` for services/repositories, `controllers` for controllers,
   `imports` for modules).

The edit is **idempotent** (re-running never duplicates an import or an array
entry — it reports `SKIP` instead), preserves the file's indentation and quote
style, and is fully simulated under `--dry-run`. If no suitable module is found,
the file is still created and a warning is printed. Use `--skip-import` to opt
out entirely.

### Common flags

| Flag                   | Description                                         |
| ---------------------- | --------------------------------------------------- |
| `-p, --path <path>`    | Base path (default: `src`)                          |
| `--flat`               | Do not create a folder for the feature              |
| `--dry-run`            | Do not write files, only print actions              |
| `--force`              | Overwrite existing files                            |
| `--no-spec`            | Skip the `.spec.ts` (where supported)               |
| `--no-docs`            | Skip the `.docs.ts` (controllers only)              |
| `-m, --module <name>`  | Target module file/feature name to update           |
| `--skip-import`        | Do not register the symbol in any module            |

Run `anc g <schematic> --help` to see the flags supported by each schematic.

### Available schematics

| name           | alias | generates                                |
| -------------- | ----- | ---------------------------------------- |
| service        | s     | `*.service.ts` + spec + module update    |
| controller     | co    | `*.controller.ts` + spec + docs + module |
| repository     | repo  | `*.repository.ts` + spec + module update |
| module         | mo    | `*.module.ts` + app-module update        |
| dymodule       | dmo   | dynamic module + app-module update       |
| dto            | d     | `*.dto.ts`                               |
| interface      | itf   | `*.interface.ts`                         |
| decorator      | dec   | `*.decorator.ts`                         |
| paramdecorator | pdec  | `*.decorator.ts`                         |
| entity         | ent   | `*.entity.ts`                            |
| filter         | f     | `*.filter.ts`                            |
| guard          | gu    | `*.guard.ts`                             |
| interceptor    | itc   | `*.interceptor.ts`                       |
| middleware     | mi    | `*.middleware.ts`                        |
| httpExc        | he    | `*.exception.ts`                         |
| vitest         | vt    | `*.spec.ts` (standalone)                 |

## Overriding templates

The template renderer probes a few roots in order; the first one that exists
wins. The first candidate is `<cwd>/templates`, so to customise a template just
drop your own `templates/generate/nestjs/<name>.hbs` inside your project root and
it will be picked up automatically. If none is found there, the templates
shipped with the package are used.

## Architecture

```
src/
├── bin.ts                  # CLI entry point
├── cli/                    # Interfaces layer — commander plumbing
│   ├── index.ts
│   ├── commands/
│   │   └── generate.command.ts
│   └── utils/
│       └── schematics-table.ts
├── core/                   # Domain layer — pure types & framework config
│   ├── schematics/
│   │   └── nest-schematics.ts
│   └── types/
│       ├── generator.types.ts
│       └── schematic.types.ts
├── generators/             # Application layer — one generator per artefact
│   ├── index.ts
│   ├── <*.generator.ts>
│   └── shared/             # Cross-cutting pieces (module resolver, etc.)
├── infrastructure/         # Infrastructure layer — I/O & side effects
│   ├── ast/
│   ├── fs/
│   ├── logger/
│   └── templates/
├── shared/                 # Naming & path utilities
└── templates/              # Handlebars templates
```

The layers follow a clean-architecture flow: generators depend on infrastructure
and shared utilities, the CLI layer depends on generators and the domain
catalogue, and nothing in `core/` imports from `cli/` or `infrastructure/`.

## Building from source

```bash
pnpm install
pnpm run build      # bundles src/ into dist/index.js with @vercel/ncc
pnpm run dev        # same, in watch mode
```

This project uses **pnpm** as its package manager and **@vercel/ncc** as the
bundler (no esbuild). The `prepare` script runs `build` automatically on install
(e.g. git installs), and `prepublishOnly` rebuilds before publishing to npm.

## License

MIT — Sebastián Rodríguez Zapata.
