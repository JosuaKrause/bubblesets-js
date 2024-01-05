/**
 * Copyright 2024 Josua Krause, Christopher Collins
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Originally created by Josua Krause on 2014-10-25.
 */

export class Rectangle {
  constructor(_rect) {
    this._x = 0;
    this._y = 0;
    this._width = 0;
    this._height = 0;
    this._centroidDistance = 0;
    if (_rect) {
      this.rect(_rect);
    }
  }

  rect(r) {
    if (!arguments.length)
      return {
        x: this.x,
        y: this.y,
        width: this.width,
        height: this.height,
      };
    this._x = +r.x;
    this._y = +r.y;
    this._width = +r.width;
    this._height = +r.height;
  }

  minX() {
    return this._x;
  }

  minY() {
    return this._y;
  }

  maxX() {
    return this._x + this._width;
  }

  maxY() {
    return this._y + this._height;
  }

  centerX() {
    return this._x + this._width * 0.5;
  }

  centerY() {
    return this._y + this._height * 0.5;
  }

  width() {
    return this._width;
  }

  height() {
    return this._height;
  }

  centroidDistance(cd) {
    if (!arguments.length) return this._centroidDistance;
    this._centroidDistance = cd;
  }

  cmp(rect) {
    if (this._centroidDistance < rect.centroidDistance()) return -1;
    if (this._centroidDistance > rect.centroidDistance()) return 0;
    return 0;
  }

  add(rect) {
    const tmpx = Math.min(this.minX(), rect.minX());
    const tmpy = Math.min(this.minY(), rect.minY());
    const maxX = Math.max(this.maxX(), rect.maxX());
    const maxY = Math.max(this.maxY(), rect.maxY());
    this._x = tmpx;
    this._y = tmpy;
    this._width = maxX - this._x;
    this._height = maxY - this._y;
  }

  contains(p) {
    const px = p.x();
    const py = p.y();
    return this.containsPt(px, py);
  }

  containsPt(px, py) {
    if (px < this._x || px >= this._x + this._width) return false;
    return !(py < this._y || py >= this._y + this._height);
  }

  intersects(rect) {
    if (
      this.width() <= 0 ||
      this.height() <= 0 ||
      rect.width() <= 0 ||
      rect.height() <= 0
    )
      return false;
    return (
      rect.maxX() > this.minX() &&
      rect.maxY() > this.minY() &&
      rect.minX() < this.maxX() &&
      rect.minY() < this.maxY()
    );
  }

  intersectsLine(line) {
    const x1 = line.x1();
    const y1 = line.y1();
    const x2 = line.x2();
    const y2 = line.y2();
    // taken from JDK 8 java.awt.geom.Rectangle2D.Double#intersectsLine(double, double, double, double)
    let out1;
    let out2;
    if ((out2 = this.outcode(x2, y2)) === 0) {
      return true;
    }
    while ((out1 = this.outcode(x1, y1)) !== 0) {
      if ((out1 & out2) !== 0) {
        return false;
      }
      if ((out1 & (Rectangle.OUT_LEFT | Rectangle.OUT_RIGHT)) !== 0) {
        let x = this.minX();
        if ((out1 & Rectangle.OUT_RIGHT) !== 0) {
          x += this.width();
        }
        y1 = y1 + ((x - x1) * (y2 - y1)) / (x2 - x1);
        x1 = x;
      } else {
        let y = this.minY();
        if ((out1 & Rectangle.OUT_BOTTOM) !== 0) {
          y += this.height();
        }
        x1 = x1 + ((y - y1) * (x2 - x1)) / (y2 - y1);
        y1 = y;
      }
    }
    return true;
  }

  outcode(px, py) {
    // taken from JDK 8 java.awt.geom.Rectangle2D.Double#outcode(double, double)
    let out = 0;
    if (this._width <= 0) {
      out |= Rectangle.OUT_LEFT | Rectangle.OUT_RIGHT;
    } else if (px < this._x) {
      out |= Rectangle.OUT_LEFT;
    } else if (px > this._x + this._width) {
      out |= Rectangle.OUT_RIGHT;
    }
    if (this._height <= 0) {
      out |= Rectangle.OUT_TOP | Rectangle.OUT_BOTTOM;
    } else if (py < this._y) {
      out |= Rectangle.OUT_TOP;
    } else if (py > this._y + this._height) {
      out |= Rectangle.OUT_BOTTOM;
    }
    return out;
  }

  toString() {
    return (
      'Rectangle[x=' +
      this.minX() +
      ', y=' +
      this.minY() +
      ', w=' +
      this.width() +
      ', h=' +
      this.height() +
      ']'
    );
  }

  static OUT_LEFT = 1;
  static OUT_TOP = 2;
  static OUT_RIGHT = 4;
  static OUT_BOTTOM = 8;
} // Rectangle

export class Point {
  constructor(ax, ay) {
    this._x = +ax;
    this._y = +ay;
  }

  x(_) {
    if (!arguments.length) return this._x;
    this._x = _;
  }

  y(_) {
    if (!arguments.length) return this._y;
    this._y = _;
  }

  distanceSq(p) {
    return Point.ptsDistanceSq(this._x, this._y, p.x(), p.y());
  }

  get() {
    return [this._x, this._y];
  }

  static ptsDistanceSq(x1, y1, x2, y2) {
    return (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
  }

  static doublePointsEqual(x1, y1, x2, y2, delta) {
    return Point.ptsDistanceSq(x1, y1, x2, y2) < delta * delta;
  }
} // Point

export class PointList {
  constructor(size) {
    this._size = size;
    this._els = 0;
    this._arr = [];
    this._arr.length = size; // pre-allocating
    this._set = {};
  }

  static hash(p) {
    return p.x() + 'x' + p.y();
  }

  add(p) {
    this._set[PointList.hash(p)] = p;
    this._arr[this._els] = p;
    this._els += 1;
  }

  contains(p) {
    const test = this._set[PointList.hash(p)];
    if (!test) return false;
    return test.x() === p.x() && test.y() === p.y();
  }

  isFirst(p) {
    if (!this._els) return false;
    const test = this._arr[0];
    return test.x() === p.x() && test.y() === p.y();
  }

  list() {
    return this._arr.filter((p) => p).map((p) => p.get());
  }

  clear() {
    for (let ix = 0; ix < this._arr.length; ix += 1) {
      this._arr[ix] = null; // nulling is cheaper than deleting or reallocating
    }
    this._set = {};
    this._els = 0;
  }

  get(ix) {
    return this._arr[ix];
  }

  size() {
    return this._els;
  }
} // PointList

export class Line {
  constructor(_x1, _y1, _x2, _y2) {
    this._x1 = +_x1;
    this._y1 = +_y1;
    this._x2 = +_x2;
    this._y2 = +_y2;
  }

  rect() {
    const minX = Math.min(this._x1, this._x2);
    const minY = Math.min(this._y1, this._y2);
    const maxX = Math.max(this._x1, this._x2);
    const maxY = Math.max(this._y1, this._y2);
    const res = new Rectangle({
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    });
    return res;
  }

  x1(_) {
    if (!arguments.length) return this._x1;
    this._x1 = _;
  }

  x2(_) {
    if (!arguments.length) return this._x2;
    this._x2 = _;
  }

  y1(_) {
    if (!arguments.length) return this._y1;
    this._y1 = _;
  }

  y2(_) {
    if (!arguments.length) return this._y2;
    this._y2 = _;
  }

  // whether an infinite line to positive x from the point p will cut through the line
  cuts(p) {
    if (this._y1 === this._y2) return false;
    const y = p.y();
    if ((y < this._y1 && y <= this._y2) || (y > this._y1 && y >= this._y2))
      return false;
    const x = p.x();
    if (x > this._x1 && x >= this._x2) return false;
    if (x < this._x1 && x <= this._x2) return true;
    const cross =
      this._x1 +
      ((y - this._y1) * (this._x2 - this._x1)) / (this._y2 - this._y1);
    return x <= cross;
  }

