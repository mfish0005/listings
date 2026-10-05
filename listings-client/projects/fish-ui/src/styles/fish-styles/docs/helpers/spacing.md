# Spacing Helpers
Classes that help with spacing live in `src/helpers/spacing.scss`

## .section
Adds our default section padding of 2rem

### Usage:
```html
<section class="section">
I'm surrounded by 2rem of padding
</section>
```

## .is-marginless
Removes any margin

### Usage:
```html
<p class="is-marginless">
This paragraph has no margin.
</p>
```

## .is-paddingless
Removes any padding

### Usage:
```html
<p class="is-paddingless">
This paragraph has no padding.  If it falls down it will hurt.
</p>
```

## .has-margin-{side}-{x}
Adds top, right, bottom, or left margin of X rem to an element where X is 1-20.
Only supports whole numbers between 1 and 20 for now.

### Usage:
```html
<p class="has-margin-top-1">This paragraph has a top margin of 1rem</p>

<h1 class="has-margin-right-2">This heading has a right margin of 2rem</h1>

<div class="has-margin-bottom-5">This div has a bottom margin of 5rem</>

<span class="has-margin-left-10">This span has a left margin of 10rem</span>
```

## .has-padding-{side}-{x}
Adds top, right, bottom, or left padding of X rem to an element where X is 1-20.
Only supports whole numbers between 1 and 20 for now.

### Usage:
```html
<p class="has-padding-top-1">This paragraph has a top padding of 1rem</p>

<h1 class="has-padding-right-2">This heading has a right padding of 2rem</h1>

<div class="has-padding-bottom-5">This div has a bottom padding of 5rem</>

<span class="has-padding-left-10">This span has a left padding of 10rem</span>
```