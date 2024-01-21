/**
 * Copyright 2014 Josua Krause, Christopher Collins
 * Copyright 2024 Josua Krause
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
 *  items: SVGElement,
 *  rectangles: SVGRectObj[][],
 * }} RectState
 */
/**
 * @typedef {{
 *  x1: number,
 *  y1: number,
 *  x2: number,
 *  y2: number,
 *  elem: SVGElement,
 * }} SVGLineObj
 */
/**
 * @typedef {{
 *  elems: SVGElement,
 *  lines: SVGLineObj[][],
 * }} LineState
 */

export const DEFAULT_WIDTH = 40;
export const DEFAULT_HEIGHT = 30;

export function attr(
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

export function style(
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

export function appendSVG(
  /** @type {HTMLElement | SVGElement} */ parent,
  /** @type {string} */ name,
) {
  return parent.appendChild(
    document.createElementNS('http://www.w3.org/2000/svg', name),
  );
}

export function removeAllChilds(/** @type {SVGElement} */ parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

export function getSize(/** @type {HTMLElement | SVGElement} */ elem) {
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

export function rectFromPoint(
  /** @type {number} */ cx,
  /** @type {number} */ cy,
) {
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

export function centerPointList(
  /** @type {number[][][]} */ points,
  /** @type {number} */ width,
  /** @type {number} */ height,
  /** @type {number} */ rectWidth = DEFAULT_WIDTH,
  /** @type {number} */ rectHeight = DEFAULT_HEIGHT,
  /** @type {number} */ mul = 1,
) {
  const [sx, sy, total] = points.reduce(
    (prev, ps) => {
      return ps.reduce(
        (pv, p) => [pv[0] + p[0] * mul, pv[1] + p[1] * mul, pv[2] + 1],
        [prev[0], prev[1], prev[2]],
      );
    },
    [0, 0, 0],
  );
  return points.map((ps) => {
    return ps.map((p) => {
      return [
        p[0] * mul + width / 2 - sx / total - rectWidth / 2,
        p[1] * mul + height / 2 - sy / total - rectHeight / 2,
      ];
    });
  });
}