  ptSegDistSq(x, y) {
    return BubbleSet.linePtSegDistSq(
      this._x1,
      this._y1,
      this._x2,
      this._y2,
      x,
      y,
    );
  }

  ptClose(x, y, r) {
    // check whether the point is outside the bounding rectangle with padding r
    if (this._x1 < this._x2) {
      if (x < this._x1 - r || x > this._x2 + r) return false;
    } else {
      if (x < this._x2 - r || x > this._x1 + r) return false;
    }
    if (this._y1 < this._y2) {
      if (y < this._y1 - r || y > this._y2 + r) return false;
    } else {
      if (y < this._y2 - r || y > this._y1 + r) return false;
    }
    return true;
  }
} // Line

export class Area {
  constructor(width, height) {
    this._width = width;
    this._height = height;
    this._size = width * height;
    this._buff = new Float32Array(this._size);
  }

  bound(pos, isX) {
    if (pos < 0) return 0;
    return Math.min(pos, (isX ? this._width : this._height) - 1);
  }

  get(x, y) {
    if (x < 0 || x >= this._width || y < 0 || y >= this._height) {
      console.warn('Area.get out of bounds', x, y, this._width, this._height);
      return Number.NaN;
    }
    return this._buff[x + y * this._width];
  }

  set(x, y, v) {
    if (x < 0 || x >= this._width || y < 0 || y >= this._height) {
      console.warn('Area.set out of bounds', x, y, this._width, this._height);
      return;
    }
    this._buff[x + y * this._width] = v;
  }

  width() {
    return this._width;
  }

  height() {
    return this._height;
  }
} // Area

export class Intersection {
  constructor(p, s) {
    this._point = p;
    this._state = s;
  }

  getState() {
    return this._state;
  }

  getPoint() {
    return this._point;
  }

  static POINT = 1;
  static PARALLEL = 2;
  static COINCIDENT = 3;
  static NONE = 4;

  static intersectLineLine(la, lb) {
    const uaT =
      (lb.x2() - lb.x1()) * (la.y1() - lb.y1()) -
      (lb.y2() - lb.y1()) * (la.x1() - lb.x1());
    const ubT =
      (la.x2() - la.x1()) * (la.y1() - lb.y1()) -
      (la.y2() - la.y1()) * (la.x1() - lb.x1());
    const uB =
      (lb.y2() - lb.y1()) * (la.x2() - la.x1()) -
      (lb.x2() - lb.x1()) * (la.y2() - la.y1());
    if (uB) {
      const ua = uaT / uB;
      const ub = ubT / uB;
      if (0 <= ua && ua <= 1 && 0 <= ub && ub <= 1) {
        const p = new Point(
          la.x1() + ua * (la.x2() - la.x1()),
          la.y1() + ua * (la.y2() - la.y1()),
        );
        return new Intersection(p, Intersection.POINT);
      }
      return new Intersection(null, Intersection.NONE);
    }
    return new Intersection(
      null,
      uaT === 0 || ubT === 0 ? Intersection.COINCIDENT : Intersection.PARALLEL,
    );
  }

  static fractionAlongLineA(la, lb) {
    const uaT =
      (lb.x2() - lb.x1()) * (la.y1() - lb.y1()) -
      (lb.y2() - lb.y1()) * (la.x1() - lb.x1());
    const ubT =
      (la.x2() - la.x1()) * (la.y1() - lb.y1()) -
      (la.y2() - la.y1()) * (la.x1() - lb.x1());
    const uB =
      (lb.y2() - lb.y1()) * (la.x2() - la.x1()) -
      (lb.x2() - lb.x1()) * (la.y2() - la.y1());
    if (uB) {
      const ua = uaT / uB;
      const ub = ubT / uB;
      if (0 <= ua && ua <= 1 && 0 <= ub && ub <= 1) {
        return ua;
      }
    }
    return Number.POSITIVE_INFINITY;
  }

  // we can move them out here since there can't be any concurrency
  static INTERSECTION_PLINE = new Line(0.0, 0.0, 0.0, 0.0);

  static fractionToLineCenter(bounds, line) {
    let minDistance = Number.POSITIVE_INFINITY;
    let countIntersections = 0;

    const testLine = (xa, ya, xb, yb) => {
      Intersection.INTERSECTION_PLINE.x1(xa);
      Intersection.INTERSECTION_PLINE.y1(ya);
      Intersection.INTERSECTION_PLINE.x2(xb);
      Intersection.INTERSECTION_PLINE.y2(yb);
      let testDistance = Intersection.fractionAlongLineA(
        line,
        Intersection.INTERSECTION_PLINE,
      );
      testDistance = Math.abs(testDistance - 0.5);
      if (testDistance >= 0 && testDistance <= 1) {
        countIntersections += 1;
        if (testDistance < minDistance) {
          minDistance = testDistance;
        }
      }
    };

    // top
    testLine(bounds.minX(), bounds.minY(), bounds.maxX(), bounds.minY());
    // left
    testLine(bounds.minX(), bounds.minY(), bounds.minX(), bounds.maxY());
    if (countIntersections > 1) return minDistance;
    // bottom
    testLine(bounds.minX(), bounds.maxY(), bounds.maxX(), bounds.maxY());
    if (countIntersections > 1) return minDistance;
    // right
    testLine(bounds.maxX(), bounds.minY(), bounds.maxX(), bounds.maxY());
    // if no intersection, return -1
    if (countIntersections === 0) return -1;
    return minDistance;
  }

  static fractionToLineEnd(bounds, line) {
    let minDistance = Number.POSITIVE_INFINITY;
    let countIntersections = 0;

    const testLine = (xa, ya, xb, yb) => {
      const testDistance = Intersection.fractionAlongLineA(
        line,
        new Line(xa, ya, xb, yb),
      );
      if (testDistance >= 0 && testDistance <= 1) {
        countIntersections += 1;
        if (testDistance < minDistance) {
          minDistance = testDistance;
        }
      }
    };

    // top
    testLine(bounds.minX(), bounds.minY(), bounds.maxX(), bounds.minY());
    // left
    testLine(bounds.minX(), bounds.minY(), bounds.minX(), bounds.maxY());
    if (countIntersections > 1) return minDistance;
    // bottom
    testLine(bounds.minX(), bounds.maxY(), bounds.maxX(), bounds.maxY());
    if (countIntersections > 1) return minDistance;
    // right
    testLine(bounds.maxX(), bounds.minY(), bounds.maxX(), bounds.maxY());
    // if no intersection, return -1
    if (countIntersections === 0) return -1;
    return minDistance;
  }

  static testIntersection(line, bounds, intersections) {
    let countIntersections = 0;

    const fillIntersection = (ix, xa, ya, xb, yb) => {
      intersections[ix] = Intersection.intersectLineLine(
        line,
        new Line(xa, ya, xb, yb),
      );
      if (intersections[ix].getState() === Intersection.POINT) {
        countIntersections += 1;
      }
    };

    // top
    fillIntersection(
      0,
      bounds.minX(),
      bounds.minY(),
      bounds.maxX(),
      bounds.minY(),
    );
    // left
    fillIntersection(
      1,
      bounds.minX(),
      bounds.minY(),
      bounds.minX(),
      bounds.maxY(),
    );
    // bottom
    fillIntersection(
      2,
      bounds.minX(),
      bounds.maxY(),
      bounds.maxX(),
      bounds.maxY(),
    );
    // right
    fillIntersection(
      3,
      bounds.maxX(),
      bounds.minY(),
      bounds.maxX(),
      bounds.maxY(),
    );
    return countIntersections;
  }
} // Intersection

export class MarchingSquares {
  constructor(contour, potentialArea, step, t) {
    this._contour = contour;
    this._potentialArea = potentialArea;
    this._step = step;
    this._threshold = t;
    this._direction = MarchingSquares.S;
    this._marched = false;
  }

