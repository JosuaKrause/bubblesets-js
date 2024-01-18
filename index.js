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

/** @typedef {import('./bubblesets').RectObj} RectObj */
/**
 * @typedef {{
 *  x: number,
 *  y: number,
 *  width: number,
 *  height: number,
 *  elem: SVGElement,
 * }} SVGRectObj
 */
/**
 * @typedef {{
 *  initIx: number,
 *  onColorUpdate: (ix: number) => void,
 *  onDebugUpdate: (isDebug: boolean) => void,
 * }} Controls
 */

import {
  BSplineShapeGenerator,
  BubbleSet,
  PointPath,
  ShapeSimplifier,
} from './bubblesets.js';

function attr(
  /** @type {SVGElement} */ elem,
  /** @type {{ [key: string]: string | number | null }} */ attr,
) {
  for (const key of Object.keys(attr)) {
    const value = attr[key];
    if (value === null) {
      elem.removeAttribute(key);
    } else {
      elem.setAttribute(key, `${value}`);
    }
  }
}

function style(
  /** @type {SVGElement} */ elem,
  /** @type {{ [key: string]: string | number | null }} */ style,
) {
  for (const key of Object.keys(style)) {
    const value = style[key];
    if (value === null) {
      elem.style.removeProperty(key);
    } else {
      elem.style.setProperty(key, `${value}`);
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

function addColorSelect(
  /** @type {HTMLElement} */ main,
  /** @type {Controls} */ controls,
) {
  const selectColor = document.createElement('select');
  colors.forEach((_, ix) => {
    const option = document.createElement('option');
    option.value = `${ix}`;
    option.innerText = `Group ${ix}`;
    selectColor.appendChild(option);
  });
  selectColor.addEventListener('change', () => {
    const newIx = +selectColor.value;
    selectColor.style.backgroundColor = colors[newIx];
    controls.onColorUpdate(newIx);
  });
  selectColor.value = `${controls.initIx}`;
  selectColor.style.backgroundColor = colors[controls.initIx];
  main.appendChild(selectColor);
  return {
    updateColor: (/** @type {number} */ ix) => {
      selectColor.value = `${ix}`;
    },
  };
}

function addDebugToggle(
  /** @type {HTMLElement} */ main,
  /** @type {Controls} */ controls,
) {
  const toggle = document.createElement('input');
  toggle.setAttribute('type', 'checkbox');
  toggle.checked = false;
  toggle.addEventListener('change', () => {
    controls.onDebugUpdate(toggle.checked);
  });
  main.appendChild(toggle);
  return {};
}

function addControls(/** @type {Controls} */ controls) {
  const top = document.getElementById('top');
  const colorControls = addColorSelect(top, controls);
  const debugControls = addDebugToggle(top, controls);
  const footNormal = document.createElement('div');
  footNormal.classList.add('normalonly');
  footNormal.textContent =
    'Add points by clicking and remove the currently closest point via Shift+Click.';
  const footMobile = document.createElement('div');
  footMobile.classList.add('mobileonly');
  footMobile.textContent =
    'Add points by tapping. Select "Show Nearest" to remove points instead.';
  return {
    ...colorControls,
    ...debugControls,
  };
}

const DEFAULT_WIDTH = 40;
const DEFAULT_HEIGHT = 30;

function rectFromPoint(/** @type {number} */ cx, /** @type {number} */ cy) {
  const width = DEFAULT_WIDTH;
  const height = DEFAULT_HEIGHT;
  const x = cx - width * 0.5;
  const y = cy - height * 0.5;
  return {
    x,
    y,
    width,
    height,
  };
}

function addRect(
  /** @type {SVGElement} */ items,
  /** @type {SVGRectObj[]} */ rectangles,
  /** @type {string} */ color,
  /** @type {RectObj} */ rect,
) {
  const elem = appendSVG(items, 'rect');
  attr(elem, rect);
  style(elem, {
    stroke: 'black',
    'stroke-width': `${1}`,
    fill: color,
  });
  rectangles.push({
    ...rect,
    elem: elem,
  });
}

function clearAll(
  /** @type {SVGElement} */ items,
  /** @type {SVGRectObj[][]} */ rectangles,
) {
  removeAllChilds(items);
  colors.forEach((_, ix) => {
    rectangles[ix] = [];
  });
}

function parseData(
  /** @type {SVGElement} */ items,
  /** @type {SVGRectObj[][]} */ rectangles,
  /** @type {string | null} */ data,
) {
  clearAll(items, rectangles);
  if (!data) {
    return;
  }
  JSON.parse(atob(data)).forEach(
    (/** @type {number[][]} */ rects, /** @type {number} */ ix) => {
      if (ix >= rectangles.length) {
        return;
      }
      rects.map((r) =>
        addRect(items, rectangles[ix], colors[ix], {
          x: +r[0],
          y: +r[1],
          width: +(r[2] ?? DEFAULT_WIDTH),
          height: +(r[3] ?? DEFAULT_HEIGHT),
        }),
      );
    },
  );
}

function generateData(/** @type {SVGRectObj[][]} */ rectangles) {
  if (rectangles.every((rects) => !rects.length)) {
    return null;
  }
  return btoa(
    JSON.stringify(
      rectangles.map((rects) =>
        rects.map((r) => {
          if (r.width === DEFAULT_WIDTH && r.height === DEFAULT_HEIGHT) {
            return [r.x, r.y];
          }
          return [r.x, r.y, r.width, r.height];
        }),
      ),
      undefined,
      0,
    ),
  );
}

function updateURL(/** @type {SVGRectObj[][]} */ rectangles) {
  try {
    const data = generateData(rectangles);
    const url = new URL(location.href);
    url.searchParams.set('data', data);
    window.history.pushState(
      {
        data,
      },
      '',
      url,
    );
  } catch (_) {
    // ignore errors
  }
}

function start() {
  let curColor = 0;
  addControls({
    initIx: curColor,
    onColorUpdate: (ix) => {
      curColor = ix;
      update();
    },
    onDebugUpdate: (isDebug) => {
      bubbles.debug(isDebug);
      update();
    },
  });
  const bubbles = new BubbleSet();
  /** @type {SVGRectObj[][]} */
  const rectangles = colors.map(() => []);
  const main = document.getElementById('main');
  const items = appendSVG(main, 'g');
  const paths = rectangles.map(() => appendSVG(main, 'path'));
  const debug = appendSVG(main, 'g');
  bubbles.debug(false);

  function restangles(/** @type {number} */ ix) {
    return rectangles.flatMap((cur, curIx) => {
      if (curIx === ix) {
        return [];
      }
      return cur;
    });
  }

  function update() {
    removeAllChilds(debug);
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
    if (!outline.isEmpty() && ix === curColor && bubbles.debug()) {
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

  main.addEventListener('click', (e) => {
    const ix = curColor;
    addRect(
      items,
      rectangles[ix],
      colors[ix],
      rectFromPoint(e.offsetX, e.offsetY),
    );
    update();
    updateURL(rectangles);
  });

  function load(/** @type {string | null} */ data) {
    try {
      parseData(items, rectangles, data);
    } catch (_) {
      // ignore errors
    }
    update();
  }

  const url = new URL(location.href);
  const loadData = url.searchParams.get('data');
  if (loadData) {
    load(loadData);
  }
  window.addEventListener('popstate', (event) => {
    /** @type {string | null} */
    const data = event.state?.data;
    load(data ?? null);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start);
} else {
  start();
}
