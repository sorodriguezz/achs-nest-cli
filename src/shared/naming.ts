/**
 * Naming convention utilities used by the path resolver and the
 * Handlebars helpers. Kept framework-agnostic on purpose.
 */

export type NamingConvention =
  | "KEBABCASE"
  | "PASCALCASE"
  | "CAMELCASE"
  | "UPPERSNAKECASE"
  | "UPPERCASE"
  | "LOWERCASE"
  | "LOWERSNAKECASE";

export function toKebabCase(input: string): string {
  return input
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

export function toPascalCase(input: string): string {
  return toKebabCase(input)
    .split("-")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join("");
}

export function toCamelCase(input: string): string {
  const pascal = toPascalCase(input);
  return pascal ? pascal.charAt(0).toLowerCase() + pascal.slice(1) : pascal;
}

export function toUpperSnakeCase(input: string): string {
  return toKebabCase(input).replace(/-/g, "_").toUpperCase();
}

export function toUpperCase(input: string): string {
  return toKebabCase(input).replace(/-/g, "").toUpperCase();
}

export function toLowerCase(input: string): string {
  return toKebabCase(input).replace(/-/g, "");
}

export function toLowerSnakeCase(input: string): string {
  return toKebabCase(input).replace(/-/g, "_");
}

export const namingFunctions: Record<NamingConvention, (input: string) => string> = {
  KEBABCASE: toKebabCase,
  PASCALCASE: toPascalCase,
  CAMELCASE: toCamelCase,
  UPPERSNAKECASE: toUpperSnakeCase,
  UPPERCASE: toUpperCase,
  LOWERCASE: toLowerCase,
  LOWERSNAKECASE: toLowerSnakeCase,
};

/**
 * Ensures an import specifier is explicitly relative (prefixed with `./`).
 */
export function ensureRelativeImportPath(specifier: string): string {
  return specifier.startsWith(".") ? specifier : `./${specifier}`;
}
