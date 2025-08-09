import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { TradeItem } from "@/types/subcontract";

interface SubcontractTradeItemsTableProps {
  tradeItems: TradeItem[];
  totalValue: number;
}

export function SubcontractTradeItemsTable({
  tradeItems,
  totalValue,
}: SubcontractTradeItemsTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EGP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="bg-gray-50">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          Trade Items ({tradeItems.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {tradeItems.length > 0 ? (
          <div className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Trade</TableHead>
                  <TableHead className="font-semibold">Item</TableHead>
                  <TableHead className="font-semibold">Unit</TableHead>
                  <TableHead className="text-right font-semibold">
                    Qty
                  </TableHead>
                  <TableHead className="text-right font-semibold">
                    Unit Price
                  </TableHead>
                  {/* <TableHead className="text-right font-semibold">
                    Total Amount
                  </TableHead> */}
                  <TableHead className="text-right font-semibold">
                    Wastage %
                  </TableHead>
                  {/* <TableHead className="text-right font-semibold">Wastage Amount</TableHead> */}
                  <TableHead className="text-right font-semibold">
                    Total Amount
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tradeItems.map((item, index) => {
                  const baseAmount = item.quantity * item.unitPrice;
                  const wastagePercentage = item.wastagePercentage || 0;
                  const wastageAmount = baseAmount * (wastagePercentage / 100);

                  return (
                    <TableRow
                      key={item.id}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <TableCell className="font-medium text-gray-900">
                        <Badge variant="outline" className="text-xs text-center">
                          {item.trade}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{item.item}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {item.unit}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatNumber(item.quantity)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.unitPrice)}
                      </TableCell>
                      {/* <TableCell className="text-right">
                        {formatCurrency(baseAmount)}
                      </TableCell> */}
                      <TableCell className="text-right">
                        {wastagePercentage > 0 ? (
                          <Badge
                            variant="outline"
                            className="text-orange-600 border-orange-200 bg-orange-50"
                          >
                            {wastagePercentage}%
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">0%</span>
                        )}
                      </TableCell>
                      {/* <TableCell className="text-right">
                        {wastageAmount > 0 ? (
                          <span className="text-orange-600 font-medium">{formatCurrency(wastageAmount)}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell> */}
                      <TableCell className="text-right font-bold text-green-600">
                        {formatCurrency(item.total)}
                      </TableCell>
                    </TableRow>
                  );
                })}
                <TableRow className="border-t-2 bg-green-50">
                  <TableCell colSpan={6} className="font-bold text-lg">
                    Total Contract Value
                  </TableCell>
                  <TableCell className="text-right font-bold text-xl text-green-700">
                    {formatCurrency(totalValue)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-gray-50 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <FileText className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Trade Items
            </h3>
            <p className="text-gray-500">
              This subcontract doesn't have any trade items yet.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
