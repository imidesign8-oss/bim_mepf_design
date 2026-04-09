import { router, publicProcedure } from "../_core/trpc";
import { getAllProjects, getAllBlogPosts, getAllServices } from "../db";
import { getFullUrl } from "../../client/src/lib/seoHelpers";

/**
 * Generate XML sitemap for search engines
 * Includes all published projects, blog posts, and service pages
 */
export const sitemapRouter = router({
  // Generate XML sitemap
  generate: publicProcedure.query(async () => {
    try {
      const baseUrl = process.env.VITE_APP_URL || "https://imidesign.in";
      const now = new Date().toISOString().split("T")[0];

      // Fetch all data
      const projects = await getAllProjects();
      const blogPosts = await getAllBlogPosts();
      const services = await getAllServices();

      // Filter published items
      const publishedProjects = projects.filter(p => p.published);
      const publishedBlogPosts = blogPosts.filter(p => p.published);
      const publishedServices = services.filter(s => s.published);

      // Build sitemap XML
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

      // Add static pages
      const staticPages = [
        { url: "/", priority: "1.0", changefreq: "weekly" },
        { url: "/about", priority: "0.8", changefreq: "monthly" },
        { url: "/services", priority: "0.9", changefreq: "weekly" },
        { url: "/projects", priority: "0.9", changefreq: "weekly" },
        { url: "/blog", priority: "0.8", changefreq: "daily" },
        { url: "/contact", priority: "0.7", changefreq: "monthly" },
        { url: "/mep-calculator", priority: "0.8", changefreq: "monthly" },
      ];

      staticPages.forEach(page => {
        xml += "  <url>\n";
        xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
        xml += `    <lastmod>${now}</lastmod>\n`;
        xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
        xml += `    <priority>${page.priority}</priority>\n`;
        xml += "  </url>\n";
      });

      // Add service pages
      publishedServices.forEach(service => {
        xml += "  <url>\n";
        xml += `    <loc>${baseUrl}/services/${service.slug}</loc>\n`;
        xml += `    <lastmod>${new Date(service.updatedAt || service.createdAt).toISOString().split("T")[0]}</lastmod>\n`;
        xml += '    <changefreq>monthly</changefreq>\n';
        xml += '    <priority>0.8</priority>\n';
        xml += "  </url>\n";
      });

      // Add project pages
      publishedProjects.forEach(project => {
        xml += "  <url>\n";
        xml += `    <loc>${baseUrl}/projects/${project.slug}</loc>\n`;
        xml += `    <lastmod>${new Date(project.updatedAt || project.createdAt).toISOString().split("T")[0]}</lastmod>\n`;
        xml += '    <changefreq>monthly</changefreq>\n';
        xml += '    <priority>0.7</priority>\n';
        xml += "  </url>\n";
      });

      // Add blog post pages
      publishedBlogPosts.forEach(post => {
        xml += "  <url>\n";
        xml += `    <loc>${baseUrl}/blog/${post.slug}</loc>\n`;
        xml += `    <lastmod>${new Date(post.updatedAt || post.createdAt).toISOString().split("T")[0]}</lastmod>\n`;
        xml += '    <changefreq>weekly</changefreq>\n';
        xml += '    <priority>0.6</priority>\n';
        xml += "  </url>\n";
      });

      xml += "</urlset>";

      return {
        success: true,
        sitemap: xml,
        count: {
          staticPages: staticPages.length,
          services: publishedServices.length,
          projects: publishedProjects.length,
          blogPosts: publishedBlogPosts.length,
          total: staticPages.length + publishedServices.length + publishedProjects.length + publishedBlogPosts.length,
        },
      };
    } catch (error) {
      console.error("[SITEMAP] Error generating sitemap:", error);
      return {
        success: false,
        error: "Failed to generate sitemap",
        sitemap: null,
        count: { total: 0 },
      };
    }
  }),

  // Get sitemap stats
  getStats: publicProcedure.query(async () => {
    try {
      const projects = await getAllProjects();
      const blogPosts = await getAllBlogPosts();
      const services = await getAllServices();

      const publishedProjects = projects.filter(p => p.published).length;
      const publishedBlogPosts = blogPosts.filter(p => p.published).length;
      const publishedServices = services.filter(s => s.published).length;

      return {
        projects: publishedProjects,
        blogPosts: publishedBlogPosts,
        services: publishedServices,
        total: publishedProjects + publishedBlogPosts + publishedServices + 7, // +7 for static pages
      };
    } catch (error) {
      console.error("[SITEMAP] Error fetching stats:", error);
      return {
        projects: 0,
        blogPosts: 0,
        services: 0,
        total: 0,
      };
    }
  }),
});
