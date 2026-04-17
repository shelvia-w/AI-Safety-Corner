// AUTO-GENERATED — do not edit manually.
// Source files live in _content/. Rebuild with: npm run build

const SYSTEM_CARDS = [
  {
    "slug": "gemma-4",
    "systemName": "Gemma 4",
    "organization": "Google DeepMind",
    "accessStatus": "open-weight",
    "releaseDate": "2026-03-31",
    "summary": "Google DeepMind’s latest open-weight Gemma family, combining multimodal input, long context, and stronger safety documentation than most open releases.",
    "shortDescription": "Gemma 4 is a family of open-weight multimodal models from Google DeepMind, available in E2B, E4B, 26B A4B, and 31B variants. It supports text and image input across the family, audio on the smaller models, long context windows up to 256K tokens, and comes with a detailed model card covering capabilities, safety evaluations, and limitations.",
    "whatItIs": "Gemma 4 is a family of open-weight multimodal models from Google DeepMind. The family includes E2B, E4B, 26B A4B, and 31B variants, spanning edge devices, laptops, and larger workstation-class deployments.\n\nAll Gemma 4 models support text and image input, while the E2B and E4B variants also support native audio input. Google describes the family as designed for reasoning, coding, agentic workflows, and multimodal understanding, with context windows of 128K tokens on the smaller models and up to 256K on the larger ones.\n\nWeights are released under Apache 2.0, and Google publishes an unusually detailed model card covering architecture, capabilities, safety evaluation approach, results, and usage limitations.",
    "whyItMatters": "Gemma 4 matters because it pushes open-weight models closer to frontier capability while retaining relatively strong documentation and explicit safety evaluation reporting. That makes it a useful case study in how open releases can be accompanied by more substantive transparency than a bare model dump.\n\nIt also sharpens the governance tradeoff around capable open models: broader access supports local deployment, reproducibility, and independent research, but once weights are distributed, downstream safety controls can be modified or removed outside any centralized platform boundary.",
    "capabilitiesOverview": [
      "Text generation, summarization, and question answering",
      "Reasoning with configurable thinking mode",
      "Code generation, completion, and correction",
      "Function calling and structured tool use for agentic workflows",
      "Image understanding, including OCR, chart comprehension, document parsing, and UI understanding",
      "Video understanding through frame-based processing",
      "Audio speech recognition and speech translation on E2B and E4B",
      "Long-context processing up to 128K or 256K tokens depending on model size",
      "Multilingual support, with pretraining on 140+ languages"
    ],
    "safetyConcerns": [
      {
        "concern": "Dual-use risks of open weights",
        "detail": "Like other open-weight models, Gemma 4 can be fine-tuned or deployed without Google-controlled safeguards once downloaded, limiting the effectiveness of centralized monitoring or rate limiting."
      },
      {
        "concern": "Capable multimodal local deployment",
        "detail": "Because Gemma 4 is designed to run across a wide range of hardware, including local and edge devices, it can support privacy-preserving and legitimate offline use, but also makes misuse harder to supervise at the platform layer."
      },
      {
        "concern": "Residual harmful generation risk",
        "detail": "Google evaluates Gemma 4 against categories including CSAM-related content, dangerous content, sexually explicit content, hate speech, and harassment, which signals that these remain important failure modes even though reported policy violations were low in testing."
      }
    ],
    "evaluationsSummary": "Google DeepMind reports automated and human safety evaluations conducted with internal safety and responsible AI teams. The model card states that Gemma 4 was evaluated against harmful content categories including CSAM and exploitation-related content, dangerous content, sexually explicit content, hate speech, and harassment. Google reports major safety improvements over Gemma 3 and 3n while keeping unjustified refusals low, and says testing was done without safety filters to evaluate model behavior directly.",
    "incidents": [],
    "unknowns": [
      "Training data is described at a high level, but full dataset composition is not publicly disclosed.",
      "The extent to which Gemma 4 safety behavior persists after downstream fine-tuning or instruction modification is not fully characterized in the public card.",
      "Independent third-party audits of Gemma 4’s dangerous capability profile and misuse resistance are still limited relative to the pace of release.",
      "Real-world misuse patterns for offline and edge deployment are inherently difficult to observe once weights are distributed."
    ],
    "transparencyNotes": "Google DeepMind published a detailed Gemma 4 model card at release, covering model sizes, modalities, context length, architecture notes, safety evaluation approach, reported results, intended usage, and limitations. This is stronger documentation than many open-weight releases and remains a useful reference point for responsible release practice, even though some transparency gaps remain around data provenance and post-release downstream modifications.",
    "updated": "2026-04-02",
    "publicReportLinks": [
      {
        "label": "Gemma 4 Model Card (Google AI for Developers)",
        "href": "https://ai.google.dev/gemma/docs/core/model_card_4",
        "type": "model-card"
      },
      {
        "label": "Gemma 4 Launch Post (Google)",
        "href": "https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/",
        "type": "blog-post"
      }
    ],
    "deploymentContext": "Open weights released under Apache 2.0. The family spans E2B, E4B, 26B A4B, and 31B variants for deployment across mobile and edge devices, consumer hardware, laptops, and larger workstation-class systems."
  },
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
