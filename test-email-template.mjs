import { emailTemplates } from './server/services/emailMarketingTemplates.ts';

const template = emailTemplates.architect;
console.log('=== EMAIL TEMPLATE TEST ===\n');
console.log('Template name:', template.name);
console.log('Template subject:', template.subject);
console.log('\n=== Checking for logo URL ===');
console.log('Contains CDN URL:', template.html.includes('d2xsxph8kpxj0f.cloudfront.net'));
console.log('Contains logo.png:', template.html.includes('logo_230a91c4.png'));
console.log('Contains img tag:', template.html.includes('<img'));

console.log('\n=== First 800 characters of HTML ===');
console.log(template.html.substring(0, 800));

console.log('\n=== Searching for img tag ===');
const imgMatch = template.html.match(/<img[^>]*>/);
if (imgMatch) {
  console.log('Found img tag:', imgMatch[0]);
} else {
  console.log('No img tag found!');
}
