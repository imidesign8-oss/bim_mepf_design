/**
 * Google Analytics 4 Tracking Service
 * Provides utilities for tracking custom events in GA4
 */

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

/**
 * Track a custom event in Google Analytics 4
 * @param eventName - Name of the event (e.g., 'contact_form_submission')
 * @param eventData - Additional data to send with the event
 */
export function trackEvent(eventName: string, eventData?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventData || {});
  }
}

/**
 * Track contact form submission
 * @param leadScore - Lead score (0-100)
 * @param projectType - Type of project (BIM, MEPF, Quantities)
 * @param budget - Project budget range
 */
export function trackContactFormSubmission(
  leadScore: number,
  projectType?: string,
  budget?: string
) {
  trackEvent('contact_form_submission', {
    lead_score: leadScore,
    project_type: projectType,
    budget_range: budget,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track qualified lead (score >= 80)
 * @param leadScore - Lead score (0-100)
 * @param projectType - Type of project
 */
export function trackQualifiedLead(leadScore: number, projectType?: string) {
  trackEvent('qualified_lead', {
    lead_score: leadScore,
    project_type: projectType,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track MEP calculator usage
 * @param calculationType - Type of calculation (BIM or MEP)
 * @param disciplines - Selected disciplines (for MEP)
 * @param estimatedCost - Estimated cost from calculation
 */
export function trackMEPCalculatorUsage(
  calculationType: 'BIM' | 'MEP',
  disciplines?: string[],
  estimatedCost?: number
) {
  trackEvent('mep_calculator_used', {
    calculation_type: calculationType,
    disciplines: disciplines?.join(','),
    estimated_cost: estimatedCost,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track MEP calculator report download
 * @param calculationType - Type of calculation (BIM or MEP)
 * @param reportFormat - Format of the report (PDF, Email)
 */
export function trackReportDownload(
  calculationType: 'BIM' | 'MEP',
  reportFormat: 'PDF' | 'Email'
) {
  trackEvent('report_download', {
    calculation_type: calculationType,
    report_format: reportFormat,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track email report sharing
 * @param calculationType - Type of calculation (BIM or MEP)
 * @param recipientEmail - Email address of recipient
 */
export function trackEmailReportShare(
  calculationType: 'BIM' | 'MEP',
  recipientEmail?: string
) {
  trackEvent('report_email_shared', {
    calculation_type: calculationType,
    has_recipient: !!recipientEmail,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track chat conversation start
 * @param chatTopic - Topic of the chat (e.g., 'BIM Services', 'MEPF Design')
 */
export function trackChatStart(chatTopic?: string) {
  trackEvent('chat_started', {
    chat_topic: chatTopic,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track chat lead qualification
 * @param leadScore - Lead score from chat
 * @param qualified - Whether the lead was qualified
 */
export function trackChatLeadQualification(leadScore: number, qualified: boolean) {
  trackEvent('chat_lead_qualified', {
    lead_score: leadScore,
    qualified: qualified,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track page view with custom parameters
 * @param pagePath - Path of the page
 * @param pageTitle - Title of the page
 */
export function trackPageView(pagePath: string, pageTitle?: string) {
  trackEvent('page_view', {
    page_path: pagePath,
    page_title: pageTitle,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track service inquiry click
 * @param serviceName - Name of the service
 */
export function trackServiceInquiry(serviceName: string) {
  trackEvent('service_inquiry', {
    service_name: serviceName,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track project portfolio view
 * @param projectName - Name of the project
 * @param category - Category of the project
 */
export function trackProjectView(projectName: string, category?: string) {
  trackEvent('project_viewed', {
    project_name: projectName,
    project_category: category,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track blog post view
 * @param postTitle - Title of the blog post
 * @param readingTime - Estimated reading time in minutes
 */
export function trackBlogPostView(postTitle: string, readingTime?: number) {
  trackEvent('blog_post_viewed', {
    post_title: postTitle,
    reading_time_minutes: readingTime,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track subscription signup
 * @param subscriptionType - Type of subscription
 */
export function trackSubscriptionSignup(subscriptionType?: string) {
  trackEvent('subscription_signup', {
    subscription_type: subscriptionType,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track CTA button click
 * @param ctaText - Text of the CTA button
 * @param ctaLocation - Location of the CTA (e.g., 'hero', 'services', 'footer')
 */
export function trackCTAClick(ctaText: string, ctaLocation?: string) {
  trackEvent('cta_clicked', {
    cta_text: ctaText,
    cta_location: ctaLocation,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Set user properties for GA4
 * @param userId - User ID
 * @param userProperties - User properties object
 */
export function setUserProperties(userId: string, userProperties?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'G-G6YKJRGWX1', {
      user_id: userId,
      ...userProperties,
    });
  }
}

/**
 * Track conversion event
 * @param conversionType - Type of conversion (e.g., 'lead', 'contact', 'inquiry')
 * @param conversionValue - Value of the conversion
 */
export function trackConversion(conversionType: string, conversionValue?: number) {
  trackEvent('conversion', {
    conversion_type: conversionType,
    conversion_value: conversionValue,
    timestamp: new Date().toISOString(),
  });
}
