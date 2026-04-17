/* ============================================================
   AI Safety Corner — System Cards Index JS
   Handles search, filtering, and card rendering.
   Depends on cards-data.js being loaded first.
   ============================================================ */

(function () {
  'use strict';

  /* ─── Pagination ────────────────────────────────────────── */
  const ITEMS_PER_PAGE = 12;

  /* ─── State ─────────────────────────────────────────────── */
  const state = {
    search:       '',
    accessFilter: null,   // 'closed' | 'open-weight' | 'archived'
    activeOrgs:   new Set(),
    currentPage:  1,
  };

  /* ─── DOM refs ───────────────────────────────────────────── */
  const searchInput   = document.getElementById('scSearch');
  const accessBtns    = document.querySelectorAll('.sc-pill[data-access]');
  const orgContainer  = document.getElementById('orgFilters');
  const gridEl        = document.getElementById('scGrid');
  const emptyEl       = document.getElementById('scEmpty');
  const resultsLineEl = document.querySelector('.sc-results-line');
  const countEl       = document.getElementById('resultsCount');
  const totalCountEl  = document.getElementById('totalCount');
  const clearBtn      = document.getElementById('scClearBtn');
  const emptyResetBtn = document.getElementById('emptyResetBtn');

  /* ─── Boot ───────────────────────────────────────────────── */
  function init() {
    /* Total count */
    if (totalCountEl) {
      totalCountEl.textContent = `${SYSTEM_CARDS.length} model${SYSTEM_CARDS.length === 1 ? '' : 's'}`;
    }

    buildOrgFilters();
    bindEvents();
    render();
  }

  /* ─── Build org filter pills ─────────────────────────────── */
  function buildOrgFilters() {
    const orgs = getAllOrganizations();
    orgContainer.innerHTML = orgs.map(org => `
      <button class="sc-pill" data-org="${escAttr(org)}" aria-pressed="false">
        ${escHtml(org)}
      </button>
    `).join('');

    orgContainer.addEventListener('click', e => {
      const btn = e.target.closest('.sc-pill[data-org]');
      if (!btn) return;
      const org = btn.dataset.org;
      toggleSet(state.activeOrgs, org, btn);
      render();
    });
  }

  /* ─── Toggle a Set value and button state ────────────────── */
  function toggleSet(set, value, btn) {
    if (set.has(value)) {
      set.delete(value);
      btn.classList.remove('is-active');
      btn.setAttribute('aria-pressed', 'false');
    } else {
      set.add(value);
      btn.classList.add('is-active');
      btn.setAttribute('aria-pressed', 'true');
    }
  }

  /* ─── Bind events ────────────────────────────────────────── */
  function bindEvents() {
    /* Search with debounce */
    let debounceTimer;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        state.search = searchInput.value.trim().toLowerCase();
        render();
      }, 150);
    });

    /* Access status pills */
    accessBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.access;
        const isSame = state.accessFilter === val;
        accessBtns.forEach(b => {
          b.classList.remove('is-active');
          b.setAttribute('aria-pressed', 'false');
        });

        if (isSame) {
          state.accessFilter = null;
        } else {
          btn.classList.add('is-active');
          btn.setAttribute('aria-pressed', 'true');
          state.accessFilter = val;
        }
        render();
      });
    });

    /* Clear button */
    clearBtn.addEventListener('click', resetFilters);
    emptyResetBtn.addEventListener('click', resetFilters);
  }

  /* ─── Reset all filters ──────────────────────────────────── */
  function resetFilters() {
    state.search       = '';
    state.accessFilter = null;
    state.activeOrgs.clear();

    searchInput.value = '';

    accessBtns.forEach(b => {
      b.classList.remove('is-active');
      b.setAttribute('aria-pressed', 'false');
    });

    document.querySelectorAll('#orgFilters .sc-pill').forEach(b => {
      b.classList.remove('is-active');
      b.setAttribute('aria-pressed', 'false');
    });

    render();
  }

  /* ─── Filter logic ───────────────────────────────────────── */
  function getFilteredCards() {
    let cards = [...SYSTEM_CARDS];

    /* Search */
    if (state.search) {
      const q = state.search;
      cards = cards.filter(c =>
        c.systemName.toLowerCase().includes(q) ||
        c.organization.toLowerCase().includes(q) ||
        c.summary.toLowerCase().includes(q) ||
        c.shortDescription.toLowerCase().includes(q)
      );
    }

    /* Access status */
    if (state.accessFilter) {
      cards = cards.filter(c => getAccessCategory(c) === state.accessFilter);
    }

    /* Organizations */
    if (state.activeOrgs.size > 0) {
      cards = cards.filter(c => state.activeOrgs.has(c.organization));
    }

    /* Featured cards first, then alphabetical */
    return cards.sort((a, b) => a.systemName.localeCompare(b.systemName));
  }

  /* ─── Check if any filter is active ─────────────────────── */
  function hasActiveFilters() {
    return (
      state.search ||
      state.accessFilter ||
      state.activeOrgs.size > 0
    );
  }

  /* ─── Render ─────────────────────────────────────────────── */
  function render(resetPage = true) {
    if (resetPage) state.currentPage = 1;

    const cards = getFilteredCards();
    const isFiltering = hasActiveFilters();

    /* Count */
    countEl.textContent = cards.length === 1
      ? '1 entry'
      : `${cards.length} entries`;

    /* Clear button visibility */
    clearBtn.classList.toggle('is-visible', isFiltering);
    if (resultsLineEl) resultsLineEl.classList.toggle('is-visible', isFiltering);

    /* Empty state */
    if (cards.length === 0) {
      gridEl.innerHTML = '';
      renderPagination(0);
      emptyEl.classList.add('is-visible');
      return;
    }
    emptyEl.classList.remove('is-visible');

    /* Paginate */
    const totalPages = Math.ceil(cards.length / ITEMS_PER_PAGE);
    if (state.currentPage > totalPages) state.currentPage = totalPages;
    const start = (state.currentPage - 1) * ITEMS_PER_PAGE;
    const pageCards = cards.slice(start, start + ITEMS_PER_PAGE);

    /* Render cards */
    gridEl.innerHTML = pageCards.map(buildCard).join('');
    renderPagination(cards.length);

    /* Scroll reveal */
    gridEl.querySelectorAll('.sc-card').forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = `${Math.min(i, 8) * 0.05}s`;
      requestAnimationFrame(() => el.classList.add('is-visible'));
    });
  }

  /* ─── Build a single preview card ────────────────────────── */
  function buildCard(card) {
    const accessCat = getAccessCategory(card);
    const accessBadgeClass = {
      'closed':      'sc-badge--access-closed',
      'open-weight': 'sc-badge--access-open',
      'archived':    'sc-badge--access-archived',
    }[accessCat] || 'sc-badge--access-closed';

    const accessLabel = {
      'closed':      'Closed',
      'open-weight': 'Open-weight',
      'archived':    'Archived',
    }[accessCat] || 'Closed';

    const archivedRibbon = accessCat === 'archived'
      ? '<div class="sc-card-archived" aria-hidden="true"></div>'
      : '';

    return `
      <a class="sc-card" href="card.html?slug=${escAttr(card.slug)}" role="listitem"
         aria-label="${escAttr(card.systemName)} — ${escAttr(card.summary)}">
        ${archivedRibbon}
        <div class="sc-card-header">
          <span class="sc-badge ${accessBadgeClass}">${accessLabel}</span>
          <span class="sc-badge sc-badge--org">${escHtml(card.organization)}</span>
        </div>
        <h3 class="sc-card-name">${escHtml(card.systemName)}</h3>
        <p class="sc-card-summary">${escHtml(card.summary)}</p>
        <div class="sc-card-footer">
          <span class="sc-card-read">
            <span>${escHtml(card.readingTime)} read</span>
            <span class="card-read-arrow" aria-hidden="true">→</span>
          </span>
        </div>
      </a>
    `;
  }

  /* ─── Escape HTML ────────────────────────────────────────── */
  function escHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function escAttr(str) {
    return escHtml(str);
  }

  /* ─── Pagination helpers ─────────────────────────────────── */
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
      <button class="pagination-btn pagination-prev"${state.currentPage === 1 ? ' disabled' : ''} aria-label="Previous page">←</button>
      <div class="pagination-pages">
        ${pageNums.map(p => p === '…'
          ? '<span class="pagination-ellipsis">…</span>'
          : `<button class="pagination-page${p === state.currentPage ? ' is-active' : ''}" data-page="${p}" aria-label="Page ${p}"${p === state.currentPage ? ' aria-current="page"' : ''}>${p}</button>`
        ).join('')}
      </div>
      <button class="pagination-btn pagination-next"${state.currentPage === totalPages ? ' disabled' : ''} aria-label="Next page">→</button>
    `;

    nav.addEventListener('click', e => {
      const pagBtn  = e.target.closest('.pagination-page');
      const prevBtn = e.target.closest('.pagination-prev');
      const nextBtn = e.target.closest('.pagination-next');
      if (pagBtn) {
        state.currentPage = parseInt(pagBtn.dataset.page, 10);
      } else if (prevBtn && state.currentPage > 1) {
        state.currentPage--;
      } else if (nextBtn && state.currentPage < totalPages) {
        state.currentPage++;
      } else { return; }
      render(false);
      gridEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    gridEl.after(nav);
  }

  function buildPageNumbers(current, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages = [];
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push('…', total);
    } else if (current >= total - 3) {
      pages.push(1, '…');
      for (let i = total - 4; i <= total; i++) pages.push(i);
    } else {
      pages.push(1, '…', current - 1, current, current + 1, '…', total);
    }
    return pages;
  }

  /* ─── Run on DOM ready ───────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