  updateDir(x, y, dir, res) {
    const v = this._potentialArea.get(x, y);
    if (isNaN(v)) return v;
    if (v > this._threshold) return dir + res;
    return dir;
  }

  getState(x, y) {
    let dir = 0;
    dir = this.updateDir(x, y, dir, 1);
    dir = this.updateDir(x + 1, y, dir, 2);
    dir = this.updateDir(x, y + 1, dir, 4);
    dir = this.updateDir(x + 1, y + 1, dir, 8);
    if (isNaN(dir)) {
      console.warn(
        'marched out of bounds: ' +
          x +
          ' ' +
          y +
          ' bounds: ' +
          this._potentialArea.width() +
          ' ' +
          this._potentialArea.height(),
      );
      return -1;
    }
    return dir;
  }

  doMarch(xpos, ypos) {
    let x = xpos;
    let y = ypos;
    for (;;) {
      // iterative version of end recursion
      const p = new Point(x * this._step, y * this._step);
      // check if we're back where we started
      if (this._contour.contains(p)) {
        if (!this._contour.isFirst(p)) {
          // encountered a loop but haven't returned to start; will change
          // direction using conditionals and continue back to start
        } else {
          return true;
        }
      } else {
        this._contour.add(p);
      }
      const state = this.getState(x, y);
      // x, y are upper left of 2X2 marching square
      switch (state) {
        case -1:
          return true; // Marched out of bounds
        case 0:
        case 3:
        case 2:
        case 7:
          this._direction = MarchingSquares.E;
          break;
        case 12:
        case 14:
        case 4:
          this._direction = MarchingSquares.W;
          break;
        case 6:
          this._direction =
            this._direction === MarchingSquares.N
              ? MarchingSquares.W
              : MarchingSquares.E;
          break;
        case 1:
        case 13:
        case 5:
          this._direction = MarchingSquares.N;
          break;
        case 9:
          this._direction =
            this._direction === MarchingSquares.E
              ? MarchingSquares.N
              : MarchingSquares.S;
          break;
        case 10:
        case 8:
        case 11:
          this._direction = MarchingSquares.S;
          break;
        default:
          console.warn('Marching squares invalid state: ' + state);
          return true;
      }

      switch (this._direction) {
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
          console.warn('Marching squares invalid state: ' + state);
          return true;
      }
    }
  }

  march() {
    for (
      let x = 0;
      x < this._potentialArea.width() && !this._marched;
      x += 1
    ) {
      for (
        let y = 0;
        y < this._potentialArea.height() && !this._marched;
        y += 1
      ) {
        if (
          this._potentialArea.get(x, y) > this._threshold &&
          this.getState(x, y) != 15
        ) {
          this._marched = this.doMarch(x, y);
        }
      }
    }
    return this._marched;
  }
  static N = 0;
  static S = 1;
  static E = 2;
  static W = 3;
} // MarchingSquares

export class BubbleSet {
  constructor() {
    this._maxRoutingIterations = BubbleSet.DEFAULT_MAX_ROUTING_ITERATIONS;
    this._maxMarchingIterations = BubbleSet.DEFAULT_MAX_MARCHING_ITERATIONS;
    this._pixelGroup = BubbleSet.DEFAULT_PIXEL_GROUP;
    this._edgeR0 = BubbleSet.DEFAULT_EDGE_R0;
    this._edgeR1 = BubbleSet.DEFAULT_EDGE_R1;
    this._nodeR0 = BubbleSet.DEFAULT_NODE_R0;
    this._nodeR1 = BubbleSet.DEFAULT_NODE_R1;
    this._morphBuffer = BubbleSet.DEFAULT_MORPH_BUFFER;
    this._skip = BubbleSet.DEFAULT_SKIP;

    this._threshold = 1;
    this._nodeInfluenceFactor = 1;
    this._edgeInfluenceFactor = 1;
    this._negativeNodeInfluenceFactor = -0.8;
    this._activeRegion = null;
    this._virtualEdges = [];
    this._potentialArea = null;

    this._lastThreshold = Number.NaN;
    this._debug = false;
  }

  maxRoutingIterations(_) {
    if (!arguments.length) return this._maxRoutingIterations;
    this._maxRoutingIterations = _;
  }

  maxMarchingIterations(_) {
    if (!arguments.length) return this._maxMarchingIterations;
    this._maxMarchingIterations = _;
  }

  pixelGroup(_) {
    if (!arguments.length) return this._pixelGroup;
    this._pixelGroup = _;
  }

  edgeR0(_) {
    if (!arguments.length) return this._edgeR0;
    this._edgeR0 = _;
  }

  edgeR1(_) {
    if (!arguments.length) return this._edgeR1;
    this._edgeR1 = _;
  }

  nodeR0(_) {
    if (!arguments.length) return this._nodeR0;
    this._nodeR0 = _;
  }

  nodeR1(_) {
    if (!arguments.length) return this._nodeR1;
    this._nodeR1 = _;
  }

  morphBuffer(_) {
    if (!arguments.length) return this._morphBuffer;
    this._morphBuffer = _;
  }

  skip(_) {
    if (!arguments.length) return this._skip;
    this._skip = _;
  }

  createOutline(members, nonmem, edges) {
    if (!members.length) return [];

    const memberItems = members.map((m) => {
      return new Rectangle(m);
    });
    const nonMembers = nonmem.map((m) => {
      return new Rectangle(m);
    });

    // calculate and store virtual edges
    this.calculateVirtualEdges(memberItems, nonMembers);

    if (edges) {
      edges.forEach((e) => {
        this._virtualEdges.push(new Line(e.x1, e.y1, e.x2, e.y2));
      });
    }

    this._activeRegion = null;
    memberItems.forEach((m) => {
      if (!this._activeRegion) {
        this._activeRegion = new Rectangle(m.rect());
      } else {
        this._activeRegion.add(m);
      }
    });

    this._virtualEdges.forEach((l) => {
      this._activeRegion.add(l.rect());
    });

    this._activeRegion.rect({
      x:
        this._activeRegion.minX() -
        Math.max(this._edgeR1, this._nodeR1) -
        this._morphBuffer,
      y:
        this._activeRegion.minY() -
        Math.max(this._edgeR1, this._nodeR1) -
        this._morphBuffer,
      width:
        this._activeRegion.width() +
        2 * Math.max(this._edgeR1, this._nodeR1) +
        2 * this._morphBuffer,
      height:
        this._activeRegion.height() +
        2 * Math.max(this._edgeR1, this._nodeR1) +
        2 * this._morphBuffer,
    });

    this._potentialArea = new Area(
      Math.ceil(this._activeRegion.width() / this._pixelGroup),
      Math.ceil(this._activeRegion.height() / this._pixelGroup),
    );

    const estLength =
      (Math.floor(this._activeRegion.width()) +
        Math.floor(this._activeRegion.height())) *
      2;
    const surface = new PointList(estLength);

    const tempThreshold = this._threshold;
    const tempNegativeNodeInfluenceFactor = this._negativeNodeInfluenceFactor;
    const tempNodeInfluenceFactor = this._nodeInfluenceFactor;
    const tempEdgeInfluenceFactor = this._edgeInfluenceFactor;

    let iterations = 0;

    // add the aggregate and all it's members and virtual edges
    this.fillPotentialArea(
      this._activeRegion,
      memberItems,
      nonMembers,
      this._potentialArea,
    );

    // try to march, check if surface contains all items
    while (
      !this.calculateContour(
        surface,
        this._activeRegion,
        memberItems,
        nonMembers,
        this._potentialArea,
      ) &&
      iterations < this._maxMarchingIterations
    ) {
      surface.clear();
      iterations += 1;

      // reduce negative influences first; this will allow the surface to
      // pass without making it fatter all around (which raising the threshold does)
      if (iterations <= this._maxMarchingIterations * 0.5) {
        if (this._negativeNodeInfluenceFactor != 0) {
          this._threshold *= 0.95;
          this._negativeNodeInfluenceFactor *= 0.8;
          this.fillPotentialArea(
            this._activeRegion,
            memberItems,
            nonMembers,
            this._potentialArea,
          );
        }
      }

      // after half the iterations, start increasing positive energy and lowering the threshold
      if (iterations > this._maxMarchingIterations * 0.5) {
        this._threshold *= 0.95;
        this._nodeInfluenceFactor *= 1.2;
        this._edgeInfluenceFactor *= 1.2;
        this.fillPotentialArea(
          this._activeRegion,
          memberItems,
          nonMembers,
          this._potentialArea,
        );
      }
    }

    this._lastThreshold = this._threshold;
    this._threshold = tempThreshold;
    this._negativeNodeInfluenceFactor = tempNegativeNodeInfluenceFactor;
    this._nodeInfluenceFactor = tempNodeInfluenceFactor;
    this._edgeInfluenceFactor = tempEdgeInfluenceFactor;

    // start with global SKIP value, but decrease skip amount if there aren't enough points in the surface
    let thisSkip = this._skip;
    // prepare viz attribute array
    let size = surface.size();

    if (thisSkip > 1) {
      size = Math.floor(surface.size() / thisSkip);
      // if we reduced too much (fewer than three points in reduced surface) reduce skip and try again
      while (size < 3 && thisSkip > 1) {
        thisSkip -= 1;
        size = Math.floor(surface.size() / thisSkip);
      }
    }

    // add the offset of the active area to the coordinates
    const xcorner = this._activeRegion.minX();
    const ycorner = this._activeRegion.minY();

    const fhull = new PointList(size);
    // copy hull values
    for (let i = 0, j = 0; j < size; j += 1, i += thisSkip) {
      fhull.add(
        new Point(surface.get(i).x() + xcorner, surface.get(i).y() + ycorner),
      );
    }

    if (!this._debug) {
      // getting rid of unused memory preventing a memory leak
      this._activeRegion = null;
      this._potentialArea = null;
    }

    return fhull.list();
  }

