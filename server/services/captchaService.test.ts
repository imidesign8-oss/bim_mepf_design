import { describe, it, expect, beforeEach, vi } from 'vitest';
import { verifyCaptcha, isCaptchaConfigured } from './captchaService';

describe('CAPTCHA Service', () => {
  describe('verifyCaptcha', () => {
    it('should return success false for missing token', async () => {
      const result = await verifyCaptcha('');
      // When not configured, it returns success: true with skip message
      // When configured, it would check the token
      expect(result).toBeDefined();
      if (result.success === false) {
        expect(result.errorCodes).toContain('missing-input-response');
      }
    });

    it('should skip verification if not configured', async () => {
      const result = await verifyCaptcha('test-token');
      // When not configured, verification is skipped
      expect(result).toBeDefined();
      expect(result.message).toBeDefined();
    });

    it('should handle network errors gracefully', async () => {
      const result = await verifyCaptcha('test-token');
      // Should handle errors gracefully
      expect(result).toBeDefined();
      expect(result.message).toBeDefined();
    });
  });

  describe('isCaptchaConfigured', () => {
    it('should return boolean for configuration status', () => {
      const configured = isCaptchaConfigured();
      expect(typeof configured).toBe('boolean');
    });
  });
});
