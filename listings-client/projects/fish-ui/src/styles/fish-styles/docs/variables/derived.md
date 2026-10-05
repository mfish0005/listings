# Derived Variables
`src/variables/derived.scss` holds our *derived* variables.  These variables derive from our initial variables.  They should be used instead of literal variables where possible to increase modularity.

## - Summary -
Example of derived variables include:

 - Our primary theme color: `$primary: $green !default;`
 - Our secondary theme color: `$secondary: $gray-dark !default;`
 - Warning message color: `$warning: $orange !default;`
 - Success message color: `$success: $green !default;`
 - Primary font family: `$family-primary: $family-sans-serif !default;`

**🎨 THEMING:** All derived variables are also defined with `!default`, so you can override semantic colors directly in your theme files. See [theming.md](../theming.md) for examples.

## - Colors -

### Usage

Set a color or background color using a literal color variable.

```scss
.warningLabel {
    color: $danger;
}

.someElement {
  background-color: $primary;
}
```
## Derived Colors
| Class     | Color       | Hex     |
|-----------|-------------|---------|
| primary   | green       | #50a000 |
| secondary | gray-dark   | #718792 |
| success   | green       | #50a000 |
| warning   | orange      | #ff9800 |
| danger    | red         | #a91818 |
| info      | blue        | #17489e |
| text      | gray-darker | #455a64 |

## Color & Shade Maps
We have a $colors map and a $shades map.  These are used to build our color helper classes.

## - Typography -

## Font Families
Derived font families.

### $family-primary: $family-sans-serif;
Our primary font family.  Use this variable in case we switch to a different font later.

### $sizes: $size-1, $size-2, $size-3, $size-4, $size-5, $size-6, $size-7, $size-8, $size-9;
This defines our custom sizes and are used to generate helper classes like .is-size-8 and .is-size-9 etc.
