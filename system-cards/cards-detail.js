/* ============================================================
   AI Safety Corner — System Card Detail Page JS
   Reads ?slug= from URL, renders the matching system card entry.
   Depends on cards-data.js being loaded first.
   ============================================================ */

(function () {
  'use strict';

  /* ─── Read slug from URL ─────────────────────────────────── */
  const params = new URLSearchParams(window.location.search);
  const slug   = params.get('slug');
  const card   = slug ? getCardBySlug(slug) : null;

  /* ─── Sorted card list (for prev/next) ──────────────────── */
  const sortedCards = [...SYSTEM_CARDS].sort((a, b) =>
    a.systemName.localeCompare(b.systemName)
  );

  /* ─── DOM refs ───────────────────────────────────────────── */
  const notFoundEl    = document.getElementById('scNotFound');
  const cardBodyEl    = document.getElementById('scCardBody');
  const titleEl       = document.getElementById('scTitle');
  const summaryEl     = document.getElementById('scSummary');
  const accessBadgeEl = document.getElementById('scAccessBadge');
  const metaRowEl     = document.getElementById('scMetaRow');
  const readingTimeEl = document.getElementById('scReadingTime');
  const whatItIsEl    = document.getElementById('scWhatItIs');
  const whyItMattersEl = document.getElementById('scWhyItMatters');
  const capabilitiesEl = document.getElementById('scCapabilities');
  const concernsEl    = document.getElementById('scConcerns');
  const evaluationsEl = document.getElementById('scEvaluations');
  const incidentsEl   = document.getElementById('scIncidents');
  const unknownsEl    = document.getElementById('scUnknowns');
  const transparencyEl = document.getElementById('scTransparency');
  const deployEl      = document.getElementById('scDeploy');
  const reportsEl     = document.getElementById('scReports');
  const reportsSectionEl = document.getElementById('scReportsSection');
  const navCardsEl    = document.getElementById('scNavCards');

  /* ─── Boot ───────────────────────────────────────────────── */
  function init() {
    if (!card) {
      showNotFound();
      return;
    }
    renderCard(card);
  }

  /* ─── Not found ──────────────────────────────────────────── */
  function showNotFound() {
    if (notFoundEl) notFoundEl.style.display = 'block';
    if (cardBodyEl) cardBodyEl.style.display = 'none';
    document.title = 'System Card Not Found — AI Safety Corner';
  }

  /* ─── Main render ────────────────────────────────────────── */
  function renderCard(c) {
    /* Page title */
    document.title = `${c.systemName}`;

    /* Access category */
    const accessCat = getAccessCategory(c);
    const accessLabels = {
      'closed':      'Closed',
      'open-weight': 'Open-weight',
      'archived':    'Archived',
    };
    const accessClasses = {
      'closed':      'sc-badge--access-closed',
      'open-weight': 'sc-badge--access-open',
      'archived':    'sc-badge--access-archived',
    };
    if (accessBadgeEl) {
      accessBadgeEl.className = `sc-badge ${accessClasses[accessCat] || 'sc-badge--access-closed'}`;
      accessBadgeEl.textContent = accessLabels[accessCat] || 'Closed';
    }

    /* Title + summary */
    if (titleEl)   titleEl.textContent  = c.systemName;
    if (summaryEl) summaryEl.textContent = c.summary;

    /* Metadata row */
    if (metaRowEl) metaRowEl.innerHTML = buildMetaRow(c);

    /* Reading time */
    if (readingTimeEl && c.readingTime) {
      readingTimeEl.textContent = `${c.readingTime} read`;
    }

    /* Body text sections */
    if (whatItIsEl)    whatItIsEl.innerHTML    = textToHtml(c.whatItIs);
    if (whyItMattersEl) whyItMattersEl.innerHTML = textToHtml(c.whyItMatters);
    if (evaluationsEl) evaluationsEl.innerHTML = textToHtml(c.evaluationsSummary);

    /* Capabilities list */
    if (capabilitiesEl) {
      capabilitiesEl.innerHTML = c.capabilitiesOverview.map(cap => `
        <li class="sc-capability-item">
          <span class="sc-capability-glyph" aria-hidden="true">◆</span>
          <span>${escHtml(cap)}</span>
        </li>
      `).join('');
    }

    /* Safety concerns */
    if (concernsEl) {
      if (c.safetyConcerns.length === 0) {
        concernsEl.outerHTML = '<p class="sc-section-none">No specific safety concerns documented for this entry.</p>';
      } else {
        concernsEl.innerHTML = c.safetyConcerns.map(sc => `
          <li class="sc-concern-item">
            <div class="sc-concern-title">${escHtml(sc.concern)}</div>
            <p class="sc-concern-detail">${escHtml(sc.detail)}</p>
          </li>
        `).join('');
      }
    }

    /* Incidents */
    if (incidentsEl) {
      if (c.incidents.length === 0) {
        incidentsEl.outerHTML = '<p class="sc-section-none">No notable incidents documented for this entry.</p>';
      } else {
        incidentsEl.innerHTML = c.incidents.map(inc => `
          <li class="sc-incident-item">
            <div class="sc-incident-title">${escHtml(inc.title)}</div>
            <p class="sc-incident-detail">${escHtml(inc.detail)}</p>
          </li>
        `).join('');
      }
    }

    /* Unknowns */
    if (unknownsEl) {
      if (c.unknowns.length === 0) {
        unknownsEl.outerHTML = '<p class="sc-section-none">No specific open questions documented for this entry.</p>';
      } else {
        unknownsEl.innerHTML = c.unknowns.map(u => `
          <li class="sc-unknown-item">
            <span class="sc-unknown-glyph" aria-hidden="true">?</span>
            <span>${escHtml(u)}</span>
          </li>
        `).join('');
      }
    }

    /* Transparency block */
    if (transparencyEl) {
      transparencyEl.innerHTML = textToHtml(c.transparencyNotes);
    }

    /* Deployment context */
    if (deployEl && c.deploymentContext) {
      deployEl.textContent = c.deploymentContext;
    } else if (document.getElementById('scDeploySection') && !c.deploymentContext) {
      document.getElementById('scDeploySection').style.display = 'none';
    }

    /* Public reports */
    if (reportsEl) {
      if (!c.publicReportLinks || c.publicReportLinks.length === 0) {
        if (reportsSectionEl) reportsSectionEl.style.display = 'none';
      } else {
        reportsEl.innerHTML = c.publicReportLinks.map(link => `
          <li>
            <a class="sc-report-link" href="${escAttr(link.href)}" target="_blank" rel="noreferrer noopener">
              <span class="sc-report-link-icon" aria-hidden="true">↗</span>
              ${escHtml(link.label)}
              ${link.type ? `<span class="sc-report-link-type">${escHtml(link.type)}</span>` : ''}
            </a>
          </li>
        `).join('');
      }
    }

    /* Prev / Next navigation */
    if (navCardsEl) navCardsEl.innerHTML = buildNavCards(c);
  }

  /* ─── Build metadata row ─────────────────────────────────── */
  function buildMetaRow(c) {
    return [
      metaItem('Organization', c.organization),
      c.releaseDate ? metaItem('Released', formatDate(c.releaseDate)) : '',
    ].join('');
  }

  function metaItem(label, value) {
    return `
      <div class="sc-meta-item">
        <span class="sc-meta-label">${escHtml(label)}</span>
        <span class="sc-meta-value">${escHtml(value)}</span>
      </div>
    `;
  }

  /* ─── Build prev/next nav cards ──────────────────────────── */
  function buildNavCards(c) {
    const idx  = sortedCards.findIndex(sc => sc.slug === c.slug);
    const prev = idx > 0 ? sortedCards[idx - 1] : null;
    const next = idx < sortedCards.length - 1 ? sortedCards[idx + 1] : null;

    let html = '';

    if (prev) {
      html += `
        <a class="sc-nav-card sc-nav-card--prev" href="card.html?slug=${escAttr(prev.slug)}">
          <span class="sc-nav-label">← Previous</span>
          <span class="sc-nav-name">${escHtml(prev.systemName)}</span>
        </a>
      `;
    } else {
      html += '<div></div>';
    }

    if (next) {
      html += `
        <a class="sc-nav-card sc-nav-card--next" href="card.html?slug=${escAttr(next.slug)}">
          <span class="sc-nav-label">Next →</span>
          <span class="sc-nav-name">${escHtml(next.systemName)}</span>
        </a>
      `;
    } else {
      html += '<div></div>';
    }

    return html;
  }

  /* ─── Helpers ────────────────────────────────────────────── */

  /* Convert \n\n-separated text into <p> elements */
  function textToHtml(text) {
    if (!text) return '';
    return text
      .split(/\n\n+/)
      .map(para => `<p>${escHtml(para.trim())}</p>`)
      .join('');
  }

  /* Escape HTML for safe insertion */
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
    return escHtml(str);
  }

  /* Format ISO date string to readable form */
  function formatDate(dateStr) {
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (_) {
      return dateStr;
    }
  }

  /* ─── Run on DOM ready ───────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

