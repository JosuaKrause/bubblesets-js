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

import { Point, Rectangle } from './bubblesets.js';
import {
  DEFAULT_HEIGHT,
  DEFAULT_WIDTH,
  appendSVG,
  attr,
  centerPointList,
  removeAllChilds,
  style,
} from './util.js';

/** @typedef {import('./bubblesets').RectObj} RectObj */
/** @typedef {import('./bubblesets').LineObj} LineObj */
/** @typedef {import("./util").RectState} RectState */
/** @typedef {import("./util").LineState} LineState */
/**
 * @typedef {{
 *  id: string | null,
 *  name: string,
 *  create: (rectState: RectState, lineState: LineState, width: number, height: number) => void | null,
 * }} Preset
 */

export function addRect(
  /** @type {RectState} */ rectState,
  /** @type {number} */ ix,
  /** @type {string} */ color,
  /** @type {RectObj} */ rect,
) {
  const elem = appendSVG(rectState.items, 'rect');
  attr(elem, rect);
  style(elem, {
    stroke: 'black',
    'stroke-width': `${1}`,
    fill: color,
  });
  rectState.rectangles[ix].push({
    ...rect,
    elem: elem,
  });
}

export function removeRect(
  /** @type {RectState} */ rectState,
  /** @type {number} */ x,
  /** @type {number} */ y,
) {
  const point = new Point(x, y);
  const ref = new Rectangle();
  for (let ix = 0; ix < rectState.rectangles.length; ix += 1) {
    rectState.rectangles[ix] = rectState.rectangles[ix].filter((rect) => {
      ref.rect(rect);
      if (!ref.contains(point)) {
        return true;
      }
      rectState.items.removeChild(rect.elem);
      return false;
    });
  }
}

export function addLine(
  /** @type {LineState} */ lineState,
  /** @type {number} */ ix,
  /** @type {LineObj} */ line,
) {
  const elem = appendSVG(lineState.elems, 'line');
  attr(elem, line);
  style(elem, {
    stroke: 'black',
    'stroke-width': `${1}`,
  });
  lineState.lines[ix].push({
    ...line,
    elem: elem,
  });
}

export function clearAll(
  /** @type {RectState | null} */ rectState,
  /** @type {LineState | null} */ lineState,
) {
  if (rectState) {
    removeAllChilds(rectState.items);
    COLORS.forEach((_, ix) => {
      rectState.rectangles[ix] = [];
    });
  }
  if (lineState) {
    removeAllChilds(lineState.elems);
    COLORS.forEach((_, ix) => {
      lineState.lines[ix] = [];
    });
  }
}

function fromPointList(
  /** @type {RectState} */ rectState,
  /** @type {number[][][]} */ points,
  /** @type {number} */ rectWidth = DEFAULT_WIDTH,
  /** @type {number} */ rectHeight = DEFAULT_HEIGHT,
) {
  points.forEach((colorPoints, ix) => {
    if (ix >= COLORS.length) {
      return;
    }
    colorPoints.forEach((point) => {
      addRect(rectState, ix, COLORS[ix], {
        x: point[0],
        y: point[1],
        width: rectWidth,
        height: rectHeight,
      });
    });
  });
}

export const COLORS = [
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
export const PRESETS = [
  {
    id: null,
    name: 'Custom',
    create: null,
  },
  {
    id: 'bigb',
    name: 'Big B',
    create: (rectState, lineState, width, height) => {
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
      fromPointList(rectState, centerPointList(points, width, height));
    },
  },
  {
    id: 'cliques',
    name: 'Cliques',
    create: (rectState, lineState, width, height) => {
      const mul = 3;
      const size = 10 * mul;

      // nodes [ x, y ]
      const nodes = centerPointList(
        [
          [
            [100, 50],
            [150, 100],
            [50, 100],
            [100, 150],
            [60, 210],
            [140, 210],
          ],
        ],
        width,
        height,
        0,
        0,
        mul,
      )[0];
      // edges [ source_ix, destination_ix ]
      const edges = [
        [0, 2],
        [0, 3],
        [1, 2],
        [1, 3],
        [2, 3],
        [3, 4],
        [3, 5],
        [4, 5],
      ];

      // clique rectangle indices
      const rectangleGroups = [
        [0, 2, 3],
        [1, 2, 3],
        [3, 4, 5],
      ];

      function ixToRectangle(/** @type {number} */ ix) {
        return {
          x: nodes[ix][0] - size / 2,
          y: nodes[ix][1] - size / 2,
          width: size,
          height: size,
        };
      }

      function ixsToEdge(/** @type {number[]} */ edge) {
        return {
          x1: nodes[edge[0]][0],
          y1: nodes[edge[0]][1],
          x2: nodes[edge[1]][0],
          y2: nodes[edge[1]][1],
        };
      }

      function getEdges(/** @type {number[]} */ rects) {
        /** @type {{ [key: string]: boolean }} */
        const rSet = {};
        rects.forEach((ix) => {
          rSet[`${ix}`] = true;
        });
        // only consider fully contained edges
        return edges
          .filter((e) => rSet[`${e[0]}`] && rSet[`${e[1]}`])
          .map(ixsToEdge);
      }

      rectangleGroups.forEach((rects, ix) => {
        rects.forEach((rIx) => {
          addRect(rectState, ix, COLORS[ix], ixToRectangle(rIx));
        });
        getEdges(rects).forEach((l) => {
          addLine(lineState, ix, l);
        });
      });
    },
  },
  {
    id: 'grid',
    name: 'Grid',
    create: (rectState, lineState, width, height) => {
      const rows = 10;
      const cols = 15;
      const size = 40;
      const gap = 60;
      /** @type {number[][][]} */
      const points = [[], []];
      for (let x = 0; x < cols; x += 1) {
        for (let y = 0; y < rows; y += 1) {
          const isA = (x & 1) !== (y & 1);
          const rectIx = isA ? 0 : 1;
          points[rectIx].push([x * gap + size, y * gap + size]);
        }
      }
      fromPointList(
        rectState,
        centerPointList(points, width, height, size, size),
        size,
        size,
      );
    },
  },
];
