import nodemailer from "nodemailer";

interface MepEstimateEmailData {
  recipientEmail: string;
  recipientName?: string;
  projectName: string;
  totalCost: number;
  costPerSqft: number;
  disciplineCosts?: Record<string, number>;
  buildingArea: number;
  city: string;
  state: string;
  estimateCode: string;
  accuracyRange: string;
}

/**
 * Send MEP estimate via email with cost breakdown
 */
export async function sendMepEstimateEmail(data: MepEstimateEmailData): Promise<boolean> {
  try {
    const gmailUser = process.env.GMAIL_USER;
    const gmailPassword = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailPassword) {
      console.error("Gmail credentials not configured");
      return false;
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailPassword,
      },
    });

    // Generate HTML email content
    const disciplineRows = data.disciplineCosts
      ? Object.entries(data.disciplineCosts)
          .map(
            ([discipline, cost]) => `
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${discipline.charAt(0).toUpperCase() + discipline.slice(1)}</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₹${(cost as number).toLocaleString()}</td>
            </tr>
          `
          )
          .join("")
      : "";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #ED1C24; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .estimate-code { background-color: #fff; padding: 10px; border-left: 4px solid #ED1C24; margin: 15px 0; }
            .estimate-code strong { color: #ED1C24; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            table th { background-color: #ED1C24; color: white; padding: 10px; text-align: left; }
            table td { padding: 8px; border-bottom: 1px solid #eee; }
            .total-row { background-color: #f0f0f0; font-weight: bold; }
            .footer { margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
            .disclaimer { background-color: #fff3cd; padding: 10px; border-radius: 4px; margin: 15px 0; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>MEP Cost Estimation Report</h1>
              <p style="margin: 10px 0 0 0;">Professional BIM & MEPF Design Services</p>
            </div>
            
            <div class="content">
              <p>Dear ${data.recipientName || "Valued Client"},</p>
              
              <p>Thank you for using our MEP Cost Estimation Tool. Here's your detailed cost breakdown:</p>
              
              <div class="estimate-code">
                <strong>Estimate Code:</strong> ${data.estimateCode}
              </div>
              
              <h3>Project Details</h3>
              <table>
                <tr>
                  <td><strong>Project Name:</strong></td>
                  <td>${data.projectName}</td>
                </tr>
                <tr>
                  <td><strong>Building Area:</strong></td>
                  <td>${data.buildingArea.toLocaleString()} sq ft</td>
                </tr>
                <tr>
                  <td><strong>Location:</strong></td>
                  <td>${data.city}, ${data.state}</td>
                </tr>
              </table>
              
              <h3>Cost Estimation</h3>
              <table>
                <tr>
                  <th>Component</th>
                  <th style="text-align: right;">Cost</th>
                </tr>
                ${disciplineRows}
                <tr class="total-row">
                  <td>Total MEP Cost</td>
                  <td style="text-align: right;">₹${data.totalCost.toLocaleString()}</td>
                </tr>
                <tr>
                  <td>Cost per Sq Ft</td>
                  <td style="text-align: right;">₹${data.costPerSqft.toLocaleString()}</td>
                </tr>
                <tr>
                  <td>Accuracy Range</td>
                  <td style="text-align: right;">${data.accuracyRange}</td>
                </tr>
              </table>
              
              <div class="disclaimer">
                <strong>⚠️ Disclaimer:</strong> This is an approximate estimate based on industry data and should NOT be used as the sole basis for project budgeting. Actual costs may vary based on specific project requirements, site conditions, and current market rates. Always get multiple quotes from qualified MEP contractors before finalizing budgets.
              </div>
              
              <p>For more information or to discuss your project requirements, please contact us at <strong>Projects@imidesign.in</strong> or visit our website.</p>
              
              <div class="footer">
                <p>This is an automated email. Please do not reply to this address.</p>
                <p>&copy; 2026 IMI Design - Professional BIM & MEPF Design Services</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: gmailUser,
      to: data.recipientEmail,
      subject: `MEP Cost Estimate - ${data.projectName} (${data.estimateCode})`,
      html: htmlContent,
      replyTo: "Projects@imidesign.in",
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ MEP estimate email sent to ${data.recipientEmail}`);
    return true;
  } catch (error) {
    console.error("Error sending MEP estimate email:", error);
    return false;
  }
}

/**
 * Send estimate comparison email
 */
export async function sendEstimateComparisonEmail(
  recipientEmail: string,
  projectName: string,
  estimates: Array<{ code: string; cost: number; disciplines: string[] }>
): Promise<boolean> {
  try {
    const gmailUser = process.env.GMAIL_USER;
    const gmailPassword = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailPassword) {
      console.error("Gmail credentials not configured");
      return false;
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailPassword,
      },
    });

    const estimateRows = estimates
      .map(
        (est) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${est.code}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${est.disciplines.join(", ")}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₹${est.cost.toLocaleString()}</td>
        </tr>
      `
      )
      .join("");

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #ED1C24; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            table th { background-color: #ED1C24; color: white; padding: 10px; text-align: left; }
            table td { padding: 8px; border-bottom: 1px solid #eee; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>MEP Estimate Comparison</h1>
            </div>
            
            <div class="content">
              <p>Here's a comparison of your MEP estimates for <strong>${projectName}</strong>:</p>
              
              <table>
                <tr>
                  <th>Estimate Code</th>
                  <th>Disciplines</th>
                  <th style="text-align: right;">Total Cost</th>
                </tr>
                ${estimateRows}
              </table>
              
              <p>For more details or to create new estimates, visit our MEP Calculator tool.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: gmailUser,
      to: recipientEmail,
      subject: `MEP Estimate Comparison - ${projectName}`,
      html: htmlContent,
      replyTo: "Projects@imidesign.in",
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Comparison email sent to ${recipientEmail}`);
    return true;
  } catch (error) {
    console.error("Error sending comparison email:", error);
    return false;
  }
}
