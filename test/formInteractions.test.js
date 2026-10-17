import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

function loadInteractions() {
  const source = readFileSync(
    new URL('../public/zoho-widget/app/form-interactions.js', import.meta.url),
    'utf8'
  );
  const context = vm.createContext({ window: {} });
  vm.runInContext(source, context);
  return context.window.DoorReductionFormInteractions;
}

const interactions = loadInteractions();

function control(name, options = {}) {
  return {
    name,
    disabled: !!options.disabled,
    hidden: !!options.hidden,
    readOnly: !!options.readOnly,
    focused: false,
    selected: false,
    focus() { this.focused = true; },
    select() { this.selected = true; },
    getAttribute(key) { return key === 'aria-disabled' && options.ariaDisabled ? 'true' : null; },
    getClientRects() { return options.invisible ? [] : [{}]; },
    matches() { return options.matches !== false; },
  };
}

test('filterOptions searches displayed text case-insensitively without changing values', () => {
  const result = interactions.filterOptions([
    { value: 'ORB', label: 'Oil Rubbed Bronze' },
    { value: 'WHT', label: 'White' },
  ], 'bronze');
  assert.deepEqual(JSON.parse(JSON.stringify(result)), [
    { value: 'ORB', label: 'Oil Rubbed Bronze' },
  ]);
});

test('withCurrentOption retains a CRM value missing from current metadata', () => {
  const result = interactions.withCurrentOption(['White'], 'Legacy Bronze');
  assert.deepEqual(JSON.parse(JSON.stringify(result)), [
    { value: 'Legacy Bronze', label: 'Legacy Bronze' },
    { value: 'White', label: 'White' },
  ]);
});

test('Enter does not select an option until one is explicitly highlighted', () => {
  const options = ['Select', 'Bronze', 'White'];
  assert.equal(interactions.getHighlightedOption(options, -1), null);
  assert.equal(interactions.getHighlightedOption(options, 0), 'Select');
  assert.equal(interactions.getHighlightedOption(options, 1), 'Bronze');
});

test('typing searches real values without offering the Select placeholder', () => {
  const results = interactions.getSearchResults([
    { value: '', label: 'Select' },
    { value: 'Satin Nickel', label: 'Satin Nickel' },
  ], 's', true);
  assert.deepEqual(JSON.parse(JSON.stringify(results)), [
    { value: 'Satin Nickel', label: 'Satin Nickel' },
  ]);
});

test('a non-empty search with no results is invalid and must retain focus', () => {
  assert.equal(interactions.hasInvalidSearch('wrong value', true, []), true);
  assert.equal(interactions.hasInvalidSearch('', true, []), false);
  assert.equal(interactions.hasInvalidSearch('bronze', true, ['Bronze']), false);
  assert.equal(interactions.hasInvalidSearch('wrong value', false, []), false);
});

test('Enter advances and Shift+Enter reverses while skipping unavailable controls', () => {
  const first = control('first');
  const readOnly = control('read-only', { readOnly: true });
  const disabled = control('disabled', { disabled: true });
  const hidden = control('hidden', { invisible: true });
  const second = control('second');
  const reduce = control('reduce', { matches: false });
  const all = [first, readOnly, disabled, hidden, second, reduce];
  const root = { querySelectorAll: () => all };

  let prevented = false;
  assert.equal(interactions.moveFocusOnEnter({
    key: 'Enter', target: first, preventDefault() { prevented = true; },
  }, root), true);
  assert.equal(second.focused, true);
  assert.equal(second.selected, true);
  assert.equal(prevented, true);

  assert.equal(interactions.moveFocusOnEnter({
    key: 'Enter', shiftKey: true, target: second, preventDefault() {},
  }, root), true);
  assert.equal(first.focused, true);
});

test('Enter navigation yields to open comboboxes and non-input controls', () => {
  const openCombobox = control('open');
  openCombobox.getAttribute = key => key === 'aria-expanded' ? 'true' : null;
  const root = { querySelectorAll: () => [openCombobox, control('next')] };
  assert.equal(interactions.moveFocusOnEnter({ key: 'Enter', target: openCombobox }, root), false);

  const textarea = control('notes', { matches: false });
  assert.equal(interactions.moveFocusOnEnter({ key: 'Enter', target: textarea }, root), false);
});

test('composition and modified Enter do not move focus', () => {
  const first = control('first');
  const root = { querySelectorAll: () => [first, control('next')] };
  assert.equal(interactions.moveFocusOnEnter({ key: 'Enter', isComposing: true, target: first }, root), false);
  assert.equal(interactions.moveFocusOnEnter({ key: 'Enter', ctrlKey: true, target: first }, root), false);
});
