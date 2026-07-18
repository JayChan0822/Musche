# Instant Month Positioning Design

## Problem

The continuous month view renders six months before the active date. Its scroll container also uses Tailwind's `scroll-smooth`, so entering month view visibly animates from the top of that buffer to the active date even though `scrollToMonthDate` requests `behavior: 'auto'`.

## Options

1. Remove `scroll-smooth` from the continuous month container. Programmatic `auto` positioning becomes immediate, while interactions that explicitly request `smooth` remain animated. This is the selected option.
2. Temporarily override `scrollBehavior` during positioning and restore it afterward. This preserves an otherwise unused global smooth setting but adds timing and cleanup complexity.
3. Reduce the six-month past buffer. This shortens the animation but does not fix the conflicting scroll behavior.

## Scope

Remove only the `scroll-smooth` class from the month view's scrolling container. Keep the rendered month range, infinite scrolling, date centering, and all explicit smooth scroll calls unchanged.

## Testing

Add a component boundary assertion that the month scroller remains vertically scrollable but does not opt into CSS smooth scrolling. Run the focused boundary test, full test suite, production build, and a browser check of the computed `scroll-behavior`.
