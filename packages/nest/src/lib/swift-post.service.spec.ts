import { SwiftPostService } from "./swift-post.service";

describe("SwiftPostService", () => {
  let swiftPostService: SwiftPostService;
  beforeEach(() => {
    swiftPostService = new SwiftPostService();
    vi.spyOn(swiftPostService, "sendMail").mockResolvedValue({} as any);
  });

  afterEach(() => {
    swiftPostService?.close();
  });

  describe("sendMail", () => {
    it("it has a sendMail method", () => {
      expect(swiftPostService.sendMail).toBeInstanceOf(Function);
    });
  });

  describe("sendPasswordlessLoginEmail", () => {
    it("creates and sends a passwordless login email", async () => {
      await swiftPostService.sendPasswordlessLoginEmail(
        {
          to: "test@test.com",
          from: "jon.manga@swiftpost.io",
        },
        {
          companyName: "Test Company",
          link: "https://test.com",
        }
      );
      expect(swiftPostService.sendMail).toHaveBeenCalledWith({
        to: "test@test.com",
        from: "jon.manga@swiftpost.io",
        subject: "Login request",
        html: expect.stringContaining("Test Company"),
      });
    });
  });

  describe("sendPasswordResetEmail", () => {
    it("creates and sends a password reset email", async () => {
      await swiftPostService.sendPasswordResetEmail(
        {
          to: "test@test.com",
          from: "jon.manga@swiftpost.io",
        },
        {
          companyName: "Test Company",
          link: "https://test.com",
        }
      );
      expect(swiftPostService.sendMail).toHaveBeenCalledWith({
        to: "test@test.com",
        from: "jon.manga@swiftpost.io",
        subject: "Password reset",
        html: expect.stringContaining("Test Company"),
      });
    });
  });

  describe("sendConfirmationEmail", () => {
    it("creates and sends a confirmation email", async () => {
      await swiftPostService.sendConfirmationEmail(
        {
          to: "test@test.com",
          from: "jon.manga@swiftpost.io",
        },
        {
          companyName: "Test Company",
          link: "https://test.com",
        }
      );
      expect(swiftPostService.sendMail).toHaveBeenCalledWith({
        to: "test@test.com",
        from: "jon.manga@swiftpost.io",
        subject: "Confirm your email address",
        html: expect.stringContaining("Test Company"),
      });
    });
  });

  describe("getTestMessageUrl", () => {
    it("it has a getTestMessageUrl method", () => {
      expect(swiftPostService.getTestMessageUrl).toBeInstanceOf(Function);
    });
  });

  describe("sendPasswordInvitationEmail", () => {
    it("creates and sends a password invitation email", async () => {
      await swiftPostService.sendPasswordInvitationEmail(
        {
          to: "test@test.com",
          from: "jon.manga@swiftpost.io",
        },
        {
          companyName: "Test Company",
          link: "https://test.com",
        }
      );
      expect(swiftPostService.sendMail).toHaveBeenCalledWith({
        to: "test@test.com",
        from: "jon.manga@swiftpost.io",
        subject: "Set your password",
        html: expect.stringContaining("Test Company"),
      });
    });
  });

  describe("sendWelcomeWithCredentialsEmail", () => {
    it("creates and sends a welcome with credentials email", async () => {
      await swiftPostService.sendWelcomeWithCredentialsEmail(
        {
          to: "test@test.com",
          from: "jon.manga@swiftpost.io",
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
      expect(swiftPostService.sendMail).toHaveBeenCalledWith({
        to: "test@test.com",
        from: "jon.manga@swiftpost.io",
        subject: "Your credentials",
        html: expect.stringContaining("test@test.com"),
      });
    });
  });

  describe("sendAcceptInvitationEmail", () => {
    it("creates and sends an accept invitation email", async () => {
      await swiftPostService.sendAcceptInvitationEmail(
        {
          to: "test@test.com",
          from: "jon.manga@swiftpost.io",
        },
        {
          companyName: "Test Company",
          link: "https://test.com",
        }
      );
      expect(swiftPostService.sendMail).toHaveBeenCalledWith({
        to: "test@test.com",
        from: "jon.manga@swiftpost.io",
        subject: "You're invited to join us",
        html: expect.stringContaining("Test Company"),
      });
    });
  });

  describe("sendWelcomeEmail", () => {
    it("creates and sends a welcome email", async () => {
      await swiftPostService.sendWelcomeEmail(
        {
          to: "test@test.com",
        },
        {
          companyName: "Test Company",
          link: "https://test.com",
        }
      );
      expect(swiftPostService.sendMail).toHaveBeenCalledWith({
        to: "test@test.com",
        subject: "Welcome",
        html: expect.stringContaining("Welcome to Test Company"),
      });
    });
  });
});
