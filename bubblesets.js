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
  constructor(
    /** @type {{x: number, y: number, width: number, height: number} | undefined} */ _rect,
  ) {
    /** @type {number} */ this._x = 0;
    /** @type {number} */ this._y = 0;
    /** @type {number} */ this._width = 0;
    /** @type {number} */ this._height = 0;
    /** @type {number} */ this._centroidDistance = 0;
    if (_rect) {
      this.rect(_rect);
    }
  }

  rect(
    /** @type {{x: number, y: number, width: number, height: number} | undefined} */ r,
  ) {
    if (r !== undefined) {
      this._x = +r.x;
      this._y = +r.y;
      this._width = +r.width;
      this._height = +r.height;
    }
    return {
      x: this._x,
      y: this._y,
      width: this._width,
      height: this._height,
    };
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

  centroidDistance(/** @type {number | undefined} */ cd) {
    if (cd !== undefined) {
      this._centroidDistance = cd;
    }
    return this._centroidDistance;
  }

  cmp(/** @type {Rectangle} */ rect) {
    if (this._centroidDistance < rect.centroidDistance()) {
      return -1;
    }
    if (this._centroidDistance > rect.centroidDistance()) {
      return 0; // FIXME double check if 1 would be better here
    }
    return 0;
  }

  add(/** @type {Rectangle} */ rect) {
    const tmpx = Math.min(this.minX(), rect.minX());
    const tmpy = Math.min(this.minY(), rect.minY());
    const maxX = Math.max(this.maxX(), rect.maxX());
    const maxY = Math.max(this.maxY(), rect.maxY());
    this._x = tmpx;
    this._y = tmpy;
    this._width = maxX - this._x;
    this._height = maxY - this._y;
  }

  contains(/** @type {Point} */ p) {
    const px = p.x();
    const py = p.y();
    return this.containsPt(px, py);
  }

  containsPt(/** @type {number} */ px, /** @type {number} */ py) {
    if (px < this._x || px >= this._x + this._width) return false;
    return !(py < this._y || py >= this._y + this._height);
  }

  intersects(/** @type {Rectangle} */ rect) {
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

  intersectsLine(/** @type {Line} */ line) {
    let x1 = line.x1();
    let y1 = line.y1();
    const x2 = line.x2();
    const y2 = line.y2();
    // taken from JDK 8 java.awt.geom.Rectangle2D.Double#intersectsLine(double, double, double, double)
    /** @type {number} */ let out1;
    /** @type {number} */ let out2;
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

  outcode(/** @type {number} */ px, /** @type {number} */ py) {
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
    return `Rectangle[x=${this.minX()}, y=${this.minY()}, w=${this.width()}, h=${this.height()}]`;
  }

  /** @type {1} */ static OUT_LEFT = 1;
  /** @type {2} */ static OUT_TOP = 2;
  /** @type {4} */ static OUT_RIGHT = 4;
  /** @type {8} */ static OUT_BOTTOM = 8;
} // Rectangle

export class Point {
  constructor(/** @type {number} */ ax, /** @type {number} */ ay) {
    /** @type {number} */ this._x = +ax;
    /** @type {number} */ this._y = +ay;
  }

  x(/** @type {number | undefined} */ x) {
    if (x !== undefined) {
      this._x = x;
    }
    return this._x;
  }

  y(/** @type {number | undefined} */ y) {
    if (y !== undefined) {
      this._y = y;
    }
    return this._y;
  }

  distanceSq(/** @type {Point} */ p) {
    return Point.ptsDistanceSq(this._x, this._y, p.x(), p.y());
  }

  get() {
    return [this._x, this._y];
  }

  static ptsDistanceSq(
    /** @type {number} */ x1,
    /** @type {number} */ y1,
    /** @type {number} */ x2,
    /** @type {number} */ y2,
  ) {
    return (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
  }

  static doublePointsEqual(
    /** @type {number} */ x1,
    /** @type {number} */ y1,
    /** @type {number} */ x2,
    /** @type {number} */ y2,
    /** @type {number} */ delta,
  ) {
    return Point.ptsDistanceSq(x1, y1, x2, y2) < delta * delta;
  }
} // Point

export class PointList {
  constructor(/** @type {number} */ size) {
    /** @type {number} */ this._size = size;
    /** @type {number} */ this._els = 0;
    /** @type {(Point | undefined | null)[]} */ this._arr = [];
    this._arr.length = size; // pre-allocate
    /** @type {{ [key: string]: Point }} */ this._set = {};
  }

  static hash(p) {
    return `${p.x()}x${p.y()}`;
  }

  add(/** @type {Point} */ p) {
    this._set[PointList.hash(p)] = p;
    this._arr[this._els] = 5; // FIXME test
    this._arr[this._els] = p;
    this._els += 1;
  }

  contains(/** @type {Point} */ p) {
    const test = this._set[PointList.hash(p)];
    if (!test) {
      return false;
    }
    return test.x() === p.x() && test.y() === p.y();
  }

  isFirst(/** @type {Point} */ p) {
    if (!this._els) {
      return false;
    }
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

  get(/** @type {number} */ ix) {
    return this._arr[ix];
  }

  size() {
    return this._els;
  }
} // PointList

export class Line {
  constructor(
    /** @type {number} */ x1,
    /** @type {number} */ y1,
    /** @type {number} */ x2,
    /** @type {number} */ y2,
  ) {
    /** @type {number} */ this._x1 = +x1;
    /** @type {number} */ this._y1 = +y1;
    /** @type {number} */ this._x2 = +x2;
    /** @type {number} */ this._y2 = +y2;
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

  x1(/** @type {number | undefined} */ x1) {
    if (x1 !== undefined) {
      this._x1 = x1;
    }
    return this._x1;
  }

  x2(/** @type {number | undefined} */ x2) {
    if (x2 !== undefined) {
      this._x2 = x2;
    }
    return this._x2;
  }

  y1(/** @type {number | undefined} */ y1) {
    if (y1 !== undefined) {
      this._y1 = y1;
    }
    return this._y1;
  }

  y1(/** @type {number | undefined} */ y2) {
    if (y2 !== undefined) {
      this._y2 = y2;
    }
    return this._y2;
  }

  // whether an infinite line to positive x from the point p will cut through the line
  cuts(/** @type {Point} */ p) {
    if (this._y1 === this._y2) {
      return false;
    }
    const y = p.y();
    if ((y < this._y1 && y <= this._y2) || (y > this._y1 && y >= this._y2)) {
      return false;
    }
    const x = p.x();
    if (x > this._x1 && x >= this._x2) {
      return false;
    }
    if (x < this._x1 && x <= this._x2) {
      return true;
    }
    const cross =
      this._x1 +
      ((y - this._y1) * (this._x2 - this._x1)) / (this._y2 - this._y1);
    return x <= cross;
  }

  ptSegDistSq(/** @type {number} */ x, /** @type {number} */ y) {
    return BubbleSet.linePtSegDistSq(
      this._x1,
      this._y1,
      this._x2,
      this._y2,
      x,
      y,
    );
  }

  ptClose(
    /** @type {number} */ x,
    /** @type {number} */ y,
    /** @type {number} */ r,
  ) {
    // check whether the point is outside the bounding rectangle with padding r
    if (this._x1 < this._x2) {
      if (x < this._x1 - r || x > this._x2 + r) {
        return false;
      }
    } else {
      if (x < this._x2 - r || x > this._x1 + r) {
        return false;
      }
    }
    if (this._y1 < this._y2) {
      if (y < this._y1 - r || y > this._y2 + r) {
        return false;
      }
    } else {
      if (y < this._y2 - r || y > this._y1 + r) {
        return false;
      }
    }
    return true;
  }
} // Line

export class Area {
  constructor(/** @type {number} */ width, /** @type {number} */ height) {
    /** @type {number} */ this._width = width;
    /** @type {number} */ this._height = height;
    /** @type {number} */ this._size = width * height;
    /** @type {Float32Array} */ this._buff = new Float32Array(this._size);
  }

  bound(/** @type {number} */ pos, /** @type {boolean} */ isX) {
    if (pos < 0) {
      return 0;
    }
    return Math.min(pos, (isX ? this._width : this._height) - 1);
  }

  get(/** @type {number} */ x, /** @type {number} */ y) {
    if (x < 0 || x >= this._width || y < 0 || y >= this._height) {
      console.warn('Area.get out of bounds', x, y, this._width, this._height);
      return Number.NaN;
    }
    return this._buff[x + y * this._width];
  }

  set(
    /** @type {number} */ x,
    /** @type {number} */ y,
    /** @type {number} */ v,
  ) {
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
  constructor(/** @type {Point | null} */ p, /** @type {1 | 2 | 3 | 4} */ s) {
    /** @type {Point | null} */ this._point = p;
    /** @type {1 | 2 | 3 | 4} */ this._state = s;
  }

  getState() {
    return this._state;
  }

  getPoint() {
    return this._point;
  }

  /** @type {1} */ static POINT = 1;
  /** @type {2} */ static PARALLEL = 2;
  /** @type {3} */ static COINCIDENT = 3;
  /** @type {4} */ static NONE = 4;

  static intersectLineLine(/** @type {Line} */ la, /** @type {Line} */ lb) {
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

  static fractionAlongLineA(/** @type {Line} */ la, /** @type {Line} */ lb) {
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

  static fractionToLineCenter(
    /** @type {Rectangle} */ bounds,
    /** @type {Line} */ line,
  ) {
    let minDistance = Number.POSITIVE_INFINITY;
    let countIntersections = 0;

    const testLine = (
      /** @type {number} */ xa,
      /** @type {number} */ ya,
      /** @type {number} */ xb,
      /** @type {number} */ yb,
    ) => {
      let testDistance = Intersection.fractionAlongLineA(
        line,
        new Line(xa, ya, xb, yb),
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
    if (countIntersections > 1) {
      return minDistance;
    }
    // bottom
    testLine(bounds.minX(), bounds.maxY(), bounds.maxX(), bounds.maxY());
    if (countIntersections > 1) {
      return minDistance;
    }
    // right
    testLine(bounds.maxX(), bounds.minY(), bounds.maxX(), bounds.maxY());
    // if no intersection, return -1
    if (countIntersections === 0) {
      return -1;
    }
    return minDistance;
  }

  static fractionToLineEnd(
    /** @type {Rectangle} */ bounds,
    /** @type {Line} */ line,
  ) {
    let minDistance = Number.POSITIVE_INFINITY;
    let countIntersections = 0;

    const testLine = (
      /** @type {number} */ xa,
      /** @type {number} */ ya,
      /** @type {number} */ xb,
      /** @type {number} */ yb,
    ) => {
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
    if (countIntersections > 1) {
      return minDistance;
    }
    // bottom
    testLine(bounds.minX(), bounds.maxY(), bounds.maxX(), bounds.maxY());
    if (countIntersections > 1) {
      return minDistance;
    }
    // right
    testLine(bounds.maxX(), bounds.minY(), bounds.maxX(), bounds.maxY());
    // if no intersection, return -1
    if (countIntersections === 0) {
      return -1;
    }
    return minDistance;
  }

  static testIntersection(
    /** @type {Line} */ line,
    /** @type {Rectangle} */ bounds,
    /** @type {Intersection[]} */ intersections,
  ) {
    let countIntersections = 0;

    const fillIntersection = (
      /** @type {number} */ ix,
      /** @type {number} */ xa,
      /** @type {number} */ ya,
      /** @type {number} */ xb,
      /** @type {number} */ yb,
    ) => {
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
  constructor(
    /** @type {PointList} */ contour,
    /** @type {Area} */ potentialArea,
    /** @type {number} */ step,
    /** @type {number} */ t,
  ) {
    /** @type {PointList} */ this._contour = contour;
    /** @type {Area} */ this._potentialArea = potentialArea;
    /** @type {number} */ this._step = step;
    /** @type {number} */ this._threshold = t;
    /** @type {0 | 1 | 2 | 3} */ this._direction = MarchingSquares.S;
    /** @type {boolean} */ this._marched = false;
  }

  updateDir(
    /** @type {number} */ x,
    /** @type {number} */ y,
    /** @type {number} */ dir,
    /** @type {number} */ res,
  ) {
    const v = this._potentialArea.get(x, y);
    if (Number.isNaN(v)) {
      return v;
    }
    if (v > this._threshold) {
      return dir + res;
    }
    return dir;
  }

  getState(/** @type {number} */ x, /** @type {number} */ y) {
    let dir = 0;
    dir = this.updateDir(x, y, dir, 1);
    dir = this.updateDir(x + 1, y, dir, 2);
    dir = this.updateDir(x, y + 1, dir, 4);
    dir = this.updateDir(x + 1, y + 1, dir, 8);
    if (Number.isNaN(dir)) {
      console.warn(
        `marched out of bounds: ${x} ${y} bounds: ${this._potentialArea.width()} ${this._potentialArea.height()}`,
      );
      return -1;
    }
    return dir;
  }

  doMarch(/** @type {number} */ xpos, /** @type {number} */ ypos) {
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
          console.warn(`Marching squares invalid state: ${state}`);
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
  /** @type {0} */ static N = 0;
  /** @type {1} */ static S = 1;
  /** @type {2} */ static E = 2;
  /** @type {3} */ static W = 3;
} // MarchingSquares

export class BubbleSet {
  constructor() {
    /** @type {number} */ this._maxRoutingIterations =
      BubbleSet.DEFAULT_MAX_ROUTING_ITERATIONS;
    /** @type {number} */ this._maxMarchingIterations =
      BubbleSet.DEFAULT_MAX_MARCHING_ITERATIONS;
    /** @type {number} */ this._pixelGroup = BubbleSet.DEFAULT_PIXEL_GROUP;
    /** @type {number} */ this._edgeR0 = BubbleSet.DEFAULT_EDGE_R0;
    /** @type {number} */ this._edgeR1 = BubbleSet.DEFAULT_EDGE_R1;
    /** @type {number} */ this._nodeR0 = BubbleSet.DEFAULT_NODE_R0;
    /** @type {number} */ this._nodeR1 = BubbleSet.DEFAULT_NODE_R1;
    /** @type {number} */ this._morphBuffer = BubbleSet.DEFAULT_MORPH_BUFFER;
    /** @type {number} */ this._skip = BubbleSet.DEFAULT_SKIP;

    /** @type {number} */ this._threshold = 1;
    /** @type {number} */ this._nodeInfluenceFactor = 1;
    /** @type {number} */ this._edgeInfluenceFactor = 1;
    /** @type {number} */ this._negativeNodeInfluenceFactor = -0.8;
    /** @type {Rectangle | null} */ this._activeRegion = null;
    /** @type {Line[]} */ this._virtualEdges = [];
    /** @type {Area | null} */ this._potentialArea = null;

    /** @type {number} */ this._lastThreshold = Number.NaN;
    /** @type {boolean} */ this._debug = false;
  }

  maxRoutingIterations(
    /** @type {number | undefined} */ maxRoutingIterations,
  ) {
    if (maxRoutingIterations !== undefined) {
      this._maxRoutingIterations = maxRoutingIterations;
    }
    return this._maxRoutingIterations;
  }

  maxMarchingIterations(
    /** @type {number | undefined} */ maxMarchingIterations,
  ) {
    if (maxMarchingIterations !== undefined) {
      this._maxMarchingIterations = maxMarchingIterations;
    }
    return this._maxMarchingIterations;
  }

  pixelGroup(/** @type {number | undefined} */ pixelGroup) {
    if (pixelGroup !== undefined) {
      this._pixelGroup = pixelGroup;
    }
    return this._pixelGroup;
  }

  edgeR0(/** @type {number | undefined} */ edgeR0) {
    if (edgeR0 !== undefined) {
      this._edgeR0 = edgeR0;
    }
    return this._edgeR0;
  }

  edgeR1(/** @type {number | undefined} */ edgeR1) {
    if (edgeR1 !== undefined) {
      this._edgeR1 = edgeR1;
    }
    return this._edgeR1;
  }

  nodeR0(/** @type {number | undefined} */ nodeR0) {
    if (nodeR0 !== undefined) {
      this._nodeR0 = nodeR0;
    }
    return this._nodeR0;
  }

  nodeR1(/** @type {number | undefined} */ nodeR1) {
    if (nodeR1 !== undefined) {
      this._nodeR1 = nodeR1;
    }
    return this._nodeR1;
  }

  morphBuffer(/** @type {number | undefined} */ morphBuffer) {
    if (morphBuffer !== undefined) {
      this._morphBuffer = morphBuffer;
    }
    return this._morphBuffer;
  }

  skip(/** @type {number | undefined} */ skip) {
    if (skip !== undefined) {
      this._skip = skip;
    }
    return this._skip;
  }

  createOutline(
    /** @type {{
      x: number;
      y: number;
      width: number;
      height: number;
    }[]} */ members,
    /** @type {{
      x: number;
      y: number;
      width: number;
      height: number;
    }[]} */ nonmem,
    /** @type {{
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    }[] | undefined} */ edges,
  ) {
    if (!members.length) {
      return [];
    }

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
          // FIXME check if clearing potential area is required
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

  debug(/** @type {boolean | undefined} */ debug) {
    if (debug !== undefined) {
      this._debug = !!debug;
    }
    return this._debug;
  }

  // call after createOutline
  debugPotentialArea() {
    if (!this._debug) {
      console.warn('debug mode should be activated');
    }
    /** @type {{
         x: number;
         y: number;
         width: number;
         height: number;
         value: number;
         threshold: number;
     * }[]} */ const rects = [];
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

  calculateContour(
    /** @type {PointList} */ contour,
    /** @type {Rectangle} */ bounds,
    /** @type {Rectangle[]} */ members,
    /** @type {Rectangle[]} */ nonMembers,
    /** @type {Area} */ potentialArea,
  ) {
    // if no surface could be found stop
    if (
      !new MarchingSquares(
        contour,
        potentialArea,
        this._pixelGroup,
        this._threshold,
      ).march()
    ) {
      return false;
    }
    return this.testContainment(contour, bounds, members, nonMembers)[0];
  }

  testContainment(
    /** @type {PointList} */ contour,
    /** @type {Rectangle} */ bounds,
    /** @type {Rectangle[]} */ members,
    /** @type {Rectangle[]} */ nonMembers,
  ) {
    // precise bounds checking
    // copy hull values
    /** @type {Point[]} */ const g = [];
    /** @type {Rectangle} */ let gbounds = null;

    const contains = (/** @type {Point[]} */ g, /** @type {Point} */ p) => {
      /** @type {Line | null} */ let line = null;
      /** @type {Point | null} */ let first = null;
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

  fillPotentialArea(
    /** @type {Rectangle} */ activeArea,
    /** @type {Rectangle[]} */ members,
    /** @type {Rectangle[]} */ nonMembers,
    /** @type {Area} */ potentialArea,
  ) {
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
        // FIXME check intersection with node radii
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

  calculateCentroidDistances(/** @type {Rectangle[]} */ items) {
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

  calculateVirtualEdges(
    /** @type {Rectangle[]} */ items,
    /** @type {Rectangle[]} */ nonMembers,
  ) {
    /** @type {Rectangle[]} */ const visited = [];
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

  connectItem(
    /** @type {Rectangle[]} */ nonMembers,
    /** @type {Rectangle} */ item,
    /** @type {Rectangle[]} */ visited,
  ) {
    /** @type {Line[]} */ let scannedLines = [];
    /** @type {Line[]} */ const linesToCheck = [];

    const itemCenter = new Point(item.centerX(), item.centerY());
    /** @type {Rectangle | null} */ let closestNeighbour = null;
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
      /** @type {Intersection[]} */ const intersections = [];
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
              let tempMorphBuffer = this._morphBuffer;
              let movePoint = this.rerouteLine(
                closestItem,
                tempMorphBuffer,
                intersections,
                true,
              );
              // test the movePoint already exists
              let foundFirst =
                this.pointExists(movePoint, linesToCheck) ||
                this.pointExists(movePoint, scannedLines);
              let pointInside = this.isPointInsideNonMember(
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
                let foundSecond =
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

  isPointInsideNonMember(
    /** @type {Point} */ point,
    /** @type {Rectangle[]} */ nonMembers,
  ) {
    return nonMembers.some((testRectangle) => {
      return testRectangle.contains(point);
    });
  }

  pointExists(/** @type {Point} */ pointToCheck, /** @type {Line[]} */ lines) {
    let found = false;
    lines.forEach((checkEndPointsLine) => {
      // FIXME use short-circuit operation
      if (found) {
        return;
      }
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

  getCenterItem(
    /** @type {Rectangle[]} */ items,
    /** @type {Line} */ testLine,
  ) {
    let minDistance = Number.POSITIVE_INFINITY;
    /** @type {Rectangle | null} */ let closestItem = null;

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

  countInterferenceItems(
    /** @type {Rectangle[]} */ interferenceItems,
    /** @type {Line} */ testLine,
  ) {
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
    /** @type {Area} */ potentialArea,
    /** @type {number} */ influenceFactor,
    /** @type {number} */ r1,
    /** @type {Line[]} */ lines,
    /** @type {Rectangle} */ activeRegion,
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

  getRectDistSq(
    /** @type {Rectangle} */ rect,
    /** @type {number} */ tempX,
    /** @type {number} */ tempY,
  ) {
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

  calculateRectangleInfluence(
    /** @type {Area} */ potentialArea,
    /** @type {number} */ influenceFactor,
    /** @type {number} */ r1,
    /** @type {Rectangle} */ rect,
  ) {
    if (influenceFactor < 0) {
      console.warn('expected positive influence', influenceFactor);
    }
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
    /** @type {Area} */ potentialArea,
    /** @type {number} */ influenceFactor,
    /** @type {number} */ r1,
    /** @type {Rectangle} */ rect,
  ) {
    if (influenceFactor > 0) {
      console.warn('expected negative influence', influenceFactor);
    }
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

  rerouteLine(
    /** @type {Rectangle} */ rectangle,
    /** @type {number} */ rerouteBuffer,
    /** @type {Intersection[]} */ intersections,
    /** @type {boolean} */ wrapNormal,
  ) {
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

  static linePtSegDistSq(
    /** @type {number} */ lx1,
    /** @type {number} */ ly1,
    /** @type {number} */ lx2,
    /** @type {number} */ ly2,
    /** @type {number} */ x,
    /** @type {number} */ y,
  ) {
    // taken from JDK 8 java.awt.geom.Line2D#ptSegDistSq(double, double, double, double, double, double)
    const x1 = lx1;
    const y1 = ly1;
    const x2 = lx2 - x1;
    const y2 = ly2 - y1;
    let px = x - x1;
    let py = y - y1;
    let dotprod = px * x2 + py * y2;
    /** @type {number} */ let projlenSq;
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

  static addPadding(
    /** @type {{x: number; y: number; width: number; height: number;}[]} */ rects,
    /** @type {number} */ radius,
  ) {
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
  constructor(/** @type {number[][] | undefined} */ points) {
    /** @type {number[][]} */ this._arr = [];
    /** @type {boolean} */ this._closed = true;
    if (points) {
      console.log('add all', points);
      this.addAll(points);
    }
  }

  closed(/** @type {boolean | undefined} */ closed) {
    if (closed !== undefined) {
      this._closed = closed;
    }
    return this._closed;
  }

  addAll(/** @type {number[][]} */ points) {
    points.forEach((p) => {
      this.add(p);
    });
  }

  add(/** @type {number[]} */ p) {
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

  get(/** @type {number} */ ix) {
    const size = this.size();
    const closed = this.closed();
    /** @type {number[]} */ let res;
    if (ix < 0) {
      res = closed ? this.get(ix + size) : this.get(0);
    } else if (ix >= size) {
      res = closed ? this.get(ix - size) : this.get(size - 1);
    } else {
      res = this._arr[ix];
    }
    return res;
  }

  forEach(
    /** @type {(el: number[], ix: number, that: PointPath) => void} */ cb,
  ) {
    this._arr.forEach((el, ix) => {
      cb(el, ix, this);
    });
  }

  isEmpty() {
    return !this.size();
  }

  transform(/** @type {{apply: (path: PointPath) => PointPath;}[]} */ ts) {
    /** @type {PointPath} */ let path = this;
    console.log('transform', path);
    ts.forEach((t) => {
      path = t.apply(path);
      console.log(path, t);
    });
    return path;
  }

  toString() {
    let outline = '';
    this.forEach((p) => {
      if (!outline.length) {
        outline += `M${p[0]} ${p[1]}`;
      } else {
        outline += ` L${p[0]} ${p[1]}`;
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
  constructor(/** @type {PointPath} */ path, /** @type {number} */ start) {
    /** @type {PointPath} */ this._path = path;
    /** @type {number} */ this._start = start;
    /** @type {number} */ this._end = start + 1;
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

  lineDstSqr(/** @type {number} */ ix) {
    const p = this._path.get(ix);
    const s = this.startPoint();
    const e = this.endPoint();
    return BubbleSet.linePtSegDistSq(s[0], s[1], e[0], e[1], p[0], p[1]);
  }

  canTakeNext() {
    if (!this.validEnd()) {
      return false;
    }
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
  constructor(/** @type {number} */ tolerance) {
    /** @type {number} */ this._tolerance = 0.0;
    /** @type {number} */ this._tsqr = 0.0;
    this.tolerance(tolerance);
  }

  tolerance(/** @type {number | undefined} */ tolerance) {
    if (tolerance !== undefined) {
      this._tolerance = tolerance;
      this._tsqr = this._tolerance * this._tolerance;
    }
    return this._tolerance;
  }

  isDisabled() {
    return this._tolerance < 0.0;
  }

  apply(/** @type {PointPath} */ path) {
    if (this.isDisabled() || path.size() < 3) {
      return path;
    }
    /** @type {ShapeSimplifierState[]} */ const states = [];
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
    /** @type {boolean} */ this._clockwise = true;
    /** @type {number} */ this._granularity = 6.0;
  }

  granularity(/** @type {number | undefined} */ granularity) {
    if (granularity !== undefined) {
      this._granularity = granularity;
    }
    return this._granularity;
  }

  baseFunction(/** @type {number} */ i, /** @type {number} */ t) {
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

  getRelativeIndex(
    /** @type {number} */ index,
    /** @type {number} */ relIndex,
  ) {
    return index + (this._clockwise ? relIndex : -relIndex);
  }

  calcPoint(
    /** @type {PointPath} */ path,
    /** @type {number} */ i,
    /** @type {number} */ t,
  ) {
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

  apply(/** @type {PointPath} */ path) {
    // covering special cases
    if (path.size() < 3) {
      return path;
    }
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
