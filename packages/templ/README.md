# @swiftmail/templ

<p align="center">
  <img src="https://static.mrcelleb.com/swiftmail/logo.png" alt="SwiftMail" width="200">
</p>

## Introduction

A system for creating and rendering HTML templates with HTML, specifically tailored for emails. It supports variables, loops, conditionals, includes, and CSS embedding, ensuring compatibility across various email clients by handling CSS appropriately and sanitizing dynamic content to prevent HTML injection.

<p align="center">
  <img src="https://static.mrcelleb.com/swiftmail/password-reset.png" alt="SwiftMail" >
</p>

## Installation

```bash
npm install @swiftmail/templ
```

## Usage

To render a template, use the `render` method provided by the `Templ` class. You can optionally specify a CSS file to embed styles into the HTML.

### Example

```typescript
import path from "path";
import { Templ } from "./templ";

const templatesDir = path.join(__dirname, "templates");
const parser = new Templ(templatesDir);

const data = {
  name: "Alice",
};

const htmlContent = await parser.render("styles-embedding.html", data, {
  css: ["styles.css"],
});
console.log(htmlContent);
```

## Templ Options

The `Templ` class constructor accepts the following options:

- `baseDir`: The base directory for your templates.

## Template Syntax

### Variables

Use `{{var}}` to output variable values:

```html
<p>Hello, {{var}}!</p>
```

### Loops

Use the `*for` attribute for iteration:

```html
<ul>
  <li *for="item of items">{{item.name}}</li>
</ul>
```

You can also nest loops:

```html
<ul>
  <div *for="list of items">
    <ul>
      <li *for="item of list">{{item.name}}</li>
    </ul>
  </div>
</ul>
```

### Conditionals

Use the `*if` attribute for conditional rendering:

```html
<div>
  <p *if="isMember">Welcome back!</p>
</div>
```

`*if` only accepts boolean, truthy values, and falsy values. You can use the `!` operator to negate the condition, e.g. `<span *if="!isMember">Not a member</span>`.

### Includes

Use the self-closing `<include/>` tag to embed other templates:

```html
<include src="header.html" />
<p>Main content here</p>
<include src="footer.html" />
```

## CSS Embedding

To embed CSS styles from a CSS file into your HTML templates, provide the CSS file name as an option to the `render` method. The engine will include `<style>` tags in both `<head>` and `<body>` for better compatibility.

**Example**:

```html
<!-- template.html -->
<html>
  <head>
    <title>Welcome</title>
  </head>
  <body>
    <p class="red">This is red</p>
  </body>
</html>
```

```css
/* styles.css */
p.red {
  color: red;
}
```

```typescript
import path from "path";
import { Templ } from "./templ";

const templatesDir = path.join(__dirname, "templates");
const parser = new Templ(templatesDir);

const data = {
  name: "Alice",
};

const htmlContent = await parser.render("template.html", data, {
  css: ["styles.css"],
});
console.log(htmlContent);
```

**Rendered Output**:

```html
<html>
  <head>
    <title>Welcome</title>
    <style>
      p.red {
        color: red;
      }
    </style>
  </head>
  <body>
    <style>
      p.red {
        color: red;
      }
    </style>
    <p class="red">This is red</p>
  </body>
</html>
```

## `Templ.render` Parameters

| Parameter  | Type                 | Description                                             |
| ---------- | -------------------- | ------------------------------------------------------- |
| `template` | string               | The template to render, either a string or a file path. |
| `data`     | object               | An object containing data to be used in the template.   |
| `options`  | `TemplRenderOptions` | _(optional)_ An object containing additional options.   |

#### `TemplRenderOptions`

| Option    | Type     | Description                                                     |
| --------- | -------- | --------------------------------------------------------------- |
| `css`     | string[] | _(optional)_ An array of CSS file names to embed into the HTML. |
| `baseDir` | string   | _(optional)_ The base directory for your templates.             |

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
