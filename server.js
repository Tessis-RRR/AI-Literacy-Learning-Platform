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
      model: 'gpt-4o',
      max_tokens: 1500,
      messages: [
        { role: 'system', content: systemPrompt || 'You are a helpful AI assistant for language teachers. Provide clear, practical, classroom-ready responses.' },
        { role: 'user', content: prompt }
      ]
    });

    res.json({ content: message.choices[0].message.content });
  } catch (error) {
    console.error('API Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/evaluate', async (req, res) => {
  try {
    const { prompt, userTypedParts } = req.body;
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({ error: 'API key not configured.' });
    }
    const sysPrompt = `You evaluate AI prompts written by language teachers. Return ONLY valid JSON with no markdown or extra text.

STEP 1 — GIBBERISH CHECK (do this first):
When evaluating LEARNER-TYPED parts specifically, flag as gibberish if ANY of the following apply:
- A single character, digit, or number (e.g. "1", "a", "123")
- Random letters or keyboard mashing (e.g. "asdf", "qwerty", "zzz")
- A word or phrase completely unrelated to teaching, language learning, or the scenario (e.g. "pizza", "hello", "idk")
- Fewer than 4 meaningful words that form no coherent teaching intent
- Repeating the same character or word (e.g. "aaa", "test test test")
- Anything that is clearly not a genuine attempt to complete a teaching prompt

IMPORTANT: The learner is completing sentence starters. Even if the full assembled sentence looks grammatical, evaluate ONLY whether the learner's typed completion is a genuine, meaningful teaching-related response — not just any word that fits grammatically.

If gibberish is detected, return ONLY this and nothing else:
{"gibberish":true,"scores":{"goal":0,"context":0,"task":0,"constraints":0,"output":0},"total":0,"feedback":{"goal":"","context":"","task":"","constraints":"","output":""},"overall":"Your input does not look like a teaching prompt. Please write a real prompt for the given scenario."}

STEP 2 — If it is a genuine attempt (even a weak one), score each of the 5 dimensions using the rubric below. Each dimension is scored 0–3.

DIMENSION 1 — Goal (Learning Objective Clarity):
3 (Proficient): Specifies what students will learn AND includes a measurable action verb (e.g., describe, identify, write) AND includes content/topic AND implies or states success criteria or outcome.
2 (Developing): States a learning goal with topic + general action, BUT action is vague (e.g., "understand", "learn") OR no clear success indicator.
1 (Beginning): Mentions a topic only (e.g., "present simple tense") with no clear learning action.
0: No learning goal present.

DIMENSION 2 — Context (Student & Classroom Information):
3 (Proficient): Specifies grade level or age group AND language proficiency level AND at least ONE concrete student characteristic (prior knowledge, common errors, learning needs, or classroom setting constraint).
2 (Developing): Includes grade level AND/OR proficiency level, BUT no specific student characteristics.
1 (Beginning): Vague reference to students (e.g., "middle school students") with no proficiency or detail.
0: No context provided.

DIMENSION 3 — Task (Instructional Task Clarity):
3 (Proficient): Clearly specifies what the teacher should produce AND includes time structure or scope AND lists at least TWO task components (activities, materials, steps, or assessment).
2 (Developing): Specifies the task (e.g., lesson plan) BUT missing time OR only ONE component listed.
1 (Beginning): Task is vague (e.g., "help me teach…") with no structure or components.
0: No clear task.

DIMENSION 4 — Constraints (Guidance & Boundaries):
3 (Proficient): Includes at least TWO types of constraints from: language level constraints, pedagogical constraints, format constraints, content constraints.
2 (Developing): Includes ONE constraint only OR constraints are vague (e.g., "make it engaging").
1 (Beginning): Very general preference only (e.g., "good lesson") with no actionable constraint.
0: No constraints.

DIMENSION 5 — Output Format (Response Structure Specification):
3 (Proficient): Specifies output structure (e.g., sections, headings) AND format type (bullet points, table, step-by-step) AND clearly indicates what elements must be included (e.g., goal, materials, activity).
2 (Developing): Mentions elements to include (e.g., goal, materials) BUT no clear formatting instruction.
1 (Beginning): Very general request (e.g., "give me a lesson plan") with no structure specified.
0: No output expectation.

Return ONLY this JSON structure:
{"scores":{"goal":1,"context":1,"task":1,"constraints":1,"output":1},"total":5,"feedback":{"goal":"specific feedback","context":"specific feedback","task":"specific feedback","constraints":"specific feedback","output":"specific feedback"},"overall":"1-2 sentence summary"}`;

    const message = await client.chat.completions.create({
      model: 'gpt-4o',
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

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\nPromptCraft is running at http://localhost:${PORT}\n`);
});
