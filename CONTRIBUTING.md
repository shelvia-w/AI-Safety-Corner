# Contributing Content

This site uses a simple content pipeline. Source content lives in `_content/` as JSON files. A Node.js build script compiles them into the JS data files the frontend uses.

## Quick start

```bash
# Install (only needed once; no dependencies beyond Node 18+)
npm install

# After editing or adding any content file, rebuild:
npm run build
```

The build overwrites the generated files in `glossary/`, `failure-cases/`, `evaluation/`, `system-cards/`, `research-highlights/`, and `personal-notes/`. **Do not hand-edit those generated JS files** — your changes will be overwritten on the next build.

---

## Content sections and file locations

| Section | Source folder | Filename format |
|---|---|---|
| Glossary | `_content/glossary/` | `slug.json` |
| Failure Cases | `_content/failure-cases/` | `slug.json` |
| Evaluations | `_content/evaluations/` | `slug.json` |
| System Cards | `_content/system-cards/` | `slug.json` |
| Research Highlights | `_content/research-highlights/YYYY/` | `YYYY-MM-DD-slug.json` |
| Personal Notes | `_content/personal-notes/group/` | `YYYY-MM-DD-slug.json` |

---

## Adding a new entry

### Glossary term

Create `_content/glossary/your-slug.json`. Required fields:

```json
{
  "slug": "your-slug",
  "term": "Term Name",
  "oneLineDefinition": "One sentence.",
  "plainExplanation": "...",
  "whyItMatters": "...",
  "example": "...",
  "analogy": "...",
  "commonConfusions": "...",
  "tags": ["tag-one", "tag-two"],
  "topics": ["Topic Name"],
  "featured": false,
  "relatedTerms": ["other-slug"],
  "relatedContent": [],
  "date": "2026-04-15"
}
```

### Failure case

Create `_content/failure-cases/your-slug.json`. Required fields:

```json
{
  "slug": "your-slug",
  "title": "Short title",
  "contentType": "failure-case",
  "systemName": "Model or system name",
  "organization": "Org name",
  "date": "2023-01-01",
  "statusOfCase": "mitigated | resolved | ongoing",
  "summary": "...",
  "shortDescription": "...",
  "whatHappened": "...",
  "whyItMatters": "...",
  "riskLevel": "low | medium | high | critical",
  "deploymentContext": "...",
  "affectedUsers": "...",
  "likelyCauses": ["..."],
  "lessons": ["..."],
  "mitigations": ["..."],
  "tags": ["tag-one"],
  "featured": false,
  "status": "published",
  "updated": "2026-04-15",
  "sourceLinks": [
    { "title": "Source title", "url": "https://...", "type": "article | paper | report" }
  ]
}
```

### Evaluation

Create `_content/evaluations/your-slug.json`. Required fields:

```json
{
  "slug": "your-slug",
  "title": "Evaluation Name",
  "contentType": "evaluation",
  "evaluationType": "Benchmark | Method | Framework",
  "safetyArea": "Safety area name",
  "summary": "...",
  "quickDefinition": "...",
  "whatItMeasures": "...",
  "whyItMatters": "...",
  "howItWorks": "...",
  "difficulty": "beginner | intermediate | advanced",
  "featured": false,
  "status": "active",
  "date": "2026-04-15",
  "updated": "2026-04-15",
  "scoringMethod": "...",
  "exampleTask": "...",
  "strengths": ["..."],
  "limitations": ["..."],
  "commonMisreadings": ["..."],
  "alternatives": [{ "name": "...", "href": "eval.html?slug=..." }],
  "usageExamples": [{ "org": "...", "description": "..." }],
  "sourceLinks": [{ "title": "...", "url": "https://...", "type": "paper | reference" }]
}
```

### System card

Create `_content/system-cards/your-slug.json`. Required fields:

```json
{
  "slug": "your-slug",
  "systemName": "Model Family Name",
  "organization": "Org Name",
  "accessStatus": "closed | open-weight | api-only",
  "releaseDate": "2026-01-01",
  "summary": "...",
  "shortDescription": "...",
  "whatItIs": "...",
  "whyItMatters": "...",
  "capabilitiesOverview": ["..."],
  "safetyConcerns": [{ "concern": "...", "detail": "..." }],
  "evaluationsSummary": "...",
  "incidents": [],
  "unknowns": ["..."],
  "transparencyNotes": "...",
  "updated": "2026-04-15",
  "publicReportLinks": [{ "label": "...", "href": "https://...", "type": "model-card | blog-post" }],
  "deploymentContext": "..."
}
```

### Research highlight

Create `_content/research-highlights/YYYY/YYYY-MM-DD-slug.json` where the date is the `postedDate`. Example: `_content/research-highlights/2026/2026-04-15-my-paper.json`.

If the year folder does not exist yet, create it. The build script picks up all year folders automatically and generates a `highlights-data-YYYY.js` for each one. You also need to add a `<script>` tag for the new year file in `research-highlights/index.html` and `research-highlights/research.html` **before** `highlights-data.js`.

Required fields:

```json
{
  "slug": "my-paper",
  "title": "Paper Title",
  "contentType": "research | report | blog-post",
  "authors": ["Author Name"],
  "year": 2026,
  "venue": "Venue or Publisher",
  "sources": [{ "title": "...", "url": "https://...", "type": "paper | blog-post | report" }],
  "topics": ["Alignment"],
  "tags": ["research-highlight"],
  "summary": "...",
  "oneLineTakeaway": "...",
  "whyItMatters": "...",
  "coreIdea": "...",
  "keyFindings": ["..."],
  "difficulty": "beginner | intermediate | advanced",
  "recommendedFor": ["..."],
  "featured": false,
  "status": "published",
  "publishedDate": "2026-04-15",
  "postedDate": "2026-04-15",
  "updated": null,
  "strengths": ["..."],
  "limitations": ["..."],
  "openQuestions": ["..."]
}
```

### Personal note

Create `_content/personal-notes/GROUP/YYYY-MM-DD-slug.json` where `GROUP` is one of `start-here`, `foundations`, or `deeper`. The date is the note's `date` field.

Required fields:

```json
{
  "slug": "my-note",
  "title": "Note Title",
  "group": "start-here | foundations | deeper",
  "summary": "...",
  "notes": [
    { "heading": "Section heading", "body": "Section body." }
  ],
  "references": [
    {
      "title": "Paper Title",
      "authors": ["Author"],
      "year": 2020,
      "source": "https://...",
      "note": "Why this is relevant."
    }
  ],
  "author": "Your Name",
  "contentType": "motivation | learning | reflection",
  "featured": false,
  "status": "published",
  "date": "2026-04-15",
  "updated": "2026-04-15"
}
```

---

## Rebuild after every change

Any time you add, edit, or remove a file in `_content/`, run:

```bash
npm run build
```

The script will:
- Read all JSON source files
- Sort entries deterministically (by date, then slug)
- Validate required fields and warn about missing ones
- Write all generated JS data files
- Print entry counts per section

---

## Keeping slugs stable

The `slug` field inside the JSON is what the frontend uses for URL routing (e.g., `?slug=your-slug`). **Do not change a slug after an entry is published** — it will break any external links to that entry. The filename can use the slug as-is (for most sections) or be date-prefixed (for highlights and notes), but the `slug` field in the JSON is always the canonical identifier.
