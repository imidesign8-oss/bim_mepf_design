/**
 * CAPTCHA Verification Service
 * Uses hCaptcha for bot prevention
 * 
 * hCaptcha is free, privacy-focused, and doesn't require complex setup
 */

const HCAPTCHA_VERIFY_URL = 'https://hcaptcha.com/siteverify';

export interface CaptchaVerificationResult {
  success: boolean;
  score?: number;
  challengeTs?: string;
  hostname?: string;
  errorCodes?: string[];
  message?: string;
}

/**
 * Verify hCaptcha token from client
 * The secret key should be stored in environment variables
 */
export async function verifyCaptcha(token: string, remoteIp?: string): Promise<CaptchaVerificationResult> {
  try {
    const secretKey = process.env.HCAPTCHA_SECRET_KEY;
    
    if (!secretKey) {
      console.warn('hCaptcha secret key not configured. Skipping verification.');
      // If not configured, allow the request but log it
      return {
        success: true,
        message: 'CAPTCHA verification skipped (not configured)',
      };
    }

    if (!token) {
      return {
        success: false,
        errorCodes: ['missing-input-response'],
        message: 'CAPTCHA token is missing',
      };
    }

    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (remoteIp) {
      formData.append('remoteip', remoteIp);
    }

    const response = await fetch(HCAPTCHA_VERIFY_URL, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!response.ok) {
      return {
        success: false,
        errorCodes: ['network-error'],
        message: `hCaptcha verification failed with status ${response.status}`,
      };
    }

    const data = await response.json();

    return {
      success: data.success === true,
      challengeTs: data.challenge_ts,
      hostname: data.hostname,
      errorCodes: data['error-codes'] || [],
      message: data.success ? 'CAPTCHA verified successfully' : 'CAPTCHA verification failed',
    };
  } catch (error) {
    console.error('CAPTCHA verification error:', error);
    return {
      success: false,
      errorCodes: ['exception'],
      message: error instanceof Error ? error.message : 'Unknown error during CAPTCHA verification',
    };
  }
}

/**
 * Get hCaptcha site key for frontend
 * This is public and safe to expose
 */
export function getHCaptchaSiteKey(): string {
  return process.env.HCAPTCHA_SITE_KEY || '';
}

/**
 * Check if CAPTCHA is configured
 */
export function isCaptchaConfigured(): boolean {
  return !!(process.env.HCAPTCHA_SECRET_KEY && process.env.HCAPTCHA_SITE_KEY);
}