  debug(_) {
    if (!arguments.length) return this._debug;
    this._debug = !!_;
  }

  // call after createOutline
  debugPotentialArea() {
    this._debug || console.warn('debug mode should be activated');
    const rects = [];
    for (let x = 0; x < this._potentialArea.width(); x += 1) {
      for (let y = 0; y < this._potentialArea.height(); y += 1) {
        rects.push({
          x: x * this._pixelGroup + Math.floor(this._activeRegion.minX()),
          y: y * this._pixelGroup + Math.floor(this._activeRegion.minY()),
          width: this._pixelGroup,
          height: this._pixelGroup,
          value: this._potentialArea.get(x, y),
          threshold: this._lastThreshold,
        });
      }
    }
    return rects;
  }

  calculateContour(contour, bounds, members, nonMembers, potentialArea) {
    // if no surface could be found stop
    if (
      !new MarchingSquares(
        contour,
        potentialArea,
        this._pixelGroup,
        this._threshold,
      ).march()
    )
      return false;
    return this.testContainment(contour, bounds, members, nonMembers)[0];
  }

  testContainment(contour, bounds, members, nonMembers) {
    // precise bounds checking
    // copy hull values
    const g = [];
    let gbounds = null;

    const contains = (g, p) => {
      let line = null;
      let first = null;
      let crossings = 0;
      g.forEach((cur) => {
        if (!line) {
          line = new Line(cur.x(), cur.y(), cur.x(), cur.y());
          first = cur;
          return;
        }
        line.x1(line.x2());
        line.y1(line.y2());
        line.x2(cur.x());
        line.y2(cur.y());
        if (line.cuts(p)) {
          crossings += 1;
        }
      });
      if (first) {
        line.x1(line.x2());
        line.y1(line.y2());
        line.x2(first.x());
        line.y2(first.y());
        if (line.cuts(p)) {
          crossings += 1;
        }
      }
      return crossings % 2 === 1;
    };

    // start with global SKIP value, but decrease skip amount if there
    // aren't enough points in the surface
    let thisSkip = this._skip;
    // prepare viz attribute array
    let size = contour.size();
    if (thisSkip > 1) {
      size = contour.size() / thisSkip;
      // if we reduced too much (fewer than three points in reduced surface) reduce skip and try again
      while (size < 3 && thisSkip > 1) {
        thisSkip--;
        size = contour.size() / thisSkip;
      }
    }

    const xcorner = bounds.minX();
    const ycorner = bounds.minY();

    // simulate the surface we will eventually draw, using straight segments (approximate, but fast)
    for (let i = 0; i < size - 1; i += 1) {
      const px = contour.get(i * thisSkip).x() + xcorner;
      const py = contour.get(i * thisSkip).y() + ycorner;
      const r = {
        x: px,
        y: py,
        width: 0,
        height: 0,
      };
      if (!gbounds) {
        gbounds = new Rectangle(r);
      } else {
        gbounds.add(new Rectangle(r));
      }
      g.push(new Point(px, py));
    }

    let containsAll = true;
    let containsExtra = false;
    if (gbounds) {
      members.forEach((item) => {
        const p = new Point(item.centerX(), item.centerY());
        // check rough bounds
        containsAll = containsAll && gbounds.contains(p);
        // check precise bounds if rough passes
        containsAll = containsAll && contains(g, p);
      });
      nonMembers.forEach((item) => {
        const p = new Point(item.centerX(), item.centerY());
        // check rough bounds
        if (gbounds.contains(p)) {
          // check precise bounds if rough passes
          if (contains(g, p)) {
            containsExtra = true;
          }
        }
      });
    }
    return [containsAll, containsExtra];
  }

  fillPotentialArea(activeArea, members, nonMembers, potentialArea) {
    let influenceFactor = 0;
    // add all positive energy (included items) first, as negative energy
    // (morphing) requires all positives to be already set
    if (this._nodeInfluenceFactor) {
      members.forEach((item) => {
        // add node energy
        influenceFactor = this._nodeInfluenceFactor;
        const nodeRDiff = this._nodeR0 - this._nodeR1;
        // using inverse a for numerical stability
        const inva = nodeRDiff * nodeRDiff;
        this.calculateRectangleInfluence(
          potentialArea,
          influenceFactor / inva,
          this._nodeR1,
          item,
        );
      }); // end processing node items of this aggregate
    } // end processing positive node energy

    if (this._edgeInfluenceFactor) {
      // add the influence of all the virtual edges
      influenceFactor = this._edgeInfluenceFactor;
      const inva =
        (this._edgeR0 - this._edgeR1) * (this._edgeR0 - this._edgeR1);

      if (this._virtualEdges.length > 0) {
        this.calculateLinesInfluence(
          potentialArea,
          influenceFactor / inva,
          this._edgeR1,
          this._virtualEdges,
          activeArea,
        );
      }
    }

    // calculate negative energy contribution for all other visible items within bounds
    if (this._negativeNodeInfluenceFactor) {
      nonMembers.forEach((item) => {
        // if item is within influence bounds, add potential
        if (activeArea.intersects(item)) {
          // subtract influence
          influenceFactor = this._negativeNodeInfluenceFactor;
          const nodeRDiff = this._nodeR0 - this._nodeR1;
          // using inverse a for numerical stability
          const inva = nodeRDiff * nodeRDiff;
          this.calculateRectangleNegativeInfluence(
            potentialArea,
            influenceFactor / inva,
            this._nodeR1,
            item,
          );
        }
      });
    }
  }

  calculateCentroidDistances(items) {
    let totalx = 0;
    let totaly = 0;
    let nodeCount = 0;
    items.forEach((item) => {
      totalx += item.centerX();
      totaly += item.centerY();
      nodeCount += 1;
    });
    totalx /= nodeCount;
    totaly /= nodeCount;
    items.forEach((item) => {
      const diffX = totalx - item.centerX();
      const diffY = totaly - item.centerY();
      item.centroidDistance(Math.sqrt(diffX * diffX + diffY * diffY));
    });
  }

