/**
 * Created by krause on 2014-10-25.
 */

function BubbleSet() {

  function Rectangle() {
    var that = this;
    var x = 0;
    var y = 0;
    var width = 0;
    var height = 0;
    var centroidDistance = 0;

    this.rect = function(r) {
      if(!arguments.length) return {
        x: x,
        y: y,
        width: width,
        height: height
      };
      x = r.x;
      y = r.y;
      width = r.width;
      height = r.height;
    };
    this.minX = function() {
      return x;
    };
    this.minY = function() {
      return y;
    };
    this.maxX = function() {
      return x + width;
    };
    this.maxY = function() {
      return y + height;
    };
    this.centerX = function() {
      return x + width * 0.5;
    };
    this.centerY = function() {
      return y + height * 0.5;
    };
    this.width = function() {
      return width;
    };
    this.height = function() {
      return height;
    };
    this.centroidDistance = function(cd) {
      if(!arguments.length) return centroidDistance;
      centroidDistance = cd;
    };
    this.cmp = function(rect) {
      if(centroidDistance < rect.centroidDistance()) return -1;
      if(centroidDistance > rect.centroidDistance()) return 0;
      return 0;
    };
    this.add = function(rect) {
      x = Math.min(x, rect.minX());
      y = Math.min(y, rect.minY());
      var maxX = Math.max(that.maxX(), rect.maxX());
      var maxY = Math.max(that.maxY(), rect.maxY());
      width = maxX - x;
      height = maxY - y;
    };
  } // Rectangle

  function Point(ax, ay) {
    var x = ax;
    var y = ay;
    this.x = function(_) {
      if(!arguments.length) return x;
      x = _;
    };
    this.y = function(_) {
      if(!arguments.length) return y;
      y = _;
    };
    this.distanceSq = function(p) {
      return (p.x() - x) * (p.x() - x) + (p.y() - y) * (p.y() - y);
    };
    this.get = function() {
      return [ x, y ];
    };
  } // Point
  Point.doublePointsEqual = function(p1, p2, delta) {
    return p1.distanceSq(p2) < delta * delta;
  };

  function PointList(size) {
    var cur = 0;
    var arr = [];
    var set = {};

    this.add = function(p) {
      // TODO
    };
    this.contains = function(p) {
      // TODO
    };
    this.isFirst = function(p) {
      // TODO
    };
    this.list = function() {
      return arr.map(function(p) {
        return p.get();
      });
    };
  }; // PointList

  function Line(p1, p2) {

    this.rect = function() {
      var res = new Rectangle();
      var minX = Math.min(p1.x(), p2.x());
      var minY = Math.min(p1.y(), p2.y());
      var maxX = Math.max(p1.x(), p2.x());
      var maxY = Math.max(p1.y(), p2.y());
      res.rect({
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
      });
      return res;
    }
    this.x1 = function() {
      return p1.x();
    };
    this.x2 = function() {
      return p2.x();
    };
    this.y1 = function() {
      return p1.y();
    };
    this.y2 = function() {
      return p2.y();
    };
  }; // Line

  function Area(width, height) {
    var size = width * height;
    var buff = new Float32Buffer(size);

    this.get = function(x, y) {
      if(x < 0 || x >= width || y < 0 || y >= height) return Number.NaN;
      return buff[x + y * width];
    };
    this.set = function(x, y, v) {
      buff[x + y * width] = v;
    };
    this.width = function() {
      return width;
    };
    this.height = function() {
      return height;
    };
  } // Area

  function Intersection(p, s) {
    var point = p;
    var state = s;

    this.getState = function() {
      return state;
    };
    this.getPoint = function() {
      return point;
    };
  } // Intersection
  Intersection.POINT = 1;
  Intersection.PARALLEL = 2;
  Intersection.COINCIDENT = 3;
  Intersection.NONE = 4;
  Intersection.intersectLineLine = function(la, lb) {
    var uaT = (lb.x2() - lb.x1()) * (la.y1() - lb.y1())
            - (lb.y2() - lb.y1()) * (la.x1() - lb.x1());
    var ubT = (la.x2() - la.x1()) * (la.y1() - lb.y1())
            - (la.y2() - la.y1()) * (la.x1() - lb.x1());
    var uB  = (lb.y2() - lb.y1()) * (la.x2() - la.x1())
            - (lb.x2() - lb.x1()) * (la.y2() - la.y1());
    if(uB) {
      var ua = uaT / uB;
      var ub = ubT / uB;
      if(0 <= ua && ua <= 1 && 0 <= ub && ub <= 1) {
        var p = new Point(la.x1() + ua * (la.x2() - la.x1()), la.y1() + ua * (la.y2() - la.y1()));
        return new Intersection(p, Intersection.POINT);
      }
      return new Intersection(null, Intersection.NONE);
    }
    return new Intersection(null, (uaT == 0 || ubT == 0) ? Intersection.COINCIDENT : Intersection.PARALLEL);
  };
  Intersection.fractionAlongLineA = function(la, lb) {
    var uaT = (lb.x2() - lb.x1()) * (la.y1() - lb.y1())
            - (lb.y2() - lb.y1()) * (la.x1() - lb.x1());
    var ubT = (la.x2() - la.x1()) * (la.y1() - lb.y1())
            - (la.y2() - la.y1()) * (la.x1() - lb.x1());
    var uB  = (lb.y2() - lb.y1()) * (la.x2() - la.x1())
            - (lb.x2() - lb.x1()) * (la.y2() - la.y1());
    if(uB) {
      var ua = uaT / uB;
      var ub = ubT / uB;
      if(0 <= ua && ua <= 1 && 0 <= ub && ub <= 1) {
        return ua;
      }
    }
    return Number.POSITIVE_INFINITY;
  };
  Intersection.fractionToLineCenter = function(bounds, line) {
    var minDistance = Number.POSITIVE_INFINITY;
    var countIntersections = 0;

    function testLine(xa, ya, xb, yb) {
      var testDistance = Intersection.fractionAlongLineA(line, new Line(new Point(xa, ya), new Point(xb, yb)));
      testDistance = Math.abs(testDistance - 0.5);
      if((testDistance >= 0) && (testDistance <= 1)) {
        countIntersections += 1;
        if(testDistance < minDistance) {
          minDistance = testDistance;
        }
      }
    }

    // top
    testLine(bounds.minX(), bounds.minY(), bounds.maxX(), bounds.minY());
    // left
    testLine(bounds.minX(), bounds.minY(), bounds.minX(), bounds.maxY());
    if(countIntersections > 1) return minDistance;
    // bottom
    testLine(bounds.minX(), bounds.maxY(), bounds.maxX(), bounds.maxY());
    if(countIntersections > 1) return minDistance;
    // right
    testLine(bounds.maxX(), bounds.minY(), bounds.maxX(), bounds.maxY());
    // if no intersection, return -1
    if(countIntersections == 0) return -1;
    return minDistance;
  };
  Intersection.fractionToLineEnd = function(bounds, line) {
    var minDistance = Number.POSITIVE_INFINITY;
    var countIntersections = 0;

    function testLine(xa, ya, xb, yb) {
      var testDistance = Intersection.fractionAlongLineA(line, new Line(new Point(xa, ya), new Point(xb, yb)));
      if((testDistance >= 0) && (testDistance <= 1)) {
        countIntersections += 1;
        if(testDistance < minDistance) {
          minDistance = testDistance;
        }
      }
    }

    // top
    testLine(bounds.minX(), bounds.minY(), bounds.maxX(), bounds.minY());
    // left
    testLine(bounds.minX(), bounds.minY(), bounds.minX(), bounds.maxY());
    if(countIntersections > 1) return minDistance;
    // bottom
    testLine(bounds.minX(), bounds.maxY(), bounds.maxX(), bounds.maxY());
    if(countIntersections > 1) return minDistance;
    // right
    testLine(bounds.maxX(), bounds.minY(), bounds.maxX(), bounds.maxY());
    // if no intersection, return -1
    if(countIntersections == 0) return -1;
    return minDistance;
  };
  Intersection.testIntersection = function(line, bounds, intersections) {
    var countIntersections = 0;

    function fillIntersection(ix, xa, ya, xb, yb) {
      intersections[ix] = Intersection.intersectLineLine(line, new Line(new Point(xa, ya), new Point(xb, yb)));
      if(intersections[ix].getState == Intersection.POINT) {
        countIntersections += 1;
      }
    }

    // top
    fillIntersection(0, bounds.minX(), bounds.minY(), bounds.maxX(), bounds.minY());
    // left
    fillIntersection(1, bounds.minX(), bounds.minY(), bounds.minX(), bounds.maxY());
    // bottom
    fillIntersection(2, bounds.minX(), bounds.maxY(), bounds.maxX(), bounds.maxY());
    // right
    fillIntersection(3, bounds.maxX(), bounds.minY(), bounds.maxX(), bounds.maxY());
    return countIntersections;
  };

  function MarchingSquares(contour, potentialArea, step, t) {
    var direction = MarchingSquares.S;
    var threshold = t;
    var marched = false;

    function updateDir(x, y, dir, res) {
      var v = potentialArea.get(x, y);
      if(isNaN(v)) return v;
      if(v > threshold) return dir + res;
      return dir;
    }

    function getState(x, y) {
      var dir = 0;
      dir = updateDir(x, y, dir, 1);
      dir = updateDir(x + 1, y, dir, 2);
      dir = updateDir(x, y + 1, dir, 4);
      dir = updateDir(x + 1, y + 1, dir, 8);
      if(isNaN(dir)) {
        console.warn("marched out of bounds: " + x + " " + y + " bounds: " + potentialArea.width() + " " + potentialArea.height());
        return -1;
      }
      return dir;
    }

    function doMarch(xpos, ypos) {
      var x = xpos;
      var y = ypos;
      for(;;) { // iterative version of end recursion
        var p = new Point(x * step, y * step);
        // check if we're back where we started
        if(contour.contains(p)) {
          if(!contour.isFirst(p)) {
            // encountered a loop but haven't returned to start; will change
            // direction using conditionals and continue back to start
          } else {
            return true;
          }
        } else {
          contour.add(p);
        }
        var state = getState(x, y);
        // x, y are upper left of 2X2 marching square
        switch(state) {
          case -1:
            return true; // Marched out of bounds
          case 0:
          case 3:
          case 2:
          case 7:
            direction = MarchingSquares.E;
            break;
          case 12:
          case 14:
          case 4:
            direction = MarchingSquares.W;
            break;
          case 6:
            direction = (direction == MarchingSquares.N) ? MarchingSquares.W : MarchingSquares.E;
            break;
          case 1:
          case 13:
          case 5:
            direction = MarchingSquares.N;
            break;
          case 9:
            direction = (direction == MarchingSquares.E) ? MarchingSquares.N : MarchingSquares.S;
            break;
          case 10:
          case 8:
          case 11:
            direction = MarchingSquares.S;
            break;
          default:
            console.warn("Marching squares invalid state: " + state);
            return true;
        }

        switch(direction) {
          case MarchingSquares.N:
            y -= 1; // up
            break;
          case MarchingSquares.S:
            y += 1; // down
            break;
          case MarchingSquares.W:
            x -= 1; // left
            break;
          case MarchingSquares.E:
            x += 1; // right
            break;
          default:
            console.warn("Marching squares invalid state: " + state);
            return true;
        }
      }
      console.warn("should not be reachable...");
      return true;
    }

    this.march = function() {
      for(var x = 0;x < potentialArea.width() && !marched;x += 1) {
        for(var y = 0;y < potentialArea.height() && !marched;y += 1) {
          if(potentialArea.get(x, y) > threshold && getState(x, y) != 15) {
            marched = doMarch(x, y);
          }
        }
      }
      return marched;
    };
  } // MarchingSquares
  MarchingSquares.N = 0;
  MarchingSquares.S = 1;
  MarchingSquares.E = 2;
  MarchingSquares.W = 3;

  var maxRoutingIterations = BubbleSet.DEFAULT_MAX_ROUTING_ITERATIONS;
  var maxMarchingIterations = BubbleSet.DEFAULT_MAX_MARCHING_ITERATIONS;
  var pixelGroup = BubbleSet.DEFAULT_PIXEL_GROUP;
  var edgeR0 = BubbleSet.DEFAULT_EDGE_R0;
  var edgeR1 = BubbleSet.DEFAULT_EDGE_R1;
  var nodeR0 = BubbleSet.DEFAULT_NODE_R0;
  var nodeR1 = BubbleSet.DEFAULT_NODE_R1;
  var morphBuffer = BubbleSet.DEFAULT_MORPH_BUFFER;
  var skip = BubbleSet.DEFAULT_SKIP;

  var threshold = 1;
  var nodeInfluenceFactor = 1;
  var edgeInfluenceFactor = 1;
  var negativeNodeInfluenceFactor = -0.8;
  var activeRegion = null;
  var virtualEdges = [];
  var potentialArea = null;

} // BubbleSet
BubbleSet.DEFAULT_MAX_ROUTING_ITERATIONS = 100;
BubbleSet.DEFAULT_MAX_MARCHING_ITERATIONS = 20;
BubbleSet.DEFAULT_PIXEL_GROUP = 4;
BubbleSet.DEFAULT_EDGE_R0 = 10;
BubbleSet.DEFAULT_EDGE_R1 = 20;
BubbleSet.DEFAULT_NODE_R0 = 15;
BubbleSet.DEFAULT_NODE_R1 = 50;
BubbleSet.DEFAULT_MORPH_BUFFER = BubbleSet.DEFAULT_NODE_R0;
BubbleSet.DEFAULT_SKIP = 8;
