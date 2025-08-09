
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";

interface TableSelectionCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  ariaLabel?: string;
}

export function TableSelectionCheckbox({
  checked,
  onCheckedChange,
  ariaLabel = "Select row",
}: TableSelectionCheckboxProps) {
  return (
    <Checkbox
      className="!h-4 !w-4"
      checked={checked}
      onCheckedChange={onCheckedChange}
      aria-label={ariaLabel}
    />
  );
}
