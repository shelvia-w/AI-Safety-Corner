// AUTO-GENERATED — do not edit manually.
// Source files live in _content/. Rebuild with: npm run build

const CORE_READINGS = [
  ...(typeof CORE_READINGS_START_HERE !== 'undefined' ? CORE_READINGS_START_HERE : []),
  ...(typeof CORE_READINGS_FOUNDATIONS !== 'undefined' ? CORE_READINGS_FOUNDATIONS : []),
  ...(typeof CORE_READINGS_DEEPER !== 'undefined' ? CORE_READINGS_DEEPER : []),
];

/* --- Reading time --------------------------------------------- */
function computeCoreReadingTime(entry) {
  const notesText = (entry.notes      || []).flatMap(n => [n.heading, n.body]);
  const refsText  = (entry.references || []).map(r => r.note);

  const textFields = [
    entry.summary,
    ...notesText,
    ...refsText,
  ];

  const words = textFields
    .filter(Boolean)
    .join(' ')
    .trim()
    .split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 220));
  return `${minutes} min`;
}

CORE_READINGS.forEach(r => { r.readingTime = computeCoreReadingTime(r); });

/* --- Helper functions ----------------------------------------- */

function getCoreReadingBySlug(slug) {
  return CORE_READINGS.find(r => r.slug === slug) || null;
}

function getFeaturedReadings() {
  return CORE_READINGS.filter(r => r.featured);
}

function getReadingIndex(slug) {
  return CORE_READINGS.findIndex(r => r.slug === slug);
}

function getPrevNextReading(slug) {
  const reading = getCoreReadingBySlug(slug);
  if (!reading) return { prev: null, next: null };
  const group = CORE_READINGS.filter(r => r.group === reading.group);
  const idx = group.findIndex(r => r.slug === slug);
  return {
    prev: idx > 0 ? group[idx - 1] : null,
    next: idx < group.length - 1 ? group[idx + 1] : null,
  };
}
