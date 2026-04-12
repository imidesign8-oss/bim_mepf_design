import PDFDocument from "pdfkit";
import { Readable } from "stream";

export interface ProposalData {
  clientName: string;
  clientEmail: string;
  clientCompany?: string;
  projectName: string;
  projectType: string;
  buildingArea: number;
  complexity: string;
  timeline: string;
  disciplines: string[];
  additionalServices: string[];
  coordinationRequired: boolean;
  estimatedPrice: number;
  priceBreakdown: {
    basePrice: number;
    complexityMultiplier: number;
    timelineMultiplier: number;
    coordinationBonus: number;
    existingModelsDiscount: number;
  };
  deliverables: string[];
  milestones: Array<{
    name: string;
    duration: string;
    description: string;
  }>;
  proposalDate: Date;
  validityDays?: number;
}

const BRAND_COLOR = "#ED1C24"; // IMI Design red
const SECONDARY_COLOR = "#333333";
const LIGHT_GRAY = "#F5F5F5";

export async function generateProposalPDF(
  data: ProposalData
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 40,
      });

      const chunks: Buffer[] = [];

      doc.on("data", (chunk) => {
        chunks.push(chunk);
      });

      doc.on("end", () => {
        resolve(Buffer.concat(chunks));
      });

      doc.on("error", reject);

      // Header with logo and company info
      doc.fontSize(24).font("Helvetica-Bold").fillColor(BRAND_COLOR).text("IMI DESIGN", 40, 40);

      doc.fontSize(10).font("Helvetica").fillColor(SECONDARY_COLOR);
      doc.text("Professional BIM & MEPF Design Services", 40, 70);
      doc.text("Email: info@imidesign.in | Web: www.imidesign.in", 40, 85);

      // Horizontal line
      doc.strokeColor(BRAND_COLOR).lineWidth(2).moveTo(40, 105).lineTo(555, 105).stroke();

      // Title
      doc.fontSize(18).font("Helvetica-Bold").fillColor(SECONDARY_COLOR).text("PROJECT PROPOSAL", 40, 125);

      // Proposal details section
      doc.fontSize(10).font("Helvetica").fillColor(SECONDARY_COLOR);
      doc.text(`Proposal Date: ${data.proposalDate.toLocaleDateString("en-IN")}`, 40, 155);
      doc.text(
        `Valid Until: ${new Date(data.proposalDate.getTime() + (data.validityDays || 30) * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN")}`,
        40,
        170
      );

      // Client information section
      doc.fontSize(12).font("Helvetica-Bold").fillColor(BRAND_COLOR).text("CLIENT INFORMATION", 40, 200);
      doc.fontSize(10).font("Helvetica").fillColor(SECONDARY_COLOR);
      doc.text(`Name: ${data.clientName}`, 40, 220);
      doc.text(`Email: ${data.clientEmail}`, 40, 235);
      if (data.clientCompany) {
        doc.text(`Company: ${data.clientCompany}`, 40, 250);
      }

      // Project overview section
      const projectY = data.clientCompany ? 280 : 265;
      doc.fontSize(12).font("Helvetica-Bold").fillColor(BRAND_COLOR).text("PROJECT OVERVIEW", 40, projectY);
      doc.fontSize(10).font("Helvetica").fillColor(SECONDARY_COLOR);
      doc.text(`Project Name: ${data.projectName}`, 40, projectY + 20);
      doc.text(`Project Type: ${data.projectType}`, 40, projectY + 35);
      doc.text(`Building Area: ${data.buildingArea.toLocaleString()} sqft`, 40, projectY + 50);
      doc.text(`Complexity Level: ${data.complexity}`, 40, projectY + 65);
      doc.text(`Timeline: ${data.timeline}`, 40, projectY + 80);
      doc.text(`Disciplines: ${data.disciplines.join(", ")}`, 40, projectY + 95);

      // Pricing section
      const pricingY = projectY + 130;
      doc.fontSize(12).font("Helvetica-Bold").fillColor(BRAND_COLOR).text("PRICING BREAKDOWN", 40, pricingY);

      // Pricing table
      const tableTop = pricingY + 25;
      const col1 = 40;
      const col2 = 380;
      const rowHeight = 20;

      // Table header
      doc.rect(col1, tableTop, 515, rowHeight).fill(LIGHT_GRAY);
      doc.fontSize(10).font("Helvetica-Bold").fillColor(SECONDARY_COLOR);
      doc.text("Description", col1 + 10, tableTop + 5);
      doc.text("Amount (₹)", col2 + 10, tableTop + 5);

      // Table rows
      let currentY = tableTop + rowHeight;
      const rows = [
        ["Base Service Price", `₹${data.priceBreakdown.basePrice.toLocaleString("en-IN")}`],
        [
          `Complexity Multiplier (${data.complexity})`,
          `${(data.priceBreakdown.complexityMultiplier * 100).toFixed(0)}%`,
        ],
        [
          `Timeline Adjustment (${data.timeline})`,
          `${(data.priceBreakdown.timelineMultiplier * 100).toFixed(0)}%`,
        ],
      ];

      if (data.priceBreakdown.coordinationBonus > 0) {
        rows.push(["Multi-Discipline Coordination", `+₹${data.priceBreakdown.coordinationBonus.toLocaleString("en-IN")}`]);
      }

      if (data.priceBreakdown.existingModelsDiscount > 0) {
        rows.push(["Existing Models Discount", `-₹${data.priceBreakdown.existingModelsDiscount.toLocaleString("en-IN")}`]);
      }

      rows.forEach((row, index) => {
        if (index % 2 === 0) {
          doc.rect(col1, currentY, 515, rowHeight).fill(LIGHT_GRAY);
        }
        doc.fontSize(10).font("Helvetica").fillColor(SECONDARY_COLOR);
        doc.text(row[0], col1 + 10, currentY + 5);
        doc.text(row[1], col2 + 10, currentY + 5);
        currentY += rowHeight;
      });

      // Total
      doc.rect(col1, currentY, 515, rowHeight).fill(BRAND_COLOR);
      doc.fontSize(11).font("Helvetica-Bold").fillColor("white");
      doc.text("TOTAL ESTIMATED PRICE", col1 + 10, currentY + 5);
      doc.text(`₹${data.estimatedPrice.toLocaleString("en-IN")}`, col2 + 10, currentY + 5);

      // Deliverables section
      const deliverablesY = currentY + 40;
      doc.fontSize(12).font("Helvetica-Bold").fillColor(BRAND_COLOR).text("DELIVERABLES", 40, deliverablesY);
      doc.fontSize(10).font("Helvetica").fillColor(SECONDARY_COLOR);

      let delivY = deliverablesY + 20;
      data.deliverables.forEach((deliverable) => {
        doc.text(`• ${deliverable}`, 50, delivY);
        delivY += 15;
      });

      // Milestones section
      const milestonesY = delivY + 15;
      doc.fontSize(12).font("Helvetica-Bold").fillColor(BRAND_COLOR).text("PROJECT TIMELINE", 40, milestonesY);
      doc.fontSize(10).font("Helvetica").fillColor(SECONDARY_COLOR);

      let milestoneY = milestonesY + 20;
      data.milestones.forEach((milestone, index) => {
        doc.font("Helvetica-Bold").text(`${index + 1}. ${milestone.name}`, 50, milestoneY);
        doc.font("Helvetica").fillColor("#666666");
        doc.text(`Duration: ${milestone.duration}`, 60, milestoneY + 15);
        doc.text(`${milestone.description}`, 60, milestoneY + 30);
        milestoneY += 60;
      });

      // Terms and conditions section
      const termsY = milestoneY + 10;
      doc.fontSize(12).font("Helvetica-Bold").fillColor(BRAND_COLOR).text("TERMS & CONDITIONS", 40, termsY);
      doc.fontSize(9).font("Helvetica").fillColor(SECONDARY_COLOR);

      const termsText = `
1. This proposal is valid for ${data.validityDays || 30} days from the proposal date.
2. A 50% advance payment is required to initiate the project.
3. The remaining 50% is due upon project completion.
4. Project timeline may be adjusted based on client feedback and change requests.
5. Additional services beyond the scope will be billed separately.
6. All deliverables remain the property of IMI DESIGN until full payment is received.
7. Intellectual property rights transfer upon complete payment.
8. Cancellation after project initiation will incur a 25% cancellation fee.
      `.trim();

      doc.text(termsText, 40, termsY + 20, {
        width: 515,
        align: "left",
      });

      // Footer
      const pageHeight = doc.page.height;
      doc.fontSize(9).font("Helvetica").fillColor("#999999");
      doc.text("IMI DESIGN - Professional BIM & MEPF Design Services", 40, pageHeight - 40, {
        align: "center",
        width: 515,
      });
      doc.text("For queries, contact: info@imidesign.in | +91-XXXX-XXXX-XXX", 40, pageHeight - 25, {
        align: "center",
        width: 515,
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

export async function generateProposalStream(data: ProposalData): Promise<Readable> {
  const buffer = await generateProposalPDF(data);
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);
  return readable;
}
