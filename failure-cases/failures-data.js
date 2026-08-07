// AUTO-GENERATED — do not edit manually.
// Source files live in _content/. Rebuild with: npm run build

const FAILURE_CASES = [

];

/* Reading time */
function computeFailureReadingTime(c) {
  const fields = [
    c.summary, c.shortDescription, c.whatHappened, c.whyItMatters,
    ...(c.likelyCauses || []),
    ...(c.lessons      || []),
    ...(c.mitigations  || []),
  ];
  const words = fields.filter(Boolean).join(' ').trim().split(/\s+/).length;
  return `${Math.max(1, Math.round(words / 220))} min`;
}
FAILURE_CASES.forEach(c => { c.readingTime = computeFailureReadingTime(c); });

/* Helpers */

function getCaseBySlug(slug) {
  return FAILURE_CASES.find(c => c.slug === slug) || null;
}
