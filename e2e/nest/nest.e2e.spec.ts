import { config } from "@dotenvx/dotenvx";
import { Test } from "@nestjs/testing";
import { SwiftMailModule, SwiftMailService } from "@swiftmail/nest";
config();

describe("@swiftmail/nest", () => {
  let service: SwiftMailService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [SwiftMailModule.forFeature({})],
    }).compile();
    service = module.get(SwiftMailService);
  });

  describe("SwiftMailService", () => {
    it("creates and a welcome email", async () => {
      vi.spyOn(service, "sendMail").mockResolvedValueOnce({} as any);
      const html = await service.getWelcomeEmailHtml({
        name: "John Doe",
        companyName: "SwiftMail",
        link: "https://swiftmail.io",
      });
      await service.sendWelcomeEmail(
        {
          to: "test@example.com",
          from: "jon.manga@swiftmail.io",
        },
        {
          name: "John Doe",
          companyName: "SwiftMail",
          link: "https://swiftmail.io",
        }
      );
      expect(service.sendMail).toHaveBeenCalledWith({
        to: "test@example.com",
        from: "jon.manga@swiftmail.io",
        subject: "Welcome",
        html,
      });
    });

    it("creates and sends a welcome email", async () => {
      const report = await service.sendWelcomeEmail(
        { to: "info@swiftmail.io", from: "jon.manga@swiftmail.io" },
        {
          name: "John Doe",
          companyName: "SwiftMail",
          link: "https://swiftmail.io",
        }
      );
      expect(report).toEqual({
        accepted: ["info@swiftmail.io"],
        ehlo: ["PIPELINING", "8BITMIME", "SMTPUTF8", "AUTH LOGIN PLAIN"],
        envelope: {
          from: "jon.manga@swiftmail.io",
          to: ["info@swiftmail.io"],
        },
        envelopeTime: expect.any(Number),
        messageId: expect.stringMatching(/\w+@swiftmail.io>/),
        messageSize: expect.any(Number),
        messageTime: expect.any(Number),
        rejected: [],
        response: expect.stringContaining("250 Accepted [STATUS=new MSGID="),
      });
    });
  });
});
