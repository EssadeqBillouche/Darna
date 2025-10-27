import nodemailer from 'nodemailer';

type VerificationEmailPayload = {
  to: string;
  firstName?: string;
  token: string;
  expiresAt: Date;
};

export class EmailService {
  private transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT ?? 587),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  private from = process.env.EMAIL_FROM ?? process.env.EMAIL_USER ?? 'no-reply@darna.local';
  private appUrl = process.env.APP_URL ?? 'http://localhost:3000';

  public async sendVerificationEmail(payload: VerificationEmailPayload) {
    const verificationLink = this.buildVerificationLink(payload.token);

    const greetingName = payload.firstName ?? 'there';
    const formattedExpiry = payload.expiresAt.toLocaleString();

    await this.transporter.sendMail({
      from: this.from,
      to: payload.to,
      subject: 'Verify your Darna account',
      html: [
        `<p>Hi ${greetingName},</p>`,
        '<p>Thanks for signing up to Darna. Please confirm your email address by clicking the button below.</p>',
        `<p><a href="${verificationLink}" style="display:inline-block;padding:12px 20px;background-color:#0e7490;color:#ffffff;text-decoration:none;border-radius:6px;">Verify my email</a></p>`,
        `<p>This link will expire on ${formattedExpiry}. If you did not create an account, you can ignore this email.</p>`,
        '<p>The Darna team</p>',
      ].join(''),
    });
  }

  private buildVerificationLink(token: string): string {
    const baseUrl = process.env.EMAIL_VERIFICATION_URL ?? `${this.appUrl}/api/auth/verify-email`;
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}token=${encodeURIComponent(token)}`;
  }
}
