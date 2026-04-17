/* ============================================================
   AI Safety Corner - Personal Notes Index JS
   Handles search, type filtering, shelf rendering, and shelf expansion.
   Requires notes-data.js to be loaded first.
   ============================================================ */

(function () {
  'use strict';

  /* ============================================================
     Configuration
     ============================================================ */

  const SHELVES = [
    {
      id: 'start-here',
      title: 'Start Here',
      desc: 'Simple introductions to AI safety - no deep technical background needed.',
    },
    {
      id: 'foundations',
      title: 'Build Your Foundations',
      desc: 'Core concepts and skills every AI safety researcher should know.',
    },
    {
      id: 'deeper',
      title: 'Go Deeper',
      desc: 'More technical or nuanced pieces for readers ready to move beyond the basics.',
    },
  ];

  const INITIAL_ITEMS_PER_SHELF = 6;
  const SEARCH_DEBOUNCE_MS = 150;

  const TYPE_LABELS = {
    motivation: 'Motivation',
    learning: 'Learning',
    research: 'Research',
    reflection: 'Reflection',
  };

  /* ============================================================
     State and DOM references
     ============================================================ */

  const state = {
    search: '',
    activeType: null,
    expandedShelves: new Set(),
  };

  const searchInput = document.getElementById('crSearch');
  const typePills = document.querySelectorAll('.cr-pill[data-type]');
  const gridEl = document.getElementById('crGrid');
  const emptyEl = document.getElementById('crEmpty');
  const resultsLineEl = document.querySelector('.cr-results-line');
  const countEl = document.getElementById('crResultsCount');
  const totalCountEl = document.getElementById('crTotalCount');
  const clearBtn = document.getElementById('crClearBtn');
  const emptyResetBtn = document.getElementById('crEmptyReset');

  /* ============================================================
     Boot
     ============================================================ */

  function init() {
    if (typeof CORE_READINGS === 'undefined' || !Array.isArray(CORE_READINGS)) return;

    updateTotalCount();
    bindEvents();
    render();
  }

  function updateTotalCount() {
    if (!totalCountEl) return;

    const total = CORE_READINGS.length;
    totalCountEl.textContent = formatCount(total, 'note');
  }

  /* ============================================================
     Events
     ============================================================ */

  function bindEvents() {
    let searchDebounce;

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        clearTimeout(searchDebounce);
        searchDebounce = setTimeout(() => {
          state.search = searchInput.value.trim().toLowerCase();
          render();
        }, SEARCH_DEBOUNCE_MS);
      });
    }

    typePills.forEach(button => {
      button.addEventListener('click', () => {
        toggleTypeFilter(button);
        render();
      });
    });

    if (clearBtn) clearBtn.addEventListener('click', resetFilters);
    if (emptyResetBtn) emptyResetBtn.addEventListener('click', resetFilters);

    if (gridEl) {
      gridEl.addEventListener('click', event => {
        const toggle = event.target.closest('.cr-shelf-more');
        if (!toggle) return;

        toggleShelf(toggle.dataset.shelf);
        render();
      });
    }
  }

  function toggleTypeFilter(button) {
    const type = button.dataset.type;
    const isAlreadyActive = state.activeType === type;

    state.activeType = isAlreadyActive ? null : type;

    typePills.forEach(pill => {
      pill.classList.toggle('is-active', pill.dataset.type === state.activeType);
    });
  }

  function toggleShelf(shelfId) {
    if (!shelfId) return;

    if (state.expandedShelves.has(shelfId)) {
      state.expandedShelves.delete(shelfId);
    } else {
      state.expandedShelves.add(shelfId);
    }
  }

  function resetFilters() {
    state.search = '';
    state.activeType = null;

    if (searchInput) searchInput.value = '';
    typePills.forEach(button => button.classList.remove('is-active'));

    render();
  }

  /* ============================================================
     Filtering
     ============================================================ */

  function getFilteredReadings() {
    return CORE_READINGS.filter(reading => {
      return matchesSearch(reading) && matchesType(reading);
    });
  }

  function matchesSearch(reading) {
    if (!state.search) return true;

    const query = state.search;
    const notesText = (reading.notes || []).flatMap(n => [n.heading, n.body]);
    const searchableText = [
      reading.title,
      reading.summary,
      ...notesText,

    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return searchableText.includes(query);
  }

  function matchesType(reading) {
    return !state.activeType || reading.contentType === state.activeType;
  }

  function hasActiveFilters() {
    return Boolean(state.search || state.activeType);
  }

  /* ============================================================
     Rendering
     ============================================================ */

  function render() {
    const readings = getFilteredReadings();
    const isFiltered = hasActiveFilters();

    updateResultsUi(readings.length, isFiltered);

    if (readings.length === 0) {
      renderEmptyState();
      return;
    }

    if (emptyEl) emptyEl.classList.remove('is-visible');
    if (gridEl) gridEl.innerHTML = renderShelves(readings);

    revealCards();
  }

  function updateResultsUi(count, isFiltered) {
    if (countEl) countEl.textContent = formatCount(count, 'entry');
    if (clearBtn) clearBtn.classList.toggle('is-visible', isFiltered);
    if (resultsLineEl) resultsLineEl.classList.toggle('is-visible', isFiltered);
  }

  function renderEmptyState() {
    if (gridEl) gridEl.innerHTML = '';
    if (emptyEl) emptyEl.classList.add('is-visible');
  }

  function renderShelves(readings) {
    return SHELVES.map(shelf => renderShelf(shelf, readings)).join('');
  }

  function renderShelf(shelf, readings) {
    const shelfReadings = readings.filter(reading => reading.group === shelf.id);
    if (shelfReadings.length === 0) return '';

    const isExpanded = state.expandedShelves.has(shelf.id);
    const visibleReadings = isExpanded
      ? shelfReadings
      : shelfReadings.slice(0, INITIAL_ITEMS_PER_SHELF);

    return `
      <section class="cr-shelf" data-group="${escAttr(shelf.id)}">
        ${renderShelfHeader(shelf)}
        <div class="cr-shelf-grid">
          ${visibleReadings.map(buildCard).join('')}
        </div>
        ${renderShelfToggle(shelf.id, shelfReadings.length, visibleReadings.length, isExpanded)}
      </section>
    `;
  }

  function renderShelfHeader(shelf) {
    return `
      <div class="cr-shelf-header">
        <div class="cr-shelf-heading">
          <div class="cr-shelf-heading-text">
            <h2 class="cr-shelf-title">${escHtml(shelf.title)}</h2>
            <p class="cr-shelf-desc">${escHtml(shelf.desc)}</p>
          </div>
        </div>
        <div class="cr-shelf-divider"></div>
      </div>
    `;
  }

  function renderShelfToggle(shelfId, totalCount, visibleCount, isExpanded) {
    if (totalCount <= INITIAL_ITEMS_PER_SHELF) return '';

    const hiddenCount = totalCount - visibleCount;
    const toggleText = isExpanded ? 'Show fewer' : `Show ${hiddenCount} more`;
    const arrow = isExpanded ? 'Up' : 'Down';

    return `
      <div class="cr-shelf-footer">
        <button
          class="cr-shelf-more"
          type="button"
          data-shelf="${escAttr(shelfId)}"
          aria-expanded="${isExpanded ? 'true' : 'false'}"
        >
          ${escHtml(toggleText)}
          <span aria-hidden="true">${arrow}</span>
        </button>
      </div>
    `;
  }

  function buildCard(reading) {
    const typeName = TYPE_LABELS[reading.contentType] || reading.contentType;
    const excerpt = truncate(reading.summary, 150);
    const readTime = formatReadingTime(reading.readingTime);

    return `
      <a
        class="cr-card"
        href="note.html?slug=${encodeURIComponent(reading.slug)}"
        aria-label="${escAttr(reading.title)} - ${escAttr(typeName)}"
      >
        <div class="cr-card-topline">
          <span class="cr-type-badge cr-type-badge--${escAttr(reading.contentType)}">${escHtml(typeName)}</span>
        </div>
        <div class="cr-card-body">
          <h3 class="cr-card-title">${escHtml(reading.title)}</h3>
          <p class="cr-card-excerpt">${escHtml(excerpt)}</p>
        </div>
        <div class="cr-card-footer">
          <span class="cr-card-time">
            <span>${escHtml(readTime)}</span>
            <span class="card-read-arrow" aria-hidden="true"></span>
          </span>
        </div>
      </a>
    `;
  }

  function revealCards() {
    if (!gridEl) return;

    gridEl.querySelectorAll('.cr-card').forEach((card, index) => {
      card.classList.add('reveal');
      card.style.transitionDelay = `${Math.min(index, 12) * 0.04}s`;
      requestAnimationFrame(() => card.classList.add('is-visible'));
    });
  }

  /* ============================================================
     Helpers
     ============================================================ */

  function formatCount(count, noun) {
    const plurals = {
      entry: 'entries',
    };
    return count === 1 ? `1 ${noun}` : `${count} ${plurals[noun] || `${noun}s`}`;
  }

  function truncate(str, maxLen) {
    if (!str || str.length <= maxLen) return str || '';
    return `${str.slice(0, maxLen).replace(/\s+\S*$/, '')}...`;
  }

  function formatReadingTime(time) {
    if (!time) return 'Read';
    return /\bread\b/i.test(time) ? time : `${time} read`;
  }

  function escHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function escAttr(value) {
    return escHtml(value).replace(/'/g, '&#39;');
  }

  /* ============================================================
     Run
     ============================================================ */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
