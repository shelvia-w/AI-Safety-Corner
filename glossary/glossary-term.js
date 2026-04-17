/* ============================================================
   AI Safety Corner — Glossary Term Page JS
   Reads ?slug= from the URL and renders the matching term entry.
   Depends on glossary-data.js being loaded first.
   ============================================================ */

(function () {
  'use strict';

  /* ─── Current term ──────────────────────────────────────── */
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  const term = slug ? getTermBySlug(slug) : null;

  /* ─── DOM refs ──────────────────────────────────────────── */
  const titleEl = document.getElementById('termTitle');
  const readingTimeEl = document.getElementById('termReadingTime');
  const definitionEl = document.getElementById('termDefinitionText');
  const plainEl = document.getElementById('termPlain');
  const mattersEl = document.getElementById('termMatters');
  const exampleEl = document.getElementById('termExample');
  const analogyBlockEl = document.getElementById('termAnalogyBlock');
  const analogyEl = document.getElementById('termAnalogy');
  const confusionEl = document.getElementById('termConfusion');
  const notFoundEl = document.getElementById('termNotFound');
  const termBodyEl = document.getElementById('termBody');

  /* ─── Boot ──────────────────────────────────────────────── */
  function init() {
    if (!term) {
      showNotFound();
      return;
    }

    renderTerm(term);
  }

  function showNotFound() {
    if (notFoundEl) notFoundEl.style.display = 'block';
    if (termBodyEl) termBodyEl.style.display = 'none';
    document.title = 'Term Not Found — Glossary · AI Safety Corner';
  }

  /* ─── Render ────────────────────────────────────────────── */
  function renderTerm(entry) {
    document.title = `${entry.term} — Glossary · AI Safety Corner`;

    if (titleEl) titleEl.textContent = entry.term;
    if (readingTimeEl && entry.readingTime) {
      readingTimeEl.textContent = `${entry.readingTime} read`;
    }
    if (definitionEl) definitionEl.textContent = entry.oneLineDefinition;

    if (plainEl) plainEl.innerHTML = textToHtml(entry.plainExplanation);
    if (mattersEl) mattersEl.innerHTML = textToHtml(entry.whyItMatters);
    if (exampleEl) exampleEl.innerHTML = textToHtml(entry.example);
    if (confusionEl) confusionEl.innerHTML = textToHtml(entry.commonConfusions);

    if (entry.analogy && analogyBlockEl && analogyEl) {
      analogyEl.innerHTML = textToHtml(entry.analogy);
      analogyBlockEl.style.display = '';
    } else if (analogyBlockEl) {
      analogyBlockEl.style.display = 'none';
    }
  }

  /* ─── Helpers ───────────────────────────────────────────── */
  function textToHtml(text) {
    if (!text) return '';
    return String(text)
      .split(/\n\n+/)
      .map(paragraph => `<p>${escapeHtml(paragraph.trim())}</p>`)
      .join('');
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ─── Run ───────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
