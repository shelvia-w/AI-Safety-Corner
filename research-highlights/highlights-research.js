/* ============================================================
   AI Safety Corner — Research Highlight Page JS
   Reads ?slug= from URL, renders the matching paper entry.
   Depends on highlights-data.js being loaded first.
   ============================================================ */

(function () {
  'use strict';

  /* ─── Read slug from URL ─────────────────────────────────── */
  const params = new URLSearchParams(window.location.search);
  const slug   = params.get('slug');
  const paper  = slug ? getPaperBySlug(slug) : null;

  /* ─── DOM refs ───────────────────────────────────────────── */
  const titleEl           = document.getElementById('paperTitle');
  const difficultyEl      = document.getElementById('paperDifficulty');
  const metaRowEl         = document.getElementById('paperMetaRow');
  const topicsEl          = document.getElementById('paperTopics');
  const takeawayEl        = document.getElementById('paperTakeaway');
  const whyEl             = document.getElementById('paperWhyItMatters');
  const coreEl            = document.getElementById('paperCoreIdea');
  const findingsEl        = document.getElementById('paperKeyFindings');
  const strengthsEl       = document.getElementById('paperStrengths');
  const limitationsEl     = document.getElementById('paperLimitations');
  const limitationsBlock  = document.getElementById('paperLimitationsBlock');
  const questionsEl       = document.getElementById('paperOpenQuestions');
  const questionsBlock    = document.getElementById('paperQuestionsBlock');
  const recommendedEl     = document.getElementById('paperRecommendedFor');
  const sourceButtonsEl   = document.getElementById('paperSourceButtons');
  const breadcrumbEl      = document.getElementById('breadcrumbPaper');
  const notFoundEl        = document.getElementById('paperNotFound');
  const paperBodyEl       = document.getElementById('paperBody');

  /* ─── Boot ───────────────────────────────────────────────── */
  function init() {
    if (!paper) {
      showNotFound();
      return;
    }
    renderPaper(paper);
  }

  /* ─── Show not-found state ───────────────────────────────── */
  function showNotFound() {
    if (notFoundEl)  notFoundEl.style.display  = 'block';
    if (paperBodyEl) paperBodyEl.style.display = 'none';
    document.title = 'Paper Not Found — Research Highlights · AI Safety Corner';
  }

  /* ─── Main render ────────────────────────────────────────── */
  function renderPaper(p) {
    document.title = `${p.title}`;

    /* Breadcrumb */
    if (breadcrumbEl) {
      breadcrumbEl.textContent = p.title.length > 40
        ? p.title.slice(0, 38) + '…'
        : p.title;
    }

    /* Difficulty badge */
    if (difficultyEl) {
      difficultyEl.className = `difficulty-badge difficulty-badge--${p.difficulty}`;
      difficultyEl.textContent = diffLabel(p.difficulty);
    }

    /* Title */
    if (titleEl) titleEl.textContent = p.title;

    /* Metadata row */
    if (metaRowEl) {
      const authorsStr = formatAuthors(p.authors, 5);
      const weekLabel = getPaperWeekLabel(p);
      const publishedLabel = getPaperPublishedLabel(p);
      metaRowEl.innerHTML = `
        <div class="paper-meta-item">
          <span class="paper-meta-label">Authors</span>
          <span class="paper-meta-value">${escHtml(authorsStr)}</span>
        </div>
        ${weekLabel ? `
        <div class="paper-meta-item">
          <span class="paper-meta-label">Week</span>
          <span class="paper-meta-value">${escHtml(weekLabel)}</span>
        </div>
        ` : ''}
        ${publishedLabel ? `
        <div class="paper-meta-item">
          <span class="paper-meta-label">Published</span>
          <span class="paper-meta-value">${escHtml(publishedLabel)}</span>
        </div>
        ` : ''}
        <div class="paper-meta-item">
          <span class="paper-meta-label">Venue</span>
          <span class="paper-meta-value">${escHtml(p.venue)}</span>
        </div>
      `;
    }

    /* Topics + reading time */
    if (topicsEl) {
      const topicsHtml = p.topics.map(t =>
        `<span class="paper-topic-tag">${escHtml(t)}</span>`
      ).join('');
      const readingTimeHtml = p.readingTime
        ? `<span class="paper-reading-time">${escHtml(p.readingTime)} read</span>`
        : '';
      topicsEl.innerHTML = topicsHtml + readingTimeHtml;
    }

    /* Takeaway */
    if (takeawayEl) takeawayEl.textContent = p.oneLineTakeaway;

    /* Body prose sections */
    if (whyEl)  whyEl.innerHTML  = textToHtml(p.whyItMatters);
    if (coreEl) coreEl.innerHTML = textToHtml(p.coreIdea);

    /* Key findings */
    if (findingsEl && p.keyFindings && p.keyFindings.length > 0) {
      findingsEl.innerHTML = p.keyFindings.map(f =>
        `<li class="paper-finding-item">${escHtml(f)}</li>`
      ).join('');
    }

    /* Strengths */
    if (strengthsEl && p.strengths && p.strengths.length > 0) {
      strengthsEl.innerHTML = p.strengths.map(s =>
        `<li class="paper-checklist-item paper-checklist-item--strength">${escHtml(s)}</li>`
      ).join('');
    }

    /* Limitations */
    if (p.limitations && p.limitations.length > 0) {
      limitationsEl.innerHTML = p.limitations.map(l =>
        `<li class="paper-checklist-item paper-checklist-item--limit">${escHtml(l)}</li>`
      ).join('');
    } else if (limitationsBlock) {
      limitationsBlock.style.display = 'none';
    }

    /* Open questions */
    if (p.openQuestions && p.openQuestions.length > 0) {
      questionsEl.innerHTML = p.openQuestions.map(q =>
        `<li class="paper-checklist-item paper-checklist-item--question">${escHtml(q)}</li>`
      ).join('');
    } else if (questionsBlock) {
      questionsBlock.style.display = 'none';
    }

    /* Recommended for */
    if (recommendedEl && p.recommendedFor && p.recommendedFor.length > 0) {
      recommendedEl.innerHTML = p.recommendedFor.map(r =>
        `<span class="paper-recommended-item">
          <span class="paper-recommended-icon">◆</span>
          ${escHtml(r)}
        </span>`
      ).join('');
    }

    /* Source links */
    if (sourceButtonsEl) {
      const sources = p.sources || [
        ...(p.sourceLink ? [{ title: 'View Source', url: p.sourceLink, type: 'source' }] : []),
        ...(p.pdfLink    ? [{ title: 'View Paper',  url: p.pdfLink,    type: 'pdf'    }] : []),
      ];
      sourceButtonsEl.innerHTML = sources.map(s => `
        <a class="paper-source-btn" href="${escAttr(s.url)}" target="_blank" rel="noopener noreferrer">
          <span class="paper-source-btn-icon" aria-hidden="true">↗</span>
          <span>${escHtml(s.title)}</span>
          <span class="paper-source-btn-type">${escHtml(s.type || 'link')}</span>
        </a>`
      ).join('');
    }

  }

  /* ─── Helpers ────────────────────────────────────────────── */
  function textToHtml(text) {
    if (!text) return '';
    return text
      .split('\n\n')
      .map(para => `<p>${escHtml(para.trim())}</p>`)
      .join('');
  }

  function formatAuthors(authors, max) {
    if (!authors || authors.length === 0) return '';
    if (authors.length <= max) return authors.join(', ');
    return authors.slice(0, max).join(', ') + ' et al.';
  }

  function diffLabel(d) {
    return { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' }[d] || d;
  }


  function escHtml(str) {
    if (str === null || str === undefined) return '';
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

  /* ─── Run ────────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

