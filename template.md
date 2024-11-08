# Template System Documentation

## Introduction

The Template System is a versatile engine designed to render HTML templates with dynamic data. It supports variables, loops, conditionals, includes, and CSS embedding, ensuring compatibility across various email clients by handling CSS appropriately and sanitizing dynamic content to prevent HTML injection.

## Features

- **Variables**: Dynamically replace placeholders with data.
- **Loops**: Iterate over arrays to generate repeated content.
- **Conditionals**: Render content based on boolean conditions.
- **Includes**: Embed other HTML files into templates.
- **CSS Embedding**: Embed CSS styles in both `<head>` and `<body>` for better email client compatibility.
- **Sanitization**: Prevent HTML injection by sanitizing rendered data.

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
  css: "styles.css",
});
console.log(htmlContent);
```

## Template Syntax

### Variables

Replace placeholders with dynamic data using `{{variableName}}`.

```html
<p>Hello, {{name}}!</p>
```

### Loops

Use `{{#each arrayName}}...{{/each}}` to iterate over an array.

**Example**:

```html
<ul>
  {{#each items}}
  <li>{{this}}</li>
  {{/each}}
</ul>
```

### Conditionals

Render content based on boolean conditions using `{{#if condition}}...{{/if}}`.

**Example**:

```html
{{#if isMember}}
<p>Welcome back!</p>
{{/if}}
```

### Includes

Embed another HTML file using `{{include fileName.html}}`.

**Example**:

```html
{{include header.html}}
<p>Welcome to our service!</p>
{{include footer.html}}
```

## CSS Embedding

To embed CSS styles from a CSS file into your HTML templates, provide the CSS file name as an option to the `render` method. The engine will include `<style>` tags in both `<head>` and `<body>` for better compatibility.

**Example**:

```html
<!-- styles-embedding.html -->
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

const htmlContent = await parser.render("styles-embedding.html", data, {
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

## Template Files

Place your HTML templates in the `src/templates` directory. Ensure that included files are also located in this directory.

### Example Template

**`welcome.html`**:

```html
{{include header.html}}
<h1>Welcome, {{name}}!</h1>
<p>Thank you for joining us.</p>
<ul>
  {{#each items}}
  <li>{{this}}</li>
  {{/each}}
</ul>
{{include footer.html}}
```

## Additional Notes

- **Error Handling**: Ensure that the specified CSS file exists. The current implementation throws an error if the CSS file fails to load.

## References

For more information on CSS support in email clients, refer to [Campaign Monitor's Ultimate Guide to CSS](https://www.campaignmonitor.com/css/style-element/style-in-body/).
