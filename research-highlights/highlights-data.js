// AUTO-GENERATED — do not edit manually.
// Source files live in _content/. Rebuild with: npm run build

const PAPER_HIGHLIGHTS = [
  ...(typeof PAPER_HIGHLIGHTS_2026 !== 'undefined' ? PAPER_HIGHLIGHTS_2026 : []),
];

function getPaperSortTimestamp(paper) {
  return Date.parse(paper.postedDate || paper.date || `${paper.year}-01-01`) || 0;
}

function getPaperPublishedTimestamp(paper) {
  return Date.parse(paper.publishedDate || paper.date || `${paper.year}-01-01`) || 0;
}

function getPaperWeekLabel(paper) {
  const timestamp = getPaperSortTimestamp(paper);
  if (!timestamp) return '';

  const date = new Date(timestamp);
  const day = date.getUTCDay();
  const daysSinceMonday = day === 0 ? 6 : day - 1;
  const monday = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate() - daysSinceMonday
  ));
  const sunday = new Date(Date.UTC(
    monday.getUTCFullYear(),
    monday.getUTCMonth(),
    monday.getUTCDate() + 6
  ));

  const startMonth = monday.toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short' });
  const endMonth   = sunday.toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short' });
  const startDay   = monday.getUTCDate();
  const endDay     = sunday.getUTCDate();
  const startYear  = monday.getUTCFullYear();
  const endYear    = sunday.getUTCFullYear();

  if (startYear !== endYear) {
    return `${startMonth} ${startDay}, ${startYear}-${endMonth} ${endDay}, ${endYear}`;
  }
  if (startMonth !== endMonth) {
    return `${startMonth} ${startDay}-${endMonth} ${endDay}, ${endYear}`;
  }
  return `${startMonth} ${startDay}-${endDay}, ${endYear}`;
}

function getPaperPublishedLabel(paper) {
  const timestamp = getPaperPublishedTimestamp(paper);
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleDateString('en-US', {
    timeZone: 'UTC',
    month: 'short',
    year: 'numeric'
  });
}

function getSortedPaperHighlights() {
  return [...PAPER_HIGHLIGHTS].sort((a, b) =>
    getPaperSortTimestamp(b) - getPaperSortTimestamp(a) ||
    a.title.localeCompare(b.title)
  );
}

/* ─── Reading time ──────────────────────────────────────── */
function computeReadingTime(entry) {
  const textFields = [
    entry.summary, entry.oneLineTakeaway, entry.whyItMatters, entry.coreIdea,
    ...(entry.keyFindings    || []),
    ...(entry.strengths      || []),
    ...(entry.limitations    || []),
    ...(entry.openQuestions  || []),
    ...(entry.recommendedFor || []),
  ];
  const words = textFields
    .filter(Boolean)
    .join(' ')
    .trim()
    .split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 220));
  return `${minutes} min`;
}

PAPER_HIGHLIGHTS.forEach(p => { p.readingTime = computeReadingTime(p); });

/* ─── Lookup helper ─────────────────────────────────────── */
function getPaperBySlug(slug) {
  return PAPER_HIGHLIGHTS.find(p => p.slug === slug) || null;
}

/* ─── Topic list helper ─────────────────────────────────── */
function getAllPaperTopics() {
  const topicSet = new Set();
  PAPER_HIGHLIGHTS.forEach(paper => {
    (paper.topics || []).forEach(topic => topicSet.add(topic));
  });
  return ['Alignment', 'Interpretability', 'Evaluation', 'Robustness', 'Agents', 'Governance']
    .filter(topic => topicSet.has(topic));
}
