import dotenvx from "@dotenvx/dotenvx";
import SwiftMail from "@swiftmail/mail";
dotenvx.config();

const confirmationEmailReport = {
  accepted: ["info@swiftmail.io"],
  ehlo: ["PIPELINING", "8BITMIME", "SMTPUTF8", "AUTH LOGIN PLAIN"],
  envelope: {
    from: "test@swiftmail.io",
    to: ["info@swiftmail.io"],
  },
  envelopeTime: expect.any(Number),
  messageId: expect.stringMatching(/\w+@swiftmail.io>/),
  messageSize: expect.any(Number),
  messageTime: expect.any(Number),
  rejected: [],
  response: expect.stringContaining("250 Accepted [STATUS=new MSGID="),
};
describe("SwiftMail", () => {
  let swiftMail: SwiftMail;

  beforeEach(() => {
    swiftMail = new SwiftMail();
  });
  afterEach(() => {
    swiftMail?.close();
  });
  it("successfully renders and sends a confirmation email", async () => {
    const report = await swiftMail.sendConfirmationEmail(
      {
        from: "test@swiftmail.io",
        subject: "Confirm your email address",
        to: "info@swiftmail.io",
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
      const report = await swiftMail.sendPasswordResetEmail(
        {
          from: "test@swiftmail.io",
          to: "info@swiftmail.io",
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
      const report = await swiftMail.sendPasswordlessLoginEmail(
        {
          from: "test@swiftmail.io",
          to: "info@swiftmail.io",
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
      const report = await swiftMail.sendWelcomeEmail(
        {
          from: "test@swiftmail.io",
          to: "info@swiftmail.io",
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
      const report = await swiftMail.sendAcceptInvitationEmail(
        {
          from: "test@swiftmail.io",
          to: "info@swiftmail.io",
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
      const report = await swiftMail.sendPasswordInvitationEmail(
        {
          from: "test@swiftmail.io",
          to: "info@swiftmail.io",
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
      const report = await swiftMail.sendWelcomeWithCredentialsEmail(
        {
          from: "test@swiftmail.io",
          to: "info@swiftmail.io",
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
      const info = await swiftMail.sendConfirmationEmail(
        {
          from: "test@swiftmail.io",
          to: "info@swiftmail.io",
        },
        {
          companyName: "Test Company",
          link: "https://example.com/confirm",
        }
      );
      const url = await swiftMail.getTestMessageUrl(info);
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
