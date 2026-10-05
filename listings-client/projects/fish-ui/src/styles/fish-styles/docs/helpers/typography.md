# Typography Helpers
Classes that help with typography live in `src/helpers/_typography.scss`

## .is-size-{X}
This class allows setting font size using `.is-size-X` (where X is equal to 1-9).

### Usage:
```html
<h1 class="is-size-1">Our largest font size (2.4rem)</h1>

<p class="is-size-5">Our typical font size (1.4rem)</p>

<p class="is-size-9">Our smallest font size (1rem)</p>
```

### Supported Typography Sizes

| size-1 | size-2 | size-3 | size-4 | size-5 | size-6 | size-7 | size-8 | size-9 |
|--------|:------:|--------|--------|--------|--------|--------|--------|--------|
| 2.4rem | 1.8rem | 1.6rem | 1.5rem | 1.4rem | 1.3rem | 1.2rem | 1.1rem | 1rem   |

## .has-text-{alignment}

Aligns text.  Supported alignments: centered, left, right, and justified.

### Usage:
```html
<h1 class="has-text-centered">This heading is centered</h1>

<p class="has-text-left">This text is aligned to the left></p>

<div class="has-text-right">
	<p>The text in this div is aligned to the right</p>
</div>

<div class="has-text-justified">
	<p>The text in this div is justified</p>
</div>
```

### .has-text-weight-bold
Makes text bold

### Usage:
```html
<p class="has-text-weight-bold">This text is bold</p>
```

### .has-text-weight-semibold
Makes text semibold

### Usage:
```html
<div class="has-text-weight-semibold">
  <p>Everything in here is semibold</p>
</div>
```

### .has-text-weight-normal
Makes text normal

### Usage:
```html
<div class="has-text-weight-bold">
  <h1>Everything in here is bold</h1>
  <p class="has-text-weight-normal">Except this because we made it normal<p>
</div>
```

### .has-text-weight-light
Makes text light

### Usage:
```html
<p class="has-text-weight-light">This text is light<p>
```

### .is-capitalized
Capitalizes text

### Usage:
```html
<p class="is-capitalized">example<p> <!-- example actually looks like Example to the user -->
```

### .is-lowercase
Makes text lowercase

### Usage:
```html
<p class="is-lowercase">EXAMPLE<p> <!-- EXAMPLE actually looks like example to the user -->
```

### .is-uppercase
Makes text uppercase

### Usage:
```html
<p class="is-uppercase">example<p> <!-- example actually looks like EXAMPLE to the user -->
```

### .is-italic
Makes text italic

### Usage:
```html
<i class="is-italic">This text is italic<i>
```

### .is-underlined
Underlines text

### Usage:
```html
<i class="is-underlined">This text is underlined<i>
```

## .is-not-decorated
Removes text decoration by adding `text-decoration: none`

### Usage:
```html
<div class="is-italic">
  <p>Everything in this div is italic<p>
  <p class="is-not-decorated">Except this because we added .is-not-decorated to it</p>
<div>
```
