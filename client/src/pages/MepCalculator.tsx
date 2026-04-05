import React, { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Download, Share2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CalculationResult {
  baseMepCost: number;
  adjustedMepCost: number;
  costPerSqft: number;
  accuracyRange: string;
  mechanicalCost: number;
  electricalCost: number;
  plumbingCost: number;
  fireSafetyCost: number;
  smartSystemsCost: number;
  appliedAdjustments: Record<string, number>;
}

export function MepCalculator() {
  const [formData, setFormData] = useState({
    projectType: "residential",
    projectSubType: "",
    buildingArea: 1000,
    cityId: 0,
    stateId: 0,
    buildingComplexity: "moderate",
    greenCertification: "none",
    materialQuality: "standard",
    projectTimeline: "standard",
    lodLevel: "300",
  });

  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch states
  const { data: states = [] } = trpc.mepCost.states.list.useQuery();

  // Fetch cities for selected state
  const { data: cities = [] } = trpc.mepCost.cities.byState.useQuery(
    { stateId: formData.stateId },
    { enabled: formData.stateId > 0 }
  );

  // Calculate MEP cost
  const calculateMutation = trpc.mepCost.calculate.useMutation({
    onSuccess: (data) => {
      setResult(data);
      setError(null);
      setIsCalculating(false);
    },
    onError: (error) => {
      setError(error.message || "Failed to calculate MEP cost");
      setIsCalculating(false);
    },
  });

  const handleStateChange = (value: string) => {
    const stateId = parseInt(value);
    setFormData({ ...formData, stateId, cityId: 0 });
  };

  const handleCityChange = (value: string) => {
    setFormData({ ...formData, cityId: parseInt(value) });
  };

  const handleCalculate = async () => {
    if (formData.cityId === 0) {
      setError("Please select a city");
      return;
    }

    setIsCalculating(true);
    await calculateMutation.mutateAsync({
      projectType: formData.projectType as any,
      buildingArea: formData.buildingArea,
      cityId: formData.cityId,
      buildingComplexity: formData.buildingComplexity as any,
      greenCertification: formData.greenCertification as any,
      materialQuality: formData.materialQuality as any,
      projectTimeline: formData.projectTimeline as any,
      lodLevel: formData.lodLevel as any,
    });
  };

  const handleDownloadPDF = () => {
    if (!result) return;

    const content = `
MEP COST ESTIMATION REPORT
Generated: ${new Date().toLocaleDateString()}

PROJECT DETAILS:
- Type: ${formData.projectType}
- Building Area: ${formData.buildingArea.toLocaleString()} sq ft
- Complexity: ${formData.buildingComplexity}
- Green Certification: ${formData.greenCertification}
- Material Quality: ${formData.materialQuality}
- LOD Level: ${formData.lodLevel}

COST ESTIMATION:
- Base MEP Cost: ₹${result.baseMepCost.toLocaleString()}
- Adjusted MEP Cost: ₹${result.adjustedMepCost.toLocaleString()}
- Cost per Sq Ft: ₹${result.costPerSqft}
- Accuracy Range: ${result.accuracyRange}

COMPONENT BREAKDOWN:
- Mechanical (HVAC): ₹${result.mechanicalCost.toLocaleString()}
- Electrical: ₹${result.electricalCost.toLocaleString()}
- Plumbing: ₹${result.plumbingCost.toLocaleString()}
- Fire Safety: ₹${result.fireSafetyCost.toLocaleString()}
- Smart Systems: ₹${result.smartSystemsCost.toLocaleString()}

DISCLAIMER:
This is an approximate estimate based on industry data and should NOT be used as the sole basis for project budgeting. Actual costs may vary based on specific project requirements, site conditions, and current market rates. Always get multiple quotes from qualified MEP contractors before finalizing budgets.
    `;

    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `MEP_Estimate_${new Date().getTime()}.txt`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">MEP Cost Estimation Tool</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Estimate mechanical, electrical, and plumbing (MEP) design costs for your project based on city, project type, and specifications.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calculator Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
                <CardDescription>Enter your project specifications to calculate MEP costs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Project Type */}
                <div className="space-y-2">
                  <Label htmlFor="projectType">Project Type</Label>
                  <Select value={formData.projectType} onValueChange={(value) => setFormData({ ...formData, projectType: value })}>
                    <SelectTrigger id="projectType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residential">Residential</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="industrial">Industrial</SelectItem>
                      <SelectItem value="hospitality">Hospitality</SelectItem>
                      <SelectItem value="mixed-use">Mixed-Use</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Building Area */}
                <div className="space-y-2">
                  <Label htmlFor="buildingArea">Building Area (Sq Ft)</Label>
                  <Input
                    id="buildingArea"
                    type="number"
                    value={formData.buildingArea}
                    onChange={(e) => setFormData({ ...formData, buildingArea: parseFloat(e.target.value) || 0 })}
                    placeholder="Enter building area in square feet"
                  />
                </div>

                {/* State Selection */}
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Select value={formData.stateId.toString()} onValueChange={handleStateChange}>
                    <SelectTrigger id="state">
                      <SelectValue placeholder="Select a state" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((state) => (
                        <SelectItem key={state.id} value={state.id.toString()}>
                          {state.stateName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* City Selection */}
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Select value={formData.cityId.toString()} onValueChange={handleCityChange} disabled={formData.stateId === 0}>
                    <SelectTrigger id="city">
                      <SelectValue placeholder="Select a city" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city.id} value={city.id.toString()}>
                          {city.cityName} ({city.tier})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Building Complexity */}
                <div className="space-y-2">
                  <Label htmlFor="complexity">Building Complexity</Label>
                  <Select value={formData.buildingComplexity} onValueChange={(value) => setFormData({ ...formData, buildingComplexity: value })}>
                    <SelectTrigger id="complexity">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="simple">Simple (Linear design)</SelectItem>
                      <SelectItem value="moderate">Moderate (Standard design)</SelectItem>
                      <SelectItem value="complex">Complex (Custom design)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Green Certification */}
                <div className="space-y-2">
                  <Label htmlFor="certification">Green Certification</Label>
                  <Select value={formData.greenCertification} onValueChange={(value) => setFormData({ ...formData, greenCertification: value })}>
                    <SelectTrigger id="certification">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="LEED">LEED</SelectItem>
                      <SelectItem value="IGBC">IGBC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Material Quality */}
                <div className="space-y-2">
                  <Label htmlFor="material">Material Quality</Label>
                  <Select value={formData.materialQuality} onValueChange={(value) => setFormData({ ...formData, materialQuality: value })}>
                    <SelectTrigger id="material">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard (Indian-made)</SelectItem>
                      <SelectItem value="premium">Premium (High-quality)</SelectItem>
                      <SelectItem value="imported">Imported (International)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Project Timeline */}
                <div className="space-y-2">
                  <Label htmlFor="timeline">Project Timeline</Label>
                  <Select value={formData.projectTimeline} onValueChange={(value) => setFormData({ ...formData, projectTimeline: value })}>
                    <SelectTrigger id="timeline">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="fast-track">Fast-Track</SelectItem>
                      <SelectItem value="delayed">Delayed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* LOD Level */}
                <div className="space-y-2">
                  <Label htmlFor="lod">Level of Development (LOD)</Label>
                  <Select value={formData.lodLevel} onValueChange={(value) => setFormData({ ...formData, lodLevel: value })}>
                    <SelectTrigger id="lod">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100">LOD 100 - Conceptual (±30%)</SelectItem>
                      <SelectItem value="200">LOD 200 - Conceptual Dimensional (±20%)</SelectItem>
                      <SelectItem value="300">LOD 300 - Accurate Dimensional (±15%)</SelectItem>
                      <SelectItem value="350">LOD 350 - With Connections (±10%)</SelectItem>
                      <SelectItem value="400">LOD 400 - Construction (±5%)</SelectItem>
                      <SelectItem value="500">LOD 500 - Operations (0%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Calculate Button */}
                <Button
                  onClick={handleCalculate}
                  disabled={isCalculating || formData.cityId === 0}
                  className="w-full h-12 text-base"
                  size="lg"
                >
                  {isCalculating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    "Calculate MEP Cost"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-1">
            {result ? (
              <div className="space-y-4">
                {/* Main Result Card */}
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-2xl">₹{result.adjustedMepCost.toLocaleString()}</CardTitle>
                    <CardDescription>Estimated MEP Cost</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Cost per Sq Ft:</span>
                        <span className="font-semibold">₹{result.costPerSqft}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Accuracy Range:</span>
                        <span className="font-semibold text-amber-600">{result.accuracyRange}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Component Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Component Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Mechanical (HVAC)</span>
                        <span className="font-semibold">₹{result.mechanicalCost.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: "40%" }}></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Electrical</span>
                        <span className="font-semibold">₹{result.electricalCost.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "35%" }}></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Plumbing</span>
                        <span className="font-semibold">₹{result.plumbingCost.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: "20%" }}></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Fire Safety</span>
                        <span className="font-semibold">₹{result.fireSafetyCost.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: "3%" }}></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Smart Systems</span>
                        <span className="font-semibold">₹{result.smartSystemsCost.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: "2%" }}></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button onClick={handleDownloadPDF} variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Download Report
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Estimate
                  </Button>
                </div>

                {/* Disclaimer */}
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    This is an approximate estimate. Always get quotes from qualified MEP contractors before finalizing budgets.
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <Card className="h-full flex items-center justify-center min-h-96">
                <div className="text-center text-muted-foreground">
                  <p>Fill in the form and click "Calculate MEP Cost" to see the results</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
