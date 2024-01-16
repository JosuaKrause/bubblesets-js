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
 */
// @ts-check

/** @typedef {{x: number, y: number, width: number, height: number, elem: SVGElement}} SVGRectObj */

import {
  BSplineShapeGenerator,
  BubbleSet,
  PointPath,
  ShapeSimplifier,
} from './bubblesets.js';

function attr(
  /** @type {SVGElement} */ elem,
  /** @type {{ [key: string]: string | null }} */ attr,
) {
  for (const key of Object.keys(attr)) {
    const value = attr[key];
    if (value === null) {
      elem.removeAttribute(key);
    } else {
      elem.setAttribute(key, value);
    }
  }
}

function style(
  /** @type {SVGElement} */ elem,
  /** @type {{ [key: string]: string | null }} */ style,
) {
  for (const key of Object.keys(style)) {
    const value = style[key];
    if (value === null) {
      elem.style.removeProperty(key);
    } else {
      elem.style.setProperty(key, value);
    }
  }
}

function appendSVG(
  /** @type {HTMLElement | SVGElement} */ parent,
  /** @type {string} */ name,
) {
  return parent.appendChild(
    document.createElementNS('http://www.w3.org/2000/svg', name),
  );
}

function removeAllChilds(/** @type {SVGElement} */ parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

function start() {
  const bubbles = new BubbleSet();
  /** @type {SVGRectObj[]} */
  const rectanglesA = [];
  /** @type {SVGRectObj[]} */
  const rectanglesB = [];
  const main = document.getElementById('main');
  const items = appendSVG(main, 'g');
  const pathA = appendSVG(main, 'path');
  const pathB = appendSVG(main, 'path');
  const debug = appendSVG(main, 'g');
  bubbles.debug(false);
  // bubbles.debug(true); // FIXME read from somewhere
  const debugFor = pathA;

  function update() {
    updateOutline(rectanglesA, rectanglesB, 'crimson', pathA);
    updateOutline(rectanglesB, rectanglesA, 'cornflowerblue', pathB);
  }

  function updateOutline(
    /** @type {SVGRectObj[]} */ rectangles,
    /** @type {SVGRectObj[]} */ otherRectangles,
    /** @type {string} */ color,
    /** @type {SVGElement} */ path,
  ) {
    const pad = 5;
    const list = bubbles.createOutline(
      BubbleSet.addPadding(rectangles, pad),
      BubbleSet.addPadding(otherRectangles, pad),
      null /* lines */,
    );
    // rectangles need to have the form { x: 0, y: 0, width: 0, height: 0 }
    // lines need to have the form { x1: 0, x2: 0, y1: 0, y2: 0 }
    // lines can be null to infer lines between rectangles automatically
    const outline = new PointPath(list).transform([
      new ShapeSimplifier(0.0),
      new BSplineShapeGenerator(),
      new ShapeSimplifier(0.0),
    ]);
    // outline is a path that can be used for the attribute d of a path element
    attr(path, {
      d: `${outline}`,
      opacity: '0.5',
      fill: color,
      stroke: 'black',
    });
    if (bubbles.debug() && path === debugFor) {
      removeAllChilds(debug);
      bubbles.debugPotentialArea().forEach((r) => {
        const rect = appendSVG(debug, 'rect');
        attr(rect, {
          x: `${r.x}`,
          y: `${r.y}`,
          width: `${r.width}`,
          height: `${r.height}`,
        });
        const color =
          r.value === r.threshold
            ? '0, 0, 0'
            : r.value > 0
            ? '150, 20, 20'
            : '20, 20, 150';
        style(rect, {
          fill: `rgb(${color})`,
          opacity:
            r.value === r.threshold
              ? `${0.5}`
              : `${Math.min(255, Math.abs(r.value * 40)) / 255.0}`,
        });
      });
    }
  }

  function addRect(
    /** @type {SVGRectObj[]} */ rectangles,
    /** @type {string} */ color,
    /** @type {number} */ cx,
    /** @type {number} */ cy,
  ) {
    const width = 40;
    const height = 30;
    const x = cx - width * 0.5;
    const y = cy - height * 0.5;
    const elem = appendSVG(items, 'rect');
    attr(elem, {
      x: `${x}`,
      y: `${y}`,
      width: `${width}`,
      height: `${height}`,
    });
    style(elem, {
      stroke: 'black',
      'stroke-width': `${1}`,
      fill: color,
    });
    rectangles.push({
      x: x,
      y: y,
      width: width,
      height: height,
      elem: elem,
    });
    update();
  }

  main.addEventListener('click', (e) => {
    addRect(rectanglesA, 'cornflowerblue', e.offsetX, e.offsetY);
  });
  let oldX = Number.NaN;
  let oldY = Number.NaN;
  main.addEventListener('contextmenu', (e) => {
    if (oldX === e.offsetX && oldY === e.offsetY) return;
    oldX = e.offsetX;
    oldY = e.offsetY;
    addRect(rectanglesB, 'crimson', e.offsetX, e.offsetY);
    e.preventDefault();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start);
} else {
  start();
}
