// AUTO-GENERATED — do not edit manually.
// Source files live in _content/. Rebuild with: npm run build

const SYSTEM_CARDS = [

];

/* ─── Reading time ───────────────────────────────────────────── */
function computeCardReadingTime(c) {
  const fields = [
    c.summary, c.shortDescription, c.whatItIs, c.whyItMatters,
    c.evaluationsSummary, c.transparencyNotes,
    ...(c.capabilitiesOverview || []),
    ...(c.unknowns             || []),
    ...(c.safetyConcerns       || []).flatMap(s => [s.concern, s.detail]),
    ...(c.incidents            || []).flatMap(i => [i.description, i.impact]),
  ];
  const words = fields.filter(Boolean).join(' ').trim().split(/\s+/).length;
  return `${Math.max(1, Math.round(words / 220))} min`;
}
SYSTEM_CARDS.forEach(c => { c.readingTime = computeCardReadingTime(c); });

/* ─── Helpers ────────────────────────────────────────────── */
function getCardBySlug(slug) {
  return SYSTEM_CARDS.find(c => c.slug === slug) || null;
}

function getAllOrganizations() {
  const orgs = new Set(SYSTEM_CARDS.map(c => c.organization));
  return [...orgs].sort();
}

function getAccessCategory(card) {
  return card.accessStatus || 'closed';
}
