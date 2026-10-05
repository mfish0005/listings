# - Initial Variables -
`src/variables/initial.scss` holds our *literal* variables.

## - Summary -
Examples of initial variables would be:

 - Literal colors such as `$green: #50a000 !default;`
 - Literal font sizes such as `$size-1: 2.5rem !default;`
 - Font weights such as `$weight-bold: 700 !default;`
 - Font families like `$family-sans-serif: "Open Sans", sans-serif !default;`

 **These can be used as is or derived from in the `derived.scss` file.**

 **🎨 THEMING:** All initial variables are defined with `!default`, which means you can override them in your own theme files. See [theming.md](../theming.md) for details.

 NOTE: If possible it is *always* best to set derived variables that inherit initial(literal) variables.  This way if we need to change the value of a variable(like our `$primary` color) it can be changed in one line instead of countless lines.

## - Colors -
Literal colors
**NOTE:  Using $green, $red, $orange, or $blue to set primary color, text color, success, warning, danger, or info messages? It is best to use the derived variables instead. See derived.md for full details**

### Usage

Set a color or background color using a literal color variable.
**NOTE: It's best to use our helper classes instead(.has-text-red, .has-background-blue-light, etc.).  See `src/docs/helpers/colors.md`**

```scss
.someClass {
    color: $blue-darker;
    background-color: $yellow-lightest;
}
```

## - Typography -

## Font Sizes
Literal font sizes. Use these just in case font sizes are tweaked later on.

### $size-1: 2.4rem
### $size-2: 1.8rem
### $size-3: 1.6rem
### $size-4: 1.5rem
### $size-5: 1.4rem
### $size-6: 1.3rem
### $size-7: 1.2rem
### $size-8: 1.1rem
### $size-9: 1rem

### Usage
Set a font size using a size variable.  **NOTE: It's preferable to use our helper classes (.is-size-1, .is-size-5, etc.) for this instead. See `src/docs/helpers/typography.md`**

```scss
h1 {
    font-size: $size-1;
}
```

## Font Weights
Literal Font Weights

### $weight-semibold: 600
### $weight-bold: 700
### $weight-normal: 500
### $weight-light: 400

### Usage
Set a font weight using a weight variable.  **NOTE: It's preferable to use our helper classes (.has-text-weight-bold, .has-text-weight-semibold etc.) for this instead. See `src/docs/helpers/typography.md`**

```scss
h1 {
  font-weight: $weight-bold;
}
```

## Font Families
Literal Font Families

$family-sans-serif: "Open Sans", "Helvetica Neue", sans-serif;

**NOTE: Instead of $family-sans-serif you should use the $family-primary derived variable just in case we change our primary font later**

## - Spacing -
Literal spacing values

$section-padding: 2rem
**NOTE: You shouldn't need to set this in the CSS.  Applying the `.section` class to a `<section>` is the preferred way of setting default section padding.**

### Usage
```html
<section class="section">
This section has our default section padding of 2rem.
</section>
```
