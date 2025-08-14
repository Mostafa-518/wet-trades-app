
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ImportPreviewDialogProps<T> {
  open: boolean;
  onClose: () => void;
  data: T[];
  columns: { key: keyof T; label: string }[];
  onImport: (updatedData: T[]) => void;
}

export function ImportPreviewDialog<T extends { [key: string]: any }>({
  open,
  onClose,
  data,
  columns,
  onImport,
}: ImportPreviewDialogProps<T>) {
  const [tableData, setTableData] = useState<T[]>(data);

  useEffect(() => {
    // Dialog state and data validation
    setTableData(data);
  }, [data, open]);

  // Handlers for editing
  const handleCellChange = (rowIdx: number, key: keyof T, value: string) => {
    setTableData((old) =>
      old.map((row, idx) =>
        idx === rowIdx ? { ...row, [key]: value } : row
      )
    );
  };

  const handleDelete = (rowIdx: number) => {
    setTableData((old) => old.filter((_, idx) => idx !== rowIdx));
  };

  const handleImport = () => {
    // Importing data
    onImport(tableData);
  };

  const handleClose = () => {
    // Closing dialog
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Review Imported Data</DialogTitle>
          <DialogDescription>
            Please review and edit the data as needed before importing into the system.
            Found {tableData.length} records to import.
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-auto max-h-96 my-4 border rounded-lg">
          {tableData.length > 0 ? (
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  {columns.map((col) => (
                    <th key={String(col.key)} className="p-3 text-left font-medium border-b">
                      {col.label}
                    </th>
                  ))}
                  <th className="p-3 text-left font-medium border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, rowIdx) => (
                  <tr key={rowIdx} className="border-b hover:bg-gray-50">
                    {columns.map((col) => (
                      <td key={String(col.key)} className="p-3">
                        <Input
                          type="text"
                          value={row[col.key] ?? ""}
                          onChange={(e) =>
                            handleCellChange(rowIdx, col.key, e.target.value)
                          }
                          className="w-full min-w-[120px]"
                        />
                      </td>
                    ))}
                    <td className="p-3">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(rowIdx)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center p-8">
              <p className="text-gray-500">No data to import.</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            disabled={tableData.length === 0}
            onClick={handleImport}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Import {tableData.length} Record{tableData.length !== 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
