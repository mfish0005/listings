# Positioning Helpers
Classes that help with positioning live in `/src/helpers/positioning.scss`

## .push-right
Pushes a **flex** element to the right.

### Usage:
```html
<div class="is-flex">
	<div class="push-right">
		Any element inside here will be pushed to the right side of the parent div
	</div>
</div>
```

## .push-left
Pushes a **flex** element to the left.  For example:

### Usage:
```html
<div class="is-flex">
	<div class="push-left">
		Any element inside here will be pushed to the left side of the parent div
	</div>
</div>
```

## .is-flex-centered
Adds vertical and horizontal centering using `display: flex;` , `align-items: center;` , and `justify-content: center;`

### Usage:
```html
<div class="is-flex-centered">
  Any element inside this div will be vertically and horizontally centered.  No Google required.
</div>
```