/* ============================================================
   AI Safety Corner - Evaluation Detail Page JS
   Reads ?slug= from the URL and renders the matching entry.
   Depends on eval-data.js being loaded first.
   ============================================================ */

(function () {
  'use strict';

  // Entry lookup
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  const entry = slug ? getEvalBySlug(slug) : null;

  // DOM references
  const notFoundEl = document.getElementById('evNotFound');
  const entryBodyEl = document.getElementById('evEntryBody');
  const titleEl = document.getElementById('evTitle');
  const summaryEl = document.getElementById('evSummary');
  const typeBadgeEl = document.getElementById('evTypeBadge');
  const metaRowEl = document.getElementById('evMetaRow');
  const readingTimeEl = document.getElementById('evReadingTime');

  const whatItMeasuresEl = document.getElementById('evWhatItMeasures');
  const whyItMattersEl = document.getElementById('evWhyItMatters');
  const howItWorksEl = document.getElementById('evHowItWorks');
  const scoringEl = document.getElementById('evScoringMethod');
  const exampleEl = document.getElementById('evExampleTask');

  const strengthsEl = document.getElementById('evStrengths');
  const limitationsEl = document.getElementById('evLimitations');
  const misreadingsEl = document.getElementById('evMisreadings');

  const usageEl = document.getElementById('evUsage');
  const usageSectionEl = document.getElementById('evUsageSection');
  const sourcesEl = document.getElementById('evSources');
  const sourcesSectionEl = document.getElementById('evSourcesSection');

  // Boot
  function init() {
    if (!entry) {
      showNotFound();
      return;
    }

    renderEntry(entry);
  }

  function showNotFound() {
    if (notFoundEl) notFoundEl.style.display = 'block';
    if (entryBodyEl) entryBodyEl.style.display = 'none';

    document.title = 'Not Found - Evaluation · AI Safety Corner';
  }

  // Main render
  function renderEntry(e) {
    document.title = `${e.title} - Evaluation · AI Safety Corner`;

    setText(titleEl, e.title);
    setText(summaryEl, e.summary);

    renderTypeBadge(e);
    renderMetadata(e);
    renderReadingTime(e);

    renderTextSection(whatItMeasuresEl, e.whatItMeasures);
    renderTextSection(whyItMattersEl, e.whyItMatters);
    renderTextSection(howItWorksEl, e.howItWorks);
    renderTextSection(scoringEl, e.scoringMethod);
    renderTextSection(exampleEl, e.exampleTask);

    renderList(strengthsEl, e.strengths, 'ev-strength-item', '+');
    renderList(limitationsEl, e.limitations, 'ev-limitation-item', '-');
    renderList(misreadingsEl, e.commonMisreadings, 'ev-misreading-item', '!');
    renderUsageExamples(e.usageExamples || []);
    renderSources(e.sourceLinks || []);
  }

  function renderTypeBadge(e) {
    if (!typeBadgeEl) return;

    const typeSlug = e.evaluationType.toLowerCase().replace(/\s+/g, '-');
    typeBadgeEl.className = `ev-badge ev-badge--type-${typeSlug}`;
    typeBadgeEl.textContent = e.evaluationType;
  }

  function renderMetadata(e) {
    if (!metaRowEl) return;
    metaRowEl.innerHTML = buildMetaRow(e);
  }

  function renderReadingTime(e) {
    if (!readingTimeEl || !e.readingTime) return;
    readingTimeEl.textContent = `${e.readingTime} read`;
  }

  function renderTextSection(el, text) {
    if (!el) return;
    el.innerHTML = textToHtml(text);
  }

  function renderList(el, items = [], itemClass, glyph) {
    if (!el) return;

    if (!items.length) {
      el.outerHTML = '<p class="ev-section-none">No entries documented.</p>';
      return;
    }

    el.innerHTML = items.map(item => `
      <li class="${itemClass}">
        <span class="${itemClass.replace('-item', '-glyph')}" aria-hidden="true">${glyph}</span>
        <span>${escHtml(item)}</span>
      </li>
    `).join('');
  }

  function renderUsageExamples(items) {
    if (!usageEl) return;

    if (!items.length) {
      if (usageSectionEl) usageSectionEl.style.display = 'none';
      return;
    }

    usageEl.innerHTML = items.map(item => `
      <li class="ev-usage-item">
        <div class="ev-usage-org">${escHtml(item.org)}</div>
        <p class="ev-usage-desc">${escHtml(item.description)}</p>
      </li>
    `).join('');
  }

  function renderSources(items) {
    if (!sourcesEl) return;

    if (!items.length) {
      if (sourcesSectionEl) sourcesSectionEl.style.display = 'none';
      return;
    }

    sourcesEl.innerHTML = items.map(item => `
      <a
        class="ev-source-link"
        href="${escAttr(item.url)}"
        target="_blank"
        rel="noreferrer noopener"
      >
        <span class="ev-source-icon" aria-hidden="true">↗</span>
        <span>${escHtml(item.title)}</span>
        <span class="ev-source-type">${escHtml(item.type || 'link')}</span>
      </a>
    `).join('');
  }

  // Metadata
  function buildMetaRow(e) {
    const items = [];

    if (e.updated) items.push(metaItem('Updated', formatDate(e.updated)));
    if (e.safetyArea) items.push(metaItem('Safety Area', e.safetyArea));

    return items.join('');
  }

  function metaItem(label, value) {
    return `
      <div class="ev-meta-item">
        <span class="ev-meta-label">${escHtml(label)}</span>
        <span class="ev-meta-value">${escHtml(value)}</span>
      </div>
    `;
  }

  // Text helpers
  function textToHtml(text) {
    if (!text) return '';

    return text
      .split(/\n\n+/)
      .map(paragraph => {
        const trimmed = paragraph.trim();

        if (isBulletBlock(trimmed)) {
          const items = trimmed
            .split('\n')
            .filter(line => isBulletLine(line.trim()))
            .map(line => `<li>${escHtml(stripBullet(line.trim()))}</li>`)
            .join('');

          return `<ul class="ev-bullet-list">${items}</ul>`;
        }

        return `<p>${escHtml(trimmed)}</p>`;
      })
      .join('');
  }

  function isBulletBlock(text) {
    return text.split('\n').every(line => isBulletLine(line.trim()));
  }

  function isBulletLine(line) {
    return /^([•*-])\s+/.test(line);
  }

  function stripBullet(line) {
    return line.replace(/^([•*-])\s+/, '');
  }

  function setText(el, text) {
    if (el) el.textContent = text || '';
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

  function formatDate(dateStr) {
    try {
      const date = new Date(`${dateStr}T00:00:00`);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (_) {
      return dateStr;
    }
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
