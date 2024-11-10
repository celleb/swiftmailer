import nodemailer, { Transport, Transporter } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import path from "path";
import { Templ } from "./templ";

type SwiftMailOptions = SMTPTransport.Options & {
  transport?: SMTPTransport;
  templatesDir?: string;
  url?: string;
};

export interface SwiftMail<T extends Transport<unknown> = SMTPTransport>
  extends Transporter<SMTPTransport.SentMessageInfo, SMTPTransport.Options> {}
export class SwiftMail {
  private defaultTemplatesDir = path.join(__dirname, "../templates");
  public parser: Templ;

  constructor(private config: SwiftMailOptions = {}) {
    let transport: SMTPTransport | SMTPTransport.Options | string;
    if (config.url) {
      transport = config.url;
    } else if (config.transport) {
      transport = config.transport;
    } else {
      transport = {
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || "587", 10) || undefined,
        secure: process.env.EMAIL_SECURE === "true",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        from: process.env.EMAIL_FROM,
        ...config,
      };
      this.config = transport;
    }
    if (!this.config.templatesDir) {
      this.config.templatesDir = this.defaultTemplatesDir;
    }
    const transporter = nodemailer.createTransport(transport);
    Object.assign(this, transporter);

    this.parser = new Templ(this.config.templatesDir!);
  }

  async sendWelcomeEmail(to: string, data: any) {
    const template = await this.parser.render("welcome.html", data);
    await this.sendMail({ to, subject: "Welcome!", html: template });
  }

  async sendPasswordResetEmail(to: string, data: any) {
    const template = await this.parser.render("password-reset.html", data);
    await this.sendMail({ to, subject: "Password Reset", html: template });
  }

  async sendPasswordlessLoginEmail(to: string, data: any) {
    const template = await this.parser.render("passwordless-login.html", data);
    await this.sendMail({ to, subject: "Login Link", html: template });
  }
}
