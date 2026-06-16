# achs-nest-cli

[English](README.md) · **Español**

CLI de scaffolding para **NestJS**. Genera los mismos artefactos que
`@nestjs/cli` — service, controller, module, repository, dto, guards,
interceptors, middlewares, decorators, filters, etc. — usando un conjunto
curado de plantillas Handlebars y actualizando el módulo destino vía AST
(`ts-morph`), de modo que los imports y los arrays del `@Module()`
(`providers`, `controllers`, `imports`, `exports`) se mantienen siempre
consistentes.

## Instalación

Puedes instalarla **globalmente** (para tener el comando directo `anc` /
`achs-nest`, igual que `nest`) o **por proyecto** como dependencia de
desarrollo (para fijar la versión en el `package.json`). También puedes hacer
ambas.

### Instalación global (comando directo)

```bash
npm i -g achs-nest-cli
```

Esto deja los binarios en tu PATH, así que puedes ejecutarlos directamente
desde cualquier proyecto, sin `npx`:

```bash
anc g service users
achs-nest g co auth --path src/modules
```

Es exactamente como `@nestjs/cli` expone su comando `nest`.

### Instalación por proyecto (dependencia de desarrollo)

```bash
# npm
npm i -D achs-nest-cli

# pnpm
pnpm add -D achs-nest-cli

# yarn
yarn add -D achs-nest-cli
```

Una instalación local fija la versión del generador para todo el equipo / CI,
pero el binario vive en `node_modules/.bin` (que no está en tu PATH), así que lo
invocas con `npx`, un script de npm, o `yarn`/`pnpm` (ver más abajo).

> El paquete publicado incluye un `dist/` ya compilado y la carpeta
> `templates/`, por lo que no hay nada que compilar tras instalar. Si lo
> instalas directamente desde una URL de git, el script `prepare` compila
> `dist/` automáticamente.

**Global vs. dependencia de desarrollo:**

| | Global (`-g`) | Dependencia de desarrollo (`-D`) |
| --- | --- | --- |
| Comando | `anc` / `achs-nest` directo en cualquier lugar | `npx`, script de npm, o `yarn`/`pnpm` |
| Versión | única, a nivel de máquina | fijada por proyecto (ideal para equipos/CI) |
| ¿En el PATH? | sí | no (`node_modules/.bin`) |

Muchos equipos instalan ambas: global por la comodidad del comando, y local para
que `npx`/los scripts usen la versión fijada del proyecto.

## Cómo usarla en tu proyecto

La CLI expone dos binarios: `achs-nest` y `anc` (alias corto).

**Instalación global:**

```bash
anc g service users
```

**Por proyecto — con `npx`:**

```bash
npx anc g service users
npx achs-nest generate service users
```

**Por proyecto — desde un script de `npm`** (agrégalo a tu `package.json`):

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

**Por proyecto — con yarn / pnpm** (pueden ejecutar binarios locales sin `npx`):

```bash
yarn anc g service users
pnpm anc g service users
```

**Por proyecto — ruta directa del binario:**

```bash
./node_modules/.bin/anc g service users
```

### Ejemplos rápidos

Crear un service, su `.spec.ts`, y registrarlo automáticamente dentro del módulo
más cercano (agrega `UsersService` a `providers` **y** el import relativo):

```bash
anc g service users
```

Crear un controller con sus archivos de docs y spec dentro de `src/modules/auth`:

```bash
anc g co auth --path src/modules
```

Previsualizar todo sin tocar el disco:

```bash
anc g service users --dry-run
```

Omitir el registro automático en el módulo:

```bash
anc g service users --skip-import
```

Apuntar a un módulo específico (por nombre de feature, archivo o ruta):

```bash
anc g service users --module orders
```

## Cómo funciona el registro automático en el módulo

Al generar un `service`, `controller`, `repository`, `module` o `dymodule`, la
CLI localiza el `*.module.ts` correcto y lo actualiza vía AST:

