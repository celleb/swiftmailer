# @swiftmail/mail

<p align="center">
  <img src="https://static.mrcelleb.com/swiftmail/logo.png" alt="SwiftMail" width="200">
</p>

## Overview

Allows you to compose and send swift html emails, with a special focus on authentication emails. It provides a flexible template system and integrates with Nodemailer for email delivery.

<p align="center">
  <img src="https://static.mrcelleb.com/swiftmail/password-reset.png" alt="SwiftMail" >
</p>

## Installation

```bash
npm install @swiftmail/mail
```

## Usage

### Configuration

Configure SwiftMail with your SMTP settings.

By default, it will use the environment variables `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, and `SMTP_PASS` to configure the SMTP connection. If `SMTP_URL` is set in the environment, it will be used instead. If `SMTP_FROM` is set, it will be used as the default sender email address.

```typescript
import { SwiftMail } from "@swiftmail/mail";

const swiftMail = new SwiftMail({
  host: "smtp.swiftmail.io",
  port: 587,
  secure: false,
  auth: {
    user: "user@swiftmail.io",
    pass: "password",
  },
  from: "no-reply@swiftmail.io",
});
```

### Sending Emails

Use the provided methods to send different types of emails.

```typescript
await swiftMail.sendWelcomeEmail(
  { to: "hi@swiftmail.io" },
  {
    name: "Jon Manga",
    companyName: "SwiftMail",
    link: "https://swiftmail.io/welcome",
  }
);
```

## SwiftMail methods

| Method                               | Description                                                        |
| ------------------------------------ | ------------------------------------------------------------------ |
| `sendWelcomeEmail`                   | Generates and sends a welcome email.                               |
| `getWelcomeEmailHtml`                | Renders and returns the html for a welcome email.                  |
| `sendConfirmationEmail`              | Generates and sends a confirmation email.                          |
| `getConfirmationEmailHtml`           | Renders and returns the html for a confirmation email.             |
| `sendPasswordResetEmail`             | Generates and sends a password reset email.                        |
| `getPasswordResetEmailHtml`          | Renders and returns the html for a password reset email.           |
| `sendPasswordlessLoginEmail`         | Generates and sends a passwordless login email.                    |
| `getPasswordlessLoginEmailHtml`      | Renders and returns the html for a passwordless login email.       |
| `sendAcceptInvitationEmail`          | Generates and sends an accept invitation email.                    |
| `getAcceptInvitationEmailHtml`       | Renders and returns the html for an accept invitation email.       |
| `sendPasswordInvitationEmail`        | Generates and sends a password invitation email.                   |
| `getPasswordInvitationEmailHtml`     | Renders and returns the html for a password invitation email.      |
| `sendWelcomeWithCredentialsEmail`    | Generates and sends a welcome with credentials email.              |
| `getWelcomeWithCredentialsEmailHtml` | Renders and returns the html for a welcome with credentials email. |
| `sendMail`                           | Sends an email using nodemailer's `sendMail` method.               |

## SwiftMail Options

SwiftMail options extend the [Nodemailer SMTP options](https://nodemailer.com/smtp/).

| Option         | Type    | Description                                                                                             |
| -------------- | ------- | ------------------------------------------------------------------------------------------------------- |
| `host`         | string  | The hostname or IP address to connect to (e.g., "smtp.swiftmail.io").                                   |
| `port`         | number  | The port to connect to (e.g., 587).                                                                     |
| `secure`       | boolean | If true, the connection will use TLS when connecting to the server.                                     |
| `auth`         | object  | Authentication object containing `user` and `pass` properties.                                          |
| `from`         | string  | The default email address to use as the sender.                                                         |
| `url`          | string  | SMTP URL to connect to.                                                                                 |
| `transport`    | object  | Custom transport object or string.                                                                      |
| `templatesDir` | string  | Directory path for email templates. You can specify your own path is you want to override the templates |
| `debug`        | boolean | If true, enables debug mode for logging.                                                                |

You also have access to the [`@swiftmail/templ`](https://github.com/celleb/swiftmail/tree/main/packages/templ#readme) package to use and render your own templates.

Example of a custom template:

```typescript
const templatePath = path.join(__dirname, "templates", "my-template.html");
const html = await swiftMail.templ.render(templatePath, {
  name: "Jon Manga",
});
```

```typescript
const template = `<h1>Hello {{ name }}</h1>`;
const html = await swiftMail.templ.render(template, {
  name: "Jon Manga",
});
await swiftMail.sendMail({
  to: "hi@swiftmail.io",
  subject: "My Template",
  html,
});
```

You can also have access to the `Templ` class directly to use your own templates.

```typescript
const templ = new Templ({
  baseDir: path.join(__dirname, "templates"),
});
```

## NestJS

See the [@swiftmail/nest](https://github.com/celleb/swiftmail/tree/main/packages/nest#readme) package for more information on how to use SwiftMail with NestJS.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