  calculateVirtualEdges(items, nonMembers) {
    const visited = [];
    this._virtualEdges = [];
    this.calculateCentroidDistances(items);
    items.sort((a, b) => {
      return a.cmp(b);
    });

    items.forEach((item) => {
      const lines = this.connectItem(nonMembers, item, visited);
      lines.forEach((l) => {
        this._virtualEdges.push(l);
      });
      visited.push(item);
    });
  }

  connectItem(nonMembers, item, visited) {
    const scannedLines = [];
    const linesToCheck = [];

    const itemCenter = new Point(item.centerX(), item.centerY());
    let closestNeighbour = null;
    let minLengthSq = Number.POSITIVE_INFINITY;
    // discover the nearest neighbour with minimal interference items
    visited.forEach((neighbourItem) => {
      const nCenter = new Point(
        neighbourItem.centerX(),
        neighbourItem.centerY(),
      );
      const distanceSq = itemCenter.distanceSq(nCenter);

      const completeLine = new Line(
        itemCenter.x(),
        itemCenter.y(),
        nCenter.x(),
        nCenter.y(),
      );
      // augment distance by number of interfering items
      const numberInterferenceItems = this.countInterferenceItems(
        nonMembers,
        completeLine,
      );

      // TODO is there a better function to consider interference in nearest-neighbour checking? This is hacky
      if (
        distanceSq *
          (numberInterferenceItems + 1) *
          (numberInterferenceItems + 1) <
        minLengthSq
      ) {
        closestNeighbour = neighbourItem;
        minLengthSq =
          distanceSq *
          (numberInterferenceItems + 1) *
          (numberInterferenceItems + 1);
      }
    });

    // if there is a visited closest neighbour, add straight line between
    // them to the positive energy to ensure connected clusters
    if (closestNeighbour) {
      const completeLine = new Line(
        itemCenter.x(),
        itemCenter.y(),
        closestNeighbour.centerX(),
        closestNeighbour.centerY(),
      );
      // route the edge around intersecting nodes not in set
      linesToCheck.push(completeLine);

      let hasIntersection = true;
      let iterations = 0;
      const intersections = [];
      intersections.length = 4;
      let numIntersections = 0;
      while (hasIntersection && iterations < this._maxRoutingIterations) {
        hasIntersection = false;
        while (!hasIntersection && linesToCheck.length) {
          const line = linesToCheck.pop();
          // resolve intersections in order along edge
          const closestItem = this.getCenterItem(nonMembers, line);

          if (closestItem) {
            numIntersections = Intersection.testIntersection(
              line,
              closestItem,
              intersections,
            );
            // 2 intersections = line passes through item
            if (numIntersections === 2) {
              const tempMorphBuffer = this._morphBuffer;
              const movePoint = this.rerouteLine(
                closestItem,
                tempMorphBuffer,
                intersections,
                true,
              );
              // test the movePoint already exists
              const foundFirst =
                this.pointExists(movePoint, linesToCheck) ||
                this.pointExists(movePoint, scannedLines);
              const pointInside = this.isPointInsideNonMember(
                movePoint,
                nonMembers,
              );
              // prefer first corner, even if buffer becomes very small
              while (!foundFirst && pointInside && tempMorphBuffer >= 1) {
                // try a smaller buffer
                tempMorphBuffer /= 1.5;
                movePoint = this.rerouteLine(
                  closestItem,
                  tempMorphBuffer,
                  intersections,
                  true,
                );
                foundFirst =
                  this.pointExists(movePoint, linesToCheck) ||
                  this.pointExists(movePoint, scannedLines);
                pointInside = this.isPointInsideNonMember(
                  movePoint,
                  nonMembers,
                );
              }

              if (movePoint && !foundFirst && !pointInside) {
                // add 2 rerouted lines to check
                linesToCheck.push(
                  new Line(line.x1(), line.y1(), movePoint.x(), movePoint.y()),
                );
                linesToCheck.push(
                  new Line(movePoint.x(), movePoint.y(), line.x2(), line.y2()),
                );
                // indicate intersection found
                hasIntersection = true;
              }

              // if we didn't find a valid point around the
              // first corner, try the second
              if (!hasIntersection) {
                tempMorphBuffer = this._morphBuffer;
                movePoint = this.rerouteLine(
                  closestItem,
                  tempMorphBuffer,
                  intersections,
                  false,
                );
                const foundSecond =
                  this.pointExists(movePoint, linesToCheck) ||
                  this.pointExists(movePoint, scannedLines);
                pointInside = this.isPointInsideNonMember(
                  movePoint,
                  nonMembers,
                );
                // if both corners have been used, stop; otherwise gradually reduce buffer and try second corner
                while (!foundSecond && pointInside && tempMorphBuffer >= 1) {
                  // try a smaller buffer
                  tempMorphBuffer /= 1.5;
                  movePoint = this.rerouteLine(
                    closestItem,
                    tempMorphBuffer,
                    intersections,
                    false,
                  );
                  foundSecond =
                    this.pointExists(movePoint, linesToCheck) ||
                    this.pointExists(movePoint, scannedLines);
                  pointInside = this.isPointInsideNonMember(
                    movePoint,
                    nonMembers,
                  );
                }

                if (movePoint && !foundSecond) {
                  // add 2 rerouted lines to check
                  linesToCheck.push(
                    new Line(
                      line.x1(),
                      line.y1(),
                      movePoint.x(),
                      movePoint.y(),
                    ),
                  );
                  linesToCheck.push(
                    new Line(
                      movePoint.x(),
                      movePoint.y(),
                      line.x2(),
                      line.y2(),
                    ),
                  );
                  // indicate intersection found
                  hasIntersection = true;
                }
              }
            }
          } // end check of closest item

          // no intersection found, mark this line as completed
          if (!hasIntersection) {
            scannedLines.push(line);
          }
          iterations += 1;
        } // end inner loop - out of lines or found an intersection
      } // end outer loop - no more intersections or out of iterations

      // finalize any that were not rerouted (due to running out of
      // iterations) or if we aren't morphing
      while (linesToCheck.length) {
        scannedLines.push(linesToCheck.pop());
      }

      // try to merge consecutive lines if possible
      while (scannedLines.length) {
        const line1 = scannedLines.pop();
        if (scannedLines.length) {
          const line2 = scannedLines.pop();
          const mergeLine = new Line(
            line1.x1(),
            line1.y1(),
            line2.x2(),
            line2.y2(),
          );
          // resolve intersections in order along edge
          const closestItem = this.getCenterItem(nonMembers, mergeLine);
          // merge most recent line and previous line
          if (!closestItem) {
            scannedLines.push(mergeLine);
          } else {
            linesToCheck.push(line1);
            scannedLines.push(line2);
          }
        } else {
          linesToCheck.push(line1);
        }
      }
      scannedLines = linesToCheck;
    }
    return scannedLines;
  }

  isPointInsideNonMember(point, nonMembers) {
    return nonMembers.some((testRectangle) => {
      return testRectangle.contains(point);
    });
  }

  pointExists(pointToCheck, lines) {
    let found = false;
    lines.forEach((checkEndPointsLine) => {
      if (found) return;
      if (
        Point.doublePointsEqual(
          checkEndPointsLine.x1(),
          checkEndPointsLine.y1(),
          pointToCheck.x(),
          pointToCheck.y(),
          1e-3,
        )
      ) {
        found = true;
      }
      if (
        Point.doublePointsEqual(
          checkEndPointsLine.x2(),
          checkEndPointsLine.y2(),
          pointToCheck.x(),
          pointToCheck.y(),
          1e-3,
        )
      ) {
        found = true;
      }
    });
    return found;
  }

