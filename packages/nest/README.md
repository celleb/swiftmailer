# @swiftmail/nest

<p align="center">
  <img src="https://static.mrcelleb.com/swiftmail/logo.png" alt="SwiftMail" width="200">
</p>

## Overview

A NestJS module for sending authentication emails using `@swiftmail/mail`. `@swiftmail/mail` is a library for sending html emails, with a special focus on authentication emails.
For more information about `@swiftmail/mail`, see the [`@swiftmail/mail`](https://github.com/celleb/swiftmail#readme).

## Installation

```bash
npm install @swiftmail/nest
```

## Usage

### Importing the Module

In your `AppModule`, import the `SwiftMailModule` and configure it with your SMTP settings.
By default, the module will use the environment variables `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, and `SMTP_PASS` to configure the SMTP connection. If `SMTP_URL` is set in the environment, it will be used instead. If `SMTP_FROM` is set, it will be used as the default sender email address.

```typescript
import { Module } from "@nestjs/common";
import { SwiftMailModule } from "@swiftmail/nest";

@Module({
  imports: [
    SwiftMailModule.forRoot({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || "587", 10),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
})
export class AppModule {}
```

### Using the Service

Inject the `SwiftMailService` into your controllers or services to send authentication or any other emails.

```typescript
import { Controller, Post, Body } from "@nestjs/common";
import { SwiftMailService } from "@swiftmail/nest";

@Controller("email")
export class EmailController {
  constructor(private readonly swiftMailService: SwiftMailService) {}

  @Post("send")
  async sendEmail(@Body() body: any) {
    const { to, subject, html } = body;
    return this.swiftMailService.sendWelcomeEmail(
      { to, subject, html },
      {
        name: "Jon Manga",
        link: "https://swiftmail.io",
        companyName: "SwiftMail",
        logo: "https://static.mrcelleb.com/swiftmail/logo.png",
      }
    );
  }
}
```

Under the hood, `@swiftmail/mail` uses nodemailer to send emails, so you can use any of the methods like `sendMail`.

### SwiftMailService methods

#### `sendWelcomeEmail`

Generates and sends a welcome email.

#### `getWelcomeEmailHtml`

Renders and returns the html for a welcome email.

#### `sendConfirmationEmail`

Generates and sends a confirmation email.

#### `getConfirmationEmailHtml`

Renders and returns the html for a confirmation email.

#### `sendPasswordResetEmail`

Generates and sends a password reset email.

#### `getPasswordResetEmailHtml`

Renders and returns the html for a password reset email.

#### `sendPasswordlessLoginEmail`

Generates and sends a passwordless login email.

#### `getPasswordlessLoginEmailHtml`

Renders and returns the html for a passwordless login email.

#### `sendAcceptInvitationEmail`

Generates and sends an accept invitation email.

#### `getAcceptInvitationEmailHtml`

Renders and returns the html for an accept invitation email.

#### `sendPasswordInvitationEmail`

Generates and sends a password invitation email.

#### `getPasswordInvitationEmailHtml`

Renders and returns the html for a password invitation email.

#### `sendWelcomeWithCredentialsEmail`

Generates and sends a welcome with credentials email.

#### `getWelcomeWithCredentialsEmailHtml`

Renders and returns the html for a welcome with credentials email.

#### `sendMail`

Sends an email using nodemailer's `sendMail` method.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
