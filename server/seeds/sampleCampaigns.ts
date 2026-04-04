/**
 * Sample Campaigns Seed Data
 * Pre-populated campaigns for demonstration
 */

export const sampleCampaigns = [
  {
    title: 'Service Promotion: BIM Coordination',
    description: 'Discover Our BIM Coordination Services - IMI DESIGN',
    template: 'architect',
    subject: 'Transform Your Building Projects with Advanced BIM Coordination',
    recipientType: 'architect',
    status: 'draft',
  },
  {
    title: 'Service Promotion: 3D Visualization & Rendering',
    description: 'Discover Our 3D Visualization & Rendering Services - IMI DESIGN',
    template: 'architect',
    subject: 'Elevate Your Presentations with Professional 3D Visualization',
    recipientType: 'architect',
    status: 'draft',
  },
  {
    title: 'Service Promotion: Clash Detection',
    description: 'Discover Our Clash Detection Services - IMI DESIGN',
    template: 'architect',
    subject: 'Minimize Construction Conflicts with Advanced Clash Detection',
    recipientType: 'architect',
    status: 'draft',
  },
  {
    title: 'Service Promotion: MEP Design',
    description: 'Discover Our MEP (Mechanical, Electrical, Plumbing) Design Services - IMI DESIGN',
    template: 'builder',
    subject: 'Optimize Your Construction Projects with Expert MEP Design',
    recipientType: 'builder',
    status: 'draft',
  },
  {
    title: 'Service Promotion: Construction Documentation',
    description: 'Discover Our Construction Documentation Services - IMI DESIGN',
    template: 'builder',
    subject: 'Accurate Construction Documentation for Seamless Project Execution',
    recipientType: 'builder',
    status: 'draft',
  },
  {
    title: 'General Outreach: BIM & MEPF Services',
    description: 'Professional BIM & MEPF Design Services - IMI DESIGN',
    template: 'custom',
    subject: 'Professional BIM & MEPF Design Services for Your Projects',
    recipientType: 'other',
    status: 'draft',
  },
  {
    title: 'Architects: Complete BIM Solutions',
    description: 'Complete BIM Solutions for Architects - IMI DESIGN',
    template: 'architect',
    subject: 'Complete BIM Solutions to Streamline Your Architectural Workflow',
    recipientType: 'architect',
    status: 'draft',
  },
  {
    title: 'Builders: Construction Efficiency',
    description: 'Construction Efficiency Through BIM & MEP Design - IMI DESIGN',
    template: 'builder',
    subject: 'Maximize Construction Efficiency with Professional BIM & MEP Design',
    recipientType: 'builder',
    status: 'draft',
  },
];

export const sampleRecipients = [
  {
    email: 'architect1@example.com',
    name: 'Rajesh Kumar',
    recipientType: 'architect',
    company: 'Kumar Architects',
    city: 'Mumbai',
    state: 'Maharashtra',
  },
  {
    email: 'architect2@example.com',
    name: 'Priya Sharma',
    recipientType: 'architect',
    company: 'Sharma Design Studio',
    city: 'Bangalore',
    state: 'Karnataka',
  },
  {
    email: 'builder1@example.com',
    name: 'Vikram Patel',
    recipientType: 'builder',
    company: 'Patel Construction',
    city: 'Pune',
    state: 'Maharashtra',
  },
  {
    email: 'builder2@example.com',
    name: 'Arun Desai',
    recipientType: 'builder',
    company: 'Desai Builders',
    city: 'Ahmedabad',
    state: 'Gujarat',
  },
  {
    email: 'professional1@example.com',
    name: 'Neha Singh',
    recipientType: 'other',
    company: 'Singh Engineering',
    city: 'Delhi',
    state: 'Delhi',
  },
  {
    email: 'professional2@example.com',
    name: 'Rohan Gupta',
    recipientType: 'other',
    company: 'Gupta Consultants',
    city: 'Hyderabad',
    state: 'Telangana',
  },
];
