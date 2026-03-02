import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'localhost',
  user: process.env.DATABASE_URL?.split('://')[1]?.split(':')[0] || 'root',
  password: process.env.DATABASE_URL?.split(':')[2]?.split('@')[0] || '',
  database: process.env.DATABASE_URL?.split('/').pop() || 'bim_mepf',
});

console.log('Seeding database with sample content...\n');

// Sample Blog Posts
const blogPosts = [
  {
    title: 'The Future of BIM Technology in 2026',
    slug: 'future-of-bim-technology-2026',
    excerpt: 'Explore the latest trends and innovations in Building Information Modeling technology.',
    content: `<h2>Introduction to BIM Evolution</h2>
<p>Building Information Modeling has revolutionized the construction industry. In 2026, we see exciting advancements in AI integration, real-time collaboration, and cloud-based solutions.</p>
<h3>Key Trends</h3>
<ul>
<li>Artificial Intelligence in design optimization</li>
<li>Real-time multi-user collaboration</li>
<li>Enhanced data security and compliance</li>
<li>Integration with IoT devices</li>
</ul>
<p>These innovations are making BIM more accessible and powerful than ever before.</p>`,
    author: 'IMI DESIGN Team',
    published: true,
    publishedAt: new Date(),
    metaTitle: 'Future of BIM Technology 2026 | IMI DESIGN',
    metaDescription: 'Discover the latest BIM technology trends and innovations shaping the construction industry in 2026.',
    metaKeywords: 'BIM, Building Information Modeling, technology trends, construction',
  },
  {
    title: 'MEPF Coordination Best Practices',
    slug: 'mepf-coordination-best-practices',
    excerpt: 'Learn the best practices for coordinating mechanical, electrical, plumbing, and fire safety systems.',
    content: `<h2>Understanding MEPF Coordination</h2>
<p>Proper coordination of MEP systems is crucial for project success. This guide covers the essential practices.</p>
<h3>Best Practices</h3>
<ol>
<li>Early coordination planning</li>
<li>Regular clash detection reviews</li>
<li>Clear communication protocols</li>
<li>Detailed coordination drawings</li>
<li>Comprehensive documentation</li>
</ol>
<p>Following these practices ensures smooth project execution and reduces costly rework.</p>`,
    author: 'IMI DESIGN Team',
    published: true,
    publishedAt: new Date(),
    metaTitle: 'MEPF Coordination Best Practices | IMI DESIGN',
    metaDescription: 'Master MEPF coordination with our comprehensive guide to best practices and proven methodologies.',
    metaKeywords: 'MEPF, coordination, MEP systems, construction management',
  },
  {
    title: 'Case Study: Modern Office Complex BIM Project',
    slug: 'case-study-modern-office-complex',
    excerpt: 'A detailed case study of how BIM technology transformed a modern office complex project.',
    content: `<h2>Project Overview</h2>
<p>This case study examines a 50,000 sq ft modern office complex project completed using advanced BIM methodologies.</p>
<h3>Project Challenges</h3>
<ul>
<li>Complex MEP routing through tight spaces</li>
<li>Coordination between multiple trades</li>
<li>Strict timeline requirements</li>
</ul>
<h3>Solutions Implemented</h3>
<p>Through comprehensive BIM modeling and coordination, we achieved 98% accuracy in clash detection and reduced construction delays by 25%.</p>
<h3>Results</h3>
<p>The project was completed on time and within budget, with zero safety incidents.</p>`,
    author: 'IMI DESIGN Team',
    published: true,
    publishedAt: new Date(),
    metaTitle: 'Office Complex BIM Case Study | IMI DESIGN',
    metaDescription: 'See how our BIM expertise delivered a successful modern office complex project on time and budget.',
    metaKeywords: 'BIM case study, office complex, project management, construction',
  },
];

