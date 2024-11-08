import { promises as fs } from "fs";
import path from "path";
export type TemplRenderOptions = {
  css?: string;
};
export class Templ {
  private templatesDir: string;
  private voidElements: Set<string>;

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
    { css }: TemplRenderOptions = {}
  ): Promise<string> {
    let templateContent: string;
    if (template.endsWith(".html")) {
      const templatePath = path.join(this.templatesDir, template);
      templateContent = await this.loadFile(templatePath);
    } else {
      templateContent = template;
    }

    if (!this.isValidHTML(templateContent)) {
      throw new Error("Invalid HTML content before rendering");
    }

    templateContent = await this.processIncludes(templateContent);
    templateContent = this.processLoops(templateContent, data);
    templateContent = this.processConditionals(templateContent, data);
    let html = this.renderVariables(templateContent, data);

    if (css) {
      const cssPath = path.join(this.templatesDir, css);
      const cssContent = await this.loadFile(cssPath);
      html = this.embedCSS(html, cssContent);
    }

    if (!this.isValidHTML(html)) {
      throw new Error("Invalid HTML content after rendering");
    }

    return html;
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
          return false; // Mismatched or unbalanced tag
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
    return template.replace(/{{([\w.]+)}}/g, (_, key) => {
      const keys = key.split(".");
      let value = data;
      for (const k of keys) {
        value = value[k];
        if (value === undefined) return "";
      }
      return this.escapeHTML(String(value));
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
    const includePattern = /{{include\s+(.+?)}}/g;
    const matches = template.matchAll(includePattern);
    for (const match of matches) {
      const includePath = match[1].trim();
      const includeFilePath = path.join(this.templatesDir, includePath);
      const includeContent = await this.loadFile(includeFilePath);
      template = template.replace(match[0], includeContent);
    }
    return template;
  }

  private processLoops(template: string, data: any): string {
    return template.replace(
      /{{#each\s+(\w+)}}([\s\S]+?){{\/each}}/g,
      (_, arrayName, loopContent) => {
        const array = data[arrayName];
        if (!Array.isArray(array)) return "";
        return array
          .map((item) =>
            this.renderVariables(loopContent, { ...data, this: item })
          )
          .join("");
      }
    );
  }

  private processConditionals(template: string, data: any): string {
    return template.replace(
      /{{#if\s+(\w+)}}([\s\S]+?){{\/if}}/g,
      (_, condition, content) => {
        return data[condition] ? content : "";
      }
    );
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

    // If no <head> or <html> tag, prepend the style
    return `${styleTag}\n${html}`;
  }
}
