# How to Check Your Keywords Used on the Website

## Overview

There are multiple ways to check which keywords you've optimized for on your website. Each method provides different insights and serves different purposes.

---

## Method 1: Check SEO Audit Report (Fastest)

**File Location:** `SEO_AUDIT_REPORT.md` in your project root

**What You'll Find:**
- All 150+ keywords placed across pages
- Keyword placement location (meta tags, headings, content)
- Keyword density for each page
- Overall SEO health score

**How to Access:**
1. Open your project files
2. Find `SEO_AUDIT_REPORT.md`
3. Search for specific page or keyword
4. Review placement strategy

**Example:**
```
Home Page Keywords:
- Primary: "BIM modeling services", "MEPF design"
- Secondary: "3D coordination", "clash detection"
- Long-tail: "BIM modeling for commercial projects"
```

---

## Method 2: Check Individual Page Files

**For Each Page, Check:**

### Home Page (`client/src/pages/Home.tsx`)
1. Open the file
2. Look for `setPageTitle()` - contains page title keywords
3. Look for `setPageDescription()` - contains meta description keywords
4. Search for `<h1>`, `<h2>`, `<h3>` tags - contains heading keywords
5. Review body text for keyword mentions

**Example Keywords Found:**
```
Title: "Professional BIM Modeling & MEPF Design Services | IMI Design"
Description: "Expert BIM modeling and MEP coordination services..."
H1: "Professional BIM & MEPF Design Services"
```

### Services Page (`client/src/pages/Services.tsx`)
1. Check page title for service keywords
2. Review each service section heading
3. Look for service-specific keywords in descriptions
4. Check for long-tail keywords

### About Page (`client/src/pages/About.tsx`)
1. Check company description keywords
2. Review team expertise keywords
3. Look for industry experience keywords

### Blog Page (`client/src/pages/Blog.tsx`)
1. Check blog post titles (contain keywords)
2. Review post descriptions
3. Look for category keywords

### Contact Page (`client/src/pages/Contact.tsx`)
1. Check page title keywords
2. Review call-to-action keywords
3. Look for location-based keywords

### Projects Page (`client/src/pages/Projects.tsx`)
1. Check project title keywords
2. Review project description keywords
3. Look for industry/service keywords

---

## Method 3: Check Google Search Console (Most Accurate)

**This shows keywords that are ACTUALLY ranking in Google**

### Step 1: Log into GSC
1. Go to https://search.google.com/search-console
2. Click on your property (imidesign.in)
3. Click "Performance" in left menu

### Step 2: View Keywords
1. Look at "Queries" tab (default view)
2. You'll see:
   - **Query**: The keyword
   - **Impressions**: How many times it appeared in search results
   - **Clicks**: How many times users clicked your result
   - **CTR**: Click-through rate
   - **Position**: Average ranking position (1-100)

### Step 3: Filter & Analyze
1. **Sort by Impressions** - See most visible keywords
2. **Sort by Clicks** - See keywords driving traffic
3. **Filter by Position** - See keywords ranking 1-10 (top performers)
4. **Filter by Position** - See keywords ranking 11-20 (optimization opportunities)

### Example GSC Data:
```
Keyword                          Impressions  Clicks  CTR    Position
BIM modeling services            45           8       17.8%  4
MEP coordination                 32           5       15.6%  6
clash detection                  28           3       10.7%  9
BIM vs CAD                       15           2       13.3%  12
3D coordination                  12           1       8.3%   18
```

---

## Method 4: Check Analytics for Organic Keywords

**This shows keywords that brought traffic to your site**

### Step 1: Log into Google Analytics
1. Go to https://analytics.google.com
2. Click on your property (IMI Design)
3. Click "Acquisition" → "Google Organic Search"

### Step 2: View Keywords
1. You'll see:
   - **Keyword**: The search term used
   - **Sessions**: Number of visits from this keyword
   - **Users**: Number of unique users
   - **Bounce Rate**: % of users who left immediately
   - **Conversion Rate**: % of users who converted