// Sample Services
const services = [
  {
    title: 'BIM Coordination',
    slug: 'bim-coordination',
    description: `<h2>Professional BIM Coordination Services</h2>
<p>Our expert BIM coordination services ensure seamless integration of all building systems.</p>
<h3>What We Offer</h3>
<ul>
<li>3D model development and management</li>
<li>Clash detection and resolution</li>
<li>Coordination drawings</li>
<li>Multi-discipline integration</li>
<li>Real-time collaboration</li>
</ul>
<p>We deliver precise, coordinated models that reduce construction conflicts and improve project efficiency.</p>`,
    shortDescription: 'Expert BIM coordination for seamless multi-discipline integration',
    order: 1,
    published: true,
    metaTitle: 'BIM Coordination Services | IMI DESIGN',
    metaDescription: 'Professional BIM coordination services for construction projects. Expert clash detection and 3D modeling.',
    metaKeywords: 'BIM coordination, 3D modeling, clash detection, construction',
  },
  {
    title: 'MEP Design & Modeling',
    slug: 'mep-design-modeling',
    description: `<h2>Comprehensive MEP Design Services</h2>
<p>From concept to detailed design, we provide complete MEP solutions.</p>
<h3>Services Include</h3>
<ul>
<li>Mechanical system design</li>
<li>Electrical system design</li>
<li>Plumbing system design</li>
<li>Fire safety system design</li>
<li>Energy efficiency optimization</li>
</ul>
<p>Our designs comply with all codes and standards while optimizing performance and cost.</p>`,
    shortDescription: 'Complete mechanical, electrical, and plumbing design solutions',
    order: 2,
    published: true,
    metaTitle: 'MEP Design Services | IMI DESIGN',
    metaDescription: 'Professional MEP design and modeling services for commercial and residential projects.',
    metaKeywords: 'MEP design, mechanical design, electrical design, plumbing design',
  },
  {
    title: '3D Visualization & Rendering',
    slug: '3d-visualization-rendering',
    description: `<h2>Professional 3D Visualization Services</h2>
<p>Bring your projects to life with stunning 3D renderings and visualizations.</p>
<h3>Deliverables</h3>
<ul>
<li>High-quality 3D renderings</li>
<li>Photorealistic visualizations</li>
<li>Animation walkthroughs</li>
<li>Virtual reality experiences</li>
<li>Marketing materials</li>
</ul>
<p>Perfect for presentations, marketing, and client communication.</p>`,
    shortDescription: 'Stunning 3D renderings and visualizations for your projects',
    order: 3,
    published: true,
    metaTitle: '3D Visualization Services | IMI DESIGN',
    metaDescription: 'Professional 3D rendering and visualization services for architects and developers.',
    metaKeywords: '3D rendering, visualization, architecture, virtual reality',
  },
];

