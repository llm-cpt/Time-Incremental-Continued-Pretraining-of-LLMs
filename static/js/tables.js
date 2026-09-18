function sortTable(table, colIndex, th) {
  const tbody = table.querySelector('tbody');
  const rows = Array.from(tbody.querySelectorAll('tr'));
  const type = th.dataset.type || 'text';
  const dir = th.dataset.dir === 'asc' ? 'desc' : 'asc';

  table.querySelectorAll('thead th').forEach(function (h) {
    h.removeAttribute('data-dir');
    h.classList.remove('sorted-asc', 'sorted-desc');
  });
  th.dataset.dir = dir;
  th.classList.add(dir === 'asc' ? 'sorted-asc' : 'sorted-desc');

  rows.sort(function (a, b) {
    const cellA = a.children[colIndex];
    const cellB = b.children[colIndex];
    let valA = cellA.dataset.value !== undefined ? cellA.dataset.value : cellA.textContent.trim();
    let valB = cellB.dataset.value !== undefined ? cellB.dataset.value : cellB.textContent.trim();

    if (type === 'num') {
      const numA = valA === '' ? -Infinity : parseFloat(valA);
      const numB = valB === '' ? -Infinity : parseFloat(valB);
      return dir === 'asc' ? numA - numB : numB - numA;
    }
    return dir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
  });

  rows.forEach(function (row) {
    tbody.appendChild(row);
  });
}

function initSortableTables() {
  document.querySelectorAll('.sortable-table').forEach(function (table) {
    const headers = table.querySelectorAll('thead th[data-type]');
    headers.forEach(function (th, index) {
      th.addEventListener('click', function () {
        sortTable(table, index, th);
      });
    });
  });
}

const tableFilterState = new WeakMap();

function getFilterState(table) {
  if (!tableFilterState.has(table)) {
    tableFilterState.set(table, { text: '', toggleCol: null, toggleValue: '' });
  }
  return tableFilterState.get(table);
}

function applyRowVisibility(table) {
  const state = getFilterState(table);
  table.querySelectorAll('tbody tr').forEach(function (row) {
    const matchesText = state.text === '' || row.textContent.toLowerCase().includes(state.text);
    let matchesToggle = true;
    if (state.toggleCol !== null && state.toggleValue !== '') {
      const cell = row.children[state.toggleCol];
      const cellValue = cell.dataset.value !== undefined ? cell.dataset.value : cell.textContent.trim();
      matchesToggle = cellValue === state.toggleValue;
    }
    row.classList.toggle('row-hidden', !(matchesText && matchesToggle));
  });
}

function initTableFilters() {
  document.querySelectorAll('.table-filter').forEach(function (input) {
    const table = document.getElementById(input.dataset.filterTable);
    if (!table) return;
    input.addEventListener('input', function () {
      getFilterState(table).text = input.value.trim().toLowerCase();
      applyRowVisibility(table);
    });
  });
}

function initTableToggles() {
  document.querySelectorAll('.table-toggle').forEach(function (group) {
    const table = document.getElementById(group.dataset.toggleTable);
    if (!table) return;
    const col = parseInt(group.dataset.toggleCol, 10);
    const buttons = group.querySelectorAll('.toggle-btn');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) {
          b.classList.remove('is-active');
        });
        btn.classList.add('is-active');
        const state = getFilterState(table);
        state.toggleCol = col;
        state.toggleValue = btn.dataset.toggleValue;
        applyRowVisibility(table);
      });
    });
  });
}

const VISIBLE_ROWS = 8;

function initTableScrollLimits() {
  document.querySelectorAll('.table-wrap').forEach(function (wrap) {
    const table = wrap.querySelector('table');
    if (!table) return;
    const thead = table.querySelector('thead');
    const rows = table.querySelectorAll('tbody tr');
    if (!thead || rows.length <= VISIBLE_ROWS) return;

    let rowsHeight = 0;
    for (let i = 0; i < VISIBLE_ROWS; i++) {
      rowsHeight += rows[i].getBoundingClientRect().height;
    }
    const headHeight = thead.getBoundingClientRect().height;
    wrap.style.maxHeight = Math.ceil(headHeight + rowsHeight) + 'px';
    wrap.style.overflowY = 'auto';
  });
}

function initGroupHeaderSticky() {
  document.querySelectorAll('.sortable-table.has-group-header').forEach(function (table) {
    const headRows = table.querySelectorAll('thead tr');
    if (headRows.length < 2) return;
    const firstRowHeight = headRows[0].getBoundingClientRect().height;
    headRows[1].querySelectorAll('th').forEach(function (th) {
      th.style.top = firstRowHeight + 'px';
    });
  });
}

document.addEventListener('DOMContentLoaded', function () {
  initSortableTables();
  initTableFilters();
  initTableToggles();
  initGroupHeaderSticky();
  initTableScrollLimits();
});
