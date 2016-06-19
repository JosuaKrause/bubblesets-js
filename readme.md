BubbleSets for JavaScript
=========================

A JavaScript implementation of Christopher Collins' [bubble sets](http://vialab.science.uoit.ca/portfolio/bubblesets)
without the use of external libraries. A Java implementation can be found [here](https://github.com/JosuaKrause/Bubble-Sets).

Usage:

```html
<script src="bubblesets.js" charset="utf-8"></script>
```

and

```javascript
var pad = 5;
var bubbles = new BubbleSet();
// bubbles can be reused for subsequent runs or different sets of rectangles
var list = bubbles.createOutline(
  BubbleSet.addPadding(rectangles, pad),
  BubbleSet.addPadding(otherRectangles, pad),
  null /* lines */
);
// rectangles needs to be a list of objects of the form { x: 0, y: 0, width: 0, height: 0 }
// lines needs to be a list of objects of the form { x1: 0, x2: 0, y1: 0, y2: 0 }
// lines can be null to infer lines between rectangles automatically
var outline = new PointPath(list).transform([
  new ShapeSimplifier(0.0),
  new BSplineShapeGenerator(),
  new ShapeSimplifier(0.0),
]);
// outline is a path that can be used for the attribute d of a SVG path element
```

See also the [example](http://josuakrause.github.io/bubblesets-js/) (add rectangles by clicking with the left or right mouse button).

This implementation is mostly a translation of the Java code originally written by Christopher Collins.
If you're missing a feature from the Java version or find a bug please open an [issue](https://github.com/JosuaKrause/bubblesets-js/issues/new). [Pull requests](https://github.com/JosuaKrause/bubblesets-js/compare) are also welcome.