### Step 3: Analyze Performance
1. **High Sessions, High Conversion** - Best keywords
2. **High Sessions, Low Conversion** - Keywords to optimize
3. **Low Sessions, High Conversion** - Keywords with high intent
4. **Low Sessions, Low Conversion** - Keywords to deprioritize

### Example Analytics Data:
```
Keyword                    Sessions  Conversions  Conv. Rate
BIM modeling services      24        2            8.3%
MEP coordination           18        1            5.6%
clash detection            12        0            0%
BIM design company         8         1            12.5%
3D coordination services   6         0            0%
```

---

## Method 5: Check SEO Strategy Documents

**Files to Review:**

### 1. SEO_KEYWORDS_STRATEGY.md
**Contains:**
- Primary keywords for each page
- Secondary keywords
- Long-tail keywords
- Keyword research methodology
- Target search volume
- Competition level

**Example:**
```
Home Page:
Primary: "BIM modeling services", "MEPF design services"
Secondary: "3D coordination", "clash detection"
Long-tail: "BIM modeling for commercial buildings"
Target Volume: 500-1000 searches/month
Competition: Medium
```

### 2. INTERNAL_LINKING_STRATEGY.md
**Contains:**
- Keywords used in anchor text
- Internal link structure
- Keyword distribution across links
- Authority flow strategy

**Example:**
```
Services Page → Projects Page
Anchor Text: "View our BIM modeling projects"
Keyword: "BIM modeling"
```

### 3. SERVICE_SCHEMA_MARKUP.md
**Contains:**
- Service-specific keywords
- Schema markup keywords
- Rich snippet keywords
- Featured snippet targets

---

## Method 6: Check Meta Tags Directly in Browser

**For Any Page:**

### Step 1: Open Page in Browser
1. Go to https://imidesign.in
2. Right-click on page
3. Click "View Page Source" (or press Ctrl+U)

### Step 2: Find Meta Tags
1. Search for `<meta name="description"` - Contains meta description keywords
2. Search for `<title>` - Contains page title keywords
3. Search for `<meta name="keywords"` - Contains keyword list (if present)

### Step 3: Check Headings
1. Search for `<h1>` - Primary heading keywords
2. Search for `<h2>` - Secondary heading keywords
3. Search for `<h3>` - Tertiary heading keywords

### Example:
```html
<title>Professional BIM Modeling & MEPF Design Services | IMI Design</title>
<meta name="description" content="Expert BIM modeling and MEP coordination services for commercial projects...">
<h1>Professional BIM & MEPF Design Services</h1>
<h2>BIM Modeling Solutions</h2>
```

---

## Method 7: Use Free SEO Tools

### Google PageSpeed Insights
1. Go to https://pagespeed.web.dev
2. Enter your URL
3. Check for keyword optimization suggestions

### Ubersuggest (Free Version)
1. Go to https://ubersuggest.com
2. Enter your domain
3. See keywords your site ranks for
4. View search volume and competition

### SEMrush Free Tool
1. Go to https://www.semrush.com/analytics/overview
2. Enter your domain
3. See top organic keywords
4. View ranking positions

---

## Quick Reference: Keywords by Page

### Home Page
**Primary Keywords:** BIM modeling services, MEPF design, 3D coordination  
**Meta Title:** Professional BIM Modeling & MEPF Design Services | IMI Design  
**Meta Description:** Expert BIM modeling and MEP coordination services for commercial projects...

### Services Page
**Primary Keywords:** BIM modeling, MEP coordination, clash detection  
**Meta Title:** Professional BIM & MEPF Design Services | IMI Design  
**Meta Description:** Explore our BIM modeling, MEP coordination, and design services...

### About Page
**Primary Keywords:** BIM design company, MEPF expertise, design professionals  
**Meta Title:** About IMI Design - BIM & MEPF Design Experts  
**Meta Description:** Learn about IMI Design's team of BIM and MEPF design professionals...

