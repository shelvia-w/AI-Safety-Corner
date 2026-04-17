/* ============================================================
   AI Safety Corner — Research Highlights Index JS
   Handles search, filtering, featured card, and card rendering.
   Depends on highlights-data.js being loaded first.
   ============================================================ */

(function () {
  'use strict';

  /* ─── Pagination ────────────────────────────────────────── */
  const ITEMS_PER_PAGE = 12;

  /* ─── State ─────────────────────────────────────────────── */
  const state = {
    search:           '',
    activeDifficulty: null,
    activeTopics:     new Set(),
    currentPage:      1,
  };

  /* ─── DOM refs ───────────────────────────────────────────── */
  const searchInput    = document.getElementById('highlightsSearch');
  const filterBtns     = document.querySelectorAll('.filter-pill[data-difficulty]');
  const topicContainer = document.getElementById('topicFilters');
  const featuredWrap   = document.getElementById('featuredWrap');
  const gridEl         = document.getElementById('highlightsGrid');
  const emptyEl        = document.getElementById('highlightsEmpty');
  const resultsLineEl  = document.querySelector('.highlights-results-line');
  const countEl        = document.getElementById('resultsCount');
  const clearBtn       = document.getElementById('highlightsClearBtn');
  const emptyResetBtn  = document.getElementById('emptyResetBtn');
  const paperCountEl   = document.getElementById('paperCount');

  /* ─── Boot ───────────────────────────────────────────────── */
  function init() {
    if (paperCountEl) {
      const n = PAPER_HIGHLIGHTS.length;
      paperCountEl.textContent = `${n} highlight${n !== 1 ? 's' : ''}`;
    }
    buildTopicFilters();
    bindEvents();
    render();
  }

  /* ─── Build topic filters ────────────────────────────────── */
  function buildTopicFilters() {
    const topics = getAllPaperTopics();

    topicContainer.innerHTML = topics.map(topic => `
      <button class="topic-pill" data-topic="${escAttr(topic)}" aria-pressed="false">
        ${escHtml(topic)}
      </button>
    `).join('');

    topicContainer.addEventListener('click', e => {
      const btn = e.target.closest('.topic-pill');
      if (!btn) return;
      const topic = btn.dataset.topic;

      if (state.activeTopics.has(topic)) {
        state.activeTopics.delete(topic);
        btn.classList.remove('is-active');
        btn.setAttribute('aria-pressed', 'false');
      } else {
        state.activeTopics.add(topic);
        btn.classList.add('is-active');
        btn.setAttribute('aria-pressed', 'true');
      }
      render();
    });
  }

  /* ─── Bind events ────────────────────────────────────────── */
  function bindEvents() {
    let debounceTimer;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        state.search = searchInput.value.trim().toLowerCase();
        render();
      }, 150);
    });

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const difficulty = btn.dataset.difficulty;

        filterBtns.forEach(b => {
          b.classList.remove('is-active');
          b.setAttribute('aria-pressed', 'false');
        });

        if (state.activeDifficulty === difficulty) {
          state.activeDifficulty = null;
        } else {
          state.activeDifficulty = difficulty;
          btn.classList.add('is-active');
          btn.setAttribute('aria-pressed', 'true');
        }
        render();
      });
    });

    clearBtn.addEventListener('click', resetFilters);
    emptyResetBtn.addEventListener('click', resetFilters);
  }

  /* ─── Reset all filters ──────────────────────────────────── */
  function resetFilters() {
    state.search           = '';
    state.activeDifficulty = null;
    state.activeTopics.clear();

    searchInput.value = '';
    filterBtns.forEach(b => {
      b.classList.remove('is-active');
      b.setAttribute('aria-pressed', 'false');
    });
    document.querySelectorAll('.topic-pill').forEach(b => {
      b.classList.remove('is-active');
      b.setAttribute('aria-pressed', 'false');
    });
    render();
  }

  /* ─── Filter logic ───────────────────────────────────────── */
  function getFiltered() {
    let papers = getSortedPaperHighlights();

    if (state.search) {
      const q = state.search;
      papers = papers.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.authors.some(a => a.toLowerCase().includes(q)) ||
        p.summary.toLowerCase().includes(q) ||
        p.oneLineTakeaway.toLowerCase().includes(q) ||
        getPaperWeekLabel(p).toLowerCase().includes(q) ||
        p.topics.some(t => t.toLowerCase().includes(q)) ||
        p.tags.some(t => t.includes(q)) ||
        String(p.year).includes(q) ||
        p.venue.toLowerCase().includes(q)
      );
    }

    if (state.activeDifficulty) {
      papers = papers.filter(p => p.difficulty === state.activeDifficulty);
    }

    if (state.activeTopics.size > 0) {
      papers = papers.filter(p =>
        p.topics.some(t => state.activeTopics.has(t))
      );
    }

    return papers;
  }

  function hasActiveFilters() {
    return state.search || state.activeDifficulty || state.activeTopics.size > 0;
  }

  /* ─── Render ─────────────────────────────────────────────── */
  function render(resetPage = true) {
    if (resetPage) state.currentPage = 1;

    const papers      = getFiltered();
    const isFiltering = hasActiveFilters();

    countEl.textContent = papers.length === 1
      ? '1 entry'
      : `${papers.length} entries`;

    clearBtn.classList.toggle('is-visible', isFiltering);
    if (resultsLineEl) resultsLineEl.classList.toggle('is-visible', isFiltering);

    /* Empty state */
    if (papers.length === 0) {
      featuredWrap.innerHTML = '';
      gridEl.innerHTML       = '';
      renderPagination(0);
      emptyEl.classList.add('is-visible');
      return;
    }
    emptyEl.classList.remove('is-visible');

    if (!isFiltering) {
      /* Featured card always stays on page 1; grid paginates the rest */
      const featured = papers.find(p => p.featured) || papers[0];
      const rest     = papers.filter(p => p.slug !== featured.slug);

      if (state.currentPage === 1) {
        featuredWrap.innerHTML = buildFeaturedCard(featured);
        const fc = featuredWrap.querySelector('.ph-featured-card');
        if (fc) {
          fc.classList.add('reveal');
          requestAnimationFrame(() => requestAnimationFrame(() => fc.classList.add('is-visible')));
        }
      } else {
        featuredWrap.innerHTML = '';
      }

      const totalPages = Math.ceil(rest.length / ITEMS_PER_PAGE);
      if (state.currentPage > totalPages && totalPages > 0) state.currentPage = totalPages;
      const start = (state.currentPage - 1) * ITEMS_PER_PAGE;
      gridEl.innerHTML = rest.slice(start, start + ITEMS_PER_PAGE).map(buildCard).join('');
      renderPagination(rest.length);
    } else {
      featuredWrap.innerHTML = '';
      const totalPages = Math.ceil(papers.length / ITEMS_PER_PAGE);
      if (state.currentPage > totalPages && totalPages > 0) state.currentPage = totalPages;
      const start = (state.currentPage - 1) * ITEMS_PER_PAGE;
      gridEl.innerHTML = papers.slice(start, start + ITEMS_PER_PAGE).map(buildCard).join('');
      renderPagination(papers.length);
    }

    /* Animate cards */
    gridEl.querySelectorAll('.ph-card').forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = `${Math.min(i, 10) * 0.05}s`;
      requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('is-visible')));
    });
  }

  /* ─── Build featured card ────────────────────────────────── */
  function buildFeaturedCard(paper) {
    const authorsShort = formatAuthors(paper.authors, 3);
    const weekLabel    = getPaperWeekLabel(paper);
    const topicsHtml   = paper.topics.map(t =>
      `<span class="ph-card-topic">${escHtml(t)}</span>`
    ).join('');

    return `
      <a class="ph-featured-card" href="research.html?slug=${escAttr(paper.slug)}"
         aria-label="${escAttr(paper.title)} — Read full highlight">
        <div class="ph-featured-left">
          <div class="ph-featured-kicker">
            <span class="ph-featured-kicker-dot"></span>
            Featured Research
          </div>
          <h2 class="ph-featured-title">${escHtml(paper.title)}</h2>
          <div class="ph-featured-meta-row">
            <span class="ph-featured-authors">${escHtml(authorsShort)}${weekLabel ? ` · ${escHtml(weekLabel)}` : ''}</span>
            <span class="difficulty-badge difficulty-badge--${paper.difficulty}">${diffLabel(paper.difficulty)}</span>
          </div>
        </div>
        <div class="ph-featured-right">
          <p class="ph-featured-takeaway">"${escHtml(paper.oneLineTakeaway)}"</p>
          <div class="ph-featured-topics">${topicsHtml}</div>
          <span class="ph-featured-read">
            <span>Read full highlight</span>
            <span aria-hidden="true">↗</span>
          </span>
        </div>
      </a>
    `;
  }

  /* ─── Build a single card ────────────────────────────────── */
  function buildCard(paper) {
    const authorsShort = formatAuthors(paper.authors, 2);
    const weekLabel    = getPaperWeekLabel(paper);
    const topicsHtml   = paper.topics.map(t =>
      `<span class="ph-card-topic">${escHtml(t)}</span>`
    ).join('');
    const featuredDot  = paper.featured
      ? '<span class="ph-card-featured-dot" title="Featured research"></span>'
      : '';

    return `
      <a class="ph-card" href="research.html?slug=${escAttr(paper.slug)}"
         aria-label="${escAttr(paper.title)} — ${escAttr(paper.oneLineTakeaway)}"
         role="listitem">
        ${featuredDot}
        <div class="ph-card-tags">${topicsHtml}</div>
        <h3 class="ph-card-title">${escHtml(paper.title)}</h3>
        <p class="ph-card-byline">${escHtml(authorsShort)}${weekLabel ? ` · ${escHtml(weekLabel)}` : ''}</p>
        <p class="ph-card-takeaway">${escHtml(paper.oneLineTakeaway)}</p>
        <div class="ph-card-footer">
          <div class="ph-card-footer-left">
            <span class="difficulty-badge difficulty-badge--${paper.difficulty}">${diffLabel(paper.difficulty)}</span>
            <span class="ph-card-reading-time">
              <span>${escHtml(paper.readingTime)} read</span>
              <span class="card-read-arrow" aria-hidden="true">→</span>
            </span>
          </div>
        </div>
      </a>
    `;
  }

  /* ─── Helpers ────────────────────────────────────────────── */
  function formatAuthors(authors, max) {
    if (!authors || authors.length === 0) return '';
    if (authors.length <= max) return authors.join(', ');
    return authors.slice(0, max).join(', ') + ' et al.';
  }

  function diffLabel(d) {
    return { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' }[d] || d;
  }

  function escHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escAttr(str) {
    if (!str) return '';
    return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
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

  /* ─── Run ────────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
