// AUTO-GENERATED — do not edit manually.
// Source files live in _content/. Rebuild with: npm run build

const EVAL_ENTRIES = [

];

/* Reading time */
function computeEvalReadingTime(entry) {
  const fields = [
    entry.summary,
    entry.quickDefinition,
    entry.whatItMeasures,
    entry.whyItMatters,
    entry.howItWorks,
    entry.scoringMethod,
    entry.exampleTask,
    ...(entry.strengths        || []),
    ...(entry.limitations      || []),
    ...(entry.commonMisreadings|| []),
    ...(entry.usageExamples    || []).map(item => item.description),
  ];

  const text = fields.filter(Boolean).join(' ').trim();
  const words = text ? text.split(/\s+/).length : 0;
  const minutes = Math.max(1, Math.round(words / 220));

  return `${minutes} min`;
}

EVAL_ENTRIES.forEach(entry => {
  entry.readingTime = computeEvalReadingTime(entry);
});

/* Helpers */
function getEvalBySlug(slug) {
  return EVAL_ENTRIES.find(e => e.slug === slug) || null;
}

function getAllEvalTopics() {
  const topics = new Set(EVAL_ENTRIES.map(e => e.safetyArea).filter(Boolean));
  return [...topics].sort();
}
