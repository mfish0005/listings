## .is-invisible
Adds `visibility: hidden;`

### Usage:
```html
<div class="is-invisible">
You can't see me but I still exist!  It's magic.
</div>
```

## .is-visible
Adds `visibility: visible;`

### Usage:
```html
<div [ngClass]="{'is-visible' ? someBoolean : 'is-invisible'}">
If someBoolean is true you can see me.  If it's false YOU CAN'T SEE ME *waves hand in front of face*
</div>
```

## .is-sr-only
Hide elements **visually** but keep the element available to be announced by a **screen reader**

### Usage:
```html
<div class="is-sr-only">
You can't see me unless you're using a screen reader. #accessibilitymatters
</div>
```
