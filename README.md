# SwiftMail

SwiftMail is a Node.js package for sending authentication emails, including welcome emails, password reset emails, and passwordless login emails. It supports both NestJS and non-NestJS projects, providing a NestJS module for easy integration.

## Features

- Send welcome, password reset, and passwordless login emails.
- HTML templates with default content.
- Configurable email provider settings.
- Works with major email providers.
- Easy integration with NestJS.

## Installation

```bash
npm install swiftmail
```

## Usage

### Non-NestJS Projects

```javascript
const { swiftmail } = require("swiftmail");

swiftmail.sendWelcomeEmail("user@example.com", { name: "User" });
```

### NestJS Projects

1. Import `SwiftMailModule` in your module:

   ```typescript
   import { Module } from "@nestjs/common";
   import { SwiftMailModule } from "swiftmail/nest";

   @Module({
     imports: [SwiftMailModule],
   })
   export class AppModule {}
   ```

2. Inject `EmailService` where needed:

   ```typescript
   import { Injectable } from "@nestjs/common";
   import { EmailService } from "swiftmail";

   @Injectable()
   export class UserService {
     constructor(private readonly emailService: EmailService) {}

     async sendWelcomeEmail(email: string, name: string) {
       await this.emailService.sendWelcomeEmail(email, { name });
     }
   }
   ```

## Configuration

Configure your email provider settings in the `EmailService` constructor or through environment variables.

## Templates

Customize the HTML templates located in the `src/templates` directory to fit your needs.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Template Engine Documentation

The SwiftMail package includes a simple template engine to render HTML email templates. This engine supports variable interpolation, loops, and includes, allowing you to create dynamic and reusable email templates.

### Features

- **Variable Interpolation**: Replace placeholders with data values.
- **Loops**: Iterate over arrays to generate repeated content.
- **Includes**: Embed other HTML files within a template.

### Syntax

#### Variable Interpolation

Use `{{variableName}}` to insert data values into the template.

Example:

```html
<p>Hello, {{name}}!</p>
```

#### Loops

Use `{{#each arrayName}}...{{/each}}` to iterate over an array.

Example:

```html
<ul>
  {{#each items}}
  <li>{{this}}</li>
  {{/each}}
</ul>
```

#### Includes

Use `{{include fileName.html}}` to include another HTML file.

Example:

```html
{{include header.html}}
<p>Welcome to our service!</p>
{{include footer.html}}
```

### Usage

To render a template, use the `renderTemplate` function provided by the utility.

Example:

```typescript
import { renderTemplate } from "./template.util";

const data = {
  name: "John Doe",
  items: ["Item 1", "Item 2", "Item 3"],
};

const htmlContent = renderTemplate("welcome.html", data);
```

### Template Files

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

This documentation provides an overview of the template engine's capabilities and usage, helping you create dynamic email templates efficiently.
