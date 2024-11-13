import SwiftMail from "@swiftmail/mail";

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
});
