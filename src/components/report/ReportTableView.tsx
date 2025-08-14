import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReportTableData } from "@/types/report";

interface ReportTableViewProps {
  tableData: ReportTableData[];
}

export function ReportTableView({ tableData }: ReportTableViewProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      // style: "currency",
      // currency: "EGP",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (tableData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No data available for the table. Please adjust your filters.
      </div>
    );
  }

  return (
    <div data-graphs-container>
      <Card className="print:shadow-none">
        <CardHeader>
          <CardTitle>Report Data Table</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-center">
                  Average Rate<div className="text-center">EGP</div>
                </TableHead>
                <TableHead className="text-center">
                  Total Amount<div className="text-center">EGP</div>
                </TableHead>
                <TableHead className="text-center">Total Quantity</TableHead>
                <TableHead className="text-center">Wastage %</TableHead>
                <TableHead>Unit</TableHead>
                {/* <TableHead className="text-right">Count</TableHead> */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{row.item}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(row.averageRate)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(row.totalAmount)}
                  </TableCell>
                  <TableCell className="text-right">
                    {row.totalQuantity.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">{row.wastage}%</TableCell>
                  <TableCell>{row.unit}</TableCell>
                  {/* <TableCell className="text-right">{row.count}</TableCell> */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
