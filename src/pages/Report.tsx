
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Printer, Download } from "lucide-react";
import { useReportData } from "@/hooks/useReportData";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ReportTableView } from "@/components/report/ReportTableView";
import { ReportGraphsView } from "@/components/report/ReportGraphsView";
import { useToast } from "@/hooks/use-toast";
import { FormResetButton } from "@/components/FormResetButton";
import {
  exportTableToExcel,
  exportGraphsToPDF,
} from "@/utils/report/reportExporter";
import { useEffect } from "react";
import { PageErrorBoundary } from "@/components/PageErrorBoundary";

function ReportContent() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    reportData,
    filterOptions,
    updateFilter,
    resetFilters,
    isLoading,
    filteredSubcontracts,
  } = useReportData();

  // Add debugging to track when component mounts and data loads
  useEffect(() => {
    console.log('Report component mounted');
    console.log('Report data:', reportData);
    console.log('Is loading:', isLoading);
    console.log('Filter options:', filterOptions);
  }, [reportData, isLoading, filterOptions]);

  // Add error boundary-like error handling
  if (!reportData && !isLoading) {
    console.error('Report data is null and not loading');
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">Error loading report data</p>
          <Button onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading report data...</span>
      </div>
    );
  }

  // Ensure reportData exists before proceeding
  if (!reportData) {
    console.warn('Report data is still null after loading');
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-lg mb-4">No report data available</p>
          <Button onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </div>
      </div>
    );
  }

  const isPresentDataByProject =
    reportData.filters.presentData === "by-project";

  const handleFacilityToggle = (facility: string) => {
    if (facility === "All") {
      updateFilter("facilities", []);
      return;
    }

    const currentFacilities = reportData.filters.facilities;
    const newFacilities = currentFacilities.includes(facility)
      ? currentFacilities.filter((f) => f !== facility)
      : [...currentFacilities, facility];

    updateFilter("facilities", newFacilities);
  };

  const removeFacility = (facility: string) => {
    const newFacilities = reportData.filters.facilities.filter(
      (f) => f !== facility
    );
    updateFilter("facilities", newFacilities);
  };

  const handleNavigateToFilteredSubcontracts = () => {
    // Create URL parameters from current filters
    const params = new URLSearchParams();

    if (
      reportData.filters.month !== "all" &&
      reportData.filters.month !== "All"
    ) {
      params.set("month", reportData.filters.month);
    }
    if (
      reportData.filters.year !== "all" &&
      reportData.filters.year !== "All"
    ) {
      params.set("year", reportData.filters.year);
    }
    if (
      reportData.filters.location !== "all" &&
      reportData.filters.location !== "All"
    ) {
      params.set("location", reportData.filters.location);
    }
    if (
      reportData.filters.trades !== "all" &&
      reportData.filters.trades !== "All"
    ) {
      params.set("trades", reportData.filters.trades);
    }
    if (
      reportData.filters.projectName !== "all" &&
      reportData.filters.projectName !== "All"
    ) {
      params.set("projectName", reportData.filters.projectName);
    }
    if (
      reportData.filters.projectCode !== "all" &&
      reportData.filters.projectCode !== "All"
    ) {
      params.set("projectCode", reportData.filters.projectCode);
    }
    if (reportData.filters.facilities.length > 0) {
      // Encode facilities as JSON to handle special characters and arrays properly
      params.set("facilities", JSON.stringify(reportData.filters.facilities));
    }

    // Navigate to the new filtered subcontracts page
    const queryString = params.toString();
    navigate(`/subcontracts${queryString ? `?${queryString}` : ""}`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportTable = async () => {
    const result = exportTableToExcel(reportData.tableData, reportData.filters);

    if (result.success) {
      toast({
        title: "Export Successful",
        description: `Table data exported as ${result.filename}`,
      });
    } else {
      toast({
        title: "Export Failed",
        description: result.error || "Failed to export table data",
        variant: "destructive",
      });
    }
  };

  const handleExportTableToPDF = async () => {
    const result = await exportGraphsToPDF(reportData.filters);

    if (result.success) {
      toast({
        title: "Export Successful",
        description: "Table exported to PDF (print dialog opened)",
      });
    } else {
      toast({
        title: "Export Failed",
        description: result.error || "Failed to export table",
        variant: "destructive",
      });
    }
  };

  const handleExportGraphs = async () => {
    const result = await exportGraphsToPDF(reportData.filters);

    if (result.success) {
      toast({
        title: "Export Successful",
        description: "Graphs exported to PDF (print dialog opened)",
      });
    } else {
      toast({
        title: "Export Failed",
        description: result.error || "Failed to export graphs",
        variant: "destructive",
      });
    }
  };

  // Check if any filters are applied (not default values)
  const hasAppliedFilters = Object.entries(reportData.filters).some(([key, value]) => {
    if (key === 'facilities') {
      return Array.isArray(value) && value.length > 0;
    }
    return value !== 'all' && value !== 'by-project' && value !== 'name';
  });

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Header Section */}
      <div className="flex items-center justify-between print:justify-center">
        <h1 className="text-3xl font-bold tracking-tight print:text-2xl">
          Report
        </h1>
        <div className="flex gap-2 print:hidden">
          <FormResetButton 
            onReset={resetFilters}
            hasData={hasAppliedFilters}
            variant="outline"
            size="sm"
          >
            Reset All Filters
          </FormResetButton>
          <Button onClick={handlePrint} variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Print/PDF
          </Button>
        </div>
      </div>

      {/* Filter Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:grid-cols-3 print:gap-2">
        {/* Present Data Card */}
        <Card className="print:shadow-none">
          <CardHeader className="pb-3 print:pb-2">
            <CardTitle className="text-sm font-medium">Present Data:</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-gray-50">
                {reportData.filters.presentData}
              </Badge>
              <Select
                value={reportData.filters.presentData}
                onValueChange={(value) => updateFilter("presentData", value)}
              >
                <SelectTrigger className="w-auto h-8 p-0 border-0 print:hidden">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.presentDataOptions.map((option) => (
                    <SelectItem
                      key={option}
                      value={option.toLowerCase().replace(" ", "-")}
                    >
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Empty Card for spacing */}
        <Card className="opacity-0 print:hidden">
          <CardContent className="h-20"></CardContent>
        </Card>

        {/* Total Subcontracts Card */}
        <Card className="print:shadow-none">
          <CardHeader className="pb-3 print:pb-2">
            <CardTitle className="text-sm font-medium">
              No. Of All Subcontract:
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-center print:text-lg">
              [{reportData.totalSubcontracts}] Subcontract
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Section */}
      <Card className="print:shadow-none print:break-inside-avoid">
        <CardContent className="pt-6 print:pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2">
            <div className="space-y-2 print:space-y-1">
              <label className="text-sm font-medium">Month:</label>
              <Select
                value={reportData.filters.month}
                onValueChange={(value) => updateFilter("month", value)}
              >
                <SelectTrigger className="print:border-none print:shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.months.map((month) => (
                    <SelectItem key={month} value={month.toLowerCase()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 print:space-y-1">
              <label className="text-sm font-medium">Year:</label>
              <Select
                value={reportData.filters.year}
                onValueChange={(value) => updateFilter("year", value)}
              >
                <SelectTrigger className="print:border-none print:shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Conditional filters based on Present Data selection */}
            {!isPresentDataByProject && (
              <div className="space-y-2 print:space-y-1">
                <label className="text-sm font-medium">Location of work:</label>
                <Select
                  value={reportData.filters.location}
                  onValueChange={(value) => updateFilter("location", value)}
                >
                  <SelectTrigger className="print:border-none print:shadow-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {filterOptions.locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {isPresentDataByProject && (
              <div className="space-y-2 print:space-y-1">
                <label className="text-sm font-medium">
                  {reportData.filters.projectFilterType === "name"
                    ? "Project Name:"
                    : "Project Code:"}
                </label>
                <div className="flex gap-2">
                  <Select
                    value={
                      reportData.filters.projectFilterType === "name"
                        ? reportData.filters.projectName
                        : reportData.filters.projectCode
                    }
                    onValueChange={(value) =>
                      updateFilter(
                        reportData.filters.projectFilterType === "name"
                          ? "projectName"
                          : "projectCode",
                        value
                      )
                    }
                  >
                    <SelectTrigger className="flex-1 print:border-none print:shadow-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(reportData.filters.projectFilterType === "name"
                        ? filterOptions.projectNames
                        : filterOptions.projectCodes
                      ).map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={reportData.filters.projectFilterType}
                    onValueChange={(value) =>
                      updateFilter("projectFilterType", value)
                    }
                  >
                    <SelectTrigger className="w-20 print:hidden">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="code">Code</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="space-y-2 print:space-y-1">
              <label className="text-sm font-medium">Trades:</label>
              <Select
                value={reportData.filters.trades}
                onValueChange={(value) => updateFilter("trades", value)}
              >
                <SelectTrigger className="print:border-none print:shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.trades.map((trade) => (
                    <SelectItem key={trade} value={trade}>
                      {trade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Facilities Filter */}
            <div className="space-y-2 print:space-y-1">
              <label className="text-sm font-medium">
                Facilities (Responsibilities):
              </label>
              <Select onValueChange={handleFacilityToggle}>
                <SelectTrigger className="print:border-none print:shadow-none">
                  <SelectValue placeholder="Select facilities..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">Clear All</SelectItem>
                  {filterOptions.facilities
                    .filter((f) => f !== "All")
                    .map((facility) => (
                      <SelectItem key={facility} value={facility}>
                        {facility}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              {/* Show selected facilities */}
              {reportData.filters.facilities.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2 print:gap-0.5">
                  {reportData.filters.facilities.map((facility) => (
                    <Badge
                      key={facility}
                      variant="secondary"
                      className="flex items-center gap-1 print:text-xs"
                    >
                      {facility}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 w-4 h-4 print:hidden"
                        onClick={() => removeFacility(facility)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Subcontracts Card */}
      <div className="flex justify-center print:break-inside-avoid">
        <Card
          className="w-auto cursor-pointer hover:shadow-lg transition-shadow print:shadow-none print:cursor-default"
          onClick={handleNavigateToFilteredSubcontracts}
        >
          <CardContent className="pt-6 print:pt-4">
            <div className="text-center">
              <div className="text-lg font-semibold print:text-base">
                No. Of Subcontract: [{reportData.currentSubcontracts}]
                Subcontract
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="table" className="w-full print:hidden">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="table">Table View</TabsTrigger>
          <TabsTrigger value="graphs">Graphs View</TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="mt-6">
          <div className="space-y-4">
            <div className="flex justify-end gap-2">
              <Button
                onClick={handleExportTable}
                variant="outline"
                size="sm"
                disabled={isLoading || reportData.tableData.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Table to Excel
              </Button>
              <Button
                onClick={handleExportTableToPDF}
                variant="outline"
                size="sm"
                disabled={isLoading || reportData.tableData.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Table to PDF
              </Button>
            </div>
            <ReportTableView tableData={reportData.tableData} />
          </div>
        </TabsContent>

        <TabsContent value="graphs" className="mt-6">
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button
                onClick={handleExportGraphs}
                variant="outline"
                size="sm"
                disabled={isLoading || reportData.tableData.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Graphs to PDF
              </Button>
            </div>
            <ReportGraphsView
              tableData={reportData.tableData}
              subcontracts={filteredSubcontracts}
              isLoading={isLoading}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Print-only table view */}
      <div className="hidden print:block">
        <ReportTableView tableData={reportData.tableData} />
      </div>
    </div>
  );
}

export function Report() {
  return (
    <PageErrorBoundary pageName="Report">
      <ReportContent />
    </PageErrorBoundary>
  );
}
