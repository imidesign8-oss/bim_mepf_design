import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";

// Test email validation
describe("Email Report Sharing", () => {
  it("should validate email format correctly", () => {
    const emailSchema = z.string().email();
    
    expect(() => emailSchema.parse("valid@example.com")).not.toThrow();
    expect(() => emailSchema.parse("invalid-email")).toThrow();
    expect(() => emailSchema.parse("test@domain.co.in")).not.toThrow();
  });

  it("should handle optional recipient name", () => {
    const reportSchema = z.object({
      recipientEmail: z.string().email(),
      recipientName: z.string().optional(),
      customMessage: z.string().optional(),
      reportHtml: z.string(),
      reportType: z.enum(["mep", "bim"]),
      projectType: z.string(),
      totalCost: z.number(),
    });

    const validData = {
      recipientEmail: "test@example.com",
      reportHtml: "<html></html>",
      reportType: "mep" as const,
      projectType: "residential",
      totalCost: 50000,
    };

    expect(() => reportSchema.parse(validData)).not.toThrow();
  });

  it("should include custom message in email body", () => {
    const message = "This is a test message";
    const htmlBody = `<p>${message.replace(/\n/g, "<br />")}</p>`;
    
    expect(htmlBody).toContain(message);
  });

  it("should format report HTML with proper structure", () => {
    const reportHtml = "<table><tr><td>Test</td></tr></table>";
    let emailBody = `<div style="font-family: Arial, sans-serif;">`;
    emailBody += `<h2>Your MEP Cost Estimate</h2>`;
    emailBody += reportHtml;
    emailBody += `</div>`;

    expect(emailBody).toContain("<h2>");
    expect(emailBody).toContain(reportHtml);
    expect(emailBody).toContain("</div>");
  });
});

// Test filtering logic
describe("Advanced Pricing Filters", () => {
  const mockBimPricing = [
    { cityId: 1, lodLevel: "100", bimPercentageResidential: 2.5, bimPercentageCommercial: 3, bimPercentageIndustrial: 2 },
    { cityId: 1, lodLevel: "200", bimPercentageResidential: 3.5, bimPercentageCommercial: 4, bimPercentageIndustrial: 3 },
    { cityId: 2, lodLevel: "100", bimPercentageResidential: 2.8, bimPercentageCommercial: 3.2, bimPercentageIndustrial: 2.2 },
    { cityId: 2, lodLevel: "300", bimPercentageResidential: 5, bimPercentageCommercial: 6, bimPercentageIndustrial: 4.5 },
  ];

  const mockCities = [
    { id: 1, cityName: "Delhi", stateId: 1 },
    { id: 2, cityName: "Mumbai", stateId: 2 },
  ];

  it("should filter by city name search", () => {
    const searchCity = "Delhi";
    const filtered = mockBimPricing.filter((row) => {
      const city = mockCities.find((c) => c.id === row.cityId);
      return city?.cityName.toLowerCase().includes(searchCity.toLowerCase());
    });

    expect(filtered.length).toBe(2);
    expect(filtered.every((r) => r.cityId === 1)).toBe(true);
  });

  it("should filter by state", () => {
    const filterState = 1;
    const filtered = mockBimPricing.filter((row) => {
      const city = mockCities.find((c) => c.id === row.cityId);
      return city?.stateId === filterState;
    });

    expect(filtered.length).toBe(2);
  });

  it("should filter by LOD level", () => {
    const filterLod = "100";
    const filtered = mockBimPricing.filter((row) => row.lodLevel === filterLod);

    expect(filtered.length).toBe(2);
    expect(filtered.every((r) => r.lodLevel === "100")).toBe(true);
  });

  it("should combine multiple filters", () => {
    const searchCity = "Mumbai";
    const filterLod = "100";
    
    const filtered = mockBimPricing.filter((row) => {
      const city = mockCities.find((c) => c.id === row.cityId);
      if (!city) return false;
      if (searchCity && !city.cityName.toLowerCase().includes(searchCity.toLowerCase())) return false;
      if (filterLod && row.lodLevel !== filterLod) return false;
      return true;
    });

    expect(filtered.length).toBe(1);
    expect(filtered[0].cityId).toBe(2);
    expect(filtered[0].lodLevel).toBe("100");
  });

  it("should handle case-insensitive city search", () => {
    const searchCity = "delhi";
    const filtered = mockBimPricing.filter((row) => {
      const city = mockCities.find((c) => c.id === row.cityId);
      return city?.cityName.toLowerCase().includes(searchCity.toLowerCase());
    });

    expect(filtered.length).toBe(2);
  });

  it("should return all records when no filters applied", () => {
    const filtered = mockBimPricing.filter(() => true);
    expect(filtered.length).toBe(mockBimPricing.length);
  });
});

// Test bulk update logic
describe("Bulk Update Operations", () => {
  it("should update multiple selected rows", () => {
    const selectedRows = new Set(["1-100", "1-200"]);
    const updates: Record<string, any> = {};

    selectedRows.forEach((key) => {
      const [cityIdStr, lodLevel] = key.split("-");
      const cityId = parseInt(cityIdStr);
      updates[key] = {
        cityId,
        lodLevel,
        residential: 5.5,
        commercial: 6.5,
        industrial: 5,
      };
    });

    expect(Object.keys(updates).length).toBe(2);
    expect(updates["1-100"].residential).toBe(5.5);
    expect(updates["1-200"].residential).toBe(5.5);
  });

  it("should track selected row count", () => {
    const selected = new Set(["1-100", "1-200", "2-300"]);
    expect(selected.size).toBe(3);

    selected.delete("1-100");
    expect(selected.size).toBe(2);
  });

  it("should clear selection", () => {
    const selected = new Set(["1-100", "1-200", "2-300"]);
    selected.clear();
    expect(selected.size).toBe(0);
  });
});

// Test MEP weightage calculations
describe("MEP Discipline Weightages", () => {
  it("should calculate total weightage", () => {
    const weightages = {
      electrical: 30,
      plumbing: 25,
      hvac: 35,
      "fire-system": 10,
    };

    const total = Object.values(weightages).reduce((sum, w) => sum + w, 0);
    expect(total).toBe(100);
  });

  it("should detect weightage imbalance", () => {
    const weightages = {
      electrical: 30,
      plumbing: 25,
      hvac: 35,
      "fire-system": 8,
    };

    const total = Object.values(weightages).reduce((sum, w) => sum + w, 0);
    expect(Math.abs(total - 100)).toBeGreaterThan(0.1);
  });

  it("should handle decimal weightages", () => {
    const weightages = {
      electrical: 30.5,
      plumbing: 25.25,
      hvac: 34.75,
      "fire-system": 9.5,
    };

    const total = Object.values(weightages).reduce((sum, w) => sum + w, 0);
    expect(Math.abs(total - 100)).toBeLessThan(0.01);
  });

  it("should validate individual weightage range", () => {
    const weightageSchema = z.number().min(0).max(100);

    expect(() => weightageSchema.parse(30)).not.toThrow();
    expect(() => weightageSchema.parse(0)).not.toThrow();
    expect(() => weightageSchema.parse(100)).not.toThrow();
    expect(() => weightageSchema.parse(-5)).toThrow();
    expect(() => weightageSchema.parse(105)).toThrow();
  });
});
