import { promises as fs } from "fs";
import path from "path";

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

  async render<T = any>(template: string, data: T): Promise<string> {
    let templateContent: string;
    if (template.endsWith(".html")) {
      const templatePath = path.join(this.templatesDir, template);
      templateContent = await this.loadTemplate(templatePath);
    } else {
      templateContent = template;
    }

    if (!this.isValidHTML(templateContent)) {
      throw new Error("Invalid HTML content before rendering");
    }

    templateContent = await this.processIncludes(templateContent);
    templateContent = this.processLoops(templateContent, data);
    templateContent = this.processConditionals(templateContent, data);
    const html = this.renderVariables(templateContent, data);

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

    // Ensure all tags are closed and the content starts and ends with valid tags
    const trimmed = content.trim();
    return (
      tagStack.length === 0 && trimmed.startsWith("<") && trimmed.endsWith(">")
    );
  }

  private async loadTemplate(filePath: string): Promise<string> {
    try {
      return await fs.readFile(filePath, "utf-8");
    } catch (error) {
      throw new Error(`Failed to load template ${filePath}`);
    }
  }

  private async processIncludes(template: string): Promise<string> {
    const includePattern = /{{include\s+(.+?)}}/g;
    const matches = template.matchAll(includePattern);
    for (const match of matches) {
      const includePath = match[1].trim();
      const includeFilePath = path.join(this.templatesDir, includePath);
      const includeContent = await this.loadTemplate(includeFilePath);
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

  private renderVariables(template: string, data: any): string {
    return template.replace(/{{([\w.]+)}}/g, (_, key) => {
      const keys = key.split(".");
      let value = data;
      for (const k of keys) {
        value = value[k];
        if (value === undefined) return "";
      }
      return value;
    });
  }
}
