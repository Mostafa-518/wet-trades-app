# Hooks

Custom React hooks for encapsulating reusable logic and state management.

## Purpose

This directory contains:
- Custom hooks for business logic
- Data fetching and mutation hooks
- UI state management hooks
- Utility hooks for common patterns

## Structure

```
hooks/
├── core/                # Generic, reusable hooks
│   ├── useApiQuery.ts   # Data fetching wrapper
│   ├── useApiMutation.ts# Data mutation wrapper
│   ├── useFiltering.ts  # Generic filtering logic
│   └── usePagination.ts # Pagination management
├── subcontract/         # Feature-specific hooks
├── persistent-form/     # Form persistence hooks
├── useAuth.tsx          # Authentication hooks
├── useProjects.ts       # Project management
├── useSubcontractors.ts # Subcontractor management
├── ... [other domain hooks]
├── index.ts            # Barrel exports
└── README.md           # This file
```

## Hook Categories

### Core Hooks (`core/`)
- Generic, framework-level functionality
- API interaction patterns
- Common UI state patterns
- Reusable across all features

### Feature Hooks
- Domain-specific business logic
- Entity CRUD operations
- Feature-specific state management
- Validation and business rules

### Utility Hooks
- Common patterns and helpers
- UI interaction helpers
- Form management
- Data transformation

## Guidelines

- Keep hooks focused and single-purpose
- Use descriptive names that indicate functionality
- Return objects with named properties, not arrays
- Include proper TypeScript types
- Handle loading and error states
- Provide clear JSDoc documentation
- Follow React hooks rules strictly
- Test hooks in isolation when possible

## Usage Patterns

```tsx
// Data management
const { projects, isLoading, error } = useProjects();
const { mutate: createProject } = useProjectMutation();

// UI state
const { searchTerm, filteredData, handleSearch } = useFiltering(data);
const { currentPage, totalPages, goToPage } = usePagination();

// Feature logic
const { canEdit, canDelete } = usePermissions();
const { user, signOut } = useAuth();
```

## Dependencies

- React Query for server state
- Zustand for client state (where needed)
- React Hook Form for form management
- Custom validation logic