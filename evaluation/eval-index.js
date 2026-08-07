/* ============================================================
   AI Safety Corner - Evaluation Index JS
   Handles search, filtering, pagination, and card rendering.
   Depends on eval-data.js being loaded first.
   ============================================================ */

(function () {
  'use strict';

  // Pagination
  const ITEMS_PER_PAGE = 12;

  // State
  const state = {
    search: '',
    evalType: null,      // null | 'Benchmark' | 'Method' | 'Dataset'
    topicFilter: 'all',  // 'all' | safetyArea string
    currentPage: 1,
  };

  // DOM references
  const searchInput = document.getElementById('evSearch');
  const topicFilterEl = document.getElementById('evTopicFilters');
  const evTypeBtns = document.querySelectorAll('.ev-diff-pill[data-evtype]');
  const gridEl = document.getElementById('evGrid');
  const emptyEl = document.getElementById('evEmpty');
  const resultsLineEl = document.querySelector('.ev-results-line');
  const countEl = document.getElementById('resultsCount');
  const totalCountEl = document.getElementById('totalCount');
  const clearBtn = document.getElementById('evClearBtn');
  const emptyResetBtn = document.getElementById('emptyResetBtn');

  let topicBtns = [];

  // Boot
  function init() {
    if (!Array.isArray(window.EVAL_ENTRIES) && typeof EVAL_ENTRIES === 'undefined') return;

    if (totalCountEl) {
      const total = EVAL_ENTRIES.length;
      totalCountEl.textContent = total === 1 ? '1 entry' : `${total} entries`;
    }

    buildTopicFilters();
    bindEvents();
    render();
  }

  // Build topic filters from safetyArea values
  function buildTopicFilters() {
    if (!topicFilterEl) return;

    topicFilterEl.innerHTML = getAllEvalTopics().map(topic => `
      <button
        class="ev-pill"
        data-topic="${escAttr(topic)}"
        aria-pressed="false"
      >${escHtml(topic)}</button>
    `).join('');

    topicBtns = topicFilterEl.querySelectorAll('.ev-pill[data-topic]');
  }

  // Bind UI events
  function bindEvents() {
    bindSearch();
    bindEvalTypeFilters();
    bindTopicFilters();

    if (clearBtn) clearBtn.addEventListener('click', resetFilters);
    if (emptyResetBtn) emptyResetBtn.addEventListener('click', resetFilters);
  }

  function bindSearch() {
    if (!searchInput) return;

    let debounceTimer;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        state.search = searchInput.value.trim().toLowerCase();
        render();
      }, 150);
    });
  }

  function bindEvalTypeFilters() {
    evTypeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const value = btn.dataset.evtype;

        if (state.evalType === value) {
          state.evalType = null;
          btn.classList.remove('is-active');
          btn.setAttribute('aria-pressed', 'false');
        } else {
          evTypeBtns.forEach(resetPressedButton);
          state.evalType = value;
          btn.classList.add('is-active');
          btn.setAttribute('aria-pressed', 'true');
        }

        render();
      });
    });
  }

  function bindTopicFilters() {
    if (!topicFilterEl) return;

    topicFilterEl.addEventListener('click', event => {
      const btn = event.target.closest('.ev-pill[data-topic]');
      if (!btn) return;

      const value = btn.dataset.topic;

      if (state.topicFilter === value) {
        state.topicFilter = 'all';
        btn.classList.remove('is-active');
        btn.setAttribute('aria-pressed', 'false');
      } else {
        topicBtns.forEach(resetPressedButton);
        state.topicFilter = value;
        btn.classList.add('is-active');
        btn.setAttribute('aria-pressed', 'true');
      }

      render();
    });
  }

  function resetPressedButton(btn) {
    btn.classList.remove('is-active');
    btn.setAttribute('aria-pressed', 'false');
  }

  // Reset all filters
  function resetFilters() {
    state.search = '';
    state.evalType = null;
    state.topicFilter = 'all';

    if (searchInput) searchInput.value = '';

    evTypeBtns.forEach(resetPressedButton);
    topicBtns.forEach(resetPressedButton);

    render();
  }

  // Filtering
  function getFilteredEntries() {
    let entries = [...EVAL_ENTRIES];

    if (state.search) {
      const query = state.search;
      entries = entries.filter(entry =>
        includesQuery(entry.title, query) ||
        includesQuery(entry.summary, query) ||
        includesQuery(entry.quickDefinition, query) ||
        includesQuery(entry.evaluationType, query) ||
        includesQuery(entry.safetyArea, query)
      );
    }

    if (state.evalType) {
      entries = entries.filter(entry => entry.evaluationType === state.evalType);
    }

    if (state.topicFilter !== 'all') {
      entries = entries.filter(entry => entry.safetyArea === state.topicFilter);
    }

    return entries.sort(sortFeaturedThenTitle);
  }

  function includesQuery(value, query) {
    return String(value || '').toLowerCase().includes(query);
  }

  function sortFeaturedThenTitle(a, b) {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return a.title.localeCompare(b.title);
  }

  function hasActiveFilters() {
    return Boolean(state.search || state.evalType || state.topicFilter !== 'all');
  }

  // Rendering
  function render(resetPage = true) {
    if (!gridEl) return;
    if (resetPage) state.currentPage = 1;

    const entries = getFilteredEntries();
    const isFiltering = hasActiveFilters();

    updateResultsUI(entries.length, isFiltering);

    if (entries.length === 0) {
      gridEl.innerHTML = '';
      renderPagination(0);
      if (emptyEl) emptyEl.classList.add('is-visible');
      return;
    }

    if (emptyEl) emptyEl.classList.remove('is-visible');

    const pageEntries = getCurrentPageEntries(entries);
    gridEl.innerHTML = pageEntries.map(buildCard).join('');
    renderPagination(entries.length);
    revealCards();
  }

  function updateResultsUI(count, isFiltering) {
    if (countEl) {
      countEl.textContent = count === 1 ? '1 entry' : `${count} entries`;
    }

    if (clearBtn) clearBtn.classList.toggle('is-visible', isFiltering);
    if (resultsLineEl) resultsLineEl.classList.toggle('is-visible', isFiltering);
  }

  function getCurrentPageEntries(entries) {
    const totalPages = Math.ceil(entries.length / ITEMS_PER_PAGE);
    if (state.currentPage > totalPages) state.currentPage = totalPages;

    const start = (state.currentPage - 1) * ITEMS_PER_PAGE;
    return entries.slice(start, start + ITEMS_PER_PAGE);
  }

  function buildCard(entry) {
    const typeSlug = entry.evaluationType.toLowerCase().replace(/\s+/g, '-');
    const typeBadgeClass = `ev-badge--type-${typeSlug}`;

    return `
      <a
        class="ev-card"
        href="eval.html?slug=${encodeURIComponent(entry.slug)}"
        role="listitem"
        aria-label="${escAttr(entry.title)} - ${escAttr(entry.summary)}"
      >
        <div class="ev-card-header">
          <span class="ev-badge ${typeBadgeClass}">${escHtml(entry.evaluationType)}</span>
          ${entry.safetyArea ? `<span class="ev-badge ev-badge--topic">${escHtml(entry.safetyArea)}</span>` : ''}
        </div>

        <h3 class="ev-card-name">${escHtml(entry.title)}</h3>
        <p class="ev-card-summary">${escHtml(entry.summary)}</p>

        <div class="ev-card-footer">
          <span class="ev-card-read">
            <span>${escHtml(entry.readingTime)} read</span>
            <span class="card-read-arrow" aria-hidden="true"></span>
          </span>
        </div>
      </a>
    `;
  }

  function revealCards() {
    gridEl.querySelectorAll('.ev-card').forEach((el, index) => {
      el.classList.add('reveal');
      el.style.transitionDelay = `${Math.min(index, 8) * 0.05}s`;
      requestAnimationFrame(() => el.classList.add('is-visible'));
    });
  }

  // Pagination
  function renderPagination(totalItems) {
    const existing = document.getElementById('paginationNav');
    if (existing) existing.remove();

    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    if (totalPages <= 1) return;

    const nav = document.createElement('nav');
    nav.className = 'pagination';
    nav.id = 'paginationNav';
    nav.setAttribute('aria-label', 'Page navigation');

    const pageNums = buildPageNumbers(state.currentPage, totalPages);
    nav.innerHTML = `
      <button
        class="pagination-btn pagination-prev"
        ${state.currentPage === 1 ? 'disabled' : ''}
        aria-label="Previous page"
      >&larr;</button>

      <div class="pagination-pages">
        ${pageNums.map(page => page === 'ellipsis'
          ? '<span class="pagination-ellipsis">&hellip;</span>'
          : `<button
              class="pagination-page${page === state.currentPage ? ' is-active' : ''}"
              data-page="${page}"
              aria-label="Page ${page}"
              ${page === state.currentPage ? 'aria-current="page"' : ''}
            >${page}</button>`
        ).join('')}
      </div>

      <button
        class="pagination-btn pagination-next"
        ${state.currentPage === totalPages ? 'disabled' : ''}
        aria-label="Next page"
      >&rarr;</button>
    `;

    nav.addEventListener('click', handlePaginationClick);
    gridEl.after(nav);
  }

  function handlePaginationClick(event) {
    const pageBtn = event.target.closest('.pagination-page');
    const prevBtn = event.target.closest('.pagination-prev');
    const nextBtn = event.target.closest('.pagination-next');

    if (pageBtn) {
      state.currentPage = parseInt(pageBtn.dataset.page, 10);
    } else if (prevBtn && state.currentPage > 1) {
      state.currentPage--;
    } else if (nextBtn) {
      state.currentPage++;
    } else {
      return;
    }

    render(false);
    gridEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function buildPageNumbers(current, total) {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    if (current <= 4) {
      return [1, 2, 3, 4, 5, 'ellipsis', total];
    }

    if (current >= total - 3) {
      return [1, 'ellipsis', total - 4, total - 3, total - 2, total - 1, total];
    }

    return [1, 'ellipsis', current - 1, current, current + 1, 'ellipsis', total];
  }

  // Escaping
  function escHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function escAttr(value) {
    return escHtml(value).replace(/'/g, '&#39;');
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