### Blog Page
**Primary Keywords:** BIM blog, design insights, coordination tips  
**Meta Title:** BIM & MEPF Design Blog | Industry Insights & Tips  
**Meta Description:** Read our latest blog posts on BIM modeling, MEP coordination...

### Contact Page
**Primary Keywords:** Contact BIM design, get quote, BIM services  
**Meta Title:** Contact IMI Design - Get Your BIM Quote Today  
**Meta Description:** Contact IMI Design for professional BIM modeling and MEPF services...

### Projects Page
**Primary Keywords:** BIM projects, design portfolio, case studies  
**Meta Title:** BIM Design Projects & Portfolio | IMI Design  
**Meta Description:** View our completed BIM modeling and MEP coordination projects...

### Client Portal Page
**Primary Keywords:** Client portal, project tracking, quote status  
**Meta Title:** Client Portal - IMI Design  
**Meta Description:** Access your project status, quotes, and documents in our client portal...

---

## How to Track Keyword Performance Over Time

### Weekly Check
1. Open Google Search Console
2. Note top 5 keywords
3. Record impressions and clicks
4. Track position changes

### Monthly Check
1. Generate GSC report
2. Compare to previous month
3. Identify trending keywords
4. Note keywords losing visibility

### Quarterly Check
1. Review all 150+ keywords
2. Identify top performers
3. Identify underperformers
4. Plan optimization strategy

---

## Keywords Ranking Status (As of April 20, 2026)

**Currently Ranking (Expected):**
- BIM modeling services (Position 4-6)
- MEP coordination (Position 6-8)
- Clash detection (Position 9-12)
- BIM design (Position 8-10)
- 3D coordination (Position 15-20)

**Expected to Rank Soon (2-4 weeks):**
- BIM vs CAD (Position 12-15)
- MEP coordination Revit (Position 15-20)
- BIM clash detection best practices (Position 20+)

**Long-tail Keywords (Targeting):**
- BIM modeling for commercial buildings
- MEP coordination in Revit
- Clash detection best practices
- BIM design services near me

---

## Troubleshooting: Can't Find Keywords

### If Keywords Don't Appear in GSC
1. **Wait 1-2 weeks** - New sites take time to index
2. **Check if site is indexed** - Go to GSC → Coverage
3. **Verify DNS record** - Ensure verification is complete
4. **Submit sitemap** - Go to GSC → Sitemaps → Submit

### If Keywords Don't Appear in Analytics
1. **Check tracking code** - Verify GA code is on all pages
2. **Wait 24 hours** - Analytics takes time to process
3. **Check filters** - Ensure no filters are excluding data
4. **Test in incognito mode** - Ensure tracking works

### If Page Source Doesn't Show Keywords
1. **Check if page is React** - Keywords may be in JavaScript
2. **Open DevTools** - Press F12 → Elements tab
3. **Search for keywords** - Use Ctrl+F to search

---

## Best Practices for Keyword Tracking

1. **Check GSC Weekly** - Monitor ranking changes
2. **Review Analytics Monthly** - Track traffic trends
3. **Update Strategy Quarterly** - Adjust based on performance
4. **Document Changes** - Keep records of optimization efforts
5. **A/B Test Keywords** - Try different keywords in titles/descriptions
6. **Monitor Competitors** - Track their keyword strategy
7. **Focus on High-Intent Keywords** - Prioritize keywords that convert

---

## Summary

**Quick Access Methods:**
1. **Fastest:** Check `SEO_AUDIT_REPORT.md` file
2. **Most Accurate:** Check Google Search Console
3. **Traffic Data:** Check Google Analytics
4. **Strategy:** Check `SEO_KEYWORDS_STRATEGY.md` file
5. **Page Source:** Right-click → View Page Source

**Next Steps:**
1. Check GSC this week for first keywords
2. Monitor top 5 keywords daily
3. Optimize low-CTR keywords
4. Create blog content for target keywords
5. Build backlinks for competitive keywords

---

**Document Version:** 1.0  
**Last Updated:** April 20, 2026  
**Next Review:** May 4, 2026

