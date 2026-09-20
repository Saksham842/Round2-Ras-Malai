const { sanitizeIssueText } = require('./sanitize');

/**
 * Fast, robust rule-based classifier for GitHub issues
 * Detects difficulty, skillArea, effort, and confidence.
 */
function classifyIssueHeuristic(issue) {
  const title = (issue.title || '').toLowerCase();
  const body = (issue.body || '').toLowerCase();
  const fullText = `${title} ${body}`;

  let difficulty = 'Intermediate';
  let skillArea = 'General';
  let effort = '2-4 hrs';
  let confidence = 0.85;

  // 1. Check for Easy / Beginner / Good First Issue indicators
  const easyKeywords = [
    'good first issue', 'first-timers-only', 'beginner', 'easy', 'documentation',
    'typo', 'readme', 'spelling', 'broken link', 'markdown', 'update docs',
    'starter', 'minor', 'nit'
  ];
  const isEasy = easyKeywords.some(kw => fullText.includes(kw));

  // 2. Check for Advanced / Architecture indicators
  const advancedKeywords = [
    'breaking change', 'compiler', 'memory leak', 'deadlock', 'concurrency',
    'architecture', 'rfc', 'turbopack', 'hydration mismatch', 'engine',
    'internals', 'wasm', 'webassembly', 'segfault', 'performance regression',
    'parser', 'ast transform', 'thread'
  ];
  const isAdvanced = advancedKeywords.some(kw => fullText.includes(kw));

  if (isEasy && !isAdvanced) {
    difficulty = 'Easy';
    effort = fullText.includes('typo') || fullText.includes('readme') ? '<1 hr' : '<2 hrs';
    confidence = 0.94;
  } else if (isAdvanced) {
    difficulty = 'Advanced';
    effort = '>1 day';
    confidence = 0.91;
  } else {
    difficulty = 'Intermediate';
    effort = fullText.includes('refactor') || fullText.includes('feature') ? '4-6 hrs' : '2-4 hrs';
    confidence = 0.88;
  }

  // 3. Determine Skill Area with word boundaries
  const matchesKeyword = (patterns) => patterns.some(p => p.test(fullText));

  if (matchesKeyword([/\bcss\b/, /\btailwind/, /\bstyle/, /\btheme\b/, /\bui\b/, /\blayout\b/])) {
    skillArea = 'CSS / TailwindCSS';
  } else if (matchesKeyword([/\btypescript\b/, /\btypes\b/, /\binterface\b/, /\.d\.ts/])) {
    skillArea = 'TypeScript';
  } else if (matchesKeyword([/\breact\b/, /\bhook\b/, /\bcomponent/, /\busestate\b/, /\buseeffect\b/])) {
    skillArea = 'React';
  } else if (matchesKeyword([/\bnext\.?js\b/, /\bapp router\b/, /\bserver component/])) {
    skillArea = 'Next.js';
  } else if (matchesKeyword([/\bnode\.?js\b/, /\bbackend\b/, /\bexpress\b/, /\bendpoint\b/])) {
    skillArea = 'Node.js';
  } else if (matchesKeyword([/\bdoc\b/, /\bdocs\b/, /\breadme\b/, /\bguide\b/, /\bdocumentation\b/, /\btypo\b/, /\bspelling\b/])) {
    skillArea = 'Documentation';
  } else if (matchesKeyword([/\btest\b/, /\bjest\b/, /\bvitest\b/, /\bcypress\b/])) {
    skillArea = 'Testing';
  } else if (matchesKeyword([/\brust\b/, /\bcargo\b/])) {
    skillArea = 'Rust';
  } else if (matchesKeyword([/\bpython\b/, /\bpip\b/])) {
    skillArea = 'Python';
  }

  const summary = `${difficulty} ${skillArea} task: ${issue.title || 'Investigate and resolve issue'}.`;

  return { difficulty, skillArea, effort, confidence, summary };
}

/**
 * Classify using Groq LLM if API key is provided, falling back to heuristic
 */
async function classifyWithGroq(cleanText, groqApiKey) {
  const apiKey = groqApiKey || process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  try {
    const prompt = `You are a GitHub issue triage expert. Analyze this issue text and output valid JSON only:
Text:
${cleanText.substring(0, 1000)}

Output format:
{
  "difficulty": "Easy" | "Intermediate" | "Advanced",
  "skillArea": "React" | "TypeScript" | "Node.js" | "Next.js" | "CSS / UI" | "Documentation" | "Architecture",
  "effort": "<2 hrs" | "2-4 hrs" | "4-6 hrs" | ">1 day",
  "confidence": 0.92,
  "summary": "1-2 sentence actionable summary of what needs to be fixed or built"
}`;

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.1,
        max_tokens: 250
      })
    });

    if (!res.ok) return null;
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (content) {
      const parsed = JSON.parse(content);
      if (parsed.difficulty && parsed.skillArea) {
        return {
          difficulty: parsed.difficulty,
          skillArea: parsed.skillArea,
          effort: parsed.effort || '2-4 hrs',
          confidence: parsed.confidence || 0.92,
          summary: parsed.summary || `${parsed.difficulty} ${parsed.skillArea} task based on issue description.`
        };
      }
    }
  } catch (err) {
    console.warn('Groq classification failed, using heuristics:', err.message);
  }

  return null;
}

/**
 * Main entrypoint for issue classification
 */
async function classifyAndEmbedIssue(issue, groqApiKey) {
  const cleanText = sanitizeIssueText(issue.title, issue.body);

  // Try Groq if key exists (client-provided or env), otherwise use heuristic
  let result = await classifyWithGroq(cleanText, groqApiKey);
  if (!result) {
    result = classifyIssueHeuristic(issue);
  }

  return result;
}

module.exports = {
  classifyAndEmbedIssue,
  classifyIssueHeuristic
};