  getCenterItem(items, testLine) {
    let minDistance = Number.POSITIVE_INFINITY;
    let closestItem = null;

    items.forEach((interferenceItem) => {
      if (interferenceItem.intersectsLine(testLine)) {
        const distance = Intersection.fractionToLineCenter(
          interferenceItem,
          testLine,
        );
        // find closest intersection
        if (distance >= 0 && distance < minDistance) {
          closestItem = interferenceItem;
          minDistance = distance;
        }
      }
    });
    return closestItem;
  }

  countInterferenceItems(interferenceItems, testLine) {
    return interferenceItems.reduce((count, interferenceItem) => {
      if (interferenceItem.intersectsLine(testLine)) {
        if (
          Intersection.fractionToLineCenter(interferenceItem, testLine) >= 0
        ) {
          return count + 1;
        }
      }
      return count;
    }, 0);
  }

  calculateLinesInfluence(
    potentialArea,
    influenceFactor,
    r1,
    lines,
    activeRegion,
  ) {
    lines.forEach((line) => {
      const lr = line.rect();
      // only traverse the plausible area
      const startX = potentialArea.bound(
        Math.floor((lr.minX() - r1 - activeRegion.minX()) / this._pixelGroup),
        true,
      );
      const startY = potentialArea.bound(
        Math.floor((lr.minY() - r1 - activeRegion.minY()) / this._pixelGroup),
        false,
      );
      const endX = potentialArea.bound(
        Math.ceil((lr.maxX() + r1 - activeRegion.minX()) / this._pixelGroup),
        true,
      );
      const endY = potentialArea.bound(
        Math.ceil((lr.maxY() + r1 - activeRegion.minY()) / this._pixelGroup),
        false,
      );
      // for every point in active part of potentialArea, calculate distance to nearest point on line and add influence
      for (let y = startY; y < endY; y += 1) {
        for (let x = startX; x < endX; x += 1) {
          // if we are adding negative energy, skip if not already
          // positive; positives have already been added first, and adding
          // negative to <=0 will have no affect on surface
          if (influenceFactor < 0 && potentialArea.get(x, y) <= 0) {
            continue;
          }
          // convert back to screen coordinates
          const tempX = x * this._pixelGroup + activeRegion.minX();
          const tempY = y * this._pixelGroup + activeRegion.minY();
          const minDistanceSq = line.ptSegDistSq(tempX, tempY);
          // only influence if less than r1
          if (minDistanceSq < r1 * r1) {
            const mdr = Math.sqrt(minDistanceSq) - r1;
            potentialArea.set(
              x,
              y,
              potentialArea.get(x, y) + influenceFactor * mdr * mdr,
            );
          }
        }
      }
    });
  }

  getRectDistSq(rect, tempX, tempY) {
    // test current point to see if it is inside rectangle
    if (!rect.containsPt(tempX, tempY)) {
      // which edge of rectangle is closest
      const outcode = rect.outcode(tempX, tempY);
      // top
      if ((outcode & Rectangle.OUT_TOP) === Rectangle.OUT_TOP) {
        // and left
        if ((outcode & Rectangle.OUT_LEFT) === Rectangle.OUT_LEFT) {
          // linear distance from upper left corner
          return Point.ptsDistanceSq(tempX, tempY, rect.minX(), rect.minY());
        } else {
          // and right
          if ((outcode & Rectangle.OUT_RIGHT) === Rectangle.OUT_RIGHT) {
            // linear distance from upper right corner
            return Point.ptsDistanceSq(tempX, tempY, rect.maxX(), rect.minY());
          } else {
            // distance from top line segment
            return (rect.minY() - tempY) * (rect.minY() - tempY);
          }
        }
      } else {
        // bottom
        if ((outcode & Rectangle.OUT_BOTTOM) === Rectangle.OUT_BOTTOM) {
          // and left
          if ((outcode & Rectangle.OUT_LEFT) === Rectangle.OUT_LEFT) {
            // linear distance from lower left corner
            return Point.ptsDistanceSq(tempX, tempY, rect.minX(), rect.maxY());
          } else {
            // and right
            if ((outcode & Rectangle.OUT_RIGHT) === Rectangle.OUT_RIGHT) {
              // linear distance from lower right corner
              return Point.ptsDistanceSq(
                tempX,
                tempY,
                rect.maxX(),
                rect.maxY(),
              );
            } else {
              // distance from bottom line segment
              return (tempY - rect.maxY()) * (tempY - rect.maxY());
            }
          }
        } else {
          // left only
          if ((outcode & Rectangle.OUT_LEFT) === Rectangle.OUT_LEFT) {
            // linear distance from left edge
            return (rect.minX() - tempX) * (rect.minX() - tempX);
          } else {
            // right only
            if ((outcode & Rectangle.OUT_RIGHT) === Rectangle.OUT_RIGHT) {
              // linear distance from right edge
              return (tempX - rect.maxX()) * (tempX - rect.maxX());
            }
          }
        }
      }
    }
    return 0;
  }

  calculateRectangleInfluence(potentialArea, influenceFactor, r1, rect) {
    influenceFactor < 0 &&
      console.warn('expected positive influence', influenceFactor);
    // find the affected subregion of potentialArea
    const startX = potentialArea.bound(
      Math.floor(
        (rect.minX() - r1 - this._activeRegion.minX()) / this._pixelGroup,
      ),
      true,
    );
    const startY = potentialArea.bound(
      Math.floor(
        (rect.minY() - r1 - this._activeRegion.minY()) / this._pixelGroup,
      ),
      false,
    );
    const endX = potentialArea.bound(
      Math.ceil(
        (rect.maxX() + r1 - this._activeRegion.minX()) / this._pixelGroup,
      ),
      true,
    );
    const endY = potentialArea.bound(
      Math.ceil(
        (rect.maxY() + r1 - this._activeRegion.minY()) / this._pixelGroup,
      ),
      false,
    );
    // for every point in active subregion of potentialArea, calculate
    // distance to nearest point on rectangle and add influence
    for (let y = startY; y < endY; y += 1) {
      for (let x = startX; x < endX; x += 1) {
        // convert back to screen coordinates
        const tempX = x * this._pixelGroup + this._activeRegion.minX();
        const tempY = y * this._pixelGroup + this._activeRegion.minY();
        const distanceSq = this.getRectDistSq(rect, tempX, tempY);
        // only influence if less than r1
        if (distanceSq < r1 * r1) {
          const dr = Math.sqrt(distanceSq) - r1;
          potentialArea.set(
            x,
            y,
            potentialArea.get(x, y) + influenceFactor * dr * dr,
          );
        }
      }
    }
  }

  calculateRectangleNegativeInfluence(
    potentialArea,
    influenceFactor,
    r1,
    rect,
  ) {
    influenceFactor > 0 &&
      console.warn('expected negative influence', influenceFactor);
    // find the affected subregion of potentialArea
    const startX = potentialArea.bound(
      Math.floor(
        (rect.minX() - r1 - this._activeRegion.minX()) / this._pixelGroup,
      ),
      true,
    );
    const startY = potentialArea.bound(
      Math.floor(
        (rect.minY() - r1 - this._activeRegion.minY()) / this._pixelGroup,
      ),
      false,
    );
    const endX = potentialArea.bound(
      Math.ceil(
        (rect.maxX() + r1 - this._activeRegion.minX()) / this._pixelGroup,
      ),
      true,
    );
    const endY = potentialArea.bound(
      Math.ceil(
        (rect.maxY() + r1 - this._activeRegion.minY()) / this._pixelGroup,
      ),
      false,
    );
    // for every point in active subregion of potentialArea, calculate
    // distance to nearest point on rectangle and add influence
    for (let y = startY; y < endY; y += 1) {
      for (let x = startX; x < endX; x += 1) {
        // skip if not already positive; positives have already been added first, and adding
        // negative to <= 0 will have no affect on surface
        if (potentialArea.get(x, y) <= 0) {
          continue;
        }
        // convert back to screen coordinates
        const tempX = x * this._pixelGroup + this._activeRegion.minX();
        const tempY = y * this._pixelGroup + this._activeRegion.minY();
        const distanceSq = this.getRectDistSq(rect, tempX, tempY);
        // only influence if less than r1
        if (distanceSq < r1 * r1) {
          const dr = Math.sqrt(distanceSq) - r1;
          potentialArea.set(
            x,
            y,
            potentialArea.get(x, y) + influenceFactor * dr * dr,
          );
        }
      }
    }
  }

