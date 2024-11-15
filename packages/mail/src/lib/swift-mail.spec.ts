import nodemailer from "nodemailer";
import { SwiftPost } from "./swift-mail";

describe("SwiftPost", () => {
  describe("getConfirmationEmailHtml", () => {
    it("renders and returns the confirmation email html", async () => {
      const swiftPost = new SwiftPost({
        transport: {} as any,
      });

      const html = await swiftPost.getConfirmationEmailHtml({
        link: "https://swiftpost.io/confirm",
        companyName: "SwiftPost",
        baseUri: "https://swiftpost.io",
        name: "Jon Manga",
      });
      expect(html).toMatchFileSnapshot(
        "../__tests__/templates/email-confirmation.html"
      );
    });
  });

  describe("getPasswordResetEmailHtml", () => {
    it("renders and returns the password reset email html", async () => {
      const swiftPost = new SwiftPost({
        transport: {} as any,
      });

      const html = await swiftPost.getPasswordResetEmailHtml({
        link: "https://swiftpost.io/reset-password",
        companyName: "SwiftPost",
        baseUri: "https://swiftpost.io",
        name: "Jon Manga",
        logo: "https://static.mrcelleb.com/swiftpost/logo.png",
      });
      expect(html).toMatchFileSnapshot(
        "../__tests__/templates/password-reset.html"
      );
    });
  });

  describe("getPasswordInvitationEmailHtml", () => {
    it("renders and returns the password invitation email html", async () => {
      const swiftPost = new SwiftPost({
        transport: {} as any,
      });

      const html = await swiftPost.getPasswordInvitationEmailHtml({
        link: "https://swiftpost.io/invitation",
        companyName: "SwiftPost",
        baseUri: "https://swiftpost.io",
        logo: "https://static.mrcelleb.com/swiftpost/logo.png",
        name: "Jon Manga",
        note: "Please ignore this email if you did not request a password.",
        intro: "You have been invited to join the amazing SwiftPost team.",
      });
      expect(html).toMatchFileSnapshot(
        "../__tests__/templates/password-invitation.html"
      );
    });
  });

  describe("getAcceptInvitationEmailHtml", () => {
    it("renders and returns the accept invitation email html", async () => {
      const swiftPost = new SwiftPost({
        transport: {} as any,
      });

      const html = await swiftPost.getAcceptInvitationEmailHtml({
        link: "https://swiftpost.io/accept-invitation",
        companyName: "SwiftPost",
        baseUri: "https://swiftpost.io",
      });
      expect(html).toMatchFileSnapshot(
        "../__tests__/templates/accept-invitation.html"
      );
    });
  });

  describe("getPasswordlessLoginEmailHtml", () => {
    it("renders and returns the passwordless login email html", async () => {
      const swiftPost = new SwiftPost({
        transport: {} as any,
      });

      const html = await swiftPost.getPasswordlessLoginEmailHtml({
        link: "https://swiftpost.io/passwordless-login",
        companyName: "SwiftPost",
        baseUri: "https://swiftpost.io",
        name: "Jon Manga",
      });
      expect(html).toMatchFileSnapshot(
        "../__tests__/templates/passwordless-login.html"
      );
    });
  });

  describe("getWelcomeEmailHtml", () => {
    it("renders and returns the welcome email html", async () => {
      const swiftPost = new SwiftPost({
        transport: {} as any,
      });

      const html = await swiftPost.getWelcomeEmailHtml({
        link: "https://swiftpost.io/welcome",
        companyName: "SwiftPost",
        baseUri: "https://swiftpost.io",
        name: "Jon Manga",
        intro: "Welcome to SwiftPost!",
      });

      expect(html).toMatchFileSnapshot(
        "../__tests__/templates/welcome-email.html"
      );
    });
  });

  describe("getWelcomeWithCredentialsEmailHtml", () => {
    it("renders and returns the welcome with credentials email html", async () => {
      const swiftPost = new SwiftPost({
        transport: {} as any,
      });

      const html = await swiftPost.getWelcomeWithCredentialsEmailHtml({
        link: "https://swiftpost.io/welcome",
        companyName: "SwiftPost",
        baseUri: "https://swiftpost.io",
        name: "Jon Manga",
        footer: "Powered by me",
        credentials: [
          { label: "Email", value: "jon@swiftpost.io" },
          { label: "Password", value: "********" },
        ],
      });
      expect(html).toMatchFileSnapshot(
        "../__tests__/templates/welcome-with-credentials.html"
      );
    });
  });

  describe("constructor", () => {
    let restoreEnv: () => void;
    beforeEach(() => {
      restoreEnv = withEnv({
        EMAIL_FROM: "test@swiftpost.io",
        EMAIL_HOST: "localhost",
        EMAIL_PORT: "587",
        EMAIL_SECURE: "false",
        EMAIL_USER: "test@swiftpost.io",
        EMAIL_PASS: "password",
      });
      vi.spyOn(nodemailer, "createTransport");
    });
    afterEach(() => {
      restoreEnv();
    });
    it("calls nodemailer.createTransport with config from env", () => {
      new SwiftPost();
      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: "localhost",
        port: 587,
        secure: false,
        auth: {
          user: "test@swiftpost.io",
          pass: "password",
        },
        from: "test@swiftpost.io",
        templatesDir: expect.stringContaining("/packages/mail/src/templates"),
      });
    });

    it("calls nodemailer.createTransport with config from arguments", () => {
      new SwiftPost({
        from: "test@swiftpost.io",
        host: "localhost",
        port: 587,
        secure: false,
        auth: {
          user: "test@swiftpost.io",
          pass: "password",
        },
      });
      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        from: "test@swiftpost.io",
        host: "localhost",
        port: 587,
        secure: false,
        auth: {
          user: "test@swiftpost.io",
          pass: "password",
        },
        templatesDir: expect.stringContaining("/packages/mail/src/templates"),
      });
    });
    it("calls nodemailer.createTransport with url from SMTP_URL env", () => {
      withEnv({
        SMTP_URL: "smtp://test@swiftpost.io:password@localhost:587",
      });
      new SwiftPost();
      expect(nodemailer.createTransport).toHaveBeenCalledWith(
        "smtp://test@swiftpost.io:password@localhost:587"
      );
    });

    it("calls nodemailer.createTransport with url from arguments", () => {
      new SwiftPost({
        url: "smtp://test@swiftpost.io:password@localhost:587",
      });
      expect(nodemailer.createTransport).toHaveBeenCalledWith(
        "smtp://test@swiftpost.io:password@localhost:587"
      );
    });

    it("calls nodemailer.createTransport with transport from arguments", () => {
      const transport = { sendMail: vi.fn() } as any;
      new SwiftPost({
        transport,
      });
      expect(nodemailer.createTransport).toHaveBeenCalledWith(transport);
    });
  });

  describe("sendConfirmationEmail", () => {
    it("generates and sends the confirmation email", async () => {
      const swiftPost = new SwiftPost({});
      vi.spyOn(swiftPost, "sendMail").mockResolvedValue({} as any);
      await swiftPost.sendConfirmationEmail(
        { to: "jon@swiftpost.io", from: "test@swiftpost.io" },
        {
          companyName: "SwiftPost",
          baseUri: "https://swiftpost.io",
          name: "Jon Manga",
          link: "https://swiftpost.io/confirm",
        }
      );
      expect(swiftPost.sendMail).toHaveBeenCalledWith({
        to: "jon@swiftpost.io",
        from: "test@swiftpost.io",
        subject: "Confirm your email address",
        html: expect.any(String),
      });
    });
  });

  describe("sendPasswordResetEmail", () => {
    it("generates and sends the password reset email", async () => {
      const swiftPost = new SwiftPost({});
      vi.spyOn(swiftPost, "sendMail").mockResolvedValue({} as any);
      await swiftPost.sendPasswordResetEmail(
        { to: "jon@swiftpost.io", from: "test@swiftpost.io" },
        {
          companyName: "SwiftPost",
          baseUri: "https://swiftpost.io",
          name: "Jon Manga",
          link: "https://swiftpost.io/reset-password",
        }
      );
      expect(swiftPost.sendMail).toHaveBeenCalledWith({
        to: "jon@swiftpost.io",
        from: "test@swiftpost.io",
        subject: "Password reset",
        html: expect.any(String),
      });
    });

    describe("sendPasswordlessLoginEmail", () => {
      it("generates and sends the passwordless login email", async () => {
        const swiftPost = new SwiftPost({});
        vi.spyOn(swiftPost, "sendMail").mockResolvedValue({} as any);
        await swiftPost.sendPasswordlessLoginEmail(
          { to: "jon@swiftpost.io", from: "test@swiftpost.io" },
          {
            companyName: "SwiftPost",
            baseUri: "https://swiftpost.io",
            name: "Jon Manga",
            link: "https://swiftpost.io/passwordless-login",
          }
        );
        expect(swiftPost.sendMail).toHaveBeenCalledWith({
          to: "jon@swiftpost.io",
          from: "test@swiftpost.io",
          subject: "Login request",
          html: expect.any(String),
        });
      });
    });
  });

  describe("sendWelcomeEmail", () => {
    it("generates and sends the welcome email", async () => {
      const swiftPost = new SwiftPost({});
      vi.spyOn(swiftPost, "sendMail").mockResolvedValue({} as any);
      await swiftPost.sendWelcomeEmail(
        { to: "jon@swiftpost.io", from: "test@swiftpost.io" },
        {
          companyName: "SwiftPost",
          baseUri: "https://swiftpost.io",
          name: "Jon Manga",
          link: "https://swiftpost.io/welcome",
          intro: "Welcome to SwiftPost!",
        }
      );
      expect(swiftPost.sendMail).toHaveBeenCalledWith({
        to: "jon@swiftpost.io",
        from: "test@swiftpost.io",
        subject: "Welcome",
        html: expect.any(String),
      });
    });
  });

  describe("sendWelcomeWithCredentialsEmail", () => {
    it("generates and sends the welcome with credentials email", async () => {
      const swiftPost = new SwiftPost({});
      vi.spyOn(swiftPost, "sendMail").mockResolvedValue({} as any);
      await swiftPost.sendWelcomeWithCredentialsEmail(
        { to: "jon@swiftpost.io", from: "test@swiftpost.io" },
        {
          companyName: "SwiftPost",
          baseUri: "https://swiftpost.io",
          name: "Jon Manga",
          link: "https://swiftpost.io/welcome",
          credentials: [
            { label: "Email", value: "jon@swiftpost.io" },
            { label: "Password", value: "********" },
          ],
        }
      );
      expect(swiftPost.sendMail).toHaveBeenCalledWith({
        to: "jon@swiftpost.io",
        from: "test@swiftpost.io",
        subject: "Your credentials",
        html: expect.any(String),
      });
    });
  });

  describe("sendPasswordInvitationEmail", () => {
    it("generates and sends the password invitation email", async () => {
      const swiftPost = new SwiftPost({});
      vi.spyOn(swiftPost, "sendMail").mockResolvedValue({} as any);
      await swiftPost.sendPasswordInvitationEmail(
        {
          to: "jon@swiftpost.io",
          from: "test@swiftpost.io",
          subject: "Here is your invitation",
        },
        {
          companyName: "SwiftPost",
          link: "https://swiftpost.io/invitation",
        }
      );
      expect(swiftPost.sendMail).toHaveBeenCalledWith({
        to: "jon@swiftpost.io",
        from: "test@swiftpost.io",
        subject: "Here is your invitation",
        html: expect.any(String),
      });
    });
  });

  describe("sendAcceptInvitationEmail", () => {
    it("generates and sends the accept invitation email", async () => {
      const swiftPost = new SwiftPost({});
      vi.spyOn(swiftPost, "sendMail").mockResolvedValue({} as any);
      await swiftPost.sendAcceptInvitationEmail(
        { to: "jon@swiftpost.io", from: "test@swiftpost.io" },
        {
          companyName: "SwiftPost",
          link: "https://swiftpost.io/accept-invitation",
        }
      );
      expect(swiftPost.sendMail).toHaveBeenCalledWith({
        to: "jon@swiftpost.io",
        from: "test@swiftpost.io",
        subject: "You're invited to join us",
        html: expect.any(String),
      });
    });
  });
});

function withEnv(env: Record<string, string>) {
  const originalEnv = process.env;
  Object.entries(env).forEach(([key, value]) => {
    process.env[key] = value;
  });
  return () => {
    Object.entries(env).forEach(([key]) => {
      delete process.env[key];
    });
    Object.assign(process.env, originalEnv);
  };
}
