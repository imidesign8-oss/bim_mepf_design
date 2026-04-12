import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, DollarSign } from "lucide-react";

const quoteSchema = z.object({
  clientName: z.string().min(2, "Name is required"),
  clientEmail: z.string().email("Valid email required"),
  clientPhone: z.string().min(10, "Valid phone number required"),
  clientCompany: z.string().min(2, "Company name required"),
  projectName: z.string().min(3, "Project name required"),
  projectType: z.enum(["residential", "commercial", "industrial", "hospitality", "mixed-use"]),
  buildingArea: z.coerce.number().min(100, "Building area must be at least 100 sq ft"),
  complexity: z.enum(["simple", "moderate", "complex"]),
  timeline: z.enum(["standard", "fast-track"]),
  numberOfFloors: z.coerce.number().min(1, "At least 1 floor required"),
  hasExistingModels: z.boolean(),
  coordinationRequired: z.boolean(),
  disciplines: z.array(z.string()).min(1, "Select at least one discipline"),
  additionalServices: z.array(z.string()),
});

type QuoteFormData = z.infer<typeof quoteSchema>;

export default function QuoteGenerator() {
  const { toast } = useToast();
  const [step, setStep] = useState<"form" | "review" | "success">("form");
  const [quoteAmount, setQuoteAmount] = useState(0);
  const [quoteCode, setQuoteCode] = useState("");

  const calculateQuoteMutation = trpc.clientPortal.calculateQuote.useQuery;
  const submitQuoteMutation = trpc.clientPortal.submitQuoteRequest.useMutation();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      disciplines: [],
      additionalServices: [],
      hasExistingModels: false,
      coordinationRequired: false,
    },
  });

  const formData = watch();

  // Calculate quote in real-time
  const { data: calculatedQuote } = trpc.clientPortal.calculateQuote.useQuery(
    {
      projectName: formData.projectName || "",
      projectType: formData.projectType || "commercial",
      buildingArea: formData.buildingArea || 0,
      complexity: formData.complexity || "moderate",
      timeline: formData.timeline || "standard",
      numberOfFloors: formData.numberOfFloors || 1,
      hasExistingModels: formData.hasExistingModels || false,
      coordinationRequired: formData.coordinationRequired || false,
      disciplines: formData.disciplines || [],
      additionalServices: formData.additionalServices || [],
    },
    {
      enabled: !!(formData.projectName && formData.buildingArea > 0 && formData.disciplines.length > 0),
    }
  );

  const onSubmit = async (data: any) => {
    if (!calculatedQuote) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await submitQuoteMutation.mutateAsync({
        ...data,
        quoteAmount: calculatedQuote.amount,
      });

      setQuoteCode(result.quoteCode);
      setQuoteAmount(calculatedQuote.amount);
      setStep("success");

      toast({
        title: "Success",
        description: "Quote submitted successfully! Check your email for the proposal.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit quote",
        variant: "destructive",
      });
    }
  };

  if (step === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Quote Submitted Successfully!</h1>
            <p className="text-gray-600 mb-6">
              We've sent your personalized proposal to <strong>{formData.clientEmail}</strong>
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <p className="text-sm text-gray-600 mb-2">Your Quote Code:</p>
              <p className="text-2xl font-bold text-blue-600">{quoteCode}</p>
              <p className="text-sm text-gray-600 mt-2">Keep this for your records</p>
            </div>

            <div className="bg-slate-50 rounded-lg p-6 mb-6">
              <p className="text-sm text-gray-600 mb-2">Estimated Project Cost:</p>
              <p className="text-4xl font-bold text-red-600">₹{quoteAmount.toLocaleString()}</p>
            </div>

            <p className="text-gray-600 mb-6">
              Our team will review your requirements and may contact you within 24 hours for any clarifications.
            </p>

            <Button onClick={() => window.location.href = "/"} size="lg">
              Back to Home
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Get Your Project Quote</h1>
          <p className="text-gray-600">
            Answer a few questions about your project and get an instant quote
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="p-8 mb-6">
            {/* Client Information */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6">Your Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="clientName">Full Name *</Label>
                  <Input
                    id="clientName"
                    placeholder="John Doe"
                    {...register("clientName")}
                    className={errors.clientName ? "border-red-500" : ""}
                  />
                  {errors.clientName && (
                    <p className="text-red-500 text-sm mt-1">{errors.clientName.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="clientEmail">Email Address *</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    placeholder="john@example.com"
                    {...register("clientEmail")}
                    className={errors.clientEmail ? "border-red-500" : ""}
                  />
                  {errors.clientEmail && (
                    <p className="text-red-500 text-sm mt-1">{errors.clientEmail.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="clientPhone">Phone Number *</Label>
                  <Input
                    id="clientPhone"
                    placeholder="+91 9876543210"
                    {...register("clientPhone")}
                    className={errors.clientPhone ? "border-red-500" : ""}
                  />
                  {errors.clientPhone && (
                    <p className="text-red-500 text-sm mt-1">{errors.clientPhone.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="clientCompany">Company Name *</Label>
                  <Input
                    id="clientCompany"
                    placeholder="Your Company"
                    {...register("clientCompany")}
                    className={errors.clientCompany ? "border-red-500" : ""}
                  />
                  {errors.clientCompany && (
                    <p className="text-red-500 text-sm mt-1">{errors.clientCompany.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Project Information */}
            <div className="mb-8 border-t pt-8">
              <h2 className="text-2xl font-bold mb-6">Project Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="projectName">Project Name *</Label>
                  <Input
                    id="projectName"
                    placeholder="e.g., Commercial Complex Tower A"
                    {...register("projectName")}
                    className={errors.projectName ? "border-red-500" : ""}
                  />
                  {errors.projectName && (
                    <p className="text-red-500 text-sm mt-1">{errors.projectName.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="projectType">Project Type *</Label>
                  <Select
                    value={formData.projectType}
                    onValueChange={(value: any) => setValue("projectType" as any, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select project type" />
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

                <div>
                  <Label htmlFor="buildingArea">Building Area (sq ft) *</Label>
                  <Input
                    id="buildingArea"
                    type="number"
                    placeholder="50000"
                    {...register("buildingArea")}
                    className={errors.buildingArea ? "border-red-500" : ""}
                  />
                  {errors.buildingArea && (
                    <p className="text-red-500 text-sm mt-1">{errors.buildingArea.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="numberOfFloors">Number of Floors *</Label>
                  <Input
                    id="numberOfFloors"
                    type="number"
                    placeholder="5"
                    {...register("numberOfFloors")}
                    className={errors.numberOfFloors ? "border-red-500" : ""}
                  />
                  {errors.numberOfFloors && (
                    <p className="text-red-500 text-sm mt-1">{errors.numberOfFloors.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Project Complexity */}
            <div className="mb-8 border-t pt-8">
              <h2 className="text-2xl font-bold mb-6">Project Scope</h2>

              <div className="mb-6">
                <Label className="mb-3 block">Project Complexity *</Label>
                <RadioGroup value={formData.complexity} onValueChange={(value: any) => setValue("complexity" as any, value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="simple" id="simple" />
                    <Label htmlFor="simple" className="font-normal cursor-pointer">
                      Simple (Standard design, minimal coordination)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="moderate" id="moderate" />
                    <Label htmlFor="moderate" className="font-normal cursor-pointer">
                      Moderate (Complex design, standard coordination)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="complex" id="complex" />
                    <Label htmlFor="complex" className="font-normal cursor-pointer">
                      Complex (Very complex design, extensive coordination)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="mb-6">
                <Label className="mb-3 block">Timeline *</Label>
                <RadioGroup value={formData.timeline} onValueChange={(value: any) => setValue("timeline" as any, value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="standard" id="standard" />
                    <Label htmlFor="standard" className="font-normal cursor-pointer">
                      Standard (Normal timeline)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fast-track" id="fast-track" />
                    <Label htmlFor="fast-track" className="font-normal cursor-pointer">
                      Fast-Track (Expedited delivery - 30% premium)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="mb-6">
                <Label className="mb-3 block">Services Required *</Label>
                <div className="space-y-2">
                  {["BIM Modeling", "MEP Design", "Coordination", "Quantities"].map((service) => (
                    <div key={service} className="flex items-center space-x-2">
                      <Checkbox
                        id={service}
                        checked={formData.disciplines.includes(service)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setValue("disciplines" as any, [...formData.disciplines, service]);
                          } else {
                            setValue(
                              "disciplines" as any,
                              formData.disciplines.filter((d) => d !== service)
                            );
                          }
                        }}
                      />
                      <Label htmlFor={service} className="font-normal cursor-pointer">
                        {service}
                      </Label>
                    </div>
                  ))}
                </div>
                {errors.disciplines && (
                  <p className="text-red-500 text-sm mt-1">{errors.disciplines.message}</p>
                )}
              </div>

              <div className="mb-6">
                <Label className="mb-3 block">Additional Services</Label>
                <div className="space-y-2">
                  {["3D Visualization", "Clash Detection", "Energy Analysis", "Code Compliance Review"].map(
                    (service) => (
                      <div key={service} className="flex items-center space-x-2">
                        <Checkbox
                          id={`add-${service}`}
                          checked={formData.additionalServices.includes(service)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setValue("additionalServices" as any, [...formData.additionalServices, service]);
                            } else {
                              setValue(
                                "additionalServices" as any,
                                formData.additionalServices.filter((s) => s !== service)
                              );
                            }
                          }}
                        />
                        <Label htmlFor={`add-${service}`} className="font-normal cursor-pointer">
                          {service}
                        </Label>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasExistingModels"
                    checked={formData.hasExistingModels}
                    onCheckedChange={(checked) => setValue("hasExistingModels" as any, !!checked)}
                  />
                  <Label htmlFor="hasExistingModels" className="font-normal cursor-pointer">
                    We have existing BIM models (may reduce scope)
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="coordinationRequired"
                    checked={formData.coordinationRequired}
                    onCheckedChange={(checked) => setValue("coordinationRequired" as any, !!checked)}
                  />
                  <Label htmlFor="coordinationRequired" className="font-normal cursor-pointer">
                    Multi-discipline coordination required
                  </Label>
                </div>
              </div>
            </div>

            {/* Quote Preview */}
            {calculatedQuote && (
              <div className="border-t pt-8 mb-8">
                <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-6 border border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 mb-2">Estimated Project Cost</p>
                      <p className="text-4xl font-bold text-red-600">
                        ₹{calculatedQuote.amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600 mt-2">Valid for 30 days</p>
                    </div>
                    <DollarSign className="w-16 h-16 text-red-200" />
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting || !calculatedQuote}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Get Quote & Proposal"
                )}
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </div>
  );
}
