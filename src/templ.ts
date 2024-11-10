import { promises as fs } from "fs";
import path from "path";

export type TemplRenderOptions = {
  css?: string[];
};

export class Templ {
  private templatesDir: string;
  private voidElements: Set<string>;
  private uniqueIdCounter = 0;

  private readonly ifPattern = /<(\w+)\s+\*if=['"]([\w.\_]+)['"][^>]*>/;
  private readonly forPattern =
    /<(\w+)(?:\s+[^>]*?)?\s+\*for=['"]([\w]+)\s+of\s+([\w.]+)['"][^>]*>/;

  private readonly whileTimeoutRuns = 100000;

  constructor(templatesDir: string) {
    this.templatesDir = templatesDir;
    this.voidElements = new Set([
      "area",
      "base",
      "br",
      "col",
      "embed",
      "hr",
      "img",
      "input",
      "link",
      "meta",
      "param",
      "source",
      "track",
      "wbr",
    ]);
  }

  async render<T = any>(
    template: string,
    data: T,
    { css = [] }: TemplRenderOptions = {}
  ): Promise<string> {
    this.uniqueIdCounter = 0;
    let templateContent: string;
    if (template.endsWith(".html")) {
      const templatePath = path.join(this.templatesDir, template);
      templateContent = await this.loadFile(templatePath);
    } else {
      templateContent = template;
    }

    const { template: placeholderTemplate, comments } =
      this.replaceCommentsWithPlaceholders(templateContent);

    if (!this.isValidHTML(placeholderTemplate)) {
      throw new Error("Invalid HTML content before rendering");
    }

    let processedTemplate = await this.processIncludes(placeholderTemplate);
    const { html: loopedTemplate, expandedVariables } = this.processLoops(
      processedTemplate,
      data
    );
    const variables = {
      ...data,
      ...expandedVariables,
    };
    processedTemplate = this.processConditionals(loopedTemplate, variables);
    let html = this.renderVariables(processedTemplate, variables);

    for (const cssFile of css.reverse()) {
      const cssPath = path.join(this.templatesDir, cssFile);
      const cssContent = await this.loadFile(cssPath);
      html = this.embedCSS(html, cssContent);
    }

    if (!this.isValidHTML(html)) {
      throw new Error("Invalid HTML content after rendering");
    }

    return this.restoreComments(html, comments);
  }

  validateHTML(content: string): string {
    if (!this.isValidHTML(content)) {
      throw new Error("Invalid HTML content");
    }
    return content;
  }

  private isValidHTML(content: string): boolean {
    const tagStack: string[] = [];
    const tagPattern = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g;
    let match: RegExpExecArray | null;

    while ((match = tagPattern.exec(content)) !== null) {
      const tag = match[1].toLowerCase();
      const isClosingTag = match[0].startsWith("</");
      const isSelfClosing = match[0].endsWith("/>");

      if (isClosingTag) {
        if (tagStack.length === 0 || tagStack.pop() !== tag) {
          return false;
        }
      } else if (isSelfClosing || this.voidElements.has(tag)) {
        // Self-closing tag or void element, no action needed
      } else {
        tagStack.push(tag);
      }
    }

    const trimmed = content.trim();
    return (
      tagStack.length === 0 && trimmed.startsWith("<") && trimmed.endsWith(">")
    );
  }

  private escapeHTML(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  private renderVariables(template: string, data: any): string {
    return template.replace(/{{([^}]+)}}/g, (_, key) => {
      const trimmedKey = key.trim();
      const keys = trimmedKey.split(".");
      let value = data;
      for (const k of keys) {
        if (value == null) {
          value = "";
          break;
        }
        value = value[k];
      }
      return this.escapeHTML(String(value ?? ""));
    });
  }

  private async loadFile(filePath: string): Promise<string> {
    try {
      return await fs.readFile(filePath, "utf-8");
    } catch (error) {
      throw new Error(`Failed to load file ${filePath}`);
    }
  }

  private async processIncludes(template: string): Promise<string> {
    const includePattern = /<include\s+src=['"]([^'"]+)['"]\s*\/>/g;
    const matches = Array.from(template.matchAll(includePattern));
    let result = template;

    for (const match of matches) {
      const includePath = match[1].trim();
      const includeFilePath = path.join(this.templatesDir, includePath);
      const includeContent = await this.loadFile(includeFilePath);
      result = result.replace(match[0], includeContent);
    }

    return result;
  }

  private generateUniqueId(name: string): string {
    return `__loop_var_${name}__${this.uniqueIdCounter++}__`;
  }

  private findMatchingClosingTag(
    template: string,
    startIndex: number,
    tagName: string
  ): number {
    const tagPattern = new RegExp(`<${tagName}\\b[^>]*>|</${tagName}>`, "g");
    tagPattern.lastIndex = startIndex;
    let match: RegExpExecArray | null;
    let depth = 0;

    while ((match = tagPattern.exec(template)) !== null) {
      if (match[0].startsWith(`</`)) {
        depth--;
        if (depth === -1) {
          return match.index + match[0].length;
        }
      } else {
        depth++;
      }
    }

    return -1;
  }

  private processLoops(
    template: string,
    data: any
  ): { html: string; expandedVariables: Record<string, any> } {
    const expandedVariables: Record<string, any> = { ...data };
    let forMatch: RegExpMatchArray | null;
    while ((forMatch = template.match(this.forPattern)) !== null) {
      const [fullMatch, tagName, item, arrayName] = forMatch;
      const startTagEnd = forMatch.index! + fullMatch.length;
      const endTagIndex = this.findMatchingClosingTag(
        template,
        startTagEnd,
        tagName
      );

      if (endTagIndex === -1) {
        throw new Error(
          `No closing tag found for <${tagName} *for="${item}" of "${arrayName}">`
        );
      }

      const array = this.getValueFromData(expandedVariables, arrayName);

      if (!Array.isArray(array)) {
        throw new TypeError(
          `Expected array for *for="${item} of ${arrayName}", got ${typeof array}`
        );
      }

      const contentItem = template.slice(forMatch.index!, endTagIndex);

      const loopContent = array
        .map((itemValue: any) => {
          const placeholder = this.generateUniqueId(item);
          expandedVariables[placeholder] = itemValue;

          return contentItem
            .replace(
              new RegExp(`{{\\s*${item}(\\.[^}]+)?\\s*}}`, "g"),
              `{{${placeholder}$1}}`
            )
            .replace(
              new RegExp(`\\*if=['"]${item}(\\.[^'"]+)?['"]`, "g"),
              `*if="${placeholder}$1"`
            )
            .replace(
              new RegExp(
                `\\*for=['"]([^'"]+)\\s+of\\s+${item}(\\.[^'"]+)?['"]`,
                "g"
              ),
              `*for="$1 of ${placeholder}$2"`
            )
            .replace(/\s*\*for=['"][^'"]+['"]/, "");
        })
        .join("");

      template =
        template.slice(0, forMatch.index!) +
        loopContent +
        template.slice(endTagIndex);
    }

    return { html: template, expandedVariables };
  }

  private processConditionals(template: string, data: any): string {
    let ifMatch: RegExpMatchArray | null;
    while ((ifMatch = template.match(this.ifPattern)) !== null) {
      const [fullMatch, tagName, condition] = ifMatch;
      const startTagEnd = ifMatch.index! + fullMatch.length;
      const endTagIndex = this.findMatchingClosingTag(
        template,
        startTagEnd,
        tagName
      );

      if (endTagIndex === -1) {
        throw new Error(
          `No closing tag found for <${tagName} *if="${condition}">`
        );
      }

      const value = this.getValueFromData(data, condition);

      if (!value) {
        template =
          template.slice(0, ifMatch.index!) + template.slice(endTagIndex);
      } else {
        template = template.replace(
          fullMatch,
          fullMatch.replace(/\s*\*if=['"][^'"]+['"]/, "")
        );
      }
    }

    return template;
  }

  private getValueFromData(data: any, path: string): any {
    return path.split(".").reduce((acc, part) => acc && acc[part], data);
  }

  private embedCSS(html: string, css: string): string {
    const styleTag = `<style>${css}</style>`;
    const headMatch = html.match(/<head>/i);
    let result = html;
    if (headMatch) {
      result = html.replace(/<head>/i, `<head>\n${styleTag}\n`);
    }
    const bodyMatch = html.match(/<body>/i);
    if (bodyMatch) {
      result = result.replace(/<body>/i, `<body>\n${styleTag}\n`);
    }

    if (bodyMatch && headMatch) {
      return result;
    }

    const htmlTagMatch = result.match(/<html[^>]*>/i);
    if (htmlTagMatch) {
      return result.replace(/<html[^>]*>/i, `$&\n<head>\n${styleTag}\n</head>`);
    }

    return `${styleTag}\n${html}`;
  }

  private replaceCommentsWithPlaceholders(template: string): {
    template: string;
    comments: string[];
  } {
    const comments: string[] = [];
    const placeholderTemplate = template.replace(
      /<!--[\s\S]*?-->/g,
      (match) => {
        comments.push(match);
        return `<!--COMMENT_PLACEHOLDER_${comments.length - 1}-->`;
      }
    );
    return { template: placeholderTemplate, comments };
  }

  private restoreComments(template: string, comments: string[]): string {
    return template.replace(
      /<!--COMMENT_PLACEHOLDER_(\d+)-->/g,
      (_, index) => comments[parseInt(index, 10)]
    );
  }
}
