import Handlebars from "handlebars";

/**
 * Register the naming helpers used by the `.hbs` templates.
 *
 * The helpers are idempotent and only registered once per process.
 */
export function registerNamingHelpers(): void {
  if ((Handlebars.helpers as Record<string, unknown>).KEBABCASE) return;

  Handlebars.registerHelper("LOWERCASE", (value: unknown) =>
    value == null ? "" : String(value).toLowerCase()
  );

  Handlebars.registerHelper("UPPERCASE", (value: unknown) =>
    value == null ? "" : String(value).toUpperCase()
  );

  Handlebars.registerHelper("KEBABCASE", (value: unknown) =>
    splitWords(value)
      .map((word) => word.toLowerCase())
      .join("-")
  );

  Handlebars.registerHelper("CAMELCASE", (value: unknown) => {
    const parts = splitWords(value);
    if (!parts.length) return "";
    const joined = parts.map((part) => capitalize(part.toLowerCase())).join("");
    return lowerFirst(joined);
  });

  Handlebars.registerHelper("PASCALCASE", (value: unknown) =>
    splitWords(value)
      .map((part) => capitalize(part.toLowerCase()))
      .join("")
  );

  Handlebars.registerHelper("UPPERSNAKECASE", (value: unknown) =>
    splitWords(value)
      .map((part) => part.toUpperCase())
      .join("_")
  );
}

function splitWords(value: unknown): string[] {
  const str = String(value ?? "");
  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_\-]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function capitalize(word: string): string {
  return word ? word.charAt(0).toUpperCase() + word.slice(1) : "";
}

function lowerFirst(word: string): string {
  return word ? word.charAt(0).toLowerCase() + word.slice(1) : "";
}
