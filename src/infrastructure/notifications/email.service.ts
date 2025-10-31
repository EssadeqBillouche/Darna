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

    const html = `
    <div style="font-family: sans-serif; background-color: #f9fafb; padding: 40px 0; color: #111827;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div style="background-color: #0e7490; padding: 20px 30px; text-align: center;">
          <h1 style="margin: 0; color: #ffffff; font-size: 24px; letter-spacing: 0.5px;">Darna</h1>
        </div>

        <div style="padding: 30px;">
          <p style="font-size: 16px;">Hi <strong>${greetingName}</strong>,</p>
          <p style="font-size: 15px; line-height: 1.6; color: #374151;">
            Thanks for signing up to <strong>Darna</strong>! Please verify your email address by clicking the button below.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="display: inline-block; background-color: #0e7490; color: #ffffff; padding: 14px 28px; border-radius: 8px; font-size: 16px; text-decoration: none; font-weight: 500;">
              Verify My Email
            </a>
          </div>

          <p style="font-size: 14px; color: #6b7280;">
            This link will expire on <strong>${formattedExpiry}</strong>.
          </p>

          <p style="margin-top: 30px; font-size: 15px;">Cheers,<br><strong>The Darna Team</strong></p>
        </div>

        <div style="background-color: #f3f4f6; padding: 16px; text-align: center; font-size: 12px; color: #9ca3af;">
          © ${new Date().getFullYear()} Darna. All rights reserved.
        </div>
      </div>
    </div>
    `;

    await this.transporter.sendMail({
      from: this.from,
      to: payload.to,
      subject: 'Verify your Darna account',
      html
    });
  }

  private buildVerificationLink(token: string): string {
    const baseUrl = process.env.EMAIL_VERIFICATION_URL ?? `${this.appUrl}/api-v1/user/verify-email`;
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}token=${encodeURIComponent(token)}`;
  }

  async sendCredentialsEmail(firstName: string, email: string, password: string) {
    const html = `
      <div style="font-family: sans-serif; background-color: #f9fafb; padding: 40px 0; color: #111827;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          
          <!-- Header -->
          <div style="background-color: #0e7490; padding: 20px 30px; text-align: center;">
            <h1 style="margin: 0; color: #ffffff; font-size: 24px; letter-spacing: 0.5px;">Darna</h1>
          </div>

          <!-- Body -->
          <div style="padding: 30px;">
            <p style="font-size: 16px;">Hi <strong>${firstName}</strong>,</p>

            <p style="font-size: 15px; line-height: 1.6; color: #374151;">
              Welcome to <strong>Darna</strong>! Your employee account has been successfully created.
              Below are your login credentials. Please keep them secure and change your password after logging in for the first time.
            </p>

            <div style="margin: 25px 0; padding: 16px 20px; background-color: #f3f4f6; border-radius: 8px;">
              <p style="margin-bottom: 2px; font-size: 15px;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 0; font-size: 15px;"><strong>Password:</strong> ${password}</p>
            </div>

            <p style="font-size: 14px; color: #6b7280;">
              If you didn’t expect this email, please contact your administrator.
            </p>

            <p style="margin-top: 30px; font-size: 15px;">
              Best regards,<br><strong>The Darna Team</strong>
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #f3f4f6; padding: 16px; text-align: center; font-size: 12px; color: #9ca3af;">
            © ${new Date().getFullYear()} Darna. All rights reserved.
          </div>
        </div>
      </div>
    `;
    await this.transporter.sendMail({
      from: `"Darna HR" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Employee Account Credentials",
      html,
    });
  }
}
