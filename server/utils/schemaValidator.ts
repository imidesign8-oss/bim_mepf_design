/**
 * Schema Validator Utility
 * Validates JSON-LD and structured data markup against Schema.org standards
 */

export interface ValidationError {
  type: "error" | "warning" | "info";
  message: string;
  path?: string;
  suggestion?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  schemaType?: string;
  properties?: Record<string, unknown>;
}

/**
 * Validates JSON-LD structured data
 */
export function validateJsonLd(jsonLdString: string): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
  };

  try {
    // Parse JSON
    const data = JSON.parse(jsonLdString);
    result.properties = data;

    // Check for required @context
    if (!data["@context"]) {
      result.errors.push({
        type: "error",
        message: "Missing required @context property",
        suggestion: 'Add "@context": "https://schema.org"',
      });
      result.valid = false;
    }

    // Check for required @type
    if (!data["@type"]) {
      result.errors.push({
        type: "error",
        message: "Missing required @type property",
        suggestion: 'Specify a valid Schema.org type like "Organization", "LocalBusiness", etc.',
      });
      result.valid = false;
    } else {
      result.schemaType = data["@type"];
    }

    // Validate based on schema type
    if (data["@type"] === "LocalBusiness" || data["@type"] === "Organization") {
      validateLocalBusinessSchema(data, result);
    } else if (data["@type"] === "WebPage") {
      validateWebPageSchema(data, result);
    } else if (data["@type"] === "Article") {
      validateArticleSchema(data, result);
    } else if (data["@type"] === "Product") {
      validateProductSchema(data, result);
    }

    // Check for common issues
    validateCommonIssues(data, result);
  } catch (error) {
    result.errors.push({
      type: "error",
      message: `Invalid JSON: ${error instanceof Error ? error.message : "Unknown error"}`,
    });
    result.valid = false;
  }

  return result;
}

/**
 * Validates LocalBusiness schema
 */
function validateLocalBusinessSchema(data: any, result: ValidationResult): void {
  const requiredFields = ["name", "url"];
  const recommendedFields = ["address", "telephone", "description"];

  // Check required fields
  for (const field of requiredFields) {
    if (!data[field]) {
      result.errors.push({
        type: "error",
        message: `Missing required field: ${field}`,
        path: field,
        suggestion: `Add a valid ${field} value`,
      });
      result.valid = false;
    }
  }

  // Check recommended fields
  for (const field of recommendedFields) {
    if (!data[field]) {
      result.warnings.push({
        type: "warning",
        message: `Missing recommended field: ${field}`,
        path: field,
        suggestion: `Adding ${field} improves search visibility`,
      });
    }
  }

  // Validate address structure
  if (data.address && typeof data.address === "object") {
    const addressFields = ["streetAddress", "addressLocality", "postalCode", "addressCountry"];
    for (const field of addressFields) {
      if (!data.address[field]) {
        result.warnings.push({
          type: "warning",
          message: `Address missing field: ${field}`,
          path: `address.${field}`,
        });
      }
    }
  }

  // Validate geo coordinates if present
  if (data.geo && typeof data.geo === "object") {
    if (!data.geo.latitude || !data.geo.longitude) {
      result.warnings.push({
        type: "warning",
        message: "Geo coordinates incomplete - latitude and/or longitude missing",
        path: "geo",
        suggestion: "Add latitude and longitude for better local search results",
      });
    }
  }
}

/**
 * Validates WebPage schema
 */
function validateWebPageSchema(data: any, result: ValidationResult): void {
  const recommendedFields = ["headline", "description", "datePublished"];

  for (const field of recommendedFields) {
    if (!data[field]) {
      result.warnings.push({
        type: "warning",
        message: `Missing recommended field: ${field}`,
        path: field,
      });
    }
  }
}

/**
 * Validates Article schema
 */
function validateArticleSchema(data: any, result: ValidationResult): void {
  const requiredFields = ["headline", "description"];
  const recommendedFields = ["datePublished", "dateModified", "author", "image"];

  for (const field of requiredFields) {
    if (!data[field]) {
      result.errors.push({
        type: "error",
        message: `Missing required field: ${field}`,
        path: field,
      });
      result.valid = false;
    }
  }

  for (const field of recommendedFields) {
    if (!data[field]) {
      result.warnings.push({
        type: "warning",
        message: `Missing recommended field: ${field}`,
        path: field,
      });
    }
  }
}

/**
 * Validates Product schema
 */
function validateProductSchema(data: any, result: ValidationResult): void {
  const requiredFields = ["name", "description"];
  const recommendedFields = ["image", "offers", "aggregateRating"];

  for (const field of requiredFields) {
    if (!data[field]) {
      result.errors.push({
        type: "error",
        message: `Missing required field: ${field}`,
        path: field,
      });
      result.valid = false;
    }
  }

  for (const field of recommendedFields) {
    if (!data[field]) {
      result.warnings.push({
        type: "warning",
        message: `Missing recommended field: ${field}`,
        path: field,
      });
    }
  }
}

/**
 * Validates common schema issues
 */
function validateCommonIssues(data: any, result: ValidationResult): void {
  // Check for invalid URLs
  if (data.url && !isValidUrl(data.url)) {
    result.errors.push({
      type: "error",
      message: "Invalid URL format",
      path: "url",
      suggestion: "Use a valid absolute URL starting with http:// or https://",
    });
    result.valid = false;
  }

  // Check for invalid email
  if (data.email && !isValidEmail(data.email)) {
    result.warnings.push({
      type: "warning",
      message: "Invalid email format",
      path: "email",
    });
  }

  // Check for invalid phone
  if (data.telephone && !isValidPhone(data.telephone)) {
    result.warnings.push({
      type: "warning",
      message: "Invalid phone format",
      path: "telephone",
      suggestion: "Use E.164 format like +1234567890 or +91-9876543210",
    });
  }

  // Check for duplicate @id and url
  if (data["@id"] && data.url && data["@id"] !== data.url) {
    result.warnings.push({
      type: "warning",
      message: "@id and url should typically be the same",
      suggestion: "Set @id to the same value as url",
    });
  }
}

/**
 * Validates URL format
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates phone format
 */
function isValidPhone(phone: string): boolean {
  // Basic phone validation - accepts various formats
  const phoneRegex = /^[\d\s\-+()]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 10;
}

/**
 * Validates multiple JSON-LD blocks
 */
export function validateMultipleJsonLd(jsonLdStrings: string[]): ValidationResult[] {
  return jsonLdStrings.map((jsonLd) => validateJsonLd(jsonLd));
}

/**
 * Generates a summary of validation results
 */
export function getValidationSummary(result: ValidationResult): string {
  if (result.valid && result.warnings.length === 0) {
    return `✓ Valid ${result.schemaType || "schema"} markup with no issues`;
  }

  const errorCount = result.errors.length;
  const warningCount = result.warnings.length;

  let summary = "";
  if (errorCount > 0) {
    summary += `${errorCount} error${errorCount > 1 ? "s" : ""}`;
  }
  if (warningCount > 0) {
    if (summary) summary += ", ";
    summary += `${warningCount} warning${warningCount > 1 ? "s" : ""}`;
  }

  return summary || "Validation complete";
}
