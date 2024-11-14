import { SwiftMailService } from "./swift-mail.service";

describe("SwiftMailService", () => {
  let swiftMailService: SwiftMailService;
  beforeEach(() => {
    swiftMailService = new SwiftMailService();
    vi.spyOn(swiftMailService, "sendMail").mockResolvedValue({} as any);
  });

  afterEach(() => {
    swiftMailService?.close();
  });

  describe("sendMail", () => {
    it("it has a sendMail method", () => {
      expect(swiftMailService.sendMail).toBeInstanceOf(Function);
    });
  });

  describe("sendPasswordlessLoginEmail", () => {
    it("creates and sends a passwordless login email", async () => {
      await swiftMailService.sendPasswordlessLoginEmail(
        {
          to: "test@test.com",
          from: "jon.manga@swiftmail.io",
        },
        {
          companyName: "Test Company",
          link: "https://test.com",
        }
      );
      expect(swiftMailService.sendMail).toHaveBeenCalledWith({
        to: "test@test.com",
        from: "jon.manga@swiftmail.io",
        subject: "Login request",
        html: expect.stringContaining("Test Company"),
      });
    });
  });

  describe("sendPasswordResetEmail", () => {
    it("creates and sends a password reset email", async () => {
      await swiftMailService.sendPasswordResetEmail(
        {
          to: "test@test.com",
          from: "jon.manga@swiftmail.io",
        },
        {
          companyName: "Test Company",
          link: "https://test.com",
        }
      );
      expect(swiftMailService.sendMail).toHaveBeenCalledWith({
        to: "test@test.com",
        from: "jon.manga@swiftmail.io",
        subject: "Password reset",
        html: expect.stringContaining("Test Company"),
      });
    });
  });

  describe("sendConfirmationEmail", () => {
    it("creates and sends a confirmation email", async () => {
      await swiftMailService.sendConfirmationEmail(
        {
          to: "test@test.com",
          from: "jon.manga@swiftmail.io",
        },
        {
          companyName: "Test Company",
          link: "https://test.com",
        }
      );
      expect(swiftMailService.sendMail).toHaveBeenCalledWith({
        to: "test@test.com",
        from: "jon.manga@swiftmail.io",
        subject: "Confirm your email address",
        html: expect.stringContaining("Test Company"),
      });
    });
  });

  describe("getTestMessageUrl", () => {
    it("it has a getTestMessageUrl method", () => {
      expect(swiftMailService.getTestMessageUrl).toBeInstanceOf(Function);
    });
  });

  describe("sendPasswordInvitationEmail", () => {
    it("creates and sends a password invitation email", async () => {
      await swiftMailService.sendPasswordInvitationEmail(
        {
          to: "test@test.com",
          from: "jon.manga@swiftmail.io",
        },
        {
          companyName: "Test Company",
          link: "https://test.com",
        }
      );
      expect(swiftMailService.sendMail).toHaveBeenCalledWith({
        to: "test@test.com",
        from: "jon.manga@swiftmail.io",
        subject: "Set your password",
        html: expect.stringContaining("Test Company"),
      });
    });
  });

  describe("sendWelcomeWithCredentialsEmail", () => {
    it("creates and sends a welcome with credentials email", async () => {
      await swiftMailService.sendWelcomeWithCredentialsEmail(
        {
          to: "test@test.com",
          from: "jon.manga@swiftmail.io",
        },
        {
          companyName: "Test Company",
          link: "https://test.com",
          credentials: [
            {
              label: "Email",
              value: "test@test.com",
            },
          ],
        }
      );
      expect(swiftMailService.sendMail).toHaveBeenCalledWith({
        to: "test@test.com",
        from: "jon.manga@swiftmail.io",
        subject: "Your credentials",
        html: expect.stringContaining("test@test.com"),
      });
    });
  });

  describe("sendAcceptInvitationEmail", () => {
    it("creates and sends an accept invitation email", async () => {
      await swiftMailService.sendAcceptInvitationEmail(
        {
          to: "test@test.com",
          from: "jon.manga@swiftmail.io",
        },
        {
          companyName: "Test Company",
          link: "https://test.com",
        }
      );
      expect(swiftMailService.sendMail).toHaveBeenCalledWith({
        to: "test@test.com",
        from: "jon.manga@swiftmail.io",
        subject: "You're invited to join us",
        html: expect.stringContaining("Test Company"),
      });
    });
  });

  describe("sendWelcomeEmail", () => {
    it("creates and sends a welcome email", async () => {
      await swiftMailService.sendWelcomeEmail(
        {
          to: "test@test.com",
        },
        {
          companyName: "Test Company",
          link: "https://test.com",
        }
      );
      expect(swiftMailService.sendMail).toHaveBeenCalledWith({
        to: "test@test.com",
        subject: "Welcome",
        html: expect.stringContaining("Welcome to Test Company"),
      });
    });
  });
});
