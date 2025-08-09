
import { useRef, useState } from 'react';
import { ProjectSearchFilters } from '@/types/project';
import { useData } from '@/contexts/DataContext';
import * as XLSX from 'xlsx';

export function useProjectsTable() {
  const { projects, addProject, deleteProject } = useData();
  const [searchFilters, setSearchFilters] = useState<ProjectSearchFilters>({
    name: '',
    code: '',
    location: ''
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [importedData, setImportedData] = useState<any[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilterChange = (field: keyof ProjectSearchFilters, value: string) => {
    setSearchFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setSearchFilters({ name: '', code: '', location: '' });
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const filteredProjects = projects.filter(project => {
    return (
      project.name.toLowerCase().includes(searchFilters.name.toLowerCase()) &&
      project.code.toLowerCase().includes(searchFilters.code.toLowerCase()) &&
      project.location.toLowerCase().includes(searchFilters.location.toLowerCase())
    );
  });

  const allSelected = filteredProjects.length > 0 && filteredProjects.every(p => selectedIds.has(p.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProjects.map(p => p.id)));
    }
  };

  const toggleOne = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const handleBulkDelete = async () => {
    for (const id of selectedIds) {
      await deleteProject(id);
    }
    setSelectedIds(new Set());
  };

  function normalizeHeader(header: string) {
    const key = header.trim().toLowerCase().replace(/[\s_]+/g, '');
    if (key === "projectname") return "name";
    if (key === "projectcode") return "code";
    if (key === "projectlocation") return "location";
    return (
      {
        name: "name",
        code: "code",
        location: "location",
      }[key] || key
    );
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (!jsonData || jsonData.length < 2) {
        setImportedData([]);
        return;
      }

      let [rawHeaders, ...rows] = jsonData;

      const headers = rawHeaders.map((h: string) => normalizeHeader(h));
      const allowedKeys = ['name', 'code', 'location'];

      const mapped = rows
        .filter((row) => row.some((cell) => cell !== undefined && cell !== ""))
        .map((row) => {
          const out: any = {};
          headers.forEach((header: string, idx: number) => {
            if (allowedKeys.includes(header)) {
              out[header] = row[idx] ?? "";
            }
          });
          return out;
        });

      setImportedData(mapped);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImport = async (rows: any[]) => {
    for (const row of rows) {
      await addProject({
        name: row.name || '',
        code: row.code || '',
        location: row.location || ''
      });
    }
    setImportedData(null);
  };

  return {
    projects,
    searchFilters,
    selectedIds,
    importedData,
    fileInputRef,
    filteredProjects,
    allSelected,
    handleFilterChange,
    clearFilters,
    handleImportClick,
    toggleAll,
    toggleOne,
    handleBulkDelete,
    handleFileChange,
    handleImport,
    setImportedData,
  };
}
