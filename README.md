# achs-nest-cli

Per-project scaffolding CLI for **NestJS**. Installed locally in each project (not globally), it generates the same artefacts as `@nestjs/cli` — service, controller, module, repository, dto, guards, interceptors, middlewares, decorators, filters, etc. — using a curated set of Handlebars templates and updating the target module via AST (ts-morph) so imports and arrays (`providers`, `controllers`, `imports`, `exports`) are always kept consistent.

## Installation

Install it as a dev dependency of your NestJS project:

```bash
npm i -D achs-nest-cli
```

This exposes two binaries inside the project:

- `achs-nest`
- `anc` (short alias)

Invoke them with `npx`, from an npm script, or directly via `./node_modules/.bin/achs-nest`.

## Usage

```bash
npx achs-nest generate <schematic> <name> [options]
# or
npx anc g <schematic> <name> [options]
```

Example — create a service, its `.spec.ts` and register it automatically inside the closest module:

```bash
npx anc g service users
```

Example — create a controller with its docs file and spec file inside `src/modules/auth`:

```bash
npx anc g co auth --path src/modules
```

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

The layers follow a clean-architecture flow: generators depend on infrastructure and shared utilities, the CLI layer depends on generators and the domain catalogue, and nothing in `core/` imports from `cli/` or `infrastructure/`.

## Overriding templates

The template renderer probes a few roots in order; the first one that exists wins. The first candidate is `<cwd>/templates`, so if you want to customise a template just drop your own `templates/generate/nestjs/<name>.hbs` inside your project and it will be picked up automatically.

## License

MIT — Sebastián Rodríguez Zapata.
