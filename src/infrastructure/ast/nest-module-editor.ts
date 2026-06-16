import path from "node:path";

import {
  IndentationText,
  Project,
  QuoteKind,
  SyntaxKind,
  type ArrayLiteralExpression,
  type ObjectLiteralExpression,
  type SourceFile,
} from "ts-morph";

import { ensureRelativeImportPath } from "../../shared/naming";
import { fileExists, readFile } from "../fs/file-system";
import { log } from "../logger/logger";

export type NestModuleProperty = "providers" | "controllers" | "imports" | "exports";

export interface UpdateNestModuleArgs {
  /** Absolute or cwd-relative path to the target `*.module.ts` file. */
  modulePath: string;
  /** Class name (or token) to add to the module's array property. */
  symbolName: string;
  /** Absolute or cwd-relative path to the file exporting `symbolName`. */
  symbolFilePath: string;
  /** Which `@Module({...})` array to update. */
  property: NestModuleProperty;
  dryRun?: boolean;
  force?: boolean;
}

/**
 * Updates a NestJS `*.module.ts` file in place:
 *
 *  1. Ensures a named import for `symbolName` from the right relative path.
 *  2. Ensures the symbol is present in the `@Module({ [property]: [...] })`.
 *
 * When `dryRun` is enabled, both the before/after snippets are printed but
 * the file is not modified.
 */
export class NestModuleEditor {
  async updateModuleFile(args: UpdateNestModuleArgs): Promise<void> {
    const moduleAbs = path.resolve(process.cwd(), args.modulePath);
    if (!fileExists(moduleAbs)) {
      throw new Error(`Module file not found: ${args.modulePath}`);
    }

    const project = this.createProject();
    const { sf, moduleObj } = this.getModuleObjectLiteral(moduleAbs, project);

    const importSpecifier = this.buildRelativeImportSpecifier(
      moduleAbs,
      path.resolve(process.cwd(), args.symbolFilePath)
    );

    const importAdded = this.ensureNamedImport(
      sf,
      args.symbolName,
      importSpecifier
    );
    const { arr, created } = this.ensureArrayProperty(moduleObj, args.property);
    const symbolAdded = this.ensureSymbolInArray(arr, args.symbolName);
    const changed = importAdded || created || symbolAdded;

    if (args.dryRun) {
      log.dryUpdate(args.modulePath);
      log.snippet("before", readFile(moduleAbs).slice(0, 600));
      log.snippet("after", sf.getFullText().slice(0, 600));
      return;
    }

    if (!changed) {
      log.skip(args.modulePath, `${args.symbolName} already registered`);
      return;
    }

    await sf.save();
    log.update(args.modulePath, `+${args.property}: ${args.symbolName}`);
  }

  private createProject(): Project {
    return new Project({
      useInMemoryFileSystem: false,
      skipFileDependencyResolution: true,
      skipLoadingLibFiles: true,
      compilerOptions: { allowJs: true },
      manipulationSettings: {
        indentationText: IndentationText.TwoSpaces,
        quoteKind: QuoteKind.Single,
      },
    });
  }

  private buildRelativeImportSpecifier(
    fromModulePath: string,
    toSymbolPath: string
  ): string {
    const moduleDir = path.dirname(fromModulePath);
    let rel = path.relative(moduleDir, toSymbolPath).replace(/\\/g, "/");
    rel = rel.replace(/\.ts$/, "");
    return ensureRelativeImportPath(rel);
  }

  private getModuleObjectLiteral(
    sourceFilePath: string,
    project: Project
  ): { sf: SourceFile; moduleObj: ObjectLiteralExpression } {
    const sf = project.addSourceFileAtPath(sourceFilePath);

    const moduleDecorator = sf
      .getDescendantsOfKind(SyntaxKind.Decorator)
      .find((decorator) => {
        const expr = decorator.getExpression();
        if (expr.getKind() !== SyntaxKind.CallExpression) return false;
        const call = expr.asKindOrThrow(SyntaxKind.CallExpression);
        return call.getExpression().getText() === "Module";
      });

    if (!moduleDecorator) {
      throw new Error(`No @Module() decorator found in ${sourceFilePath}`);
    }

    const callExpr = moduleDecorator
      .getExpression()
      .asKindOrThrow(SyntaxKind.CallExpression);
    const arg0 = callExpr.getArguments()[0];
    if (!arg0 || arg0.getKind() !== SyntaxKind.ObjectLiteralExpression) {
      throw new Error(
        `@Module() first argument is not an object literal in ${sourceFilePath}`
      );
    }

    return { sf, moduleObj: arg0 as ObjectLiteralExpression };
  }

  private ensureArrayProperty(
    moduleObj: ObjectLiteralExpression,
    prop: NestModuleProperty
  ): { arr: ArrayLiteralExpression; created: boolean } {
    const existing = moduleObj.getProperty(prop);
    if (existing) {
      if (existing.getKind() !== SyntaxKind.PropertyAssignment) {
        throw new Error(
          `@Module() property '${prop}' is not a standard property assignment; cannot edit it automatically.`
        );
      }
      const pa = existing.asKindOrThrow(SyntaxKind.PropertyAssignment);
      const init = pa.getInitializer();
      if (!init || init.getKind() !== SyntaxKind.ArrayLiteralExpression) {
        throw new Error(
          `@Module() property '${prop}' is not an array literal; cannot register the symbol automatically.`
        );
      }
      return { arr: init as ArrayLiteralExpression, created: false };
    }

    moduleObj.addPropertyAssignment({ name: prop, initializer: "[]" });

    const created = moduleObj
      .getPropertyOrThrow(prop)
      .asKindOrThrow(SyntaxKind.PropertyAssignment);
    const arr = created
      .getInitializerOrThrow()
      .asKindOrThrow(SyntaxKind.ArrayLiteralExpression);
    return { arr, created: true };
  }

  private ensureNamedImport(
    sf: SourceFile,
    symbolName: string,
    importFrom: string
  ): boolean {
    const existing = sf
      .getImportDeclarations()
      .find((decl) => decl.getModuleSpecifierValue() === importFrom);

    if (existing) {
      const named = existing.getNamedImports().map((n) => n.getName());
      if (!named.includes(symbolName)) {
        existing.addNamedImport(symbolName);
        return true;
      }
      return false;
    }

    sf.addImportDeclaration({
      moduleSpecifier: importFrom,
      namedImports: [symbolName],
    });
    return true;
  }

  private ensureSymbolInArray(
    arr: ArrayLiteralExpression,
    symbolName: string
  ): boolean {
    const items = arr.getElements().map((el) => el.getText());
    if (!items.includes(symbolName)) {
      arr.addElement(symbolName);
      return true;
    }
    return false;
  }
}

/**
 * Shared singleton. The editor is stateless, so one instance is enough.
 */
export const nestModuleEditor = new NestModuleEditor();
