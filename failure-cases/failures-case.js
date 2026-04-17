/* ============================================================
   AI Safety Corner - Failure Cases Detail Page JS
   Reads ?slug= from URL and renders the matching case entry.
   Depends on failures-data.js being loaded first.
   ============================================================ */

(function () {
  'use strict';

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  const entry = slug ? getCaseBySlug(slug) : null;

  // DOM references
  const notFoundEl = document.getElementById('caseNotFound');
  const bodyEl = document.getElementById('caseBody');
  const titleEl = document.getElementById('caseTitle');
  const riskBadgeEl = document.getElementById('caseRiskBadge');
  const statusBadgeEl = document.getElementById('caseStatusBadge');
  const metaSystemEl = document.getElementById('metaSystem');
  const metaOrgEl = document.getElementById('metaOrg');
  const metaDateEl = document.getElementById('metaDate');
  const readingTimeEl = document.getElementById('fcReadingTime');
  const summaryEl = document.getElementById('caseSummary');
  const whatHappenedEl = document.getElementById('caseWhatHappened');
  const whyMattersEl = document.getElementById('caseWhyMatters');
  const causesEl = document.getElementById('caseCauses');
  const lessonsEl = document.getElementById('caseLessons');
  const mitigationsEl = document.getElementById('caseMitigations');
  const sourcesEl = document.getElementById('caseSources');

  function init() {
    if (!entry) {
      showNotFound();
      return;
    }

    renderCase(entry);
  }

  function showNotFound() {
    if (notFoundEl) notFoundEl.style.display = 'block';
    if (bodyEl) bodyEl.style.display = 'none';
    document.title = 'Case Not Found - Failure Cases · AI Safety Corner';
  }

  function renderCase(item) {
    document.title = item.title;

    if (titleEl) titleEl.textContent = item.title;
    if (summaryEl) summaryEl.textContent = item.summary;
    if (metaSystemEl) metaSystemEl.textContent = item.systemName;
    if (metaOrgEl) metaOrgEl.textContent = item.organization;
    if (metaDateEl) metaDateEl.textContent = formatDate(item.date);

    renderBadges(item);
    renderReadingTime(item);
    renderTextSections(item);
    renderList(causesEl, item.likelyCauses);
    renderList(lessonsEl, item.lessons);
    renderList(mitigationsEl, item.mitigations);
    renderSources(item.sourceLinks);
  }

  function renderBadges(item) {
    if (riskBadgeEl) {
      riskBadgeEl.outerHTML = `
        <span class="risk-badge risk-badge--${escAttr(item.riskLevel)}">
          ${escHtml(riskLabel(item.riskLevel))}
        </span>
      `;
    }

    if (statusBadgeEl) {
      statusBadgeEl.outerHTML = `
        <span class="status-badge status-badge--${escAttr(item.statusOfCase)}">
          <span class="status-dot"></span>
          ${escHtml(statusLabel(item.statusOfCase))}
        </span>
      `;
    }
  }

  function renderReadingTime(item) {
    if (readingTimeEl && item.readingTime) {
      readingTimeEl.textContent = `${item.readingTime} read`;
    }
  }

  function renderTextSections(item) {
    if (whatHappenedEl) whatHappenedEl.innerHTML = textToHtml(item.whatHappened);
    if (whyMattersEl) whyMattersEl.innerHTML = textToHtml(item.whyItMatters);
  }

  function renderList(container, items) {
    if (!container) return;

    if (!items || items.length === 0) {
      const section = container.closest('.fc-section');
      if (section) section.style.display = 'none';
      return;
    }

    container.innerHTML = items.map(item => `<li><span>${escHtml(item)}</span></li>`).join('');
  }

  function renderSources(sources) {
    if (!sourcesEl) return;

    if (!sources || sources.length === 0) {
      const section = sourcesEl.closest('.fc-section');
      if (section) section.style.display = 'none';
      return;
    }

    sourcesEl.innerHTML = sources.map(source => `
      <a
        class="fc-source-link"
        href="${escAttr(source.url)}"
        target="_blank"
        rel="noreferrer noopener"
      >
        <span class="fc-source-icon" aria-hidden="true">&#8599;</span>
        <span>${escHtml(source.title)}</span>
        <span class="fc-source-type">${escHtml(source.type || 'link')}</span>
      </a>
    `).join('');
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

  function formatDate(dateStr) {
    if (!dateStr) return '-';

    try {
      const date = new Date(`${dateStr}T00:00:00`);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (_) {
      return dateStr;
    }
  }

  function textToHtml(text) {
    if (!text) return '';

    return text
      .split(/\n\n+/)
      .map(para => `<p>${escHtml(para.trim())}</p>`)
      .join('');
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
