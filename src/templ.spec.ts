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
    it("correctly renders variables", async () => {
      const template = "<p>Hello, {{name}}!</p>";
      const data = { name: "John" };
      const result = await parser.render(template, data);
      expect(result).toEqual("<p>Hello, John!</p>");
    });

    it("correctly renders loops", async () => {
      const template = '<ul><li *for="item of items">{{item.name}}</li></ul>';
      const data = { items: [{ name: "Item 1" }, { name: "Item 2" }] };
      const result = await parser.render(template, data);
      expect(result).toEqual("<ul><li>Item 1</li><li>Item 2</li></ul>");
    });

    it("correctly renders process array loop with scalars", async () => {
      const template = '<ul><li *for="item of items">{{item}}</li></ul>';
      const data = { items: ["Item 1", "Item 2"] };
      const result = await parser.render(template, data);
      expect(result).toEqual("<ul><li>Item 1</li><li>Item 2</li></ul>");
    });

    it("correctly renders conditionals", async () => {
      const template = '<div><p *if="isMember">Welcome back!</p></div>';
      const data = { isMember: true };
      const result = await parser.render(template, data);
      expect(result).toEqual("<div><p>Welcome back!</p></div>");
    });

    it("correctly processes includes", async () => {
      const template = '<div><p>Content</p><include src="footer.html"/></div>';
      const result = await parser.render(template, {});
      expect(result).toMatchInlineSnapshot(`
        "<div><p>Content</p><footer>
          <p>&copy; 2023 SwiftMailer. All rights reserved.</p>
        </footer>
        </div>"
      `);
    });

    it("correctly renders a full template", async () => {
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
      const template = "<ul><li *for='item of items'>{{item}}</li></ul>";
      const data = { items: ["<b>Bold</b>", "<i>Italic</i>"] };
      const result = await parser.render(template, data);
      expect(result).toEqual(
        "<ul><li>&lt;b&gt;Bold&lt;/b&gt;</li><li>&lt;i&gt;Italic&lt;/i&gt;</li></ul>"
      );
    });

    it("sanitizes rendered data within conditionals", async () => {
      const template = "<div><p *if='show'>{{message}}</p></div>";
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

    it("correctly renders scripts and css", async () => {
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

    it("correctly validates html with doctype", async () => {
      const template = "<!DOCTYPE html><html><head></head><body></body></html>";
      const result = await parser.render(template, {});
      expect(result).toEqual(template);
    });

    it("correctly embeds CSS", async () => {
      const template = "<html><body><p>Hello, {{name}}!</p></body></html>";
      const css = ["styles.css"];
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

    it("correctly embeds CSS when the head is present", async () => {
      const template = `<html>
      <head>
        <style>p { color: yellow; }</style>
        <link rel="stylesheet" href="styles.css">
      </head>
      <body><p>Hello, {{name}}!</p></body>
      </html>`;
      const css = ["styles.css"];
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

    it("correctly renders conditionals in loops", async () => {
      const template =
        "<p *for='item of items'><span *if='item'>Test {{item}}</span></p>";
      const data = { items: ["Item 1", "Item 2"] };
      const result = await parser.render(template, data);
      expect(result).toEqual(
        "<p><span>Test Item 1</span></p><p><span>Test Item 2</span></p>"
      );
    });

    it("correctly renders conditionals in loops with objects variables", async () => {
      const template =
        "<p *for='item of items'><span *if='item.render'>Test {{item.name}}</span></p>";
      const data = {
        items: [
          { name: "Item 1", render: true },
          { name: "Item 2", render: false },
        ],
      };
      const result = await parser.render(template, data);
      expect(result).toEqual("<p><span>Test Item 1</span></p><p></p>");
    });

    it("correctly renders conditionals with objects in loops", async () => {
      const template = "<div><p *if='item.render'>Test {{item.name}}</p></div>";
      const data = {
        item: { name: "Item 1", render: true },
      };
      const result = await parser.render(template, data);
      expect(result).toEqual("<div><p>Test Item 1</p></div>");
    });

    it("correctly embeds CSS when there is no head or body", async () => {
      const template = "<html><p>Hello, {{name}}!</p></html>";
      const css = ["styles.css"];
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

    it("correctly renders if conditionals have children with similar tags", async () => {
      const template = `
      <div>
      <div *if='data' class='test' id='{{id}}'>
        <div>
          <div>{{data}}</div>
        </div>
      </div>
      </div>`;
      const data = { data: false, id: "test" };
      const result = await parser.render(template, data);
      expect(result).toMatchInlineSnapshot(`
        "
              <div>
              
              </div>"
      `);
    });

    it("correctly renders if loops have children with similar tags", async () => {
      const template =
        "<div *for='item of items' class='red' id='{{item}}'><div>{{item}}</div></div>";
      const data = { items: ["Item 1", "Item 2"] };
      const result = await parser.render(template, data);
      expect(result).toEqual(
        "<div class='red' id='Item 1'><div>Item 1</div></div><div class='red' id='Item 2'><div>Item 2</div></div>"
      );
    });

    it("correctly embeds CSS when there is not html tag", async () => {
      const template = "<p>Hello, {{name}}!</p>";
      const css = ["styles.css"];
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

    it("correctly renders conditionals with !", async () => {
      const template = "<p *if='!isMember'>{{name}}</p>";
      const data = { isMember: false, name: "Alice" };
      const result = await parser.render(template, data);
      expect(result).toEqual("<p>Alice</p>");
    });

    it("does not render if negation conditions is false", async () => {
      const template = "<div><p *if='!isMember'>{{name}}</p></div>";
      const data = { isMember: true, name: "Alice" };
      const result = await parser.render(template, data);
      expect(result).toEqual("<div></div>");
    });

    it("throws an error if the loop variable is not an array", async () => {
      const template = "<p *for='item of items'>{{item}}</p>";
      const data = { items: "not an array" };
      await expect(parser.render(template, data)).rejects.toEqual(
        new TypeError(`Expected array for *for="item of items", got string`)
      );
    });

    it("correctly renders multiple css files", async () => {
      const template = "<html><body><p>Hello, {{name}}!</p></body></html>";
      const css = ["styles.css", "other.css"];
      const data = { name: "Alice" };
      const result = await parser.render(template, data, { css });
      expect(result).toMatchInlineSnapshot(`
        "<html>
        <head>
        <style>p {
          color: blue;
        }
        </style>

        <style>.green {
          color: green;
        }
        </style>
        </head><body>
        <style>p {
          color: blue;
        }
        </style>

        <style>.green {
          color: green;
        }
        </style>
        <p>Hello, Alice!</p></body></html>"
      `);
    });

    it("correctly renders the test.html template", async () => {
      const data = {
        user: {
          name: "Jon Manga",
          isMember: true,
          roles: ["Role 1", "Role 2"],
        },
        city: "Oshikuku",
        country: "Namibia",
        isFavorite: true,
        isFalse: false,
        contributors: ["Contributor 1", "Contributor 2"],
        projects: [
          { name: "Project 1", roles: ["Role 1", "Role 2"] },
          { name: "Project 2", roles: ["Role 3", "Role 4"] },
        ],
        groups: [["Group 1", "Group 2"]],
        roles: ["Role 1", "Role 2"],
        sites: ["Site 1", "Site 2"],
        script: "script.js",
      };
      const result = await parser.render("test.html", data, {
        css: ["styles.css"],
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
            <!-- variables in attributes-->
            <script src="script.js"></script>
          </head>
          <body>
        <style>p {
          color: blue;
        }
        </style>

            <h1>This is a test template to test the templating engine</h1>
            <h2>Include tag</h2>
            <header>
          <h2>SwiftMailer</h2>
        </header>

            <h2>Variables in text</h2>
            <h2>Oshikuku is a small town in Namibia</h2>
            <h2>Self closing tags</h2>
            <img src="image.png" />
            <br />
            <div />
            <h2>For loop</h2>
            <h2>
              For loop with variables in control tag attribute, if nested in a loop
            </h2>
            <ul>
              <li class="red" id="Site 1">
                Site 1
                <span class="blue">Site 1 Oshikuku</span>
              </li><li class="red" id="Site 2">
                Site 2
                <span class="blue">Site 2 Oshikuku</span>
              </li>
            </ul>
            <h2>Truthy if tag: to be rendered</h2>
            <p>Town Oshikuku is my favorite town</p>
            <h2>Falsy if tag: not to be rendered</h2>
            
            <h2>Include nested in an if tag: not to be rendered</h2>
            
            <h2>For loop with nested loop control tag</h2>
            <div>
              <div>Contributor 1</div>
            </div><div>
              <div>Contributor 2</div>
            </div>
            <h2>Object variable</h2>
            <div>Jon Manga</div>
            <h2>Object variable in a if tag</h2>
            
            <h2>Object variable in a for loop text</h2>
            <ul>
              <li>Project 1</li><li>Project 2</li>
            </ul>
            <h2>Loop from object property</h2>
            <ul>
              <li>Role 1</li><li>Role 2</li>
            </ul>
            <h2>Nested loop</h2>
            <!-- <ul>
              <li *for="project of projects">
                <div *for="role of project.roles">{{role}}</div>
              </li>
            </ul> -->
            <ul>
              <li>
                <div>Role 1</div><div>Role 2</div>
              </li><li>
                <div>Role 3</div><div>Role 4</div>
              </li>
            </ul>
            <h2>Another nested loop</h2>
            <ul>
              <li>
                <div>Group 1</div><div>Group 2</div>
              </li>
            </ul>
            <h2>Loop nested inside an if tag</h2>
            <ul>
              <li>Project 1</li><li>Project 2</li>
            </ul>
            <h2>Loop nested inside an if tag with falsy condition</h2>
            
            <h2>Loop with an if tag</h2>
            <div>Project 1</div><div>Project 2</div>
            <h2>Nested include</h2>
            <div>
              <footer>
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
