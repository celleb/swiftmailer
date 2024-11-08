import path from "path";
import { beforeAll, describe, expect, it } from "vitest";
import { Templ } from "./templ";

const templatesDir = path.join(__dirname, "../__tests__/templates");

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
      expect(result).toEqual("<div><p>Welcome back!</p></div>");
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
        new Error("Invalid HTML content before rendering")
      );
    });

    it("throws an error if the template has mismatched tags", async () => {
      const template = "<div><p>Text</div></p>";
      await expect(parser.render(template, {})).rejects.toThrow(
        new Error("Invalid HTML content before rendering")
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

    it("sanitizes rendered data to prevent HTML injection", async () => {
      const template = "<p>Hello, {{name}}!</p>";
      const data = { name: "<script>alert('XSS');</script>" };
      const result = await parser.render(template, data);
      expect(result).toEqual(
        "<p>Hello, &lt;script&gt;alert(&#39;XSS&#39;);&lt;/script&gt;!</p>"
      );
    });

    it("sanitizes rendered data within loops", async () => {
      const template = "<ul>{{#each items}}<li>{{this}}</li>{{/each}}</ul>";
      const data = { items: ["<b>Bold</b>", "<i>Italic</i>"] };
      const result = await parser.render(template, data);
      expect(result).toEqual(
        "<ul><li>&lt;b&gt;Bold&lt;/b&gt;</li><li>&lt;i&gt;Italic&lt;/i&gt;</li></ul>"
      );
    });

    it("sanitizes rendered data within conditionals", async () => {
      const template = "<div>{{#if show}}<p>{{message}}</p>{{/if}}</div>";
      const data = {
        show: true,
        message: "<img src='x' onerror='alert(1)' />",
      };
      const result = await parser.render(template, data);
      expect(result).toEqual(
        "<div><p>&lt;img src=&#39;x&#39; onerror=&#39;alert(1)&#39; /&gt;</p></div>"
      );
    });

    it("renders empty string for undefined variables", async () => {
      const template = "<p>Hello, {{undefinedVar}}!</p>";
      const data = {};
      const result = await parser.render(template, data);
      expect(result).toEqual("<p>Hello, !</p>");
    });

    it("it renders scripts and css correctly", async () => {
      const template = `<html>
      <head>
        <script src="{{script}}"></script>
        <style>body { background-color: red; }</style>
      </head>
      <body></body>
      </html>`;
      const result = await parser.render(template, {
        script: "script.js",
      });
      expect(result).toMatchInlineSnapshot(`
        "<html>
              <head>
                <script src="script.js"></script>
                <style>body { background-color: red; }</style>
              </head>
              <body></body>
              </html>"
      `);
    });

    it("validate html with doctype correctly", async () => {
      const template = "<!DOCTYPE html><html><head></head><body></body></html>";
      const result = await parser.render(template, {});
      expect(result).toEqual(template);
    });

    it("embeds CSS correctly", async () => {
      const template = "<html><body><p>Hello, {{name}}!</p></body></html>";
      const css = "styles.css";
      const data = { name: "Alice" };
      const result = await parser.render(template, data, { css });

      expect(result).toMatchInlineSnapshot(`
        "<html>
        <head>
        <style>p {
          color: blue;
        }
        </style>
        </head><body>
        <style>p {
          color: blue;
        }
        </style>
        <p>Hello, Alice!</p></body></html>"
      `);
    });

    it("embeds CSS correctly when the head is present", async () => {
      const template = `<html>
      <head>
        <style>p { color: yellow; }</style>
        <link rel="stylesheet" href="styles.css">
      </head>
      <body><p>Hello, {{name}}!</p></body>
      </html>`;
      const css = "styles.css";
      const data = { name: "Alice" };
      const result = await parser.render(template, data, { css });
      expect(result).toMatchInlineSnapshot(`
        "<html>
              <head>
        <style>p {
          color: blue;
        }
        </style>

                <style>p { color: yellow; }</style>
                <link rel="stylesheet" href="styles.css">
              </head>
              <body>
        <style>p {
          color: blue;
        }
        </style>
        <p>Hello, Alice!</p></body>
              </html>"
      `);
    });

    it("embeds CSS correctly when there is no head or body", async () => {
      const template = "<html><p>Hello, {{name}}!</p></html>";
      const css = "styles.css";
      const data = { name: "Alice" };
      const result = await parser.render(template, data, { css });
      expect(result).toMatchInlineSnapshot(`
        "<html>
        <head>
        <style>p {
          color: blue;
        }
        </style>
        </head><p>Hello, Alice!</p></html>"
      `);
    });

    it("embeds CSS correctly when there is not html tag", async () => {
      const template = "<p>Hello, {{name}}!</p>";
      const css = "styles.css";
      const data = { name: "Alice" };
      const result = await parser.render(template, data, { css });
      expect(result).toMatchInlineSnapshot(`
        "<style>p {
          color: blue;
        }
        </style>
        <p>Hello, Alice!</p>"
      `);
    });

    it("renders a full template correctly", async () => {
      const data = {
        name: "John Doe",
        isMember: true,
        items: ["Item 1", "Item 2"],
        script: "script.js",
      };
      const result = await parser.render("test.html", data, {
        css: "styles.css",
      });
      expect(result).toMatchInlineSnapshot(`
        "<!DOCTYPE html>
        <html>
          <head>
        <style>p {
          color: blue;
        }
        </style>

            <title>Test</title>
            <link rel="stylesheet" href="styles.css" />
            <script src="script.js"></script>
            <script src="script.js"></script>
          </head>
          <body>
        <style>p {
          color: blue;
        }
        </style>

            <h1 class="name">John Doe</h1>
            <img src="image.png" />
            <br />
            <div />
            
            <p>Item 1 John Doe</p>
            
            <p>Item 2 John Doe</p>
              
            <div><footer>
          <p>
            Contact us at
            <a href="mailto:support@swiftmailer.com">support@swiftmailer.com</a>
          </p>
          <p>&copy; 2023 SwiftMailer. All rights reserved.</p>
        </footer>
        </div>
          </body>
        </html>
        "
      `);
    });
  });
});
