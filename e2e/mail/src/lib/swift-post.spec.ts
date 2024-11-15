import dotenvx from "@dotenvx/dotenvx";
import SwiftPost from "@swiftpost/mail";
dotenvx.config();

const confirmationEmailReport = {
  accepted: ["info@swiftpost.io"],
  ehlo: ["PIPELINING", "8BITMIME", "SMTPUTF8", "AUTH LOGIN PLAIN"],
  envelope: {
    from: "test@swiftpost.io",
    to: ["info@swiftpost.io"],
  },
  envelopeTime: expect.any(Number),
  messageId: expect.stringMatching(/\w+@swiftpost.io>/),
  messageSize: expect.any(Number),
  messageTime: expect.any(Number),
  rejected: [],
  response: expect.stringContaining("250 Accepted [STATUS=new MSGID="),
};
describe("SwiftPost", () => {
  let swiftPost: SwiftPost;

  beforeEach(() => {
    swiftPost = new SwiftPost();
  });
  afterEach(() => {
    swiftPost?.close();
  });
  it("successfully renders and sends a confirmation email", async () => {
    const report = await swiftPost.sendConfirmationEmail(
      {
        from: "test@swiftpost.io",
        subject: "Confirm your email address",
        to: "info@swiftpost.io",
      },
      {
        companyName: "Test Company",
        link: "https://example.com/confirm",
      }
    );
    expect(report).toEqual(confirmationEmailReport);
  });

  describe("sendPasswordResetEmail", () => {
    it("successfully renders and sends a password reset email", async () => {
      const report = await swiftPost.sendPasswordResetEmail(
        {
          from: "test@swiftpost.io",
          to: "info@swiftpost.io",
        },
        {
          companyName: "Test Company",
          link: "https://example.com/reset",
        }
      );
      expect(report).toEqual(confirmationEmailReport);
    });
  });

  describe("sendPasswordlessLoginEmail", () => {
    it("successfully renders and sends a passwordless login email", async () => {
      const report = await swiftPost.sendPasswordlessLoginEmail(
        {
          from: "test@swiftpost.io",
          to: "info@swiftpost.io",
        },
        {
          companyName: "Test Company",
          link: "https://example.com/login",
        }
      );
      expect(report).toEqual(confirmationEmailReport);
    });
  });

  describe("sendWelcomeEmail", () => {
    it("successfully renders and sends a welcome email", async () => {
      const report = await swiftPost.sendWelcomeEmail(
        {
          from: "test@swiftpost.io",
          to: "info@swiftpost.io",
        },
        {
          companyName: "Test Company",
          link: "https://example.com/welcome",
        }
      );
      expect(report).toEqual(confirmationEmailReport);
    });
  });

  describe("sendAcceptInvitationEmail", () => {
    it("successfully renders and sends an accept invitation email", async () => {
      const report = await swiftPost.sendAcceptInvitationEmail(
        {
          from: "test@swiftpost.io",
          to: "info@swiftpost.io",
        },
        {
          companyName: "Test Company",
          link: "https://example.com/accept",
        }
      );
      expect(report).toEqual(confirmationEmailReport);
    });
  });

  describe("sendPasswordInvitationEmail", () => {
    it("successfully renders and sends a password invitation email", async () => {
      const report = await swiftPost.sendPasswordInvitationEmail(
        {
          from: "test@swiftpost.io",
          to: "info@swiftpost.io",
        },
        {
          companyName: "Test Company",
          link: "https://example.com/invitation",
        }
      );
      expect(report).toEqual(confirmationEmailReport);
    });
  });

  describe("sendWelcomeWithCredentialsEmail", () => {
    it("successfully renders and sends a welcome with credentials email", async () => {
      const report = await swiftPost.sendWelcomeWithCredentialsEmail(
        {
          from: "test@swiftpost.io",
          to: "info@swiftpost.io",
        },
        {
          companyName: "Test Company",
          link: "https://example.com/welcome",
          credentials: [
            { label: "Username", value: "test" },
            { label: "Password", value: "password" },
          ],
        }
      );
      expect(report).toEqual(confirmationEmailReport);
    });
  });

  describe("getTestMessageUrl", () => {
    it("returns the test message url", async () => {
      const info = await swiftPost.sendConfirmationEmail(
        {
          from: "test@swiftpost.io",
          to: "info@swiftpost.io",
        },
        {
          companyName: "Test Company",
          link: "https://example.com/confirm",
        }
      );
      const url = await swiftPost.getTestMessageUrl(info);
      expect(url).toMatch(/https:\/\/ethereal\.email\/message\/\w+/);
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
