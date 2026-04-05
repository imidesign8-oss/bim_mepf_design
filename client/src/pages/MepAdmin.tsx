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
import { Loader2, Edit2, Save, X, AlertCircle, Plus, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";

export function MepAdmin() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("cities");
  const [editingCity, setEditingCity] = useState<any>(null);
  const [newCity, setNewCity] = useState<any>(null);
  const [selectedStateForNewCity, setSelectedStateForNewCity] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch data
  const { data: states = [] } = trpc.mepCost.states.list.useQuery();
  const { data: cities = [] } = trpc.mepCost.cities.list.useQuery();
  const { data: disciplines = [] } = trpc.mepCost.disciplines.getByCity.useQuery(
    { cityId: editingCity?.id || 0 },
    { enabled: !!editingCity?.id }
  );

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

  const createCityMutation = trpc.mepCost.cities.create.useMutation({
    onSuccess: () => {
      setSuccess("City created successfully!");
      setNewCity(null);
      setSelectedStateForNewCity("");
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (error) => {
      setError(error.message || "Failed to create city");
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

  const handleCreateCity = async () => {
    if (!newCity || !selectedStateForNewCity) {
      setError("Please fill all fields");
      return;
    }

    setIsLoading(true);
    await createCityMutation.mutateAsync({
      stateId: parseInt(selectedStateForNewCity),
      cityName: newCity.cityName,
      tier: newCity.tier,
      baseCostResidential: parseFloat(newCity.baseCostResidential),
      baseCostCommercial: parseFloat(newCity.baseCostCommercial),
      baseCostIndustrial: parseFloat(newCity.baseCostIndustrial),
      mepPercentageResidential: parseFloat(newCity.mepPercentageResidential || "12"),
      mepPercentageCommercial: parseFloat(newCity.mepPercentageCommercial || "15"),
      mepPercentageIndustrial: parseFloat(newCity.mepPercentageIndustrial || "13"),
      climateZone: newCity.climateZone,
      climateAdjustment: parseFloat(newCity.climateAdjustment || "0"),
      laborCostMultiplier: parseFloat(newCity.laborCostMultiplier || "1.0"),
    });
    setIsLoading(false);
  };

  const getStateName = (stateId: number) => {
    const state = states.find((s) => s.id === stateId);
    return state?.stateName || "Unknown";
  };

  const getCitiesByState = (stateId: number) => {
    return cities.filter((c) => c.stateId === stateId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">MEP Cost Management</h1>
          <p className="text-lg text-muted-foreground">
            Manage construction costs, cities, and discipline pricing
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="cities">Cities ({cities.length})</TabsTrigger>
            <TabsTrigger value="states">States ({states.length})</TabsTrigger>
            <TabsTrigger value="disciplines">Disciplines</TabsTrigger>
            <TabsTrigger value="newcity">Add City</TabsTrigger>
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

                        {/* Construction Costs */}
                        <div>
                          <h4 className="font-semibold mb-3">Base Construction Costs (₹/sq ft)</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>Residential</Label>
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
                              <Label>Commercial</Label>
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
                              <Label>Industrial</Label>
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
                        </div>

                        {/* MEP Percentages */}
                        <div>
                          <h4 className="font-semibold mb-3">MEP Percentage of Total Cost</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>Residential (%)</Label>
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
                              <Label>Commercial (%)</Label>
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
                              <Label>Industrial (%)</Label>
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
                        </div>

                        {/* Adjustments */}
                        <div>
                          <h4 className="font-semibold mb-3">Adjustments</h4>
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
                  View state-level regional multipliers and cities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {states.map((state) => {
                    const stateCities = getCitiesByState(state.id);
                    return (
                      <Card key={state.id} className="border">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{state.stateName}</CardTitle>
                              <CardDescription>
                                Region: {state.region} | Code: {state.stateCode} | Multiplier: {Number(state.baseMultiplier).toFixed(2)}x
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {stateCities.length > 0 ? (
                            <div className="space-y-2">
                              <p className="text-sm font-semibold">Cities ({stateCities.length}):</p>
                              <ul className="list-disc list-inside space-y-1">
                                {stateCities.map((city) => (
                                  <li key={city.id} className="text-sm">
                                    {city.cityName} ({city.tier})
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground italic">No cities added yet</p>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Disciplines Tab */}
          <TabsContent value="disciplines">
            <Card>
              <CardHeader>
                <CardTitle>Discipline Cost Management</CardTitle>
                <CardDescription>
                  View and manage discipline-specific costs by city
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select City</Label>
                    <Select
                      value={editingCity?.id?.toString() || ""}
                      onValueChange={(value) => {
                        const city = cities.find((c) => c.id === parseInt(value));
                        setEditingCity(city);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a city to view disciplines" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city.id} value={city.id.toString()}>
                            {city.cityName} ({getStateName(city.stateId)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {editingCity && disciplines.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 font-semibold">Discipline</th>
                            <th className="text-right py-3 px-4 font-semibold">Residential</th>
                            <th className="text-right py-3 px-4 font-semibold">Commercial</th>
                            <th className="text-right py-3 px-4 font-semibold">Industrial</th>
                            <th className="text-right py-3 px-4 font-semibold">% of MEP</th>
                          </tr>
                        </thead>
                        <tbody>
                          {disciplines.map((discipline) => (
                            <tr key={discipline.id} className="border-b hover:bg-secondary/50">
                              <td className="py-3 px-4 font-medium capitalize">
                                {discipline.discipline.replace("-", " ")}
                              </td>
                              <td className="py-3 px-4 text-right">₹{Number(discipline.costResidential).toLocaleString()}</td>
                              <td className="py-3 px-4 text-right">₹{Number(discipline.costCommercial).toLocaleString()}</td>
                              <td className="py-3 px-4 text-right">₹{Number(discipline.costIndustrial).toLocaleString()}</td>
                              <td className="py-3 px-4 text-right">{Number(discipline.percentageOfMep).toFixed(1)}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {editingCity && disciplines.length === 0 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        No discipline costs found for this city. Please check the database.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Add City Tab */}
          <TabsContent value="newcity">
            <Card>
              <CardHeader>
                <CardTitle>Add New City</CardTitle>
                <CardDescription>
                  Add a new city to a state for MEP cost estimation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-w-2xl">
                  <div className="space-y-2">
                    <Label>Select State</Label>
                    <Select value={selectedStateForNewCity} onValueChange={setSelectedStateForNewCity}>
                      <SelectTrigger>
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

                  <div className="space-y-2">
                    <Label>City Name</Label>
                    <Input
                      placeholder="e.g., Bangalore"
                      value={newCity?.cityName || ""}
                      onChange={(e) =>
                        setNewCity({ ...newCity, cityName: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tier</Label>
                    <Select
                      value={newCity?.tier || ""}
                      onValueChange={(value) =>
                        setNewCity({ ...newCity, tier: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select tier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tier-1">Tier-1 (Metro)</SelectItem>
                        <SelectItem value="Tier-2">Tier-2 (Major)</SelectItem>
                        <SelectItem value="Tier-3">Tier-3 (Other)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Base Construction Costs (₹/sq ft)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Residential</Label>
                        <Input
                          type="number"
                          placeholder="2500"
                          value={newCity?.baseCostResidential || ""}
                          onChange={(e) =>
                            setNewCity({
                              ...newCity,
                              baseCostResidential: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Commercial</Label>
                        <Input
                          type="number"
                          placeholder="3500"
                          value={newCity?.baseCostCommercial || ""}
                          onChange={(e) =>
                            setNewCity({
                              ...newCity,
                              baseCostCommercial: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Industrial</Label>
                        <Input
                          type="number"
                          placeholder="2000"
                          value={newCity?.baseCostIndustrial || ""}
                          onChange={(e) =>
                            setNewCity({
                              ...newCity,
                              baseCostIndustrial: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Climate Zone</h4>
                    <Select
                      value={newCity?.climateZone || ""}
                      onValueChange={(value) =>
                        setNewCity({ ...newCity, climateZone: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select climate zone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hot-humid">Hot & Humid</SelectItem>
                        <SelectItem value="hot-dry">Hot & Dry</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="cold">Cold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setNewCity(null);
                        setSelectedStateForNewCity("");
                      }}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleCreateCity} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Create City
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
