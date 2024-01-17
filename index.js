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

const colors = [
  '#377eb8',
  '#e41a1c',
  '#4daf4a',
  '#984ea3',
  '#ff7f00',
  '#ffff33',
  '#a65628',
  '#f781bf',
  '#999999',
];

function addControls(
  /** @type {number} */ initIx,
  /** @type {(ix: number) => void} */ onColorUpdate,
) {
  const top = document.getElementById('top');
  const selectColor = document.createElement('select');
  colors.forEach((_, ix) => {
    const option = document.createElement('option');
    option.setAttribute('value', `${ix}`);
    option.innerText = `Group ${ix}`;
    selectColor.appendChild(option);
  });
  selectColor.addEventListener('change', () => {
    const newIx = +selectColor.value;
    selectColor.style.backgroundColor = colors[newIx];
    onColorUpdate(newIx);
  });
  selectColor.value = `${initIx}`;
  selectColor.style.backgroundColor = colors[initIx];
  top.appendChild(selectColor);
  const footNormal = document.createElement('div');
  footNormal.classList.add('normalonly');
  footNormal.textContent =
    'Add points by clicking and remove the currently closest point via Shift+Click.';
  const footMobile = document.createElement('div');
  footMobile.classList.add('mobileonly');
  footMobile.textContent =
    'Add points by tapping. Select "Show Nearest" to remove points instead.';
  return {
    updateColor: (/** @type {number} */ ix) => {
      selectColor.value = `${ix}`;
    },
  };
}

function start() {
  let curColor = 0;
  const controls = addControls(curColor, (ix) => {
    curColor = ix;
    update();
  });
  const bubbles = new BubbleSet();
  /** @type {SVGRectObj[][]} */
  const rectangles = colors.map(() => []);
  const main = document.getElementById('main');
  const items = appendSVG(main, 'g');
  const paths = rectangles.map(() => appendSVG(main, 'path'));
  const debug = appendSVG(main, 'g');
  bubbles.debug(false);
  // bubbles.debug(true); // FIXME read from somewhere
  /** @type {number | null} */
  let debugFor = null;

  function restangles(/** @type {number} */ ix) {
    return rectangles.flatMap((cur, curIx) => {
      if (curIx === ix) {
        return [];
      }
      return cur;
    });
  }

  function update() {
    rectangles.forEach((rectangles, ix) => {
      updateOutline(rectangles, restangles(ix), colors[ix], paths[ix], ix);
    });
  }

  function updateOutline(
    /** @type {SVGRectObj[]} */ rectangles,
    /** @type {SVGRectObj[]} */ otherRectangles,
    /** @type {string} */ color,
    /** @type {SVGElement} */ path,
    /** @type {number} */ ix,
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
    if (bubbles.debug() && ix === debugFor) {
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
    const ix = curColor;
    addRect(rectangles[ix], colors[ix], e.offsetX, e.offsetY);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start);
} else {
  start();
}
