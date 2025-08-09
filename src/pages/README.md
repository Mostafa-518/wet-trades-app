# Pages

Top-level page components that represent complete application views.

## Purpose

This directory contains:
- Route-level components that correspond to URL paths
- Complete page layouts and logic
- High-level data fetching and state management
- Page-specific error boundaries and loading states

## Structure

```
pages/
├── Index.tsx            # Dashboard/home page
├── Login.tsx            # Authentication pages
├── SignUp.tsx
├── Dashboard.tsx        # Main dashboard
├── Projects.tsx         # Project management pages
├── ProjectDetail.tsx
├── Subcontractors.tsx   # Subcontractor management
├── SubcontractorDetail.tsx
├── Trades.tsx           # Trade management
├── TradeDetail.tsx
├── Responsibilities.tsx # Responsibility management
├── Subcontracts.tsx     # Subcontract management
├── SubcontractDetail.tsx
├── FilteredSubcontracts.tsx
├── Report.tsx           # Reports and analytics
├── Users.tsx            # User management
├── UserDetail.tsx
├── Profile.tsx          # User profile
├── ProfileSettings.tsx
├── Alerts.tsx           # Alert notifications
├── RoleManagement.tsx   # Role and permission management
├── NotFound.tsx         # 404 error page
└── README.md           # This file
```

## Page Responsibilities

### Data Management
- Fetch data using React Query hooks
- Manage page-level state
- Handle loading and error states
- Coordinate between multiple data sources

### Layout & Structure
- Define page layout and sections
- Integrate with layout components
- Handle responsive design
- Manage page titles and metadata

### User Interactions
- Handle form submissions
- Manage navigation and routing
- Coordinate component interactions
- Handle user permissions and access control

## Guidelines

- Keep pages focused on orchestration, not implementation
- Use custom hooks for complex logic
- Handle all error states gracefully
- Implement proper loading states
- Follow consistent naming patterns
- Include proper TypeScript types
- Test user flows and edge cases

## Import Patterns

```tsx
// Page structure
import { Layout } from '@/layouts';
import { PageErrorBoundary } from '@/components';

// Feature components
import { ProjectsTable } from '@/components/projects';
import { ProjectForm } from '@/components/projects';

// Hooks and utilities
import { useProjects } from '@/hooks';
import { usePermissions } from '@/hooks';
```