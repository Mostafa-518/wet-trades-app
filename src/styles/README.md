# Styles

Global CSS files and styling configuration for the application.

## Purpose

This directory contains:
- Global CSS variables and design tokens
- Tailwind CSS configuration and utilities
- Print styles and media queries
- Component-level styling utilities

## Structure

```
styles/
├── globals.css           # Main global styles and design tokens
└── README.md            # This file
```

## Key Features

### Design Tokens
- HSL color variables for consistent theming
- Light and dark mode support
- Chart color palette
- Border radius and spacing tokens

### Global Utilities
- Print-specific styles for reports
- Dropdown and popover fixes
- Smooth transitions and animations
- Responsive design utilities

## Usage

The global styles are imported in `main.tsx`:

```tsx
import '@/styles/globals.css';
```

### Using Design Tokens

```css
/* Use semantic color tokens */
.my-component {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}
```

## Guidelines

- Always use semantic color tokens, never hardcoded colors
- Follow the established spacing scale
- Test both light and dark themes
- Ensure print styles work for reports
- Use Tailwind utilities over custom CSS when possible