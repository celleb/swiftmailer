# SwiftMailer

SwiftMailer is a Node.js package for sending authentication emails, including welcome emails, password reset emails, and passwordless login emails. It supports both NestJS and non-NestJS projects, providing a NestJS module for easy integration.

## Features

- Send welcome, password reset, and passwordless login emails.
- HTML templates with default content.
- Configurable email provider settings.
- Works with major email providers.
- Easy integration with NestJS.

## Installation

```bash
npm install swiftmailer
```

## Usage

### Non-NestJS Projects

```javascript
const { swiftmailer } = require("swiftmailer");

swiftmailer.sendWelcomeEmail("user@example.com", { name: "User" });
```

### NestJS Projects

1. Import `SwiftMailerModule` in your module:

   ```typescript
   import { Module } from "@nestjs/common";
   import { SwiftMailerModule } from "swiftmailer/nest";

   @Module({
     imports: [SwiftMailerModule],
   })
   export class AppModule {}
   ```

2. Inject `EmailService` where needed:

   ```typescript
   import { Injectable } from "@nestjs/common";
   import { EmailService } from "swiftmailer";

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
