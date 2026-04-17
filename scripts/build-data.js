#!/usr/bin/env node
/**
 * build-data.js — AI Safety Website content pipeline
 *
 * Reads JSON source files from _content/ and writes generated JS data
 * files consumed by the frontend. Run with: npm run build
 *
 * Source layout:
 *   _content/glossary/           slug.json           (any order)
 *   _content/failure-cases/      slug.json           (any order)
 *   _content/evaluations/        slug.json           (any order)
 *   _content/system-cards/       slug.json           (any order)
 *   _content/research-highlights/YYYY/  YYYY-MM-DD-slug.json  (newest first)
 *   _content/personal-notes/group/     YYYY-MM-DD-slug.json  (any order)
 *
 * Generated files (do not edit manually):
 *   glossary/glossary-data.js
 *   failure-cases/failures-data.js
 *   evaluation/eval-data.js
 *   system-cards/cards-data.js
 *   research-highlights/highlights-data-YYYY.js  (one per year folder)
 *   research-highlights/highlights-data.js       (combiner)
 *   personal-notes/notes-data-{group}.js         (one per group folder)
 *   personal-notes/notes-data.js                 (combiner)
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

/* ─── Utilities ────────────────────────────────────────────────────────── */

function readJsonDir(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      try {
        return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      } catch (err) {
        console.error(`  ERROR: could not parse ${path.join(dir, f)}: ${err.message}`);
        process.exit(1);
      }
    });
}

function readJsonDirs(baseDir) {
  /** Recursively read JSON files one level deep (year or group subfolders). */
  if (!fs.existsSync(baseDir)) return {};
  const result = {};
  for (const sub of fs.readdirSync(baseDir)) {
    const subPath = path.join(baseDir, sub);
    if (fs.statSync(subPath).isDirectory()) {
      result[sub] = readJsonDir(subPath);
    }
  }
  return result;
}

function sortByDateDesc(entries, dateField) {
  return [...entries].sort((a, b) => {
    const ta = Date.parse(a[dateField]) || 0;
    const tb = Date.parse(b[dateField]) || 0;
    if (tb !== ta) return tb - ta;
    return (a.slug || '').localeCompare(b.slug || '');
  });
}

function sortByDateAsc(entries, dateField) {
  return [...entries].sort((a, b) => {
    const ta = Date.parse(a[dateField]) || 0;
    const tb = Date.parse(b[dateField]) || 0;
    if (ta !== tb) return ta - tb;
    return (a.slug || '').localeCompare(b.slug || '');
  });
}

function toJs(value, indent = 0) {
  return JSON.stringify(value, null, 2)
    .split('\n')
    .map((line, i) => (i === 0 ? line : ' '.repeat(indent) + line))
    .join('\n');
}

const GENERATED_BANNER = `// AUTO-GENERATED — do not edit manually.
// Source files live in _content/. Rebuild with: npm run build\n`;

function write(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`  wrote ${path.relative(ROOT, filePath)}`);
}

/* ─── Validate required fields ─────────────────────────────────────────── */

function validateEntries(entries, requiredFields, section) {
  let ok = true;
  for (const entry of entries) {
    for (const field of requiredFields) {
      if (entry[field] === undefined || entry[field] === null || entry[field] === '') {
        console.warn(`  WARN [${section}] slug="${entry.slug}" missing field: ${field}`);
        ok = false;
      }
    }
  }
  return ok;
}

/* ─── Section builders ──────────────────────────────────────────────────── */

function buildGlossary() {
  const entries = readJsonDir(path.join(ROOT, '_content/glossary'));
  const sorted  = sortByDateAsc(entries, 'date'); // preserve stable alphabetical-ish order

  validateEntries(sorted, ['slug', 'term', 'oneLineDefinition', 'date'], 'glossary');

  const entriesJs = sorted.map(e => '  ' + toJs(e, 2) + ',').join('\n');

  const output = `${GENERATED_BANNER}
const GLOSSARY_TERMS = [
${entriesJs}
];

/* ─── Reading time ─────────────────────────────────────────── */
function computeGlossaryReadingTime(t) {
  const fields = [
    t.oneLineDefinition, t.plainExplanation, t.whyItMatters,
    t.example, t.analogy, t.commonConfusions,
  ];
  const text = fields.filter(Boolean).join(' ').trim();
  const words = text ? text.split(/\\s+/).length : 0;
  return \`\${Math.max(1, Math.round(words / 220))} min\`;
}
GLOSSARY_TERMS.forEach(t => { t.readingTime = computeGlossaryReadingTime(t); });

/* Helper: find a term by slug */
function getTermBySlug(slug) {
  return GLOSSARY_TERMS.find(t => t.slug === slug) || null;
}
`;

  write(path.join(ROOT, 'glossary/glossary-data.js'), output);
  return sorted.length;
}

