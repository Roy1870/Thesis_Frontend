"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { FileDown, Filter, RefreshCw } from "lucide-react";
import { exportDataToExcel } from "./excel-export";

export default function ExportTemplates({
  data,
  dataType,
  barangayOptions,
  monthOptions,
  yearOptions,
}) {
  const [selectedTemplate, setSelectedTemplate] = useState("rice-planting");
  const [barangayFilter, setBarangayFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState(
    new Date().getFullYear().toString()
  );
  const [season, setSeason] = useState("Wet");
  const [isExporting, setIsExporting] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [includeSignatures, setIncludeSignatures] = useState(true);
  const [customSignatures, setCustomSignatures] = useState({
    preparedBy: "YN KRYZL M. MONTANA",
    preparedByTitle: "AT",
    reviewedBy: "JOAN B. DELA TORRE",
    reviewedByTitle: "Rice Program Coordinator",
    notedBy: "PIERRE ANTHONY D. JOVEN",
    notedByTitle: "City Agriculturist",
  });

  // Filter data based on selected filters
  const filteredData = data.filter((item) => {
    let match = true;

    if (barangayFilter && item.barangay !== barangayFilter) {
      match = false;
    }

    if (monthFilter || yearFilter) {
      const date = new Date(item.created_at || item.date || new Date());
      const itemMonth = (date.getMonth() + 1).toString();
      const itemYear = date.getFullYear().toString();

      if (monthFilter && itemMonth !== monthFilter) {
        match = false;
      }

      if (yearFilter && itemYear !== yearFilter) {
        match = false;
      }
    }

    return match;
  });

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportDataToExcel(
        selectedTemplate,
        filteredData,
        {
          barangay: barangayFilter,
          month: monthFilter,
          year: yearFilter,
          season,
          includeSignatures,
          signatures: customSignatures,
        },
        monthOptions,
        showToast
      );
    } catch (error) {
      console.error("Export failed:", error);
      showToast("Export failed: " + error.message, "error");
    } finally {
      setIsExporting(false);
    }
  };

  const showToast = (message, type = "info") => {
    // In a real app, you'd use a toast library
    alert(message);
  };

  const getTemplateOptions = () => {
    switch (dataType) {
      case "rice":
        return [
          { id: "rice-planting", label: "Rice Planting Accomplishment Report" },
          {
            id: "rice-harvesting-irrigated",
            label: "Rice Harvesting Report (Irrigated)",
          },
          {
            id: "rice-harvesting-rainfed",
            label: "Rice Harvesting Report (Rainfed)",
          },
        ];
      case "crops":
        return [
          { id: "vegetable-profile", label: "Vegetable Profile" },
          { id: "legumes-profile", label: "Legumes Profile" },
          { id: "spices-profile", label: "Spices Profile" },
        ];
      case "highValueCrops":
        return [
          { id: "cacao-profile", label: "Cacao Profile" },
          { id: "banana-profile", label: "Banana Profile" },
          { id: "coffee-profile", label: "Coffee Profile" },
        ];
      case "livestock":
        return [{ id: "livestock-inventory", label: "Livestock Inventory" }];
      case "operators":
        return [{ id: "fishpond-areas", label: "Freshwater Fishpond Areas" }];
      default:
        return [{ id: "generic", label: "Generic Export" }];
    }
  };

  const templateOptions = getTemplateOptions();

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-[#5A8C79]">Export {dataType} Data</CardTitle>
        <CardDescription>
          Generate reports based on official templates from the City Agriculture
          and Veterinary Department
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue={templateOptions[0].id}
          onValueChange={setSelectedTemplate}
        >
          <TabsList className="grid grid-cols-1 mb-4 sm:grid-cols-2 md:grid-cols-3">
            {templateOptions.map((template) => (
              <TabsTrigger key={template.id} value={template.id}>
                {template.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {templateOptions.map((template) => (
            <TabsContent
              key={template.id}
              value={template.id}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="barangay">Barangay</Label>
                  <Select
                    value={barangayFilter}
                    onValueChange={setBarangayFilter}
                  >
                    <SelectTrigger id="barangay">
                      <SelectValue placeholder="All Barangays" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Barangays</SelectItem>
                      {barangayOptions.map((barangay) => (
                        <SelectItem key={barangay} value={barangay}>
                          {barangay}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="month">Month</Label>
                  <Select value={monthFilter} onValueChange={setMonthFilter}>
                    <SelectTrigger id="month">
                      <SelectValue placeholder="Select Month" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Months</SelectItem>
                      {monthOptions.map((month) => (
                        <SelectItem key={month.value} value={month.value}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="year">Year</Label>
                  <Select value={yearFilter} onValueChange={setYearFilter}>
                    <SelectTrigger id="year">
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Years</SelectItem>
                      {yearOptions.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {(selectedTemplate === "rice-planting" ||
                  selectedTemplate === "rice-harvesting-irrigated" ||
                  selectedTemplate === "rice-harvesting-rainfed") && (
                  <div>
                    <Label htmlFor="season">Season</Label>
                    <Select value={season} onValueChange={setSeason}>
                      <SelectTrigger id="season">
                        <SelectValue placeholder="Select Season" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Wet">Wet Season</SelectItem>
                        <SelectItem value="Dry">Dry Season</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  className="text-xs"
                >
                  <Filter className="h-3.5 w-3.5 mr-1" />
                  {showAdvancedOptions ? "Hide" : "Show"} Advanced Options
                </Button>

                <div className="text-xs text-muted-foreground">
                  {filteredData.length} records match your filters
                </div>
              </div>

              {showAdvancedOptions && (
                <div className="p-4 mt-2 space-y-4 border rounded-md">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="include-signatures"
                      checked={includeSignatures}
                      onCheckedChange={setIncludeSignatures}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label
                        htmlFor="include-signatures"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Include Signatures
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Add signature lines to the exported document
                      </p>
                    </div>
                  </div>

                  {includeSignatures && (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="prepared-by" className="text-xs">
                          Prepared by
                        </Label>
                        <Input
                          id="prepared-by"
                          value={customSignatures.preparedBy}
                          onChange={(e) =>
                            setCustomSignatures({
                              ...customSignatures,
                              preparedBy: e.target.value,
                            })
                          }
                          className="h-8 text-xs"
                        />
                        <Input
                          id="prepared-by-title"
                          value={customSignatures.preparedByTitle}
                          onChange={(e) =>
                            setCustomSignatures({
                              ...customSignatures,
                              preparedByTitle: e.target.value,
                            })
                          }
                          className="h-8 text-xs"
                          placeholder="Title"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reviewed-by" className="text-xs">
                          Reviewed by
                        </Label>
                        <Input
                          id="reviewed-by"
                          value={customSignatures.reviewedBy}
                          onChange={(e) =>
                            setCustomSignatures({
                              ...customSignatures,
                              reviewedBy: e.target.value,
                            })
                          }
                          className="h-8 text-xs"
                        />
                        <Input
                          id="reviewed-by-title"
                          value={customSignatures.reviewedByTitle}
                          onChange={(e) =>
                            setCustomSignatures({
                              ...customSignatures,
                              reviewedByTitle: e.target.value,
                            })
                          }
                          className="h-8 text-xs"
                          placeholder="Title"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="noted-by" className="text-xs">
                          Noted by
                        </Label>
                        <Input
                          id="noted-by"
                          value={customSignatures.notedBy}
                          onChange={(e) =>
                            setCustomSignatures({
                              ...customSignatures,
                              notedBy: e.target.value,
                            })
                          }
                          className="h-8 text-xs"
                        />
                        <Input
                          id="noted-by-title"
                          value={customSignatures.notedByTitle}
                          onChange={(e) =>
                            setCustomSignatures({
                              ...customSignatures,
                              notedByTitle: e.target.value,
                            })
                          }
                          className="h-8 text-xs"
                          placeholder="Title"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="p-4 rounded-md bg-muted/50">
                <h4 className="mb-2 font-medium">Template Preview</h4>
                <p className="mb-2 text-sm text-muted-foreground">
                  {getTemplateDescription(selectedTemplate)}
                </p>
                <div className="flex items-center justify-center border rounded-md aspect-video bg-card">
                  <img
                    src={`/templates/${selectedTemplate}-preview.png`}
                    alt={`${selectedTemplate} template preview`}
                    className="object-contain max-w-full max-h-full opacity-50"
                  />
                  <div className="absolute text-sm text-muted-foreground">
                    Preview image not available
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <Button
          onClick={handleExport}
          disabled={isExporting}
          className="bg-[#5A8C79] hover:bg-[#4A7C69]"
        >
          {isExporting ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <FileDown className="w-4 h-4 mr-2" />
              Export to Excel
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

function getTemplateDescription(templateId) {
  const descriptions = {
    "rice-planting":
      "Rice Program Planting Accomplishment Report with fields for farmer details, target areas, and planting data by seed type.",
    "rice-harvesting-irrigated":
      "Rice Program Harvesting Accomplishment Report for irrigated areas with production data by seed type.",
    "rice-harvesting-rainfed":
      "Rice Program Harvesting Accomplishment Report for rainfed areas with production data by seed type.",
    "vegetable-profile":
      "Vegetable Profile with fields for growers' information and production records for various vegetables.",
    "legumes-profile":
      "Legumes Profile with fields for growers' information and production records for peanut, mungbean, and soybean.",
    "spices-profile":
      "Spices Profile with fields for growers' information and production records for ginger, onion, hot pepper, etc.",
    "cacao-profile":
      "Cacao Profile with fields for growers' information and monthly production records.",
    "banana-profile":
      "Banana Profile with fields for growers' information and production records by variety (Lakatan, Latundan, Cardava).",
    "coffee-profile":
      "Coffee Profile with fields for growers' information and monthly production records.",
    "livestock-inventory":
      "Livestock Inventory with fields for various animal types and their subcategories.",
    "fishpond-areas":
      "Freshwater Fishpond Areas with fields for operator information, location, species, and production data.",
    generic: "Generic export of all data fields in a tabular format.",
  };

  return descriptions[templateId] || "Export data to Excel format.";
}