1. Resuelve el **módulo destino**:
   - si se pasa `--module <nombre|archivo|ruta>`, ese gana;
   - si no, sube desde el directorio de la feature buscando un
     `<dir>.module.ts` hermano (o cualquier `*.module.ts`);
   - como último recurso, cae a `<basePath>/app.module.ts`.
2. Asegura un **import nombrado** del símbolo generado, con la ruta relativa
   correcta.
3. Asegura que el símbolo esté en el array correcto del `@Module()`
   (`providers` para services/repositories, `controllers` para controllers,
   `imports` para módulos).

La edición es **idempotente** (re-ejecutar nunca duplica un import ni una
entrada del array — reporta `SKIP`), preserva la indentación y el estilo de
comillas del archivo, y se simula por completo con `--dry-run`. Si no se
encuentra un módulo adecuado, el archivo igual se crea y se imprime una
advertencia. Usa `--skip-import` para omitir este paso.

### Flags comunes

| Flag                   | Descripción                                          |
| ---------------------- | ---------------------------------------------------- |
| `-p, --path <path>`    | Ruta base (por defecto: `src`)                       |
| `--flat`               | No crear una carpeta para la feature                 |
| `--dry-run`            | No escribir archivos, solo imprimir acciones         |
| `--force`              | Sobrescribir archivos existentes                     |
| `--no-spec`            | Omitir el `.spec.ts` (donde aplique)                 |
| `--no-docs`            | Omitir el `.docs.ts` (solo controllers)              |
| `-m, --module <name>`  | Módulo destino (archivo/feature) a actualizar        |
| `--skip-import`        | No registrar el símbolo en ningún módulo             |

Ejecuta `anc g <schematic> --help` para ver los flags de cada schematic.

### Schematics disponibles

| nombre         | alias | genera                                   |
| -------------- | ----- | ---------------------------------------- |
| service        | s     | `*.service.ts` + spec + update de módulo |
| controller     | co    | `*.controller.ts` + spec + docs + módulo |
| repository     | repo  | `*.repository.ts` + spec + update módulo |
| module         | mo    | `*.module.ts` + update de app-module     |
| dymodule       | dmo   | módulo dinámico + update de app-module   |
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

## Sobrescribir plantillas

El renderizador de plantillas prueba varias raíces en orden; gana la primera que
exista. El primer candidato es `<cwd>/templates`, así que para personalizar una
plantilla solo deja tu propio `templates/generate/nestjs/<nombre>.hbs` en la raíz
de tu proyecto y se usará automáticamente. Si no hay ninguna ahí, se usan las
plantillas que vienen con el paquete.

## Arquitectura

```
src/
├── bin.ts                  # Punto de entrada del CLI
├── cli/                    # Capa de interfaces — plomería de commander
│   ├── index.ts
│   ├── commands/
│   │   └── generate.command.ts
│   └── utils/
│       └── schematics-table.ts
├── core/                   # Capa de dominio — tipos puros y config del framework
│   ├── schematics/
│   │   └── nest-schematics.ts
│   └── types/
│       ├── generator.types.ts
│       └── schematic.types.ts
├── generators/             # Capa de aplicación — un generador por artefacto
│   ├── index.ts
│   ├── <*.generator.ts>
│   └── shared/             # Piezas transversales (module resolver, etc.)
├── infrastructure/         # Capa de infraestructura — I/O y efectos
│   ├── ast/
│   ├── fs/
│   ├── logger/
│   └── templates/
├── shared/                 # Utilidades de naming y rutas
└── templates/              # Plantillas Handlebars
```

Las capas siguen un flujo de arquitectura limpia: los generadores dependen de
infraestructura y utilidades compartidas, la capa CLI depende de los generadores
y del catálogo de dominio, y nada en `core/` importa de `cli/` o
`infrastructure/`.

## Compilar desde el código fuente

```bash
npm install
npm run build      # empaqueta src/ en dist/bin.js con esbuild
npm run dev        # lo mismo, en modo watch
```

El script `prepare` ejecuta `build` automáticamente al instalar (p. ej. en
instalaciones desde git), y `prepublishOnly` recompila antes de publicar en npm.

## Licencia

MIT — Sebastián Rodríguez Zapata.