/* ─────────────────────────────────────────────────────────────────────── */

function buildFailureCases() {
  const entries = readJsonDir(path.join(ROOT, '_content/failure-cases'));
  const sorted  = sortByDateDesc(entries, 'date');

  validateEntries(sorted, ['slug', 'title', 'contentType', 'date', 'riskLevel'], 'failure-cases');

  const entriesJs = sorted.map(e => '  ' + toJs(e, 2) + ',').join('\n');

  const output = `${GENERATED_BANNER}
const FAILURE_CASES = [
${entriesJs}
];

/* Reading time */
function computeFailureReadingTime(c) {
  const fields = [
    c.summary, c.shortDescription, c.whatHappened, c.whyItMatters,
    ...(c.likelyCauses || []),
    ...(c.lessons      || []),
    ...(c.mitigations  || []),
  ];
  const words = fields.filter(Boolean).join(' ').trim().split(/\\s+/).length;
  return \`\${Math.max(1, Math.round(words / 220))} min\`;
}
FAILURE_CASES.forEach(c => { c.readingTime = computeFailureReadingTime(c); });

/* Helpers */

function getCaseBySlug(slug) {
  return FAILURE_CASES.find(c => c.slug === slug) || null;
}
`;

  write(path.join(ROOT, 'failure-cases/failures-data.js'), output);
  return sorted.length;
}

/* ─────────────────────────────────────────────────────────────────────── */

function buildEvaluations() {
  const entries = readJsonDir(path.join(ROOT, '_content/evaluations'));
  const sorted  = sortByDateDesc(entries, 'date');

  validateEntries(sorted, ['slug', 'title', 'contentType', 'evaluationType', 'date'], 'evaluations');

  const entriesJs = sorted.map(e => '  ' + toJs(e, 2) + ',').join('\n');

  const output = `${GENERATED_BANNER}
const EVAL_ENTRIES = [
${entriesJs}
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
  const words = text ? text.split(/\\s+/).length : 0;
  const minutes = Math.max(1, Math.round(words / 220));

  return \`\${minutes} min\`;
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
`;

  write(path.join(ROOT, 'evaluation/eval-data.js'), output);
  return sorted.length;
}

/* ─────────────────────────────────────────────────────────────────────── */

function buildSystemCards() {
  const entries = readJsonDir(path.join(ROOT, '_content/system-cards'));
  const sorted  = sortByDateDesc(entries, 'releaseDate');

  validateEntries(sorted, ['slug', 'systemName', 'organization', 'accessStatus'], 'system-cards');

  const entriesJs = sorted.map(e => '  ' + toJs(e, 2) + ',').join('\n');

  const output = `${GENERATED_BANNER}
const SYSTEM_CARDS = [
${entriesJs}
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
  const words = fields.filter(Boolean).join(' ').trim().split(/\\s+/).length;
  return \`\${Math.max(1, Math.round(words / 220))} min\`;
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
`;

  write(path.join(ROOT, 'system-cards/cards-data.js'), output);
  return sorted.length;
}

/* ─────────────────────────────────────────────────────────────────────── */

