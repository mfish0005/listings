# Theming
Fish-styles supports SCSS-based theming that allows you to customize colors, typography, and spacing at build time.

## Overview
All fish-styles variables are defined with `!default`, which means you can override them by defining your own values **before** importing fish-styles. This approach provides:

- **Build-time optimization** - Colors and fonts are resolved at compile time
- **Automatic helper class updates** - All `.has-text-*`, `.has-background-*`, and size classes use your custom values
- **Component inheritance** - Any components using fish-styles automatically get your theme
- **Better performance** - No runtime JavaScript overhead

## Basic Usage

### Step 1: Create Your Theme File
Create a theme file in your application:

```scss
// src/styles/themes/my-theme.scss

// Override semantic colors first (recommended)
$primary: #007bff;        // Custom blue
$success: #28a745;        // Custom green  
$danger: #dc3545;         // Custom red
$warning: #ffc107;        // Custom yellow
$info: #17a2b8;           // Custom cyan

// Override typography
$size-1: 3rem;           // Larger headings
$size-6: 1.125rem;       // Slightly larger base text
$family-sans-serif: 'Inter', 'Segoe UI', sans-serif;

// Import fish-styles AFTER your overrides
@import 'fish-ui/styles/fish-styles/all';
```

### Step 2: Use Your Theme
Import your theme file in your main styles:

```scss
// src/styles.scss
@import './themes/my-theme';
```

**That's it!** All fish-styles components and helper classes now use your custom theme.

## Override Variables

### Colors
You can override any color variable from `initial.scss`:

```scss
// Override literal colors
$green: #28a745;
$green-dark: #1e7e34;    // For hover states
$blue: #007bff;
$blue-dark: #0056b3;     // For hover states
$red: #dc3545;
$red-dark: #bd2130;      // For hover states

// Override semantic colors (recommended)
$primary: $blue;         // Now primary uses your custom blue
$secondary: $gray;       // Secondary for outline buttons and secondary actions
$success: $green;        // Success uses your custom green
$danger: $red;           // Danger uses your custom red

// Override text color
$text: #212529;          // Darker text for better contrast

@import 'fish-ui/styles/fish-styles/all';
```

### Typography
Override font sizes, weights, and families:

```scss
// Custom font sizes
$size-1: 3rem;           // Extra large
$size-2: 2.25rem;        // Large  
$size-3: 1.875rem;       // Medium large
$size-4: 1.5rem;         // Medium
$size-5: 1.25rem;        // Small medium
$size-6: 1.125rem;       // Base (slightly larger)
$size-7: 0.875rem;       // Small

// Custom font weights
$weight-light: 300;
$weight-normal: 400;
$weight-semibold: 600;
$weight-bold: 700;

// Custom font family
$family-sans-serif: 'Roboto', 'Helvetica Neue', sans-serif;

@import 'fish-ui/styles/fish-styles/all';
```

## Custom Color Palettes

### Brand Colors Example
```scss
// Define your brand palette
$brand-primary: #6c5ce7;
$brand-secondary: #a29bfe;
$brand-accent: #fd79a8;

// Map to semantic colors
$primary: $brand-primary;
$secondary: $brand-secondary;
$warning: $brand-accent;

// Define hover states
$purple: $brand-primary;
$purple-dark: darken($brand-primary, 10%);
$blue: $brand-secondary;
$blue-dark: darken($brand-secondary, 10%);

@import 'fish-ui/styles/fish-styles/all';
```

### Override Color Maps
For complete control, override the entire color maps:

```scss
// Define your palette
$my-primary: #6c5ce7;
$my-success: #00b894;
$my-danger: #e17055;

// Override the color map
$colorMap: (
  "white": #ffffff,
  "black": #2d3436,
  "primary": $my-primary,
  "success": $my-success,
  "danger": $my-danger,
  "info": #74b9ff,
  "warning": #fdcb6e,
  "gray": #636e72,
  "green": $my-success,
  "blue": #74b9ff,
  "red": $my-danger,
  "orange": #fdcb6e,
  "yellow": #fdcb6e,
  "purple": $my-primary,
);

// Override shade map for hover states
$shadeMap: (
  "primary-dark": darken($my-primary, 10%),
  "success-dark": darken($my-success, 10%),
  "danger-dark": darken($my-danger, 10%),
  "gray-lightest": #f8f9fa,
  "gray-lighter": #e9ecef,
  "gray-light": #dee2e6,
  "gray-dark": #495057,
  "gray-darker": #343a40,
  "gray-darkest": #212529,
  // ... add other shades as needed
);

@import 'fish-ui/styles/fish-styles/all';
```

