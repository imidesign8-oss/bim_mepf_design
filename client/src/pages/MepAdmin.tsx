import React, { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Edit2, Save, X, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";

export function MepAdmin() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("cities");
  const [editingCity, setEditingCity] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch data
  const { data: states = [] } = trpc.mepCost.states.list.useQuery();
  const { data: cities = [] } = trpc.mepCost.cities.list.useQuery();

  // Mutations
  const updateCityMutation = trpc.mepCost.cities.update.useMutation({
    onSuccess: () => {
      setSuccess("City updated successfully!");
      setEditingCity(null);
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (error) => {
      setError(error.message || "Failed to update city");
    },
  });

  // Check admin access
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You don't have permission to access this page. Only administrators can manage MEP costs.
            </AlertDescription>
          </Alert>
          <Button onClick={() => setLocation("/")} className="mt-4">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const handleUpdateCity = async () => {
    if (!editingCity) return;

    setIsLoading(true);
    await updateCityMutation.mutateAsync({
      id: editingCity.id,
      baseCostResidential: parseFloat(editingCity.baseCostResidential),
      baseCostCommercial: parseFloat(editingCity.baseCostCommercial),
      baseCostIndustrial: parseFloat(editingCity.baseCostIndustrial),
      mepPercentageResidential: parseFloat(editingCity.mepPercentageResidential),
      mepPercentageCommercial: parseFloat(editingCity.mepPercentageCommercial),
      mepPercentageIndustrial: parseFloat(editingCity.mepPercentageIndustrial),
      climateAdjustment: parseFloat(editingCity.climateAdjustment),
      laborCostMultiplier: parseFloat(editingCity.laborCostMultiplier),
    });
    setIsLoading(false);
  };

  const getStateName = (stateId: number) => {
    const state = states.find((s) => s.id === stateId);
    return state?.stateName || "Unknown";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">MEP Cost Management</h1>
          <p className="text-lg text-muted-foreground">
            Manage construction costs and multipliers for Indian cities and states
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <AlertCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="cities">Cities ({cities.length})</TabsTrigger>
            <TabsTrigger value="states">States ({states.length})</TabsTrigger>
          </TabsList>

          {/* Cities Tab */}
          <TabsContent value="cities">
            <Card>
              <CardHeader>
                <CardTitle>City Construction Costs</CardTitle>
                <CardDescription>
                  Update base construction costs and MEP percentages for each city
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {editingCity ? (
                    // Edit Form
                    <Card className="border-primary/50 bg-primary/5 p-6">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold">
                            Editing: {editingCity.cityName} ({getStateName(editingCity.stateId)})
                          </h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingCity(null)}
                            disabled={isLoading}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Residential Cost (₹/sq ft)</Label>
                            <Input
                              type="number"
                              value={editingCity.baseCostResidential}
                              onChange={(e) =>
                                setEditingCity({
                                  ...editingCity,
                                  baseCostResidential: e.target.value,
                                })
                              }
                              disabled={isLoading}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Commercial Cost (₹/sq ft)</Label>
                            <Input
                              type="number"
                              value={editingCity.baseCostCommercial}
                              onChange={(e) =>
                                setEditingCity({
                                  ...editingCity,
                                  baseCostCommercial: e.target.value,
                                })
                              }
                              disabled={isLoading}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Industrial Cost (₹/sq ft)</Label>
                            <Input
                              type="number"
                              value={editingCity.baseCostIndustrial}
                              onChange={(e) =>
                                setEditingCity({
                                  ...editingCity,
                                  baseCostIndustrial: e.target.value,
                                })
                              }
                              disabled={isLoading}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>MEP % Residential</Label>
                            <Input
                              type="number"
                              step="0.1"
                              value={editingCity.mepPercentageResidential}
                              onChange={(e) =>
                                setEditingCity({
                                  ...editingCity,
                                  mepPercentageResidential: e.target.value,
                                })
                              }
                              disabled={isLoading}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>MEP % Commercial</Label>
                            <Input
                              type="number"
                              step="0.1"
                              value={editingCity.mepPercentageCommercial}
                              onChange={(e) =>
                                setEditingCity({
                                  ...editingCity,
                                  mepPercentageCommercial: e.target.value,
                                })
                              }
                              disabled={isLoading}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>MEP % Industrial</Label>
                            <Input
                              type="number"
                              step="0.1"
                              value={editingCity.mepPercentageIndustrial}
                              onChange={(e) =>
                                setEditingCity({
                                  ...editingCity,
                                  mepPercentageIndustrial: e.target.value,
                                })
                              }
                              disabled={isLoading}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Climate Adjustment (%)</Label>
                            <Input
                              type="number"
                              step="0.1"
                              value={editingCity.climateAdjustment}
                              onChange={(e) =>
                                setEditingCity({
                                  ...editingCity,
                                  climateAdjustment: e.target.value,
                                })
                              }
                              disabled={isLoading}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Labor Cost Multiplier</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={editingCity.laborCostMultiplier}
                              onChange={(e) =>
                                setEditingCity({
                                  ...editingCity,
                                  laborCostMultiplier: e.target.value,
                                })
                              }
                              disabled={isLoading}
                            />
                          </div>
                        </div>

                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            onClick={() => setEditingCity(null)}
                            disabled={isLoading}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleUpdateCity} disabled={isLoading}>
                            {isLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Changes
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ) : (
                    // Cities List
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 font-semibold">City</th>
                            <th className="text-left py-3 px-4 font-semibold">State</th>
                            <th className="text-left py-3 px-4 font-semibold">Tier</th>
                            <th className="text-right py-3 px-4 font-semibold">Res. Cost</th>
                            <th className="text-right py-3 px-4 font-semibold">Com. Cost</th>
                            <th className="text-right py-3 px-4 font-semibold">Ind. Cost</th>
                            <th className="text-center py-3 px-4 font-semibold">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cities.map((city) => (
                            <tr key={city.id} className="border-b hover:bg-secondary/50">
                              <td className="py-3 px-4 font-medium">{city.cityName}</td>
                              <td className="py-3 px-4">{getStateName(city.stateId)}</td>
                              <td className="py-3 px-4">{city.tier}</td>
                              <td className="py-3 px-4 text-right">₹{Number(city.baseCostResidential).toLocaleString()}</td>
                              <td className="py-3 px-4 text-right">₹{Number(city.baseCostCommercial).toLocaleString()}</td>
                              <td className="py-3 px-4 text-right">₹{Number(city.baseCostIndustrial).toLocaleString()}</td>
                              <td className="py-3 px-4 text-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingCity(city)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* States Tab */}
          <TabsContent value="states">
            <Card>
              <CardHeader>
                <CardTitle>State Configuration</CardTitle>
                <CardDescription>
                  View and manage state-level regional multipliers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">State</th>
                        <th className="text-left py-3 px-4 font-semibold">Code</th>
                        <th className="text-left py-3 px-4 font-semibold">Region</th>
                        <th className="text-right py-3 px-4 font-semibold">Base Multiplier</th>
                      </tr>
                    </thead>
                    <tbody>
                      {states.map((state) => (
                        <tr key={state.id} className="border-b hover:bg-secondary/50">
                          <td className="py-3 px-4 font-medium">{state.stateName}</td>
                          <td className="py-3 px-4">{state.stateCode}</td>
                          <td className="py-3 px-4">
                            <span className="inline-block px-2 py-1 bg-secondary rounded text-xs font-medium">
                              {state.region}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-semibold">
                            {Number(state.baseMultiplier).toFixed(2)}x
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
