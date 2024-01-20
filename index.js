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
 *  id: string | null,
 *  name: string,
 *  create: (items: SVGElement, rectangles: SVGRectObj[][], width: number, height: number) => void | null,
 * }} Preset
 */
/**
 * @typedef {{
 *  initPreset: number,
 *  initIx: number,
 *  onPresetUpdate: (preset: Preset) => void,
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

function getSize(/** @type {HTMLElement | SVGElement} */ elem) {
  let width = elem.clientWidth;
  let height = elem.clientHeight;
  if (width === 0 || height === 0) {
    // taking care of firefox
    const bbox = elem.getBoundingClientRect();
    width = bbox.width;
    height = bbox.height;
  }
  return [width, height];
}

function centerPointList(
  /** @type {number[][][]} */ points,
  /** @type {number} */ width,
  /** @type {number} */ height,
) {
  const [sx, sy, total] = points.reduce(
    (prev, ps) => {
      return ps.reduce(
        (pv, p) => [pv[0] + p[0], pv[1] + p[1], pv[2] + 1],
        [prev[0], prev[1], prev[2]],
      );
    },
    [0, 0, 0],
  );
  return points.map((ps) => {
    return ps.map((p) => {
      return [
        p[0] + width / 2 - sx / total - DEFAULT_WIDTH / 2,
        p[1] + height / 2 - sy / total - DEFAULT_HEIGHT / 2,
      ];
    });
  });
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

/** @type {Preset[]} */
const presets = [
  {
    id: null,
    name: 'Custom',
    create: null,
  },
  {
    id: 'bigb',
    name: 'Big B',
    create: (items, rectangles, width, height) => {
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
      fromPointList(items, rectangles, centerPointList(points, width, height));
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
    controls.onPresetUpdate(presets[newIx]);
  });
  selectPreset.value = `${controls.initPreset}`;
  div.appendChild(selectPreset);
  main.appendChild(div);
  return {
    updatePreset: (/** @type {number} */ ix) => {
      if (selectPreset.value !== `${ix}`) {
        selectPreset.value = `${ix}`;
      }
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
      if (selectColor.value !== `${ix}`) {
        selectColor.value = `${ix}`;
      }
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
  /** @type {SVGElement} */ svg,
  /** @type {SVGElement} */ items,
  /** @type {SVGRectObj[][]} */ rectangles,
  /** @type {number} */ defaultPresetIx,
  /** @type {string | null} */ presetId,
  /** @type {string | null} */ data,
) {
  clearAll(items, rectangles);
  const presetIx = presets.findIndex(
    (preset) => preset.id && preset.id === presetId,
  );
  const preset = presetIx >= 0 ? presets[presetIx] : null;
  if (preset?.create) {
    const [width, height] = getSize(svg);
    preset.create(items, rectangles, width, height);
    return presetIx;
  }
  if (!data) {
    const defaultPreset = presets[defaultPresetIx];
    if (defaultPreset.create) {
      const [width, height] = getSize(svg);
      defaultPreset.create(items, rectangles, width, height);
    }
    return defaultPresetIx;
  }
  JSON.parse(atob(data)).forEach(
    (/** @type {number[][]} */ rects, /** @type {number} */ ix) => {
      if (ix >= rectangles.length) {
        return;
      }
      rects.forEach((r) =>
        addRect(items, rectangles[ix], colors[ix], {
          x: +r[0],
          y: +r[1],
          width: +(r[2] ?? DEFAULT_WIDTH),
          height: +(r[3] ?? DEFAULT_HEIGHT),
        }),
      );
    },
  );
  return 0;
}

function generateData(/** @type {SVGRectObj[][]} */ rectangles) {
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

function updateURL(
  /** @type {Preset} */ preset,
  /** @type {SVGRectObj[][]} */ rectangles,
) {
  try {
    let data;
    const url = new URL(location.href);
    const presetId = preset.id;
    if (presetId) {
      data = null;
      url.searchParams.set('preset', presetId);
    } else {
      data = generateData(rectangles);
      url.searchParams.delete('preset');
    }
    if (data) {
      url.searchParams.set('data', data);
    } else {
      url.searchParams.delete('data');
    }
    if (`${location.href}` !== `${url}`) {
      console.log('new state');
      window.history.pushState(
        {
          preset: presetId,
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
  const defaultPreset = 1;
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
    initPreset: defaultPreset,
    initIx: curColor,
    onPresetUpdate: (preset) => {
      if (preset.create) {
        clearAll(items, rectangles);
        const [width, height] = getSize(svg);
        preset.create(items, rectangles, width, height);
        update();
        updateURL(preset, rectangles);
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
      updateURL(presets[0], rectangles);
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
    updateURL(presets[0], rectangles);
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
      removeMode = e.shiftKey;
      controls.setRemoveMode(removeMode);
      if (target && target.blur) {
        target.blur();
      }
      e.preventDefault();
    }
  };
  window.addEventListener('keydown', onShift);
  window.addEventListener('keyup', onShift);

  function load(
    /** @type {string | null} */ presetId,
    /** @type {string | null} */ data,
  ) {
    try {
      const newPresetIx = parseData(
        svg,
        items,
        rectangles,
        defaultPreset,
        presetId,
        data,
      );
      controls.updatePreset(newPresetIx);
    } catch (_) {
      // ignore errors
    }
    update();
  }

  const url = new URL(location.href);
  const loadPresetId = url.searchParams.get('preset');
  const loadData = url.searchParams.get('data');
  load(loadPresetId, loadData);
  window.addEventListener('popstate', (event) => {
    /** @type {string | null} */
    const presetId = event.state?.preset;
    /** @type {string | null} */
    const data = event.state?.data;
    load(presetId ?? null, data ?? null);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start);
} else {
  start();
}
