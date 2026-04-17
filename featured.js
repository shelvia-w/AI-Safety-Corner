/* ============================================================
   AI Safety Corner — Homepage Dynamic Content
   Populates homepage counts, the featured research card, and
   the small archive cards.
   Depends on the section data files being loaded first.
   ============================================================ */

(function () {
  'use strict';

  function byId(id) {
    return document.getElementById(id);
  }

  function escHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function setCount(id, count, singular, plural) {
    const el = byId(id);
    if (!el || typeof count !== 'number') return;
    el.textContent = count === 1 ? `1 ${singular}` : `${count} ${plural}`;
  }

  function randomItem(items) {
    if (!Array.isArray(items) || items.length === 0) return null;
    return items[Math.floor(Math.random() * items.length)];
  }

  function truncate(text, maxLength) {
    if (!text || text.length <= maxLength) return text || '';
    return `${text.slice(0, maxLength).trimEnd()}…`;
  }

  function getGlobalList(name) {
    /* Top-level const globals are lexical bindings, not window properties. */
    const lists = {
      CORE_READINGS: typeof CORE_READINGS !== 'undefined' ? CORE_READINGS : [],
      PAPER_HIGHLIGHTS: typeof PAPER_HIGHLIGHTS !== 'undefined' ? PAPER_HIGHLIGHTS : [],
      FAILURE_CASES: typeof FAILURE_CASES !== 'undefined' ? FAILURE_CASES : [],
      EVAL_ENTRIES: typeof EVAL_ENTRIES !== 'undefined' ? EVAL_ENTRIES : [],
      GLOSSARY_TERMS: typeof GLOSSARY_TERMS !== 'undefined' ? GLOSSARY_TERMS : [],
      SYSTEM_CARDS: typeof SYSTEM_CARDS !== 'undefined' ? SYSTEM_CARDS : [],
    };

    return Array.isArray(lists[name]) ? lists[name] : [];
  }

  function getHighlights() {
    if (typeof getSortedPaperHighlights === 'function') {
      return getSortedPaperHighlights();
    }
    const highlights = getGlobalList('PAPER_HIGHLIGHTS');
    if (highlights.length === 0) return [];
    return [...highlights].sort((a, b) => {
      const aTime = Date.parse(a.postedDate || a.date || `${a.year || 0}-01-01`) || 0;
      const bTime = Date.parse(b.postedDate || b.date || `${b.year || 0}-01-01`) || 0;
      return bTime - aTime || String(a.title || '').localeCompare(String(b.title || ''));
    });
  }

  function renderCounts() {
    const coreReadings = getGlobalList('CORE_READINGS');
    const highlights = getGlobalList('PAPER_HIGHLIGHTS');
    const failures = getGlobalList('FAILURE_CASES');
    const evaluations = getGlobalList('EVAL_ENTRIES');
    const glossaryTerms = getGlobalList('GLOSSARY_TERMS');
    const systemCards = getGlobalList('SYSTEM_CARDS');

    setCount('coreReadingsHomeCount', coreReadings.length, 'note', 'notes');
    setCount('researchHighlightsHomeCount', highlights.length, 'highlight', 'highlights');
    setCount('failureCasesHomeCount', failures.length, 'case', 'cases');
    setCount('evaluationHomeCount', evaluations.length, 'entry', 'entries');
    setCount('glossaryHomeCount', glossaryTerms.length, 'term', 'terms');
    setCount('systemCardsHomeCount', systemCards.length, 'model', 'models');
  }

  function renderFeaturedHighlight() {
    const entry = getHighlights()[0];
    if (!entry) return;

    const url = `research-highlights/research.html?slug=${encodeURIComponent(entry.slug)}`;

    const titleEl = byId('featured-title');
    if (titleEl) titleEl.textContent = entry.title || '';

    const metaEl = byId('featured-meta');
    if (metaEl && Array.isArray(entry.topics) && entry.topics.length > 0) {
      metaEl.innerHTML = entry.topics
        .map((topic, index) => `${index === 0 ? '' : '<span class="dot">·</span>'}<span>${escHtml(topic)}</span>`)
        .join('');
    }

    const leadEl = byId('featured-lead');
    if (leadEl) leadEl.textContent = entry.oneLineTakeaway || entry.summary || '';

    const featuredLink = byId('featured-link');
    if (featuredLink) featuredLink.href = url;

    const heroLink = byId('hero-highlight-link');
    if (heroLink) heroLink.href = url;
  }

  function buildSignalCard({ variant, label, title, body, href, linkText }) {
    return `
      <div class="signal signal--${escHtml(variant)}">
        <div class="signal-type">${escHtml(label)}</div>
        <h4 class="signal-title">${escHtml(title)}</h4>
        <p class="signal-body">${escHtml(truncate(body, 160))}</p>
        <a href="${escHtml(href)}" class="signal-link">${escHtml(linkText)} →</a>
      </div>
    `;
  }

  function renderArchiveSignals() {
    const grid = byId('signals-grid');
    if (!grid) return;

    const cards = [];

    const term = randomItem(getGlobalList('GLOSSARY_TERMS'));
    if (term) {
      cards.push(buildSignalCard({
        variant: 'term',
        label: '❋ Term of the Week',
        title: term.term,
        body: term.oneLineDefinition,
        href: `glossary/term.html?slug=${encodeURIComponent(term.slug)}`,
        linkText: 'See full definition',
      }));
    }

    const failure = randomItem(getGlobalList('FAILURE_CASES'));
    if (failure) {
      cards.push(buildSignalCard({
        variant: 'failure',
        label: '⚠ Failure Log',
        title: failure.title,
        body: failure.shortDescription,
        href: `failure-cases/case.html?slug=${encodeURIComponent(failure.slug)}`,
        linkText: 'Read the case',
      }));
    }

    const systemCard = randomItem(getGlobalList('SYSTEM_CARDS'));
    if (systemCard) {
      cards.push(buildSignalCard({
        variant: 'systemcard',
        label: '⌘ System Card',
        title: systemCard.systemName,
        body: systemCard.shortDescription,
        href: `system-cards/card.html?slug=${encodeURIComponent(systemCard.slug)}`,
        linkText: 'Read the system card',
      }));
    }

    grid.innerHTML = cards.join('');
  }

  renderCounts();
  renderFeaturedHighlight();
  renderArchiveSignals();
}());
