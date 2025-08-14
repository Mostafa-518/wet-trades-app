// Core hooks for common functionality
export * from './core/useApiQuery';
export * from './core/useApiMutation';
export * from './core/useFiltering';
export * from './core/usePagination';

// Authentication & user management
export { useAuth } from './useAuth';
export { useUserProfile } from './useUserProfile';
export { usePermissions } from './usePermissions';
export { useUserMutations } from './useUserMutations';

// Data management hooks
export { useProjects } from './useProjects';
export { useSubcontractors } from './useSubcontractors';
export { useSubcontracts } from './useSubcontracts';
export { useTrades } from './useTrades';
export { useTradeItems } from './useTradeItems';
export { useResponsibilities } from './useResponsibilities';

// Table & UI hooks
export { useProjectsTable } from './useProjectsTable';
export { useSubcontractorsTable } from './useSubcontractorsTable';
export { useOptimizedTable } from './useOptimizedTable';
export { usePagination as usePaginationBase } from './usePagination';

// Feature-specific hooks
export { useAlerts } from './useAlerts';
export { useReportData } from './useReportData';
export { useSubcontractorsImport } from './useSubcontractorsImport';
export { useSubcontractsImport } from './useSubcontractsImport';

// Toast notifications
export { useToast } from './use-toast';