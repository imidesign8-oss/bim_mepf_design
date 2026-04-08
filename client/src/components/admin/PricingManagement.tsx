import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Save, Loader2, X, Search } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  // Filter states
  const [searchCity, setSearchCity] = useState("");
  const [filterState, setFilterState] = useState<number | null>(null);
  const [filterLod, setFilterLod] = useState<string | null>(null);
  const [selectedBimRows, setSelectedBimRows] = useState<Set<string>>(new Set());

  // Fetch BIM LOD pricing
  const { data: bimPricing = [], refetch: refetchBim } = trpc.mepCost.bim.getPricing.useQuery();

  // Fetch MEP discipline weightages
  const { data: mepWeightages = [], refetch: refetchMep } = trpc.mepCost.mep.getWeightages.useQuery();

  // Fetch states for BIM pricing
  const { data: states = [] } = trpc.mepCost.getStates.useQuery();

  // Fetch all cities for filtering
  const { data: allCities = [] } = trpc.mepCost.getAllCities.useQuery();

  // State for BIM pricing edits
  const [bimEdits, setBimEdits] = useState<Record<string, BimPricingRow>>({});

  // State for MEP weightage edits
  const [mepEdits, setMepEdits] = useState<Record<string, number>>({});

  // Update BIM LOD pricing mutation
  const updateBimPricingMutation = trpc.mepCost.bim.updatePricing.useMutation({
    onSuccess: () => {
      toast.success("BIM LOD pricing updated successfully");
      setBimEdits({});
      setSelectedBimRows(new Set());
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

  // Filter BIM pricing based on search and filters
  const filteredBimPricing = bimPricing.filter((row: any) => {
    const city = allCities.find((c: any) => c.id === row.cityId);
    if (!city) return false;

    // Filter by state
    if (filterState !== null && city.stateId !== filterState) return false;

    // Filter by city search
    if (searchCity && !city.cityName.toLowerCase().includes(searchCity.toLowerCase())) return false;

    // Filter by LOD level
    if (filterLod && row.lodLevel !== filterLod) return false;

    return true;
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

  const toggleRowSelection = (key: string) => {
    const newSelected = new Set(selectedBimRows);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    setSelectedBimRows(newSelected);
  };

  const handleBulkUpdate = (field: "residential" | "commercial" | "industrial", value: number) => {
    selectedBimRows.forEach((key) => {
      const [cityIdStr, lodLevel] = key.split("-");
      const cityId = parseInt(cityIdStr);
      handleBimPricingChange(cityId, lodLevel, field, value);
    });
    toast.success(`Updated ${selectedBimRows.size} rows`);
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

              {/* Filters Section */}
              <div className="bg-slate-50 p-4 rounded-lg space-y-4">
                <h3 className="font-semibold text-sm">Filters & Search</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {/* City Search */}
                  <div className="space-y-2">
                    <Label htmlFor="city-search" className="text-xs">Search City</Label>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="city-search"
                        placeholder="e.g., Delhi, Mumbai..."
                        value={searchCity}
                        onChange={(e) => setSearchCity(e.target.value)}
                        className="pl-8 text-sm"
                      />
                    </div>
                  </div>

                  {/* State Filter */}
                  <div className="space-y-2">
                    <Label htmlFor="state-filter" className="text-xs">Filter by State</Label>
                    <Select
                      value={filterState?.toString() || "all"}
                      onValueChange={(val) => setFilterState(val === "all" ? null : parseInt(val))}
                    >
                      <SelectTrigger id="state-filter" className="text-sm">
                        <SelectValue placeholder="All States" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All States</SelectItem>
                        {states.map((state: any) => (
                          <SelectItem key={state.id} value={state.id.toString()}>
                            {state.stateName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* LOD Level Filter */}
                  <div className="space-y-2">
                    <Label htmlFor="lod-filter" className="text-xs">Filter by LOD</Label>
                    <Select
                      value={filterLod || "all"}
                      onValueChange={(val) => setFilterLod(val === "all" ? null : val)}
                    >
                      <SelectTrigger id="lod-filter" className="text-sm">
                        <SelectValue placeholder="All LOD Levels" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All LOD Levels</SelectItem>
                        {LOD_LEVELS.map((lod) => (
                          <SelectItem key={lod} value={lod}>
                            LOD {lod}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Reset Filters */}
                  <div className="space-y-2">
                    <Label className="text-xs">&nbsp;</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchCity("");
                        setFilterState(null);
                        setFilterLod(null);
                      }}
                      className="w-full"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reset
                    </Button>
                  </div>
                </div>

                {/* Bulk Edit Section */}
                {selectedBimRows.size > 0 && (
                  <div className="border-t pt-4 mt-4">
                    <p className="text-sm font-semibold mb-3">
                      Bulk Update ({selectedBimRows.size} selected)
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          const val = prompt("Enter Residential percentage:");
                          if (val !== null) handleBulkUpdate("residential", parseFloat(val) || 0);
                        }}
                      >
                        Update Residential
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          const val = prompt("Enter Commercial percentage:");
                          if (val !== null) handleBulkUpdate("commercial", parseFloat(val) || 0);
                        }}
                      >
                        Update Commercial
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          const val = prompt("Enter Industrial percentage:");
                          if (val !== null) handleBulkUpdate("industrial", parseFloat(val) || 0);
                        }}
                      >
                        Update Industrial
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedBimRows(new Set())}
                      >
                        Clear Selection
                      </Button>
                    </div>
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  Showing {filteredBimPricing.length} of {bimPricing.length} entries
                </p>
              </div>

              {/* Pricing Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b-2 border-border">
                      <th className="text-left py-3 px-4 font-semibold w-12">
                        <input
                          type="checkbox"
                          checked={selectedBimRows.size === filteredBimPricing.length && filteredBimPricing.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              const newSelected = new Set<string>();
                              filteredBimPricing.forEach((row: any) => {
                                newSelected.add(`${row.cityId}-${row.lodLevel}`);
                              });
                              setSelectedBimRows(newSelected);
                            } else {
                              setSelectedBimRows(new Set());
                            }
                          }}
                        />
                      </th>
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
                    {filteredBimPricing.map((row: any) => {
                      const city = allCities.find((c: any) => c.id === row.cityId);
                      const rowKey = `${row.cityId}-${row.lodLevel}`;
                      const isSelected = selectedBimRows.has(rowKey);

                      return (
                        <tr
                          key={rowKey}
                          className={`border-b border-border hover:bg-secondary/50 ${
                            isSelected ? "bg-blue-50" : ""
                          }`}
                        >
                          <td className="py-3 px-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleRowSelection(rowKey)}
                            />
                          </td>
                          <td className="py-3 px-4 font-medium text-sm">{city?.cityName || "Unknown"}</td>
                          {LOD_LEVELS.map((lod) => {
                            const key = `${row.cityId}-${lod}`;
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
                                          row.cityId,
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
                                          row.cityId,
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
                                          row.cityId,
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
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {Object.keys(bimEdits).length > 0 && (
                <Button
                  onClick={handleSaveBimPricing}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Save {Object.keys(bimEdits).length} Changes
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* MEP Discipline Weightages Tab */}
        <TabsContent value="mep" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>MEP Discipline Weightages</CardTitle>
              <CardDescription>
                Manage the cost distribution percentage for each MEP discipline
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Weightages determine the cost distribution across disciplines. Total should equal 100%.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                {DISCIPLINES.map((discipline) => {
                  const original = mepWeightages.find((w: any) => w.discipline === discipline);
                  const edited = mepEdits[discipline];
                  const value = edited ?? parseFloat(String(original?.weightagePercentage || 0));

                  return (
                    <div key={discipline} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>{DISCIPLINE_LABELS[discipline]}</Label>
                        <span className="text-sm font-semibold">{value.toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Input
                          type="range"
                          min="0"
                          max="100"
                          step="0.1"
                          value={value}
                          onChange={(e) =>
                            handleMepWeightageChange(discipline, parseFloat(e.target.value))
                          }
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={value}
                          onChange={(e) =>
                            handleMepWeightageChange(discipline, parseFloat(e.target.value) || 0)
                          }
                          className="w-20 text-center"
                        />
                        <span className="text-sm">%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total Weightage Display */}
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Weightage</span>
                  <span className={`text-lg font-bold ${
                    Math.abs(
                      DISCIPLINES.reduce((sum, d) => {
                        const edited = mepEdits[d];
                        const original = mepWeightages.find((w: any) => w.discipline === d);
                        return sum + (edited ?? parseFloat(String(original?.weightagePercentage || 0)));
                      }, 0) - 100
                    ) < 0.1 ? "text-green-600" : "text-orange-600"
                  }`}>
                    {DISCIPLINES.reduce((sum, d) => {
                      const edited = mepEdits[d];
                      const original = mepWeightages.find((w: any) => w.discipline === d);
                      return sum + (edited ?? parseFloat(String(original?.weightagePercentage || 0)));
                    }, 0).toFixed(1)}%
                  </span>
                </div>
              </div>

              {Object.keys(mepEdits).length > 0 && (
                <Button
                  onClick={handleSaveMepWeightage}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Save {Object.keys(mepEdits).length} Changes
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
