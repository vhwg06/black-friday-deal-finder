// The board: hash routes, the filter controls, and rendering. The deals live in data.js,
// the filter rules in filters.js, the HTML in views.js — this file only wires them together.
//
//   #/                              the board, filters from the controls
//   #/?cat=TVs&store=Best+Buy&min=40&sort=saved&real=1&q=sony
//                                   the board with filters preset (shareable, screenshottable)
//   #/deal/<id>                     one deal, with its verdict and cross-store comparison
//
// window.__shotReady is false while a page renders and true once it is on screen, so a
// screenshot script knows when to capture.

import { CATEGORIES, SOURCES, STORES, deals } from './data.js';
import { boardStats, filterDeals, sameProductElsewhere, sortDeals } from './filters.js';
import { dealList, dealPage, methodSection, missingPage } from './views.js';

const app = document.getElementById('app');
const board = document.getElementById('board');

const state = { query: '', category: 'All', store: 'All', minDiscount: 0, sort: 'discount', realOnly: false };

function readHashParams() {
  const [path, queryString] = location.hash.replace(/^#/, '').split('?');
  const params = new URLSearchParams(queryString ?? '');
  if (params.has('cat')) state.category = params.get('cat');
  if (params.has('store')) state.store = params.get('store');
  if (params.has('min')) state.minDiscount = Number(params.get('min')) || 0;
  if (params.has('sort')) state.sort = params.get('sort');
  if (params.has('real')) state.realOnly = params.get('real') === '1';
  if (params.has('q')) state.query = params.get('q');
  return path || '/';
}

function option(value, label, selected) {
  return `<option value="${value}"${value === selected ? ' selected' : ''}>${label}</option>`;
}

function renderControls() {
  board.innerHTML = `<form id="filters" class="filters" aria-label="Find a deal">
  <label>Search <input id="f-query" type="search" placeholder="Product, store, category…" value=""></label>
  <label>Category <select id="f-category">
    ${option('All', 'All categories', state.category)}
    ${CATEGORIES.map((c) => option(c, c, state.category)).join('')}
  </select></label>
  <label>Store <select id="f-store">
    ${option('All', 'All stores', state.store)}
    ${STORES.map((s) => option(s, s, state.store)).join('')}
  </select></label>
  <label>Discount <select id="f-min">
    ${option('0', 'Any discount', '0')}
    ${option('20', '20% off or more', '20')}
    ${option('30', '30% off or more', '30')}
    ${option('40', '40% off or more', '40')}
    ${option('50', '50% off or more', '50')}
  </select></label>
  <label>Sort <select id="f-sort">
    ${option('discount', 'Biggest % off', state.sort)}
    ${option('saved', 'Most money saved', state.sort)}
    ${option('price', 'Lowest price', state.sort)}
    ${option('name', 'Name A–Z', state.sort)}
  </select></label>
  <label class="real-only"><input id="f-real" type="checkbox"${state.realOnly ? ' checked' : ''}> Real deals only</label>
</form>
<div id="results"></div>
${methodSection(SOURCES)}`;

  const query = document.getElementById('f-query');
  const category = document.getElementById('f-category');
  const store = document.getElementById('f-store');
  const min = document.getElementById('f-min');
  const sort = document.getElementById('f-sort');
  const real = document.getElementById('f-real');

  query.value = state.query;
  min.value = String(state.minDiscount);

  const apply = () => {
    state.query = query.value;
    state.category = category.value;
    state.store = store.value;
    state.minDiscount = Number(min.value);
    state.sort = sort.value;
    state.realOnly = real.checked;
    renderResults();
  };
  for (const el of [query, category, store, min, sort, real]) {
    el.addEventListener('input', apply);
    el.addEventListener('change', apply);
  }
}

function renderResults() {
  const results = document.getElementById('results');
  if (!results) return;
  const shown = sortDeals(filterDeals(deals, state), state.sort);
  results.innerHTML = dealList(shown, boardStats(deals));
}

function render() {
  window.__shotReady = false;
  const path = readHashParams();
  const match = path.match(/^\/deal\/([^/?]+)/);
  if (match) {
    const found = deals.find((d) => d.id === decodeURIComponent(match[1]));
    document.title = `${found ? found.title : 'Not found'} | Deal Beacon`;
    board.innerHTML = '';
    app.innerHTML = found ? dealPage(found, sameProductElsewhere(deals, found)) : missingPage();
  } else {
    document.title = 'Deal Beacon — Black Friday 2026';
    app.innerHTML = '';
    renderControls();
    renderResults();
  }
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

window.addEventListener('hashchange', render);
render();
