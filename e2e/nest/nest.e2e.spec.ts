import { config } from "@dotenvx/dotenvx";
import { Test } from "@nestjs/testing";
import { SwiftPostModule, SwiftPostService } from "@swiftpost/nest";
config();

describe("@swiftpost/nest", () => {
  let service: SwiftPostService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [SwiftPostModule.forFeature({})],
    }).compile();
    service = module.get(SwiftPostService);
  });

  describe("SwiftPostService", () => {
    it("creates and a welcome email", async () => {
      vi.spyOn(service, "sendMail").mockResolvedValueOnce({} as any);
      const html = await service.getWelcomeEmailHtml({
        name: "John Doe",
        companyName: "SwiftPost",
        link: "https://swiftpost.io",
      });
      await service.sendWelcomeEmail(
        {
          to: "test@example.com",
          from: "jon.manga@swiftpost.io",
        },
        {
          name: "John Doe",
          companyName: "SwiftPost",
          link: "https://swiftpost.io",
        }
      );
      expect(service.sendMail).toHaveBeenCalledWith({
        to: "test@example.com",
        from: "jon.manga@swiftpost.io",
        subject: "Welcome",
        html,
      });
    });

    it("creates and sends a welcome email", async () => {
      const report = await service.sendWelcomeEmail(
        { to: "info@swiftpost.io", from: "jon.manga@swiftpost.io" },
        {
          name: "John Doe",
          companyName: "SwiftPost",
          link: "https://swiftpost.io",
        }
      );
      expect(report).toEqual({
        accepted: ["info@swiftpost.io"],
        ehlo: ["PIPELINING", "8BITMIME", "SMTPUTF8", "AUTH LOGIN PLAIN"],
        envelope: {
          from: "jon.manga@swiftpost.io",
          to: ["info@swiftpost.io"],
        },
        envelopeTime: expect.any(Number),
        messageId: expect.stringMatching(/\w+@swiftpost.io>/),
        messageSize: expect.any(Number),
        messageTime: expect.any(Number),
        rejected: [],
        response: expect.stringContaining("250 Accepted [STATUS=new MSGID="),
      });
    });
  });
});
