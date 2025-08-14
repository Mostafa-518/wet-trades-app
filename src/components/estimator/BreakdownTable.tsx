import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export type BreakdownItem = {
  category: string;
  name: string;
  qty: number;
  unit: string;
  unit_price: number;
  total: number;
};

type Props = {
  items: BreakdownItem[];
  currency: string;
  onChange: (items: BreakdownItem[]) => void;
};

export function BreakdownTable({ items, currency, onChange }: Props) {
  const updateItem = (idx: number, patch: Partial<BreakdownItem>) => {
    const next = items.map((it, i) =>
      i === idx
        ? {
            ...it,
            ...patch,
          }
        : it
    );
    // Recompute totals if qty or unit_price changed
    const recalc = next.map((l, i) =>
      i === idx && (patch.qty !== undefined || patch.unit_price !== undefined)
        ? { ...l, total: Number(((patch.qty ?? l.qty) * (patch.unit_price ?? l.unit_price)).toFixed(2)) }
        : l
    );
    onChange(recalc);
  };

  const categoryTotals = items.reduce<Record<string, number>>((acc, l) => {
    acc[l.category] = (acc[l.category] ?? 0) + (Number.isFinite(l.total) ? l.total : 0);
    return acc;
  }, {});

  const grandTotal = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-3">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Component</TableHead>
            <TableHead className="w-24">Qty</TableHead>
            <TableHead className="w-20">Unit</TableHead>
            <TableHead className="w-32">Unit Price ({currency})</TableHead>
            <TableHead className="w-32 text-right">Total ({currency})</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((row, idx) => (
            <TableRow key={idx}>
              <TableCell>
                <div className="text-sm font-medium capitalize">{row.category}</div>
                <div className="text-xs text-muted-foreground">{row.name}</div>
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  step="0.01"
                  value={Number.isFinite(row.qty) ? row.qty : 0}
                  onChange={(e) => updateItem(idx, { qty: parseFloat(e.target.value || "0") })}
                />
              </TableCell>
              <TableCell>
                <Input value={row.unit} onChange={(e) => updateItem(idx, { unit: e.target.value })} />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  step="0.01"
                  value={Number.isFinite(row.unit_price) ? row.unit_price : 0}
                  onChange={(e) => updateItem(idx, { unit_price: parseFloat(e.target.value || "0") })}
                />
              </TableCell>
              <TableCell className="text-right font-medium">
                {Number.isFinite(row.total) ? row.total.toFixed(2) : "0.00"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {Object.entries(categoryTotals).map(([cat, val]) => (
          <div key={cat} className="flex items-center justify-between rounded-md border px-3 py-2">
            <div className="text-sm font-medium capitalize">{cat}</div>
            <div className="text-sm">{val.toFixed(2)} {currency}</div>
          </div>
        ))}
        <div className="md:col-span-3 flex items-center justify-between rounded-md border px-3 py-2">
          <div className="text-sm font-semibold">Grand Total</div>
          <div className="text-sm font-semibold">{grandTotal.toFixed(2)} {currency}</div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={() => onChange(items)}>
          Reset
        </Button>
      </div>
    </div>
  );
}

export default BreakdownTable;