  rerouteLine(rectangle, rerouteBuffer, intersections, wrapNormal) {
    const topIntersect = intersections[0];
    const leftIntersect = intersections[1];
    const bottomIntersect = intersections[2];
    const rightIntersect = intersections[3];

    // wrap around the most efficient way
    if (wrapNormal) {
      // left side
      if (leftIntersect.getState() === Intersection.POINT) {
        if (topIntersect.getState() === Intersection.POINT)
          // triangle, must go around top left
          return new Point(
            rectangle.minX() - rerouteBuffer,
            rectangle.minY() - rerouteBuffer,
          );
        if (bottomIntersect.getState() === Intersection.POINT)
          // triangle, must go around bottom left
          return new Point(
            rectangle.minX() - rerouteBuffer,
            rectangle.maxY() + rerouteBuffer,
          );
        // else through left to right, calculate areas
        const totalArea = rectangle.height() * rectangle.width();
        // top area
        const topArea =
          rectangle.width() *
          ((leftIntersect.getPoint().y() -
            rectangle.minY() +
            (rightIntersect.getPoint().y() - rectangle.minY())) *
            0.5);
        if (topArea < totalArea * 0.5) {
          // go around top (the side which would make a greater movement)
          if (leftIntersect.getPoint().y() > rightIntersect.getPoint().y())
            // top left
            return new Point(
              rectangle.minX() - rerouteBuffer,
              rectangle.minY() - rerouteBuffer,
            );
          // top right
          return new Point(
            rectangle.maxX() + rerouteBuffer,
            rectangle.minY() - rerouteBuffer,
          );
        }
        // go around bottom
        if (leftIntersect.getPoint().y() < rightIntersect.getPoint().y())
          // bottom left
          return new Point(
            rectangle.minX() - rerouteBuffer,
            rectangle.maxY() + rerouteBuffer,
          );
        // bottom right
        return new Point(
          rectangle.maxX() + rerouteBuffer,
          rectangle.maxY() + rerouteBuffer,
        );
      }
      // right side
      if (rightIntersect.getState() === Intersection.POINT) {
        if (topIntersect.getState() === Intersection.POINT)
          // triangle, must go around top right
          return new Point(
            rectangle.maxX() + rerouteBuffer,
            rectangle.minY() - rerouteBuffer,
          );
        if (bottomIntersect.getState() === Intersection.POINT)
          // triangle, must go around bottom right
          return new Point(
            rectangle.maxX() + rerouteBuffer,
            rectangle.maxY() + rerouteBuffer,
          );
      }
      // else through top to bottom, calculate areas
      const totalArea = rectangle.height() * rectangle.width();
      const leftArea =
        rectangle.height() *
        ((topIntersect.getPoint().x() -
          rectangle.minX() +
          (bottomIntersect.getPoint().x() - rectangle.minX())) *
          0.5);
      if (leftArea < totalArea * 0.5) {
        // go around left
        if (topIntersect.getPoint().x() > bottomIntersect.getPoint().x())
          // top left
          return new Point(
            rectangle.minX() - rerouteBuffer,
            rectangle.minY() - rerouteBuffer,
          );
        // bottom left
        return new Point(
          rectangle.minX() - rerouteBuffer,
          rectangle.maxY() + rerouteBuffer,
        );
      }
      // go around right
      if (topIntersect.getPoint().x() < bottomIntersect.getPoint().x())
        // top right
        return new Point(
          rectangle.maxX() + rerouteBuffer,
          rectangle.minY() - rerouteBuffer,
        );
      // bottom right
      return new Point(
        rectangle.maxX() + rerouteBuffer,
        rectangle.maxY() + rerouteBuffer,
      );
    }
    // wrap around opposite (usually because the first move caused a problem)
    if (leftIntersect.getState() === Intersection.POINT) {
      if (topIntersect.getState() === Intersection.POINT)
        // triangle, must go around bottom right
        return new Point(
          rectangle.maxX() + rerouteBuffer,
          rectangle.maxY() + rerouteBuffer,
        );
      if (bottomIntersect.getState() === Intersection.POINT)
        // triangle, must go around top right
        return new Point(
          rectangle.maxX() + rerouteBuffer,
          rectangle.minY() - rerouteBuffer,
        );
      // else through left to right, calculate areas
      const totalArea = rectangle.height() * rectangle.width();
      const topArea =
        rectangle.width() *
        ((leftIntersect.getPoint().y() -
          rectangle.minY() +
          (rightIntersect.getPoint().y() - rectangle.minY())) *
          0.5);
      if (topArea < totalArea * 0.5) {
        // go around bottom (the side which would make a lesser movement)
        if (leftIntersect.getPoint().y() > rightIntersect.getPoint().y())
          // bottom right
          return new Point(
            rectangle.maxX() + rerouteBuffer,
            rectangle.maxY() + rerouteBuffer,
          );
        // bottom left
        return new Point(
          rectangle.minX() - rerouteBuffer,
          rectangle.maxY() + rerouteBuffer,
        );
      }
      // go around top
      if (leftIntersect.getPoint().y() < rightIntersect.getPoint().y())
        // top right
        return new Point(
          rectangle.maxX() + rerouteBuffer,
          rectangle.minY() - rerouteBuffer,
        );
      // top left
      return new Point(
        rectangle.minX() - rerouteBuffer,
        rectangle.minY() - rerouteBuffer,
      );
    }
    if (rightIntersect.getState() === Intersection.POINT) {
      if (topIntersect.getState() === Intersection.POINT)
        // triangle, must go around bottom left
        return new Point(
          rectangle.minX() - rerouteBuffer,
          rectangle.maxY() + rerouteBuffer,
        );
      if (bottomIntersect.getState() === Intersection.POINT)
        // triangle, must go around top left
        return new Point(
          rectangle.minX() - rerouteBuffer,
          rectangle.minY() - rerouteBuffer,
        );
    }
    // else through top to bottom, calculate areas
    const totalArea = rectangle.height() * rectangle.width();
    const leftArea =
      rectangle.height() *
      ((topIntersect.getPoint().x() -
        rectangle.minX() +
        (bottomIntersect.getPoint().x() - rectangle.minX())) *
        0.5);
    if (leftArea < totalArea * 0.5) {
      // go around right
      if (topIntersect.getPoint().x() > bottomIntersect.getPoint().x())
        // bottom right
        return new Point(
          rectangle.maxX() + rerouteBuffer,
          rectangle.maxY() + rerouteBuffer,
        );
      // top right
      return new Point(
        rectangle.maxX() + rerouteBuffer,
        rectangle.minY() - rerouteBuffer,
      );
    }
    // go around left
    if (topIntersect.getPoint().x() < bottomIntersect.getPoint().x())
      // bottom left
      return new Point(
        rectangle.minX() - rerouteBuffer,
        rectangle.maxY() + rerouteBuffer,
      );
    // top left
    return new Point(
      rectangle.minX() - rerouteBuffer,
      rectangle.minY() - rerouteBuffer,
    );
  }

