import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Save, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

const LOD_LEVELS = ["100", "200", "300", "400", "500"];
const LOD_DESCRIPTIONS: Record<string, string> = {
  "100": "Concept/Feasibility",
  "200": "Schematic Design",
  "300": "Design Development",
  "400": "Construction Documents",
  "500": "As-Built",
};

const DISCIPLINES = ["electrical", "plumbing", "hvac", "fire-system"];
const DISCIPLINE_LABELS: Record<string, string> = {
  electrical: "Electrical Design",
  plumbing: "Plumbing Design",
  hvac: "HVAC Design",
  "fire-system": "Fire System Design",
};

interface BimPricingRow {
  cityId: number;
  lodLevel: string;
  residential: number;
  commercial: number;
  industrial: number;
}

export default function PricingManagement() {
  const [activeTab, setActiveTab] = useState("bim");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch BIM LOD pricing
  const { data: bimPricing = [], refetch: refetchBim } = trpc.mepCost.bim.getPricing.useQuery();

  // Fetch MEP discipline weightages
  const { data: mepWeightages = [], refetch: refetchMep } = trpc.mepCost.mep.getWeightages.useQuery();

  // Fetch states for BIM pricing
  const { data: states = [] } = trpc.mepCost.getStates.useQuery();

  // State for BIM pricing edits
  const [bimEdits, setBimEdits] = useState<Record<string, BimPricingRow>>({});

  // State for MEP weightage edits
  const [mepEdits, setMepEdits] = useState<Record<string, number>>({});

  // Update BIM LOD pricing mutation
  const updateBimPricingMutation = trpc.mepCost.bim.updatePricing.useMutation({
    onSuccess: () => {
      toast.success("BIM LOD pricing updated successfully");
      setBimEdits({});
      refetchBim();
    },
    onError: (err: any) => {
      toast.error("Failed to update BIM pricing: " + (err.message || "Unknown error"));
    },
  });

  // Update MEP weightage mutation
  const updateMepWeightageMutation = trpc.mepCost.mep.updateWeightage.useMutation({
    onSuccess: () => {
      toast.success("MEP discipline weightages updated successfully");
      setMepEdits({});
      refetchMep();
    },
    onError: (err: any) => {
      toast.error("Failed to update MEP weightages: " + (err.message || "Unknown error"));
    },
  });

  const handleBimPricingChange = (
    cityId: number,
    lodLevel: string,
    field: "residential" | "commercial" | "industrial",
    value: number
  ) => {
    const key = `${cityId}-${lodLevel}`;
    const existing = bimEdits[key] || {
      cityId,
      lodLevel,
      residential: 0,
      commercial: 0,
      industrial: 0,
    };

    // Find original values if not being edited
    if (!bimEdits[key]) {
      const original = bimPricing.find(
        (p: any) => p.cityId === cityId && p.lodLevel === lodLevel
      );
      if (original) {
        existing.residential = parseFloat(String(original.bimPercentageResidential || 0));
        existing.commercial = parseFloat(String(original.bimPercentageCommercial || 0));
        existing.industrial = parseFloat(String(original.bimPercentageIndustrial || 0));
      }
    }

    setBimEdits((prev) => ({
      ...prev,
      [key]: {
        ...existing,
        [field]: value,
      },
    }));
  };

  const handleMepWeightageChange = (discipline: string, value: number) => {
    setMepEdits((prev) => ({
      ...prev,
      [discipline]: value,
    }));
  };

  const handleSaveBimPricing = async () => {
    setIsLoading(true);
    try {
      const updates = Object.values(bimEdits);
      if (updates.length > 0) {
        await updateBimPricingMutation.mutateAsync({ updates });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveMepWeightage = async () => {
    setIsLoading(true);
    try {
      const updates = [];
      for (const discipline in mepEdits) {
        updates.push({
          discipline,
          weightage: mepEdits[discipline],
        });
      }
      if (updates.length > 0) {
        await updateMepWeightageMutation.mutateAsync({ updates });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Group BIM pricing by city and LOD
  const bimByKey: Record<string, any> = {};
  bimPricing.forEach((item: any) => {
    const key = `${item.cityId}-${item.lodLevel}`;
    bimByKey[key] = item;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Pricing Management</h2>
        <p className="text-muted-foreground">Manage BIM LOD pricing and MEP discipline weightages</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="bim">BIM LOD Pricing</TabsTrigger>
          <TabsTrigger value="mep">MEP Discipline Weightages</TabsTrigger>
        </TabsList>

        {/* BIM LOD Pricing Tab */}
        <TabsContent value="bim" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>BIM LOD Pricing by City</CardTitle>
              <CardDescription>
                Manage BIM Level of Detail pricing percentages for each city and project type
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Pricing is calculated as a percentage of project cost. LOD 300 (Design Development) is typically 6%.
                </AlertDescription>
              </Alert>

              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b-2 border-border">
                      <th className="text-left py-3 px-4 font-semibold">City</th>
                      {LOD_LEVELS.map((lod) => (
                        <th key={lod} colSpan={3} className="text-center py-3 px-4 font-semibold border-l">
                          <div>LOD {lod}</div>
                          <div className="text-xs text-muted-foreground font-normal">
                            {LOD_DESCRIPTIONS[lod]}
                          </div>
                        </th>
                      ))}
                    </tr>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-4"></th>
                      {LOD_LEVELS.map((lod) => (
                        <th key={`${lod}-res`} colSpan={3} className="text-center py-2 px-2">
                          <div className="grid grid-cols-3 gap-1 text-xs">
                            <div>Res</div>
                            <div>Com</div>
                            <div>Ind</div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {states.map((state: any) => (
                      <tr key={state.id} className="border-b border-border hover:bg-secondary/50">
                        <td className="py-3 px-4 font-medium text-sm">{state.stateName}</td>
                        {LOD_LEVELS.map((lod) => {
                          const key = `${state.id}-${lod}`;
                          const original = bimByKey[key];
                          const edited = bimEdits[key];

                          const residential = edited?.residential ?? parseFloat(String(original?.bimPercentageResidential || 0));
                          const commercial = edited?.commercial ?? parseFloat(String(original?.bimPercentageCommercial || 0));
                          const industrial = edited?.industrial ?? parseFloat(String(original?.bimPercentageIndustrial || 0));

                          return (
                            <td key={lod} className="py-2 px-2 border-l">
                              <div className="grid grid-cols-3 gap-1">
                                <div className="flex items-center">
                                  <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    value={residential}
                                    onChange={(e) =>
                                      handleBimPricingChange(
                                        state.id,
                                        lod,
                                        "residential",
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                    className="w-12 text-center text-xs py-1"
                                    placeholder="0"
                                  />
                                  <span className="text-xs ml-0.5">%</span>
                                </div>
                                <div className="flex items-center">
                                  <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    value={commercial}
                                    onChange={(e) =>
                                      handleBimPricingChange(
                                        state.id,
                                        lod,
                                        "commercial",
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                    className="w-12 text-center text-xs py-1"
                                    placeholder="0"
                                  />
                                  <span className="text-xs ml-0.5">%</span>
                                </div>
                                <div className="flex items-center">
                                  <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    value={industrial}
                                    onChange={(e) =>
                                      handleBimPricingChange(
                                        state.id,
                                        lod,
                                        "industrial",
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                    className="w-12 text-center text-xs py-1"
                                    placeholder="0"
                                  />
                                  <span className="text-xs ml-0.5">%</span>
                                </div>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setBimEdits({});
                    refetchBim();
                  }}
                  disabled={isLoading || Object.keys(bimEdits).length === 0}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveBimPricing}
                  disabled={isLoading || Object.keys(bimEdits).length === 0}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save BIM Pricing
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* MEP Discipline Weightages Tab */}
        <TabsContent value="mep" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>MEP Discipline Weightages</CardTitle>
              <CardDescription>
                Manage the cost distribution across MEP disciplines (total should equal 100%)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  The sum of all discipline weightages should equal 100%. Current total:{" "}
                  <span className="font-semibold">
                    {Object.values(mepEdits).reduce((a, b) => a + b, 0) ||
                      mepWeightages.reduce((sum: number, item: any) => sum + parseFloat(item.weightagePercentage || 0), 0)}
                    %
                  </span>
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                {DISCIPLINES.map((discipline) => {
                  const currentValue =
                    mepEdits[discipline] ??
                    parseFloat(
                      String(mepWeightages.find((w: any) => w.discipline === discipline)?.weightagePercentage ?? 0)
                    );
                  return (
                    <div key={discipline} className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <Label className="text-base font-semibold">
                          {DISCIPLINE_LABELS[discipline]}
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.5"
                            value={currentValue}
                            onChange={(e) =>
                              handleMepWeightageChange(
                                discipline,
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-24 text-center"
                            placeholder="0"
                          />
                          <span className="text-sm font-medium">%</span>
                        </div>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary rounded-full h-2 transition-all"
                          style={{ width: `${Math.min(currentValue, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setMepEdits({});
                    refetchMep();
                  }}
                  disabled={isLoading || Object.keys(mepEdits).length === 0}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveMepWeightage}
                  disabled={isLoading || Object.keys(mepEdits).length === 0}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Weightages
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
