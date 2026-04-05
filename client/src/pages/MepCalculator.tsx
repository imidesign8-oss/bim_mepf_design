import { useState } from "react";
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
import { Loader2, Download, Share2, AlertCircle, Zap, Droplet, Wind, Flame } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CalculationResult {
  baseMepCost?: number;
  adjustedMepCost?: number;
  costPerSqft: number;
  accuracyRange: string;
  mechanicalCost?: number;
  electricalCost?: number;
  plumbingCost?: number;
  fireSafetyCost?: number;
  smartSystemsCost?: number;
  totalCost?: number;
  disciplineCosts?: Record<string, number>;
  appliedAdjustments: Record<string, number>;
}

interface DisciplineOption {
  id: "electrical" | "plumbing" | "hvac" | "fire-system";
  label: string;
  icon: React.ReactNode;
  color: string;
}

const DISCIPLINES: DisciplineOption[] = [
  { id: "electrical", label: "Electrical Design", icon: <Zap className="w-4 h-4" />, color: "bg-yellow-100 border-yellow-300" },
  { id: "plumbing", label: "Plumbing Design", icon: <Droplet className="w-4 h-4" />, color: "bg-blue-100 border-blue-300" },
  { id: "hvac", label: "HVAC Design", icon: <Wind className="w-4 h-4" />, color: "bg-cyan-100 border-cyan-300" },
  { id: "fire-system", label: "Fire System Design", icon: <Flame className="w-4 h-4" />, color: "bg-red-100 border-red-300" },
];

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

  const [selectedDisciplines, setSelectedDisciplines] = useState<("electrical" | "plumbing" | "hvac" | "fire-system")[]>(["electrical", "plumbing", "hvac"]);
  const [vertical, setVertical] = useState<"bim" | "mep">("mep");
  const [unitType, setUnitType] = useState<"sqft" | "sqm">("sqft");
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Convert area based on unit type
  const displayArea = unitType === "sqm" ? Math.round(formData.buildingArea * 10.764) : formData.buildingArea;
  const actualArea = unitType === "sqm" ? formData.buildingArea / 10.764 : formData.buildingArea;

  // Fetch states
  const { data: states = [] } = trpc.mepCost.states.list.useQuery();

  // Fetch cities for selected state
  const { data: cities = [] } = trpc.mepCost.cities.byState.useQuery(
    { stateId: formData.stateId },
    { enabled: formData.stateId > 0 }
  );

  // Calculate discipline-based cost
  const disciplineQuery = trpc.mepCost.disciplines.calculate.useQuery(
    {
      projectType: formData.projectType as any,
      buildingArea: actualArea,
      cityId: formData.cityId,
      disciplines: selectedDisciplines,
      buildingComplexity: formData.buildingComplexity as any,
      greenCertification: formData.greenCertification as any,
      materialQuality: formData.materialQuality as any,
      projectTimeline: formData.projectTimeline as any,
      lodLevel: formData.lodLevel as any,
    },
    { enabled: false }
  );

  const handleStateChange = (value: string) => {
    const stateId = parseInt(value);
    setFormData({ ...formData, stateId, cityId: 0 });
  };

  const handleCityChange = (value: string) => {
    setFormData({ ...formData, cityId: parseInt(value) });
  };

  const handleAreaChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    setFormData({ ...formData, buildingArea: numValue });
  };

  const toggleDiscipline = (disciplineId: "electrical" | "plumbing" | "hvac" | "fire-system") => {
    if (selectedDisciplines.includes(disciplineId)) {
      setSelectedDisciplines(selectedDisciplines.filter((d) => d !== disciplineId));
    } else {
      setSelectedDisciplines([...selectedDisciplines, disciplineId]);
    }
  };

  const handleCalculate = async () => {
    if (formData.cityId === 0) {
      setError("Please select a city");
      return;
    }

    if (selectedDisciplines.length === 0) {
      setError("Please select at least one discipline");
      return;
    }

    setIsCalculating(true);
    try {
      const { data } = await disciplineQuery.refetch();
      if (data) {
        setResult(data);
        setError(null);
      }
    } catch (err: any) {
      setError(err.message || "Failed to calculate MEP cost");
    } finally {
      setIsCalculating(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!result) return;

    const disciplineList = selectedDisciplines.map((d) => d.charAt(0).toUpperCase() + d.slice(1)).join(", ");

    const content = `
MEP COST ESTIMATION REPORT
Generated: ${new Date().toLocaleDateString()}

PROJECT DETAILS:
- Type: ${formData.projectType} (${vertical.toUpperCase()})
- Building Area: ${displayArea.toLocaleString()} ${unitType === "sqft" ? "sq ft" : "sq m"}
- Complexity: ${formData.buildingComplexity}
- Green Certification: ${formData.greenCertification}
- Material Quality: ${formData.materialQuality}
- LOD Level: ${formData.lodLevel}

SELECTED DISCIPLINES:
${disciplineList}

COST ESTIMATION:
- Total Cost: ₹${(result.totalCost || result.adjustedMepCost || 0).toLocaleString()}
- Cost per Sq Ft: ₹${result.costPerSqft}
- Accuracy Range: ${result.accuracyRange}

DISCIPLINE BREAKDOWN:
${result.disciplineCosts ? Object.entries(result.disciplineCosts).map(([d, c]) => `- ${d.charAt(0).toUpperCase() + d.slice(1)}: ₹${(c as number).toLocaleString()}`).join('\n') : 'N/A'}

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
            Estimate mechanical, electrical, plumbing, and fire system design costs for your project. Choose your vertical (BIM or MEP) and select individual disciplines.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calculator Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
                <CardDescription>Enter your project specifications to calculate costs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Vertical Selection */}
                <div className="space-y-2">
                  <Label>Design Vertical</Label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setVertical("bim")}
                      className={`flex-1 px-4 py-2 rounded-lg border-2 transition ${
                        vertical === "bim"
                          ? "border-primary bg-primary/10 text-primary font-semibold"
                          : "border-border bg-background text-foreground hover:border-primary/50"
                      }`}
                    >
                      BIM-Based Design
                    </button>
                    <button
                      onClick={() => setVertical("mep")}
                      className={`flex-1 px-4 py-2 rounded-lg border-2 transition ${
                        vertical === "mep"
                          ? "border-primary bg-primary/10 text-primary font-semibold"
                          : "border-border bg-background text-foreground hover:border-primary/50"
                      }`}
                    >
                      MEP-Based Design
                    </button>
                  </div>
                </div>

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

                {/* Building Area with Unit Toggle */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="buildingArea">Building Area</Label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setUnitType("sqft")}
                        className={`px-2 py-1 text-xs rounded ${
                          unitType === "sqft" ? "bg-primary text-white" : "bg-secondary text-foreground"
                        }`}
                      >
                        Sq Ft
                      </button>
                      <button
                        onClick={() => setUnitType("sqm")}
                        className={`px-2 py-1 text-xs rounded ${
                          unitType === "sqm" ? "bg-primary text-white" : "bg-secondary text-foreground"
                        }`}
                      >
                        Sq M
                      </button>
                    </div>
                  </div>
                  <Input
                    id="buildingArea"
                    type="number"
                    value={formData.buildingArea}
                    onChange={(e) => handleAreaChange(e.target.value)}
                    placeholder={`Enter building area in ${unitType === "sqft" ? "square feet" : "square meters"}`}
                  />
                  <p className="text-xs text-muted-foreground">
                    {unitType === "sqft" ? `≈ ${Math.round(formData.buildingArea / 10.764)} sq m` : `≈ ${Math.round(formData.buildingArea * 10.764)} sq ft`}
                  </p>
                </div>

                {/* Discipline Selection */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Select Disciplines</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {DISCIPLINES.map((discipline) => (
                      <button
                        key={discipline.id}
                        onClick={() => toggleDiscipline(discipline.id)}
                        className={`p-3 rounded-lg border-2 transition text-left ${
                          selectedDisciplines.includes(discipline.id)
                            ? `${discipline.color} border-current`
                            : "border-border bg-background hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedDisciplines.includes(discipline.id)}
                            onChange={() => {}}
                            className="w-4 h-4"
                          />
                          <div className="flex items-center gap-2">
                            {discipline.icon}
                            <span className="text-sm font-medium">{discipline.label}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
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
                  <Select value={formData.cityId.toString()} onValueChange={handleCityChange}>
                    <SelectTrigger id="city">
                      <SelectValue placeholder="Select a city" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city.id} value={city.id.toString()}>
                          {city.cityName}
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
                      <SelectItem value="simple">Simple</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="complex">Complex</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* LOD Level */}
                <div className="space-y-2">
                  <Label htmlFor="lod">LOD (Level of Development)</Label>
                  <Select value={formData.lodLevel} onValueChange={(value) => setFormData({ ...formData, lodLevel: value })}>
                    <SelectTrigger id="lod">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100">LOD 100 (Conceptual)</SelectItem>
                      <SelectItem value="200">LOD 200 (Schematic)</SelectItem>
                      <SelectItem value="300">LOD 300 (Design Development)</SelectItem>
                      <SelectItem value="350">LOD 350 (Construction Documents)</SelectItem>
                      <SelectItem value="400">LOD 400 (Fabrication)</SelectItem>
                      <SelectItem value="500">LOD 500 (As-Built)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Calculate Button */}
                <Button onClick={handleCalculate} disabled={isCalculating} className="w-full">
                  {isCalculating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    "Calculate Cost"
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
                    <CardTitle className="text-2xl">₹{(result.totalCost || result.adjustedMepCost || 0).toLocaleString()}</CardTitle>
                    <CardDescription>Total {vertical.toUpperCase()} Cost</CardDescription>
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

                {/* Discipline Breakdown */}
                {result.disciplineCosts && Object.keys(result.disciplineCosts).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Discipline Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {Object.entries(result.disciplineCosts).map(([discipline, cost]) => {
                        const disciplineData = DISCIPLINES.find((d) => d.id === discipline);
                        return (
                          <div key={discipline} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium flex items-center gap-2">
                                {disciplineData?.icon}
                                {discipline.charAt(0).toUpperCase() + discipline.slice(1)}
                              </span>
                              <span className="font-semibold">₹{(cost as number).toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${((cost as number) / (result.totalCost || 1)) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                )}

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
              </div>
            ) : (
              <Card className="bg-secondary/50">
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">Select disciplines and fill in project details to see cost estimation</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
