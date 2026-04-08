"use client";

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
import { Loader2, Download, Share2, AlertCircle, Zap, Droplet, Wind, Flame, Mail } from "lucide-react";
import html2pdf from "html2pdf.js";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EmailReportDialog } from "@/components/EmailReportDialog";

type Vertical = "bim" | "mep";
type ProjectType = "residential" | "commercial" | "industrial" | "hospitality" | "mixed-use";
type Discipline = "electrical" | "plumbing" | "hvac" | "fire-system";
type LodLevel = "100" | "200" | "300" | "400" | "500";

interface DisciplineOption {
  id: Discipline;
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
  const [vertical, setVertical] = useState<Vertical>("mep");
  const [unitType, setUnitType] = useState<"sqft" | "sqm">("sqft");
  const [selectedDisciplines, setSelectedDisciplines] = useState<Discipline[]>(["electrical", "plumbing"]);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [reportHtmlForEmail, setReportHtmlForEmail] = useState("");
  const [formData, setFormData] = useState({
    projectType: "residential" as ProjectType,
    buildingArea: 1000,
    constructionCost: 2000000,
    projectCost: 2000000,
    stateId: 0,
    cityId: 0,
    lodLevel: "300" as LodLevel,
  });

  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  // Fetch states
  const { data: states = [] } = trpc.mepCost.getStates.useQuery();

  // Fetch cities for selected state
  const { data: cities = [] } = trpc.mepCost.getCitiesByState.useQuery(
    { stateId: formData.stateId },
    { enabled: formData.stateId > 0 }
  );

  // MEP calculation mutation
  const mepCalculation = trpc.mepCost.disciplines.calculate.useMutation({
    onSuccess: (data) => {
      setResult({ ...data, type: "mep" });
    },
    onError: (err) => {
      setError(err.message || "MEP calculation failed");
    },
  });

  // BIM calculation mutation
  const bimCalculation = trpc.mepCost.bim.calculate.useMutation({
    onSuccess: (data) => {
      setResult({ ...data, type: "bim" });
    },
    onError: (err) => {
      setError(err.message || "BIM calculation failed");
    },
  });

  // Report generation mutations
  const reportGeneration = trpc.mepCost.generateReport.useMutation();
  const bimReportGeneration = trpc.mepCost.bim.generateReport.useMutation();

  const handleStateChange = (stateId: string) => {
    const id = parseInt(stateId);
    setFormData({ ...formData, stateId: id, cityId: 0 });
  };

  const handleCityChange = (cityId: string) => {
    setFormData({ ...formData, cityId: parseInt(cityId) });
  };

  const handleAreaChange = (value: string) => {
    const area = parseFloat(value) || 0;
    setFormData({ ...formData, buildingArea: area });
  };

  const toggleDiscipline = (discipline: Discipline) => {
    setSelectedDisciplines((prev) =>
      prev.includes(discipline) ? prev.filter((d) => d !== discipline) : [...prev, discipline]
    );
  };

  const handleCalculate = async () => {
    setError("");
    setResult(null);

    if (formData.stateId === 0) {
      setError("Please select a state");
      return;
    }
    if (formData.cityId === 0) {
      setError("Please select a city");
      return;
    }

    if (vertical === "mep") {
      if (selectedDisciplines.length === 0) {
        setError("Please select at least one discipline");
        return;
      }
      mepCalculation.mutate({
        constructionCost: formData.constructionCost,
        projectType: formData.projectType,
        cityId: formData.cityId,
        selectedDisciplines,
        areaUnit: unitType,
        buildingArea: formData.buildingArea,
      });
    } else {
      bimCalculation.mutate({
        projectCost: formData.projectCost,
        projectType: formData.projectType,
        cityId: formData.cityId,
        lodLevel: formData.lodLevel,
        areaUnit: unitType,
        buildingArea: formData.buildingArea,
      });
    }
  };

  const isCalculating = mepCalculation.isPending || bimCalculation.isPending;

