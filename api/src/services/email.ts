export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailService {
  sendEmail(options: EmailOptions): Promise<void>;
}

/**
 * Console email service for development
 * Logs emails to console instead of actually sending them
 */
export class ConsoleEmailService implements EmailService {
  async sendEmail(options: EmailOptions): Promise<void> {
    console.log('\n📧 EMAIL (Console Mode):');
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    console.log('---');
    console.log(options.text || 'See HTML version');
    console.log('---\n');
  }
}

/**
 * Email templates
 */
export class EmailTemplates {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:5173') {
    this.baseUrl = baseUrl;
  }

  verificationEmail(email: string, token: string): EmailOptions {
    const verifyUrl = `${this.baseUrl}/verify-email?token=${token}`;
    
    return {
      to: email,
      subject: 'Verify your email - Rogers Park Community',
      text: `Click this link to verify your email: ${verifyUrl}`,
      html: `
        <h2>Welcome to Rogers Park Community!</h2>
        <p>Click the link below to verify your email address:</p>
        <p><a href="${verifyUrl}">${verifyUrl}</a></p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
      `,
    };
  }

  passwordResetEmail(email: string, token: string): EmailOptions {
    const resetUrl = `${this.baseUrl}/reset-password?token=${token}`;
    
    return {
      to: email,
      subject: 'Reset your password - Rogers Park Community',
      text: `Click this link to reset your password: ${resetUrl}`,
      html: `
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request a password reset, you can safely ignore this email.</p>
      `,
    };
  }
}

// Export singleton instances
export const emailService = new ConsoleEmailService();
export const emailTemplates = new EmailTemplates();
