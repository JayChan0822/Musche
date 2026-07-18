# Vertical View Transition Design

## Problem

Switching from week view to month view currently uses a centered scale transition. Content in the lower-left quadrant therefore moves diagonally toward the upper-right as the view shrinks, which reads as an unintended directional slide.

## Options

1. Use reciprocal vertical transitions. Entering month view moves upward, while returning to week view moves downward. This preserves direction and hierarchy without diagonal movement and is the selected option.
2. Move upward in both directions. This is visually consistent but makes the return transition feel disconnected from the entry transition.
3. Remove movement and use opacity only. This is the quietest option but loses the spatial cue requested for switching views.

## Design

Replace the `zoom-out` and `zoom-in` view transition names with `view-slide-up` and `view-slide-down`. The upward transition moves the incoming view from `translateY(30px)` to its resting position while the outgoing view moves to `translateY(-30px)`. The downward transition reverses those values.

Keep the existing overlapping absolute positioning and opacity fade so the main content does not reflow during the transition. Use transform-only movement for smooth rendering, and remove scale and horizontal translation from these view transitions.

## Testing

Add focused tests for both transition names and their CSS transform directions. Assert that the four transition endpoints use only vertical `translate3d` values and contain no scale or horizontal transforms. Run the focused test, full test suite, production build, and browser animation inspection.
