import React from "react";
import { Button } from "@/components/ui/button";

type Props = {
  itemName: string;
  unit: string;
  currency: string;
  unitRate: number;
  confidence: number; // 0..1
  rationale: string;
  contextSize: number;
  generatedAt: string;
  onShowContext?: () => void;
};

export function RateSummary({ itemName, unit, currency, unitRate, confidence, rationale, contextSize, generatedAt, onShowContext }: Props) {
  const pct = Math.round(confidence * 100);
  return (
    <section className="space-y-2">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold">Rate Summary</h2>
          <p className="text-sm text-muted-foreground">
            {itemName} — Unit: {unit}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{unitRate.toFixed(2)} {currency}/{unit}</div>
          <div className="text-xs text-muted-foreground">Confidence: {pct}%</div>
        </div>
      </div>
      <p className="text-sm leading-relaxed"><span className="font-medium">Rationale:</span> {rationale}</p>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div>
          Context: {contextSize} records • Generated {new Date(generatedAt).toLocaleString()}
        </div>
        {onShowContext && (
          <Button size="sm" variant="outline" onClick={onShowContext}>View matched items</Button>
        )}
      </div>
    </section>
  );
}

export default RateSummary;
