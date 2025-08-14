
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReportTableData } from '@/types/report';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useState, useMemo } from 'react';
import { Loader2 } from 'lucide-react';

interface ProjectComparisonChartProps {
  tableData: ReportTableData[];
  subcontracts: any[];
  isLoading?: boolean;
}

interface ProjectTradeData {
  projectName: string;
  projectCode: string;
  averageRate: number;
  totalAmount: number;
  wastage: number;
  quantity: number;
}

export function ProjectComparisonChart({ tableData, subcontracts, isLoading }: ProjectComparisonChartProps) {
  const [selectedTradeItem, setSelectedTradeItem] = useState<string>('');

  // Get unique trade items from the data
  const tradeItems = useMemo(() => {
    const items = new Set<string>();
    tableData.forEach(item => items.add(item.item));
    return Array.from(items).sort();
  }, [tableData]);

  // Prepare project comparison data for the selected trade item
  const projectComparisonData = useMemo((): ProjectTradeData[] => {
    if (!selectedTradeItem || !subcontracts.length) return [];

    const projectMap = new Map<string, {
      projectName: string;
      projectCode: string;
      totalAmount: number;
      totalQuantity: number;
      totalWastage: number;
      count: number;
    }>();

    // Process subcontracts to get project-specific data for the selected trade item
    subcontracts.forEach(subcontract => {
      if (!subcontract.projects || !subcontract.subcontract_trade_items) return;

      const project = subcontract.projects;
      const projectKey = `${project.name}-${project.code}`;

      // Find trade items matching the selected item
      const relevantTradeItems = subcontract.subcontract_trade_items.filter(
        (item: any) => item.trade_items?.name === selectedTradeItem
      );

      if (relevantTradeItems.length === 0) return;

      relevantTradeItems.forEach((tradeItem: any) => {
        const existing = projectMap.get(projectKey);
        if (existing) {
          existing.totalAmount += tradeItem.total_price || 0;
          existing.totalQuantity += tradeItem.quantity || 0;
          existing.totalWastage += tradeItem.wastage_percentage || 0;
          existing.count += 1;
        } else {
          projectMap.set(projectKey, {
            projectName: project.name,
            projectCode: project.code,
            totalAmount: tradeItem.total_price || 0,
            totalQuantity: tradeItem.quantity || 0,
            totalWastage: tradeItem.wastage_percentage || 0,
            count: 1
          });
        }
      });
    });

    // Convert to chart data format
    return Array.from(projectMap.values()).map(project => ({
      projectName: project.projectName.length > 20 ? 
        project.projectName.substring(0, 20) + '...' : 
        project.projectName,
      projectCode: project.projectCode,
      averageRate: project.totalQuantity > 0 ? project.totalAmount / project.totalQuantity : 0,
      totalAmount: project.totalAmount,
      wastage: project.count > 0 ? project.totalWastage / project.count : 0,
      quantity: project.totalQuantity
    })).filter(project => project.averageRate > 0);
  }, [selectedTradeItem, subcontracts]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{`${data.projectName} (${data.projectCode})`}</p>
          <p className="text-blue-600">{`Trade Item: ${selectedTradeItem}`}</p>
          <p className="text-green-600">{`Average Rate: EGP ${data.averageRate.toFixed(2)}`}</p>
          <p className="text-orange-600">{`Total Amount: EGP ${data.totalAmount.toLocaleString()}`}</p>
          <p className="text-red-600">{`Wastage: ${data.wastage.toFixed(1)}%`}</p>
          <p className="text-gray-600">{`Quantity: ${data.quantity.toLocaleString()}`}</p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card className="print:shadow-none">
        <CardHeader>
          <CardTitle>Project Comparison Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-80">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading project data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="print:shadow-none">
      <CardHeader>
        <CardTitle>Project Comparison Analysis</CardTitle>
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Trade Item to Analyze:</label>
          <Select value={selectedTradeItem} onValueChange={setSelectedTradeItem}>
            <SelectTrigger className="w-full md:w-80">
              <SelectValue placeholder="Choose a trade item..." />
            </SelectTrigger>
            <SelectContent>
              {tradeItems.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {!selectedTradeItem ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg font-medium">Select a trade item to view project comparison</p>
            <p className="text-sm mt-2">Choose from the dropdown above to analyze rates across projects</p>
          </div>
        ) : projectComparisonData.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg font-medium">No project data available</p>
            <p className="text-sm mt-2">The selected trade item "{selectedTradeItem}" has no data across projects</p>
          </div>
        ) : (
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={projectComparisonData} 
                margin={{ top: 60, right: 30, left: 20, bottom: 100 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="projectName"
                  angle={-45}
                  textAnchor="end"
                  height={120}
                  fontSize={12}
                  interval={0}
                />
                <YAxis 
                  label={{ value: 'Average Rate (EGP)', angle: -90, position: 'outsideLeft', dx: -30, 
    style: { textAnchor: 'middle' }, }}
                  fontSize={12} interval={0}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="averageRate" 
                  fill="#3b82f6" 
                  name="Average Rate (EGP)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        
        {selectedTradeItem && projectComparisonData.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">Analysis Summary for "{selectedTradeItem}"</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Projects Analyzed:</span> {projectComparisonData.length}
              </div>
              <div>
                <span className="font-medium">Highest Rate:</span> EGP 
                {Math.max(...projectComparisonData.map(p => p.averageRate)).toFixed(2)}
              </div>
              <div>
                <span className="font-medium">Lowest Rate:</span> EGP 
                {Math.min(...projectComparisonData.map(p => p.averageRate)).toFixed(2)}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
