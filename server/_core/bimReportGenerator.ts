/**
 * BIM Cost Estimation Report Generator
 * Generates HTML-based reports that can be converted to PDF
 */

export interface BimReportData {
  projectType: string;
  buildingArea: number;
  areaUnit: "sqft" | "sqm";
  lodLevel: string;
  lodPercentage: number;
  projectCost: number;
  bimCost: number;
  costPerUnit: number;
  accuracyRange: string;
  city: string;
  state: string;
  generatedDate: string;
}

/**
 * Generate BIM Cost Estimation Report as HTML
 */
export function generateBimReportHTML(data: BimReportData): string {
  const lodLevelMap: Record<string, string> = {
    "100": "Concept/Feasibility",
    "200": "Schematic Design",
    "300": "Design Development",
    "400": "Construction Documents",
    "500": "As-Built",
  };

  const lodDescription = lodLevelMap[data.lodLevel] || "Design Development";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>BIM Cost Estimation Report</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #1F2937;
      line-height: 1.6;
      background: white;
      padding: 20px;
    }
    
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 3px solid #DC2626;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    
    .company-info h1 {
      font-size: 28px;
      color: #DC2626;
      margin-bottom: 5px;
    }
    
    .company-info p {
      font-size: 14px;
      color: #6B7280;
    }
    
    .generated-date {
      text-align: right;
      font-size: 12px;
      color: #6B7280;
    }
    
    .report-title {
      font-size: 24px;
      font-weight: bold;
      color: #DC2626;
      margin-bottom: 30px;
      text-align: center;
      border-bottom: 2px solid #FEE2E2;
      padding-bottom: 15px;
    }
    
    .section {
      margin-bottom: 30px;
    }
    
    .section-title {
      font-size: 14px;
      font-weight: bold;
      color: #DC2626;
      margin-bottom: 12px;
      border-bottom: 1px solid #E5E7EB;
      padding-bottom: 5px;
    }
    
    .details-table {
      width: 100%;
      margin-bottom: 15px;
    }
    
    .details-table tr {
      border-bottom: 1px solid #E5E7EB;
    }
    
    .details-table td {
      padding: 8px 0;
    }
    
    .details-table td:first-child {
      color: #4B5563;
      font-weight: 500;
      width: 40%;
    }
    
    .details-table td:last-child {
      color: #1F2937;
      font-weight: 600;
      text-align: right;
    }
    
    .cost-box {
      background: #FEE2E2;
      padding: 20px;
      border-radius: 4px;
      margin-bottom: 20px;
      border-left: 4px solid #DC2626;
    }
    
    .total-cost {
      font-size: 32px;
      font-weight: bold;
      color: #DC2626;
      margin-bottom: 8px;
    }
    
    .cost-label {
      font-size: 12px;
      color: #6B7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .cost-per-unit {
      font-size: 14px;
      color: #4B5563;
      margin-top: 10px;
    }
    
    .lod-details {
      background: #F3F4F6;
      padding: 15px;
      border-radius: 4px;
      margin-bottom: 20px;
    }
    
    .lod-details h3 {
      font-size: 13px;
      color: #1F2937;
      margin-bottom: 8px;
      font-weight: 600;
    }
    
    .lod-details p {
      font-size: 12px;
      color: #4B5563;
      line-height: 1.5;
    }
    
    .accuracy-range {
      background: #DBEAFE;
      padding: 12px;
      border-radius: 4px;
      border-left: 3px solid #3B82F6;
      margin-bottom: 20px;
      font-size: 12px;
      color: #1E40AF;
    }
    
    .footer {
      border-top: 1px solid #E5E7EB;
      padding-top: 20px;
      margin-top: 40px;
      font-size: 11px;
      color: #6B7280;
      text-align: center;
    }
    
    .footer p {
      margin-bottom: 8px;
    }
    
    .page-break {
      page-break-after: always;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="company-info">
        <h1>IMI DESIGN</h1>
        <p>BIM & MEP SERVICES</p>
      </div>
      <div class="generated-date">
        Generated: ${data.generatedDate}
      </div>
    </div>
    
    <!-- Report Title -->
    <div class="report-title">BIM COST ESTIMATION REPORT</div>
    
    <!-- Project Details -->
    <div class="section">
      <div class="section-title">PROJECT DETAILS</div>
      <table class="details-table">
        <tr>
          <td>Project Type:</td>
          <td>${data.projectType.charAt(0).toUpperCase() + data.projectType.slice(1)}</td>
        </tr>
        <tr>
          <td>Building Area:</td>
          <td>${data.buildingArea.toLocaleString()} ${data.areaUnit === "sqft" ? "Sq Ft" : "Sq M"}</td>
        </tr>
        <tr>
          <td>Project Cost:</td>
          <td>₹${data.projectCost.toLocaleString()}</td>
        </tr>
        <tr>
          <td>Location:</td>
          <td>${data.city}, ${data.state}</td>
        </tr>
      </table>
    </div>
    
    <!-- LOD Details -->
    <div class="section">
      <div class="section-title">BIM LEVEL OF DETAIL (LOD)</div>
      <div class="lod-details">
        <h3>LOD ${data.lodLevel} - ${lodDescription}</h3>
        <p>
          This BIM model is developed to LOD ${data.lodLevel} standards, representing the appropriate level of detail 
          for ${lodDescription.toLowerCase()} phase. The model includes all necessary geometric and non-geometric information 
          required for the design phase with ${data.lodPercentage}% accuracy.
        </p>
      </div>
    </div>
    
    <!-- BIM Cost Breakdown -->
    <div class="section">
      <div class="section-title">BIM COST ESTIMATION</div>
      
      <div class="cost-box">
        <div class="cost-label">Total BIM Services Cost</div>
        <div class="total-cost">₹${data.bimCost.toLocaleString()}</div>
        <div class="cost-per-unit">
          <strong>Cost per Sq Ft:</strong> ₹${data.costPerUnit.toLocaleString()}
        </div>
      </div>
      
      <div class="accuracy-range">
        <strong>Accuracy Range:</strong> ${data.accuracyRange}
      </div>
      
      <table class="details-table">
        <tr>
          <td>BIM Service Percentage:</td>
          <td>${data.lodPercentage}% of Project Cost</td>
        </tr>
        <tr>
          <td>Project Cost Base:</td>
          <td>₹${data.projectCost.toLocaleString()}</td>
        </tr>
        <tr>
          <td>Calculated BIM Cost:</td>
          <td>₹${data.bimCost.toLocaleString()}</td>
        </tr>
      </table>
    </div>
    
    <!-- LOD Comparison Table -->
    <div class="section">
      <div class="section-title">BIM LOD REFERENCE GUIDE</div>
      <table class="details-table">
        <tr>
          <td><strong>LOD 100</strong></td>
          <td>Concept/Feasibility - 4% of project cost</td>
        </tr>
        <tr>
          <td><strong>LOD 200</strong></td>
          <td>Schematic Design - 5% of project cost</td>
        </tr>
        <tr>
          <td><strong>LOD 300</strong></td>
          <td>Design Development - 6% of project cost</td>
        </tr>
        <tr>
          <td><strong>LOD 400</strong></td>
          <td>Construction Documents - 8% of project cost</td>
        </tr>
        <tr>
          <td><strong>LOD 500</strong></td>
          <td>As-Built - 10% of project cost</td>
        </tr>
      </table>
    </div>
    
    <!-- Scope of Services -->
    <div class="section">
      <div class="section-title">SCOPE OF BIM SERVICES</div>
      <table class="details-table">
        <tr>
          <td>• 3D BIM Model Development</td>
          <td></td>
        </tr>
        <tr>
          <td>• Architectural Coordination</td>
          <td></td>
        </tr>
        <tr>
          <td>• Structural Integration</td>
          <td></td>
        </tr>
        <tr>
          <td>• MEP Coordination</td>
          <td></td>
        </tr>
        <tr>
          <td>• Clash Detection & Resolution</td>
          <td></td>
        </tr>
        <tr>
          <td>• Construction Documents from BIM</td>
          <td></td>
        </tr>
        <tr>
          <td>• Model Quality Assurance</td>
          <td></td>
        </tr>
      </table>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <p><strong>IMI DESIGN - BIM & MEP SERVICES</strong></p>
      <p>Email: projects@imidesign.in | Phone: +91-XXXXXXXXXX</p>
      <p>This estimate is valid for 30 days from the date of generation.</p>
      <p style="margin-top: 15px; font-size: 10px;">
        Disclaimer: This report is prepared based on the information provided. Actual costs may vary based on project complexity, 
        site conditions, and design changes. IMI Design reserves the right to revise estimates based on detailed project requirements.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}
