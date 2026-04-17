/* ============================================================
   AI Safety Corner — Personal Notes Detail JS
   Renders a single note page from URL ?slug=...
   Depends on notes-data.js being loaded first.
   ============================================================ */

(function () {
  'use strict';

  /* ─── DOM helpers ────────────────────────────────────────── */
  function qs(id) {
    return document.getElementById(id);
  }

  function setText(id, text) {
    const el = qs(id);
    if (el) el.textContent = text || '';
  }

  function setHtml(id, html) {
    const el = qs(id);
    if (el) el.innerHTML = html || '';
  }

  function show(id) {
    const el = qs(id);
    if (el) el.style.display = '';
  }

  function hide(id) {
    const el = qs(id);
    if (el) el.style.display = 'none';
  }

  /* ─── Escaping and formatting ────────────────────────────── */
  function escHtml(value) {
    if (value === null || value === undefined) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escAttr(value) {
    return escHtml(value);
  }

  function classToken(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '-');
  }

  function paragraphsHtml(text) {
    if (!text) return '';
    return String(text)
      .split(/\n\n+/)
      .map(para => `<p>${escHtml(para.trim())}</p>`)
      .join('');
  }

  function typeName(contentType) {
    return {
      motivation: 'Motivation',
      learning: 'Learning',
      research: 'Research',
      reflection: 'Reflection',
    }[contentType] || contentType || 'Reading';
  }

  function formatDate(value) {
    if (!value) return '';

    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  function getSlug() {
    return (new URLSearchParams(window.location.search).get('slug') || '').trim();
  }

  /* ─── Boot ───────────────────────────────────────────────── */
  function init() {
    const reading = getCoreReadingBySlug(getSlug());

    if (!reading) {
      renderNotFound();
      return;
    }

    renderReading(reading);
  }

  function renderNotFound() {
    hide('readingBody');
    show('readingNotFound');
    document.title = 'Note not found — Personal Notes · AI Safety Corner';
  }

  /* ─── Main render ────────────────────────────────────────── */
  function renderReading(reading) {
    document.title = reading.title;

    renderHeader(reading);
    renderBody(reading);
    renderNav(...Object.values(getPrevNextReading(reading.slug)));
  }

  function renderHeader(reading) {
    const typeClass = classToken(reading.contentType);

    setText('breadcrumbTitle', reading.title);
    setHtml('readingTypeBadge', `
      <span class="cr-type-badge cr-type-badge--${typeClass}">
        ${escHtml(typeName(reading.contentType))}
      </span>
    `);
    setText('readingTitle', reading.title);

    const metaItems = [
      reading.author ? { label: 'Author', value: reading.author } : null,
      { label: 'Updated', value: formatDate(reading.updated) },
    ].filter(Boolean);

    setHtml('readingMeta', metaItems.map(metaItemHtml).join(''));
    setText('readingTime', reading.readingTime ? `${reading.readingTime} read` : '');
    setText('readingSummary', reading.summary);
  }

  function renderBody(reading) {
    renderNotes(reading.notes || []);
    renderReferences(reading.references || []);
  }

  function renderNotes(notes) {
    const el = qs('readingNotes');
    if (!el) return;

    el.innerHTML = notes.map(note => `
      <section class="cr-section">
        <h2 class="cr-section-label">${escHtml(note.heading)}</h2>
        <div class="cr-prose">${paragraphsHtml(note.body)}</div>
      </section>
    `).join('');
  }

  function renderReferences(references) {
    const sectionEl = qs('readingReferencesSection');
    if (!sectionEl) return;

    if (!references.length) {
      sectionEl.style.display = 'none';
      return;
    }

    setHtml('readingReferences', references.map(refItemHtml).join(''));
  }

  function refItemHtml(ref) {
    const authors = (ref.authors || []);
    const authorStr = authors.length === 0 ? ''
      : authors.length === 1 ? authors[0]
      : authors.length === 2 ? authors.join(' & ')
      : `${authors[0]} et al.`;
    const meta = [authorStr, ref.year].filter(Boolean).join(' · ');

    const sourceLink = ref.source
      ? `<div class="cr-ref-links"><a class="cr-ref-link" href="${escAttr(ref.source)}" target="_blank" rel="noopener noreferrer">Source</a></div>`
      : '';

    return `
      <div class="cr-ref-item">
        <div class="cr-ref-title">${escHtml(ref.title)}</div>
        ${meta ? `<div class="cr-ref-meta">${escHtml(meta)}</div>` : ''}
        ${ref.note ? `<p class="cr-ref-note">${escHtml(ref.note)}</p>` : ''}
        ${sourceLink}
      </div>
    `;
  }

  function metaItemHtml(item) {
    return `
      <div class="cr-meta-item">
        <span class="cr-meta-label">${escHtml(item.label)}</span>
        <span class="cr-meta-value">${escHtml(item.value)}</span>
      </div>
    `;
  }

  /* ─── Prev / next navigation ─────────────────────────────── */
  function renderNav(prev, next) {
    const navEl = qs('readingNav');
    if (!navEl) return;

    const prevHtml = prev
      ? navLinkHtml(prev, 'prev', '← Previous')
      : '';

    const nextHtml = next
      ? navLinkHtml(next, 'next', 'Next →')
      : '';

    navEl.innerHTML = prevHtml + nextHtml;
  }

  function navLinkHtml(reading, direction, label) {
    return `
      <a class="cr-nav-link cr-nav-link--${direction}" href="note.html?slug=${escAttr(encodeURIComponent(reading.slug))}">
        <span class="cr-nav-dir">${escHtml(label)}</span>
        <span class="cr-nav-name">${escHtml(reading.title)}</span>
      </a>
    `;
  }

  /* ─── Run on DOM ready ───────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
