import fs from "node:fs";
import path from "node:path";

import Handlebars from "handlebars";

import { registerNamingHelpers } from "./handlebars-helpers";

registerNamingHelpers();

export type TemplateScope = "generate";

export interface TemplateRenderInput {
  scope: TemplateScope;
  framework: string;
  template: string;
  data: Record<string, unknown>;
}

/**
 * Roots that are probed when searching for a template. The order matters:
 * the current working directory wins, which lets users override a template
 * by dropping a `templates/` folder in their project root.
 *
 * Note: `__dirname` is resolved from the final bundle (`dist/bin.js`).
 */
const templateRootCandidates = (): string[] => [
  path.resolve(process.cwd(), "templates"),
  path.resolve(__dirname, "..", "..", "..", "templates"),
  path.resolve(__dirname, "..", "..", "templates"),
  path.resolve(__dirname, "..", "templates"),
];

function getTemplateRoots(): string[] {
  const seen = new Set<string>();
  const roots: string[] = [];
  for (const root of templateRootCandidates()) {
    if (seen.has(root)) continue;
    seen.add(root);
    if (fs.existsSync(root)) roots.push(root);
  }
  return roots;
}

export function resolveTemplatePath(
  input: Omit<TemplateRenderInput, "data">
): string {
  const roots = getTemplateRoots();
  const relCandidates = [
    path.join(input.scope, input.framework, input.template),
    path.join(input.scope, input.template),
    input.template,
  ];

  for (const root of roots) {
    for (const rel of relCandidates) {
      const full = path.join(root, rel);
      if (fs.existsSync(full)) return full;
    }
  }

  const tried = roots.flatMap((root) =>
    relCandidates.map((rel) => path.join(root, rel))
  );
  const detail = tried.length ? `\nTried:\n- ${tried.join("\n- ")}` : "";
  throw new Error(
    `Template not found: ${input.scope}/${input.framework}/${input.template}.${detail}`
  );
}

const BINARY_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".ico",
]);

/**
 * Renders a Handlebars template at the resolved path. Binary templates are
 * returned verbatim. SVG templates are rendered with `noEscape`. Everything
 * else first wraps `{{ .xxx }}` tokens so Handlebars treats them as literal.
 */
export function renderTemplate(input: TemplateRenderInput): string | Buffer {
  const templatePath = resolveTemplatePath(input);

  const base = path.basename(templatePath);
  const withoutHbs = base.endsWith(".hbs") ? base.slice(0, -".hbs".length) : base;
  const originalExt = path.extname(withoutHbs).toLowerCase();

  if (BINARY_EXTENSIONS.has(originalExt)) {
    return fs.readFileSync(templatePath);
  }

  const raw = fs.readFileSync(templatePath, "utf8");

  if (originalExt === ".svg") {
    const tpl = Handlebars.compile(raw, { noEscape: true });
    return tpl(input.data);
  }

  const safe = raw.replace(/{{\s*\.[^}]+}}/g, (m) => `{{{{raw}}}}${m}{{{{/raw}}}}`);
  const tpl = Handlebars.compile(safe, { noEscape: true });
  return tpl(input.data);
}
