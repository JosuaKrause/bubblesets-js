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

import { COLORS, PRESETS } from './presets.js';
import { attr } from './util.js';

/** @typedef {import('./presets').Preset} Preset */
/**
 * @typedef {{
 *  initPreset: number,
 *  initIx: number,
 *  initPad: number,
 *  minPad: number,
 *  maxPad: number,
 *  stepPad: number,
 *  onPresetUpdate: (preset: Preset) => void,
 *  onColorUpdate: (ix: number) => void,
 *  onPadUpdate: (newPad: number) => void,
 *  onDebugUpdate: (isDebug: boolean) => void,
 *  onRemoveUpdate: (isRemove: boolean) => void,
 *  onClear: () => void,
 * }} Controls
 */

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
  PRESETS.forEach((preset, ix) => {
    const option = document.createElement('option');
    option.value = `${ix}`;
    option.innerText = preset.name;
    selectPreset.appendChild(option);
  });
  selectPreset.addEventListener('change', () => {
    const newIx = +selectPreset.value;
    controls.onPresetUpdate(PRESETS[newIx]);
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
  COLORS.forEach((_, ix) => {
    const option = document.createElement('option');
    option.value = `${ix}`;
    option.innerText = `Group ${ix + 1}`;
    selectColor.appendChild(option);
  });
  selectColor.addEventListener('change', () => {
    const newIx = +selectColor.value;
    selectColor.style.backgroundColor = COLORS[newIx];
    controls.onColorUpdate(newIx);
  });
  selectColor.value = `${controls.initIx}`;
  selectColor.style.backgroundColor = COLORS[controls.initIx];
  div.appendChild(selectColor);
  main.appendChild(div);
  return {
    updateColor: (/** @type {number} */ ix) => {
      if (selectColor.value !== `${ix}`) {
        selectColor.value = `${ix}`;
        selectColor.style.backgroundColor = COLORS[ix];
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

function addPaddingSlider(
  /** @type {HTMLElement} */ main,
  /** @type {Controls} */ controls,
) {
  const div = document.createElement('div');
  const range = document.createElement('input');
  addLabel(div, range, 'pad-range', 'Padding:');
  const initValue = controls.initPad;
  const maxValue = controls.maxPad;
  const minValue = controls.minPad;
  const step = controls.stepPad;
  attr(range, {
    type: 'range',
    min: `${minValue}`,
    max: `${maxValue}`,
    step: `${step}`,
  });
  range.classList.add('range');
  const edit = document.createElement('input');
  attr(edit, {
    id: `pad-range-edit`,
    name: `pad-range-edit`,
    type: 'text',
    value: `${initValue}`,
  });
  edit.classList.add('rangeedit');
  edit.value = `${initValue}`;
  range.value = `${initValue}`;
  edit.addEventListener('change', () => {
    const evalue = +edit.value;
    if (Number.isFinite(evalue)) {
      controls.onPadUpdate(evalue);
      range.value = `${evalue}`;
      edit.classList.remove('invalid');
    } else {
      edit.classList.add('invalid');
    }
  });
  range.addEventListener('input', () => {
    const evalue = +edit.value;
    const rvalue = +range.value;
    if (evalue !== rvalue) {
      controls.onPadUpdate(rvalue);
      edit.value = `${rvalue}`;
      edit.classList.remove('invalid');
    }
  });
  div.appendChild(edit);
  div.appendChild(range);
  main.appendChild(div);
  return {};
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

export function addControls(/** @type {Controls} */ controls) {
  const top = document.getElementById('topbar');
  const presetControls = addPresetSelect(top, controls);
  const colorControls = addColorSelect(top, controls);
  const removeControls = addRemoveToggle(top, controls);
  addDivider(top);
  const paddingControls = addPaddingSlider(top, controls);
  const debugControls = addDebugToggle(top, controls);
  const clearControls = addRemoveAll(top, controls);
  const footNormal = document.createElement('div');
  footNormal.classList.add('normalonly');
  footNormal.textContent =
    'Add boxes by clicking and remove boxes via Shift+Click.';
  const footMobile = document.createElement('div');
  footMobile.classList.add('mobileonly');
  footMobile.textContent =
    'Add boxes by tapping. Select "Remove" to remove boxes instead.';
  const footer = document.getElementById('footer');
  footer.appendChild(footNormal);
  footer.appendChild(footMobile);
  return {
    ...presetControls,
    ...colorControls,
    ...removeControls,
    ...paddingControls,
    ...debugControls,
    ...clearControls,
  };
}
