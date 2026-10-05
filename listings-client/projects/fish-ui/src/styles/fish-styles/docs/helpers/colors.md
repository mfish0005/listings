# Color Helpers
 Classes that help with colors live in `src/helpers/colors.scss`

## .has-text-{color-name}
This class allows setting text color.  **All supported colors listed in the tables at the bottom.**

### Usage:
```html
<p class="has-text-primary">This text is green(our primary color)</p>

<h3 class="has-text-warning">This text is orange(our warning color)</h3>

<p class="has-text-blue">This text is blue</p>

<h1 class="has-text-blue-darkest">This text is our darkest shade of blue</h1>
```
One should avoid using the literal color names where possible.  E.G. Use `class="has-text-primary"` instead of `class="has-text-green"`.

## .has-background-{color-name}
This class allows setting background color.  **All supported colors listed in the tables at the bottom.**

### Usage:
```html
<span class="has-background-primary">This span has our primary background color</span>

<h1 class="has-background-purple">This h1 has a purple background</h1>

<div class="has-background-purple-light">This div has a light purple background color</div>
```
One should avoid using the literal color names where possible.  E.G. If possible use `class="has-background-warning"` instead of `class="has-background-orange"`.

## - Commonly Used -

## primary (green)

### Usage:
```html
<div class="has-background-primary">
This div has our primary background color
</div>

<p class="has-text-primary">
This text is our primary color
<p>
```

## success (green)
### Usage:
```html
<label class="has-text-success">
Success! This success message is our success color!
<label>
```

## warning (orange)
```html
<label class="has-text-warning">
Warning! This message is our warning color!
<label>
```

## danger (red)
```html
<label class="has-text-danger">
Danger! Will Robinson printed this in our danger color!
<label>
```