  const handleDownloadReport = async () => {
    if (!result) return;

    // Get selected city and state names
    const selectedCity = cities.find((c: any) => c.id === formData.cityId);
    const selectedState = states.find((s: any) => s.id === formData.stateId);

    if (vertical === "mep" && result.type === "mep") {
      const disciplineCosts: Record<string, number> = {};
      for (const d of DISCIPLINES) {
        const bd = result.disciplineBreakdown?.[d.id];
        if (bd) disciplineCosts[d.id] = bd.cost;
      }

      try {
        const reportResult = await reportGeneration.mutateAsync({
          projectType: formData.projectType,
          buildingArea: formData.buildingArea,
          areaUnit: unitType,
          complexity: "moderate",
          greenCertification: "none",
          materialQuality: "standard",
          selectedDisciplines: selectedDisciplines,
          totalCost: result.totalMepCost,
          costPerUnit: result.costPerUnit,
          accuracyRange: result.accuracyRange,
          disciplineCosts,
          city: selectedCity?.cityName || "Unknown",
          state: selectedState?.stateName || "Unknown",
        });

        // Store HTML for email sharing
        setReportHtmlForEmail(reportResult.html);
        
        // Open HTML report in new window for printing as PDF
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.write(reportResult.html);
          printWindow.document.close();
          setTimeout(() => printWindow.print(), 500);
        }
      } catch (err: any) {
        setError("Failed to generate report");
      }
    } else if (vertical === "bim" && result.type === "bim") {
      // BIM PDF report generation - use print window for reliability
      try {
        const reportResult = await bimReportGeneration.mutateAsync({
          projectType: formData.projectType,
          buildingArea: formData.buildingArea,
          areaUnit: unitType,
          lodLevel: formData.lodLevel,
          lodPercentage: result.bimPercentage,
          projectCost: formData.projectCost,
          bimCost: result.totalBimCost,
          costPerUnit: result.costPerUnit,
          accuracyRange: result.accuracyRange,
          city: selectedCity?.cityName || "Unknown",
          state: selectedState?.stateName || "Unknown",
        });

        // Store HTML for email sharing
        setReportHtmlForEmail(reportResult.html);
        
        // Use print window approach for BIM as well (more reliable than html2pdf)
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.write(reportResult.html);
          printWindow.document.close();
          setTimeout(() => printWindow.print(), 500);
        }
      } catch (err: any) {
        setError("Failed to generate BIM report: " + (err.message || "Unknown error"));
      }
    }
  };

  // Results display helpers
  const totalCost = result?.type === "mep" ? result?.totalMepCost : result?.totalBimCost;
  const costPerUnit = result?.costPerUnit || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-slate-900">Cost Estimation Calculator</h1>
          <p className="text-lg text-slate-600">Get accurate MEP and BIM design cost estimates</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
                <CardDescription>Configure your project parameters</CardDescription>
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
                      onClick={() => { setVertical("bim"); setResult(null); }}
                      className={`flex-1 px-4 py-2 rounded-lg border-2 transition ${
                        vertical === "bim"
                          ? "border-primary bg-primary/10 text-primary font-semibold"
                          : "border-border bg-background text-foreground hover:border-primary/50"
                      }`}
                    >
                      BIM-Based Design
                    </button>
                    <button
                      onClick={() => { setVertical("mep"); setResult(null); }}
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
                  <Select value={formData.projectType} onValueChange={(value) => setFormData({ ...formData, projectType: value as ProjectType })}>
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
                    placeholder={`Enter area in ${unitType === "sqft" ? "square feet" : "square meters"}`}
                  />
                  {unitType === "sqft" && formData.buildingArea > 0 && (
                    <p className="text-xs text-muted-foreground">≈ {Math.round(formData.buildingArea * 0.0929)} sq m</p>
                  )}
                  {unitType === "sqm" && formData.buildingArea > 0 && (
                    <p className="text-xs text-muted-foreground">≈ {Math.round(formData.buildingArea * 10.764)} sq ft</p>
                  )}
                </div>

                {/* Construction/Project Cost */}
                <div className="space-y-2">
                  <Label htmlFor="cost">
                    {vertical === "mep" ? "Construction Cost (₹)" : "Project Cost (₹)"}
                  </Label>
                  <Input
                    id="cost"
                    type="number"
                    value={vertical === "mep" ? formData.constructionCost : formData.projectCost}
                    onChange={(e) =>
                      vertical === "mep"
                        ? setFormData({ ...formData, constructionCost: parseFloat(e.target.value) || 0 })
                        : setFormData({ ...formData, projectCost: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="Enter total cost in INR"
                  />
                  {vertical === "mep" && (
                    <p className="text-xs text-muted-foreground">MEP design fee is typically 1-2% of construction cost</p>
                  )}
                  {vertical === "bim" && (
                    <p className="text-xs text-muted-foreground">BIM services cost is typically 4-10% of project cost</p>
                  )}
                </div>

                {/* State Selection */}
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Select value={formData.stateId > 0 ? formData.stateId.toString() : ""} onValueChange={handleStateChange}>
                    <SelectTrigger id="state">
                      <SelectValue placeholder="Select a state" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((state: any) => (
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
                  <Select value={formData.cityId > 0 ? formData.cityId.toString() : ""} onValueChange={handleCityChange}>
                    <SelectTrigger id="city">
                      <SelectValue placeholder="Select a city" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city: any) => (
                        <SelectItem key={city.id} value={city.id.toString()}>
                          {city.cityName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* LOD Level - ONLY for BIM */}
                {vertical === "bim" && (
                  <div className="space-y-2">
                    <Label htmlFor="lod">LOD (Level of Development)</Label>
                    <Select value={formData.lodLevel} onValueChange={(value) => setFormData({ ...formData, lodLevel: value as LodLevel })}>
                      <SelectTrigger id="lod">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="100">LOD 100 (Conceptual)</SelectItem>
                        <SelectItem value="200">LOD 200 (Schematic)</SelectItem>
                        <SelectItem value="300">LOD 300 (Design Development)</SelectItem>
                        <SelectItem value="400">LOD 400 (Construction Documents)</SelectItem>
                        <SelectItem value="500">LOD 500 (As-Built)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Higher LOD = more detail = higher accuracy</p>
                  </div>
                )}

                {/* Discipline Selection - ONLY for MEP */}
                {vertical === "mep" && (
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Select Disciplines</Label>
                    <div className="space-y-2">
                      {DISCIPLINES.map((discipline) => (
                        <button
                          key={discipline.id}
                          onClick={() => toggleDiscipline(discipline.id)}
                          className={`w-full p-3 rounded-lg border-2 transition text-left ${
                            selectedDisciplines.includes(discipline.id)
                              ? `${discipline.color} border-current`
                              : "border-border bg-background hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selectedDisciplines.includes(discipline.id)}
                              onChange={() => {}}
                              className="w-4 h-4 accent-primary"
                            />
                            {discipline.icon}
                            <span className="font-medium">{discipline.label}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Calculate Button */}
                <Button onClick={handleCalculate} disabled={isCalculating} className="w-full" size="lg">
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

          {/* Results Section */}
          <div className="lg:col-span-2">
            {result ? (
              <div className="space-y-6">
                {/* Total Cost Card */}
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total {vertical === "mep" ? "MEP Design" : "BIM Services"} Cost
                        </p>
                        <p className="text-4xl font-bold text-primary">
                          ₹{(totalCost || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Cost per {unitType === "sqft" ? "Sq Ft" : "Sq M"}</p>
                          <p className="text-lg font-semibold">₹{costPerUnit.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Accuracy Range</p>
                          <p className="text-lg font-semibold">{result.accuracyRange}</p>
                        </div>
                      </div>
                      {result.type === "mep" && (
                        <div className="pt-2 border-t">
                          <p className="text-xs text-muted-foreground">
                            MEP Percentage Applied: {result.mepPercentage}% of ₹{(vertical === "mep" ? formData.constructionCost : formData.projectCost).toLocaleString("en-IN")}
                          </p>
                        </div>
                      )}
                      {result.type === "bim" && (
                        <div className="pt-2 border-t">
                          <p className="text-xs text-muted-foreground">
                            BIM Percentage Applied: {result.bimPercentage}% | LOD Level: {result.lodLevel}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Discipline Breakdown - ONLY for MEP */}
                {result.type === "mep" && result.disciplineBreakdown && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Discipline Breakdown</CardTitle>
                      <CardDescription>Cost distribution across MEP disciplines</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {DISCIPLINES.map((discipline) => {
                        const breakdown = result.disciplineBreakdown[discipline.id];
                        if (!breakdown) return null;
                        const isSelected = selectedDisciplines.includes(discipline.id);
                        const percentage = totalCost > 0 && breakdown.cost > 0 ? (breakdown.cost / totalCost) * 100 : 0;
                        return (
                          <div key={discipline.id} className={`space-y-2 p-3 rounded-lg ${isSelected ? "bg-slate-50" : "bg-slate-50/50 opacity-50"}`}>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                {discipline.icon}
                                <span className={`font-medium ${!isSelected ? "line-through" : ""}`}>
                                  {discipline.label}
                                </span>
                                {!isSelected && (
                                  <span className="text-xs text-muted-foreground">(Not selected)</span>
                                )}
                              </div>
                              <span className="font-semibold">
                                ₹{breakdown.cost.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                              </span>
                            </div>
                            {isSelected && (
                              <>
                                <div className="w-full bg-secondary rounded-full h-2">
                                  <div
                                    className="bg-primary rounded-full h-2 transition-all"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {percentage.toFixed(1)}% of total | Weightage: {breakdown.percentage.toFixed(1)}%
                                </p>
                              </>
                            )}
                          </div>
                        );
                      })}

                      {/* Verification: Sum check */}
                      <div className="pt-3 border-t mt-4">
                        <div className="flex justify-between items-center font-semibold">
                          <span>Total (Selected Disciplines)</span>
                          <span>₹{(totalCost || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* BIM Details Card */}
                {result.type === "bim" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>BIM Cost Details</CardTitle>
                      <CardDescription>LOD-based cost estimation</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <p className="text-xs text-muted-foreground">LOD Level</p>
                          <p className="text-lg font-semibold">LOD {result.lodLevel}</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <p className="text-xs text-muted-foreground">BIM Percentage</p>
                          <p className="text-lg font-semibold">{result.bimPercentage}%</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <p className="text-xs text-muted-foreground">Project Cost</p>
                          <p className="text-lg font-semibold">₹{formData.projectCost.toLocaleString("en-IN")}</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <p className="text-xs text-muted-foreground">BIM Services Cost</p>
                          <p className="text-lg font-semibold">₹{result.totalBimCost.toLocaleString("en-IN")}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" className="flex-1 min-w-[100px]" onClick={handleDownloadReport}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 min-w-[100px]" 
                    onClick={async (e) => {
                      try {
                        const url = window.location.href;
                        await navigator.clipboard.writeText(url);
                        const btn = e.currentTarget as HTMLButtonElement;
                        const originalHTML = btn.innerHTML;
                        btn.innerHTML = '<span>✓ Copied!</span>';
                        setTimeout(() => {
                          btn.innerHTML = originalHTML;
                        }, 2000);
                      } catch (err) {
                        setError("Failed to copy link to clipboard");
                      }
                    }}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 min-w-[100px]"
                    onClick={() => setEmailDialogOpen(true)}
                    disabled={!reportHtmlForEmail}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Email
                  </Button>
                </div>

                {/* Disclaimer */}
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                  <p className="font-semibold mb-1">Disclaimer</p>
                  <p>
                    This is an approximate estimate based on industry data and should NOT be used as the sole basis for project budgeting. 
                    Actual costs may vary based on specific project requirements, site conditions, and current market rates. 
                    Always get multiple quotes from qualified MEP/BIM contractors before finalizing budgets.
                  </p>
                </div>
              </div>
            ) : (
              <Card className="h-full flex items-center justify-center min-h-96">
                <CardContent className="text-center space-y-4">
                  <div className="text-6xl">📐</div>
                  <h3 className="text-xl font-semibold">Ready to Estimate</h3>
                  <p className="text-muted-foreground max-w-md">
                    Select your design vertical ({vertical === "mep" ? "MEP" : "BIM"}), 
                    fill in project details, and click "Calculate Cost" to get your estimate.
                  </p>
                  {vertical === "mep" && (
                    <p className="text-xs text-muted-foreground">
                      MEP design fee: 1-2% of construction cost | No LOD levels
                    </p>
                  )}
                  {vertical === "bim" && (
                    <p className="text-xs text-muted-foreground">
                      BIM services: 4-10% of project cost | LOD 100-500
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Email Report Dialog */}
      <EmailReportDialog
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
        reportHtml={reportHtmlForEmail}
        reportType={vertical}
        projectType={formData.projectType}
        totalCost={vertical === "mep" ? result?.totalMepCost || 0 : result?.totalBimCost || 0}
      />
    </div>
  );
}