// Sample Projects
const projects = [
  {
    title: 'Downtown Commercial Tower',
    slug: 'downtown-commercial-tower',
    description: `<h2>Downtown Commercial Tower Project</h2>
<p>A 40-story mixed-use commercial tower in the heart of the city.</p>
<h3>Project Details</h3>
<ul>
<li>Height: 500 feet</li>
<li>Total Area: 800,000 sq ft</li>
<li>Uses: Office, retail, residential</li>
<li>Completion: 2024</li>
</ul>
<h3>Our Role</h3>
<p>We provided comprehensive BIM coordination and MEP design services, managing coordination between 15+ trades and ensuring zero clash conflicts during construction.</p>`,
    shortDescription: 'A landmark 40-story mixed-use commercial tower',
    client: 'Metropolitan Development Corp',
    completionDate: 'June 2024',
    budget: '$250M+',
    status: 'completed',
    published: true,
    galleryImages: JSON.stringify([
      'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
    ]),
    metaTitle: 'Downtown Commercial Tower | IMI DESIGN',
    metaDescription: 'See our BIM coordination work on this landmark 40-story commercial tower project.',
    metaKeywords: 'commercial tower, BIM, construction, architecture',
  },
  {
    title: 'Healthcare Complex Renovation',
    slug: 'healthcare-complex-renovation',
    description: `<h2>Healthcare Complex Renovation</h2>
<p>Major renovation of a 200,000 sq ft healthcare facility.</p>
<h3>Project Scope</h3>
<ul>
<li>Complete MEP system upgrade</li>
<li>New operating rooms</li>
<li>Updated patient facilities</li>
<li>Enhanced safety systems</li>
</ul>
<h3>Challenges Overcome</h3>
<p>Working in an active healthcare facility required careful coordination and minimal disruption. Our BIM models helped plan every phase to ensure continuous operations.</p>`,
    shortDescription: 'Major renovation of healthcare facility with MEP upgrades',
    client: 'Regional Health Services',
    completionDate: 'March 2024',
    budget: '$85M',
    status: 'completed',
    published: true,
    galleryImages: JSON.stringify([
      'https://images.unsplash.com/photo-1576091160550-112173f7f869?w=800',
      'https://images.unsplash.com/photo-1576091160550-112173f7f869?w=800',
      'https://images.unsplash.com/photo-1576091160550-112173f7f869?w=800',
    ]),
    metaTitle: 'Healthcare Complex Renovation | IMI DESIGN',
    metaDescription: 'See our successful renovation of a major healthcare facility with advanced BIM coordination.',
    metaKeywords: 'healthcare, renovation, BIM, MEP systems',
  },
  {
    title: 'Residential Development Phase 2',
    slug: 'residential-development-phase-2',
    description: `<h2>Residential Development - Phase 2</h2>
<p>Phase 2 of a large residential development with 250 units.</p>
<h3>Project Features</h3>
<ul>
<li>250 residential units</li>
<li>Modern amenities</li>
<li>Sustainable design</li>
<li>Green spaces</li>
</ul>
<h3>Status</h3>
<p>Currently in construction phase with 60% completion. Our BIM coordination ensures smooth progress and quality standards.</p>`,
    shortDescription: '250-unit residential development in progress',
    client: 'Riverside Developments',
    completionDate: 'Expected Q4 2026',
    budget: '$120M',
    status: 'ongoing',
    published: true,
    galleryImages: JSON.stringify([
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
    ]),
    metaTitle: 'Residential Development Phase 2 | IMI DESIGN',
    metaDescription: 'Ongoing residential development project with 250 units. See our BIM coordination in action.',
    metaKeywords: 'residential, development, construction, BIM',
  },
];

try {
  // Insert Blog Posts
  console.log('Adding sample blog posts...');
  for (const post of blogPosts) {
    await connection.execute(
      `INSERT INTO blog_posts (title, slug, excerpt, content, author, published, publishedAt, metaTitle, metaDescription, metaKeywords, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [post.title, post.slug, post.excerpt, post.content, post.author, post.published, post.publishedAt, post.metaTitle, post.metaDescription, post.metaKeywords]
    );
  }
  console.log(`✓ Added ${blogPosts.length} blog posts\n`);

  // Insert Services
  console.log('Adding sample services...');
  for (const service of services) {
    await connection.execute(
      `INSERT INTO services (title, slug, description, shortDescription, \`order\`, published, metaTitle, metaDescription, metaKeywords, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [service.title, service.slug, service.description, service.shortDescription, service.order, service.published, service.metaTitle, service.metaDescription, service.metaKeywords]
    );
  }
  console.log(`✓ Added ${services.length} services\n`);

  // Insert Projects
  console.log('Adding sample projects...');
  for (const project of projects) {
    await connection.execute(
      `INSERT INTO projects (title, slug, description, shortDescription, client, completionDate, budget, status, published, galleryImages, metaTitle, metaDescription, metaKeywords, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [project.title, project.slug, project.description, project.shortDescription, project.client, project.completionDate, project.budget, project.status, project.published, project.galleryImages, project.metaTitle, project.metaDescription, project.metaKeywords]
    );
  }
  console.log(`✓ Added ${projects.length} projects\n`);

  console.log('✅ Database seeding completed successfully!');
  console.log('\nSample content added:');
  console.log(`- ${blogPosts.length} blog posts`);
  console.log(`- ${services.length} services`);
  console.log(`- ${projects.length} projects`);

} catch (error) {
  console.error('❌ Error seeding database:', error);
  process.exit(1);
} finally {
  await connection.end();
}
