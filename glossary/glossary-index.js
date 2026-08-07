/* ============================================================
   AI Safety Corner — Glossary Index JS
   Handles search, alphabet filtering, pagination, and card rendering.
   Depends on glossary-data.js being loaded first.
   ============================================================ */

(function () {
  'use strict';

  /* ─── Constants ─────────────────────────────────────────── */
  const ITEMS_PER_PAGE = 20;
  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  /* ─── State ─────────────────────────────────────────────── */
  const state = {
    search: '',
    activeLetter: null,
    currentPage: 1,
  };

  /* ─── DOM refs ──────────────────────────────────────────── */
  const searchInput = document.getElementById('glossarySearch');
  const alphaContainer = document.getElementById('alphabetNav');
  const gridEl = document.getElementById('glossaryGrid');
  const emptyEl = document.getElementById('glossaryEmpty');
  const resultsLineEl = document.getElementById('glossaryResultsLine');
  const countEl = document.getElementById('resultsCount');
  const totalCountEl = document.getElementById('glossaryTotalCount');
  const clearBtn = document.getElementById('glossaryClearBtn');
  const emptyResetBtn = document.getElementById('emptyResetBtn');

  /* ─── Boot ──────────────────────────────────────────────── */
  function init() {
    if (!Array.isArray(window.GLOSSARY_TERMS || GLOSSARY_TERMS)) return;

    if (totalCountEl) {
      const total = GLOSSARY_TERMS.length;
      totalCountEl.textContent = total === 1 ? '1 term' : `${total} terms`;
    }

    buildAlphabetNav();
    bindEvents();
    render();
  }

  /* ─── Alphabet nav ──────────────────────────────────────── */
  function buildAlphabetNav() {
    if (!alphaContainer) return;

    const available = new Set(
      GLOSSARY_TERMS.map(term => term.term.charAt(0).toUpperCase())
    );

    alphaContainer.innerHTML = ALPHABET.map(letter => {
      const hasTerms = available.has(letter);
      const disabledAttrs = hasTerms ? '' : ' disabled aria-disabled="true"';

      return `
        <button
          class="alpha-btn${hasTerms ? '' : ' is-disabled'}"
          type="button"
          data-letter="${escAttr(letter)}"
          aria-label="Show terms starting with ${escAttr(letter)}"${disabledAttrs}
        >${escHtml(letter)}</button>
      `;
    }).join('');

    alphaContainer.addEventListener('click', event => {
      const btn = event.target.closest('.alpha-btn:not(.is-disabled)');
      if (!btn) return;

      const letter = btn.dataset.letter;
      const isAlreadyActive = state.activeLetter === letter;

      alphaContainer
        .querySelectorAll('.alpha-btn')
        .forEach(button => button.classList.remove('is-active'));

      state.activeLetter = isAlreadyActive ? null : letter;
      if (!isAlreadyActive) btn.classList.add('is-active');

      render();
    });
  }

  /* ─── Events ────────────────────────────────────────────── */
  function bindEvents() {
    let debounceTimer;

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          state.search = searchInput.value.trim().toLowerCase();
          render();
        }, 150);
      });
    }

    if (clearBtn) clearBtn.addEventListener('click', resetFilters);
    if (emptyResetBtn) emptyResetBtn.addEventListener('click', resetFilters);
  }

  /* ─── Filters ───────────────────────────────────────────── */
  function resetFilters() {
    state.search = '';
    state.activeLetter = null;

    if (searchInput) searchInput.value = '';
    document
      .querySelectorAll('.alpha-btn')
      .forEach(button => button.classList.remove('is-active'));

    render();
  }

  function getFilteredTerms() {
    let terms = [...GLOSSARY_TERMS];

    if (state.search) {
      const query = state.search;
      terms = terms.filter(term => {
        const tags = term.tags || [];
        return (
          term.term.toLowerCase().includes(query) ||
          term.oneLineDefinition.toLowerCase().includes(query) ||
          tags.some(tag => tag.toLowerCase().includes(query))
        );
      });
    }

    if (state.activeLetter) {
      terms = terms.filter(
        term => term.term.charAt(0).toUpperCase() === state.activeLetter
      );
    }

    return terms.sort((a, b) => a.term.localeCompare(b.term));
  }

  function hasActiveFilters() {
    return Boolean(state.search || state.activeLetter);
  }

  /* ─── Render ────────────────────────────────────────────── */
  function render(resetPage = true) {
    if (!gridEl) return;
    if (resetPage) state.currentPage = 1;

    const terms = getFilteredTerms();
    const isFiltering = hasActiveFilters();

    if (countEl) {
      countEl.textContent = terms.length === 1
        ? '1 entry'
        : `${terms.length} entries`;
    }

    if (clearBtn) clearBtn.classList.toggle('is-visible', isFiltering);
    if (resultsLineEl) resultsLineEl.classList.toggle('is-visible', isFiltering);

    if (terms.length === 0) {
      gridEl.innerHTML = '';
      renderPagination(0);
      if (emptyEl) emptyEl.classList.add('is-visible');
      return;
    }

    if (emptyEl) emptyEl.classList.remove('is-visible');

    if (isFiltering) {
      const totalPages = Math.ceil(terms.length / ITEMS_PER_PAGE);
      if (state.currentPage > totalPages) state.currentPage = totalPages;

      const start = (state.currentPage - 1) * ITEMS_PER_PAGE;
      const pageTerms = terms.slice(start, start + ITEMS_PER_PAGE);

      gridEl.innerHTML = pageTerms.map(buildCard).join('');
      renderPagination(terms.length);
    } else {
      gridEl.innerHTML = renderGrouped(terms);
      renderPagination(0);
    }

    revealCards();
  }

  function renderGrouped(terms) {
    const groups = terms.reduce((acc, term) => {
      const letter = term.term.charAt(0).toUpperCase();
      if (!acc[letter]) acc[letter] = [];
      acc[letter].push(term);
      return acc;
    }, {});

    return Object.keys(groups).sort().map(letter => `
      <section class="letter-group" id="letter-${escAttr(letter)}">
        <div class="letter-group-header">
          <span class="letter-label">${escHtml(letter)}</span>
          <div class="letter-rule"></div>
        </div>
        ${groups[letter].map(buildCard).join('')}
      </section>
    `).join('');
  }

  function buildCard(term) {
    return `
      <a
        class="term-card"
        href="term.html?slug=${encodeURIComponent(term.slug)}"
        aria-label="${escAttr(term.term)} — ${escAttr(term.oneLineDefinition)}"
      >
        <div class="term-card-body">
          <h3 class="term-card-name">
            <span>${escHtml(term.term)}</span>
            <span class="term-card-arrow" aria-hidden="true">→</span>
          </h3>
          <p class="term-card-oneliner">${escHtml(term.oneLineDefinition)}</p>
        </div>
      </a>
    `;
  }

  function revealCards() {
    gridEl.querySelectorAll('.term-card').forEach((card, index) => {
      card.classList.add('reveal');
      card.style.transitionDelay = `${Math.min(index, 10) * 0.04}s`;
      requestAnimationFrame(() => card.classList.add('is-visible'));
    });
  }

  /* ─── Pagination ────────────────────────────────────────── */
  function renderPagination(totalItems) {
    const existing = document.getElementById('paginationNav');
    if (existing) existing.remove();

    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    if (totalPages <= 1) return;

    const nav = document.createElement('nav');
    nav.className = 'pagination';
    nav.id = 'paginationNav';
    nav.setAttribute('aria-label', 'Page navigation');

    const pageNumbers = buildPageNumbers(state.currentPage, totalPages);
    nav.innerHTML = `
      <button class="pagination-btn pagination-prev"${state.currentPage === 1 ? ' disabled' : ''} aria-label="Previous page">←</button>
      <div class="pagination-pages">
        ${pageNumbers.map(page => page === '…'
          ? '<span class="pagination-ellipsis">…</span>'
          : `<button class="pagination-page${page === state.currentPage ? ' is-active' : ''}" data-page="${page}" aria-label="Page ${page}"${page === state.currentPage ? ' aria-current="page"' : ''}>${page}</button>`
        ).join('')}
      </div>
      <button class="pagination-btn pagination-next"${state.currentPage === totalPages ? ' disabled' : ''} aria-label="Next page">→</button>
    `;

    nav.addEventListener('click', event => {
      const pageBtn = event.target.closest('.pagination-page');
      const prevBtn = event.target.closest('.pagination-prev');
      const nextBtn = event.target.closest('.pagination-next');

      if (pageBtn) {
        state.currentPage = parseInt(pageBtn.dataset.page, 10);
      } else if (prevBtn && state.currentPage > 1) {
        state.currentPage -= 1;
      } else if (nextBtn && state.currentPage < totalPages) {
        state.currentPage += 1;
      } else {
        return;
      }

      render(false);
      gridEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    gridEl.after(nav);
  }

  function buildPageNumbers(current, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    if (current <= 4) return [1, 2, 3, 4, 5, '…', total];
    if (current >= total - 3) return [1, '…', total - 4, total - 3, total - 2, total - 1, total];
    return [1, '…', current - 1, current, current + 1, '…', total];
  }

  /* ─── Escaping ──────────────────────────────────────────── */
  function escHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escAttr(value) {
    return escHtml(value);
  }

  /* ─── Run ───────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