  // override these defaults to change the spacing and bubble precision; affects performance and appearance
  static DEFAULT_MAX_ROUTING_ITERATIONS = 100; // number of times to run the algorithm to refine the path finding in difficult areas
  static DEFAULT_MAX_MARCHING_ITERATIONS = 20; // number of times to refine the boundary
  static DEFAULT_PIXEL_GROUP = 4; // the resolution of the algorithm in square pixels
  static DEFAULT_EDGE_R0 = 10; // the distance from edges at which energy is 1 (full influence)
  static DEFAULT_EDGE_R1 = 20; // the distance from edges at which energy is 0 (no influence)
  static DEFAULT_NODE_R0 = 15; // the distance from nodes which energy is 1 (full influence)
  static DEFAULT_NODE_R1 = 50; // the distance from nodes at which energy is 0 (no influence)
  static DEFAULT_MORPH_BUFFER = BubbleSet.DEFAULT_NODE_R0; // the amount of space to move the virtual edge when wrapping around obstacles
  static DEFAULT_SKIP = 8; // the default number of contour steps to skip when building the contour (higher is less precise but faster)

  static linePtSegDistSq(lx1, ly1, lx2, ly2, x, y) {
    // taken from JDK 8 java.awt.geom.Line2D#ptSegDistSq(double, double, double, double, double, double)
    const x1 = lx1;
    const y1 = ly1;
    const x2 = lx2 - x1;
    const y2 = ly2 - y1;
    const px = x - x1;
    const py = y - y1;
    const dotprod = px * x2 + py * y2;
    let projlenSq;
    if (dotprod <= 0) {
      projlenSq = 0;
    } else {
      px = x2 - px;
      py = y2 - py;
      dotprod = px * x2 + py * y2;
      if (dotprod <= 0) {
        projlenSq = 0;
      } else {
        projlenSq = (dotprod * dotprod) / (x2 * x2 + y2 * y2);
      }
    }
    let lenSq = px * px + py * py - projlenSq;
    if (lenSq < 0) {
      lenSq = 0;
    }
    return lenSq;
  }

  static addPadding(rects, radius) {
    return rects.map((r) => {
      return {
        x: r['x'] - radius,
        y: r['y'] - radius,
        width: r['width'] + 2 * radius,
        height: r['height'] + 2 * radius,
      };
    });
  }
} // BubbleSet

export class PointPath {
  constructor(points) {
    this._arr = [];
    this._closed = true;
    if (arguments.length && points) {
      this.addAll(points);
    }
  }

  closed(_) {
    if (!arguments.length) return this._closed;
    this._closed = _;
  }

  addAll(points) {
    points.forEach((p) => {
      this.add(p);
    });
  }

  add(p) {
    const x = p[0];
    const y = p[1];
    if (Number.isNaN(x) || Number.isNaN(y)) {
      console.warn('Point with NaN', x, y);
    }
    this._arr.push([x, y]);
  }

  size() {
    return this._arr.length;
  }

  get(ix) {
    const size = this.size();
    const closed = this.closed();
    if (ix < 0) {
      return closed ? this.get(ix + size) : this.get(0);
    }
    if (ix >= size) {
      return closed ? this.get(ix - size) : this.get(size - 1);
    }
    return this._arr[ix];
  }

  forEach(cb) {
    this._arr.forEach((el, ix) => {
      cb(el, ix, this);
    });
  }

  isEmpty() {
    return !this.size();
  }

  transform(ts) {
    let path = this;
    ts.forEach((t) => {
      path = t.apply(path);
    });
    return path;
  }
  toString() {
    let outline = '';
    this.forEach((p) => {
      if (!outline.length) {
        outline += 'M' + p[0] + ' ' + p[1];
      } else {
        outline += ' L' + p[0] + ' ' + p[1];
      }
    });
    if (!outline.length) {
      return 'M0 0';
    }
    if (this.closed()) {
      outline += ' Z';
    }
    return outline;
  }
} // PointPath

class ShapeSimplifierState {
  constructor(path, start) {
    this._path = path;
    this._start = start;
    this._end = start + 1;
  }

  advanceEnd() {
    this._end += 1;
  }

  decreaseEnd() {
    this._end -= 1;
  }

  end() {
    return this._end;
  }

  validEnd() {
    return this._path.closed()
      ? this._end < this._path.size()
      : this._end < this._path.size() - 1;
  }

  endPoint() {
    return this._path.get(this._end);
  }

  startPoint() {
    return this._path.get(this._start);
  }

  lineDstSqr(ix) {
    const p = this._path.get(ix);
    const s = this.startPoint();
    const e = this.endPoint();
    return BubbleSet.linePtSegDistSq(s[0], s[1], e[0], e[1], p[0], p[1]);
  }

  canTakeNext() {
    if (!this.validEnd()) return false;
    let ok = true;
    this.advanceEnd();
    for (let ix = this._start + 1; ix < this._end; ix += 1) {
      if (this.lineDstSqr(ix) > this._tsqr) {
        ok = false;
        break;
      }
    }
    this.decreaseEnd();
    return ok;
  }
} // ShapeSimplifierState

export class ShapeSimplifier {
  constructor(tolerance) {
    this._tolerance = 0.0;
    this._tsqr = 0.0;
    this.tolerance(tolerance);
  }

  tolerance(_) {
    if (!arguments.length) return this._tolerance;
    this._tolerance = _;
    this._tsqr = this._tolerance * this._tolerance;
  }

  isDisabled() {
    return this._tolerance < 0.0;
  }

  apply(path) {
    if (this.isDisabled() || path.size() < 3) return path;
    const states = [];
    let start = 0;
    while (start < path.size()) {
      const s = new ShapeSimplifierState(path, start);
      while (s.canTakeNext()) {
        s.advanceEnd();
      }
      start = s.end();
      states.push(s);
    }
    return new PointPath(
      states.map((s) => {
        return s.startPoint();
      }),
    );
  }
} // ShapeSimplifier

export class BSplineShapeGenerator {
  // since the basis function is fixed this value should not be changed
  static ORDER = 3;
  static START_INDEX = BSplineShapeGenerator.ORDER - 1;
  static REL_END = 1;
  static REL_START =
    BSplineShapeGenerator.REL_END - BSplineShapeGenerator.ORDER;

  constructor() {
    this._clockwise = true;
    this._granularity = 6.0;
  }

  granularity(_) {
    if (!arguments.length) return this._granularity;
    this._granularity = _;
  }

  baseFunction(i, t) {
    // the basis function for a cubic B spline
    switch (i) {
      case -2:
        return (((-t + 3.0) * t - 3.0) * t + 1.0) / 6.0;
      case -1:
        return ((3.0 * t - 6.0) * t * t + 4.0) / 6.0;
      case 0:
        return (((-3.0 * t + 3.0) * t + 3.0) * t + 1.0) / 6.0;
      case 1:
        return (t * t * t) / 6.0;
      default:
        console.warn('internal error!');
    }
  }

  getRelativeIndex(index, relIndex) {
    return index + (this._clockwise ? relIndex : -relIndex);
  }

  calcPoint(path, i, t) {
    // evaluates a point on the B spline
    let px = 0.0;
    let py = 0.0;
    for (
      let j = BSplineShapeGenerator.REL_START;
      j <= BSplineShapeGenerator.REL_END;
      j += 1
    ) {
      const p = path.get(this.getRelativeIndex(i, j));
      const bf = this.baseFunction(j, t);
      px += bf * p[0];
      py += bf * p[1];
    }
    return [px, py];
  }

  apply(path) {
    // covering special cases
    if (path.size() < 3) return path;
    // actual b-spline calculation
    const res = new PointPath();
    const count = path.size() + BSplineShapeGenerator.ORDER - 1;
    const g = this.granularity();
    const closed = path.closed();
    res.add(
      this.calcPoint(
        path,
        BSplineShapeGenerator.START_INDEX - (closed ? 0 : 2),
        0,
      ),
    );
    for (
      let ix = BSplineShapeGenerator.START_INDEX - (closed ? 0 : 2);
      ix < count + (closed ? 0 : 2);
      ix += 1
    ) {
      for (let k = 1; k <= g; k += 1) {
        res.add(this.calcPoint(path, ix, k / g));
      }
    }
    return res;
  }
} // BSplineShapeGenerator
