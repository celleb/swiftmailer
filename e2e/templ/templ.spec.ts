import { Templ } from "@swiftmail/templ";

describe("TemplateParser", () => {
  let parser: Templ;

  beforeAll(() => {
    parser = new Templ({
      baseDir: __dirname,
    });
  });

  describe("render", () => {
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
      const result = await parser.render("templates/test.html", data, {
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
          <h2>SwiftMail</h2>
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
          <p>&copy; 2023 SwiftMail. All rights reserved.</p>
        </footer>

            </div>
          </body>
        </html>
        "
      `);
    });
  });
});
