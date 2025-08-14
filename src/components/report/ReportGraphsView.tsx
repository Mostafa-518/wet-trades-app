import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReportTableData } from '@/types/report';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ProjectComparisonChart } from './ProjectComparisonChart';

interface ReportGraphsViewProps {
  tableData: ReportTableData[];
  subcontracts?: any[];
  isLoading?: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

export function ReportGraphsView({ tableData, subcontracts = [], isLoading = false }: ReportGraphsViewProps) {
  // Prepare data for charts
  const chartData = tableData.map(item => ({
    name: item.item.length > 15 ? item.item.substring(0, 15) + '...' : item.item,
    fullName: item.item,
    totalAmount: item.totalAmount,
    averageRate: item.averageRate,
    wastage: item.wastage,
    quantity: item.totalQuantity
  }));

  const pieData = tableData.map(item => ({
    name: item.item.length > 20 ? item.item.substring(0, 20) + '...' : item.item,
    value: item.totalAmount
  }));

  if (tableData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No data available for charts. Please adjust your filters.
      </div>
    );
  }

  return (
    <div className="space-y-6" data-graphs-container>
      {/* Project Comparison Analysis Chart */}
      <ProjectComparisonChart 
        tableData={tableData} 
        subcontracts={subcontracts}
        isLoading={isLoading}
      />

      {/* Total Amount Bar Chart */}
      <Card className="print:shadow-none print:break-inside-avoid">
        <CardHeader>
          <CardTitle>Total Amount by Item</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'totalAmount' ? `$${Number(value).toLocaleString()}` : value,
                    'Total Amount'
                  ]}
                  labelFormatter={(label) => {
                    const item = chartData.find(d => d.name === label);
                    return item ? item.fullName : label;
                  }}
                />
                <Bar dataKey="totalAmount" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Average Rate Bar Chart */}
      <Card className="print:shadow-none print:break-inside-avoid">
        <CardHeader>
          <CardTitle>Average Rate by Item</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'averageRate' ? `$${Number(value).toFixed(2)}` : value,
                    'Average Rate'
                  ]}
                  labelFormatter={(label) => {
                    const item = chartData.find(d => d.name === label);
                    return item ? item.fullName : label;
                  }}
                />
                <Bar dataKey="averageRate" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Pie Chart for Total Amount Distribution */}
      <Card className="print:shadow-none print:break-inside-avoid">
        <CardHeader>
          <CardTitle>Total Amount Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Total Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Wastage Percentage Chart */}
      <Card className="print:shadow-none print:break-inside-avoid">
        <CardHeader>
          <CardTitle>Wastage Percentage by Item</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'wastage' ? `${Number(value)}%` : value,
                    'Wastage %'
                  ]}
                  labelFormatter={(label) => {
                    const item = chartData.find(d => d.name === label);
                    return item ? item.fullName : label;
                  }}
                />
                <Bar dataKey="wastage" fill="#ff7300" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
