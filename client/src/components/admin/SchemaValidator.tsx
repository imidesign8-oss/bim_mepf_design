import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle, AlertTriangle, Info } from "lucide-react";

export function SchemaValidator() {
  const [jsonLd, setJsonLd] = useState<string>("");
  const [pageType, setPageType] = useState<"home" | "about" | "services" | "projects" | "blog" | "contact" | "global">("home");
  const [validationResult, setValidationResult] = useState<any | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validateSchemaMutation = trpc.schemaValidator.validateSchema.useMutation();

  const handleValidate = async () => {
    if (!jsonLd.trim()) {
      alert("Please enter JSON-LD markup to validate");
      return;
    }

    setIsValidating(true);
    try {
      const result = await validateSchemaMutation.mutateAsync({
        jsonLd,
      });
      setValidationResult(result);
    } catch (error) {
      setValidationResult({
        valid: false,
        errors: [
          {
            type: "error",
            message: error instanceof Error ? error.message : "Validation failed",
          },
        ],
        warnings: [],
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleClear = () => {
    setJsonLd("");
    setValidationResult(null);
  };

  const handleLoadSample = (type: string) => {
    const samples: Record<string, string> = {
      organization: JSON.stringify(
        {
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "IMI Design",
          url: "https://imidesign.in",
          logo: "https://imidesign.in/logo.png",
          description: "Professional BIM and MEPF design services",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Goa 403 802",
            addressCountry: "India",
          },
          telephone: "+91-9876543210",
          email: "projects@imidesign.in",
        },
        null,
        2
      ),
      localbusiness: JSON.stringify(
        {
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: "IMI Design",
          url: "https://imidesign.in",
          telephone: "+91-9876543210",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Goa 403 802",
            addressLocality: "Goa",
            postalCode: "403802",
            addressCountry: "India",
          },
          geo: {
            "@type": "GeoCoordinates",
            latitude: "15.2993",
            longitude: "73.8243",
          },
        },
        null,
        2
      ),
      article: JSON.stringify(
        {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Understanding BIM Coordination",
          description: "A comprehensive guide to BIM coordination",
          image: "https://imidesign.in/image.jpg",
          datePublished: "2024-01-15",
          dateModified: "2024-03-19",
          author: {
            "@type": "Organization",
            name: "IMI Design",
          },
        },
        null,
        2
      ),
    };
    setJsonLd(samples[type] || "");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Schema Validator</h2>
        <p className="text-gray-600 mt-2">Validate your JSON-LD structured data before deploying</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Validation Settings</CardTitle>
          <CardDescription>Select page type and enter your JSON-LD markup</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Page Type</label>
            <div className="flex flex-wrap gap-2">
              {["home", "about", "services", "projects", "blog", "contact", "global"].map((type) => (
                <Button
                  key={type}
                  variant={pageType === type ? "default" : "outline"}
                  onClick={() => setPageType(type as any)}
                  className="capitalize"
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">JSON-LD Markup</label>
            <textarea
              value={jsonLd}
              onChange={(e) => setJsonLd(e.target.value)}
              placeholder='Paste your JSON-LD markup here, e.g., {"@context": "https://schema.org", "@type": "Organization", ...}'
              className="w-full h-64 p-3 border border-gray-300 rounded-lg font-mono text-sm"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleValidate} disabled={isValidating} className="bg-blue-600 hover:bg-blue-700">
              {isValidating ? "Validating..." : "Validate"}
            </Button>
            <Button onClick={handleClear} variant="outline">
              Clear
            </Button>
            <div className="flex gap-1 ml-auto">
              <Button onClick={() => handleLoadSample("organization")} variant="ghost" size="sm">
                Sample: Organization
              </Button>
              <Button onClick={() => handleLoadSample("localbusiness")} variant="ghost" size="sm">
                Sample: LocalBusiness
              </Button>
              <Button onClick={() => handleLoadSample("article")} variant="ghost" size="sm">
                Sample: Article
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {validationResult && (
        <div className="space-y-4">
          {/* Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Validation Results</CardTitle>
                <div className="flex items-center gap-2">
                  {validationResult.valid && validationResult.warnings.length === 0 ? (
                    <Badge className="bg-green-600">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Valid
                    </Badge>
                  ) : validationResult.errors.length > 0 ? (
                    <Badge className="bg-red-600">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {validationResult.errors.length} Error{validationResult.errors.length > 1 ? "s" : ""}
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-600">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      {validationResult.warnings.length} Warning{validationResult.warnings.length > 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>
              </div>
              <CardDescription>{validationResult.summary}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {validationResult.schemaType && (
                <div>
                  <p className="text-sm font-medium">Schema Type: <Badge>{validationResult.schemaType}</Badge></p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Errors, Warnings, Info */}
          <Tabs defaultValue="errors" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="errors">
                Errors ({validationResult.errors.length})
              </TabsTrigger>
              <TabsTrigger value="warnings">
                Warnings ({validationResult.warnings.length})
              </TabsTrigger>
              <TabsTrigger value="recommendations">
                Recommendations ({validationResult.recommendations?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="errors" className="space-y-2">
              {validationResult.errors.length === 0 ? (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">No errors found</AlertDescription>
                </Alert>
              ) : (
                validationResult.errors.map((error: any, idx: number) => (
                  <Alert key={idx} className="bg-red-50 border-red-200">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <div className="ml-2">
                      <AlertDescription className="text-red-800 font-medium">
                        {error.message}
                      </AlertDescription>
                      {error.path && (
                        <p className="text-xs text-red-700 mt-1">Path: {error.path}</p>
                      )}
                      {error.suggestion && (
                        <p className="text-xs text-red-700 mt-1">💡 {error.suggestion}</p>
                      )}
                    </div>
                  </Alert>
                ))
              )}
            </TabsContent>

            <TabsContent value="warnings" className="space-y-2">
              {validationResult.warnings.length === 0 ? (
                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">No warnings</AlertDescription>
                </Alert>
              ) : (
                validationResult.warnings.map((warning: any, idx: number) => (
                  <Alert key={idx} className="bg-yellow-50 border-yellow-200">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <div className="ml-2">
                      <AlertDescription className="text-yellow-800 font-medium">
                        {warning.message}
                      </AlertDescription>
                      {warning.path && (
                        <p className="text-xs text-yellow-700 mt-1">Path: {warning.path}</p>
                      )}
                      {warning.suggestion && (
                        <p className="text-xs text-yellow-700 mt-1">💡 {warning.suggestion}</p>
                      )}
                    </div>
                  </Alert>
                ))
              )}
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-2">
              {validationResult.recommendations && validationResult.recommendations.length > 0 ? (
                validationResult.recommendations.map((rec: any, idx: number) => (
                  <Alert key={idx} className="bg-blue-50 border-blue-200">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      {rec.message}
                    </AlertDescription>
                  </Alert>
                ))
              ) : (
                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">No additional recommendations</AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>

          {/* Properties */}
          {validationResult.properties && (
            <Card>
              <CardHeader>
                <CardTitle>Detected Properties</CardTitle>
                <CardDescription>Properties found in your JSON-LD markup</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-3 rounded-lg text-xs overflow-auto max-h-64">
                  {JSON.stringify(validationResult.properties, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
