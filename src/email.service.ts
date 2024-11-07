import fs from "fs";
import nodemailer from "nodemailer";
import path from "path";

export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      // Configure with your email provider
    });
  }

  async sendWelcomeEmail(to: string, data: any) {
    const template = this.loadTemplate("welcome.html", data);
    await this.sendEmail(to, "Welcome!", template);
  }

  async sendPasswordResetEmail(to: string, data: any) {
    const template = this.loadTemplate("password-reset.html", data);
    await this.sendEmail(to, "Password Reset", template);
  }

  async sendPasswordlessLoginEmail(to: string, data: any) {
    const template = this.loadTemplate("passwordless-login.html", data);
    await this.sendEmail(to, "Login Link", template);
  }

  private loadTemplate(templateName: string, data: any): string {
    const templatePath = path.join(__dirname, "templates", templateName);
    let template = fs.readFileSync(templatePath, "utf-8");
    // Simple template rendering logic
    Object.keys(data).forEach((key) => {
      template = template.replace(new RegExp(`{{${key}}}`, "g"), data[key]);
    });
    return template;
  }

  private async sendEmail(to: string, subject: string, html: string) {
    await this.transporter.sendMail({
      from: '"SwiftMailer" <no-reply@swiftmailer.com>',
      to,
      subject,
      html,
    });
  }
}
