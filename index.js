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
 *  initPreset: number,
 *  initIx: number,
 *  onPresetUpdate: (ix: number, create: (items: SVGElement, rectangles: SVGRectObj[][]) => void | null) => void,
 *  onColorUpdate: (ix: number) => void,
 *  onDebugUpdate: (isDebug: boolean) => void,
 *  onRemoveUpdate: (isRemove: boolean) => void,
 *  onClear: () => void,
 * }} Controls
 */

import {
  BSplineShapeGenerator,
  BubbleSet,
  Point,
  PointPath,
  Rectangle,
  ShapeSimplifier,
} from './bubblesets.js';

function attr(
  /** @type {HTMLElement | SVGElement} */ elem,
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
  /** @type {HTMLElement | SVGElement} */ elem,
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

function fromPointList(
  /** @type {SVGElement} */ items,
  /** @type {SVGRectObj[][]} */ rectangles,
  /** @type {number[][][]} */ points,
) {
  points.forEach((colorPoints, ix) => {
    if (ix >= colors.length) {
      return;
    }
    colorPoints.forEach((point) => {
      addRect(items, rectangles[ix], colors[ix], {
        x: point[0],
        y: point[1],
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
      });
    });
  });
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

/**
 * @type {{
 *  name: string,
 *  create: (items: SVGElement, rectangles: SVGRectObj[][]) => void | null,
 * }[]}
 */
const presets = [
  {
    name: 'Custom',
    create: null,
  },
  {
    name: 'Big B',
    create: (items, rectangles) => {
      const points = [
        [
          [498, 142],
          [503, 241],
          [494, 36],
        ],
        [
          [495, 346],
          [496, 469],
          [536, 255],
        ],
        [
          [526, 471],
          [680, 340],
          [608, 468],
          [670, 416],
        ],
        [
          [662, 314],
          [575, 257],
          [650, 207],
        ],
        [
          [683, 97],
          [610, 46],
          [533, 31],
          [688, 190],
        ],
      ];
      fromPointList(items, rectangles, points);
    },
  },
];

function addDivider(/** @type {HTMLElement} */ main) {
  const div = document.createElement('div');
  div.classList.add('divider');
  main.appendChild(div);
}

function addLabel(
  /** @type {HTMLElement} */ main,
  /** @type {HTMLElement} */ target,
  /** @type {string} */ name,
  /** @type {string} */ desc,
) {
  const label = document.createElement('label');
  label.setAttribute('for', name);
  label.textContent = desc;
  main.appendChild(label);
  attr(target, { id: name, name });
}

function addPresetSelect(
  /** @type {HTMLElement} */ main,
  /** @type {Controls} */ controls,
) {
  const div = document.createElement('div');
  const selectPreset = document.createElement('select');
  addLabel(div, selectPreset, 'select-preset', 'Preset:');
  presets.forEach((preset, ix) => {
    const option = document.createElement('option');
    option.value = `${ix}`;
    option.innerText = preset.name;
    selectPreset.appendChild(option);
  });
  selectPreset.addEventListener('change', () => {
    const newIx = +selectPreset.value;
    controls.onPresetUpdate(newIx, presets[newIx].create);
  });
  selectPreset.value = `${controls.initPreset}`;
  div.appendChild(selectPreset);
  main.appendChild(div);
  return {
    updatePreset: (/** @type {number} */ ix) => {
      selectPreset.value = `${ix}`;
    },
  };
}

function addColorSelect(
  /** @type {HTMLElement} */ main,
  /** @type {Controls} */ controls,
) {
  const div = document.createElement('div');
  const selectColor = document.createElement('select');
  addLabel(div, selectColor, 'select-color', 'Color:');
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
  div.appendChild(selectColor);
  main.appendChild(div);
  return {
    updateColor: (/** @type {number} */ ix) => {
      selectColor.value = `${ix}`;
    },
  };
}

function addRemoveToggle(
  /** @type {HTMLElement} */ main,
  /** @type {Controls} */ controls,
) {
  const div = document.createElement('div');
  const toggle = document.createElement('input');
  addLabel(div, toggle, 'remove', 'Remove:');
  toggle.setAttribute('type', 'checkbox');
  toggle.checked = false;
  toggle.addEventListener('change', () => {
    controls.onRemoveUpdate(toggle.checked);
  });
  div.appendChild(toggle);
  main.appendChild(div);
  return {
    setRemoveMode: (/** @type {boolean} */ isRemove) => {
      toggle.checked = isRemove;
    },
  };
}

function addDebugToggle(
  /** @type {HTMLElement} */ main,
  /** @type {Controls} */ controls,
) {
  const div = document.createElement('div');
  const toggle = document.createElement('input');
  addLabel(div, toggle, 'debug', 'Show Potential Field:');
  toggle.setAttribute('type', 'checkbox');
  toggle.checked = false;
  toggle.addEventListener('change', () => {
    controls.onDebugUpdate(toggle.checked);
  });
  div.appendChild(toggle);
  main.appendChild(div);
  return {};
}

function addRemoveAll(
  /** @type {HTMLElement} */ main,
  /** @type {Controls} */ controls,
) {
  const div = document.createElement('div');
  const removeAll = document.createElement('input');
  removeAll.setAttribute('type', 'button');
  removeAll.value = 'Clear';
  removeAll.addEventListener('click', () => {
    controls.onClear();
  });
  div.appendChild(removeAll);
  main.appendChild(div);
  return {};
}

function addControls(/** @type {Controls} */ controls) {
  const top = document.getElementById('topbar');
  const presetControls = addPresetSelect(top, controls);
  const colorControls = addColorSelect(top, controls);
  const removeControls = addRemoveToggle(top, controls);
  addDivider(top);
  const debugControls = addDebugToggle(top, controls);
  const clearControls = addRemoveAll(top, controls);
  const footNormal = document.createElement('div');
  footNormal.classList.add('normalonly');
  footNormal.textContent =
    'Add boxes by clicking and remove the currently closest point via Shift+Click.';
  const footMobile = document.createElement('div');
  footMobile.classList.add('mobileonly');
  footMobile.textContent =
    'Add boxes by tapping. Select "Remove" to remove points instead.';
  const footer = document.getElementById('footer');
  footer.appendChild(footNormal);
  footer.appendChild(footMobile);
  return {
    ...presetControls,
    ...colorControls,
    ...removeControls,
    ...debugControls,
    ...clearControls,
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

function removeRect(
  /** @type {SVGElement} */ items,
  /** @type {SVGRectObj[][]} */ rectangles,
  /** @type {number} */ x,
  /** @type {number} */ y,
) {
  const point = new Point(x, y);
  const ref = new Rectangle();
  for (let ix = 0; ix < rectangles.length; ix += 1) {
    rectangles[ix] = rectangles[ix].filter((rect) => {
      ref.rect(rect);
      if (!ref.contains(point)) {
        return true;
      }
      items.removeChild(rect.elem);
      return false;
    });
  }
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
  const highIx = rectangles.reduce(
    (highIx, rects, ix) => (rects.length ? ix + 1 : highIx),
    0,
  );
  return btoa(
    JSON.stringify(
      rectangles
        .map((rects) =>
          rects.map((r) => {
            if (r.width === DEFAULT_WIDTH && r.height === DEFAULT_HEIGHT) {
              return [r.x, r.y];
            }
            return [r.x, r.y, r.width, r.height];
          }),
        )
        .slice(0, highIx),
      undefined,
      0,
    ),
  );
}

function updateURL(/** @type {SVGRectObj[][]} */ rectangles) {
  try {
    const data = generateData(rectangles);
    const url = new URL(location.href);
    if (data) {
      console.log(atob(data));
      url.searchParams.set('data', data);
    } else {
      url.searchParams.delete('data');
    }
    if (`${location.href}` !== `${url}`) {
      console.log('new state');
      window.history.pushState(
        {
          data,
        },
        '',
        url,
      );
    }
  } catch (_) {
    // ignore errors
  }
}

function isTextTarget(/** @type {HTMLElement} */ target) {
  if (!target) {
    return false;
  }
  if (target.localName !== 'input') {
    return false;
  }
  if (target.getAttribute('type') !== 'text') {
    return false;
  }
  return true;
}

function start() {
  let curPreset = 1;
  let curColor = 0;
  let removeMode = false;
  /** @type {SVGRectObj[][]} */
  const rectangles = colors.map(() => []);
  const bubbles = new BubbleSet();
  const main = document.getElementById('main');
  const svg = appendSVG(main, 'svg');
  const full = appendSVG(svg, 'rect');
  attr(full, { x: '0', y: '0', width: '100%', height: '100%' });
  style(full, { fill: 'none' });
  const items = appendSVG(svg, 'g');
  const paths = rectangles.map(() => appendSVG(svg, 'path'));
  const debug = appendSVG(svg, 'g');
  bubbles.debug(false);

  const controls = addControls({
    initPreset: curPreset,
    initIx: curColor,
    onPresetUpdate: (ix, create) => {
      curPreset = ix;
      if (create) {
        clearAll(items, rectangles);
        create(items, rectangles);
        update();
        updateURL(rectangles);
      }
    },
    onColorUpdate: (ix) => {
      curColor = ix;
      update();
    },
    onRemoveUpdate: (isRemove) => {
      removeMode = isRemove;
    },
    onDebugUpdate: (isDebug) => {
      bubbles.debug(isDebug);
      update();
    },
    onClear: () => {
      clearAll(items, rectangles);
      update();
      updateURL(rectangles);
    },
  });

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

  svg.addEventListener('click', (e) => {
    const ix = curColor;
    if (removeMode) {
      removeRect(items, rectangles, e.offsetX, e.offsetY);
    } else {
      addRect(
        items,
        rectangles[ix],
        colors[ix],
        rectFromPoint(e.offsetX, e.offsetY),
      );
    }
    controls.updatePreset(0);
    update();
    updateURL(rectangles);
  });

  window.addEventListener('keydown', (e) => {
    if (e.defaultPrevented) {
      return;
    }
    const target = /** @type {HTMLElement | null} */ (e.target);
    if (isTextTarget(target)) {
      return;
    }
    const matches = /Digit([0-9])/.exec(e.code);
    if (matches) {
      const digit = +matches[1];
      if (digit < rectangles.length) {
        controls.updateColor(digit);
        if (target && target.blur) {
          target.blur();
        }
        e.preventDefault();
      }
    }
  });

  const onShift = (/** @type {KeyboardEvent} */ e) => {
    const target = /** @type {HTMLElement | null} */ (e.target);
    if (isTextTarget(target)) {
      return;
    }
    if (e.key === 'Shift') {
      controls.setRemoveMode(e.shiftKey);
      if (target && target.blur) {
        target.blur();
      }
      e.preventDefault();
    }
  };
  window.addEventListener('keydown', onShift);
  window.addEventListener('keyup', onShift);

  function load(/** @type {string | null} */ data) {
    try {
      parseData(items, rectangles, data);
      controls.updatePreset(0);
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
