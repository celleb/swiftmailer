import SwiftMail from "@swiftmail/mail";
import nodemailer from "nodemailer";

describe("SwiftMail", () => {
  describe("getConfirmationEmailHtml", () => {
    it("renders and returns the confirmation email html", async () => {
      const swiftMail = new SwiftMail({
        transport: {} as any,
      });

      const html = await swiftMail.getConfirmationEmailHtml({
        link: "https://swiftmail.io/confirm",
        companyName: "SwiftMail",
        baseUri: "https://swiftmail.io",
        name: "Jon Manga",
      });
      expect(html).toMatchFileSnapshot("../templates/email-confirmation.html");
    });
  });

  describe("getPasswordResetEmailHtml", () => {
    it("renders and returns the password reset email html", async () => {
      const swiftMail = new SwiftMail({
        transport: {} as any,
      });

      const html = await swiftMail.getPasswordResetEmailHtml({
        link: "https://swiftmail.io/reset-password",
        companyName: "SwiftMail",
        baseUri: "https://swiftmail.io",
        name: "Jon Manga",
        logo: "https://static.mrcelleb.com/swiftmail/logo.png",
      });
      expect(html).toMatchFileSnapshot("../templates/password-reset.html");
    });
  });

  describe("getPasswordInvitationEmailHtml", () => {
    it("renders and returns the password invitation email html", async () => {
      const swiftMail = new SwiftMail({
        transport: {} as any,
      });

      const html = await swiftMail.getPasswordInvitationEmailHtml({
        link: "https://swiftmail.io/invitation",
        companyName: "SwiftMail",
        baseUri: "https://swiftmail.io",
        logo: "https://static.mrcelleb.com/swiftmail/logo.png",
        name: "Jon Manga",
        note: "Please ignore this email if you did not request a password.",
        intro: "You have been invited to join the amazing SwiftMail team.",
      });
      expect(html).toMatchFileSnapshot("../templates/password-invitation.html");
    });
  });

  describe("getAcceptInvitationEmailHtml", () => {
    it("renders and returns the accept invitation email html", async () => {
      const swiftMail = new SwiftMail({
        transport: {} as any,
      });

      const html = await swiftMail.getAcceptInvitationEmailHtml({
        link: "https://swiftmail.io/accept-invitation",
        companyName: "SwiftMail",
        baseUri: "https://swiftmail.io",
      });
      expect(html).toMatchFileSnapshot("../templates/accept-invitation.html");
    });
  });

  describe("getPasswordlessLoginEmailHtml", () => {
    it("renders and returns the passwordless login email html", async () => {
      const swiftMail = new SwiftMail({
        transport: {} as any,
      });

      const html = await swiftMail.getPasswordlessLoginEmailHtml({
        link: "https://swiftmail.io/passwordless-login",
        companyName: "SwiftMail",
        baseUri: "https://swiftmail.io",
        name: "Jon Manga",
      });
      expect(html).toMatchFileSnapshot("../templates/passwordless-login.html");
    });
  });

  describe("getWelcomeEmailHtml", () => {
    it("renders and returns the welcome email html", async () => {
      const swiftMail = new SwiftMail({
        transport: {} as any,
      });

      const html = await swiftMail.getWelcomeEmailHtml({
        link: "https://swiftmail.io/welcome",
        companyName: "SwiftMail",
        baseUri: "https://swiftmail.io",
        name: "Jon Manga",
        intro: "Welcome to SwiftMail!",
      });

      expect(html).toMatchFileSnapshot("../templates/welcome-email.html");
    });
  });

  describe("getWelcomeWithCredentialsEmailHtml", () => {
    it("renders and returns the welcome with credentials email html", async () => {
      const swiftMail = new SwiftMail({
        transport: {} as any,
      });

      const html = await swiftMail.getWelcomeWithCredentialsEmailHtml({
        link: "https://swiftmail.io/welcome",
        companyName: "SwiftMail",
        baseUri: "https://swiftmail.io",
        name: "Jon Manga",
        footer: "Powered by me",
        credentials: [
          { label: "Email", value: "jon@swiftmail.io" },
          { label: "Password", value: "********" },
        ],
      });
      expect(html).toMatchFileSnapshot(
        "../templates/welcome-with-credentials.html"
      );
    });
  });

  describe("constructor", () => {
    let restoreEnv: () => void;
    beforeEach(() => {
      restoreEnv = withEnv({
        EMAIL_FROM: "test@swiftmail.io",
        EMAIL_HOST: "localhost",
        EMAIL_PORT: "587",
        EMAIL_SECURE: "false",
        EMAIL_USER: "test@swiftmail.io",
        EMAIL_PASS: "password",
      });
      vi.spyOn(nodemailer, "createTransport");
    });
    afterEach(() => {
      restoreEnv();
    });
    it("calls nodemailer.createTransport with config from env", () => {
      new SwiftMail();
      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: "localhost",
        port: 587,
        secure: false,
        auth: {
          user: "test@swiftmail.io",
          pass: "password",
        },
        from: "test@swiftmail.io",
        templatesDir: expect.stringContaining("/packages/mail/dist/templates"),
      });
    });

    it("calls nodemailer.createTransport with config from arguments", () => {
      new SwiftMail({
        from: "test@swiftmail.io",
        host: "localhost",
        port: 587,
        secure: false,
        auth: {
          user: "test@swiftmail.io",
          pass: "password",
        },
      });
      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        from: "test@swiftmail.io",
        host: "localhost",
        port: 587,
        secure: false,
        auth: {
          user: "test@swiftmail.io",
          pass: "password",
        },
        templatesDir: expect.stringContaining("/packages/mail/dist/templates"),
      });
    });
    it("calls nodemailer.createTransport with url from SMTP_URL env", () => {
      withEnv({
        SMTP_URL: "smtp://test@swiftmail.io:password@localhost:587",
      });
      new SwiftMail();
      expect(nodemailer.createTransport).toHaveBeenCalledWith(
        "smtp://test@swiftmail.io:password@localhost:587"
      );
    });

    it("calls nodemailer.createTransport with url from arguments", () => {
      new SwiftMail({
        url: "smtp://test@swiftmail.io:password@localhost:587",
      });
      expect(nodemailer.createTransport).toHaveBeenCalledWith(
        "smtp://test@swiftmail.io:password@localhost:587"
      );
    });

    it("calls nodemailer.createTransport with transport from arguments", () => {
      const transport = { sendMail: vi.fn() } as any;
      new SwiftMail({
        transport,
      });
      expect(nodemailer.createTransport).toHaveBeenCalledWith(transport);
    });
  });
});

function withEnv(env: Record<string, string>) {
  const originalEnv = process.env;
  Object.entries(env).forEach(([key, value]) => {
    process.env[key] = value;
  });
  return () => {
    Object.assign(process.env, originalEnv);
  };
}
