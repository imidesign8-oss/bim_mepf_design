/**
 * MEP Cost Estimation Report Generator
 * Generates HTML-based reports that can be converted to PDF
 */

export interface MepReportData {
  projectType: string;
  buildingArea: number;
  areaUnit: "sqft" | "sqm";
  complexity: string;
  greenCertification: string;
  materialQuality: string;
  selectedDisciplines: string[];
  totalCost: number;
  costPerUnit: number;
  accuracyRange: string;
  disciplineCosts: Record<string, number>;
  city: string;
  state: string;
  generatedDate: string;
}

/**
 * Generate MEP Cost Estimation Report as HTML
 */
export function generateMepReportHTML(data: MepReportData): string {
  const disciplinesHTML = Object.entries(data.disciplineCosts)
    .map(
      ([discipline, cost]) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #E5E7EB; text-transform: capitalize;">${discipline}</td>
      <td style="padding: 10px; border-bottom: 1px solid #E5E7EB; text-align: right; color: #DC2626; font-weight: 600;">₹${cost.toLocaleString()}</td>
    </tr>
  `
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>MEP Cost Estimation Report</title>
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
    }
    
    .page {
      max-width: 900px;
      margin: 0 auto;
      padding: 40px;
      background: white;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      border-bottom: 2px solid #DC2626;
      padding-bottom: 15px;
    }
    
    .company-info h1 {
      font-size: 18px;
      color: #DC2626;
      margin-bottom: 4px;
    }
    
    .company-info p {
      font-size: 12px;
      color: #666666;
    }
    
    .generated-date {
      font-size: 11px;
      color: #666666;
      text-align: right;
    }
    
    .report-title {
      font-size: 28px;
      font-weight: bold;
      color: #1F2937;
      text-align: center;
      margin-bottom: 30px;
    }
    
    .section {
      margin-bottom: 25px;
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
    
    .cost-per-unit {
      font-size: 12px;
      color: #666666;
      margin-bottom: 8px;
    }
    
    .accuracy-range {
      font-size: 12px;
      color: #F59E0B;
      font-weight: 600;
    }
    
    .discipline-table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .discipline-table tr {
      border-bottom: 1px solid #E5E7EB;
    }
    
    .discipline-table td {
      padding: 10px;
    }
    
    .discipline-table td:first-child {
      text-transform: capitalize;
    }
    
    .discipline-table td:last-child {
      text-align: right;
      color: #DC2626;
      font-weight: 600;
    }
    
    .disclaimer {
      font-size: 10px;
      color: #666666;
      font-style: italic;
      margin-top: 25px;
      padding-top: 15px;
      border-top: 1px solid #E5E7EB;
      line-height: 1.6;
    }
    
    .footer {
      margin-top: 30px;
      padding-top: 15px;
      border-top: 1px solid #E5E7EB;
      text-align: center;
      font-size: 10px;
      color: #999999;
    }
    
    @media print {
      body {
        margin: 0;
        padding: 0;
      }
      .page {
        max-width: 100%;
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="page">
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
    <div class="report-title">MEP COST ESTIMATION REPORT</div>
    
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
          <td>${data.buildingArea.toLocaleString()} ${data.areaUnit === "sqft" ? "sq ft" : "sq m"}</td>
        </tr>
        <tr>
          <td>Location:</td>
          <td>${data.city}, ${data.state}</td>
        </tr>
        <tr>
          <td>Complexity:</td>
          <td>${data.complexity.charAt(0).toUpperCase() + data.complexity.slice(1)}</td>
        </tr>
        <tr>
          <td>Green Certification:</td>
          <td>${data.greenCertification}</td>
        </tr>
        <tr>
          <td>Material Quality:</td>
          <td>${data.materialQuality.charAt(0).toUpperCase() + data.materialQuality.slice(1)}</td>
        </tr>
      </table>
    </div>
    
    <!-- Selected Disciplines -->
    <div class="section">
      <div class="section-title">SELECTED DISCIPLINES</div>
      <p>${data.selectedDisciplines.map((d) => d.charAt(0).toUpperCase() + d.slice(1)).join(", ")}</p>
    </div>
    
    <!-- Cost Estimation -->
    <div class="cost-box">
      <div class="total-cost">₹${data.totalCost.toLocaleString()}</div>
      <div class="cost-per-unit">Cost per ${data.areaUnit === "sqft" ? "Sq Ft" : "Sq M"}: ₹${data.costPerUnit.toLocaleString()}</div>
      <div class="accuracy-range">Accuracy Range: ${data.accuracyRange}</div>
    </div>
    
    <!-- Discipline Breakdown -->
    <div class="section">
      <div class="section-title">DISCIPLINE BREAKDOWN</div>
      <table class="discipline-table">
        ${disciplinesHTML}
      </table>
    </div>
    
    <!-- Disclaimer -->
    <div class="disclaimer">
      <strong>DISCLAIMER:</strong> This is an approximate estimate based on industry data and current market rates. Actual costs may vary based on specific project requirements, site conditions, design complexity, and market fluctuations. This estimate should NOT be used as the sole basis for project budgeting. Always obtain multiple quotes from qualified MEP contractors before finalizing project budgets. IMI Design is not liable for any discrepancies between this estimate and actual project costs.
    </div>
    
    <!-- Footer -->
    <div class="footer">
      IMI Design - BIM & MEP Services | www.imidesign.in | Contact: info@imidesign.in
    </div>
  </div>
</body>
</html>
  `;
}
