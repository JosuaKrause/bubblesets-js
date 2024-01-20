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

import {
  BSplineShapeGenerator,
  BubbleSet,
  PointPath,
  ShapeSimplifier,
} from './bubblesets.js';
import { addControls } from './controls.js';
import { COLORS, PRESETS, addRect, clearAll, removeRect } from './presets.js';
import {
  DEFAULT_HEIGHT,
  DEFAULT_WIDTH,
  appendSVG,
  attr,
  getSize,
  rectFromPoint,
  removeAllChilds,
  style,
} from './util.js';

/** @typedef {import("./presets").Preset} Preset */
/** @typedef {import("./util").SVGRectObj} SVGRectObj */
/** @typedef {import("./util").SVGLineObj} SVGLineObj */
/** @typedef {import("./util").RectState} RectState */
/** @typedef {import("./util").LineState} LineState */

function parseData(
  /** @type {SVGElement} */ svg,
  /** @type {RectState} */ rectState,
  /** @type {LineState} */ lineState,
  /** @type {number} */ defaultPresetIx,
  /** @type {string | null} */ presetId,
  /** @type {string | null} */ data,
) {
  clearAll(rectState, lineState);
  const presetIx = PRESETS.findIndex(
    (preset) => preset.id && preset.id === presetId,
  );
  const preset = presetIx >= 0 ? PRESETS[presetIx] : null;
  if (preset?.create) {
    const [width, height] = getSize(svg);
    preset.create(rectState, lineState, width, height);
    return presetIx;
  }
  if (!data) {
    const defaultPreset = PRESETS[defaultPresetIx];
    if (defaultPreset.create) {
      const [width, height] = getSize(svg);
      defaultPreset.create(rectState, lineState, width, height);
    }
    return defaultPresetIx;
  }
  JSON.parse(atob(data)).forEach(
    (/** @type {number[][]} */ rects, /** @type {number} */ ix) => {
      if (ix >= rectState.rectangles.length) {
        return;
      }
      rects.forEach((r) =>
        addRect(rectState, ix, COLORS[ix], {
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

/** @type {HTMLLinkElement | null} */
let CANONICAL = null;

function updateCanonical() {
  if (!CANONICAL) {
    const linkTag = document.createElement('link');
    linkTag.setAttribute('rel', 'canonical');
    CANONICAL = linkTag;
    document.head.appendChild(linkTag);
  }
  const url = new URL(location.href);
  const searchParams = new URLSearchParams();
  const preset = url.searchParams.get('preset');
  if (preset) {
    searchParams.set('preset', preset);
  }
  url.search = `${searchParams}`;
  url.hash = '';
  CANONICAL.href = `${url}`;
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
      window.history.pushState(
        {
          preset: presetId,
          data,
        },
        '',
        url,
      );
      updateCanonical();
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
  const defaultPad = 5;
  let curColor = 0;
  let removeMode = false;
  let pad = defaultPad;
  const bubbles = new BubbleSet();
  const main = document.getElementById('main');
  const svg = appendSVG(main, 'svg');
  const full = appendSVG(svg, 'rect');
  attr(full, { x: '0', y: '0', width: '100%', height: '100%' });
  style(full, { fill: 'none' });
  /** @type {RectState} */
  const rectState = {
    items: appendSVG(svg, 'g'),
    rectangles: COLORS.map(() => []),
  };
  /** @type {LineState} */
  const lineState = {
    elems: appendSVG(svg, 'g'),
    lines: COLORS.map(() => []),
  };
  const paths = COLORS.map(() => appendSVG(svg, 'path'));
  const debug = appendSVG(svg, 'g');
  bubbles.debug(false);

  const controls = addControls({
    initPreset: defaultPreset,
    initIx: curColor,
    initPad: defaultPad,
    minPad: 0,
    maxPad: 10,
    stepPad: 1,
    onPresetUpdate: (preset) => {
      if (preset.create) {
        clearAll(rectState, lineState);
        const [width, height] = getSize(svg);
        preset.create(rectState, lineState, width, height);
        update();
        updateURL(preset, rectState.rectangles);
      }
    },
    onColorUpdate: (ix) => {
      curColor = ix;
      update();
    },
    onRemoveUpdate: (isRemove) => {
      removeMode = isRemove;
    },
    onPadUpdate: (newPad) => {
      pad = newPad;
      update();
    },
    onDebugUpdate: (isDebug) => {
      bubbles.debug(isDebug);
      update();
    },
    onClear: () => {
      clearAll(rectState, lineState);
      update();
      updateURL(PRESETS[0], rectState.rectangles);
    },
  });

  function restangles(/** @type {number} */ ix) {
    return rectState.rectangles.flatMap((cur, curIx) => {
      if (curIx === ix) {
        return [];
      }
      return cur;
    });
  }

  function update() {
    removeAllChilds(debug);
    rectState.rectangles.forEach((rects, ix) => {
      updateOutline(
        rects,
        restangles(ix),
        lineState.lines[ix],
        COLORS[ix],
        paths[ix],
        ix,
      );
    });
  }

  function updateOutline(
    /** @type {SVGRectObj[]} */ rectangles,
    /** @type {SVGRectObj[]} */ otherRectangles,
    /** @type {SVGLineObj[]} */ lines,
    /** @type {string} */ color,
    /** @type {SVGElement} */ path,
    /** @type {number} */ ix,
  ) {
    // rectangles need to have the form { x: 0, y: 0, width: 0, height: 0 }
    // lines need to have the form { x1: 0, x2: 0, y1: 0, y2: 0 }
    // lines can be null to infer lines between rectangles automatically
    const list = bubbles.createOutline(
      BubbleSet.addPadding(rectangles, pad),
      BubbleSet.addPadding(otherRectangles, pad),
      lines.length ? lines : null,
    );
    // outline is a path that can be used for the attribute d of a path element
    const outline = new PointPath(list).transform([
      new ShapeSimplifier(0.0),
      new BSplineShapeGenerator(),
      new ShapeSimplifier(0.0),
    ]);
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
      removeRect(rectState, e.offsetX, e.offsetY);
    } else {
      addRect(rectState, ix, COLORS[ix], rectFromPoint(e.offsetX, e.offsetY));
    }
    clearAll(null, lineState);
    controls.updatePreset(0);
    update();
    updateURL(PRESETS[0], rectState.rectangles);
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
      const digit = +matches[1] - 1;
      if (digit >= 0 && digit < COLORS.length) {
        controls.updateColor(digit);
        curColor = digit;
        update();
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
        rectState,
        lineState,
        defaultPreset,
        presetId,
        data,
      );
      controls.updatePreset(newPresetIx);
    } catch (_) {
      // ignore errors
    }
    updateCanonical();
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
