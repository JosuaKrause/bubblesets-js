A Javascript implementation for BubbleSets
==========================================

Usage:

```javascript
var list = bubbles.createOutline(rectangles, otherRectangles, null /* lines */);
// rectangles needs to be a list of objects of the form { x: 0, y: 0, width: 0, height: 0 }
// lines needs to be a list of objects of the form { x1: 0, x2: 0, y1: 0, y2: 0 }
// lines can be null to infer lines between rectangles automatically
var outline = "";
list.forEach(function(p) {
  if(!outline.length) {
    outline += "M " + p[0] + " " + p[1];
  } else {
    outline += " L " + p[0] + " " + p[1];
  }
});
if(outline.length) {
  outline += " Z";
}
// outline is a path that can be used for the attribute d of a path element
```

See also the example (add rectangles by clicking with the left or right mouse button).
