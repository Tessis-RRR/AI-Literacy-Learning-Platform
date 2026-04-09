require('dotenv').config();
const express = require('express');
const path = require('path');
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, systemPrompt } = req.body;

    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({
        error: 'API key not configured. Please add your OPENAI_API_KEY to the .env file.'
      });
    }

    const message = await client.chat.completions.create({
      model: process.env.GENERATE_MODEL || 'gpt-4o',
      max_tokens: 1500,
      messages: [
        { role: 'system', content: (systemPrompt || 'You are a helpful AI assistant for language teachers. Provide clear, practical, classroom-ready responses.') + '\n\nIMPORTANT: Do not use markdown formatting. Do not use **, *, #, ##, or any markdown symbols. Use plain text only. Use line breaks and indentation to structure your output.' },
        { role: 'user', content: prompt }
      ]
    });

    res.json({ content: message.choices[0].message.content });
  } catch (error) {
    console.error('API Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

function extractFeatures(prompt) {
  const t = prompt || '';
  const hasGrade        = /grade\s?\d+|\d+(st|nd|rd|th)\s+grade|year\s?\d+/i.test(t);
  const hasAge          = /\d+\s*[-–]?\s*year[s]?\s*[- ]?old|\bage\s*\d+/i.test(t);
  const hasProficiency  = /\b(beginner[s]?|elementary|pre[-\s]?intermediate|intermediate|upper[-\s]?intermediate|advanced|A1|A2|B1|B2|C1|C2)\b/i.test(t);
  const hasTime         = /\d+\s*[-–]?\s*(minute[s]?|min[s]?|hour[s]?)/i.test(t);
  const hasMaterials    = /\bmaterials?\b/i.test(t);
  const hasActivity     = /\bactivit(y|ies)\b/i.test(t);
  const hasAssessment   = /\b(assess(ment)?|evaluat(e|ion)|quiz|test)\b/i.test(t);
  const hasSteps        = /\bstep[s]?\b/i.test(t);
  const hasActionVerb   = /\b(describe|identify|write|produce|use|create|list|match|compare|explain|demonstrate|apply|construct|distinguish|categorize|label|select|arrange|complete|respond|perform|discuss|present|ask|answer|form|build)\b/i.test(t);
  const hasSuccessCriteria = /\bby the end\b|\bwill be able to\b|\bcan correctly\b|\bsuccessfully\b/i.test(t);
  const hasBullets      = /bullet[s]?|\n\s*[-•*]\s/i.test(t);
  const hasTable        = /\btable\b|\bcolumns?\b/i.test(t);
  const hasHeadings     = /\bsection[s]?\b|\bheading[s]?\b|\bpart[s]?\b/i.test(t);

  const componentCount = [hasMaterials, hasActivity, hasAssessment, hasSteps].filter(Boolean).length;

  return {
    has_grade_or_age:       hasGrade || hasAge,
    has_proficiency:        hasProficiency,
    has_time:               hasTime,
    has_action_verb:        hasActionVerb,
    has_success_criteria:   hasSuccessCriteria,
    has_materials:          hasMaterials,
    has_activity:           hasActivity,
    has_assessment:         hasAssessment,
    has_steps:              hasSteps,
    component_count:        componentCount,
    has_bullets:            hasBullets,
    has_table:              hasTable,
    has_headings:           hasHeadings,
  };
}

app.post('/api/evaluate', async (req, res) => {
  try {
    const { prompt, userTypedParts } = req.body;
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({ error: 'API key not configured.' });
    }

    const features = extractFeatures(prompt);
    const featuresText = Object.entries(features)
      .map(([k, v]) => `- ${k}: ${v}`)
      .join('\n');

    const sysPrompt = `You evaluate AI prompts written by language teachers. Return ONLY valid JSON with no markdown or extra text.

STEP 1 — GIBBERISH CHECK (STRICT)
Evaluate ONLY the learner-typed portion.
Mark as gibberish ONLY if:
- Input is random characters or keyboard mashing (e.g., "asdf", "qwerty")
- Input is clearly unrelated to teaching or the scenario (e.g., "pizza", "hello", "idk")
- Input has no interpretable teaching intent
DO NOT use word count as a rule.

If gibberish is detected, return ONLY:
{"gibberish":true,"scores":{"goal":0,"context":0,"task":0,"constraints":0,"output":0},"total":0,"feedback":{"goal":"","context":"","task":"","constraints":"","output":""},"overall":"Your input does not look like a teaching prompt. Please write a meaningful teaching prompt based on the scenario."}

STEP 2 — CONDITION CHECK (MANDATORY, NO SKIPPING)
The rule engine has already detected these features from the prompt — trust them for detection; use your judgment only for interpretation:

DETECTED FEATURES:
${featuresText}

Use these features as ground truth for binary conditions. Do NOT re-detect what is already flagged.

STEP 3 — SCORE EACH DIMENSION using ONLY the condition checks below:

DIMENSION 1 — Goal
Conditions: has_learning_target, has_action_verb (NOT "learn"/"understand"/"know"), has_topic, has_success_criteria
3 = all TRUE | 2 = learning target + topic TRUE but missing measurable verb OR success criteria | 1 = topic only | 0 = none

DIMENSION 2 — Context
Conditions: has_grade_or_age, has_proficiency, has_specific_student_detail (prior knowledge / difficulty / learning need / classroom condition — interpret from prompt)
3 = all TRUE | 2 = grade/proficiency present but no student detail | 1 = vague student mention only | 0 = none

DIMENSION 3 — Task
Conditions: has_clear_product, has_time (use has_time from features), component_count ≥ 2 (use component_count from features)
3 = all TRUE | 2 = product present but missing time OR component_count < 2 | 1 = vague task | 0 = none

DIMENSION 4 — Constraints
Count ONLY actionable constraints. Ignore vague phrases like "engaging", "clear", "good".
Types: language level, pedagogical, format, content constraints — interpret from prompt.
3 = ≥2 actionable constraints | 2 = 1 actionable constraint | 1 = vague preference only | 0 = none

DIMENSION 5 — Output Format
Conditions: has_structure (use has_headings), has_format_type (use has_bullets or has_table), has_required_elements (interpret from prompt)
3 = all TRUE | 2 = elements listed but no format type | 1 = general request only | 0 = none

STEP 4 — SCORING RULES
- Scores MUST come ONLY from condition checks above
- Do NOT use general impressions
- If unsure between two scores → ALWAYS choose the LOWER score

STEP 5 — OVERALL FEEDBACK
- Maximum 100 words total
- Part 1: what the learner did well (reference actual content from their prompt)
- Part 2: start with "BUT" — identify 1–2 weakest dimensions, name EXACT missing elements (e.g., "you did not specify time")
- Keep all feedback field values as empty strings

Return ONLY this JSON:
{"scores":{"goal":1,"context":1,"task":1,"constraints":1,"output":1},"total":5,"feedback":{"goal":"","context":"","task":"","constraints":"","output":""},"overall":"..."}`;

    const message = await client.chat.completions.create({
      model: process.env.EVAL_MODEL || 'gpt-4o',
      temperature: 0,
      max_tokens: 700,
      messages: [
        { role: 'system', content: sysPrompt },
        {
          role: 'user', content: userTypedParts
            ? `Full prompt to evaluate:\n${prompt}\n\nIMPORTANT — The following parts were typed by the learner (the rest was pre-filled). Apply the gibberish check to these parts specifically:\n${userTypedParts}`
            : `Evaluate this teacher prompt:\n\n${prompt}`
        }
      ]
    });
    const raw = message.choices[0].message.content.trim();
    const result = JSON.parse(raw);
    res.json(result);
  } catch (error) {
    console.error('Evaluate error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/evaluate-part', async (req, res) => {
  try {
    const { dimension, fieldText, prefix } = req.body;
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({ error: 'API key not configured.' });
    }

    const rubrics = {
      goal:        'Does it state what students will learn, use a measurable action verb (not "understand"/"learn"), name a topic, and imply success criteria?',
      context:     'Does it specify grade/age, proficiency level, and at least one concrete student detail (prior knowledge, difficulty, learning need)?',
      task:        'Does it clearly state what to produce, include a time/duration, and mention at least two components (activities, materials, steps, or assessment)?',
      constraints: 'Does it include at least one actionable constraint — language level, pedagogical rule, format rule, or content boundary? Ignore vague words like "engaging".',
      output:      'Does it specify structure (sections/headings), a format type (bullets/table/step-by-step), and name the required elements?'
    };

    const fullText = prefix ? `${prefix} ${fieldText}` : fieldText;
    const rubric = rubrics[dimension] || 'Evaluate quality and specificity.';

    const sysPrompt = `You give brief feedback on one part of a language teacher's AI prompt.
Dimension: ${dimension}
Rubric question: ${rubric}

Scoring (0–3):
3 = all rubric conditions met
2 = partially met (missing one key element)
1 = vague or minimal attempt
0 = nothing relevant or gibberish

Rules:
- Return ONLY valid JSON, no markdown.
- "feedback": max 20 words — one sentence on what is good, then "BUT" + one concrete actionable improvement naming the exact missing element.
- "score": integer 0–3.
- If gibberish: {"score":0,"feedback":"Please write a real teaching prompt for this part."}`;

    const message = await client.chat.completions.create({
      model: process.env.EVAL_MODEL || 'gpt-4o',
      temperature: 0,
      max_tokens: 80,
      messages: [
        { role: 'system', content: sysPrompt },
        { role: 'user', content: `Evaluate this ${dimension} part:\n"${fullText}"` }
      ]
    });

    const raw = message.choices[0].message.content.trim();
    const result = JSON.parse(raw);
    res.json({ feedback: result.feedback, score: result.score });
  } catch (error) {
    console.error('Evaluate-part error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\nPromptCraft is running at http://localhost:${PORT}\n`);
});
