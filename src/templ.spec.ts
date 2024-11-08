import path from "path";
import { beforeAll, describe, expect, it } from "vitest";
import { Templ } from "./templ";

const templatesDir = path.join(__dirname, "templates");

describe("TemplateParser", () => {
  let parser: Templ;

  beforeAll(() => {
    parser = new Templ(templatesDir);
  });

  describe("render", () => {
    it("render variables correctly", async () => {
      const template = "<p>Hello, {{name}}!</p>";
      const data = { name: "John" };
      const result = await parser.render(template, data);
      expect(result).toEqual("<p>Hello, John!</p>");
    });

    it("process includes correctly", async () => {
      const template = "<div><p>Content</p>{{include footer.html}}</div>";
      const result = await parser.render(template, {});
      expect(result).toMatchInlineSnapshot(`
        "<div><p>Content</p><footer>
          <p>
            Contact us at
            <a href="mailto:support@swiftmailer.com">support@swiftmailer.com</a>
          </p>
          <p>&copy; 2023 SwiftMailer. All rights reserved.</p>
        </footer>
        </div>"
      `);
    });

    it("renders and processes loops correctly", async () => {
      const template =
        "<ul>{{#each items}}<li>{{this.name}}</li>{{/each}}</ul>";
      const data = { items: [{ name: "Item 1" }, { name: "Item 2" }] };
      const result = await parser.render(template, data);
      expect(result).toEqual("<ul><li>Item 1</li><li>Item 2</li></ul>");
    });

    it("renders process array loop with scalars correctly", async () => {
      const template = "<ul>{{#each items}}<li>{{this}}</li>{{/each}}</ul>";
      const data = { items: ["Item 1", "Item 2"] };
      const result = await parser.render(template, data);
      expect(result).toEqual("<ul><li>Item 1</li><li>Item 2</li></ul>");
    });

    it("renders and processes conditionals true statement correctly", async () => {
      const template = "<div>{{#if isMember}}<p>Welcome back!</p>{{/if}}</div>";
      const data = { isMember: true };
      const result = await parser.render(template, data);
      expect(result).toBe("<div><p>Welcome back!</p></div>");
    });

    it("renders and processes conditionals false statement correctly", async () => {
      const template = "<div>{{#if isMember}}<p>Welcome back!</p>{{/if}}</div>";
      const data = { isMember: false };
      const result = await parser.render(template, data);
      expect(result).toEqual("<div></div>");
    });

    it("renders a full template correctly", async () => {
      const data = {
        name: "John Doe",
        isMember: true,
        items: ["Item 1", "Item 2"],
      };
      const result = await parser.render("welcome.html", data);
      expect(result).toContain("Welcome, John Doe!");
      expect(result).toContain("We're glad to have you as a member!");
      expect(result).toContain("<li>Item 1</li>");
      expect(result).toContain("<li>Item 2</li>");
    });

    it("throws an error if the template is invalid", async () => {
      const template = ">{{in/p>";
      await expect(parser.render(template, {})).rejects.toThrow(
        "Invalid HTML content"
      );
    });

    it("throws an error if the template has mismatched tags", async () => {
      const template = "<div><p>Text</div></p>";
      await expect(parser.render(template, {})).rejects.toThrow(
        "Invalid HTML content"
      );
    });

    it("throws an error if the template has unclosed tags", async () => {
      const template = "<div><p>Text";
      await expect(parser.render(template, {})).rejects.toEqual(
        new Error("Invalid HTML content before rendering")
      );
    });

    it("validates HTML with comments correctly", async () => {
      const template = "<!-- This is a comment --><div><p>Text</p></div>";
      const result = await parser.render(template, {});
      expect(result).toEqual(
        "<!-- This is a comment --><div><p>Text</p></div>"
      );
    });

    it("validates self-closing tags correctly", async () => {
      const template = "<div><img src='image.jpg' /></div>";
      const result = await parser.render(template, {});
      expect(result).toEqual("<div><img src='image.jpg' /></div>");
    });

    it("validates a single tag correctly", async () => {
      const template = "<div/>";
      const result = await parser.render(template, {});
      expect(result).toEqual("<div/>");
    });
  });
});
