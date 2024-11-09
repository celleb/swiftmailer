import nodemailer from "nodemailer";
import path from "path";
import { Templ } from "./templ";

interface EmailConfig {
  host?: string;
  port?: number;
  secure?: boolean;
  auth?: {
    user?: string;
    pass?: string;
  };
  from?: string;
}

interface SwiftMailerOptions {
  templatesDir?: string;
}

export class SwiftMailer {
  private transporter;
  private from: string;
  private config: EmailConfig;
  private options: SwiftMailerOptions;
  private defaultTemplatesDir = path.join(__dirname, "../templates");
  private parser: Templ;

  constructor(
    mailerConfig: EmailConfig = {},
    options: SwiftMailerOptions = {}
  ) {
    const port =
      mailerConfig.port || parseInt(process.env.EMAIL_PORT || "587", 10);
    this.config = {
      host: process.env.EMAIL_HOST,
      port,
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      ...mailerConfig,
    };

    this.from = process.env.EMAIL_FROM || mailerConfig.from || "";
    this.options = options;
    this.transporter = nodemailer.createTransport(this.config);
    this.parser = new Templ(
      this.options.templatesDir || this.defaultTemplatesDir
    );
  }

  async sendWelcomeEmail(to: string, data: any) {
    const template = await this.parser.render("welcome.html", data);
    await this.sendEmail(to, "Welcome!", template);
  }

  async sendPasswordResetEmail(to: string, data: any) {
    const template = await this.parser.render("password-reset.html", data);
    await this.sendEmail(to, "Password Reset", template);
  }

  async sendPasswordlessLoginEmail(to: string, data: any) {
    const template = await this.parser.render("passwordless-login.html", data);
    await this.sendEmail(to, "Login Link", template);
  }

  private async sendEmail(
    to: string,
    subject: string,
    html: string,
    from?: string
  ) {
    await this.transporter.sendMail({
      from: from || this.from,
      to,
      subject,
      html,
    });
  }
}
