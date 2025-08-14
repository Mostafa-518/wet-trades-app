import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export type TopContextItem = { id: string; item_name: string; unit: string; rate: number | null; currency: string | null; created_at: string };

type Props = {
  items: TopContextItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function MatchedItemsModal({ items, open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Matched Historical Items</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 max-h-[60vh] overflow-auto">
          {items.length === 0 && (
            <div className="text-sm text-muted-foreground">No matched items returned.</div>
          )}
          {items.map((it) => (
            <div key={it.id} className="rounded-md border p-3">
              <div className="text-sm font-medium">{it.item_name} <span className="text-muted-foreground">({it.unit})</span></div>
              <div className="text-xs text-muted-foreground">Rate: {it.rate ?? '-'} {it.currency ?? ''} • {new Date(it.created_at).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default MatchedItemsModal;
