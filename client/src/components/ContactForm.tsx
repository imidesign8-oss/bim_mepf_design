import React, { useState, useRef, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ContactFormProps {
  onSuccess?: () => void;
}

declare global {
  interface Window {
    hcaptcha?: any;
  }
}

export function ContactForm({ onSuccess }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [captchaToken, setCaptchaToken] = useState<string>('');
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const captchaRef = useRef<HTMLDivElement>(null);
  const submitMutation = trpc.contacts.submit.useMutation();

  // Load hCaptcha script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.hcaptcha.com/1/api.js';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Render hCaptcha when needed
  useEffect(() => {
    if (showCaptcha && window.hcaptcha && captchaRef.current && !captchaRef.current.innerHTML) {
      const siteKey = process.env.REACT_APP_HCAPTCHA_SITE_KEY || '';
      if (siteKey) {
        window.hcaptcha.render(captchaRef.current, {
          sitekey: siteKey,
          theme: 'light',
          callback: (token: string) => {
            setCaptchaToken(token);
          },
        });
      }
    }
  }, [showCaptcha]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // First attempt without CAPTCHA
      if (!showCaptcha) {
        setShowCaptcha(true);
        setLoading(false);
        return;
      }

      // Verify CAPTCHA token is present
      if (!captchaToken) {
        setError('Please complete the CAPTCHA verification');
        setLoading(false);
        return;
      }

      // Submit form with CAPTCHA token
      await submitMutation.mutateAsync({
        ...formData,
        captchaToken,
      });

      setSuccess(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setCaptchaToken('');
      setShowCaptcha(false);

      // Reset form after 3 seconds
      setTimeout(() => {
        setSuccess(false);
        onSuccess?.();
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit form. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Get in Touch</CardTitle>
        <CardDescription>
          Send us your inquiry and we'll respond within 24 hours
        </CardDescription>
      </CardHeader>
      <CardContent>
        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Thank you! Your message has been sent successfully. We'll get back to you soon.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-6 bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium mb-2">Name *</label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Your name"
              required
              disabled={loading}
            />
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium mb-2">Email *</label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="your@email.com"
              required
              disabled={loading}
            />
          </div>

          {/* Phone Field */}
          <div>
            <label className="block text-sm font-medium mb-2">Phone (Optional)</label>
            <Input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="+91 XXXXXXXXXX"
              disabled={loading}
            />
          </div>

          {/* Subject Field */}
          <div>
            <label className="block text-sm font-medium mb-2">Subject *</label>
            <Input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              placeholder="What is this about?"
              required
              disabled={loading}
            />
          </div>

          {/* Message Field */}
          <div>
            <label className="block text-sm font-medium mb-2">Message *</label>
            <Textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Tell us more about your project..."
              rows={5}
              required
              disabled={loading}
            />
          </div>

          {/* CAPTCHA */}
          {showCaptcha && (
            <div className="my-4 p-4 bg-gray-50 rounded-lg">
              <div ref={captchaRef} />
              {!captchaToken && (
                <p className="text-sm text-gray-600 mt-2">
                  Please complete the CAPTCHA verification above
                </p>
              )}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading || success}
            className="w-full"
            size="lg"
          >
            {loading && <Loader className="w-4 h-4 mr-2 animate-spin" />}
            {success ? 'Message Sent!' : 'Send Message'}
          </Button>

          {/* Rate Limit Notice */}
          <p className="text-xs text-gray-500 text-center">
            We limit submissions to 5 per hour per IP address to prevent spam.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
