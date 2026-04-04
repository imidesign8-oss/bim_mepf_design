import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const connection = await mysql.createConnection(process.env.DATABASE_URL);

try {
  // Delete all existing services
  console.log('Deleting existing services...');
  await connection.execute('DELETE FROM services');
  
  // Insert new services
  const services = [
    // BIM Services
    {
      title: 'Building Information Modeling (BIM)',
      slug: 'building-information-modeling',
      shortDescription: '3D Modeling · Coordination · Clash Detection · 4D & 5D',
      description: `<h3>Building Information Modeling (BIM) Services</h3>
<p>Our comprehensive BIM services include:</p>
<ul>
<li><strong>3D Modeling:</strong> Creating detailed 3D models of building structures and systems</li>
<li><strong>Coordination:</strong> Coordinating between different trades and disciplines</li>
<li><strong>Clash Detection:</strong> Identifying and resolving conflicts between building systems</li>
<li><strong>4D & 5D:</strong> Adding time and cost dimensions to your BIM models for better project planning and budgeting</li>
</ul>
<p>We use industry-leading tools and best practices to deliver high-quality BIM models that improve project efficiency and reduce costs.</p>`,
      category: 'BIM',
      order: 1,
      published: true,
      metaTitle: 'BIM Services | Building Information Modeling',
      metaDescription: 'Professional BIM services including 3D modeling, coordination, clash detection, and 4D/5D analysis.',
      metaKeywords: 'BIM, Building Information Modeling, 3D Modeling, Clash Detection',
    },
    // MEPF Services
    {
      title: 'MEPF Design, Modeling & Coordination',
      slug: 'mepf-design-modeling-coordination',
      shortDescription: 'Mechanical · Electrical · Plumbing · Fire Protection',
      description: `<h3>MEPF Design, Modeling & Coordination Services</h3>
<p>Our MEPF services cover all mechanical, electrical, plumbing, and fire protection systems:</p>
<ul>
<li><strong>Mechanical Design:</strong> HVAC systems, equipment sizing, and ductwork design</li>
<li><strong>Electrical Design:</strong> Power distribution, lighting, and control systems</li>
<li><strong>Plumbing Design:</strong> Water supply, drainage, and sanitary systems</li>
<li><strong>Fire Protection:</strong> Sprinkler systems and fire safety design</li>
</ul>
<p>We ensure all systems are properly coordinated, efficient, and compliant with building codes and standards.</p>`,
      category: 'MEPF',
      order: 1,
      published: true,
      metaTitle: 'MEPF Design Services | MEP Coordination',
      metaDescription: 'Expert MEPF design and coordination services for mechanical, electrical, plumbing, and fire protection systems.',
      metaKeywords: 'MEPF, MEP Design, Mechanical, Electrical, Plumbing, Fire Protection',
    },
    // Quantities & Estimation
    {
      title: 'Quantities & Estimating',
      slug: 'quantities-estimating',
      shortDescription: 'Material Take-Off · Bill of Quantities · Variation Quantification',
      description: `<h3>Quantities & Estimating Services</h3>
<p>Accurate material take-off and cost estimation for your projects:</p>
<ul>
<li><strong>Material Take-Off (MTO):</strong> Detailed extraction of materials and quantities from design documents</li>
<li><strong>Bill of Quantities (BOQ):</strong> Comprehensive BOQ preparation for tendering and procurement</li>
<li><strong>Variation Quantification:</strong> Accurate measurement and documentation of design changes and variations</li>
</ul>
<p>Our experienced team uses advanced tools and methodologies to provide accurate quantities and estimates, helping you control project costs and avoid budget overruns.</p>`,
      category: 'Quantities & Estimation',
      order: 1,
      published: true,
      metaTitle: 'Quantities & Estimating Services | MTO & BOQ',
      metaDescription: 'Professional quantities and estimating services including MTO, BOQ preparation, and variation quantification.',
      metaKeywords: 'Quantities, Estimating, MTO, BOQ, Material Take-off, Bill of Quantities',
    },
  ];

  console.log('Inserting new services...');
  for (const service of services) {
    await connection.execute(
      `INSERT INTO services (title, slug, description, shortDescription, category, \`order\`, published, metaTitle, metaDescription, metaKeywords, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        service.title,
        service.slug,
        service.description,
        service.shortDescription,
        service.category,
        service.order,
        service.published,
        service.metaTitle,
        service.metaDescription,
        service.metaKeywords,
      ]
    );
    console.log(`✓ Created service: ${service.title}`);
  }

  console.log('\n✓ Services seeded successfully!');
} catch (error) {
  console.error('Error seeding services:', error);
  process.exit(1);
} finally {
  await connection.end();
}
