/**
 * Email Marketing Templates
 * Professional HTML templates for architects and builders with logo and unsubscribe support
 */

const LOGO_URL = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663379809910/dQGMwfPzENE9oJMqbRVUVv/logo_230a91c4.png';

export const emailTemplates = {
  architect: {
    name: 'Architect Template',
    subject: 'Transform Your Building Projects with Advanced BIM & MEPF Design',
    preview: 'Discover how our BIM and MEPF expertise can streamline your architectural projects...',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #ED1C24; color: white; padding: 30px; text-align: center; border-radius: 5px 5px 0 0; }
    .header img { max-width: 100px; width: 100px; height: 100px; margin-bottom: 15px; display: block; border: none; }
    .header h1 { margin: 0; font-size: 28px; }
    .header p { margin: 10px 0 0 0; font-size: 14px; }
    .content { background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
    .section { margin-bottom: 20px; }
    .section h2 { color: #ED1C24; font-size: 20px; margin-top: 0; }
    .section p { margin: 10px 0; }
    .benefits { list-style: none; padding: 0; }
    .benefits li { padding: 8px 0; padding-left: 25px; position: relative; }
    .benefits li:before { content: "✓"; position: absolute; left: 0; color: #ED1C24; font-weight: bold; }
    .cta-button { display: inline-block; background-color: #ED1C24; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
    .cta-button:hover { background-color: #c41620; }
    .footer { background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 5px 5px; }
    .footer a { color: #ED1C24; text-decoration: none; }
    .unsubscribe { margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663379809910/dQGMwfPzENE9oJMqbRVUVv/logo_230a91c4.png" alt="IMI DESIGN Logo" width="100" height="100" style="max-width: 100px; width: 100px; height: 100px; display: block; margin: 0 auto; border: none; background-color: transparent;" />
      <h1>IMI DESIGN</h1>
      <p>BIM & MEPF Design Excellence</p>
    </div>
    
    <div class="content">
      <div class="section">
        <h2>Dear Architect,</h2>
        <p>Are you looking to elevate your building design projects with cutting-edge BIM technology and expert MEPF design solutions?</p>
      </div>

      <div class="section">
        <h2>Why Choose IMI DESIGN?</h2>
        <ul class="benefits">
          <li>Advanced BIM Modeling & Coordination</li>
          <li>Expert MEPF (Mechanical, Electrical, Plumbing, Fire) Design</li>
          <li>Clash Detection & Resolution</li>
          <li>3D Visualization & Renderings</li>
          <li>Construction Documentation</li>
          <li>Compliance with International Standards</li>
          <li>On-time Project Delivery</li>
          <li>Cost-Effective Solutions</li>
        </ul>
      </div>

      <div class="section">
        <h2>Our Expertise</h2>
        <p>With years of experience in BIM and MEPF design, we help architects and builders:</p>
        <ul class="benefits">
          <li>Reduce project timelines by up to 30%</li>
          <li>Minimize construction conflicts</li>
          <li>Improve design accuracy and quality</li>
          <li>Enhance client presentations</li>
          <li>Streamline coordination between disciplines</li>
        </ul>
      </div>

      <div class="section">
        <p style="text-align: center;">
          <a href="https://imidesign.in/services" class="cta-button">Explore Our Services</a>
        </p>
      </div>

      <div class="section">
        <h2>Let's Collaborate</h2>
        <p>Whether you need BIM coordination, MEPF design, or complete design services, we're here to support your projects.</p>
        <p><strong>Contact us today for a consultation:</strong></p>
        <p>
          📧 Email: projects@imidesign.in<br>
          📞 Phone: +91 9405707777<br>
          🌐 Website: https://imidesign.in
        </p>
      </div>
    </div>

    <div class="footer">
      <p>© 2026 IMI DESIGN. All rights reserved.</p>
      <div class="unsubscribe">
        <p><a href="{unsubscribeLink}">Unsubscribe from this mailing list</a></p>
      </div>
    </div>
  </div>
</body>
</html>
    `,
  },

  builder: {
    name: 'Builder Template',
    subject: 'Streamline Your Construction Projects with Professional BIM & MEP Services',
    preview: 'Discover how our BIM and MEP expertise can optimize your construction workflows...',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #ED1C24; color: white; padding: 30px; text-align: center; border-radius: 5px 5px 0 0; }
    .header img { max-width: 100px; width: 100px; height: 100px; margin-bottom: 15px; display: block; border: none; }
    .header h1 { margin: 0; font-size: 28px; }
    .header p { margin: 10px 0 0 0; font-size: 14px; }
    .content { background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
    .section { margin-bottom: 20px; }
    .section h2 { color: #ED1C24; font-size: 20px; margin-top: 0; }
    .section p { margin: 10px 0; }
    .benefits { list-style: none; padding: 0; }
    .benefits li { padding: 8px 0; padding-left: 25px; position: relative; }
    .benefits li:before { content: "✓"; position: absolute; left: 0; color: #ED1C24; font-weight: bold; }
    .cta-button { display: inline-block; background-color: #ED1C24; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
    .cta-button:hover { background-color: #c41620; }
    .footer { background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 5px 5px; }
    .footer a { color: #ED1C24; text-decoration: none; }
    .unsubscribe { margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663379809910/dQGMwfPzENE9oJMqbRVUVv/logo_230a91c4.png" alt="IMI DESIGN Logo" width="100" height="100" style="max-width: 100px; width: 100px; height: 100px; display: block; margin: 0 auto; border: none; background-color: transparent;" />
      <h1>IMI DESIGN</h1>
      <p>Construction Excellence Through BIM & MEPF Design</p>
    </div>
    
    <div class="content">
      <div class="section">
        <h2>Dear Builder,</h2>
        <p>Maximize efficiency and minimize delays on your construction projects with professional BIM and MEPF design services.</p>
      </div>

      <div class="section">
        <h2>Construction Challenges We Solve</h2>
        <ul class="benefits">
          <li>Coordination between multiple trades</li>
          <li>Design clashes and conflicts</li>
          <li>Inaccurate construction documentation</li>
          <li>Delays due to design changes</li>
          <li>Quality control issues</li>
          <li>Cost overruns</li>
        </ul>
      </div>

      <div class="section">
        <h2>Our Construction Solutions</h2>
        <ul class="benefits">
          <li>Comprehensive BIM Models for Construction</li>
          <li>Detailed MEP (Mechanical, Electrical, Plumbing) Design</li>
          <li>Clash Detection & Resolution Before Construction</li>
          <li>Accurate Construction Drawings & Specifications</li>
          <li>Site Coordination Support</li>
          <li>As-Built Documentation</li>
          <li>Real-time Project Updates</li>
        </ul>
      </div>

      <div class="section">
        <h2>Benefits for Your Projects</h2>
        <ul class="benefits">
          <li>Reduce construction time by up to 25%</li>
          <li>Minimize on-site conflicts and rework</li>
          <li>Improve quality and accuracy</li>
          <li>Better resource planning</li>
          <li>Enhanced client satisfaction</li>
          <li>Competitive advantage in bidding</li>
        </ul>
      </div>

      <div class="section">
        <p style="text-align: center;">
          <a href="https://imidesign.in/services" class="cta-button">Learn More About Our Services</a>
        </p>
      </div>

      <div class="section">
        <h2>Ready to Optimize Your Projects?</h2>
        <p>Let's discuss how our BIM and MEPF expertise can help your construction projects succeed.</p>
        <p><strong>Get in touch with our team:</strong></p>
        <p>
          📧 Email: projects@imidesign.in<br>
          📞 Phone: +91 9405707777<br>
          🌐 Website: https://imidesign.in
        </p>
      </div>
    </div>

    <div class="footer">
      <p>© 2026 IMI DESIGN. All rights reserved.</p>
      <div class="unsubscribe">
        <p><a href="{unsubscribeLink}">Unsubscribe from this mailing list</a></p>
      </div>
    </div>
  </div>
</body>
</html>
    `,
  },

  custom: {
    name: 'Custom Template',
    subject: 'Professional BIM & MEPF Design Services',
    preview: 'Discover our professional design solutions...',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #ED1C24; color: white; padding: 30px; text-align: center; border-radius: 5px 5px 0 0; }
    .header img { max-width: 100px; width: 100px; height: 100px; margin-bottom: 15px; display: block; border: none; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
    .section { margin-bottom: 20px; }
    .section h2 { color: #ED1C24; font-size: 20px; margin-top: 0; }
    .cta-button { display: inline-block; background-color: #ED1C24; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
    .footer { background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 5px 5px; }
    .footer a { color: #ED1C24; text-decoration: none; }
    .unsubscribe { margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663379809910/dQGMwfPzENE9oJMqbRVUVv/logo_230a91c4.png" alt="IMI DESIGN Logo" width="100" height="100" style="max-width: 100px; width: 100px; height: 100px; display: block; margin: 0 auto; border: none; background-color: transparent;" />
      <h1>IMI DESIGN</h1>
      <p>BIM & MEPF Design Services</p>
    </div>
    
    <div class="content">
      <div class="section">
        <h2>Hello,</h2>
        <p>We're reaching out to share how our BIM and MEPF design expertise can benefit your projects.</p>
        <p>At IMI DESIGN, we specialize in delivering high-quality design solutions that streamline your workflows and improve project outcomes.</p>
      </div>

      <div class="section">
        <p style="text-align: center;">
          <a href="https://imidesign.in/services" class="cta-button">Explore Our Services</a>
        </p>
      </div>

      <div class="section">
        <p>
          📧 Email: projects@imidesign.in<br>
          📞 Phone: +91 9405707777<br>
          🌐 Website: https://imidesign.in
        </p>
      </div>
    </div>

    <div class="footer">
      <p>© 2026 IMI DESIGN. All rights reserved.</p>
      <div class="unsubscribe">
        <p><a href="{unsubscribeLink}">Unsubscribe from this mailing list</a></p>
      </div>
    </div>
  </div>
</body>
</html>
    `,
  },
};

export type TemplateType = keyof typeof emailTemplates;

export function getTemplate(type: TemplateType) {
  return emailTemplates[type] || emailTemplates.custom;
}

export function getTemplateList() {
  return Object.entries(emailTemplates).map(([key, template]) => ({
    id: key,
    name: template.name,
    preview: template.preview,
  }));
}
