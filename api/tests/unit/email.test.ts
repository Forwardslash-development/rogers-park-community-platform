import { describe, it, expect } from 'vitest';
import { EmailTemplates } from '../../src/services/email';

describe('Email Templates', () => {
  const templates = new EmailTemplates('http://localhost:5173');

  describe('verificationEmail', () => {
    it('should generate verification email with correct fields', () => {
      const email = templates.verificationEmail('test@example.com', 'token123');
      
      expect(email.to).toBe('test@example.com');
      expect(email.subject).toContain('Verify your email');
      expect(email.text).toContain('verify-email?token=token123');
      expect(email.html).toContain('verify-email?token=token123');
    });

    it('should include token in verification URL', () => {
      const email = templates.verificationEmail('user@test.com', 'abc123xyz');
      
      expect(email.text).toContain('token=abc123xyz');
      expect(email.html).toContain('token=abc123xyz');
    });
  });

  describe('passwordResetEmail', () => {
    it('should generate password reset email with correct fields', () => {
      const email = templates.passwordResetEmail('test@example.com', 'reset456');
      
      expect(email.to).toBe('test@example.com');
      expect(email.subject).toContain('Reset your password');
      expect(email.text).toContain('reset-password?token=reset456');
      expect(email.html).toContain('reset-password?token=reset456');
    });

    it('should include expiry information', () => {
      const email = templates.passwordResetEmail('user@test.com', 'token');
      
      expect(email.html).toContain('1 hour');
    });
  });
});
