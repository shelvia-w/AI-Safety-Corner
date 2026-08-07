/* ============================================================
   AI Safety Corner - Failure Cases Index JS
   Handles search, risk filtering, pagination, and card rendering.
   Depends on failures-data.js being loaded first.
   ============================================================ */

(function () {
  'use strict';

  // Pagination
  const ITEMS_PER_PAGE = 12;

  // State
  const state = {
    search: '',
    activeRisk: null, // 'low' | 'medium' | 'high' | 'critical' | null
    currentPage: 1,
  };

  // DOM references
  const searchInput = document.getElementById('fcSearch');
  const riskBtns = document.querySelectorAll('.risk-pill[data-risk]');
  const gridEl = document.getElementById('fcGrid');
  const emptyEl = document.getElementById('fcEmpty');
  const resultsLineEl = document.querySelector('.fc-results-line');
  const countEl = document.getElementById('resultsCount');
  const totalCountEl = document.getElementById('totalCount');
  const clearBtn = document.getElementById('fcClearBtn');
  const emptyResetBtn = document.getElementById('emptyResetBtn');

  function init() {
    if (typeof FAILURE_CASES === 'undefined' || !gridEl) return;

    if (totalCountEl) {
      const total = FAILURE_CASES.length;
      totalCountEl.textContent = total === 1 ? '1 case' : `${total} cases`;
    }

    bindEvents();
    render();
  }

  function bindEvents() {
    bindSearch();
    bindRiskFilters();

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

  function bindRiskFilters() {
    riskBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const risk = btn.dataset.risk;
        const isSameRisk = state.activeRisk === risk;

        state.activeRisk = isSameRisk ? null : risk;
        riskBtns.forEach(pill => {
          const isActive = pill.dataset.risk === state.activeRisk;
          pill.classList.toggle('is-active', isActive);
          pill.setAttribute('aria-pressed', String(isActive));
        });

        render();
      });
    });
  }

  function resetFilters() {
    state.search = '';
    state.activeRisk = null;

    if (searchInput) searchInput.value = '';
    riskBtns.forEach(resetPressedButton);

    render();
  }

  function resetPressedButton(btn) {
    btn.classList.remove('is-active');
    btn.setAttribute('aria-pressed', 'false');
  }

  function getFilteredCases() {
    let cases = [...FAILURE_CASES];

    if (state.search) {
      const query = state.search;
      cases = cases.filter(item =>
        includesQuery(item.title, query) ||
        includesQuery(item.shortDescription, query) ||
        includesQuery(item.systemName, query) ||
        includesQuery(item.organization, query) ||
        (item.tags || []).some(tag => includesQuery(tag, query))
      );
    }

    if (state.activeRisk) {
      cases = cases.filter(item => item.riskLevel === state.activeRisk);
    }

    return cases.sort(sortFeaturedThenRecent);
  }

  function includesQuery(value, query) {
    return String(value || '').toLowerCase().includes(query);
  }

  function sortFeaturedThenRecent(a, b) {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return new Date(b.date) - new Date(a.date);
  }

  function hasActiveFilters() {
    return Boolean(state.search || state.activeRisk);
  }

  function render(resetPage = true) {
    if (!gridEl) return;
    if (resetPage) state.currentPage = 1;

    const cases = getFilteredCases();
    const isFiltering = hasActiveFilters();

    updateResultsUI(cases.length, isFiltering);

    if (cases.length === 0) {
      gridEl.innerHTML = '';
      renderPagination(0);
      if (emptyEl) emptyEl.classList.add('is-visible');
      return;
    }

    if (emptyEl) emptyEl.classList.remove('is-visible');

    const pageCases = getCurrentPageCases(cases);
    gridEl.innerHTML = pageCases.map(buildCard).join('');
    renderPagination(cases.length);
    revealCards();
  }

  function updateResultsUI(count, isFiltering) {
    if (countEl) {
      countEl.textContent = count === 1 ? '1 entry' : `${count} entries`;
    }

    if (clearBtn) clearBtn.classList.toggle('is-visible', isFiltering);
    if (resultsLineEl) resultsLineEl.classList.toggle('is-visible', isFiltering);
  }

  function getCurrentPageCases(cases) {
    const totalPages = Math.ceil(cases.length / ITEMS_PER_PAGE);
    if (state.currentPage > totalPages) state.currentPage = totalPages;

    const start = (state.currentPage - 1) * ITEMS_PER_PAGE;
    return cases.slice(start, start + ITEMS_PER_PAGE);
  }

  function buildCard(item) {
    const year = item.date ? item.date.slice(0, 4) : '';

    return `
      <a
        class="fc-card"
        href="case.html?slug=${encodeURIComponent(item.slug)}"
        role="listitem"
        aria-label="${escAttr(item.title)}"
      >
        <div class="fc-card-header">
          <div class="fc-card-meta-line">
            <span class="fc-card-date">${escHtml(year)}</span>
            <span class="fc-card-sep">&middot;</span>
            <span class="fc-card-system">${escHtml(item.systemName)}</span>
            <span class="fc-card-sep">&middot;</span>
            <span class="status-badge status-badge--${escAttr(item.statusOfCase)}">
              <span class="status-dot"></span>
              ${escHtml(statusLabel(item.statusOfCase))}
            </span>
          </div>

          <div class="fc-card-badge-line">
            <span class="risk-badge risk-badge--${escAttr(item.riskLevel)}">
              ${escHtml(riskLabel(item.riskLevel))}
            </span>
          </div>
        </div>

        <h3 class="fc-card-title">${escHtml(item.title)}</h3>
        <p class="fc-card-excerpt">${escHtml(item.shortDescription)}</p>

        <div class="fc-card-footer">
          <span class="fc-card-reading-time">
            <span>${escHtml(item.readingTime)} read</span>
            <span class="card-read-arrow" aria-hidden="true"></span>
          </span>
        </div>
      </a>
    `;
  }

  function revealCards() {
    gridEl.querySelectorAll('.fc-card').forEach((el, index) => {
      el.classList.add('reveal');
      el.style.transitionDelay = `${Math.min(index, 12) * 0.035}s`;
      requestAnimationFrame(() => el.classList.add('is-visible'));
    });
  }

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

  function riskLabel(level) {
    return {
      low: 'Low Risk',
      medium: 'Medium Risk',
      high: 'High Risk',
      critical: 'Critical',
    }[level] || level;
  }

  function statusLabel(status) {
    return {
      resolved: 'Resolved',
      mitigated: 'Mitigated',
      ongoing: 'Ongoing',
      'under-review': 'Under Review',
    }[status] || status;
  }

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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