## Typography Customization

### Custom Font Stack
```scss
// Modern font stack
$family-sans-serif: 'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

// Override primary family
$family-primary: $family-sans-serif;

@import 'fish-ui/styles/fish-styles/all';
```

### Custom Size Scale
```scss
// Larger, more generous scale
$size-1: 4rem;     // 64px - Hero text
$size-2: 3rem;     // 48px - Page titles  
$size-3: 2.25rem;  // 36px - Section headings
$size-4: 1.875rem; // 30px - Subsection headings
$size-5: 1.5rem;   // 24px - Large text
$size-6: 1.25rem;  // 20px - Base text (larger)
$size-7: 1rem;     // 16px - Small text

// Update the sizes list
$sizes: $size-1, $size-2, $size-3, $size-4, $size-5, $size-6, $size-7;

@import 'fish-ui/styles/fish-styles/all';
```

## Dark Theme Example

```scss
// src/styles/themes/dark-theme.scss

// Invert base colors
$white: #1a1a1a;          // Dark background
$black: #ffffff;          // Light text
$text: #e0e0e0;           // Light gray text

// Dark-friendly grays
$gray-lightest: #2d2d2d;  // Darkest gray (for backgrounds)
$gray-lighter: #3d3d3d;
$gray-light: #4d4d4d;
$gray: #6d6d6d;
$gray-dark: #8d8d8d;
$gray-darker: #b0b0b0;
$gray-darkest: #e0e0e0;   // Lightest gray (for text)

// Vibrant colors for dark theme
$green: #51cf66;
$green-dark: #37b24d;
$blue: #4dabf7;
$blue-dark: #228be6;
$red: #ff6b6b;
$red-dark: #f03e3e;
$orange: #ffd43b;
$orange-dark: #fab005;

// Semantic colors
$primary: $blue;
$success: $green;
$danger: $red;
$warning: $orange;
$info: #74c0fc;

@import 'fish-ui/styles/fish-styles/all';
```

## Usage Examples

Once themed, all components and helper classes automatically use your custom values:

### Components
```html
<!-- These buttons use your custom theme colors -->
<fish-button variant="primary">Custom Primary</fish-button>
<fish-button variant="success">Custom Success</fish-button>
<fish-button variant="danger">Custom Danger</fish-button>
```

### Helper Classes  
```html
<!-- Text colors use your theme -->
<h1 class="has-text-primary is-size-1">Custom themed heading</h1>
<p class="has-text-success is-size-6">Success message in your colors</p>

<!-- Background colors use your theme -->
<div class="has-background-primary">Primary background</div>
<div class="has-background-danger">Danger background</div>

<!-- Typography uses your custom sizes -->
<h2 class="is-size-2">Custom size-2 heading</h2>
<p class="is-size-6 has-text-weight-normal">Custom base text</p>
```

## Best Practices

1. **Override semantic colors first** - Use `$primary`, `$success`, etc. rather than literal color names
2. **Define hover states** - Include dark variants like `$green-dark` for button hover effects  
3. **Test thoroughly** - Ensure your theme works across all components and helper classes
4. **Import order matters** - Always define variables BEFORE importing fish-styles
5. **Consider accessibility** - Ensure color contrast meets WCAG guidelines
6. **Use a dedicated theme file** - Keep theme variables separate from component styles

## Multiple Themes

Create different theme files for different contexts:

```scss
// themes/light-theme.scss
$primary: #007bff;
$white: #ffffff;
@import 'fish-ui/styles/fish-styles/all';

// themes/dark-theme.scss  
$primary: #4dabf7;
$white: #1a1a1a;
@import 'fish-ui/styles/fish-styles/all';

// themes/brand-theme.scss
$primary: #your-brand-color;
@import 'fish-ui/styles/fish-styles/all';
```

Then conditionally import based on your application's needs or build different CSS bundles for each theme.
