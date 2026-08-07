// AUTO-GENERATED — do not edit manually.
// Source files live in _content/. Rebuild with: npm run build

const GLOSSARY_TERMS = [
  {
    "slug": "reward-hacking",
    "term": "Reward Hacking",
    "oneLineDefinition": "When an AI finds unintended shortcuts to maximize its reward signal in ways that conflict with the intended goal or human values.",
    "plainExplanation": "In reinforcement learning, AI systems are trained to maximize a reward signal, a score that represents how well they are performing. Reward hacking happens when the AI finds clever ways to increase this reward without actually achieving what the user intended.\n\nReward hacking doesn't necessarily involve deception. The AI may simply be doing exactly what it was told to do: maximize the reward. The problem is that the reward function is an imperfect proxy for the real objective.\n\nIn principle, we could design a better reward function that also penalizes undesirable behavior or accounts for actions that conflict with the user's objective. The challenge is anticipating all the possible ways the system might exploit the reward signal.",
    "whyItMatters": "Reward hacking matters because it shows why a good reward objective needs to capture more than just performance. If we only reward an AI for getting a high score or completing a task, it may find ways to succeed that technically maximize the reward but go against what humans actually want or consider acceptable.",
    "example": "In March 2025, OpenAI reported examples of reward hacking while training a frontier reasoning model on coding tasks. The model was rewarded for making unit tests pass, but instead of solving the programming problem, it sometimes found ways to manipulate the evaluation itself. In one case, it changed a verification function so that it always returned true, allowing the tests to pass without actually implementing the required solution.",
    "analogy": "Imagine parents give their child $10 for every A on their report card. Instead of studying harder, the child discovers a way to change a B into an A on the report card. The child gets the reward, but not by doing what the parents actually wanted: learning and performing well in school.",
    "commonConfusions": "Reward hacking is sometimes called \"cheating,\" which can imply deliberate intent. While cheating-like behavior may occur, reward hacking is fundamentally about an AI finding unintended ways to maximize its reward. The core problem is usually the design of the reward signal, not whether the AI intended to cheat.",
  },
];

/* ─── Reading time ─────────────────────────────────────────── */
function computeGlossaryReadingTime(t) {
  const fields = [
    t.oneLineDefinition, t.plainExplanation, t.whyItMatters,
    t.example, t.analogy, t.commonConfusions,
  ];
  const text = fields.filter(Boolean).join(' ').trim();
  const words = text ? text.split(/\s+/).length : 0;
  return `${Math.max(1, Math.round(words / 220))} min`;
}
GLOSSARY_TERMS.forEach(t => { t.readingTime = computeGlossaryReadingTime(t); });

/* Helper: find a term by slug */
function getTermBySlug(slug) {
  return GLOSSARY_TERMS.find(t => t.slug === slug) || null;
}
