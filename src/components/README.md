# Components

Reusable UI components organized by type and functionality.

## Purpose

This directory contains:
- Reusable UI components following atomic design principles
- Business logic components for specific features
- Shared components used across multiple pages
- Design system components (UI library)

## Structure

```
components/
├── ui/                   # Design system components (shadcn/ui)
├── forms/               # Form-specific components
├── tables/              # Table-specific components
├── shared/              # Common shared components
├── providers/           # React Context providers
├── projects/            # Project-specific components
├── subcontract/         # Subcontract feature components
├── subcontractor-detail/# Subcontractor detail components
├── subcontractor-form/  # Subcontractor form components
├── subcontractors/      # Subcontractors list components
├── report/              # Report and analytics components
└── README.md           # This file
```

## Component Categories

### UI Components (`ui/`)
- Base design system components
- Buttons, inputs, modals, etc.
- Built with Radix UI and Tailwind CSS
- Fully accessible and themeable

### Feature Components
- Organized by business domain
- Self-contained functionality
- Minimal props interface
- Well-documented and tested

### Shared Components
- Used across multiple features
- Generic and configurable
- Error boundaries and guards
- Loading states and skeletons

## Guidelines

- Keep components focused and single-purpose
- Use TypeScript for all props and interfaces
- Follow naming conventions (PascalCase for components)
- Include proper error handling
- Write comprehensive JSDoc comments
- Export components through index.ts files
- Use semantic HTML and proper accessibility

## Import Patterns

```tsx
// UI components
import { Button, Card, Input } from '@/components/ui';

// Feature components
import { ProjectForm } from '@/components/projects';
import { SubcontractTable } from '@/components/subcontract';

// Shared components
import { ErrorBoundary, AuthGuard } from '@/components';
```