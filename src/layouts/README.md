# Layouts

This directory contains layout components that define the overall structure and visual framework for different sections of the application.

## Purpose

Layout components provide:
- Consistent navigation and header structure
- Shared UI elements like sidebars and footers
- Different layouts for authenticated vs unauthenticated users
- Responsive design patterns

## Structure

```
layouts/
├── DashboardLayout.tsx    # Main authenticated user layout with sidebar
├── AuthLayout.tsx         # Layout for login/signup pages
├── index.ts              # Barrel exports
└── README.md             # This file
```

## Components

### DashboardLayout
- Primary layout for authenticated users
- Includes collapsible sidebar with navigation
- User profile dropdown and alerts
- Responsive design with mobile support

### AuthLayout
- Simple centered layout for authentication pages
- Clean, minimal design focused on forms
- Consistent branding and styling

## Usage

```tsx
import { DashboardLayout, AuthLayout } from '@/layouts';

// For authenticated pages
<DashboardLayout>
  <YourPageContent />
</DashboardLayout>

// For auth pages
<AuthLayout title="Sign In" subtitle="Access your account">
  <LoginForm />
</AuthLayout>
```

## Guidelines

- Keep layouts focused on structure, not business logic
- Use semantic HTML elements for accessibility
- Maintain consistent spacing and typography
- Test responsive behavior across devices
- Follow the established design system