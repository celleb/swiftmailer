import { Templ } from "@swiftmail/templ";
import nodemailer, { Transport, Transporter } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import path from "path";

type SwiftMailOptions = SMTPTransport.Options & {
  transport?: SMTPTransport;
  templatesDir?: string;
  url?: string;
};

type SwiftMailBaseOptions = {
  companyName: string;
  logo?: string;
  baseUri?: string;
  footer?: string;
  name?: string;
  note?: string;
  intro?: string;
};

type SwiftConfirmationEmailData = SwiftMailBaseOptions & {
  link: string;
};

type SwiftPasswordResetEmailData = SwiftMailBaseOptions & {
  link: string;
  footer?: string;
};

type SwiftPasswordlessLoginEmailData = SwiftMailBaseOptions & {
  link: string;
};

type SwiftWelcomeEmailData = SwiftMailBaseOptions & {
  link: string;
  ctaLabel?: string;
  message?: string;
};

type SwiftAcceptInvitationEmailData = SwiftMailBaseOptions & {
  link: string;
};

type SwiftPasswordInvitationEmailData = SwiftMailBaseOptions & {
  link: string;
};

type SwiftWelcomeWithCredentialsEmailData = SwiftMailBaseOptions & {
  link: string;
  credentials: { label: string; value: string }[];
};

type SwiftMailSendOptions = Partial<
  Omit<Parameters<SwiftMail["sendMail"]>[0], "html">
> & {
  to: string;
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

    this.parser = new Templ({ baseDir: this.config.templatesDir });
  }

  async sendConfirmationEmail(
    {
      from = this.config.from as string,
      subject = "Confirm your email address",
      ...rest
    }: SwiftMailSendOptions,
    data: SwiftConfirmationEmailData
  ) {
    const html = await this.getConfirmationEmailHtml(data);
    return this.sendMail({ from, ...rest, html });
  }

  async getConfirmationEmailHtml(data: SwiftConfirmationEmailData) {
    return this.parser.render("email-confirmation.html", data);
  }

  async sendPasswordResetEmail(
    {
      from = this.config.from as string,
      subject = "Password reset",
      ...rest
    }: SwiftMailSendOptions,
    data: SwiftPasswordResetEmailData
  ) {
    const html = await this.getPasswordResetEmailHtml(data);
    return this.sendMail({ from, ...rest, html });
  }

  async getPasswordResetEmailHtml(data: SwiftPasswordResetEmailData) {
    return this.parser.render("password-reset.html", data);
  }

  async sendPasswordlessLoginEmail(
    {
      from = this.config.from as string,
      subject = "Login request",
      ...rest
    }: SwiftMailSendOptions,
    data: SwiftPasswordlessLoginEmailData
  ) {
    const html = await this.getPasswordlessLoginEmailHtml(data);
    return this.sendMail({ from, ...rest, html });
  }

  async getPasswordlessLoginEmailHtml(data: SwiftPasswordlessLoginEmailData) {
    return this.parser.render("passwordless-login.html", data);
  }

  async sendWelcomeEmail(
    {
      from = this.config.from as string,
      subject = "Welcome",
      ...rest
    }: SwiftMailSendOptions,
    data: SwiftWelcomeEmailData
  ) {
    const html = await this.getWelcomeEmailHtml(data);
    return this.sendMail({ from, ...rest, html });
  }

  async getWelcomeEmailHtml(data: SwiftWelcomeEmailData) {
    return this.parser.render("welcome-email.html", data);
  }

  async sendAcceptInvitationEmail(
    {
      from = this.config.from as string,
      subject = "You're invited to join {{companyName}}",
      ...rest
    }: SwiftMailSendOptions,
    data: SwiftAcceptInvitationEmailData
  ) {
    const html = await this.getAcceptInvitationEmailHtml(data);
    return this.sendMail({ from, ...rest, html });
  }

  async getAcceptInvitationEmailHtml(data: SwiftAcceptInvitationEmailData) {
    return this.parser.render("accept-invitation.html", data);
  }

  async sendPasswordInvitationEmail(
    {
      from = this.config.from as string,
      subject = "Set your password",
      ...rest
    }: SwiftMailSendOptions,
    data: SwiftPasswordInvitationEmailData
  ) {
    const html = await this.getPasswordInvitationEmailHtml(data);
    return this.sendMail({ from, ...rest, html });
  }

  async getPasswordInvitationEmailHtml(data: SwiftPasswordInvitationEmailData) {
    return this.parser.render("password-invitation.html", data);
  }

  async sendWelcomeWithCredentialsEmail(
    {
      from = this.config.from as string,
      subject = "Welcome to {{companyName}}",
      ...rest
    }: SwiftMailSendOptions,
    data: SwiftWelcomeWithCredentialsEmailData
  ) {
    const html = await this.getWelcomeWithCredentialsEmailHtml(data);
    return this.sendMail({ from, ...rest, html });
  }

  async getWelcomeWithCredentialsEmailHtml(
    data: SwiftWelcomeWithCredentialsEmailData
  ) {
    return this.parser.render("welcome-with-credentials.html", data);
  }
}