function buildResearchHighlights() {
  const byYear = readJsonDirs(path.join(ROOT, '_content/research-highlights'));
  let total = 0;
  const yearVars = [];

  for (const year of Object.keys(byYear).sort().reverse()) {
    const entries = sortByDateDesc(byYear[year], 'postedDate');
    validateEntries(entries, ['slug', 'title', 'contentType', 'postedDate'], `research-highlights/${year}`);

    const varName  = `PAPER_HIGHLIGHTS_${year}`;
    const entriesJs = entries.map(e => '  ' + toJs(e, 2) + ',').join('\n');

    const output = `${GENERATED_BANNER}
var ${varName} = [
${entriesJs}
];
`;

    write(path.join(ROOT, `research-highlights/highlights-data-${year}.js`), output);
    yearVars.push({ year, varName });
    total += entries.length;
  }

  // Combiner — same structure as original highlights-data.js
  const spreadLines = yearVars.map(
    ({ varName }) =>
      `  ...(typeof ${varName} !== 'undefined' ? ${varName} : []),`
  ).join('\n');

  const combiner = `${GENERATED_BANNER}
const PAPER_HIGHLIGHTS = [
${spreadLines}
];

function getPaperSortTimestamp(paper) {
  return Date.parse(paper.postedDate || paper.date || \`\${paper.year}-01-01\`) || 0;
}

function getPaperPublishedTimestamp(paper) {
  return Date.parse(paper.publishedDate || paper.date || \`\${paper.year}-01-01\`) || 0;
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
    return \`\${startMonth} \${startDay}, \${startYear}-\${endMonth} \${endDay}, \${endYear}\`;
  }
  if (startMonth !== endMonth) {
    return \`\${startMonth} \${startDay}-\${endMonth} \${endDay}, \${endYear}\`;
  }
  return \`\${startMonth} \${startDay}-\${endDay}, \${endYear}\`;
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
    .split(/\\s+/).length;
  const minutes = Math.max(1, Math.round(words / 220));
  return \`\${minutes} min\`;
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
`;

  write(path.join(ROOT, 'research-highlights/highlights-data.js'), combiner);
  return total;
}

/* ─────────────────────────────────────────────────────────────────────── */

const GROUP_VAR_MAP = {
  'start-here':  'CORE_READINGS_START_HERE',
  'foundations': 'CORE_READINGS_FOUNDATIONS',
  'deeper':      'CORE_READINGS_DEEPER',
};

const GROUP_FILE_MAP = {
  'start-here':  'notes-data-start-here.js',
  'foundations': 'notes-data-foundations.js',
  'deeper':      'notes-data-deeper.js',
};

function buildPersonalNotes() {
  const byGroup = readJsonDirs(path.join(ROOT, '_content/personal-notes'));
  let total = 0;
  const groupVars = [];

  // Preserve logical reading order: start-here → foundations → deeper
  const groupOrder = ['start-here', 'foundations', 'deeper',
    ...Object.keys(byGroup).filter(g => !['start-here', 'foundations', 'deeper'].includes(g)).sort()
  ];

  for (const group of groupOrder) {
    if (!byGroup[group]) continue;
    const entries = sortByDateAsc(byGroup[group], 'date');
    validateEntries(entries, ['slug', 'title', 'group', 'date'], `personal-notes/${group}`);

    const varName  = GROUP_VAR_MAP[group] || `CORE_READINGS_${group.toUpperCase().replace(/-/g, '_')}`;
    const fileName = GROUP_FILE_MAP[group] || `notes-data-${group}.js`;
    const entriesJs = entries.map(e => '  ' + toJs(e, 2) + ',').join('\n');

    const output = `${GENERATED_BANNER}
var ${varName} = [
${entriesJs}
];
`;

    write(path.join(ROOT, `personal-notes/${fileName}`), output);
    groupVars.push({ group, varName });
    total += entries.length;
  }

  // Combiner
  const spreadLines = groupVars.map(
    ({ varName }) =>
      `  ...(typeof ${varName} !== 'undefined' ? ${varName} : []),`
  ).join('\n');

  const combiner = `${GENERATED_BANNER}
const CORE_READINGS = [
${spreadLines}
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
    .split(/\\s+/).length;
  const minutes = Math.max(1, Math.round(words / 220));
  return \`\${minutes} min\`;
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
`;

  write(path.join(ROOT, 'personal-notes/notes-data.js'), combiner);
  return total;
}

/* ─── Main ──────────────────────────────────────────────────────────────── */

function main() {
  console.log('Building content data files...\n');

  const counts = {
    glossary:    buildGlossary(),
    failures:    buildFailureCases(),
    evaluations: buildEvaluations(),
    cards:       buildSystemCards(),
    highlights:  buildResearchHighlights(),
    notes:       buildPersonalNotes(),
  };

  console.log('\nEntry counts:');
  for (const [section, count] of Object.entries(counts)) {
    console.log(`  ${section.padEnd(14)} ${count}`);
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  console.log(`  ${'total'.padEnd(14)} ${total}`);
  console.log('\nDone.');
}

main();
