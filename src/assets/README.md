# Assets

Static assets including images, icons, fonts, and other media files.

## Purpose

This directory contains:
- Images and graphics used in the application
- Icon files and SVG assets
- Font files (if not using web fonts)
- Other static media assets

## Structure

```
assets/
├── images/              # Image files
│   ├── logos/          # Company and brand logos
│   ├── backgrounds/    # Background images
│   ├── illustrations/  # UI illustrations
│   └── photos/         # Product or content photos
├── icons/              # Icon files
│   ├── ui-icons/       # User interface icons
│   ├── brand-icons/    # Social media and brand icons
│   └── flags/          # Country flags or similar
├── fonts/              # Font files (if needed)
└── README.md          # This file
```

## Naming Conventions

### Files
- Use `kebab-case` for all asset file names
- Include descriptive names that indicate usage
- Add size suffixes for multiple resolutions (e.g., `logo-small.png`, `logo-large.png`)

### Examples
```
hero-background.jpg
user-avatar-placeholder.png
company-logo.svg
error-illustration.svg
loading-spinner.gif
```

## Optimization Guidelines

### Images
- Use appropriate formats (JPEG for photos, PNG for graphics with transparency, SVG for icons)
- Optimize file sizes for web delivery
- Provide multiple resolutions for responsive design
- Use lazy loading for large images

### Icons
- Prefer SVG format for scalability
- Use consistent sizing and styling
- Consider icon fonts for large icon sets
- Ensure accessibility with proper alt text

## Usage Patterns

```tsx
// Import images as ES6 modules
import heroImage from '@/assets/images/hero-background.jpg';
import companyLogo from '@/assets/images/logos/company-logo.svg';

// Use in components
<img src={heroImage} alt="Hero background" />
<img src={companyLogo} alt="Company logo" className="h-8 w-auto" />
```

## Best Practices

- Keep file sizes reasonable for web performance
- Use semantic naming that describes the content or purpose
- Organize assets by type and usage context
- Maintain consistent styling and branding
- Include proper licensing information for third-party assets
- Consider using a CDN for large asset collections