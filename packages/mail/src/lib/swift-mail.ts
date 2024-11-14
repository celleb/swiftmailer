import { Logger } from "@swiftmail/logger";
import { Templ } from "@swiftmail/templ";
import nodemailer, { Transport, Transporter } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import path from "path";
type SwiftMailOptions = SMTPTransport.Options & {
  transport?: SMTPTransport;
  templatesDir?: string;
  url?: string;
  debug?: boolean;
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
  private readonly $logger: Logger;
  public parser: Templ;

  constructor(public config: SwiftMailOptions = {}) {
    this.$logger = new Logger("SwiftMail", !!config.debug);
    let transport: SMTPTransport | SMTPTransport.Options | string;
    if (config.url) {
      this.$logger.info("using url from config");
      transport = config.url;
    } else if (config.transport) {
      this.$logger.info("using transport from config");
      transport = config.transport;
    } else if (process.env.SMTP_URL) {
      this.$logger.info("using smtp url from environment");
      transport = process.env.SMTP_URL;
    } else {
      this.$logger.info("using smtp configs from environment");
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
      this.$logger.info("using default templates dir:", {
        dir: this.defaultTemplatesDir,
      });
      this.config.templatesDir = this.defaultTemplatesDir;
    }
    this.$logger.info("creating transporter");
    const transporter = nodemailer.createTransport(transport);
    this.$logger.info("transporter created");
    Object.assign(this, transporter);
    const transporterProto = Object.getPrototypeOf(transporter);
    Object.getOwnPropertyNames(transporterProto).forEach((key) => {
      Object.defineProperty(
        this,
        key,
        Object.getOwnPropertyDescriptor(transporterProto, key) ||
          Object.create(null)
      );
    });
    this.$logger.info("initializing parser");
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
    this.$logger.info("sending confirmation email", {
      from,
      subject,
      html,
    });
    return this.sendMail({ from, subject, ...rest, html });
  }

  async getConfirmationEmailHtml(data: SwiftConfirmationEmailData) {
    this.$logger.info("rendering confirmation email template");
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
    this.$logger.info("sending password reset email", {
      from,
      subject,
      html,
    });
    return this.sendMail({ from, subject, ...rest, html });
  }

  async getPasswordResetEmailHtml(data: SwiftPasswordResetEmailData) {
    this.$logger.info("rendering password reset email template");
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
    this.$logger.info("sending passwordless login email", {
      from,
      subject,
      html,
    });
    return this.sendMail({ from, subject, ...rest, html });
  }

  async getPasswordlessLoginEmailHtml(data: SwiftPasswordlessLoginEmailData) {
    this.$logger.info("rendering passwordless login email template");
    return this.parser.render("passwordless-login.html", data);
  }

  async getTestMessageUrl(info: SMTPTransport.SentMessageInfo) {
    return nodemailer.getTestMessageUrl(info);
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
    this.$logger.info("sending welcome email", {
      from,
      subject,
      html,
    });
    return this.sendMail({ from, subject, ...rest, html });
  }

  async getWelcomeEmailHtml(data: SwiftWelcomeEmailData) {
    this.$logger.info("rendering welcome email template");
    return this.parser.render("welcome-email.html", data);
  }

  async sendAcceptInvitationEmail(
    {
      from = this.config.from as string,
      subject = "You're invited to join us",
      ...rest
    }: SwiftMailSendOptions,
    data: SwiftAcceptInvitationEmailData
  ) {
    const html = await this.getAcceptInvitationEmailHtml(data);
    this.$logger.info("sending accept invitation email", {
      from,
      subject,
      html,
    });
    return this.sendMail({ from, subject, ...rest, html });
  }

  async getAcceptInvitationEmailHtml(data: SwiftAcceptInvitationEmailData) {
    this.$logger.info("rendering accept invitation email template");
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
    this.$logger.info("sending password invitation email", {
      from,
      subject,
      html,
    });
    return this.sendMail({ from, subject, ...rest, html });
  }

  async getPasswordInvitationEmailHtml(data: SwiftPasswordInvitationEmailData) {
    this.$logger.info("rendering password invitation email template");
    return this.parser.render("password-invitation.html", data);
  }

  async sendWelcomeWithCredentialsEmail(
    {
      from = this.config.from as string,
      subject = "Your credentials",
      ...rest
    }: SwiftMailSendOptions,
    data: SwiftWelcomeWithCredentialsEmailData
  ) {
    const html = await this.getWelcomeWithCredentialsEmailHtml(data);
    this.$logger.info("sending welcome with credentials email", {
      from,
      subject,
      html,
    });
    return this.sendMail({ from, subject, ...rest, html });
  }

  async getWelcomeWithCredentialsEmailHtml(
    data: SwiftWelcomeWithCredentialsEmailData
  ) {
    this.$logger.info("rendering welcome with credentials email template");
    return this.parser.render("welcome-with-credentials.html", data);
  }
}
